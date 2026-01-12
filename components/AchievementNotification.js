'use client';

import { useState, useEffect } from 'react';

/**
 * 📖 دالة مساعدة لاختيار آية مناسبة حسب نوع الإنجاز
 */
function getMotivationalVerse(achievementType) {
  const verses = {
    name_display: {
      text: 'وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ',
      reference: 'الضحى: 11'
    },
    double_prayer: {
      text: 'وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ',
      reference: 'غافر: 60'
    },
    verse_selection: {
      text: 'إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ',
      reference: 'الإسراء: 9'
    },
    points_bonus: {
      text: 'إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ',
      reference: 'التوبة: 120'
    },
    lottery_win: {
      text: 'وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ',
      reference: 'المطففين: 26'
    },
    achievement_milestone: {
      text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا * إِنَّ مَعَ الْعُسْرِ يُسْرًا',
      reference: 'الشرح: 5-6'
    },
    default: {
      text: 'وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ',
      reference: 'الضحى: 11'
    }
  };

  return verses[achievementType] || verses.default;
}

/**
 * 🎊 رسائل التهنئة المتنوعة حسب النجوم
 */
function getCongratulationMessage(stars) {
  const messages = {
    1: ['مبروك!', 'أحسنت!', 'ما شاء الله!'],
    2: ['مبروك!', 'رائع!', 'ممتاز!'],
    3: ['مبروك!', 'إنجاز عظيم!', 'ما شاء الله عليك!'],
    4: ['مبروك الإنجاز الأسطوري!', 'إنجاز استثنائي!', 'تفوق رائع!']
  };
  
  const messageList = messages[stars] || messages[1];
  return messageList[Math.floor(Math.random() * messageList.length)];
}

/**
 * 🎉 الإيموجي المناسب حسب النجوم
 */
function getEmoji(stars) {
  const emojis = {
    1: ['🎉', '✨', '🌟'],
    2: ['🎊', '💫', '⭐'],
    3: ['🏆', '👑', '💎'],
    4: ['🔥', '🎯', '🚀']
  };
  
  const emojiList = emojis[stars] || emojis[1];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

/**
 * 🎉 كومبوننت إشعارات الفوز بالإنجازات
 * يظهر بتصميم فخم عند فوز المستخدم بميزة
 */
export default function AchievementNotification({ achievement, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (achievement) {
      // تأخير بسيط لتفعيل الأنيميشن
      setTimeout(() => setIsVisible(true), 100);

      // إغلاق تلقائي بعد 8 ثواني
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!achievement) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible && !isExiting ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={handleClose}
    >
      <div
        className={`relative bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-500 ${
          isVisible && !isExiting 
            ? 'scale-100 translate-y-0' 
            : 'scale-75 translate-y-10'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* زخرفة علوية */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-gradient-to-r from-amber-400 to-amber-600 rounded-full p-4 shadow-xl">
            <span className="text-4xl">{achievement.icon}</span>
          </div>
        </div>

        {/* زر الإغلاق */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* المحتوى */}
        <div className="text-center mt-8">
          {/* عنوان التهنئة */}
          <div className="mb-4">
            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 mb-2">
              {getCongratulationMessage(achievement.stars)} {getEmoji(achievement.stars)}
            </h3>
            <div className="flex items-center justify-center gap-2 text-amber-500 text-2xl mb-2">
              {achievement.stars === 1 && '⭐'}
              {achievement.stars === 2 && '⭐⭐'}
              {achievement.stars === 3 && '⭐⭐⭐'}
              {achievement.stars === 4 && '⭐⭐⭐⭐'}
            </div>
          </div>

          {/* اسم الإنجاز */}
          <h4 className="text-2xl font-bold text-gray-800 mb-3">
            {achievement.name}
          </h4>

          {/* الوصف */}
          <p className="text-gray-600 text-lg mb-6 leading-relaxed">
            {achievement.description}
          </p>

          {/* المزايا */}
          {achievement.benefits && (
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-4 mb-6">
              <h5 className="text-sm font-semibold text-amber-800 mb-3">
                ✨ المزايا التي حصلت عليها:
              </h5>
              <ul className="space-y-2 text-right">
                {/* عرض الاسم */}
                {achievement.benefits.displayInMostActive && (
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>يظهر اسمك في "الأكثر تفاعلاً" لمدة {achievement.benefits.displayDuration}</span>
                  </li>
                )}
                
                {/* الدعاء المضاعف */}
                {achievement.benefits.prayersPerDay && (
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>تستطيع الدعاء {achievement.benefits.prayersPerDay} مرات يومياً بدلاً من مرة واحدة</span>
                  </li>
                )}
                
                {/* اختيار الآية */}
                {achievement.benefits.canSelectVerse && (
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>اختر الآية القرآنية التي تريد أن يدعو بها الناس لمدة 30 يوماً</span>
                  </li>
                )}
                
                {/* نقاط إضافية (جديد) */}
                {achievement.benefits.bonusPoints && (
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>+{achievement.benefits.bonusPoints} نقاط إضافية في كل دعاء</span>
                  </li>
                )}
                
                {/* مضاعف النقاط (جديد) */}
                {achievement.benefits.pointsMultiplier && (
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>مضاعف النقاط: ×{achievement.benefits.pointsMultiplier}</span>
                  </li>
                )}
                
                {/* تقليل Cooldown (جديد) */}
                {achievement.benefits.reducedCooldown && (
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>فترة انتظار أقل بين الجوائز</span>
                  </li>
                )}
                
                {/* أولوية في القرعة (جديد) */}
                {achievement.benefits.lotteryPriority && (
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>أولوية أعلى في القرعة اليومية</span>
                  </li>
                )}
                
                {/* فرص إضافية (جديد) */}
                {achievement.benefits.extraChances && (
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>+{achievement.benefits.extraChances} فرص إضافية في القرعة</span>
                  </li>
                )}
                
                {/* المدة */}
                {achievement.benefits.duration && (
                  <li className="text-gray-700 flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span className="font-semibold text-purple-700">صالحة لمدة {achievement.benefits.duration}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* آية قرآنية */}
          <div className="border-t-2 border-amber-200 pt-4">
            <p className="text-amber-700 text-lg font-semibold mb-2">
              "{getMotivationalVerse(achievement.type).text}"
            </p>
            <p className="text-gray-500 text-sm">
              {getMotivationalVerse(achievement.type).reference}
            </p>
          </div>

          {/* زر الإغلاق */}
          <button
            onClick={handleClose}
            className="mt-6 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-3 px-6 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            الحمد لله ✨
          </button>
        </div>

        {/* زخارف جانبية */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200 rounded-full opacity-20 -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-300 rounded-full opacity-20 -ml-12 -mb-12"></div>
      </div>
    </div>
  );
}

/**
 * 🔔 كومبوننت إشعار صغير (Toast)
 * للإشعارات السريعة والبسيطة
 */
export function AchievementToast({ message, type = 'success', onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const colors = {
    success: 'from-green-500 to-green-600',
    info: 'from-blue-500 to-blue-600',
    warning: 'from-amber-500 to-amber-600',
    error: 'from-red-500 to-red-600',
    achievement: 'from-purple-500 to-purple-600',
    lottery: 'from-pink-500 to-pink-600',
    points: 'from-indigo-500 to-indigo-600'
  };

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`bg-gradient-to-r ${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md`}>
        <span className="text-2xl">
          {type === 'success' && '✓'}
          {type === 'info' && 'ℹ️'}
          {type === 'warning' && '⚠️'}
          {type === 'error' && '✕'}
          {type === 'achievement' && '⭐'}
          {type === 'lottery' && '🎲'}
          {type === 'points' && '💫'}
        </span>
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose && onClose(), 300);
          }}
          className="text-white hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * 🎊 كومبوننت رسالة تحفيزية للترقية
 */
export function UpgradePrompt({ upgradeInfo, onClose, onUpgrade }) {
  if (!upgradeInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 z-40 max-w-md mx-auto">
      <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl shadow-2xl p-6 border-2 border-purple-200">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute top-2 left-2 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* المحتوى */}
        <div className="text-center">
          <div className="text-3xl mb-2">{upgradeInfo.title}</div>
          <p className="text-gray-700 text-lg mb-4 leading-relaxed">
            {upgradeInfo.message}
          </p>

          {/* المزايا */}
          <div className="bg-purple-50 rounded-xl p-4 mb-4 text-right">
            <h5 className="text-sm font-semibold text-purple-800 mb-2">
              ماذا ستحصل:
            </h5>
            <ul className="space-y-1.5">
              {upgradeInfo.benefits.map((benefit, index) => (
                <li key={index} className="text-gray-700 text-sm flex items-start gap-2">
                  <span className="text-purple-600">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* الأزرار */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              لاحقاً
            </button>
            <button
              onClick={onUpgrade}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-2.5 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {upgradeInfo.action}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 🎲 إشعار خاص للفوز في القرعة
 */
export function LotteryWinNotification({ winner, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (winner) {
      setTimeout(() => setIsVisible(true), 100);
      
      // إنشاء كونفيتي
      const newConfetti = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2
      }));
      setConfetti(newConfetti);

      const timer = setTimeout(() => {
        handleClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [winner]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!winner) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible && !isExiting ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)'
      }}
      onClick={handleClose}
    >
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map(item => (
          <div
            key={item.id}
            className="absolute text-2xl"
            style={{
              left: `${item.left}%`,
              top: '-20px',
              animation: `fall ${item.duration}s linear ${item.delay}s infinite`
            }}
          >
            {['🎉', '⭐', '✨', '🎊', '💫'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      <div
        className={`relative bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 rounded-3xl shadow-2xl max-w-lg w-full p-8 transform transition-all duration-500 border-4 border-amber-400 ${
          isVisible && !isExiting 
            ? 'scale-100 rotate-0' 
            : 'scale-75 rotate-12'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* الأيقونة */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-gradient-to-r from-amber-400 to-amber-600 rounded-full p-6 shadow-2xl animate-pulse">
            <span className="text-5xl">🎲</span>
          </div>
        </div>

        {/* المحتوى */}
        <div className="text-center mt-12 text-white">
          <h3 className="text-4xl font-bold mb-4 animate-bounce">
            مبروك الفوز! 🎉
          </h3>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 mb-6 backdrop-blur-sm">
            <p className="text-2xl font-bold mb-2">
              {winner.displayName || winner.name}
            </p>
            <p className="text-lg text-amber-300">
              فزت في القرعة اليومية!
            </p>
          </div>

          <div className="bg-amber-500 bg-opacity-20 rounded-xl p-4 mb-6">
            <p className="text-lg mb-2 font-semibold">✨ المكافأة:</p>
            <p className="text-amber-200">
              ⭐ نجمة واحدة + عرض اسمك لمدة 24 ساعة
            </p>
          </div>

          <div className="border-t-2 border-white border-opacity-20 pt-4 mb-6">
            <p className="text-amber-300 text-lg font-semibold mb-2">
              "وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ"
            </p>
            <p className="text-white text-opacity-70 text-sm">
              المطففين: 26
            </p>
          </div>

          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-purple-900 font-bold py-4 px-6 rounded-xl hover:from-amber-300 hover:to-amber-500 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
          >
            الحمد لله! ✨
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}