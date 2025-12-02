import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { 
  selectLotteryWinners, 
  grantAchievement,
  ACHIEVEMENTS 
} from '@/lib/levelsSystem';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ════════════════════════════════════════════════════════════
// 🔐 التحقق من صلاحيات الأدمن
// ════════════════════════════════════════════════════════════
function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Unauthorized' };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return { valid: false, error: 'Insufficient permissions' };
    }

    return { valid: true, decoded };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, error: 'Invalid token' };
  }
}

// ════════════════════════════════════════════════════════════
// 📥 GET - جلب إنجازات مستخدم أو تشغيل القرعة
// ════════════════════════════════════════════════════════════
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    // ════════════════════════════════════════════════════════
    // 🎲 تشغيل القرعة اليومية
    // ════════════════════════════════════════════════════════
    if (action === 'runLottery') {
      const auth = verifyAdmin(request);
      if (!auth.valid) {
        return NextResponse.json({ error: auth.error }, { status: 403 });
      }

      return await runDailyLottery();
    }

    // ════════════════════════════════════════════════════════
    // 🏆 جلب الأكثر تفاعلاً
    // ════════════════════════════════════════════════════════
    if (action === 'topActive') {
      return await getTopActiveUsers();
    }

    // ════════════════════════════════════════════════════════
    // 👤 جلب إنجازات مستخدم محدد
    // ════════════════════════════════════════════════════════
    if (userId) {
      const result = await query(
        `SELECT 
          id,
          achievement_type,
          stars_earned,
          achieved_at,
          expires_at,
          is_active,
          metadata
         FROM achievements
         WHERE user_id = $1
         AND is_active = true
         ORDER BY achieved_at DESC`,
        [userId]
      );

      return NextResponse.json({
        success: true,
        achievements: result.rows
      });
    }

    // إذا لم يُحدد أي action
    return NextResponse.json(
      { error: 'Missing required parameter: action or userId' },
      { status: 400 }
    );

  } catch (error) {
    console.error('GET /api/achievements error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════
// ➕ POST - منح إنجاز يدوياً
// ════════════════════════════════════════════════════════════
export async function POST(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, achievementType } = body;

    if (!userId || !achievementType) {
      return NextResponse.json(
        { error: 'userId and achievementType are required' },
        { status: 400 }
      );
    }

    // التحقق من نوع الإنجاز
    const achievementKey = achievementType.toUpperCase();
    if (!ACHIEVEMENTS[achievementKey]) {
      return NextResponse.json(
        { error: 'Invalid achievement type' },
        { status: 400 }
      );
    }

    const achievement = ACHIEVEMENTS[achievementKey];

    // إدراج الإنجاز في قاعدة البيانات
    await query(
      `INSERT INTO achievements (
        user_id, 
        achievement_type, 
        stars_earned, 
        achieved_at, 
        expires_at, 
        is_active
      ) VALUES ($1, $2, $3, NOW(), $4, true)`,
      [
        userId,
        achievement.type,
        achievement.stars,
        new Date(Date.now() + achievement.duration)
      ]
    );

    // تحديث عدد النجوم
    await query(
      `UPDATE user_stats 
       SET total_stars = total_stars + $1
       WHERE user_id = $2`,
      [achievement.stars, userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Achievement granted successfully',
      achievement: {
        type: achievement.type,
        name: achievement.name,
        stars: achievement.stars
      }
    });

  } catch (error) {
    console.error('POST /api/achievements error:', error);
    return NextResponse.json(
      { error: 'Failed to grant achievement', details: error.message },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════
// 🎲 تشغيل القرعة اليومية
// ════════════════════════════════════════════════════════════
async function runDailyLottery() {
  try {
    // 1️⃣ جلب نسب التفاعل من الإعدادات
    const ratiosResult = await query(
      `SELECT setting_value 
       FROM admin_settings 
       WHERE setting_key = 'lottery_interaction_ratios'`
    );

    const interactionRatios = ratiosResult.rows[0]?.setting_value || {
      level1: 20,
      level2: 30,
      level3: 50
    };

    // 2️⃣ التحقق من وجود فائزين يدويين
    const manualWinnersResult = await query(
      `SELECT setting_value 
       FROM admin_settings 
       WHERE setting_key = 'manual_winners'`
    );

    const manualWinners = manualWinnersResult.rows[0]?.setting_value || null;

    let winners = [];

    // 3️⃣ إذا كان هناك فائزون يدويون
    if (manualWinners?.enabled && manualWinners?.users?.length > 0) {
      winners = manualWinners.users.map(winner => ({
        id: winner.id || `manual_${Date.now()}_${Math.random()}`,
        displayName: winner.name,
        isManual: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }));
    } else {
      // 4️⃣ القرعة التلقائية
      
      // جلب المستخدمين المؤهلين (المستوى 2 و 3)
      const eligibleUsersResult = await query(
        `SELECT 
          u.id,
          u.full_name,
          us.level,
          us.total_prayers,
          us.prayers_week,
          us.last_achievement_date
         FROM users u
         INNER JOIN user_stats us ON u.id = us.user_id
         WHERE us.level >= 2
         AND u.full_name IS NOT NULL
         AND u.mother_or_father_name IS NOT NULL
         ORDER BY us.prayers_week DESC
         LIMIT 100`
      );

      const eligibleUsers = eligibleUsersResult.rows;

      if (eligibleUsers.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'No eligible users found'
        });
      }

      // اختيار الفائزين
      const lotteryWinners = selectLotteryWinners(
        eligibleUsers,
        2,
        interactionRatios
      );

      // 5️⃣ منح إنجاز "عرض الاسم" للفائزين
      for (const winner of lotteryWinners) {
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
            new Date(Date.now() + ACHIEVEMENTS.NAME_DISPLAY.duration)
          ]
        );

        // تحديث عدد النجوم
        await query(
          `UPDATE user_stats 
           SET 
             total_stars = total_stars + 1,
             last_achievement_date = NOW()
           WHERE user_id = $1`,
          [winner.id]
        );

        winners.push({
          id: winner.id,
          displayName: winner.full_name,
          isManual: false,
          expiresAt: new Date(Date.now() + ACHIEVEMENTS.NAME_DISPLAY.duration)
        });
      }
    }

    // 6️⃣ حفظ الفائزين في الإعدادات
    await query(
      `INSERT INTO admin_settings (setting_key, setting_value, updated_at)
       VALUES ('current_top_active', $1, NOW())
       ON CONFLICT (setting_key) 
       DO UPDATE SET 
         setting_value = $1,
         updated_at = NOW()`,
      [JSON.stringify(winners)]
    );

    return NextResponse.json({
      success: true,
      message: 'Lottery completed successfully',
      winners
    });

  } catch (error) {
    console.error('Error in runDailyLottery:', error);
    return NextResponse.json(
      { error: 'Lottery failed', details: error.message },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════
// 🏆 جلب الأكثر تفاعلاً
// ════════════════════════════════════════════════════════════
async function getTopActiveUsers() {
  try {
    const result = await query(
      `SELECT setting_value 
       FROM admin_settings 
       WHERE setting_key = 'current_top_active'`
    );

    if (!result.rows[0]?.setting_value) {
      return NextResponse.json({
        success: true,
        winners: []
      });
    }

    const winners = result.rows[0].setting_value;

    // فلترة الفائزين النشطين فقط
    const activeWinners = winners.filter(winner => {
      const expiryDate = new Date(winner.expiresAt);
      return new Date() < expiryDate;
    });

    return NextResponse.json({
      success: true,
      winners: activeWinners
    });

  } catch (error) {
    console.error('Error in getTopActiveUsers:', error);
    return NextResponse.json({
      success: true,
      winners: []
    });
  }
}

// ════════════════════════════════════════════════════════════
// 🗑️ DELETE - حذف إنجاز
// ════════════════════════════════════════════════════════════
export async function DELETE(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const achievementId = searchParams.get('id');

    if (!achievementId) {
      return NextResponse.json(
        { error: 'Achievement ID is required' },
        { status: 400 }
      );
    }

    // جلب معلومات الإنجاز قبل الحذف
    const achievementResult = await query(
      `SELECT user_id, stars_earned 
       FROM achievements 
       WHERE id = $1`,
      [achievementId]
    );

    if (achievementResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    const { user_id, stars_earned } = achievementResult.rows[0];

    // حذف الإنجاز
    await query(
      `DELETE FROM achievements WHERE id = $1`,
      [achievementId]
    );

    // تحديث عدد النجوم
    await query(
      `UPDATE user_stats 
       SET total_stars = GREATEST(total_stars - $1, 0)
       WHERE user_id = $2`,
      [stars_earned, user_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Achievement deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/achievements error:', error);
    return NextResponse.json(
      { error: 'Failed to delete achievement', details: error.message },
      { status: 500 }
    );
  }
}