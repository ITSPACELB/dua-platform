import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

// ============================================================================
// 🤲 POST - الدعاء على طلب (آمين)
// ============================================================================
export async function POST(request, { params }) {
  try {
    const requestId = params.id;

    // ============================================================================
    // 🔐 التحقق من المستخدم (Token أو Fingerprint)
    // ============================================================================
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const body = await request.json();
    const { fingerprint } = body;

    let userId = null;

    // محاولة 1: Token
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        console.log('Invalid token, trying fingerprint');
      }
    }

    // محاولة 2: Fingerprint
    if (!userId && fingerprint) {
      const userResult = await query(
        `SELECT id FROM users WHERE device_fingerprint = $1`,
        [fingerprint]
      );

      if (userResult.rows.length === 0) {
        // إنشاء مستخدم جديد
        const newUserResult = await query(
          `INSERT INTO users (device_fingerprint, created_at) 
           VALUES ($1, NOW()) 
           RETURNING id`,
          [fingerprint]
        );
        userId = newUserResult.rows[0].id;

        // إنشاء سجل إحصائيات
        await query(
          `INSERT INTO user_stats (user_id, total_prayers, prayers_today, prayers_week, prayers_month, prayers_year, total_stars, level) 
           VALUES ($1, 0, 0, 0, 0, 0, 0, 0)`,
          [userId]
        );
      } else {
        userId = userResult.rows[0].id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'يجب التسجيل أو السماح بالبصمة' },
        { status: 401 }
      );
    }

    // ============================================================================
    // 🚫 التحقق من عدم التكرار
    // ============================================================================
    const existingPrayer = await query(
      `SELECT id FROM prayer_responses 
       WHERE user_id = $1 AND request_id = $2`,
      [userId, requestId]
    );

    if (existingPrayer.rows.length > 0) {
      return NextResponse.json(
        { error: 'لقد دعوت لهذا الطلب من قبل ✅' },
        { status: 400 }
      );
    }

    // ============================================================================
    // 💾 إضافة الدعاء
    // ============================================================================
    await query(
      `INSERT INTO prayer_responses (user_id, request_id, created_at)
       VALUES ($1, $2, NOW())`,
      [userId, requestId]
    );

    // ============================================================================
    // 📊 تحديث العدّادات
    // ============================================================================
    
    // 1️⃣ تحديث عدّاد الطلب نفسه
    await query(
      `UPDATE prayer_requests 
       SET prayer_count = prayer_count + 1 
       WHERE id = $1`,
      [requestId]
    );

    // 2️⃣ تحديث إحصائيات المستخدم
    await query(
      `UPDATE user_stats 
       SET 
         total_prayers = total_prayers + 1,
         prayers_today = prayers_today + 1,
         prayers_week = prayers_week + 1,
         prayers_month = prayers_month + 1,
         prayers_year = prayers_year + 1
       WHERE user_id = $1`,
      [userId]
    );

    // ============================================================================
    // 🏆 التحقق من الإنجازات الجديدة
    // ============================================================================
    const statsResult = await query(
      `SELECT total_prayers FROM user_stats WHERE user_id = $1`,
      [userId]
    );

    const totalPrayers = statsResult.rows[0]?.total_prayers || 0;
    let newAchievement = null;

    // قائمة الإنجازات حسب عدد الدعوات
    const achievementMilestones = {
      1: { type: 'first_prayer', stars: 1 },
      10: { type: 'prayers_10', stars: 2 },
      25: { type: 'prayers_25', stars: 3 },
      50: { type: 'prayers_50', stars: 5 },
      100: { type: 'prayers_100', stars: 10 },
      365: { type: 'prayers_365', stars: 15 },
      1000: { type: 'prayers_1000', stars: 25 }
    };

    if (achievementMilestones[totalPrayers]) {
      const achievement = achievementMilestones[totalPrayers];
      
      // التحقق من عدم وجود الإنجاز من قبل
      const existingAchievement = await query(
        `SELECT id FROM user_achievements 
         WHERE user_id = $1 AND achievement_type = $2`,
        [userId, achievement.type]
      );

      if (existingAchievement.rows.length === 0) {
        // إضافة الإنجاز
        await query(
          `INSERT INTO user_achievements (user_id, achievement_type, stars_earned, achieved_at)
           VALUES ($1, $2, $3, NOW())`,
          [userId, achievement.type, achievement.stars]
        );

        // إضافة النجوم للمستخدم
        await query(
          `UPDATE user_stats 
           SET total_stars = total_stars + $1 
           WHERE user_id = $2`,
          [achievement.stars, userId]
        );

        newAchievement = {
          type: achievement.type,
          stars: achievement.stars
        };
      }
    }

    // ============================================================================
    // 📈 جلب العدّاد المحدث
    // ============================================================================
    const countResult = await query(
      `SELECT prayer_count FROM prayer_requests WHERE id = $1`,
      [requestId]
    );

    const updatedCount = countResult.rows[0]?.prayer_count || 0;

    // ============================================================================
    // ✅ رسالة النجاح
    // ============================================================================
    return NextResponse.json({
      success: true,
      message: '🤲 آمين! تقبل الله دعاءك\n\n"وَالَّذِينَ يَدْعُونَ لِإِخْوَانِهِمْ بِظَهْرِ الْغَيْبِ"',
      prayer_count: updatedCount,
      newAchievement
    });

  } catch (error) {
    console.error('POST pray error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء الدعاء' },
      { status: 500 }
    );
  }
}