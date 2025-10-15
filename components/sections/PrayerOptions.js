'use client'
import { quranQuotes } from '@/lib/quranQuotes';

// ════════════════════════════════════════════════════════════
// 🎯 قسم خيارات الدعاء - البطاقات الأربعة العمودية
// ════════════════════════════════════════════════════════════
// التصميم:
// - 4 بطاقات عمودية (ليست 2×2 grid)
// - 40px gap بين البطاقات
// - كل بطاقة بلون مميز حسب النوع
// - اقتباسات قرآنية
// - الدعاء الجماعي مقفل حتى 95%+
// ════════════════════════════════════════════════════════════

export default function PrayerOptions({ onSelectOption, userStats }) {
  // ═══════════════════════════════════════════════════════════
  // 📋 خيارات الدعاء الأربعة
  // ═══════════════════════════════════════════════════════════
  const options = [
    {
      id: 'general',
      icon: '🤲',
      title: 'اطلب دعاء',
      quote: quranQuotes.response.text,
      source: quranQuotes.response.source,
      color: {
        bg: 'from-emerald-500 to-emerald-600',
        border: 'border-emerald-600',
        hover: 'hover:from-emerald-600 hover:to-emerald-700'
      },
      locked: false
    },
    {
      id: 'sick',
      icon: '🏥',
      title: 'لشفاء مريض',
      quote: quranQuotes.sick.verse.text,
      source: quranQuotes.sick.verse.source,
      color: {
        bg: 'from-blue-500 to-blue-600',
        border: 'border-blue-600',
        hover: 'hover:from-blue-600 hover:to-blue-700'
      },
      locked: false
    },
    {
      id: 'deceased',
      icon: '🕊️',
      title: 'لروح متوفى',
      quote: quranQuotes.deceased.text,
      source: quranQuotes.deceased.source,
      color: {
        bg: 'from-stone-500 to-stone-600',
        border: 'border-stone-600',
        hover: 'hover:from-stone-600 hover:to-stone-700'
      },
      locked: false
    },
    {
      id: 'collective',
      icon: '⭐',
      title: 'دعاء جماعي',
      quote: quranQuotes.collective.text,
      source: quranQuotes.collective.source,
      color: {
        bg: 'from-amber-500 to-amber-600',
        border: 'border-amber-600',
        hover: 'hover:from-amber-600 hover:to-amber-700'
      },
      locked: userStats?.interactionRate < 95,
      requirement: '95%+ تفاعل'
    }
  ];

  // ═══════════════════════════════════════════════════════════
  // 🎨 واجهة المستخدم
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-10">
      {/* العنوان */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-stone-800 mb-3">
          🤲 ماذا تريد أن تفعل؟
        </h2>
        <p className="text-xl text-stone-600">
          اختر نوع الدعاء الذي تريده
        </p>
      </div>

      {/* البطاقات */}
      <div className="space-y-10">
        {options.map((option) => (
          <div key={option.id} className="relative">
            {/* البطاقة */}
            <button
              onClick={() => !option.locked && onSelectOption(option.id)}
              disabled={option.locked}
              className={`
                w-full p-8 rounded-2xl border-2 ${option.color.border}
                bg-gradient-to-r ${option.color.bg}
                text-white shadow-lg
                transition-all duration-300
                ${option.locked 
                  ? 'opacity-60 cursor-not-allowed' 
                  : `${option.color.hover} hover:shadow-xl hover:scale-[1.01] cursor-pointer`
                }
              `}
            >
              <div className="text-center">
                {/* الأيقونة */}
                <div className="text-6xl mb-4">{option.icon}</div>
                
                {/* العنوان */}
                <h3 className="text-3xl font-bold mb-4">{option.title}</h3>
                
                {/* الاقتباس القرآني */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mb-4">
                  <p className="text-xl font-semibold mb-2 leading-relaxed">
                    {option.quote}
                  </p>
                  <p className="text-sm text-white/80">
                    {option.source}
                  </p>
                </div>
                
                {/* زر/حالة */}
                {option.locked ? (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-3xl">🔒</span>
                      <span className="text-xl font-bold">مقفل</span>
                    </div>
                    <p className="text-base text-white/90">
                      يتطلب {option.requirement} للفتح
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 text-xl font-bold">
                    <span className="text-2xl">👉</span>
                    <span>اضغط هنا</span>
                  </div>
                )}
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* ملاحظة للدعاء الجماعي */}
      {userStats && userStats.interactionRate < 95 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">💡</div>
          <h4 className="text-2xl font-bold text-amber-900 mb-2">
            كيف أفتح الدعاء الجماعي؟
          </h4>
          <p className="text-lg text-amber-800 mb-4">
            نسبة تفاعلك الحالية: <span className="font-bold">{userStats.interactionRate.toFixed(1)}%</span>
          </p>
          <p className="text-base text-amber-700">
            استمر في الدعاء للآخرين حتى تصل إلى 95%+ لفتح ميزة الدعاء الجماعي ⭐
          </p>
        </div>
      )}
    </div>
  );
}