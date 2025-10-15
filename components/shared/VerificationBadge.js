'use client'

// ════════════════════════════════════════════════════════════
// ✓ شارة التوثيق بنمط Twitter/X
// ════════════════════════════════════════════════════════════
// التصميم:
// - حجم دقيق: 20px × 20px
// - أيقونة Checkmark أنيقة
// - ألوان Twitter الأصلية:
//   • Blue: #1DA1F2 (80%+ تفاعل)
//   • Gold: #FFD700 (90%+ تفاعل)
//   • Green: #00BA7C (98%+ تفاعل)
// - ظل خفيف مثل Twitter
// - موضوع بجانب الاسم
// ════════════════════════════════════════════════════════════

export default function VerificationBadge({ level, size = 'md', showTooltip = true }) {
  // ═══════════════════════════════════════════════════════════
  // 🚫 إذا لم يكن هناك مستوى، لا تعرض شيئاً
  // ═══════════════════════════════════════════════════════════
  if (!level) return null;

  // ═══════════════════════════════════════════════════════════
  // 📏 الأحجام المختلفة
  // ═══════════════════════════════════════════════════════════
  const sizeConfig = {
    sm: {
      container: 'w-4 h-4',
      icon: 'w-2.5 h-2.5'
    },
    md: {
      container: 'w-5 h-5', // 20px × 20px
      icon: 'w-3 h-3'
    },
    lg: {
      container: 'w-6 h-6',
      icon: 'w-3.5 h-3.5'
    }
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;

  // ═══════════════════════════════════════════════════════════
  // 🎨 الألوان حسب المستوى
  // ═══════════════════════════════════════════════════════════
  const getBadgeStyle = () => {
    const baseStyle = {
      backgroundColor: level.color,
      boxShadow: `0 2px 4px ${level.color}40`
    };

    return baseStyle;
  };

  // ═══════════════════════════════════════════════════════════
  // 🎨 واجهة المستخدم - نمط Twitter/X
  // ═══════════════════════════════════════════════════════════
  return (
    <div
      className={`
        ${currentSize.container}
        inline-flex items-center justify-center
        rounded-full
        flex-shrink-0
        relative
        transition-all duration-200
        hover:scale-110
      `}
      style={getBadgeStyle()}
      title={showTooltip ? level.name : ''}
      aria-label={level.name}
    >
      {/* ═══════════════════════════════════════════════════════ */}
      {/* أيقونة Checkmark */}
      {/* ═══════════════════════════════════════════════════════ */}
      <svg
        className={`${currentSize.icon} text-white`}
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
          clipRule="evenodd"
        />
      </svg>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Tooltip محسّن عند التمرير */}
      {/* ═══════════════════════════════════════════════════════ */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50">
          {level.name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-stone-900"></div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 📚 دالة مساعدة لإنشاء مستوى التوثيق
// ════════════════════════════════════════════════════════════
// الاستخدام:
// import { createVerificationLevel } from '@/components/shared/VerificationBadge';
// const badge = createVerificationLevel(interactionRate);
// <VerificationBadge level={badge} />
// ════════════════════════════════════════════════════════════

export function createVerificationLevel(interactionRate) {
  if (!interactionRate || interactionRate < 80) {
    return null;
  }

  if (interactionRate >= 98) {
    return {
      name: 'موثق أخضر - 98%+',
      icon: '✓',
      color: '#00BA7C',
      level: 'green'
    };
  }

  if (interactionRate >= 90) {
    return {
      name: 'موثق ذهبي - 90%+',
      icon: '✓',
      color: '#FFD700',
      level: 'gold'
    };
  }

  return {
    name: 'موثق - 80%+',
    icon: '✓',
    color: '#1DA1F2',
    level: 'blue'
  };
}