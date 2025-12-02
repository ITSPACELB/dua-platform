'use client'
import { useState } from 'react';

// ════════════════════════════════════════════════════════════
// 💎🏆👑 شارة التوثيق - النظام النهائي المعتمد
// ════════════════════════════════════════════════════════════
// النظام الثلاثي المحفّز:
// 💎 الماسة الزرقاء (80-89%) - الفارس المتألق
// 🏆 الكأس الذهبي (90-97%) - البطل الفائز
// 👑 التاج الملكي (98-100%) - الملك المتوّج
//
// المميزات:
// ✅ تدرج واضح ومحفّز للملايين من المستخدمين
// ✅ Animations فريدة لكل مستوى تعكس قيمته
// ✅ Tooltips شاملة وواضحة (Desktop + Mobile)
// ✅ دعم فترة السماح (Grace Period)
// ✅ 4 أحجام (sm, md, lg, xl) للمرونة الكاملة
// ✅ معالجة آمنة 100% للحالات الخاصة
// ✅ تكامل كامل مع نظام المستويات
// ✅ Performance محسّن للملايين
// ════════════════════════════════════════════════════════════

export default function VerificationBadge({ 
  level, 
  size = 'md', 
  showTooltip = true,
  isInGracePeriod = false,
  daysRemaining = 0
}) {
  // ═══════════════════════════════════════════════════════════
  // 🔧 State - دعم Mobile مع Desktop
  // ═══════════════════════════════════════════════════════════
  const [showTooltipMobile, setShowTooltipMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // 🚫 التحقق من صحة المستوى
  // ═══════════════════════════════════════════════════════════
  if (!level || level.name === 'NONE' || !level.name) return null;

  // ═══════════════════════════════════════════════════════════
  // 📏 تكوين الأحجام (Responsive)
  // ═══════════════════════════════════════════════════════════
  const sizeConfig = {
    sm: {
      container: 'w-4 h-4',
      icon: 'text-[10px]',
      tooltip: 'text-[10px] px-2 py-1'
    },
    md: {
      container: 'w-5 h-5',
      icon: 'text-xs',
      tooltip: 'text-xs px-3 py-1.5'
    },
    lg: {
      container: 'w-6 h-6',
      icon: 'text-sm',
      tooltip: 'text-sm px-3 py-2'
    },
    xl: {
      container: 'w-8 h-8',
      icon: 'text-base',
      tooltip: 'text-sm px-4 py-2'
    }
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;

  // ═══════════════════════════════════════════════════════════
  // 🎨 نظام الشارات الثلاثي - محسّن وواضح
  // ═══════════════════════════════════════════════════════════
  const badges = {
    BLUE: {
      bg: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)',
      shadow: '0 3px 8px rgba(79, 195, 247, 0.4)',
      icon: '💎',
      border: '1px solid rgba(79, 195, 247, 0.5)',
      name: 'الماسة الزرقاء',
      nameShort: 'الماسة',
      description: 'مستخدم موثق - تفاعل 80%+',
      details: 'أنت من الفرسان المتألقين في المنصة'
    },
    GREEN: {
      bg: 'linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)',
      shadow: '0 3px 10px rgba(255, 183, 77, 0.5)',
      icon: '🏆',
      border: '1px solid rgba(255, 183, 77, 0.6)',
      animation: 'trophy-glow 2.5s ease-in-out infinite',
      name: 'الكأس الذهبي',
      nameShort: 'الكأس',
      description: 'مستخدم ممتاز - تفاعل 90%+',
      details: 'أنت من الأبطال الفائزين المتميزين'
    },
    GOLD: {
      bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      shadow: '0 4px 12px rgba(255, 215, 0, 0.6)',
      icon: '👑',
      border: '2px solid rgba(255, 215, 0, 0.7)',
      animation: 'crown-shine 3s ease-in-out infinite',
      name: 'التاج الملكي',
      nameShort: 'التاج',
      description: 'مستخدم مميز - تفاعل 98%+',
      details: 'أنت من الملوك المتوّجين - النخبة المطلقة'
    }
  };

  const badge = badges[level.name] || badges.BLUE;

  // ═══════════════════════════════════════════════════════════
  // 🎨 واجهة المستخدم - احترافية وسلسة
  // ═══════════════════════════════════════════════════════════
  return (
    <div 
      className="relative inline-flex group cursor-pointer select-none"
      onClick={() => setShowTooltipMobile(!showTooltipMobile)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowTooltipMobile(false);
      }}
      role="img"
      aria-label={badge.name}
    >
      {/* ═══════════════════════════════════════════════════════ */}
      {/* الشارة الرئيسية */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div
        className={`
          ${currentSize.container}
          inline-flex items-center justify-center
          rounded-full
          flex-shrink-0
          transition-all duration-300
          hover:scale-110
          ${isInGracePeriod ? 'opacity-70' : 'opacity-100'}
        `}
        style={{
          background: badge.bg,
          boxShadow: badge.shadow,
          border: badge.border,
          animation: badge.animation
        }}
        title={!showTooltip ? badge.nameShort : ''}
      >
        <span className={`${currentSize.icon} leading-none select-none`}>
          {badge.icon}
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Tooltip - Desktop (hover) و Mobile (click) */}
      {/* ═══════════════════════════════════════════════════════ */}
      {showTooltip && (showTooltipMobile || isHovered) && (
        <div 
          className={`
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            ${currentSize.tooltip}
            bg-stone-900 text-white font-medium rounded-lg
            opacity-100 pointer-events-none transition-all duration-300
            z-50 shadow-2xl min-w-max max-w-xs
          `}
        >
          {/* العنوان الرئيسي */}
          <div className="font-bold mb-1 text-center">
            {badge.icon} {badge.nameShort}
          </div>
          
          {/* الوصف */}
          <div className="text-[10px] text-stone-300 text-center leading-relaxed">
            {badge.description}
          </div>
          
          {/* التفاصيل الإضافية */}
          {size !== 'sm' && (
            <div className="text-[9px] text-stone-400 text-center mt-1 italic">
              {badge.details}
            </div>
          )}
          
          {/* تحذير فترة السماح */}
          {isInGracePeriod && daysRemaining > 0 && (
            <div className="mt-2 pt-2 border-t border-stone-700">
              <span className="block text-amber-300 text-[10px] text-center font-semibold">
                ⚠️ فترة سماح: {daysRemaining} يوم متبقي
              </span>
              <span className="block text-amber-400 text-[8px] text-center mt-0.5">
                حافظ على تفاعلك للاحتفاظ بالشارة
              </span>
            </div>
          )}
          
          {/* السهم السفلي */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-stone-900" />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Animations CSS - محسّنة للأداء */}
      {/* ═══════════════════════════════════════════════════════ */}
      <style jsx>{`
        @keyframes trophy-glow {
          0%, 100% { 
            transform: scale(1);
            filter: brightness(1);
          }
          50% { 
            transform: scale(1.06);
            filter: brightness(1.15);
          }
        }
        
        @keyframes crown-shine {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            filter: brightness(1) drop-shadow(0 0 8px rgba(255, 215, 0, 0.3));
          }
          50% { 
            transform: scale(1.1) rotate(-3deg);
            filter: brightness(1.3) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6));
          }
        }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 📚 دالة createVerificationLevel - محسّنة وآمنة
// ════════════════════════════════════════════════════════════
/**
 * إنشاء مستوى توثيق بناءً على نسبة التفاعل
 * @param {number} interactionRate - نسبة التفاعل (0-100)
 * @param {string} status - حالة الشارة ('active', 'grace_period', 'lost')
 * @param {number} daysInGrace - أيام السماح المتبقية
 * @returns {Object|null} - كائن المستوى أو null
 */
export function createVerificationLevel(interactionRate, status = 'active', daysInGrace = 0) {
  // ✅ التحقق من صحة المدخلات
  if (typeof interactionRate !== 'number' || isNaN(interactionRate) || interactionRate < 80) {
    return null;
  }

  // تحديد المستوى بناءً على النسبة
  let level = {
    name: 'BLUE',
    nameAr: 'الماسة الزرقاء',
    nameShort: 'الماسة',
    color: '#4FC3F7',
    icon: '💎',
    threshold: 80,
    maintainThreshold: 75,
    rank: 1
  };

  // 🏆 الكأس الذهبي (90-97%)
  if (interactionRate >= 90 && interactionRate < 98) {
    level = {
      name: 'GREEN',
      nameAr: 'الكأس الذهبي',
      nameShort: 'الكأس',
      color: '#FFB74D',
      icon: '🏆',
      threshold: 90,
      maintainThreshold: 85,
      rank: 2
    };
  }
  // 👑 التاج الملكي (98%+)
  else if (interactionRate >= 98) {
    level = {
      name: 'GOLD',
      nameAr: 'التاج الملكي',
      nameShort: 'التاج',
      color: '#FFD700',
      icon: '👑',
      threshold: 98,
      maintainThreshold: 95,
      rank: 3
    };
  }

  // إضافة معلومات الحالة
  level.status = status;
  level.interactionRate = Math.round(interactionRate);
  level.isInGracePeriod = status === 'grace_period';
  level.daysRemaining = daysInGrace || 0;
  level.isActive = status === 'active';
  level.isLost = status === 'lost';

  return level;
}

// ════════════════════════════════════════════════════════════
// 🎯 دالة getBadgeLevelName - الحصول على الاسم بالعربي
// ════════════════════════════════════════════════════════════
/**
 * الحصول على اسم المستوى بالعربي
 * @param {string} levelName - اسم المستوى بالإنجليزي
 * @returns {string} - الاسم بالعربي
 */
export function getBadgeLevelName(levelName) {
  const names = {
    'BLUE': 'الماسة الزرقاء',
    'GREEN': 'الكأس الذهبي',
    'GOLD': 'التاج الملكي',
    'NONE': 'بدون شارة'
  };
  
  return names[levelName] || 'غير معروف';
}

// ════════════════════════════════════════════════════════════
// 📊 دالة getBadgeStatusMessage - رسائل الحالة
// ════════════════════════════════════════════════════════════
/**
 * الحصول على رسالة الحالة مع اللون المناسب
 * @param {Object} level - كائن المستوى
 * @returns {Object} - رسالة الحالة مع النوع واللون
 */
export function getBadgeStatusMessage(level) {
  if (!level) {
    return {
      type: 'none',
      message: 'ليس لديك شارة توثيق بعد',
      subMessage: 'ابدأ التفاعل للحصول على الماسة الزرقاء',
      color: 'text-stone-500'
    };
  }

  if (level.isLost) {
    return {
      type: 'lost',
      message: `فقدت ${level.nameShort}`,
      subMessage: 'حافظ على تفاعلك لاستعادتها',
      color: 'text-red-600'
    };
  }

  if (level.isInGracePeriod) {
    return {
      type: 'grace',
      message: `⚠️ ${level.nameShort} في فترة سماح`,
      subMessage: `${level.daysRemaining} يوم متبقي - حافظ على تفاعلك`,
      color: 'text-amber-600'
    };
  }

  return {
    type: 'active',
    message: `✅ ${level.nameShort} نشط`,
    subMessage: 'استمر في التميز!',
    color: 'text-emerald-600'
  };
}

// ════════════════════════════════════════════════════════════
// 🎖️ دالة getNextBadge - الشارة التالية
// ════════════════════════════════════════════════════════════
/**
 * الحصول على معلومات الشارة التالية
 * @param {number} currentRate - النسبة الحالية
 * @returns {Object|null} - معلومات الشارة التالية أو null
 */
export function getNextBadge(currentRate) {
  if (currentRate >= 98) {
    return null; // أعلى مستوى
  }
  
  if (currentRate >= 90) {
    return {
      name: 'التاج الملكي',
      icon: '👑',
      requiredRate: 98,
      remaining: 98 - currentRate
    };
  }
  
  if (currentRate >= 80) {
    return {
      name: 'الكأس الذهبي',
      icon: '🏆',
      requiredRate: 90,
      remaining: 90 - currentRate
    };
  }
  
  return {
    name: 'الماسة الزرقاء',
    icon: '💎',
    requiredRate: 80,
    remaining: 80 - currentRate
  };
}