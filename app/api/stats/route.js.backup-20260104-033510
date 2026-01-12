import { sanitizeVerseData } from '@/lib/utils';
// ============================================================================
// 📊 API: إحصائيات المستخدمين + نظام القرعة والمستويات - FINAL FIX ✅
// ============================================================================
// المسار: app/api/stats/route.js
// ✅ إصلاح نهائي: استخدام pool.query بدلاً من query المستوردة
// ✅ يتوافق مع lib/db.js الفعلي
// ============================================================================

import { NextResponse } from 'next/server';
import pool from '@/lib/db';  // ✅ استيراد pool (التصدير الافتراضي)
import jwt from 'jsonwebtoken';
import { 
  calculateUserLevel,
  isEligibleForLottery,
  selectLotteryWinners,
  grantAchievement,
  getActiveAchievements,
  ACHIEVEMENTS 
} from '@/lib/levelsSystem';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================================================
// 🔐 دالة للتحقق من الـ token
// ============================================================================
function verifyToken(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// ============================================================================
// 📊 حساب معدل التفاعل
// ============================================================================
function calculateInteractionRate(prayersGiven, notificationsReceived) {
  if (notificationsReceived === 0) return 0;
  return Math.round((prayersGiven / notificationsReceived) * 100);
}

// ============================================================================
// 🏆 تحديد مستوى التوثيق
// ============================================================================
function getVerificationLevel(interactionRate) {
  if (interactionRate >= 98) {
    return {
      name: 'GOLD',
      color: 'amber',
      icon: '👑',
      threshold: 98
    };
  } else if (interactionRate >= 90) {
    return {
      name: 'GREEN',
      color: 'emerald',
      icon: '✓✓',
      threshold: 90
    };
  } else if (interactionRate >= 80) {
    return {
      name: 'BLUE',
      color: 'blue',
      icon: '✓',
      threshold: 80
    };
  } else {
    return {
      name: 'NONE',
      color: 'stone',
      icon: '',
      threshold: 0
    };
  }
}

// ============================================================================
// ✨ الميزات المفتوحة حسب المستوى
// ============================================================================
function getUnlockedFeatures(interactionRate) {
  const features = [];
  
  if (interactionRate >= 80) {
    features.push('priority_display');
    features.push('blue_badge');
  }
  
  if (interactionRate >= 90) {
    features.push('green_badge');
    features.push('top_priority');
  }
  
  if (interactionRate >= 98) {
    features.push('gold_badge');
    features.push('max_priority');
    features.push('special_reactions');
  }
  
  return features;
}

// ============================================================================
// 📈 حساب المستوى القادم
// ============================================================================
function calculateNextLevel(rate) {
  if (rate < 80) {
    return {
      level: 'BLUE',
      levelName: 'التوثيق الأزرق',
      remaining: 80 - rate,
      icon: '✓',
      color: 'blue'
    };
  }
  if (rate < 90) {
    return {
      level: 'GREEN',
      levelName: 'التوثيق الأخضر',
      remaining: 90 - rate,
      icon: '✓✓',
      color: 'emerald'
    };
  }
  if (rate < 98) {
    return {
      level: 'GOLD',
      levelName: 'التوثيق الذهبي',
      remaining: 98 - rate,
      icon: '👑',
      color: 'amber'
    };
  }
  return {
    level: 'MAX',
    levelName: 'المستوى الأقصى',
    remaining: 0,
    icon: '👑',
    color: 'amber'
  };
}

// ============================================================================
// 🎯 جلب الفائزين النشطين في القرعة
// ============================================================================
async function getActiveWinners() {
  try {
    const result = await pool.query(
      `SELECT 
        u.id,
        u.full_name,
        u.mother_or_father_name,
        a.achievement_type,
        a.stars_earned,
        a.achieved_at,
        a.expires_at
       FROM achievements a
       JOIN users u ON a.user_id = u.id
       WHERE a.achievement_type = 'name_display'
       AND a.expires_at > NOW()
       ORDER BY a.achieved_at DESC
       LIMIT 2`
    );

    return result.rows.map(row => ({
      id: row.id,
      full_name: row.full_name,
      mother_or_father_name: row.mother_or_father_name,
      achievement: {
        type: row.achievement_type,
        stars: row.stars_earned,
        achievedAt: row.achieved_at,
        expiresAt: row.expires_at
      }
    }));
  } catch (error) {
    console.error('Error fetching active winners:', error);
    return [];
  }
}

// ============================================================================
// 🎲 إجراء القرعة اليومية
// ============================================================================
async function runDailyLottery() {
  try {
    // 1. جلب المستخدمين المؤهلين (المستوى 2 و 3 فقط)
    const eligibleResult = await pool.query(
      `SELECT 
        u.id,
        u.full_name,
        u.mother_or_father_name,
        u.phone_number,
        us.total_prayers_given,
        us.interaction_rate,
        COALESCE(
          (SELECT MAX(achieved_at) 
           FROM achievements 
           WHERE user_id = u.id AND achievement_type = 'name_display'),
          '1970-01-01'
        ) as last_achievement_date
       FROM users u
       JOIN user_stats us ON u.id = us.user_id
       WHERE u.full_name IS NOT NULL 
       AND u.mother_or_father_name IS NOT NULL
       AND us.total_prayers_given > 0`
    );

    const eligibleUsers = eligibleResult.rows;

    if (eligibleUsers.length === 0) {
      console.log('No eligible users for lottery');
      return [];
    }

    // 2. تحديد مستوى كل مستخدم
    const usersWithLevels = eligibleUsers.map(user => {
      const level = calculateUserLevel(user);
      return {
        ...user,
        level: level.level,
        eligibility: isEligibleForLottery(user)
      };
    }).filter(user => user.eligibility.eligible);

    if (usersWithLevels.length === 0) {
      console.log('No users passed eligibility check');
      return [];
    }

    // 3. جلب نسب التفاعل من إعدادات الأدمن
    const ratiosResult = await pool.query(
      `SELECT setting_value 
       FROM admin_settings 
       WHERE setting_key = 'interaction_ratios'
       LIMIT 1`
    );

    let interactionRatios = null;
    if (ratiosResult.rows.length > 0 && ratiosResult.rows[0].setting_value) {
      interactionRatios = ratiosResult.rows[0].setting_value;
    }

    // 4. اختيار الفائزين
    const winners = selectLotteryWinners(usersWithLevels, 2, interactionRatios);

    if (winners.length === 0) {
      console.log('No winners selected');
      return [];
    }

    // 5. منح الإنجازات للفائزين
    const grantedAchievements = [];
    for (const winner of winners) {
      try {
        const achievement = grantAchievement(winner.id, 'NAME_DISPLAY');
        
        // حفظ في قاعدة البيانات
        await pool.query(
          `INSERT INTO achievements 
           (user_id, achievement_type, stars_earned, achieved_at, expires_at)
           VALUES ($1, $2, $3, NOW(), $4)`,
          [winner.id, achievement.achievementType, achievement.stars, achievement.expiresAt]
        );

        grantedAchievements.push({
          userId: winner.id,
          userName: winner.full_name,
          achievement
        });
      } catch (error) {
        console.error(`Error granting achievement to ${winner.id}:`, error);
      }
    }

    return grantedAchievements;
  } catch (error) {
    console.error('Error running daily lottery:', error);
    return [];
  }
}

// ============================================================================
// GET - جلب إحصائيات عامة (بدون Token) أو شخصية (مع Token) - ✅ FINAL FIX
// ============================================================================
export async function GET(request) {
  try {
    // التحقق من وجود token (اختياري)
    const decoded = verifyToken(request);
    
    // ✅ 1. عدد المؤمنين (Level 2 و 3) - يشمل الوهمي والحقيقي
    const believersResult = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE level >= 2'
    );
    const believersCount = parseInt(believersResult.rows[0].count) || 0;

    // إذا كان المستخدم مسجلاً، نعيد إحصائياته الكاملة
    if (decoded && decoded.userId) {
      // جلب بيانات المستخدم
      const userResult = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'المستخدم غير موجود' },
          { status: 404 }
        );
      }

      const userData = userResult.rows[0];

      // جلب إحصائيات المستخدم
      const statsResult = await pool.query(
        `SELECT 
          total_prayers_given,
          total_notifications_received,
          interaction_rate,
          total_stars,
          last_prayer_date
         FROM user_stats 
         WHERE user_id = $1`,
        [decoded.userId]
      );

      if (statsResult.rows.length === 0) {
        // إنشاء سجل إحصائيات إذا لم يكن موجوداً
        await pool.query(
          `INSERT INTO user_stats (user_id, total_prayers_given, total_notifications_received, interaction_rate, total_stars)
           VALUES ($1, 0, 0, 0, 0)`,
          [decoded.userId]
        );
        
        return NextResponse.json({
          success: true,
          stats: sanitizeVerseData({
            totalPrayersGiven: 0,
            totalNotificationsReceived: 0,
            interactionRate: 0,
            totalStars: 0,
            lastPrayerDate: null,
            prayersThisMonth: 0,
            prayersReceivedCount: 0,
            answeredPrayers: 0,
            believersCount,
            verificationLevel: {
              name: 'NONE',
              color: 'stone',
              icon: '',
              threshold: 0
            },
            unlockedFeatures: [],
            nextLevel: {
              level: 'BLUE',
              levelName: 'التوثيق الأزرق',
              remaining: 80,
              icon: '✓',
              color: 'blue'
            },
            userLevel: {
              level: 1,
              name: 'زائر',
              canEnterLottery: false
            },
            activeAchievements: [],
            topActiveUsers: []
          })
        });
      }

      const stats = statsResult.rows[0];

      // حساب دعوات هذا الشهر
      const monthPrayersResult = await pool.query(
        `SELECT COUNT(*) as count
         FROM prayers
         WHERE user_id = $1 
         AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
        [decoded.userId]
      );

      // حساب عدد من دعوا للمستخدم
      const receivedPrayersResult = await pool.query(
        `SELECT COUNT(DISTINCT p.user_id) as count
         FROM prayer_requests pr
         JOIN prayers p ON pr.id = p.request_id
         WHERE pr.user_id = $1`,
        [decoded.userId]
      );

      // حساب الطلبات المستجابة
      const answeredResult = await pool.query(
        `SELECT COUNT(*) as count
         FROM prayer_requests
         WHERE user_id = $1 AND status = 'answered'`,
        [decoded.userId]
      );

      // جلب إنجازات المستخدم النشطة
      const achievementsResult = await pool.query(
        `SELECT * FROM achievements
         WHERE user_id = $1 
         AND expires_at > NOW()
         ORDER BY achieved_at DESC`,
        [decoded.userId]
      );

      const activeAchievements = achievementsResult.rows.map(row => ({
        achievementType: row.achievement_type,
        starsEarned: row.stars_earned,
        achievedAt: row.achieved_at,
        expiresAt: row.expires_at
      }));

      // حساب معدل التفاعل والتوثيق
      const interactionRate = calculateInteractionRate(
        parseInt(stats.total_prayers_given),
        parseInt(stats.total_notifications_received)
      );

      const verificationLevel = getVerificationLevel(interactionRate);
      const unlockedFeatures = getUnlockedFeatures(interactionRate);
      const nextLevel = calculateNextLevel(interactionRate);

      // حساب مستوى المستخدم
      const userLevel = calculateUserLevel(userData);

      // جلب الفائزين النشطين
      const topActiveUsers = await getActiveWinners();

      return NextResponse.json({
        success: true,
        stats: sanitizeVerseData({
          totalPrayersGiven: parseInt(stats.total_prayers_given),
          totalNotificationsReceived: parseInt(stats.total_notifications_received),
          interactionRate,
          totalStars: parseInt(stats.total_stars || 0),
          lastPrayerDate: stats.last_prayer_date,
          prayersThisMonth: parseInt(monthPrayersResult.rows[0].count),
          prayersReceivedCount: parseInt(receivedPrayersResult.rows[0].count),
          answeredPrayers: parseInt(answeredResult.rows[0].count),
          believersCount,
          verificationLevel: {
            name: verificationLevel.name,
            color: verificationLevel.color,
            icon: verificationLevel.icon,
            threshold: verificationLevel.threshold
          },
          unlockedFeatures,
          nextLevel,
          userLevel: {
            level: userLevel.level,
            name: userLevel.name,
            canEnterLottery: userLevel.benefits.canEnterLottery || false,
            canWinAchievements: userLevel.benefits.canWinAchievements || false
          },
          activeAchievements,
          topActiveUsers
        })
      });
    }

    // ✅ إذا لم يكن مسجلاً - نعيد الإحصائيات العامة فقط
    // ✅ 2. دعاء اليوم - من جميع المستويات (1, 2, 3)
    const todayPrayersResult = await pool.query(
      `SELECT COUNT(*) as count FROM prayers 
       WHERE DATE(prayed_at) = CURRENT_DATE`
    );
    const todayPrayersCount = parseInt(todayPrayersResult.rows[0].count) || 0;

    // ✅ 3. الطلبات النشطة - من جميع المستويات
    const activeRequestsResult = await pool.query(
      `SELECT COUNT(*) as count FROM prayer_requests 
       WHERE status = 'active'`
    );
    const activeRequestsCount = parseInt(activeRequestsResult.rows[0].count) || 0;

    // ✅ 4. المتفاعلون اليوم
    const todayActiveUsersResult = await pool.query(
      `SELECT 
        u.id,
        u.full_name,
        u.level,
        COUNT(p.id) as prayer_count
       FROM users u
       INNER JOIN prayers p ON p.user_id = u.id
       WHERE DATE(p.prayed_at) = CURRENT_DATE
       GROUP BY u.id, u.full_name, u.level
       ORDER BY prayer_count DESC
       LIMIT 20`
    );

    const todayActiveUsers = todayActiveUsersResult.rows.map(row => ({
      id: row.id,
      name: row.full_name || 'شخص مجهول',
      level: row.level,
      prayerCount: parseInt(row.prayer_count)
    }));

    // Response للزوار (غير المسجلين)
    return NextResponse.json({
      success: true,
      isGuest: true,
      stats: sanitizeVerseData({
        believersCount,
        todayPrayersCount,
        activeRequestsCount,
        todayActiveUsers,
        todayActiveUsersCount: todayActiveUsers.length
      }),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Stats fetch error:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ أثناء جلب الإحصائيات',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - تحديث إحصائيات المستخدم (عند القيام بدعاء جديد)
// ============================================================================
export async function POST(request) {
  try {
    // التحقق من الـ token
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'غير مصرح. الرجاء تسجيل الدخول.' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // تحديث العداد
    await pool.query(
      `UPDATE user_stats 
       SET 
         total_prayers_given = total_prayers_given + 1,
         last_prayer_date = NOW(),
         interaction_rate = CASE 
           WHEN total_notifications_received > 0 
           THEN (total_prayers_given + 1)::float / total_notifications_received * 100
           ELSE 0
         END
       WHERE user_id = $1`,
      [userId]
    );

    // جلب الإحصائيات المحدثة
    const updatedStats = await pool.query(
      `SELECT total_prayers_given, total_notifications_received, interaction_rate, total_stars
       FROM user_stats 
       WHERE user_id = $1`,
      [userId]
    );

    const stats = updatedStats.rows[0];
    const interactionRate = calculateInteractionRate(
      parseInt(stats.total_prayers_given),
      parseInt(stats.total_notifications_received)
    );

    const verificationLevel = getVerificationLevel(interactionRate);
    const unlockedFeatures = getUnlockedFeatures(interactionRate);
    const nextLevel = calculateNextLevel(interactionRate);

    return NextResponse.json({
      success: true,
      stats: sanitizeVerseData({
        totalPrayersGiven: parseInt(stats.total_prayers_given),
        totalStars: parseInt(stats.total_stars || 0),
        interactionRate,
        verificationLevel: {
          name: verificationLevel.name,
          color: verificationLevel.color,
          icon: verificationLevel.icon,
          threshold: verificationLevel.threshold
        },
        unlockedFeatures,
        nextLevel
      })
    });

  } catch (error) {
    console.error('Stats update error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الإحصائيات' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - تشغيل القرعة يدوياً (للأدمن أو Cron Job)
// ============================================================================
export async function PUT(request) {
  try {
    // التحقق من صلاحيات الأدمن
    const authHeader = request.headers.get('x-api-key');
    const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-secret-key';
    
    if (authHeader !== ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'غير مصرح - صلاحيات أدمن مطلوبة' },
        { status: 403 }
      );
    }

    // تشغيل القرعة
    const winners = await runDailyLottery();

    return NextResponse.json({
      success: true,
      message: 'تم إجراء القرعة بنجاح',
      winners: sanitizeVerseData(winners.map(w => ({
        userId: w.userId,
        userName: w.userName,
        achievement: {
          type: w.achievement.achievementType,
          name: w.achievement.name,
          stars: w.achievement.stars,
          expiresAt: w.achievement.expiresAt
        }
      }))),
      winnersCount: winners.length
    });

  } catch (error) {
    console.error('Lottery run error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إجراء القرعة' },
      { status: 500 }
    );
  }
}

// ✅ ضمان عدم Cache البيانات
export const dynamic = 'force-dynamic';
export const revalidate = 0;