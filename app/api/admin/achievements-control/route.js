// ════════════════════════════════════════════════════════════
// 🎛️ API التحكم الشامل بنظام الإنجازات
// ════════════════════════════════════════════════════════════
// المسار: /api/admin/achievements-control
// الغرض: إدارة شاملة للإعدادات والسجلات والمستخدمين
// الحماية: Admin Only
// ════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

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
// 📥 GET - جلب البيانات
// ════════════════════════════════════════════════════════════
export async function GET(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'getSettings':
        return await getSettings();
      
      case 'getLotteryHistory':
        const historyLimit = parseInt(searchParams.get('limit') || '10');
        return await getLotteryHistory(historyLimit);
      
      case 'getTopUsers':
        const usersLimit = parseInt(searchParams.get('limit') || '20');
        return await getTopUsers(usersLimit);
      
      case 'getStats':
        return await getStats();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('GET /api/admin/achievements-control error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════
// 📤 POST - إنشاء/تحديث
// ════════════════════════════════════════════════════════════
export async function POST(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'setManualWinners':
        return await setManualWinners(body.winners, auth.decoded.userId);
      
      case 'updateThreshold':
        return await updateThreshold(body.feature, body.threshold, auth.decoded.userId);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/admin/achievements-control error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════
// 🔄 PATCH - تعديل
// ════════════════════════════════════════════════════════════
export async function PATCH(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'toggleAutomatic':
        return await toggleAutomatic(body.feature, body.isAutomatic, auth.decoded.userId);
      
      case 'toggleEnabled':
        return await toggleEnabled(body.feature, body.isEnabled, auth.decoded.userId);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('PATCH /api/admin/achievements-control error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════
// 📊 Functions - الدوال المساعدة
// ════════════════════════════════════════════════════════════

/**
 * جلب جميع الإعدادات
 */
async function getSettings() {
  const result = await query(
    `SELECT * FROM achievement_settings ORDER BY feature_name`
  );

  return NextResponse.json({
    success: true,
    settings: result.rows
  });
}

/**
 * جلب سجل القرعات
 */
async function getLotteryHistory(limit = 10) {
  const result = await query(
    `SELECT * FROM lottery_history 
     ORDER BY lottery_time DESC 
     LIMIT $1`,
    [limit]
  );

  return NextResponse.json({
    success: true,
    history: result.rows
  });
}

/**
 * جلب أفضل المستخدمين
 */
async function getTopUsers(limit = 20) {
  const result = await query(
    `SELECT 
      u.id,
      u.full_name,
      us.level,
      us.total_stars,
      us.total_prayers,
      us.prayers_week,
      us.interaction_rate,
      us.daily_streak,
      COALESCE(up.total_points, 0) as points,
      up.rank
     FROM users u
     INNER JOIN user_stats us ON u.id = us.user_id
     LEFT JOIN user_points up ON u.id = up.user_id
     WHERE us.level >= 2
     AND u.full_name IS NOT NULL
     ORDER BY up.total_points DESC NULLS LAST
     LIMIT $1`,
    [limit]
  );

  return NextResponse.json({
    success: true,
    users: result.rows
  });
}

/**
 * جلب الإحصائيات العامة
 */
async function getStats() {
  // عدد القرعات
  const lotteriesResult = await query(
    `SELECT COUNT(*) as total FROM lottery_history`
  );

  // عدد المستخدمين المؤهلين
  const eligibleResult = await query(
    `SELECT COUNT(*) as total FROM users u
     INNER JOIN user_stats us ON u.id = us.user_id
     WHERE us.level >= 2
     AND u.full_name IS NOT NULL
     AND u.mother_or_father_name IS NOT NULL`
  );

  // إجمالي النجوم الممنوحة
  const starsResult = await query(
    `SELECT SUM(total_stars) as total FROM user_stats`
  );

  // الإنجازات النشطة
  const activeAchievementsResult = await query(
    `SELECT COUNT(*) as total FROM achievements WHERE is_active = true`
  );

  return NextResponse.json({
    success: true,
    stats: {
      totalLotteries: parseInt(lotteriesResult.rows[0]?.total || 0),
      eligibleUsers: parseInt(eligibleResult.rows[0]?.total || 0),
      totalStarsGranted: parseInt(starsResult.rows[0]?.total || 0),
      activeAchievements: parseInt(activeAchievementsResult.rows[0]?.total || 0)
    }
  });
}

/**
 * تبديل التلقائي/اليدوي
 */
async function toggleAutomatic(feature, isAutomatic, adminId) {
  await query(
    `UPDATE achievement_settings 
     SET is_automatic = $1, updated_by = $2, updated_at = NOW()
     WHERE feature_name = $3`,
    [isAutomatic, adminId, feature]
  );

  return NextResponse.json({
    success: true,
    message: 'Setting updated'
  });
}

/**
 * تبديل التفعيل
 */
async function toggleEnabled(feature, isEnabled, adminId) {
  await query(
    `UPDATE achievement_settings 
     SET is_enabled = $1, updated_by = $2, updated_at = NOW()
     WHERE feature_name = $3`,
    [isEnabled, adminId, feature]
  );

  return NextResponse.json({
    success: true,
    message: 'Setting updated'
  });
}

/**
 * تعيين الفائزين اليدويين
 */
async function setManualWinners(winners, adminId) {
  const winnersData = {
    enabled: true,
    users: winners
  };

  await query(
    `UPDATE achievement_settings 
     SET setting_value = $1, updated_by = $2, updated_at = NOW()
     WHERE feature_name = 'manual_winners'`,
    [JSON.stringify(winnersData), adminId]
  );

  return NextResponse.json({
    success: true,
    message: 'Manual winners set'
  });
}

/**
 * تحديث حد الإنجاز
 */
async function updateThreshold(feature, threshold, adminId) {
  const settingsResult = await query(
    `SELECT setting_value FROM achievement_settings WHERE feature_name = $1`,
    [feature]
  );

  if (settingsResult.rows.length === 0) {
    return NextResponse.json(
      { error: 'Feature not found' },
      { status: 404 }
    );
  }

  const currentSettings = settingsResult.rows[0].setting_value;
  currentSettings.auto_config = currentSettings.auto_config || {};
  currentSettings.auto_config.threshold = threshold;

  await query(
    `UPDATE achievement_settings 
     SET setting_value = $1, updated_by = $2, updated_at = NOW()
     WHERE feature_name = $3`,
    [JSON.stringify(currentSettings), adminId, feature]
  );

  return NextResponse.json({
    success: true,
    message: 'Threshold updated'
  });
}