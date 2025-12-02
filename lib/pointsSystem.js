// ════════════════════════════════════════════════════════════
// 🎯 نظام النقاط الموزونة والعادلة
// ════════════════════════════════════════════════════════════
// الغرض: حساب نقاط المستخدمين بناءً على نشاطهم وجودة مشاركتهم
// الاستخدام: في القرعة اليومية واختيار الفائزين بعدالة
// ════════════════════════════════════════════════════════════

/**
 * 📊 أوزان أنواع الدعاء (حسب الأولوية)
 */
export const PRAYER_TYPE_WEIGHTS = {
  collective: 6,    // 🕌 دعاء جماعي (الأولوية الأعلى)
  deceased: 5,      // 🕊️ دعاء للمتوفى
  sick: 4,          // 🏥 دعاء للمريض
  friend: 3,        // 👥 دعاء لصديق
  personal: 2       // 🤲 دعاء شخصي
};

/**
 * 📈 أوزان النشاط والجودة
 */
export const ACTIVITY_WEIGHTS = {
  dailyStreak: 10,      // 🔥 الاستمرارية اليومية
  weeklyActive: 5,      // 📅 النشاط الأسبوعي
  qualityPrayers: 3,    // ⭐ جودة الدعاء (طول النص + صدق)
  accountAge: 2,        // ⏰ مدة التسجيل (الولاء)
  interactionRate: 8    // 🤝 التفاعل مع دعوات الآخرين
};

/**
 * 🎯 حساب النقاط الموزونة لمستخدم واحد
 * 
 * @param {Object} userData - بيانات المستخدم
 * @param {Object} userStats - إحصائيات المستخدم
 * @param {Object} prayerBreakdown - توزيع أنواع الدعاء
 * @returns {Object} النقاط التفصيلية والإجمالي
 */
export function calculateWeightedPoints(userData, userStats, prayerBreakdown = null) {
  if (!userData || !userStats) {
    return {
      totalPoints: 0,
      breakdown: {},
      details: 'Missing data'
    };
  }

  const breakdown = {
    prayerPoints: 0,
    activityPoints: 0,
    bonusPoints: 0
  };

  // ═══════════════════════════════════════════════════════════
  // 1️⃣ نقاط أنواع الدعاء
  // ═══════════════════════════════════════════════════════════
  if (prayerBreakdown) {
    breakdown.prayerPoints = (
      (prayerBreakdown.deceased || 0) * PRAYER_TYPE_WEIGHTS.deceased +
      (prayerBreakdown.sick || 0) * PRAYER_TYPE_WEIGHTS.sick +
      (prayerBreakdown.friend || 0) * PRAYER_TYPE_WEIGHTS.friend +
      (prayerBreakdown.personal || 0) * PRAYER_TYPE_WEIGHTS.personal +
      (prayerBreakdown.collective || 0) * PRAYER_TYPE_WEIGHTS.collective
    );
  } else {
    // إذا لم يكن هناك تفصيل، نستخدم total_prayers
    breakdown.prayerPoints = (userStats.total_prayers || 0) * 3; // متوسط
  }

  // ═══════════════════════════════════════════════════════════
  // 2️⃣ نقاط الاستمرارية اليومية
  // ═══════════════════════════════════════════════════════════
  const dailyStreak = userStats.daily_streak || 0;
  breakdown.activityPoints += dailyStreak * ACTIVITY_WEIGHTS.dailyStreak;

  // ═══════════════════════════════════════════════════════════
  // 3️⃣ نقاط النشاط الأسبوعي
  // ═══════════════════════════════════════════════════════════
  const prayersWeek = userStats.prayers_week || 0;
  if (prayersWeek >= 7) {
    breakdown.activityPoints += ACTIVITY_WEIGHTS.weeklyActive * 3; // نشيط جداً
  } else if (prayersWeek >= 3) {
    breakdown.activityPoints += ACTIVITY_WEIGHTS.weeklyActive * 2; // نشيط
  } else if (prayersWeek >= 1) {
    breakdown.activityPoints += ACTIVITY_WEIGHTS.weeklyActive * 1; // متوسط
  }

  // ═══════════════════════════════════════════════════════════
  // 4️⃣ نقاط التفاعل مع الآخرين
  // ═══════════════════════════════════════════════════════════
  const interactionRate = userStats.interaction_rate || 0;
  if (interactionRate >= 80) {
    breakdown.activityPoints += ACTIVITY_WEIGHTS.interactionRate * 3; // ممتاز
  } else if (interactionRate >= 50) {
    breakdown.activityPoints += ACTIVITY_WEIGHTS.interactionRate * 2; // جيد
  } else if (interactionRate >= 20) {
    breakdown.activityPoints += ACTIVITY_WEIGHTS.interactionRate * 1; // مقبول
  }

  // ═══════════════════════════════════════════════════════════
  // 5️⃣ نقاط عمر الحساب (الولاء)
  // ═══════════════════════════════════════════════════════════
  if (userData.created_at) {
    const accountAgeDays = Math.floor(
      (Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    breakdown.activityPoints += Math.floor(accountAgeDays * 0.1) * ACTIVITY_WEIGHTS.accountAge;
  }

  // ═══════════════════════════════════════════════════════════
  // 6️⃣ بونص المستوى (المستوى 3 يحصل على بونص أعلى)
  // ═══════════════════════════════════════════════════════════
  const level = userStats.level || 1;
  if (level === 3) {
    breakdown.bonusPoints += 50; // بونص للمستوى الكامل
  } else if (level === 2) {
    breakdown.bonusPoints += 20; // بونص للمستوى الجزئي
  }

  // ═══════════════════════════════════════════════════════════
  // 7️⃣ بونص النجوم الحالية (كلما زادت النجوم، زاد الحافز)
  // ═══════════════════════════════════════════════════════════
  const totalStars = userStats.total_stars || 0;
  breakdown.bonusPoints += totalStars * 5;

  // ═══════════════════════════════════════════════════════════
  // الإجمالي
  // ═══════════════════════════════════════════════════════════
  const totalPoints = 
    breakdown.prayerPoints + 
    breakdown.activityPoints + 
    breakdown.bonusPoints;

  return {
    totalPoints: Math.max(0, totalPoints), // لا نقاط سالبة
    breakdown,
    details: {
      prayers: breakdown.prayerPoints,
      activity: breakdown.activityPoints,
      bonus: breakdown.bonusPoints,
      level,
      dailyStreak,
      interactionRate
    }
  };
}

/**
 * 🎲 اختيار فائزين بناءً على النقاط الموزونة (Weighted Random)
 * كلما زادت النقاط، زادت فرصة الفوز
 * 
 * @param {Array} users - قائمة المستخدمين مع نقاطهم
 * @param {number} winnersCount - عدد الفائزين المطلوب
 * @returns {Array} الفائزون المختارون
 */
export function selectWeightedWinners(users, winnersCount = 2) {
  if (!users || users.length === 0) {
    return [];
  }

  // حساب مجموع النقاط الكلي
  const totalPoints = users.reduce((sum, user) => sum + (user.points || 0), 0);

  if (totalPoints === 0) {
    // إذا لا أحد لديه نقاط، نختار عشوائياً
    const shuffled = [...users].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(winnersCount, users.length));
  }

  const winners = [];
  let availableUsers = [...users];

  for (let i = 0; i < winnersCount; i++) {
    if (availableUsers.length === 0) break;

    // إعادة حساب المجموع بعد كل اختيار
    const currentTotalPoints = availableUsers.reduce(
      (sum, user) => sum + (user.points || 0), 0
    );

    // اختيار رقم عشوائي
    const random = Math.random() * currentTotalPoints;

    // اختيار الفائز بناءً على الوزن
    let accumulated = 0;
    let selectedUser = null;

    for (const user of availableUsers) {
      accumulated += user.points || 0;
      if (random <= accumulated) {
        selectedUser = user;
        break;
      }
    }

    // إضافة الفائز وإزالته من القائمة
    if (selectedUser) {
      winners.push(selectedUser);
      availableUsers = availableUsers.filter(u => u.id !== selectedUser.id);
    }
  }

  return winners;
}

/**
 * 📊 حساب النقاط لجميع المستخدمين المؤهلين
 * 
 * @param {Array} eligibleUsers - المستخدمون المؤهلون
 * @returns {Array} المستخدمون مع نقاطهم
 */
export async function calculateAllUsersPoints(eligibleUsers, db) {
  const usersWithPoints = [];

  for (const user of eligibleUsers) {
    // جلب تفصيل أنواع الدعاء (إذا كان متاحاً)
    let prayerBreakdown = null;
    
    try {
      // محاولة جلب تفصيل الدعاء من قاعدة البيانات
      const breakdownResult = await db.query(
        `SELECT 
          COUNT(*) FILTER (WHERE prayer_type = 'deceased') as deceased,
          COUNT(*) FILTER (WHERE prayer_type = 'sick') as sick,
          COUNT(*) FILTER (WHERE prayer_type = 'friend') as friend,
          COUNT(*) FILTER (WHERE prayer_type = 'personal') as personal,
          COUNT(*) FILTER (WHERE prayer_type = 'collective') as collective
         FROM prayers
         WHERE user_id = $1`,
        [user.id]
      );

      if (breakdownResult.rows.length > 0) {
        prayerBreakdown = breakdownResult.rows[0];
      }
    } catch (error) {
      console.error('Error fetching prayer breakdown:', error);
    }

    // حساب النقاط
    const pointsData = calculateWeightedPoints(user, user, prayerBreakdown);

    usersWithPoints.push({
      ...user,
      points: pointsData.totalPoints,
      pointsBreakdown: pointsData.breakdown,
      pointsDetails: pointsData.details
    });
  }

  // ترتيب حسب النقاط (من الأعلى للأقل)
  return usersWithPoints.sort((a, b) => b.points - a.points);
}

/**
 * 🎯 حساب نسب الفوز لكل مستخدم
 * 
 * @param {Array} users - المستخدمون مع نقاطهم
 * @returns {Array} المستخدمون مع نسب الفوز
 */
export function calculateWinProbabilities(users) {
  const totalPoints = users.reduce((sum, user) => sum + (user.points || 0), 0);

  if (totalPoints === 0) {
    // إذا لا نقاط، الجميع فرصتهم متساوية
    const equalProbability = 100 / users.length;
    return users.map(user => ({
      ...user,
      winProbability: equalProbability.toFixed(2)
    }));
  }

  return users.map(user => ({
    ...user,
    winProbability: ((user.points / totalPoints) * 100).toFixed(2)
  }));
}

/**
 * 🔄 إعادة حساب النقاط بعد إضافة دعاء جديد
 * 
 * @param {string} userId - معرف المستخدم
 * @param {string} prayerType - نوع الدعاء
 * @param {Object} db - اتصال قاعدة البيانات
 */
export async function updateUserPointsAfterPrayer(userId, prayerType, db) {
  try {
    // جلب بيانات المستخدم الحالية
    const userResult = await db.query(
      `SELECT u.*, us.* 
       FROM users u
       INNER JOIN user_stats us ON u.id = us.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) return;

    const user = userResult.rows[0];

    // جلب تفصيل أنواع الدعاء
    const breakdownResult = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE prayer_type = 'deceased') as deceased,
        COUNT(*) FILTER (WHERE prayer_type = 'sick') as sick,
        COUNT(*) FILTER (WHERE prayer_type = 'friend') as friend,
        COUNT(*) FILTER (WHERE prayer_type = 'personal') as personal,
        COUNT(*) FILTER (WHERE prayer_type = 'collective') as collective
       FROM prayers
       WHERE user_id = $1`,
      [userId]
    );

    const prayerBreakdown = breakdownResult.rows[0] || {};

    // حساب النقاط الجديدة
    const pointsData = calculateWeightedPoints(user, user, prayerBreakdown);

    // حفظ في قاعدة البيانات (في جدول user_points الجديد)
    await db.query(
      `INSERT INTO user_points (
        user_id, 
        total_points, 
        prayer_points, 
        activity_points, 
        bonus_points,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        total_points = $2,
        prayer_points = $3,
        activity_points = $4,
        bonus_points = $5,
        updated_at = NOW()`,
      [
        userId,
        pointsData.totalPoints,
        pointsData.breakdown.prayerPoints,
        pointsData.breakdown.activityPoints,
        pointsData.breakdown.bonusPoints
      ]
    );

    return pointsData;
  } catch (error) {
    console.error('Error updating user points:', error);
    return null;
  }
}

/**
 * 📈 الحصول على Leaderboard (أفضل 100 مستخدم)
 * 
 * @param {Object} db - اتصال قاعدة البيانات
 * @param {number} limit - عدد المستخدمين
 * @returns {Array} قائمة أفضل المستخدمين
 */
export async function getTopUsersByPoints(db, limit = 100) {
  try {
    const result = await db.query(
      `SELECT 
        u.id,
        u.full_name,
        us.level,
        us.total_stars,
        up.total_points,
        up.prayer_points,
        up.activity_points,
        up.bonus_points,
        up.updated_at
       FROM users u
       INNER JOIN user_stats us ON u.id = us.user_id
       LEFT JOIN user_points up ON u.id = up.user_id
       WHERE us.level >= 2
       AND u.full_name IS NOT NULL
       ORDER BY up.total_points DESC NULLS LAST
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

export default {
  PRAYER_TYPE_WEIGHTS,
  ACTIVITY_WEIGHTS,
  calculateWeightedPoints,
  selectWeightedWinners,
  calculateAllUsersPoints,
  calculateWinProbabilities,
  updateUserPointsAfterPrayer,
  getTopUsersByPoints
};