// ============================================
// 🌟 نظام المستويات والنجوم والقرعة - مُحدّث
// ============================================

/**
 * فترات Cooldown المتدرجة
 * كلما فاز المستخدم أكثر، زادت فترة الانتظار
 */
export const COOLDOWN_LEVELS = {
  1: 72 * 60 * 60 * 1000,       // المستوى 1: 3 أيام (الفوز الأول)
  2: 7 * 24 * 60 * 60 * 1000,   // المستوى 2: 7 أيام (الفوز الثاني)
  3: 14 * 24 * 60 * 60 * 1000,  // المستوى 3: 14 يوم (الفوز الثالث)
  4: 30 * 24 * 60 * 60 * 1000   // المستوى 4: 30 يوم (الحد الأقصى)
};

/**
 * المستويات الثلاثة للمستخدمين
 */
export const USER_LEVELS = {
  VISITOR: {
    level: 1,
    name: 'زائر',
    nameEn: 'visitor',
    requirements: {
      fingerprint: true,
      name: false,
      parentName: false,
      phone: false
    },
    benefits: {
      canPray: true,
      canRequestPrayer: true,
      prayersPerDay: 1,
      canWinAchievements: false,
      displayName: 'مؤمن' // سيضاف له رقم
    }
  },
  PARTIAL: {
    level: 2,
    name: 'جزئي',
    nameEn: 'partial',
    requirements: {
      fingerprint: true,
      name: true,
      parentName: true,
      phone: false
    },
    benefits: {
      canPray: true,
      canRequestPrayer: true,
      prayersPerDay: 1,
      canWinAchievements: true,
      canEnterLottery: true,
      displayName: 'userName' // الاسم الفعلي
    }
  },
  REGISTERED: {
    level: 3,
    name: 'مسجل',
    nameEn: 'registered',
    requirements: {
      fingerprint: true,
      name: true,
      parentName: true,
      phone: true
    },
    benefits: {
      canPray: true,
      canRequestPrayer: true,
      prayersPerDay: 1,
      canWinAchievements: true,
      canEnterLottery: true,
      canReceiveNotifications: true,
      displayName: 'userName' // الاسم الفعلي
    }
  }
};

/**
 * أنواع الإنجازات والنجوم
 */
export const ACHIEVEMENTS = {
  NAME_DISPLAY: {
    type: 'name_display',
    name: 'عرض الاسم',
    nameEn: 'Name Display',
    description: 'يظهر اسمك في قسم "الأكثر تفاعلاً" لمدة 24 ساعة',
    stars: 1,
    icon: '⭐',
    duration: 24 * 60 * 60 * 1000, // 24 ساعة
    cooldownLevels: COOLDOWN_LEVELS, // Cooldown متدرج
    benefits: {
      displayInMostActive: true,
      displayDuration: '24 ساعة'
    }
  },
  DOUBLE_PRAYER: {
    type: 'double_prayer',
    name: 'الدعاء المضاعف',
    nameEn: 'Double Prayer',
    description: 'تستطيع الدعاء مرتين في اليوم بدلاً من مرة واحدة',
    stars: 2,
    icon: '⭐⭐',
    duration: 7 * 24 * 60 * 60 * 1000, // 7 أيام
    benefits: {
      prayersPerDay: 2,
      duration: '7 أيام'
    }
  },
  VERSE_SELECTION: {
    type: 'verse_selection',
    name: 'اختيار الآية',
    nameEn: 'Verse Selection',
    description: 'اختر الآية القرآنية التي تريد الدعاء بها',
    stars: 3,
    icon: '⭐⭐⭐',
    duration: 30 * 24 * 60 * 60 * 1000, // 30 يوم
    benefits: {
      canSelectVerse: true,
      duration: '30 يوماً'
    }
  }
};

/**
 * حساب مستوى المستخدم بناءً على البيانات المتوفرة
 */
export function calculateUserLevel(userData) {
  const hasFingerprint = !!userData.device_fingerprint;
  const hasName = !!userData.full_name;
  const hasParentName = !!userData.mother_or_father_name;
  const hasPhone = !!userData.phone_number;

  // مسجل كامل
  if (hasFingerprint && hasName && hasParentName && hasPhone) {
    return USER_LEVELS.REGISTERED;
  }
  
  // جزئي
  if (hasFingerprint && hasName && hasParentName) {
    return USER_LEVELS.PARTIAL;
  }
  
  // زائر
  return USER_LEVELS.VISITOR;
}

/**
 * الحصول على مستوى التحقق من قاعدة البيانات
 * CRITICAL: دالة مطلوبة من db-utils.js
 */
export function getVerificationLevel(user) {
  if (!user) return 1;
  
  // استخدام level من قاعدة البيانات مباشرة إذا كان موجوداً
  if (user.level) {
    return user.level;
  }
  
  // حساب المستوى من البيانات
  const level = calculateUserLevel(user);
  return level.level;
}

/**
 * التحقق من أهلية المستخدم للدخول في القرعة
 */
export function isEligibleForLottery(userData) {
  const userLevel = calculateUserLevel(userData);
  
  // فقط المستويات 2 و 3 يدخلون القرعة
  if (!userLevel.benefits.canEnterLottery) {
    return {
      eligible: false,
      reason: 'يجب إدخال الاسم واسم الأم أو الأب للدخول في القرعة'
    };
  }

  return {
    eligible: true,
    reason: null
  };
}

/**
 * حساب نقاط التفاعل للمستخدم
 */
export function calculateInteractionScore(userStats, timeWindow = 'week') {
  if (!userStats) return 0;

  let baseScore = 0;

  switch (timeWindow) {
    case 'today':
      baseScore = userStats.prayers_today || 0;
      break;
    case 'week':
      baseScore = userStats.prayers_week || 0;
      break;
    case 'month':
      baseScore = userStats.prayers_month || 0;
      break;
    case 'year':
      baseScore = userStats.prayers_year || 0;
      break;
    default:
      baseScore = userStats.total_prayers || 0;
  }

  // مضاعفات بناءً على المستوى
  const level = userStats.level || 1;
  const multiplier = level === 3 ? 1.5 : level === 2 ? 1.2 : 1.0;

  return Math.floor(baseScore * multiplier);
}

/**
 * اختيار الفائزين في القرعة (استخدام نظام النقاط الموزونة)
 * هذه الدالة للتوافق مع الكود القديم فقط
 * استخدم selectWeightedWinners من pointsSystem.js بدلاً منها
 */
export function selectLotteryWinners(eligibleUsers, winnersCount = 2, interactionRatios = null) {
  if (!eligibleUsers || eligibleUsers.length === 0) {
    return [];
  }

  // فلترة المستخدمين الذين في فترة التهدئة
  const now = Date.now();
  const availableUsers = eligibleUsers.filter(user => {
    if (!user.last_achievement_date) return true;
    
    const lastAchievement = new Date(user.last_achievement_date).getTime();
    const cooldownLevel = user.cooldown_level || 1;
    const cooldownPeriod = COOLDOWN_LEVELS[cooldownLevel] || COOLDOWN_LEVELS[1];
    
    return (now - lastAchievement) >= cooldownPeriod;
  });

  if (availableUsers.length === 0) {
    return [];
  }

  // النسب المحدّثة (فقط مستوى 2 و 3)
  const ratios = interactionRatios || {
    level2: 40,  // 40%
    level3: 60   // 60%
  };

  // تصنيف المستخدمين حسب المستوى (فقط 2 و 3)
  const level3Users = availableUsers.filter(u => u.level === 3);
  const level2Users = availableUsers.filter(u => u.level === 2);

  // حساب عدد الفائزين من كل مستوى
  const level3Winners = Math.round(winnersCount * (ratios.level3 / 100));
  const level2Winners = winnersCount - level3Winners;

  const winners = [];

  // اختيار عشوائي من كل مستوى
  winners.push(...selectRandomUsers(level3Users, level3Winners));
  winners.push(...selectRandomUsers(level2Users, level2Winners));

  // إذا كان عدد الفائزين أقل من المطلوب، نكمل من أي مستوى
  if (winners.length < winnersCount) {
    const remaining = winnersCount - winners.length;
    const allRemaining = availableUsers.filter(u => !winners.includes(u));
    winners.push(...selectRandomUsers(allRemaining, remaining));
  }

  return winners.slice(0, winnersCount);
}

/**
 * اختيار مستخدمين عشوائياً من مجموعة
 */
function selectRandomUsers(users, count) {
  if (!users || users.length === 0 || count <= 0) {
    return [];
  }

  const shuffled = [...users].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, users.length));
}

/**
 * الحصول على فترة Cooldown حسب المستوى
 */
export function getCooldownPeriod(cooldownLevel) {
  return COOLDOWN_LEVELS[cooldownLevel] || COOLDOWN_LEVELS[1];
}

/**
 * حساب المستوى التالي للـ Cooldown
 */
export function getNextCooldownLevel(currentLevel) {
  const nextLevel = (currentLevel || 0) + 1;
  return Math.min(nextLevel, 4); // الحد الأقصى 4
}

/**
 * منح إنجاز للمستخدم
 */
export function grantAchievement(userId, achievementType, db) {
  const achievement = ACHIEVEMENTS[achievementType.toUpperCase()];
  
  if (!achievement) {
    throw new Error('نوع الإنجاز غير صحيح');
  }

  return {
    userId,
    achievementType: achievement.type,
    name: achievement.name,
    description: achievement.description,
    stars: achievement.stars,
    icon: achievement.icon,
    benefits: achievement.benefits,
    expiresAt: new Date(Date.now() + achievement.duration),
    grantedAt: new Date()
  };
}

/**
 * التحقق من صلاحية الإنجاز
 */
export function isAchievementActive(achievement) {
  if (!achievement || !achievement.expires_at) {
    return false;
  }

  const now = new Date();
  const expiryDate = new Date(achievement.expires_at);
  
  return now < expiryDate;
}

/**
 * الحصول على الإنجازات النشطة للمستخدم
 */
export function getActiveAchievements(userAchievements) {
  if (!userAchievements || userAchievements.length === 0) {
    return [];
  }

  return userAchievements.filter(achievement => isAchievementActive(achievement));
}

/**
 * حساب عدد الدعوات المسموح بها يومياً
 */
export function getAllowedPrayersPerDay(user, userAchievements) {
  const userLevel = calculateUserLevel(user);
  let basePrayers = userLevel.benefits.prayersPerDay;

  // التحقق من إنجاز الدعاء المضاعف
  const activeAchievements = getActiveAchievements(userAchievements);
  const hasDoublePrayer = activeAchievements.some(
    a => a.achievement_type === 'double_prayer'
  );

  if (hasDoublePrayer) {
    basePrayers = ACHIEVEMENTS.DOUBLE_PRAYER.benefits.prayersPerDay;
  }

  return basePrayers;
}

/**
 * التحقق من قدرة المستخدم على اختيار آية
 */
export function canSelectVerse(userAchievements) {
  const activeAchievements = getActiveAchievements(userAchievements);
  return activeAchievements.some(
    a => a.achievement_type === 'verse_selection'
  );
}

/**
 * توليد اسم عرض للمستخدم
 */
export function generateDisplayName(userData, userNumber = null) {
  const userLevel = calculateUserLevel(userData);

  if (userLevel.level === 1) {
    // زائر - مؤمن + رقم
    return `مؤمن ${userNumber || Math.floor(Math.random() * 10000)}`;
  }

  // مستوى 2 أو 3 - الاسم الفعلي
  if (userData.full_name) {
    return userData.full_name;
  }

  // احتياطي
  return `مؤمن ${userNumber || Math.floor(Math.random() * 10000)}`;
}

/**
 * الحصول على معلومات المستوى للعرض
 */
export function getLevelInfo(userData) {
  const level = calculateUserLevel(userData);
  const displayName = generateDisplayName(userData);

  return {
    level: level.level,
    levelName: level.name,
    displayName,
    benefits: level.benefits,
    requirements: level.requirements,
    canEnterLottery: level.benefits.canEnterLottery || false,
    canWinAchievements: level.benefits.canWinAchievements || false
  };
}

/**
 * رسالة تشجيعية للترقية
 */
export function getUpgradeMessage(userData) {
  const level = calculateUserLevel(userData);

  if (level.level === 1) {
    return {
      title: '🌟 ارتقِ بحسابك',
      message: 'أدخل اسمك واسم والدك أو والدتك لتدخل القرعة اليومية وتفوز بالمميزات',
      action: 'تسجيل البيانات',
      benefits: [
        'الدخول في القرعة اليومية',
        'فرصة الفوز بعرض اسمك في الموقع',
        'فرصة الحصول على نجوم ومميزات'
      ]
    };
  }

  if (level.level === 2) {
    return {
      title: '📱 أكمل حسابك',
      message: 'أضف رقم هاتفك لتحصل على إشعارات عندما يدعو لك أحد',
      action: 'إضافة رقم الهاتف',
      benefits: [
        'استقبال إشعارات الدعاء',
        'حماية أفضل لحسابك',
        'أولوية أعلى في القرعة'
      ]
    };
  }

  return null;
}

export default {
  USER_LEVELS,
  ACHIEVEMENTS,
  COOLDOWN_LEVELS,
  calculateUserLevel,
  getVerificationLevel,
  isEligibleForLottery,
  calculateInteractionScore,
  selectLotteryWinners,
  getCooldownPeriod,
  getNextCooldownLevel,
  grantAchievement,
  isAchievementActive,
  getActiveAchievements,
  getAllowedPrayersPerDay,
  canSelectVerse,
  generateDisplayName,
  getLevelInfo,
  getUpgradeMessage
};