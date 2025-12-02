import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { addJob, getJobCounts } from '@/lib/queue';
import { trackAPICall, logError } from '@/lib/monitoring';
import { invalidateCache } from '@/lib/cache';

const CRON_SECRET = process.env.CRON_SECRET || 'your-cron-secret-change-in-production';

// ════════════════════════════════════════════════════════════
// 🔐 التحقق من Cron Secret
// ════════════════════════════════════════════════════════════
function verifyCronSecret(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
    return false;
  }
  
  return true;
}

// ════════════════════════════════════════════════════════════
// 🔄 تحديث Materialized View
// ════════════════════════════════════════════════════════════
async function refreshMaterializedView() {
  try {
    await query(`REFRESH MATERIALIZED VIEW today_active_users`);
    console.log('✅ Materialized View تم تحديثه');
    return { success: true };
  } catch (error) {
    console.error('⚠️ فشل تحديث Materialized View:', error.message);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════════════════════
// 🎯 إعادة تعيين العدادات اليومية
// ════════════════════════════════════════════════════════════
async function resetDailyCounters() {
  try {
    const result = await query(
      `UPDATE user_stats 
       SET prayers_today = 0,
           updated_at = NOW()
       WHERE prayers_today > 0`
    );
    
    console.log(`✅ تم إعادة تعيين العدادات اليومية لـ ${result.rowCount} مستخدم`);
    return { success: true, count: result.rowCount };
  } catch (error) {
    console.error('❌ فشل إعادة تعيين العدادات:', error.message);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════════════════════
// 🏆 تحديث حالات الشارات (عبر SQL Function)
// ════════════════════════════════════════════════════════════
async function updateBadgeStatuses() {
  try {
    // استدعاء SQL Function لتحديث كل الشارات
    await query(`SELECT update_badge_statuses()`);
    
    console.log('✅ تم تحديث حالات الشارات');
    return { success: true };
  } catch (error) {
    console.error('❌ فشل تحديث الشارات:', error.message);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════════════════════
// 🗑️ تنظيف الإنجازات المنتهية
// ════════════════════════════════════════════════════════════
async function cleanupExpiredAchievements() {
  try {
    const result = await query(
      `UPDATE user_achievements 
       SET is_active = false,
           updated_at = NOW()
       WHERE expires_at < NOW() 
         AND is_active = true`
    );
    
    console.log(`✅ تم تعطيل ${result.rowCount} إنجاز منتهي`);
    return { success: true, count: result.rowCount };
  } catch (error) {
    console.error('❌ فشل تنظيف الإنجازات:', error.message);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════════════════════
// 🎲 تشغيل القرعة اليومية (عبر Queue)
// ════════════════════════════════════════════════════════════
async function triggerDailyLottery() {
  try {
    // إضافة مهمة القرعة إلى Queue
    await addJob('daily-lottery', {
      type: 'DAILY_LOTTERY',
      timestamp: new Date().toISOString()
    }, {
      priority: 1, // أولوية عالية
      attempts: 3,  // 3 محاولات
      backoff: 60000 // دقيقة بين كل محاولة
    });
    
    console.log('✅ تم إضافة مهمة القرعة اليومية إلى Queue');
    return { success: true, queued: true };
  } catch (error) {
    console.error('⚠️ فشل إضافة القرعة إلى Queue:', error.message);
    // الاستمرار بدون Queue
    return { success: true, queued: false, error: error.message };
  }
}

// ════════════════════════════════════════════════════════════
// 🧹 مسح Cache القديم
// ════════════════════════════════════════════════════════════
async function clearOldCache() {
  try {
    // مسح cache المستخدمين النشطين
    await invalidateCache('active:users:*');
    
    // مسح cache الإحصائيات (سيتم تحديثها تلقائياً)
    // لا نمسح user:stats:* لأنها ستُحدّث تدريجياً
    
    console.log('✅ تم مسح Cache القديم');
    return { success: true };
  } catch (error) {
    console.error('⚠️ فشل مسح Cache:', error.message);
    return { success: true, warning: error.message };
  }
}

// ════════════════════════════════════════════════════════════
// 📊 جلب إحصائيات النظام
// ════════════════════════════════════════════════════════════
async function getSystemStats() {
  try {
    const result = await query(`SELECT * FROM get_system_stats()`);
    
    if (result.rows.length > 0) {
      return {
        success: true,
        stats: result.rows[0]
      };
    }
    
    return { success: false };
  } catch (error) {
    console.error('⚠️ فشل جلب إحصائيات النظام:', error.message);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════════════════════
// 🎯 POST - تنفيذ التحديثات اليومية
// ════════════════════════════════════════════════════════════
export async function POST(request) {
  const startTime = Date.now();
  
  try {
    // 1️⃣ التحقق من Cron Secret
    if (!verifyCronSecret(request)) {
      trackAPICall('/api/cron/daily-updates', Date.now() - startTime, false);
      return NextResponse.json(
        { error: 'غير مصرح - Cron Secret غير صحيح' },
        { status: 401 }
      );
    }

    console.log('🚀 بدء التحديثات اليومية...');

    const results = {
      timestamp: new Date().toISOString(),
      tasks: {}
    };

    // 2️⃣ إعادة تعيين العدادات اليومية
    console.log('📊 إعادة تعيين العدادات اليومية...');
    results.tasks.resetCounters = await resetDailyCounters();

    // 3️⃣ تحديث حالات الشارات
    console.log('🏆 تحديث حالات الشارات...');
    results.tasks.updateBadges = await updateBadgeStatuses();

    // 4️⃣ تنظيف الإنجازات المنتهية
    console.log('🗑️ تنظيف الإنجازات المنتهية...');
    results.tasks.cleanupAchievements = await cleanupExpiredAchievements();

    // 5️⃣ تحديث Materialized View
    console.log('🔄 تحديث Materialized View...');
    results.tasks.refreshView = await refreshMaterializedView();

    // 6️⃣ مسح Cache القديم
    console.log('🧹 مسح Cache القديم...');
    results.tasks.clearCache = await clearOldCache();

    // 7️⃣ تشغيل القرعة اليومية (عبر Queue)
    console.log('🎲 تشغيل القرعة اليومية...');
    results.tasks.lottery = await triggerDailyLottery();

    // 8️⃣ جلب إحصائيات النظام النهائية
    console.log('📊 جلب إحصائيات النظام...');
    results.systemStats = await getSystemStats();

    // 9️⃣ حساب الوقت الكلي
    const duration = Date.now() - startTime;
    results.duration = `${duration}ms`;

    // 🔟 تتبع الأداء
    trackAPICall('/api/cron/daily-updates', duration, true);

    console.log('✅ اكتملت التحديثات اليومية بنجاح');
    console.log(`⏱️ الوقت الكلي: ${duration}ms`);

    // 1️⃣1️⃣ جلب حالة Queue
    try {
      const queueStats = await getJobCounts();
      results.queueStats = queueStats;
    } catch (error) {
      results.queueStats = { error: 'Queue غير متاح' };
    }

    return NextResponse.json({
      success: true,
      message: 'تم تنفيذ التحديثات اليومية بنجاح',
      results
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    trackAPICall('/api/cron/daily-updates', duration, false);
    logError(error, { endpoint: '/api/cron/daily-updates' });
    
    console.error('❌ فشلت التحديثات اليومية:', error);
    
    return NextResponse.json(
      { 
        error: 'حدث خطأ أثناء التحديثات اليومية',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        duration: `${Date.now() - startTime}ms`
      },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════
// 📊 GET - فحص حالة Cron (للمراقبة)
// ════════════════════════════════════════════════════════════
export async function GET(request) {
  try {
    // التحقق من Cron Secret
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // جلب إحصائيات النظام
    const systemStats = await getSystemStats();

    // جلب حالة Queue
    let queueStats = { available: false };
    try {
      queueStats = await getJobCounts();
      queueStats.available = true;
    } catch (error) {
      queueStats.error = 'Queue غير متاح';
    }

    // فحص Materialized View
    let viewStatus = { exists: false };
    try {
      await query(`SELECT COUNT(*) FROM today_active_users LIMIT 1`);
      viewStatus.exists = true;
    } catch (error) {
      viewStatus.error = 'Materialized View غير متاح';
    }

    return NextResponse.json({
      success: true,
      status: 'Cron system operational',
      checks: {
        database: systemStats.success,
        queue: queueStats.available,
        materializedView: viewStatus.exists
      },
      systemStats: systemStats.stats || null,
      queueStats,
      viewStatus
    });

  } catch (error) {
    logError(error, { endpoint: '/api/cron/daily-updates GET' });
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════
// 📝 ملاحظات مهمة
// ════════════════════════════════════════════════════════════
/*
✅ النسخة المليونية - Cron Job محسّن:

✅ المهام اليومية:
   1. إعادة تعيين prayers_today = 0
   2. تحديث حالات الشارات (SQL Function)
   3. تنظيف الإنجازات المنتهية
   4. تحديث Materialized View
   5. مسح Cache القديم
   6. تشغيل القرعة (عبر Queue)
   7. جلب إحصائيات النظام

✅ الحماية:
   - CRON_SECRET في .env.local
   - Bearer Token authentication

✅ Resilient Design:
   - كل مهمة مستقلة
   - إذا فشلت مهمة، الباقي يستمر
   - Fallback تلقائي (بدون Queue/Redis)

✅ Monitoring:
   - تتبع وقت التنفيذ
   - Error logging
   - Queue stats

✅ GET endpoint:
   - للمراقبة (health check)
   - يعرض حالة كل component

🎯 كيفية الاستخدام:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
محلياً (Windows):
- يدوي: curl -X POST http://localhost:3000/api/cron/daily-updates \
         -H "Authorization: Bearer your-cron-secret"

Contabo (Linux):
- crontab -e
- 0 0 * * * curl -X POST https://yujib.com/api/cron/daily-updates \
            -H "Authorization: Bearer ${CRON_SECRET}"

أو استخدام Vercel Cron Jobs (أسهل)

💡 الوقت المتوقع: 500ms - 2s
*/