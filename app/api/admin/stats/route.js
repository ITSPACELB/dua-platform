// ════════════════════════════════════════════════════════════════════════════
// 📊 API إحصائيات لوحة الأدمن - النسخة الشاملة والاحترافية
// ════════════════════════════════════════════════════════════════════════════
// التاريخ: 2026-01-04
// الوصف: إحصائيات مفصلة وشاملة لكل جوانب المنصة
// ════════════════════════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ════════════════════════════════════════════════════════════════════════════
// 🔐 التحقق من صلاحيات الأدمن
// ════════════════════════════════════════════════════════════════════════════
async function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminCheck = await query(
      'SELECT role FROM admin_users WHERE id = $1',
      [decoded.adminId]
    );
    if (adminCheck.rows.length === 0) {
      return null;
    }
    return { ...decoded, role: adminCheck.rows[0].role };
  } catch (error) {
    console.error('Admin verification error:', error);
    return null;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 📊 GET - جلب جميع الإحصائيات
// ════════════════════════════════════════════════════════════════════════════
export async function GET(request) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    // ══════════════════════════════════════════════════════════════════════
    // 👥 إحصائيات المستخدمين
    // ══════════════════════════════════════════════════════════════════════
    
    // إجمالي المستخدمين
    const totalUsersResult = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(totalUsersResult.rows[0].count) || 0;

    // المستخدمين حسب المستوى
    const usersByLevelResult = await query(`
      SELECT level, COUNT(*) as count
      FROM users
      GROUP BY level
      ORDER BY level
    `);
    const usersByLevel = { level1: 0, level2: 0, level3: 0 };
    usersByLevelResult.rows.forEach(row => {
      if (row.level === 1) usersByLevel.level1 = parseInt(row.count);
      if (row.level === 2) usersByLevel.level2 = parseInt(row.count);
      if (row.level === 3) usersByLevel.level3 = parseInt(row.count);
    });

    // المستخدمين الجدد
    const newUsersResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day') as today,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as week,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as month
      FROM users
    `);
    const newUsers = {
      today: parseInt(newUsersResult.rows[0].today) || 0,
      week: parseInt(newUsersResult.rows[0].week) || 0,
      month: parseInt(newUsersResult.rows[0].month) || 0
    };

    // المستخدمين النشطين
    const activeUsersResult = await query(`
      SELECT 
        COUNT(DISTINCT user_id) FILTER (WHERE DATE(prayed_at) = CURRENT_DATE) as today,
        COUNT(DISTINCT user_id) FILTER (WHERE prayed_at >= NOW() - INTERVAL '7 days') as week,
        COUNT(DISTINCT user_id) FILTER (WHERE prayed_at >= NOW() - INTERVAL '30 days') as month
      FROM prayers
    `);
    const activeUsers = {
      today: parseInt(activeUsersResult.rows[0].today) || 0,
      week: parseInt(activeUsersResult.rows[0].week) || 0,
      month: parseInt(activeUsersResult.rows[0].month) || 0
    };

    // ══════════════════════════════════════════════════════════════════════
    // 🤲 إحصائيات الدعوات
    // ══════════════════════════════════════════════════════════════════════
    
    const prayersResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE DATE(prayed_at) = CURRENT_DATE) as today,
        COUNT(*) FILTER (WHERE prayed_at >= NOW() - INTERVAL '7 days') as week,
        COUNT(*) FILTER (WHERE prayed_at >= NOW() - INTERVAL '30 days') as month
      FROM prayers
    `);
    const prayers = {
      total: parseInt(prayersResult.rows[0].total) || 0,
      today: parseInt(prayersResult.rows[0].today) || 0,
      week: parseInt(prayersResult.rows[0].week) || 0,
      month: parseInt(prayersResult.rows[0].month) || 0
    };

    // متوسط الدعوات اليومي (آخر 30 يوم)
    const avgDailyResult = await query(`
      SELECT COALESCE(
        ROUND(COUNT(*)::numeric / NULLIF(
          EXTRACT(DAY FROM NOW() - MIN(prayed_at)), 0
        ), 1), 0
      ) as avg_daily
      FROM prayers
      WHERE prayed_at >= NOW() - INTERVAL '30 days'
    `);
    const avgDailyPrayers = parseFloat(avgDailyResult.rows[0].avg_daily) || 0;

    // ══════════════════════════════════════════════════════════════════════
    // 📋 إحصائيات طلبات الدعاء
    // ══════════════════════════════════════════════════════════════════════
    
    // إجمالي الطلبات
    const totalRequestsResult = await query('SELECT COUNT(*) as count FROM prayer_requests');
    const totalRequests = parseInt(totalRequestsResult.rows[0].count) || 0;

    // الطلبات حسب النوع
    const requestsByTypeResult = await query(`
      SELECT type, COUNT(*) as count
      FROM prayer_requests
      GROUP BY type
    `);
    const requestsByType = { personal: 0, friend: 0, deceased: 0, sick: 0 };
    requestsByTypeResult.rows.forEach(row => {
      if (requestsByType.hasOwnProperty(row.type)) {
        requestsByType[row.type] = parseInt(row.count);
      }
    });

    // الطلبات حسب الحالة
    const requestsByStatusResult = await query(`
      SELECT status, COUNT(*) as count
      FROM prayer_requests
      GROUP BY status
    `);
    const requestsByStatus = { active: 0, completed: 0, expired: 0 };
    requestsByStatusResult.rows.forEach(row => {
      if (requestsByStatus.hasOwnProperty(row.status)) {
        requestsByStatus[row.status] = parseInt(row.count);
      }
    });

    // متوسط الدعوات لكل طلب
    const avgPrayersPerRequestResult = await query(`
      SELECT COALESCE(ROUND(AVG(prayer_count), 1), 0) as avg
      FROM prayer_requests
    `);
    const avgPrayersPerRequest = parseFloat(avgPrayersPerRequestResult.rows[0].avg) || 0;

    // الطلبات الأكثر دعاءً
    const topRequestsResult = await query(`
      SELECT name, type, prayer_count
      FROM prayer_requests
      WHERE prayer_count > 0
      ORDER BY prayer_count DESC
      LIMIT 5
    `);
    const topRequests = topRequestsResult.rows.map(row => ({
      name: row.name || 'غير معروف',
      type: row.type,
      prayerCount: parseInt(row.prayer_count)
    }));

    // ══════════════════════════════════════════════════════════════════════
    // ⭐ إحصائيات النجوم
    // ══════════════════════════════════════════════════════════════════════
    
    const starsResult = await query(`
      SELECT 
        COALESCE(SUM(total_stars), 0) as total,
        COALESCE(ROUND(AVG(total_stars), 1), 0) as avg,
        COALESCE(MAX(total_stars), 0) as max
      FROM user_stats
    `);
    const stars = {
      total: parseInt(starsResult.rows[0].total) || 0,
      avg: parseFloat(starsResult.rows[0].avg) || 0,
      max: parseInt(starsResult.rows[0].max) || 0
    };

    // ══════════════════════════════════════════════════════════════════════
    // 🔥 إحصائيات التتابع (Streak)
    // ══════════════════════════════════════════════════════════════════════
    
    const streakResult = await query(`
      SELECT 
        COALESCE(MAX(daily_streak), 0) as max_current,
        COALESCE(MAX(max_streak), 0) as all_time_max,
        COALESCE(ROUND(AVG(daily_streak), 1), 0) as avg
      FROM user_stats
    `);
    const streak = {
      maxCurrent: parseInt(streakResult.rows[0].max_current) || 0,
      allTimeMax: parseInt(streakResult.rows[0].all_time_max) || 0,
      avg: parseFloat(streakResult.rows[0].avg) || 0
    };

    // ══════════════════════════════════════════════════════════════════════
    // 💎 إحصائيات التوثيق (Verification Badges)
    // ══════════════════════════════════════════════════════════════════════
    
    const badgesResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE interaction_rate >= 98) as crown,
        COUNT(*) FILTER (WHERE interaction_rate >= 90 AND interaction_rate < 98) as trophy,
        COUNT(*) FILTER (WHERE interaction_rate >= 80 AND interaction_rate < 90) as diamond,
        COUNT(*) FILTER (WHERE interaction_rate < 80) as none
      FROM user_stats
    `);
    const badges = {
      crown: parseInt(badgesResult.rows[0].crown) || 0,
      trophy: parseInt(badgesResult.rows[0].trophy) || 0,
      diamond: parseInt(badgesResult.rows[0].diamond) || 0,
      none: parseInt(badgesResult.rows[0].none) || 0
    };

    // ══════════════════════════════════════════════════════════════════════
    // 🏆 المتصدرين (أكثر المستخدمين نشاطاً)
    // ══════════════════════════════════════════════════════════════════════
    
    const topUsersResult = await query(`
      SELECT 
        u.id, u.full_name, u.level,
        us.total_prayers, us.total_stars, us.daily_streak, us.interaction_rate
      FROM user_stats us
      JOIN users u ON u.id = us.user_id
      ORDER BY us.total_prayers DESC
      LIMIT 5
    `);
    const topUsers = topUsersResult.rows.map(row => ({
      id: row.id,
      name: row.full_name || 'مستخدم',
      level: row.level,
      totalPrayers: parseInt(row.total_prayers) || 0,
      totalStars: parseInt(row.total_stars) || 0,
      dailyStreak: parseInt(row.daily_streak) || 0,
      interactionRate: parseFloat(row.interaction_rate) || 0
    }));

    // ══════════════════════════════════════════════════════════════════════
    // ⏰ ساعات الذروة (توزيع الدعوات حسب الساعة)
    // ══════════════════════════════════════════════════════════════════════
    
    const peakHoursResult = await query(`
      SELECT 
        EXTRACT(HOUR FROM prayed_at)::int as hour,
        COUNT(*) as count
      FROM prayers
      WHERE prayed_at >= NOW() - INTERVAL '7 days'
      GROUP BY hour
      ORDER BY hour
    `);
    const peakHours = {};
    for (let i = 0; i < 24; i++) {
      peakHours[i] = 0;
    }
    peakHoursResult.rows.forEach(row => {
      peakHours[row.hour] = parseInt(row.count);
    });

    // إيجاد ساعة الذروة
    let peakHour = 0;
    let maxCount = 0;
    Object.entries(peakHours).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        peakHour = parseInt(hour);
      }
    });

    // ══════════════════════════════════════════════════════════════════════
    // 🤝 إحصائيات الدعاء الجماعي
    // ══════════════════════════════════════════════════════════════════════
    
    const collectivePrayerResult = await query(`
      SELECT 
        COUNT(*) as total_participants,
        COUNT(DISTINCT user_id) as unique_participants
      FROM collective_prayer_participants
    `);
    const collectivePrayer = {
      totalParticipants: parseInt(collectivePrayerResult.rows[0].total_participants) || 0,
      uniqueParticipants: parseInt(collectivePrayerResult.rows[0].unique_participants) || 0
    };

    // عدد جلسات الدعاء الجماعي
    const collectiveSessionsResult = await query(`
      SELECT COUNT(*) as count FROM collective_prayer
    `);
    collectivePrayer.totalSessions = parseInt(collectiveSessionsResult.rows[0].count) || 0;

    // ══════════════════════════════════════════════════════════════════════
    // 🎰 إحصائيات القرعة
    // ══════════════════════════════════════════════════════════════════════
    
    const lotteryResult = await query(`
      SELECT 
        COUNT(*) as total_runs,
        COALESCE(SUM(winners_count), 0) as total_winners
      FROM lottery_history
    `);
    const lottery = {
      totalRuns: parseInt(lotteryResult.rows[0].total_runs) || 0,
      totalWinners: parseInt(lotteryResult.rows[0].total_winners) || 0
    };

    // آخر قرعة
    const lastLotteryResult = await query(`
      SELECT lottery_date, winners_count, lottery_type
      FROM lottery_history
      ORDER BY lottery_date DESC
      LIMIT 1
    `);
    if (lastLotteryResult.rows.length > 0) {
      lottery.lastRun = {
        date: lastLotteryResult.rows[0].lottery_date,
        winnersCount: lastLotteryResult.rows[0].winners_count,
        type: lastLotteryResult.rows[0].lottery_type
      };
    }

    // ══════════════════════════════════════════════════════════════════════
    // 📈 نسب المستويات (للقرعة)
    // ══════════════════════════════════════════════════════════════════════
    
    const levelRatiosResult = await query(`
      SELECT level_1, level_2, level_3 FROM level_ratios
      ORDER BY id DESC LIMIT 1
    `);
    const levelRatios = levelRatiosResult.rows[0] || { level_1: 70, level_2: 20, level_3: 10 };

    // ══════════════════════════════════════════════════════════════════════
    // 🏅 إحصائيات الإنجازات
    // ══════════════════════════════════════════════════════════════════════
    
    const achievementsResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(DISTINCT user_id) as users_with_achievements
      FROM user_achievements
    `);
    const achievements = {
      total: parseInt(achievementsResult.rows[0].total) || 0,
      active: parseInt(achievementsResult.rows[0].active) || 0,
      usersWithAchievements: parseInt(achievementsResult.rows[0].users_with_achievements) || 0
    };

    // ══════════════════════════════════════════════════════════════════════
    // 📊 إرجاع جميع الإحصائيات
    // ══════════════════════════════════════════════════════════════════════
    
    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          byLevel: usersByLevel,
          new: newUsers,
          active: activeUsers
        },
        prayers: {
          total: prayers.total,
          today: prayers.today,
          week: prayers.week,
          month: prayers.month,
          avgDaily: avgDailyPrayers
        },
        requests: {
          total: totalRequests,
          byType: requestsByType,
          byStatus: requestsByStatus,
          avgPrayersPerRequest: avgPrayersPerRequest,
          top: topRequests
        },
        stars: stars,
        streak: streak,
        badges: badges,
        topUsers: topUsers,
        peakHours: {
          distribution: peakHours,
          peak: { hour: peakHour, count: maxCount }
        },
        collectivePrayer: collectivePrayer,
        lottery: lottery,
        levelRatios: {
          level1: levelRatios.level_1,
          level2: levelRatios.level_2,
          level3: levelRatios.level_3
        },
        achievements: achievements,
        // للتوافق مع الكود القديم
        totalUsers: totalUsers,
        prayersToday: prayers.today,
        activeUsers: activeUsers.today,
        verifiedUsers: { total: usersByLevel.level3 }
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الإحصائيات', details: error.message },
      { status: 500 }
    );
  }
}
