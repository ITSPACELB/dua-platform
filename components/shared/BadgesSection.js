'use client'
import { useState } from 'react';

/**
 * قسم عرض شارات التوثيق
 * يشرح كيفية الحصول على الشارات والمزايا
 * تصميم جذاب وواضح لتحفيز المستخدمين
 */
export default function BadgesSection() {
  // ============================================================================
  // 📊 بيانات الشارات
  // ============================================================================
  const badges = [
    {
      id: 'blue',
      name: 'التوثيق الأزرق',
      icon: '🔵',
      percentage: 80,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      benefits: [
        'ظهور اسمك بشارة زرقاء',
        'أولوية في عرض طلباتك',
        'إمكانية إرسال طلبين في اليوم'
      ],
      requirements: [
        'نسبة تفاعل 80% أو أكثر',
        'الدعاء لـ 50 طلب على الأقل',
        'عدم تجاوز الحدود الزمنية'
      ]
    },
    {
      id: 'green',
      name: 'التوثيق الأخضر',
      icon: '🟢',
      percentage: 90,
      color: 'emerald',
      gradient: 'from-emerald-500 to-emerald-600',
      benefits: [
        'شارة خضراء مميزة',
        'إمكانية الدعاء الجماعي',
        'أولوية قصوى في العرض',
        'ثلاثة طلبات يومياً'
      ],
      requirements: [
        'نسبة تفاعل 90% أو أكثر',
        'الدعاء لـ 200 طلب على الأقل',
        'استمرارية لمدة شهر'
      ]
    },
    {
      id: 'gold',
      name: 'التوثيق الذهبي',
      icon: '👑',
      percentage: 98,
      color: 'amber',
      gradient: 'from-amber-500 to-amber-600',
      benefits: [
        'شارة ذهبية حصرية',
        'ميزة الدعاء الخاص',
        'إرسال دعاء لشخص محدد',
        'أولوية VIP',
        'طلبات غير محدودة'
      ],
      requirements: [
        'نسبة تفاعل 98% أو أكثر',
        'الدعاء لـ 500 طلب على الأقل',
        'استمرارية لمدة 3 أشهر',
        'سجل نظيف بدون مخالفات'
      ]
    }
  ];

  const [expandedBadge, setExpandedBadge] = useState(null);

  // ============================================================================
  // 🎯 توسيع/طي تفاصيل الشارة
  // ============================================================================
  const toggleBadge = (badgeId) => {
    setExpandedBadge(expandedBadge === badgeId ? null : badgeId);
  };

  // ============================================================================
  // 🎨 واجهة المستخدم
  // ============================================================================
  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-lg">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-center border-b-4 border-purple-800">
        <h2 className="text-white font-bold text-3xl mb-2">
          🏆 شارات التوثيق
        </h2>
        <p className="text-white text-xl opacity-90">
          احصل على شارات حصرية ومزايا إضافية
        </p>
      </div>

      <div className="p-8 space-y-6">
        
        {/* مقدمة */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6 text-center">
          <p className="text-xl text-stone-700 leading-relaxed">
            <strong className="text-purple-700">شارات التوثيق</strong> تُمنح للمستخدمين المميزين الذين يحافظون على نسبة تفاعل عالية ويساهمون في دعم المؤمنين
          </p>
        </div>

        {/* البطاقات */}
        <div className="space-y-5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`border-4 rounded-2xl overflow-hidden transition-all ${
                expandedBadge === badge.id 
                  ? `border-${badge.color}-400 shadow-2xl` 
                  : `border-${badge.color}-200 hover:border-${badge.color}-300 shadow-md`
              }`}
            >
              {/* رأس البطاقة */}
              <button
                onClick={() => toggleBadge(badge.id)}
                className={`w-full p-6 bg-gradient-to-r ${badge.gradient} text-white transition-all hover:brightness-110`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{badge.icon}</span>
                    <div className="text-right">
                      <h3 className="text-2xl font-bold">{badge.name}</h3>
                      <p className="text-lg opacity-90">
                        نسبة التفاعل: {badge.percentage}٪ فأكثر
                      </p>
                    </div>
                  </div>
                  <span className="text-4xl transition-transform" style={{
                    transform: expandedBadge === badge.id ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>
                    ⬇️
                  </span>
                </div>
              </button>

              {/* محتوى البطاقة المفصل */}
              {expandedBadge === badge.id && (
                <div className="p-6 bg-white space-y-6">
                  
                  {/* المزايا */}
                  <div>
                    <h4 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                      ✨ المزايا
                    </h4>
                    <div className="space-y-3">
                      {badge.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-3 p-4 bg-${badge.color}-50 border-2 border-${badge.color}-200 rounded-xl`}
                        >
                          <span className="text-2xl">✓</span>
                          <p className="text-lg text-stone-700 flex-1">{benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* الشروط */}
                  <div>
                    <h4 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                      📋 الشروط
                    </h4>
                    <div className="space-y-3">
                      {badge.requirements.map((requirement, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 bg-stone-50 border-2 border-stone-200 rounded-xl"
                        >
                          <span className="text-2xl">•</span>
                          <p className="text-lg text-stone-700 flex-1">{requirement}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* زر الحث */}
                  <div className={`bg-gradient-to-r ${badge.gradient} p-6 rounded-xl text-center`}>
                    <p className="text-white text-xl font-bold mb-3">
                      هل تريد الحصول على {badge.name}؟
                    </p>
                    <p className="text-white text-lg opacity-90">
                      استمر في الدعاء للمؤمنين وحافظ على نسبة تفاعل عالية!
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* نصيحة ختامية */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-6 text-center">
          <p className="text-xl text-stone-700 leading-relaxed">
            💡 <strong>نصيحة:</strong> نسبة التفاعل تُحسب بناءً على عدد الطلبات التي دعوت لها مقارنة بالطلبات التي شاهدتها
          </p>
        </div>
      </div>
    </div>
  );
}