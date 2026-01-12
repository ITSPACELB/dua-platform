// ============================================================================
// 🤲 API: الحصول على بيانات صفحة "ادعُ لي"
// GET /api/pray?code=abc123
// ============================================================================

import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const fingerprint = searchParams.get('fingerprint');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'كود المشاركة مطلوب' },
        { status: 400 }
      );
    }

    // البحث عن المستخدم بواسطة share_code
    const userResult = await query(
      `SELECT id, full_name, share_code, created_at
       FROM users 
       WHERE share_code = $1`,
      [code.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على المستخدم' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // الحصول على طلبات الدعاء النشطة للمستخدم
    const requestsResult = await query(
      `SELECT id, name, mother_or_father_name, type, purpose, prayer_count, created_at
       FROM prayer_requests 
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC
       LIMIT 10`,
      [user.id]
    );

    let requests = requestsResult.rows.map(row => ({
      ...row,
      hasPrayed: false
    }));

    // ════════════════════════════════════════════════════════════
    // ✅ التحقق من hasPrayed باستخدام fingerprint
    // ════════════════════════════════════════════════════════════
    if (fingerprint && requests.length > 0) {
      try {
        // البحث عن المستخدم الذي يدعو (الزائر)
        const visitorResult = await query(
          'SELECT id FROM users WHERE device_fingerprint = $1',
          [fingerprint]
        );

        if (visitorResult.rows.length > 0) {
          const visitorId = visitorResult.rows[0].id;
          const requestIds = requests.map(r => r.id);

          // البحث في جدول prayers (الجدول الأصلي)
          const prayedResult = await query(
            `SELECT DISTINCT request_id
             FROM prayers
             WHERE user_id = $1 AND request_id = ANY($2)`,
            [visitorId, requestIds]
          );

          const prayedRequestIds = new Set(prayedResult.rows.map(r => r.request_id));

          requests.forEach(req => {
            req.hasPrayed = prayedRequestIds.has(req.id);
          });
        }
      } catch (err) {
        console.error('Error checking hasPrayed:', err);
      }
    }

    // الحصول على إحصائيات المستخدم
    const statsResult = await query(
      `SELECT 
         COUNT(*) as total_requests,
         COALESCE(SUM(prayer_count), 0) as total_prayers_received
       FROM prayer_requests 
       WHERE user_id = $1`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      user: {
        name: user.full_name,
        shareCode: user.share_code,
        memberSince: user.created_at
      },
      requests: requests,
      stats: {
        totalRequests: parseInt(statsResult.rows[0]?.total_requests || 0),
        totalPrayersReceived: parseInt(statsResult.rows[0]?.total_prayers_received || 0)
      }
    });

  } catch (error) {
    console.error('❌ Error in /api/pray:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
