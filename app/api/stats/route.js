import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { 
  calculateUserLevel, 
  isEligibleForLottery, 
  calculateInteractionScore,
  selectLotteryWinners,
  grantAchievement,
  getActiveAchievements,
  ACHIEVEMENTS
} from '@/lib/levelsSystem';

/**
 * ============================================
 * GET /api/stats
 * ============================================
 * جلب الإحصائيات العامة + البيانات الديناميكية
 */
export async function GET(request) {
  try {
    // 1️⃣ عدد المؤمنين (المتفاعلين فقط)
    const believersResult = await query(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM (
        SELECT user_id FROM prayers
        UNION
        SELECT user_id FROM prayer_requests WHERE status = 'active'
      ) as active_users
    `);
    const believersCount = believersResult.rows[0]?.count || 0;

    // 2️⃣ عدد الدعوات اليوم
    const todayPrayersResult = await query(`
      SELECT COUNT(*) as count
      FROM prayers
      WHERE prayed_at >= CURRENT_DATE
    `);
    const todayPrayers = todayPrayersResult.rows[0]?.count || 0;

    // 3️⃣ عدد طلبات الدعاء النشطة
    const activeRequestsResult = await query(`
      SELECT COUNT(*) as count
      FROM prayer_requests
      WHERE status = 'active'
    `);
    const activeRequests = activeRequestsResult.rows[0]?.count || 0;

    // 4️⃣ البانر من إعدادات الأدمن
    const bannerResult = await query(`
      SELECT setting_value
      FROM admin_settings
      WHERE setting_key = 'banner'
      LIMIT 1
    `);
    const banner = bannerResult.rows[0]?.setting_value || null;

    // 5️⃣ الدعاء الجماعي
    const collectiveResult = await query(`
      SELECT *
      FROM collective_prayer
      WHERE is_active = true
      AND (end_date IS NULL OR end_date > NOW())
      ORDER BY created_at DESC
      LIMIT 1
    `);
    const collectivePrayer = collectiveResult.rows[0] || null;

    // 6️⃣ التوعية
    const awarenessResult = await query(`
      SELECT *
      FROM awareness
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `);
    const awareness = awarenessResult.rows[0] || null;

    // 7️⃣ الأكثر تفاعلاً - المستخدمين الفائزين
    const topActiveUsers = await getTopActiveUsers();

    // 8️⃣ إحصائيات المستخدم الحالي (إن وُجد)
    const fingerprint = request.headers.get('x-device-fingerprint');
    let userStats = null;
    
    if (fingerprint) {
      const userResult = await query(`
        SELECT u.*, us.*
        FROM users u
        LEFT JOIN user_stats us ON u.id = us.user_id
        WHERE u.device_fingerprint = $1
        LIMIT 1
      `, [fingerprint]);

      if (userResult.rows[0]) {
        const userData = userResult.rows[0];
        
        // حساب مستوى المستخدم
        const userLevel = calculateUserLevel(userData);
        
        // الحصول على الإنجازات النشطة
        const achievementsResult = await query(`
          SELECT *
          FROM achievements
          WHERE user_id = $1
          AND achieved_at + (stars_earned || ' days')::interval > NOW()
          ORDER BY achieved_at DESC
        `, [userData.id]);
        
        const activeAchievements = getActiveAchievements(achievementsResult.rows);

        userStats = {
          userId: userData.id,
          level: userLevel.level,
          levelName: userLevel.name,
          displayName: userLevel.benefits.displayName === 'userName' 
            ? userData.full_name 
            : `مؤمن ${userData.id.slice(0, 8)}`,
          totalPrayers: userData.total_prayers || 0,
          prayersToday: userData.prayers_today || 0,
          prayersWeek: userData.prayers_week || 0,
          prayersMonth: userData.prayers_month || 0,
          totalStars: userData.total_stars || 0,
          activeAchievements,
          canEnterLottery: userLevel.benefits.canEnterLottery || false
        };
      }
    }

    // الاستجابة
    return NextResponse.json({
      success: true,
      stats: {
        believersCount,
        todayPrayers,
        activeRequests,
        banner,
        collectivePrayer,
        awareness,
        topActiveUsers,
        userStats
      }
    });

  } catch (error) {
    console.error('Error in GET /api/stats:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل تحميل الإحصائيات'
    }, { status: 500 });
  }
}

/**
 * ============================================
 * POST /api/stats
 * ============================================
 * تحديث الإحصائيات أو تشغيل القرعة
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 🎰 تشغيل القرعة اليومية
    if (action === 'run_lottery') {
      return await runDailyLottery();
    }

    // 📊 تحديث إحصائيات مستخدم
    if (action === 'update_user_stats') {
      return await updateUserStats(body.userId);
    }

    // ⭐ منح إنجاز
    if (action === 'grant_achievement') {
      return await grantUserAchievement(body.userId, body.achievementType);
    }

    return NextResponse.json({
      success: false,
      error: 'إجراء غير معروف'
    }, { status: 400 });

  } catch (error) {
    console.error('Error in POST /api/stats:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل تنفيذ الإجراء'
    }, { status: 500 });
  }
}

/**
 * ============================================
 * 🎰 تشغيل القرعة اليومية
 * ============================================
 */
async function runDailyLottery() {
  try {
    // 1️⃣ الحصول على نسب التفاعل من الأدمن
    const ratiosResult = await query(`
      SELECT setting_value
      FROM admin_settings
      WHERE setting_key = 'interaction_ratios'
      LIMIT 1
    `);
    const interactionRatios = ratiosResult.rows[0]?.setting_value || {
      level1: 20,
      level2: 30,
      level3: 50
    };

    // 2️⃣ الحصول على المستخدمين المؤهلين
    const eligibleUsersResult = await query(`
      SELECT 
        u.id,
        u.full_name,
        u.mother_or_father_name,
        u.phone_number,
        u.device_fingerprint,
        us.total_prayers,
        us.prayers_week,
        us.level,
        a.achieved_at as last_achievement_date
      FROM users u
      INNER JOIN user_stats us ON u.id = us.user_id
      LEFT JOIN achievements a ON u.id = a.user_id 
        AND a.achievement_type = 'name_display'
        AND a.achieved_at = (
          SELECT MAX(achieved_at) 
          FROM achievements 
          WHERE user_id = u.id 
          AND achievement_type = 'name_display'
        )
      WHERE 
        u.full_name IS NOT NULL 
        AND u.mother_or_father_name IS NOT NULL
        AND us.prayers_week > 0
      ORDER BY us.prayers_week DESC
    `);

    let eligibleUsers = eligibleUsersResult.rows;

    // فلترة حسب الأهلية
    eligibleUsers = eligibleUsers.filter(user => {
      const eligibility = isEligibleForLottery(user);
      return eligibility.eligible;
    });

    if (eligibleUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'لا يوجد مستخدمون مؤهلون للقرعة حالياً',
        winners: []
      });
    }

    // 3️⃣ الحصول على الفائزين المكتوبين يدوياً من الأدمن (إن وُجدوا)
    const manualWinnersResult = await query(`
      SELECT setting_value
      FROM admin_settings
      WHERE setting_key = 'manual_top_active'
      LIMIT 1
    `);
    const manualWinners = manualWinnersResult.rows[0]?.setting_value || null;

    let winners = [];

    // إذا كان هناك فائزون يدويون، استخدمهم
    if (manualWinners && manualWinners.enabled && manualWinners.users) {
      winners = manualWinners.users.map(winner => ({
        id: winner.id || `manual_${Date.now()}_${Math.random()}`,
        displayName: winner.name,
        isManual: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }));
    } else {
      // 4️⃣ اختيار الفائزين بالقرعة
      const lotteryWinners = selectLotteryWinners(
        eligibleUsers, 
        2, // عدد الفائزين
        interactionRatios
      );

      // 5️⃣ منح إنجاز "عرض الاسم" للفائزين
      for (const winner of lotteryWinners) {
        await query(`
          INSERT INTO achievements (
            id, user_id, achievement_type, stars_earned, achieved_at
          ) VALUES (
            gen_random_uuid(), $1, 'name_display', 1, NOW()
          )
        `, [winner.id]);

        // تحديث عدد النجوم
        await query(`
          UPDATE user_stats
          SET total_stars = total_stars + 1
          WHERE user_id = $1
        `, [winner.id]);

        winners.push({
          id: winner.id,
          displayName: winner.full_name,
          isManual: false,
          expiresAt: new Date(Date.now() + ACHIEVEMENTS.NAME_DISPLAY.duration)
        });
      }
    }

    // 6️⃣ حفظ الفائزين في الإعدادات
    await query(`
      INSERT INTO admin_settings (id, setting_key, setting_value, updated_at)
      VALUES (gen_random_uuid(), 'current_top_active', $1, NOW())
      ON CONFLICT (setting_key) 
      DO UPDATE SET 
        setting_value = $1,
        updated_at = NOW()
    `, [JSON.stringify(winners)]);

    return NextResponse.json({
      success: true,
      message: 'تمت القرعة بنجاح',
      winners
    });

  } catch (error) {
    console.error('Error in runDailyLottery:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل تشغيل القرعة'
    }, { status: 500 });
  }
}

/**
 * ============================================
 * 📊 تحديث إحصائيات مستخدم
 * ============================================
 */
async function updateUserStats(userId) {
  try {
    // حساب الإحصائيات من الدعوات
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_prayers,
        COUNT(*) FILTER (WHERE prayed_at >= CURRENT_DATE) as prayers_today,
        COUNT(*) FILTER (WHERE prayed_at >= CURRENT_DATE - INTERVAL '7 days') as prayers_week,
        COUNT(*) FILTER (WHERE prayed_at >= CURRENT_DATE - INTERVAL '30 days') as prayers_month,
        COUNT(*) FILTER (WHERE prayed_at >= CURRENT_DATE - INTERVAL '1 year') as prayers_year
      FROM prayers
      WHERE user_id = $1
    `, [userId]);

    const stats = statsResult.rows[0];

    // تحديث أو إنشاء السجل
    await query(`
      INSERT INTO user_stats (
        id, user_id, 
        total_prayers, prayers_today, prayers_week, prayers_month, prayers_year,
        updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        total_prayers = $2,
        prayers_today = $3,
        prayers_week = $4,
        prayers_month = $5,
        prayers_year = $6,
        updated_at = NOW()
    `, [
      userId,
      stats.total_prayers || 0,
      stats.prayers_today || 0,
      stats.prayers_week || 0,
      stats.prayers_month || 0,
      stats.prayers_year || 0
    ]);

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الإحصائيات',
      stats
    });

  } catch (error) {
    console.error('Error in updateUserStats:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل تحديث الإحصائيات'
    }, { status: 500 });
  }
}

/**
 * ============================================
 * ⭐ منح إنجاز لمستخدم
 * ============================================
 */
async function grantUserAchievement(userId, achievementType) {
  try {
    const achievement = grantAchievement(userId, achievementType);

    await query(`
      INSERT INTO achievements (
        id, user_id, achievement_type, stars_earned, achieved_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, NOW()
      )
    `, [
      userId,
      achievement.achievementType,
      achievement.stars
    ]);

    // تحديث عدد النجوم
    await query(`
      UPDATE user_stats
      SET total_stars = total_stars + $1
      WHERE user_id = $2
    `, [achievement.stars, userId]);

    return NextResponse.json({
      success: true,
      message: 'تم منح الإنجاز',
      achievement
    });

  } catch (error) {
    console.error('Error in grantUserAchievement:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل منح الإنجاز'
    }, { status: 500 });
  }
}

/**
 * ============================================
 * 🏆 الحصول على الأكثر تفاعلاً
 * ============================================
 */
async function getTopActiveUsers() {
  try {
    // الحصول من الإعدادات المحفوظة
    const topActiveResult = await query(`
      SELECT setting_value
      FROM admin_settings
      WHERE setting_key = 'current_top_active'
      LIMIT 1
    `);

    if (topActiveResult.rows[0]?.setting_value) {
      const winners = topActiveResult.rows[0].setting_value;
      
      // التحقق من صلاحية الوقت
      const validWinners = winners.filter(winner => {
        const expiryDate = new Date(winner.expiresAt);
        return new Date() < expiryDate;
      });

      if (validWinners.length > 0) {
        return validWinners;
      }
    }

    // إذا لم يكن هناك فائزون أو انتهت صلاحيتهم، إرجاع قائمة فارغة
    return [];

  } catch (error) {
    console.error('Error in getTopActiveUsers:', error);
    return [];
  }
}