// ============================================================================
// ⏰ Cron Job: إنهاء الطلبات المنتهية
// يتم استدعاؤه كل ساعة لتحديث حالة الطلبات
// ============================================================================

import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // التحقق من مفتاح الأمان (اختياري)
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    // يمكن إضافة مفتاح أمان لاحقاً
    // if (key !== process.env.CRON_SECRET) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // تحديث الطلبات المنتهية
    const result = await query(`
      UPDATE prayer_requests
      SET status = 'expired', is_active = false
      WHERE status = 'active' 
        AND expires_at IS NOT NULL 
        AND expires_at < NOW()
      RETURNING id, name, expires_at
    `);

    const expiredCount = result.rows.length;

    // جلب إحصائيات
    const statsResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        COUNT(*) FILTER (WHERE status = 'expired') as expired_count,
        (SELECT get_request_duration_hours()) as current_duration_hours
      FROM prayer_requests
    `);

    const stats = statsResult.rows[0];

    return NextResponse.json({
      success: true,
      message: `تم إنهاء ${expiredCount} طلب`,
      expiredRequests: result.rows,
      stats: {
        activeRequests: parseInt(stats.active_count),
        expiredRequests: parseInt(stats.expired_count),
        currentDurationHours: parseInt(stats.current_duration_hours)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cron expire-requests error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
