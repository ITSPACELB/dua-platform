// ════════════════════════════════════════════════════════════
// ⏰ نظام الجدولة التلقائية (Cron Jobs)
// ════════════════════════════════════════════════════════════
// الغرض: تشغيل القرعة والمهام التلقائية يومياً
// الاستخدام: يتم استدعاؤه من Vercel Cron أو خارجياً
// ════════════════════════════════════════════════════════════

import { query } from '@/lib/db';
import { 
  selectWeightedWinners, 
  calculateAllUsersPoints,
  getTopUsersByPoints 
} from '@/lib/pointsSystem';
import { ACHIEVEMENTS } from '@/lib/levelsSystem';

/**
 * 🎲 القرعة اليومية التلقائية
 * تُشغّل كل يوم في الساعة 12:00 صباحاً
 */
export async function runDailyLottery() {
  console.log('🎲 Starting daily lottery...');
  
  try {
    // 1️⃣ التحقق من تفعيل القرعة التلقائية
    const settingsResult = await query(
      `SELECT is_automatic, is_enabled, setting_value 
       FROM achievement_settings 
       WHERE feature_name = 'lottery'`
    );

    const lotterySettings = settingsResult.rows[0] || {};
    
    if (!lotterySettings.is_enabled || !lotterySettings.is_automatic) {
      console.log('⏸️ Automatic lottery is disabled');
      return {
        success: false,
        message: 'Automatic lottery is disabled'
      };
    }

    // 2️⃣ التحقق من الفائزين اليدويين
    const manualWinnersResult = await query(
      `SELECT setting_value 
       FROM achievement_settings 
       WHERE feature_name = 'manual_winners'`
    );

    const manualWinners = manualWinnersResult.rows[0]?.setting_value || {};

    // إذا كان هناك فائزون يدويون مفعّلون، نتخطى القرعة
    if (manualWinners?.enabled && manualWinners?.users?.length > 0) {
      console.log('⚠️ Manual winners are active, skipping lottery');
      return await handleManualWinners(manualWinners);
    }

    // 3️⃣ جلب المستخدمين المؤهلين (المستوى 2 و 3)
    const eligibleUsersResult = await query(
      `SELECT 
        u.id,
        u.full_name,
        u.created_at,
        us.level,
        us.total_prayers,
        us.prayers_week,
        us.prayers_month,
        us.interaction_rate,
        us.daily_streak,
        us.last_achievement_date,
        us.total_stars,
        us.cooldown_level
       FROM users u
       INNER JOIN user_stats us ON u.id = us.user_id
       WHERE us.level >= 2
       AND u.full_name IS NOT NULL
       AND u.mother_or_father_name IS NOT NULL`
      // لاحظ: إزالة LIMIT 100 لتشمل الجميع
    );

    const eligibleUsers = eligibleUsersResult.rows;

    if (eligibleUsers.length === 0) {
      console.log('⚠️ No eligible users found');
      return {
        success: false,
        message: 'No eligible users'
      };
    }

    console.log(`✅ Found ${eligibleUsers.length} eligible users`);

    // 4️⃣ فلترة المستخدمين في Cooldown
    const now = Date.now();
    const availableUsers = eligibleUsers.filter(user => {
      if (!user.last_achievement_date) return true;
      
      const lastAchievement = new Date(user.last_achievement_date).getTime();
      const cooldownLevel = user.cooldown_level || 1;
      
      // Cooldown متدرج
      const COOLDOWN_PERIODS = {
        1: 72 * 60 * 60 * 1000,       // 3 أيام
        2: 7 * 24 * 60 * 60 * 1000,   // 7 أيام
        3: 14 * 24 * 60 * 60 * 1000,  // 14 يوم
        4: 30 * 24 * 60 * 60 * 1000   // 30 يوم
      };
      
      const cooldownPeriod = COOLDOWN_PERIODS[cooldownLevel] || COOLDOWN_PERIODS[1];
      
      return (now - lastAchievement) >= cooldownPeriod;
    });

    if (availableUsers.length === 0) {
      console.log('⚠️ All users are in cooldown period');
      return {
        success: false,
        message: 'All users in cooldown'
      };
    }

    console.log(`✅ ${availableUsers.length} users available (after cooldown filter)`);

    // 5️⃣ حساب النقاط الموزونة لكل مستخدم
    const usersWithPoints = await calculateAllUsersPoints(availableUsers, { query });

    console.log(`✅ Calculated points for ${usersWithPoints.length} users`);

    // 6️⃣ اختيار الفائزين بناءً على النقاط (Weighted Random)
    const winnersCount = lotterySettings.setting_value?.auto_config?.winners || 2;
    const winners = selectWeightedWinners(usersWithPoints, winnersCount);

    if (winners.length === 0) {
      console.log('⚠️ No winners selected');
      return {
        success: false,
        message: 'No winners selected'
      };
    }

    console.log(`🎉 Selected ${winners.length} winners`);

    // 7️⃣ منح الإنجازات وتحديث النقاط
    const grantedWinners = [];
    
    for (const winner of winners) {
      // إضافة الإنجاز
      await query(
        `INSERT INTO achievements (
          user_id, 
          achievement_type, 
          stars_earned, 
          achieved_at, 
          expires_at, 
          is_active
        ) VALUES ($1, 'name_display', 1, NOW(), $2, true)`,
        [
          winner.id,
          new Date(now + ACHIEVEMENTS.NAME_DISPLAY.duration)
        ]
      );

      // تحديث النجوم و Cooldown
      const newCooldownLevel = Math.min((winner.cooldown_level || 1) + 1, 4);
      
      await query(
        `UPDATE user_stats 
         SET 
           total_stars = total_stars + 1,
           last_achievement_date = NOW(),
           cooldown_level = $2
         WHERE user_id = $1`,
        [winner.id, newCooldownLevel]
      );

      // حفظ في سجل الفوز
      await query(
        `INSERT INTO win_history (
          user_id,
          win_type,
          achievement_type,
          stars_earned,
          points_at_win,
          rank_at_win,
          cooldown_level,
          can_win_again_at,
          granted_by,
          won_at,
          expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)`,
        [
          winner.id,
          'lottery',
          'name_display',
          1,
          winner.points,
          winner.rank || null,
          newCooldownLevel,
          new Date(now + getCooldownPeriod(newCooldownLevel)),
          'cron',
          new Date(now + ACHIEVEMENTS.NAME_DISPLAY.duration)
        ]
      );

      grantedWinners.push({
        id: winner.id,
        displayName: winner.full_name,
        points: winner.points,
        level: winner.level,
        isManual: false,
        expiresAt: new Date(now + ACHIEVEMENTS.NAME_DISPLAY.duration),
        cooldownLevel: newCooldownLevel
      });
    }

    // 8️⃣ حفظ الفائزين في الإعدادات (للعرض)
    await query(
      `INSERT INTO admin_settings (setting_key, setting_value, updated_at)
       VALUES ('current_top_active', $1, NOW())
       ON CONFLICT (setting_key) 
       DO UPDATE SET 
         setting_value = $1,
         updated_at = NOW()`,
      [JSON.stringify(grantedWinners)]
    );

    // 9️⃣ حفظ في سجل القرعات
    await query(
      `INSERT INTO lottery_history (
        lottery_date,
        lottery_time,
        total_eligible,
        winners_count,
        winners,
        level2_count,
        level3_count,
        ratios_used,
        lottery_type,
        triggered_by
      ) VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        new Date(),
        eligibleUsers.length,
        grantedWinners.length,
        JSON.stringify(grantedWinners),
        grantedWinners.filter(w => w.level === 2).length,
        grantedWinners.filter(w => w.level === 3).length,
        JSON.stringify({ level2: 40, level3: 60 }),
        'automatic',
        'cron'
      ]
    );

    console.log('✅ Daily lottery completed successfully');

    return {
      success: true,
      message: 'Lottery completed',
      winners: grantedWinners
    };

  } catch (error) {
    console.error('❌ Error in daily lottery:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 🏆 معالجة الفائزين اليدويين
 */
async function handleManualWinners(manualWinners) {
  const winners = manualWinners.users.map(winner => ({
    id: winner.id,
    displayName: winner.name,
    isManual: true,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }));

  // حفظ للعرض
  await query(
    `INSERT INTO admin_settings (setting_key, setting_value, updated_at)
     VALUES ('current_top_active', $1, NOW())
     ON CONFLICT (setting_key) 
     DO UPDATE SET setting_value = $1, updated_at = NOW()`,
    [JSON.stringify(winners)]
  );

  // منح النجوم للفائزين اليدويين أيضاً
  for (const winner of winners) {
    if (winner.id && !winner.id.startsWith('manual_')) {
      await query(
        `INSERT INTO achievements (
          user_id, achievement_type, stars_earned, achieved_at, expires_at, is_active
        ) VALUES ($1, 'name_display', 1, NOW(), $2, true)`,
        [winner.id, winner.expiresAt]
      );

      await query(
        `UPDATE user_stats 
         SET total_stars = total_stars + 1, last_achievement_date = NOW()
         WHERE user_id = $1`,
        [winner.id]
      );
    }
  }

  return {
    success: true,
    message: 'Manual winners processed',
    winners
  };
}

/**
 * ⭐⭐ فحص وإنجاز "الدعاء المضاعف" تلقائياً
 */
export async function checkAutoGrantStars2() {
  console.log('⭐⭐ Checking auto-grant for double_prayer...');

  try {
    // جلب الإعدادات
    const settingsResult = await query(
      `SELECT is_automatic, is_enabled, setting_value 
       FROM achievement_settings 
       WHERE feature_name = 'auto_grant_stars2'`
    );

    const settings = settingsResult.rows[0] || {};
    
    if (!settings.is_enabled || !settings.is_automatic) {
      return { success: false, message: 'Auto-grant disabled' };
    }

    const threshold = settings.setting_value?.auto_config?.threshold || 50;

    // جلب المستخدمين المؤهلين
    const eligibleResult = await query(
      `SELECT u.id, u.full_name, us.total_prayers
       FROM users u
       INNER JOIN user_stats us ON u.id = us.user_id
       WHERE us.level >= 2
       AND us.total_prayers >= $1
       AND NOT EXISTS (
         SELECT 1 FROM achievements a
         WHERE a.user_id = u.id
         AND a.achievement_type = 'double_prayer'
         AND a.is_active = true
       )`,
      [threshold]
    );

    const granted = [];

    for (const user of eligibleResult.rows) {
      await query(
        `INSERT INTO achievements (
          user_id, achievement_type, stars_earned, achieved_at, expires_at, is_active
        ) VALUES ($1, 'double_prayer', 2, NOW(), $2, true)`,
        [user.id, new Date(Date.now() + ACHIEVEMENTS.DOUBLE_PRAYER.duration)]
      );

      await query(
        `UPDATE user_stats SET total_stars = total_stars + 2 WHERE user_id = $1`,
        [user.id]
      );

      granted.push(user);
    }

    console.log(`✅ Granted ⭐⭐ to ${granted.length} users`);

    return { success: true, granted: granted.length };

  } catch (error) {
    console.error('❌ Error in auto-grant stars2:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ⭐⭐⭐ فحص وإنجاز "اختيار الآية" تلقائياً
 */
export async function checkAutoGrantStars3() {
  console.log('⭐⭐⭐ Checking auto-grant for verse_selection...');

  try {
    const settingsResult = await query(
      `SELECT is_automatic, is_enabled, setting_value 
       FROM achievement_settings 
       WHERE feature_name = 'auto_grant_stars3'`
    );

    const settings = settingsResult.rows[0] || {};
    
    if (!settings.is_enabled || !settings.is_automatic) {
      return { success: false, message: 'Auto-grant disabled' };
    }

    const threshold = settings.setting_value?.auto_config?.threshold || 100;

    const eligibleResult = await query(
      `SELECT u.id, u.full_name, us.total_prayers
       FROM users u
       INNER JOIN user_stats us ON u.id = us.user_id
       WHERE us.level >= 2
       AND us.total_prayers >= $1
       AND NOT EXISTS (
         SELECT 1 FROM achievements a
         WHERE a.user_id = u.id
         AND a.achievement_type = 'verse_selection'
         AND a.is_active = true
       )`,
      [threshold]
    );

    const granted = [];

    for (const user of eligibleResult.rows) {
      await query(
        `INSERT INTO achievements (
          user_id, achievement_type, stars_earned, achieved_at, expires_at, is_active
        ) VALUES ($1, 'verse_selection', 3, NOW(), $2, true)`,
        [user.id, new Date(Date.now() + ACHIEVEMENTS.VERSE_SELECTION.duration)]
      );

      await query(
        `UPDATE user_stats SET total_stars = total_stars + 3 WHERE user_id = $1`,
        [user.id]
      );

      granted.push(user);
    }

    console.log(`✅ Granted ⭐⭐⭐ to ${granted.length} users`);

    return { success: true, granted: granted.length };

  } catch (error) {
    console.error('❌ Error in auto-grant stars3:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 🗑️ تنظيف الإنجازات المنتهية
 */
export async function cleanupExpiredAchievements() {
  console.log('🗑️ Cleaning up expired achievements...');

  try {
    const result = await query(
      `UPDATE achievements 
       SET is_active = false 
       WHERE expires_at < NOW() 
       AND is_active = true 
       RETURNING id`
    );

    console.log(`✅ Deactivated ${result.rowCount} expired achievements`);

    return { success: true, cleaned: result.rowCount };

  } catch (error) {
    console.error('❌ Error cleaning achievements:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 📊 تحديث الترتيب (Leaderboard)
 */
export async function updateLeaderboard() {
  console.log('📊 Updating leaderboard...');

  try {
    await query(`SELECT calculate_user_ranks()`);

    console.log('✅ Leaderboard updated');

    return { success: true };

  } catch (error) {
    console.error('❌ Error updating leaderboard:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 🔄 إعادة ضبط Cooldown شهرياً
 */
export async function resetMonthlyCooldowns() {
  console.log('🔄 Resetting monthly cooldowns...');

  try {
    const today = new Date();
    
    // فقط في أول يوم من الشهر
    if (today.getDate() !== 1) {
      return { success: false, message: 'Not first day of month' };
    }

    await query(`SELECT reset_monthly_cooldowns()`);

    console.log('✅ Monthly cooldowns reset');

    return { success: true };

  } catch (error) {
    console.error('❌ Error resetting cooldowns:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 📅 المهام اليومية الرئيسية
 */
export async function runDailyTasks() {
  console.log('📅 Running daily tasks...');

  const results = {
    lottery: await runDailyLottery(),
    autoStars2: await checkAutoGrantStars2(),
    autoStars3: await checkAutoGrantStars3(),
    cleanup: await cleanupExpiredAchievements(),
    leaderboard: await updateLeaderboard(),
    monthlyCooldown: await resetMonthlyCooldowns()
  };

  console.log('✅ Daily tasks completed:', results);

  return results;
}

/**
 * 🔧 دالة مساعدة: حساب فترة Cooldown
 */
function getCooldownPeriod(level) {
  const COOLDOWN_PERIODS = {
    1: 72 * 60 * 60 * 1000,       // 3 أيام
    2: 7 * 24 * 60 * 60 * 1000,   // 7 أيام
    3: 14 * 24 * 60 * 60 * 1000,  // 14 يوم
    4: 30 * 24 * 60 * 60 * 1000   // 30 يوم
  };
  
  return COOLDOWN_PERIODS[level] || COOLDOWN_PERIODS[1];
}

export default {
  runDailyLottery,
  runDailyTasks,
  checkAutoGrantStars2,
  checkAutoGrantStars3,
  cleanupExpiredAchievements,
  updateLeaderboard,
  resetMonthlyCooldowns
};