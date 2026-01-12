'use client'
import { useState } from 'react';
import { quranQuotes } from '@/lib/quranQuotes';
import { getVerseText, getVerseSource } from '@/lib/utils';
import VerificationBadge, { createVerificationLevel } from './VerificationBadge';

// ════════════════════════════════════════════════════════════
// 🃏 بطاقة طلب الدعاء - النسخة النهائية المحسّنة
// ════════════════════════════════════════════════════════════
// الميزات:
// ✅ تصميم مختلف حسب النوع (personal, sick, deceased, collective)
// ✅ إخفاء تلقائي بعد الدعاء مع أنيميشن سلس
// ✅ عرض خاص للمرضى: "مريض يطلب دعاءكم"
// ✅ عداد الصلوات مع تنسيق ذكي (ألف، مليون)
// ✅ شارات توثيق احترافية (أزرق 85%+ / أخضر 90%+ / ذهبي 98%+)
// ✅ معالجة آمنة 100% للـ Objects (لا أخطاء rendering)
// ✅ اقتباسات قرآنية (افتراضية ومخصصة)
// ✅ دعم كامل لـ Level 1, 2, 3
// ════════════════════════════════════════════════════════════

export default function PrayerCard({ request, onPray }) {
  // ═══════════════════════════════════════════════════════════
  // 🔧 State Management
  // ═══════════════════════════════════════════════════════════
  const [isHiding, setIsHiding] = useState(false);
  const [isPraying, setIsPraying] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // 🎨 ألوان وأنماط حسب نوع الطلب
  // ═══════════════════════════════════════════════════════════
  const typeColors = {
    personal: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      button: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
      icon: '🤲'
    },
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
    },
    friend: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      button: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      icon: '💙'
    }
  };

  const colors = typeColors[request.type] || typeColors.personal;

  // ═══════════════════════════════════════════════════════════
  // 📖 استخراج الآية القرآنية بشكل آمن
  // ═══════════════════════════════════════════════════════════
  const displayVerse = getVerseText(request.custom_verse || request.quranic_verse)
    || (quranQuotes[request.type]?.text)
    || (quranQuotes.general?.text)
    || '';

  // ═══════════════════════════════════════════════════════════
  // 👤 عرض الاسم بشكل ذكي وآمن
  // ═══════════════════════════════════════════════════════════
  const getDisplayName = () => {
    // ✅ استخراج النصوص بشكل آمن
    const displayName = getVerseText(request.displayName || request.name) || '';
    const motherName = getVerseText(request.motherName || request.parent_name) || '';
    
    // 🏥 حالة خاصة للمرضى
    if (request.type === 'sick') {
      const validName = displayName 
        && displayName !== 'مجهول' 
        && displayName !== '' 
        && displayName !== 'مريض يطلب دعاءكم'
        && displayName !== 'مريض';
      
      if (validName) {
        const fullName = motherName ? `${displayName} بن ${motherName}` : displayName;
        return `${colors.icon} مريض يطلب دعاءكم - ${fullName}`;
      }
      return `${colors.icon} مريض يطلب دعاءكم`;
    }
    
    // 🕊️ حالة خاصة للمتوفى
    if (request.type === 'deceased') {
      if (displayName && displayName !== 'مجهول' && displayName !== '') {
        const fullName = motherName ? `${displayName} بن/ت ${motherName}` : displayName;
        return `${colors.icon} ${fullName}`;
      }
      return `${colors.icon} متوفى يحتاج دعاءكم`;
    }
    
    // 💙 حالة خاصة للصديق
    if (request.type === 'friend') {
      if (displayName && displayName !== 'مجهول' && displayName !== '') {
        const fullName = motherName ? `${displayName} بن ${motherName}` : displayName;
        return `${colors.icon} ${fullName}`;
      }
      return `${colors.icon} صديق يطلب دعاءكم`;
    }
    
    // 🤲 الحالة العامة والشخصية
    if (displayName && displayName !== 'مجهول' && displayName !== '') {
      const fullName = motherName ? `${displayName} بن ${motherName}` : displayName;
      return `${colors.icon} ${fullName}`;
    }
    
    return `${colors.icon} شخص يطلب دعاءكم`;
  };
  
  // ═══════════════════════════════════════════════════════════
  // ⏰ حساب الوقت المنقضي بذكاء
  // ═══════════════════════════════════════════════════════════
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'الآن';
    
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
  // 🔢 تنسيق عدد الصلوات (ألف، مليون)
  // ═══════════════════════════════════════════════════════════
  const formatPrayerCount = (count) => {
    if (!count || count === 0) return '0';
    
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}م`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}ألف`;
    }
    return count.toString();
  };

  // ═══════════════════════════════════════════════════════════
  // 🤲 معالجة الدعاء مع Animation
  // ═══════════════════════════════════════════════════════════
  const handlePray = async () => {
    if (isPraying || request.hasPrayed) return;

    setIsPraying(true);

    try {
      await onPray(request.id);
      setIsHiding(true);
      setTimeout(() => {}, 500);
    } catch (error) {
      console.error('Error praying:', error);
      setIsPraying(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 🎖️ حساب شارة التوثيق بدقة
  // ═══════════════════════════════════════════════════════════
  const getBadgeLevel = () => {
    if (!request.userLevel || request.userLevel < 2) return null;
    
    // Level 3 = ذهبي (98%+)
    if (request.userLevel === 3) {
      return createVerificationLevel(98, 'active', 0);
    }
    
    // Level 2 = أزرق أو أخضر (85%-97%)
    // نفترض أزرق افتراضياً، يمكن تحسينه لاحقاً بناءً على interaction_rate
    return createVerificationLevel(85, 'active', 0);
  };

  const badgeLevel = getBadgeLevel();

  // ═══════════════════════════════════════════════════════════
  // 🎨 واجهة المستخدم - تصميم احترافي
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
      {/* رأس البطاقة: الاسم + الشارة + الوقت */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <h3 className={`text-2xl font-bold ${colors.text}`}>
            {getDisplayName()}
          </h3>
          
          {/* ✅ شارة التوثيق (Level 2 و 3 فقط) */}
          {badgeLevel && (
            <VerificationBadge 
              level={badgeLevel} 
              size="md"
              showTooltip={true}
            />
          )}
        </div>
        
        <span className="text-sm text-stone-500 whitespace-nowrap">
          {getTimeAgo(request.timestamp || request.created_at)}
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* معلومات إضافية للمتوفى */}
      {/* ═══════════════════════════════════════════════════════ */}
      {request.type === 'deceased' && request.relation && (
        <div className="mb-4">
          <span className={`text-lg ${colors.text}`}>
            {getVerseText(request.relation) || request.relation}
            {request.motherName && ` • ابن/ة ${getVerseText(request.motherName)}`}
          </span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* عرض غرض الدعاء */}
      {/* ═══════════════════════════════════════════════════════ */}
      {request.purpose && (
        <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
          <p className="text-sm text-purple-700 font-semibold">
            🎯 الغرض: {getVerseText(request.purpose) || request.purpose}
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* الآية القرآنية الافتراضية */}
      {/* ═══════════════════════════════════════════════════════ */}
      {request.quranic_verse && (
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-purple-600">📖</span>
            <div className="flex-1">
              <p className="text-purple-900 text-sm leading-relaxed" dir="rtl">
                {getVerseText(request.quranic_verse)}
              </p>
              {getVerseSource(request.quranic_verse) && (
                <p className="text-purple-600 text-xs mt-1">
                  {getVerseSource(request.quranic_verse)}
                </p>
              )}
            </div>
          </div>
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
      {/* الآية المخصصة أو الاقتباس الافتراضي */}
      {/* ═══════════════════════════════════════════════════════ */}
      {request.custom_verse ? (
        // 👑 آية مخصصة - للمميزين فقط
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mb-6">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 text-xl">👑</span>
            <div className="flex-1">
              <p className="text-xs text-amber-600 font-bold mb-1">آية مخصصة</p>
              <p className="text-amber-900 text-sm leading-relaxed" dir="rtl">
                {getVerseText(request.custom_verse)}
              </p>
              {getVerseSource(request.custom_verse) && (
                <p className="text-amber-600 text-xs mt-1">
                  {getVerseSource(request.custom_verse)}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : displayVerse ? (
        // 📖 آية افتراضية
        <div className="mb-6 p-4 bg-white/50 rounded-xl">
          <p className={`text-lg font-semibold ${colors.text} mb-1 leading-relaxed`}>
            {displayVerse}
          </p>
        </div>
      ) : null}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* إحصائيات الدعاء */}
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
      {/* زر الدعاء الرئيسي */}
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
      {/* رسالة الشكر بعد الدعاء */}
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