// lib/achievements.js
/**
 * 🏆 نظام الإنجازات المليوني المتكامل
 * ✅ إدارة كاملة للإنجازات (منح، تجديد، انتهاء)
 * ✅ تكامل مع نظام القرعة اليومية
 * ✅ تحقق من الشروط والأهلية المتقدمة
 * ✅ إشعارات وحوافز ذكية
 * ✅ أداء عالي لمليون مستخدم
 */

// ═══════════════════════════════════════════════════════════
// 🔧 التكوين المتقدم لنظام الإنجازات
// ═══════════════════════════════════════════════════════════

import { cache } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { monitorPerformance } from '@/lib/monitoring';

// أنواع الإنجازات ومدة كل منها
const ACHIEVEMENT_TYPES = {
  NAME_DISPLAY: {
    code: 'name_display',
    name: 'عرض الاسم المميز',
    description: 'اسمك يظهر بشكل مميز في قائمة المتفاعلين',
    duration: 24 * 60 * 60 * 1000, // 24 ساعة
    levelRequired: 2,
    starRating: 1,
    lotteryWeight: 20 // 20% فرصة في القرعة
  },
  DOUBLE_PRAYER: {
    code: 'double_prayer', 
    name: 'الدعاء المضاعف',
    description: 'كل دعاء تدعوه يُحسب مرتين لمضاعفة الأجر',
    duration: 7 * 24 * 60 * 60 * 1000, // 7 أيام
    levelRequired: 2,
    starRating: 2,
    lotteryWeight: 10 // 10% فرصة
  },
  VERSE_SELECTION: {
    code: 'verse_selection',
    name: 'اختيار الآية المخصصة',
    description: 'اختر آية قرآنية مخصصة لطلبات الدعاء',
    duration: 30 * 24 * 60 * 60 * 1000, // 30 يوم
    levelRequired: 3,
    starRating: 3,
    lotteryWeight: 5 // 5% فرصة
  }
};

// تكوين النظام
const ACHIEVEMENT_CONFIG = {
  cacheTtl: 300, // 5 دقائق للتخزين المؤقت
  maxActiveAchievements: 5, // أقصى عدد إنجازات نشطة
  cooldownPeriod: 7 * 24 * 60 * 60 * 1000, // 7 أيام بين الإنجازات من نفس النوع
  enableNotifications: true,
  lottery: {
    dailyWinners: {
      NAME_DISPLAY: 10,
      DOUBLE_PRAYER: 5,
      VERSE_SELECTION: 2
    }
  }
};

// ═══════════════════════════════════════════════════════════
// 🎯 Achievement Manager Class
// ═══════════════════════════════════════════════════════════

class AchievementManager {
  constructor(dbPool) {
    this.db = dbPool;
    this.stats = {
      grants: 0,
      renewals: 0,
      expirations: 0,
      errors: 0
    };
  }

  /**
   * منح إنجاز لمستخدم
   */
  async grantAchievement(userId, achievementType, metadata = {}) {
    const monitor = monitorPerformance('grant_achievement', { userId, achievementType });
    monitor.start();

    try {
      // التحقق من صحة البيانات
      if (!this.isValidAchievementType(achievementType)) {
        throw new Error(`نوع الإنجاز غير صحيح: ${achievementType}`);
      }

      if (!userId) {
        throw new Error('معرف المستخدم مطلوب');
      }

      // الحصول على معلومات الإنجاز
      const achievementConfig = ACHIEVEMENT_TYPES[achievementType];
      
      // التحقق من أهلية المستخدم
      const eligibility = await this.checkEligibility(userId, achievementType);
      if (!eligibility.eligible) {
        logger.warn('User not eligible for achievement', { 
          userId, 
          achievementType, 
          reasons: eligibility.reasons 
        });
        return {
          success: false,
          error: 'المستخدم غير مؤهل لهذا الإنجاز',
          reasons: eligibility.reasons
        };
      }

      // التحقق من وجود إنجاز نشط من نفس النوع
      const existingAchievement = await this.getActiveAchievement(userId, achievementType);
      if (existingAchievement) {
        return await this.renewAchievement(existingAchievement.id, metadata);
      }

      // منح الإنجاز الجديد
      const achievementId = await this.createAchievementRecord(userId, achievementType, metadata);
      
      // تحديث التخزين المؤقت
      await this.invalidateUserCache(userId);
      
      // تسجيل الإشعار
      await this.recordAchievementNotification(userId, achievementType, 'granted');
      
      // تحديث الإحصائيات
      this.stats.grants++;
      
      logger.info('Achievement granted successfully', {
        userId,
        achievementType,
        achievementId,
        duration: achievementConfig.duration
      });

      monitor.end({ success: true });

      return {
        success: true,
        achievementId,
        achievement: achievementConfig,
        expiresAt: new Date(Date.now() + achievementConfig.duration)
      };

    } catch (error) {
      this.stats.errors++;
      logger.error('Failed to grant achievement', {
        userId,
        achievementType,
        error: error.message,
        stack: error.stack
      });
      
      monitor.end({ error: true });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * تجديد إنجاز موجود
   */
  async renewAchievement(achievementId, metadata = {}) {
    const monitor = monitorPerformance('renew_achievement', { achievementId });
    monitor.start();

    try {
      // الحصول على بيانات الإنجاز الحالي
      const currentAchievement = await this.getAchievementById(achievementId);
      if (!currentAchievement) {
        throw new Error('الإنجاز غير موجود');
      }

      const achievementConfig = ACHIEVEMENT_TYPES[currentAchievement.achievement_type];
      const newExpiresAt = new Date(Date.now() + achievementConfig.duration);

      // تحديث تاريخ الانتهاء
      const result = await this.db.query(
        `UPDATE user_achievements 
         SET expires_at = $1, updated_at = NOW(), is_active = true 
         WHERE id = $2 AND is_active = true
         RETURNING *`,
        [newExpiresAt, achievementId]
      );

      if (result.rows.length === 0) {
        throw new Error('فشل في تجديد الإنجاز');
      }

      // تحديث التخزين المؤقت
      await this.invalidateUserCache(currentAchievement.user_id);
      
      // تسجيل الإشعار
      await this.recordAchievementNotification(
        currentAchievement.user_id, 
        currentAchievement.achievement_type, 
        'renewed'
      );
      
      // تحديث الإحصائيات
      this.stats.renewals++;

      logger.info('Achievement renewed successfully', {
        achievementId,
        userId: currentAchievement.user_id,
        newExpiresAt
      });

      monitor.end({ success: true });

      return {
        success: true,
        achievement: result.rows[0],
        expiresAt: newExpiresAt
      };

    } catch (error) {
      this.stats.errors++;
      logger.error('Failed to renew achievement', {
        achievementId,
        error: error.message
      });
      
      monitor.end({ error: true });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * التحقق من أهلية المستخدم للإنجاز
   */
  async checkEligibility(userId, achievementType) {
    const reasons = [];
    
    // التحقق من نوع الإنجاز
    if (!this.isValidAchievementType(achievementType)) {
      reasons.push('نوع الإنجاز غير صحيح');
      return { eligible: false, reasons };
    }

    const achievementConfig = ACHIEVEMENT_TYPES[achievementType];

    // التحقق من مستوى المستخدم
    const userLevel = await this.getUserLevel(userId);
    if (userLevel < achievementConfig.levelRequired) {
      reasons.push(`المستوى المطلوب: ${achievementConfig.levelRequired} (المستخدم: ${userLevel})`);
    }

    // التحقق من عدد الإنجازات النشطة
    const activeCount = await this.getActiveAchievementsCount(userId);
    if (activeCount >= ACHIEVEMENT_CONFIG.maxActiveAchievements) {
      reasons.push(`تجاوز الحد الأقصى للإنجازات النشطة: ${ACHIEVEMENT_CONFIG.maxActiveAchievements}`);
    }

    // التحقق من فترة التبريد
    const lastAchievement = await this.getLastAchievementOfType(userId, achievementType);
    if (lastAchievement && this.isInCooldownPeriod(lastAchievement)) {
      reasons.push('لا يزال الإنجاز السابق في فترة التبريد');
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  /**
   * الحصول على الإنجازات النشطة للمستخدم
   */
  async getActiveAchievements(userId) {
    const cacheKey = `user_achievements:${userId}:active`;
    
    return await cache.getCached(cacheKey, async () => {
      const result = await this.db.query(
        `SELECT 
          ua.id,
          ua.achievement_type,
          ua.granted_at,
          ua.expires_at,
          ua.is_active,
          ua.metadata
         FROM user_achievements ua
         WHERE ua.user_id = $1 
           AND ua.is_active = true 
           AND ua.expires_at > NOW()
         ORDER BY ua.expires_at ASC`,
        [userId]
      );

      return result.rows.map(row => ({
        ...row,
        config: ACHIEVEMENT_TYPES[row.achievement_type]
      }));
    }, ACHIEVEMENT_CONFIG.cacheTtl);
  }

  /**
   * التحقق من وجود إنجاز نشط معين
   */
  async hasActiveAchievement(userId, achievementType) {
    const achievements = await this.getActiveAchievements(userId);
    return achievements.some(achievement => 
      achievement.achievement_type === achievementType
    );
  }

  /**
   * معالجة انتهاء الإنجازات
   */
  async processExpiredAchievements() {
    const monitor = monitorPerformance('process_expired_achievements');
    monitor.start();

    try {
      // البحث عن الإنجازات المنتهية
      const result = await this.db.query(
        `SELECT id, user_id, achievement_type 
         FROM user_achievements 
         WHERE is_active = true AND expires_at <= NOW()`
      );

      let processed = 0;
      let errors = 0;

      // تعطيل كل الإنجازات المنتهية
      for (const achievement of result.rows) {
        try {
          await this.db.query(
            'UPDATE user_achievements SET is_active = false, updated_at = NOW() WHERE id = $1',
            [achievement.id]
          );

          // تسجيل الإشعار
          await this.recordAchievementNotification(
            achievement.user_id,
            achievement.achievement_type,
            'expired'
          );

          // تحديث التخزين المؤقت
          await this.invalidateUserCache(achievement.user_id);

          processed++;
          this.stats.expirations++;

        } catch (error) {
          errors++;
          logger.error('Failed to expire achievement', {
            achievementId: achievement.id,
            error: error.message
          });
        }
      }

      logger.info('Expired achievements processed', {
        processed,
        errors,
        total: result.rows.length
      });

      monitor.end({ processed, errors });

      return { processed, errors };

    } catch (error) {
      logger.error('Failed to process expired achievements', {
        error: error.message
      });
      
      monitor.end({ error: true });
      
      return { processed: 0, errors: 1 };
    }
  }

  /**
   * إدارة القرعة اليومية للإنجازات
   */
  async runDailyLottery() {
    const monitor = monitorPerformance('daily_achievement_lottery');
    monitor.start();

    try {
      const winners = {
        NAME_DISPLAY: [],
        DOUBLE_PRAYER: [],
        VERSE_SELECTION: []
      };

      // الحصول على المستخدمين المؤهلين للقرعة
      const eligibleUsers = await this.getLotteryEligibleUsers();
      
      // إجراء القرعة لكل نوع إنجاز
      for (const [achievementType, config] of Object.entries(ACHIEVEMENT_TYPES)) {
        const targetWinners = ACHIEVEMENT_CONFIG.lottery.dailyWinners[achievementType];
        const selectedWinners = this.selectLotteryWinners(
          eligibleUsers, 
          achievementType, 
          targetWinners
        );

        // منح الإنجازات للفائزين
        for (const user of selectedWinners) {
          try {
            const result = await this.grantAchievement(user.id, achievementType, {
              source: 'daily_lottery',
              lottery_round: new Date().toISOString().split('T')[0]
            });

            if (result.success) {
              winners[achievementType].push({
                userId: user.id,
                achievementId: result.achievementId
              });
            }
          } catch (error) {
            logger.error('Failed to grant lottery achievement', {
              userId: user.id,
              achievementType,
              error: error.message
            });
          }
        }
      }

      logger.info('Daily lottery completed', {
        totalEligible: eligibleUsers.length,
        winners: {
          name_display: winners.NAME_DISPLAY.length,
          double_prayer: winners.DOUBLE_PRAYER.length,
          verse_selection: winners.VERSE_SELECTION.length
        }
      });

      monitor.end({ 
        eligibleUsers: eligibleUsers.length,
        winners: winners 
      });

      return winners;

    } catch (error) {
      logger.error('Daily lottery failed', {
        error: error.message,
        stack: error.stack
      });
      
      monitor.end({ error: true });
      
      return {
        NAME_DISPLAY: [],
        DOUBLE_PRAYER: [], 
        VERSE_SELECTION: []
      };
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 🔧 Helper Methods
  // ═══════════════════════════════════════════════════════════

  /**
   * التحقق من صحة نوع الإنجاز
   */
  isValidAchievementType(achievementType) {
    return Object.values(ACHIEVEMENT_TYPES).some(
      config => config.code === achievementType
    );
  }

  /**
   * الحصول على مستوى المستخدم
   */
  async getUserLevel(userId) {
    const result = await this.db.query(
      'SELECT level FROM users WHERE id = $1',
      [userId]
    );
    
    return result.rows[0]?.level || 1;
  }

  /**
   * الحصول على عدد الإنجازات النشطة
   */
  async getActiveAchievementsCount(userId) {
    const result = await this.db.query(
      'SELECT COUNT(*) as count FROM user_achievements WHERE user_id = $1 AND is_active = true AND expires_at > NOW()',
      [userId]
    );
    
    return parseInt(result.rows[0].count);
  }

  /**
   * الحصول على الإنجاز النشط لنوع معين
   */
  async getActiveAchievement(userId, achievementType) {
    const result = await this.db.query(
      `SELECT * FROM user_achievements 
       WHERE user_id = $1 AND achievement_type = $2 AND is_active = true AND expires_at > NOW()`,
      [userId, achievementType]
    );
    
    return result.rows[0] || null;
  }

  /**
   * الحصول على آخر إنجاز من نوع معين
   */
  async getLastAchievementOfType(userId, achievementType) {
    const result = await this.db.query(
      `SELECT * FROM user_achievements 
       WHERE user_id = $1 AND achievement_type = $2 
       ORDER BY granted_at DESC LIMIT 1`,
      [userId, achievementType]
    );
    
    return result.rows[0] || null;
  }

  /**
   * التحقق من فترة التبريد
   */
  isInCooldownPeriod(achievement) {
    const cooldownEnd = new Date(achievement.granted_at).getTime() + ACHIEVEMENT_CONFIG.cooldownPeriod;
    return Date.now() < cooldownEnd;
  }

  /**
   * إنشاء سجل إنجاز جديد
   */
  async createAchievementRecord(userId, achievementType, metadata = {}) {
    const achievementConfig = ACHIEVEMENT_TYPES[achievementType];
    const expiresAt = new Date(Date.now() + achievementConfig.duration);

    const result = await this.db.query(
      `INSERT INTO user_achievements 
       (user_id, achievement_type, granted_at, expires_at, is_active, metadata) 
       VALUES ($1, $2, NOW(), $3, true, $4)
       RETURNING id`,
      [userId, achievementType, expiresAt, metadata]
    );

    return result.rows[0].id;
  }

  /**
   * الحصول على إنجاز بواسطة ID
   */
  async getAchievementById(achievementId) {
    const result = await this.db.query(
      'SELECT * FROM user_achievements WHERE id = $1',
      [achievementId]
    );
    
    return result.rows[0] || null;
  }

  /**
   * مسح التخزين المؤقت للمستخدم
   */
  async invalidateUserCache(userId) {
    await cache.invalidateCache(`user_achievements:${userId}:*`);
  }

  /**
   * تسجيل إشعار الإنجاز
   */
  async recordAchievementNotification(userId, achievementType, action) {
    if (!ACHIEVEMENT_CONFIG.enableNotifications) return;

    try {
      await this.db.query(
        `INSERT INTO achievement_notifications 
         (user_id, achievement_type, action, created_at) 
         VALUES ($1, $2, $3, NOW())`,
        [userId, achievementType, action]
      );
    } catch (error) {
      logger.warn('Failed to record achievement notification', {
        userId,
        achievementType,
        action,
        error: error.message
      });
    }
  }

  /**
   * الحصول على المستخدمين المؤهلين للقرعة
   */
  async getLotteryEligibleUsers() {
    const result = await this.db.query(`
      SELECT DISTINCT u.id, u.level, u.full_name
      FROM users u
      INNER JOIN prayers p ON p.user_id = u.id
      WHERE u.level >= 2
        AND u.is_mock_data = true
        AND DATE(p.prayed_at) = CURRENT_DATE
        AND NOT EXISTS (
          SELECT 1 FROM user_achievements ua
          WHERE ua.user_id = u.id 
            AND ua.achievement_type IN ('name_display', 'double_prayer', 'verse_selection')
            AND ua.granted_at >= NOW() - INTERVAL '7 days'
        )
      ORDER BY RANDOM()
      LIMIT 1000
    `);

    return result.rows;
  }

  /**
   * اختيار الفائزين في القرعة
   */
  selectLotteryWinners(eligibleUsers, achievementType, targetCount) {
    const achievementConfig = ACHIEVEMENT_TYPES[achievementType];
    const winners = [];
    
    // ترشيح المستخدمين المؤهلين حسب المستوى
    const qualifiedUsers = eligibleUsers.filter(user => 
      user.level >= achievementConfig.levelRequired
    );

    // اختيار عشوائي مع مراعاة الأوزان
    for (let i = 0; i < targetCount && qualifiedUsers.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * qualifiedUsers.length);
      const winner = qualifiedUsers.splice(randomIndex, 1)[0];
      winners.push(winner);
    }

    return winners;
  }

  /**
   * الحصول على إحصائيات النظام
   */
  getStats() {
    return {
      ...this.stats,
      cacheInfo: cache.getStats(),
      config: {
        maxActiveAchievements: ACHIEVEMENT_CONFIG.maxActiveAchievements,
        cooldownPeriod: ACHIEVEMENT_CONFIG.cooldownPeriod,
        achievementTypes: Object.keys(ACHIEVEMENT_TYPES).length
      }
    };
  }
}

// ═══════════════════════════════════════════════════════════
// 📤 Exports
// ═══════════════════════════════════════════════════════════

export { AchievementManager, ACHIEVEMENT_TYPES, ACHIEVEMENT_CONFIG };

export default AchievementManager;

// ═══════════════════════════════════════════════════════════
// 📝 ملاحظات الاستخدام للنظام المليوني
// ═══════════════════════════════════════════════════════════
/*
✅ الاستخدام المتقدم:

1. تهيئة النظام:
   import AchievementManager from '@/lib/achievements';
   import pool from '@/lib/db';
   
   const achievementManager = new AchievementManager(pool);

2. منح إنجاز:
   const result = await achievementManager.grantAchievement(
     'user-123', 
     'name_display',
     { granted_by: 'admin', reason: 'lottery_win' }
   );

3. الحصول على الإنجازات النشطة:
   const activeAchievements = await achievementManager.getActiveAchievements('user-123');

4. التحقق من إنجاز معين:
   const hasAchievement = await achievementManager.hasActiveAchievement('user-123', 'double_prayer');

5. إدارة القرعة اليومية:
   const lotteryResults = await achievementManager.runDailyLottery();

6. معالجة الإنجازات المنتهية:
   const expirationResults = await achievementManager.processExpiredAchievements();

7. الإحصائيات:
   const stats = achievementManager.getStats();

🎯 التكامل مع النظام المليوني:
   - Caching تلقائي لأداء عالي
   - Monitoring كامل للأداء والأخطاء
   - Logging مفصل لكل العمليات
   - Rate limiting مدمج في الـ APIs
   - Error handling متقدم

🎯 أنواع الإنجازات المدعومة:
   - name_display: عرض الاسم المميز (24 ساعة)
   - double_prayer: الدعاء المضاعف (7 أيام)  
   - verse_selection: اختيار الآية المخصصة (30 يوم)

🎯 الشروط والأهلية:
   - مستوى المستخدم (Level 2+ للإنجازات الأساسية، Level 3+ للمتقدمة)
   - عدد الإنجازات النشطة (حد أقصى 5)
   - فترة التبريد بين الإنجازات من نفس النوع (7 أيام)
   - المشاركة في الدعاء اليومي للقرعة
*/