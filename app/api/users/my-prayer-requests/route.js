import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// ════════════════════════════════════════════════════════════
// 📋 API: طلبات الدعاء الخاصة بالمستخدم
// ════════════════════════════════════════════════════════════
// ✅ يعرض طلبات المستخدم + عدد الدعوات لكل طلب
// ✅ معايير احترافية عالية
// ✅ مُحسّن للأداء
// ════════════════════════════════════════════════════════════

/**
 * GET /api/users/my-prayer-requests
 * جلب طلبات الدعاء الخاصة بالمستخدم مع إحصائيات كل طلب
 */
export async function GET(request) {
  const client = await pool.connect();
  
  try {
    // الحصول على userId من Header
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'يرجى تسجيل الدخول' },
        { status: 401 }
      );
    }

    // جلب طلبات المستخدم مع عدد الدعوات لكل طلب
    const result = await client.query(
      `SELECT 
        pr.id,
        pr.name,
        pr.parent_name,
        pr.type,
        pr.purpose,
        pr.quranic_verse,
        pr.created_at,
        pr.is_active,
        COUNT(p.id) as prayer_count,
        COUNT(CASE WHEN p.prayed_at::date = CURRENT_DATE THEN 1 END) as prayers_today,
        COUNT(CASE WHEN p.prayed_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as prayers_week,
        COUNT(CASE WHEN p.prayed_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as prayers_month
      FROM prayer_requests pr
      LEFT JOIN prayers p ON p.request_id = pr.id
      WHERE pr.user_id = $1
      GROUP BY pr.id, pr.name, pr.parent_name, pr.type, pr.purpose, pr.quranic_verse, pr.created_at, pr.is_active
      ORDER BY pr.created_at DESC`,
      [userId]
    );

    const myRequests = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      parentName: row.parent_name,
      type: row.type,
      purpose: row.purpose,
      quranicVerse: row.quranic_verse,
      createdAt: row.created_at,
      isActive: row.is_active,
      prayerCount: parseInt(row.prayer_count) || 0,
      prayersToday: parseInt(row.prayers_today) || 0,
      prayersWeek: parseInt(row.prayers_week) || 0,
      prayersMonth: parseInt(row.prayers_month) || 0
    }));

    // إحصائيات إجمالية
    const totalPrayers = myRequests.reduce((sum, req) => sum + req.prayerCount, 0);
    const totalActive = myRequests.filter(req => req.isActive).length;

    return NextResponse.json({
      success: true,
      myRequests,
      stats: {
        totalRequests: myRequests.length,
        totalActive,
        totalPrayers,
        averagePrayersPerRequest: myRequests.length > 0 
          ? Math.round(totalPrayers / myRequests.length) 
          : 0
      }
    });

  } catch (error) {
    console.error('❌ GET my-prayer-requests error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب البيانات' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}