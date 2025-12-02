import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ════════════════════════════════════════════════════════════
// 🧹 Cron Job - تنظيف الطلبات القديمة
// ════════════════════════════════════════════════════════════
// يعمل تلقائياً كل يوم لحذف:
// - طلبات عمرها أكثر من 24 ساعة
// - طلبات منتهية (status = 'expired')
// ════════════════════════════════════════════════════════════

export async function GET(request) {
  try {
    // ════════════════════════════════════════════════════════════
    // 🔐 حماية Endpoint - فقط من Cron أو Admin
    // ════════════════════════════════════════════════════════════
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key-here';
    
    // التحقق من المفتاح السري
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ════════════════════════════════════════════════════════════
    // 📊 إحصائيات قبل الحذف
    // ════════════════════════════════════════════════════════════
    const beforeStats = await query(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN created_at < NOW() - INTERVAL '24 hours' THEN 1 END) as old_requests
      FROM prayer_requests
      WHERE status = 'active'
    `);

    const stats = beforeStats.rows[0];

    // ════════════════════════════════════════════════════════════
    // 🗑️ حذف الطلبات القديمة (أكثر من 24 ساعة)
    // ════════════════════════════════════════════════════════════
    const deleteResult = await query(`
      DELETE FROM prayer_requests
      WHERE status = 'active'
      AND created_at < NOW() - INTERVAL '24 hours'
      RETURNING id
    `);

    const deletedCount = deleteResult.rows.length;

    // ════════════════════════════════════════════════════════════
    // 🗑️ حذف الطلبات المنتهية
    // ════════════════════════════════════════════════════════════
    const deleteExpiredResult = await query(`
      DELETE FROM prayer_requests
      WHERE status = 'expired'
      RETURNING id
    `);

    const deletedExpiredCount = deleteExpiredResult.rows.length;

    // ════════════════════════════════════════════════════════════
    // 📊 تسجيل العملية في الـ logs
    // ════════════════════════════════════════════════════════════
    console.log('🧹 Cron Cleanup:', {
      timestamp: new Date().toISOString(),
      totalBefore: stats.total_requests,
      oldRequests: stats.old_requests,
      deletedOld: deletedCount,
      deletedExpired: deletedExpiredCount,
      totalDeleted: deletedCount + deletedExpiredCount
    });

    // ════════════════════════════════════════════════════════════
    // ✅ إرجاع النتيجة
    // ════════════════════════════════════════════════════════════
    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      stats: {
        totalRequestsBefore: parseInt(stats.total_requests),
        oldRequestsFound: parseInt(stats.old_requests),
        deletedOldRequests: deletedCount,
        deletedExpiredRequests: deletedExpiredCount,
        totalDeleted: deletedCount + deletedExpiredCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Cron Cleanup Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════
// 📝 ملاحظات الاستخدام:
// ════════════════════════════════════════════════════════════
// 1. أنشئ متغير بيئة: CRON_SECRET="مفتاح-سري-قوي"
// 2. في Contabo Cron:
//    0 2 * * * curl -H "Authorization: Bearer مفتاح-سري-قوي" https://yojeeb.com/api/cron/cleanup
// 3. هذا يعمل كل يوم الساعة 2 صباحاً
// ════════════════════════════════════════════════════════════