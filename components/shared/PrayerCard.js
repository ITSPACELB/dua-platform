'use client'
import { useState } from 'react';
import VerificationBadge from './VerificationBadge';
import { quranQuotes } from '@/lib/quranQuotes';

// ════════════════════════════════════════════════════════════
// 🃏 بطاقة طلب الدعاء
// ════════════════════════════════════════════════════════════
// الميزات:
// - تصميم مختلف حسب النوع (عام، مريض، متوفى، جماعي)
// - إخفاء تلقائي بعد الدعاء (fade + slide up)
// - عرض خاص للمرضى: "مريض يطلب دعاءكم"
// - عداد الصلوات
// - شارة التوثيق
// - اقتباس قرآني
// ════════════════════════════════════════════════════════════

export default function PrayerCard({ request, onPray }) {
  // ═══════════════════════════════════════════════════════════
  // 🔧 الحالة
  // ═══════════════════════════════════════════════════════════
  const [isHiding, setIsHiding] = useState(false);
  const [isPraying, setIsPraying] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // 🎨 الألوان حسب النوع
  // ═══════════════════════════════════════════════════════════
  const typeColors = {
    general: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      button: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
      icon: '🤲'
    },
    sick: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      button: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      icon: '🏥'
    },
    deceased: {
      bg: 'bg-stone-50',
      border: 'border-stone-300',
      text: 'text-stone-800',
      button: 'from-stone-500 to-stone-600 hover:from-stone-600 hover:to-stone-700',
      icon: '🕊️'
    },
    collective: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      button: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
      icon: '⭐'
    }
  };

  const colors = typeColors[request.type] || typeColors.general;

  // ═══════════════════════════════════════════════════════════
  // 📖 الحصول على الاقتباس القرآني
  // ═══════════════════════════════════════════════════════════
  const quote = quranQuotes[request.type] || quranQuotes.general;

  // ═══════════════════════════════════════════════════════════
  // 🏥 عرض خاص للمرضى
  // ═══════════════════════════════════════════════════════════
  const getDisplayName = () => {
    if (request.type === 'sick') {
      if (request.displayName && request.displayName !== 'مجهول') {
        return `${colors.icon} مريض يطلب دعاءكم - ${request.displayName}`;
      }
      return `${colors.icon} مريض يطلب دعاءكم`;
    }
    
    if (request.displayName && request.displayName !== 'مجهول') {
      return `${colors.icon} ${request.displayName}`;
    }
    
    return `${colors.icon} شخص يطلب دعاءكم`;
  };

  // ═══════════════════════════════════════════════════════════
  // ⏰ حساب الوقت المنقضي
  // ═══════════════════════════════════════════════════════════
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `منذ ${mins} ${mins === 1 ? 'دقيقة' : mins === 2 ? 'دقيقتين' : 'دقائق'}`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `منذ ${hours} ${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتين' : 'ساعات'}`;
    }
    const days = Math.floor(diffInSeconds / 86400);
    return `منذ ${days} ${days === 1 ? 'يوم' : days === 2 ? 'يومين' : 'أيام'}`;
  };

  // ═══════════════════════════════════════════════════════════
  // 🔢 تنسيق عدد الصلوات
  // ═══════════════════════════════════════════════════════════
  const formatPrayerCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}م`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}ألف`;
    }
    return count.toString();
  };

  // ═══════════════════════════════════════════════════════════
  // 🤲 معالجة الدعاء
  // ═══════════════════════════════════════════════════════════
  const handlePray = async () => {
    if (isPraying || request.hasPrayed) return;

    setIsPraying(true);

    try {
      await onPray(request.id);
      
      // بدء أنيميشن الإخفاء
      setIsHiding(true);
      
      // إزالة البطاقة بعد انتهاء الأنيميشن
      setTimeout(() => {
        // يمكن إضافة callback هنا لإزالة البطاقة من القائمة
      }, 500);
      
    } catch (error) {
      console.error('Error praying:', error);
      setIsPraying(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 🎖️ الحصول على مستوى التوثيق
  // ═══════════════════════════════════════════════════════════
  const getVerificationLevel = () => {
    if (!request.verificationLevel) return null;
    
    const levels = {
      blue: { name: 'موثق - 80%+', icon: '✓', color: '#1DA1F2' },
      gold: { name: 'موثق ذهبي - 90%+', icon: '✓', color: '#FFD700' },
      green: { name: 'موثق أخضر - 98%+', icon: '✓', color: '#00BA7C' }
    };
    
    return levels[request.verificationLevel];
  };

  const verificationLevel = getVerificationLevel();

  // ═══════════════════════════════════════════════════════════
  // 🎨 واجهة المستخدم
  // ═══════════════════════════════════════════════════════════
  return (
    <div
      className={`
        ${colors.bg} ${colors.border}
        border-2 rounded-2xl p-8 shadow-lg
        transition-all duration-500
        ${isHiding ? 'animate-fade-out translate-y-4 opacity-0' : 'animate-slide-down'}
        ${request.hasPrayed ? 'opacity-75' : 'hover:shadow-xl hover:scale-[1.01]'}
      `}
    >
      {/* ═══════════════════════════════════════════════════════ */}
      {/* الرأس: الاسم + الوقت */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <h3 className={`text-2xl font-bold ${colors.text}`}>
            {getDisplayName()}
          </h3>
          {verificationLevel && (
            <VerificationBadge level={verificationLevel} />
          )}
        </div>
        <span className="text-sm text-stone-500 whitespace-nowrap">
          {getTimeAgo(request.timestamp)}
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* معلومات إضافية للمتوفى */}
      {/* ═══════════════════════════════════════════════════════ */}
      {request.type === 'deceased' && request.relation && (
        <div className="mb-4">
          <span className={`text-lg ${colors.text}`}>
            {request.relation} • {request.motherName ? `ابن/ة ${request.motherName}` : ''}
          </span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* معلومات الدعاء الجماعي */}
      {/* ═══════════════════════════════════════════════════════ */}
      {request.type === 'collective' && request.scheduledDate && (
        <div className={`mb-4 p-4 bg-white/50 rounded-xl border ${colors.border}`}>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span>📅</span>
            <span>{new Date(request.scheduledDate).toLocaleDateString('ar-SA')}</span>
            <span>•</span>
            <span>⏰</span>
            <span>{request.scheduledTime}</span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* الاقتباس القرآني */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="mb-6 p-4 bg-white/50 rounded-xl">
        <p className={`text-lg font-semibold ${colors.text} mb-1`}>
          {quote.text}
        </p>
        <p className="text-sm text-stone-600">
          {quote.source}
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* الإحصائيات */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤲</span>
          <span className="text-lg font-bold text-stone-700">
            {formatPrayerCount(request.prayerCount || 0)}
          </span>
          <span className="text-sm text-stone-600">دعاء</span>
        </div>

        {request.type === 'collective' && request.participants && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <span className="text-lg font-bold text-stone-700">
              {formatPrayerCount(request.participants)}
            </span>
            <span className="text-sm text-stone-600">مشارك</span>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* زر الدعاء */}
      {/* ═══════════════════════════════════════════════════════ */}
      <button
        onClick={handlePray}
        disabled={request.hasPrayed || isPraying}
        className={`
          w-full h-14 
          bg-gradient-to-r ${colors.button}
          text-white text-xl font-bold rounded-xl
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-md hover:shadow-lg
          flex items-center justify-center gap-2
        `}
      >
        {request.hasPrayed ? (
          <>
            <span className="text-2xl">✅</span>
            <span>تم الدعاء</span>
          </>
        ) : isPraying ? (
          <>
            <span className="text-2xl animate-spin">⏳</span>
            <span>جاري الدعاء...</span>
          </>
        ) : (
          <>
            <span className="text-2xl">🤲</span>
            <span>
              {request.type === 'collective' ? 'سأشارك في الدعاء' : 'ادعُ الآن'}
            </span>
          </>
        )}
      </button>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* رسالة بعد الدعاء */}
      {/* ═══════════════════════════════════════════════════════ */}
      {request.hasPrayed && (
        <div className="mt-4 p-3 bg-white/70 rounded-xl text-center">
          <p className="text-base font-semibold text-emerald-700">
            ✨ جزاك الله خيراً على دعائك
          </p>
        </div>
      )}
    </div>
  );
}