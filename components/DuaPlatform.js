'use client'
import { useState, useEffect } from 'react';
import { Users, Heart, Menu, X, Star, TrendingUp, Award, Share2, Download, BookOpen, Info, HelpCircle, Bell } from 'lucide-react';
import AchievementNotification, { AchievementToast, UpgradePrompt } from './AchievementNotification';
import { 
  getUserStatus, 
  shouldShowFingerprintPrompt,
  dismissFingerprintPrompt,
  saveFingerprint,
  getOrCreateFingerprint
} from '@/lib/deviceFingerprint';

// ============================================================================
// 📖 الآيات القرآنية المخصصة
// ============================================================================
const quranVerses = {
  // آية رئيسية للصفحة
  main: {
    text: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ',
    subtitle: 'الله قريب... يسمعك الآن'
  },
  
  // آيات لكل نوع دعاء
  personal: {
    text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    subtitle: 'دعاؤك يُستجاب بإذن الله'
  },
  friend: {
    text: 'وَالَّذِينَ جَاءُوا مِن بَعْدِهِمْ يَقُولُونَ رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا',
    subtitle: 'الدعاء لأخيك المسلم مستجاب'
  },
  deceased: {
    text: 'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ',
    subtitle: 'رحمة الله واسعة'
  },
  sick: {
    text: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',
    subtitle: 'الشفاء بيد الله وحده'
  }
};

// ============================================================================
// 🎯 أغراض الدعاء القرآنية
// ============================================================================
const prayerPurposes = {
  general: [
    'الرزق', 'الزواج', 'الفرج', 'الذرية الصالحة', 'النصر', 'الحفظ',
    'البركة', 'القوة', 'الهداية', 'التوفيق', 'السكينة', 'الصبر',
    'العلم', 'الحكمة', 'القبول', 'التيسير', 'الأمان', 'الستر'
  ],
  deceased: [
    'المغفرة', 'الرحمة', 'الجنة', 'النور في القبر', 'الفسحة', 'رفع الدرجات'
  ],
  sick: [
    'الشفاء العاجل', 'رفع البلاء', 'العافية', 'السلامة'
  ]
};

// ============================================================================
// 💬 الرسائل التشجيعية
// ============================================================================
const encouragingMessages = [
  '"وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ"\nدعاؤك مستجاب بإذن الله',
  'الملائكة تدعو لك بمثل ما تدعو لأخيك\n"آمين، ولك بمثل"',
  '"وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ"\nالله معك الآن... يسمعك',
  'الدعاء للغير بظهر الغيب\nمن أعظم القربات',
  '"إِنَّ رَبِّي لَسَمِيعُ الدُّعَاءِ"\nربك يسمعك الآن'
];

export default function DuaPlatform() {
  // ============================================================================
  // 🎨 الحالات الأساسية
  // ============================================================================
  const [showWelcome, setShowWelcome] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showPrayerForm, setShowPrayerForm] = useState(false);
  const [selectedPrayerType, setSelectedPrayerType] = useState('personal');
  
  // ============================================================================
  // 🏆 حالات الإنجازات
  // ============================================================================
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [upgradePromptInfo, setUpgradePromptInfo] = useState(null);
  
  // ============================================================================
  // 🔐 حالات البصمة (المرحلة 7)
  // ============================================================================
  const [showFingerprintPrompt, setShowFingerprintPrompt] = useState(false);
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  
  // ============================================================================
  // 🔔 حالات الإشعارات (المرحلة 8 - جديد)
  // ============================================================================
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // ============================================================================
  // 📊 البيانات من API
  // ============================================================================
  const [stats, setStats] = useState({
    believersCount: 0,
    todayPrayers: 0,
    activeRequests: 0
  });
  const [banner, setBanner] = useState(null);
  const [topActiveUsers, setTopActiveUsers] = useState([]);
  const [collectivePrayer, setCollectivePrayer] = useState(null);
  const [awareness, setAwareness] = useState(null);
  const [prayerRequests, setPrayerRequests] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [selectedVerse, setSelectedVerse] = useState(null);
  
  // ============================================================================
  // 📝 نموذج طلب الدعاء
  // ============================================================================
  const [prayerForm, setPrayerForm] = useState({
    type: 'personal',
    name: '',
    motherOrFatherName: '',
    purpose: '',
    isMotherName: true
  });

  // ============================================================================
  // ⏱️ شاشة السلام عليكم الافتتاحية
  // ============================================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // ============================================================================
  // 📡 تحميل البيانات من API
  // ============================================================================
  useEffect(() => {
    if (!showWelcome) {
      loadData();
      checkFingerprintSettings();
      loadNotifications();
      initOneSignal();
    }
  }, [showWelcome]);

  // ============================================================================
  // 🔔 تهيئة OneSignal (المرحلة 8 - جديد)
  // ============================================================================
  const initOneSignal = async () => {
    try {
      // التحقق من دعم المتصفح للإشعارات
      if (!('Notification' in window)) {
        console.log('Browser does not support notifications');
        return;
      }

      // تحميل OneSignal SDK
      if (typeof window !== 'undefined' && window.OneSignal) {
        await window.OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: false, // نستخدم جرسنا الخاص
          },
        });

        // الاشتراك في الإشعارات
        window.OneSignal.showSlidedownPrompt();
        
        // حفظ player ID
        const userId = await window.OneSignal.getUserId();
        if (userId) {
          await saveOneSignalId(userId);
        }

        // الاستماع للإشعارات الجديدة
        window.OneSignal.on('notificationDisplay', function(event) {
          loadNotifications();
        });
      }
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
    }
  };

  // ============================================================================
  // 📬 حفظ OneSignal Player ID (المرحلة 8 - جديد)
  // ============================================================================
  const saveOneSignalId = async (playerId) => {
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-fingerprint': generateFingerprint()
        },
        body: JSON.stringify({ playerId })
      });
    } catch (error) {
      console.error('Error saving OneSignal ID:', error);
    }
  };

  // ============================================================================
  // 📬 تحميل الإشعارات (المرحلة 8 - جديد)
  // ============================================================================
  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'x-device-fingerprint': generateFingerprint()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // ============================================================================
  // ✅ تحديد إشعار كمقروء (المرحلة 8 - جديد)
  // ============================================================================
  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'x-device-fingerprint': generateFingerprint()
        }
      });
      
      // تحديث الحالة المحلية
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // ============================================================================
  // 🔐 فحص إعدادات البصمة (المرحلة 7)
  // ============================================================================
  const checkFingerprintSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings?key=fingerprintEnabled');
      if (response.ok) {
        const data = await response.json();
        const enabled = data.settings?.fingerprintEnabled || false;
        setFingerprintEnabled(enabled);
        
        // إذا كانت مفعلة والمستخدم لم يحفظ بصمته
        if (enabled && shouldShowFingerprintPrompt()) {
          setTimeout(() => {
            setShowFingerprintPrompt(true);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error checking fingerprint settings:', error);
    }
  };

  const loadData = async () => {
    try {
      // جلب الإحصائيات والإعدادات
      const response = await fetch('/api/stats', {
        headers: {
          'x-device-fingerprint': generateFingerprint()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.stats) {
          setStats({
            believersCount: data.stats.believersCount || 0,
            todayPrayers: data.stats.todayPrayers || 0,
            activeRequests: data.stats.activeRequests || 0
          });
          
          if (data.stats.banner) setBanner(data.stats.banner);
          if (data.stats.topActiveUsers) setTopActiveUsers(data.stats.topActiveUsers);
          if (data.stats.collectivePrayer) setCollectivePrayer(data.stats.collectivePrayer);
          if (data.stats.userStats) {
            setUserStats(data.stats.userStats);
            
            // التحقق من الإنجازات الجديدة
            checkForNewAchievements(data.stats.userStats);
          }
        }
      }

      // جلب طلبات الدعاء النشطة
      const requestsResponse = await fetch('/api/prayers');
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        if (requestsData.requests) {
          setPrayerRequests(requestsData.requests);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // ============================================================================
  // 🎉 التحقق من الإنجازات الجديدة
  // ============================================================================
  const checkForNewAchievements = (stats) => {
    if (!stats || !stats.activeAchievements) return;

    const newAchievement = stats.activeAchievements.find(a => {
      // تحقق من أن الإنجاز جديد (خلال آخر دقيقة)
      const achievedDate = new Date(a.achieved_at || a.grantedAt);
      const now = new Date();
      const diffMinutes = (now - achievedDate) / (1000 * 60);
      return diffMinutes < 1;
    });

    if (newAchievement) {
      // عرض إشعار الإنجاز
      setCurrentAchievement({
        name: getAchievementName(newAchievement.achievement_type || newAchievement.achievementType),
        description: getAchievementDescription(newAchievement.achievement_type || newAchievement.achievementType),
        icon: getAchievementIcon(newAchievement.stars_earned || newAchievement.stars),
        stars: newAchievement.stars_earned || newAchievement.stars,
        benefits: getAchievementBenefits(newAchievement.achievement_type || newAchievement.achievementType)
      });
    }
  };

  const getAchievementName = (type) => {
    const names = {
      'first_prayer': 'الدعوة الأولى',
      'prayers_10': '10 دعوات',
      'prayers_25': '25 دعوة',
      'prayers_50': '50 دعوة',
      'prayers_100': '100 دعوة',
      'prayers_365': 'دعاء كل يوم',
      'prayers_1000': '1000 دعوة',
      'level_upgrade': 'ترقية المستوى'
    };
    return names[type] || 'إنجاز جديد';
  };

  const getAchievementDescription = (type) => {
    const descriptions = {
      'first_prayer': 'بارك الله فيك! أول خطوة في رحلة الدعاء',
      'prayers_10': '10 دعوات صادقة ترفع إلى السماء',
      'prayers_25': '25 ملَك يستغفرون لك',
      'prayers_50': '50 ملَك يدعون لك',
      'prayers_100': '100 باب من الجنة تُفتح لك',
      'prayers_365': 'دعاء كل يوم - بشرى بالخير',
      'prayers_1000': 'ألف دعاء = ألف فرج',
      'level_upgrade': 'تمت ترقيتك لمستوى أعلى'
    };
    return descriptions[type] || 'تم تحقيق إنجاز جديد';
  };

  const getAchievementIcon = (stars) => {
    return '⭐'.repeat(stars);
  };

  const getAchievementBenefits = (type) => {
    const benefits = {
      'prayers_10': ['فرصة للظهور في "الأكثر تفاعلاً"'],
      'prayers_50': ['أولوية في عرض طلبات الدعاء', 'شارة مميزة'],
      'prayers_100': ['شارة ذهبية', 'ظهور دائم في القائمة'],
      'level_upgrade': ['مميزات جديدة', 'أولوية في الخدمات']
    };
    return benefits[type] || [];
  };

  // ============================================================================
  // 🤲 التفاعل مع الدعاء
  // ============================================================================
  const prayForRequest = async (requestId) => {
    try {
      const response = await fetch('/api/prayers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-fingerprint': generateFingerprint()
        },
        body: JSON.stringify({ requestId })
      });

      if (response.ok) {
        const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
        setToastMessage({
          message: randomMessage,
          type: 'success'
        });
        
        // إعادة تحميل البيانات
        loadData();
      }
    } catch (error) {
      console.error('Error praying:', error);
    }
  };

  const submitPrayerRequest = async () => {
    if (!prayerForm.name || !prayerForm.purpose) {
      setToastMessage({
        message: 'الرجاء إدخال الاسم والغرض',
        type: 'warning'
      });
      return;
    }

    // التحقق من الترقية
    if (prayerForm.motherOrFatherName && !userStats?.level) {
      setUpgradePromptInfo({
        from: 'زائر',
        to: 'جزئي',
        benefits: [
          'الدخول في القرعة اليومية',
          'فرصة للظهور في "الأكثر تفاعلاً"',
          'احتفاظ بإحصائياتك'
        ]
      });
    }

    try {
      const response = await fetch('/api/prayer-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-fingerprint': generateFingerprint()
        },
        body: JSON.stringify({
          type: prayerForm.type,
          name: prayerForm.name,
          motherOrFatherName: prayerForm.motherOrFatherName,
          isMotherName: prayerForm.isMotherName,
          purpose: prayerForm.purpose
        })
      });

      if (response.ok) {
        setToastMessage({
          message: '✅ تم إرسال طلبك بنجاح!\nالمؤمنون يدعون لك الآن',
          type: 'success'
        });
        setShowPrayerForm(false);
        setPrayerForm({
          type: 'personal',
          name: '',
          motherOrFatherName: '',
          purpose: '',
          isMotherName: true
        });
        loadData();
      }
    } catch (error) {
      console.error('Error submitting prayer request:', error);
      setToastMessage({
        message: 'حدث خطأ، حاول مرة أخرى',
        type: 'error'
      });
    }
  };

  // ============================================================================
  // 🔐 توليد البصمة
  // ============================================================================
  const generateFingerprint = () => {
    return getOrCreateFingerprint();
  };

  // ============================================================================
  // 🎬 شاشة الترحيب
  // ============================================================================
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="text-white text-8xl mb-6 font-bold" style={{ fontFamily: 'Markazi Text, serif' }}>
            السلام عليكم
          </div>
          <div className="text-white text-3xl" style={{ fontFamily: 'Markazi Text, serif' }}>
            ورحمة الله وبركاته
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 🎨 الصفحة الرئيسية
  // ============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200" style={{ fontFamily: 'Markazi Text, serif' }}>
      {/* إشعارات الإنجازات */}
      {currentAchievement && (
        <AchievementNotification
          achievement={currentAchievement}
          onClose={() => setCurrentAchievement(null)}
        />
      )}

      {toastMessage && (
        <AchievementToast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {upgradePromptInfo && (
        <UpgradePrompt
          from={upgradePromptInfo.from}
          to={upgradePromptInfo.to}
          benefits={upgradePromptInfo.benefits}
          onClose={() => setUpgradePromptInfo(null)}
        />
      )}

      {/* إشعار البصمة (المرحلة 7) */}
      {showFingerprintPrompt && fingerprintEnabled && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-3">
              <div className="text-4xl">🔐</div>
              <button
                onClick={() => {
                  setShowFingerprintPrompt(false);
                  dismissFingerprintPrompt();
                }}
                className="text-white hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <h3 className="text-2xl font-bold mb-2">
              احفظ بصمتك
            </h3>
            <p className="text-lg mb-4 leading-relaxed">
              احفظ بصمة جهازك حتى تستطيع الدخول بسهولة للمرات القادمة
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const fingerprint = getOrCreateFingerprint();
                  if (fingerprint) {
                    saveFingerprint(fingerprint);
                    setToastMessage({
                      message: '✅ تم حفظ البصمة بنجاح',
                      type: 'success'
                    });
                  }
                  setShowFingerprintPrompt(false);
                }}
                className="flex-1 bg-white text-purple-700 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all"
              >
                حفظ البصمة
              </button>
              <button
                onClick={() => {
                  setShowFingerprintPrompt(false);
                  dismissFingerprintPrompt();
                }}
                className="px-4 bg-purple-800 text-white py-3 rounded-xl font-semibold hover:bg-purple-900 transition-all"
              >
                لاحقاً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* قائمة الإشعارات (المرحلة 8 - جديد) */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowNotifications(false)}>
          <div 
            className="fixed left-0 top-0 h-full w-96 bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b-2 border-stone-200 p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-stone-800">الإشعارات</h2>
              <button onClick={() => setShowNotifications(false)} className="text-stone-600 hover:text-stone-800">
                <X size={28} />
              </button>
            </div>

            <div className="p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell size={48} className="mx-auto text-stone-300 mb-4" />
                  <p className="text-stone-500 text-xl">لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                      }}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        notification.is_read 
                          ? 'bg-stone-50' 
                          : 'bg-emerald-50 border-2 border-emerald-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">
                          {notification.type === 'prayer' && '🤲'}
                          {notification.type === 'achievement' && '🏆'}
                          {notification.type === 'level_up' && '⬆️'}
                          {notification.type === 'lottery' && '🎯'}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-stone-800 text-lg mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-stone-600 text-base leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-stone-400 text-sm mt-2">
                            {new Date(notification.created_at).toLocaleDateString('ar-IQ', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* القائمة الجانبية */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowMenu(false)}>
          <div 
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-stone-800">القائمة</h2>
              <button onClick={() => setShowMenu(false)} className="text-stone-600 hover:text-stone-800">
                <X size={32} />
              </button>
            </div>

            <nav className="space-y-4">
              {/* زر حسابي (المرحلة 7) */}
              <a 
                href="/account" 
                className="flex items-center gap-3 text-stone-700 hover:text-emerald-700 text-2xl py-3 transition-colors"
              >
                <Users size={28} />
                حسابي
              </a>

              {/* زر المكتبة (المرحلة 9 - جديد) */}
              <a 
                href="/library" 
                className="flex items-center gap-3 text-stone-700 hover:text-emerald-700 text-2xl py-3 transition-colors"
              >
                <BookOpen size={28} />
                المكتبة
              </a>

              {/* زر عن المنصة (المرحلة 9 - جديد) */}
              <a 
                href="/about" 
                className="flex items-center gap-3 text-stone-700 hover:text-emerald-700 text-2xl py-3 transition-colors"
              >
                <Info size={28} />
                عن المنصة
              </a>

              <button className="flex items-center gap-3 text-stone-700 hover:text-emerald-700 text-2xl py-3 transition-colors w-full text-right">
                <HelpCircle size={28} />
                المساعدة
              </button>
            </nav>

            {/* إحصائيات المستخدم */}
            {userStats && (
              <div className="mt-8 p-4 bg-emerald-50 rounded-xl">
                <h3 className="text-xl font-bold text-emerald-900 mb-3">إحصائياتك</h3>
                <div className="space-y-2 text-emerald-800">
                  <p className="text-lg">🤲 {userStats.totalPrayers || 0} دعوة</p>
                  <p className="text-lg">⭐ {userStats.totalStars || 0} نجمة</p>
                  <p className="text-lg">🏆 المستوى {userStats.level || 1}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* الهيدر */}
        <header className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setShowMenu(true)}
            className="text-stone-700 hover:text-stone-900"
          >
            <Menu size={32} />
          </button>
          
          <h1 className="text-5xl font-bold text-emerald-800">يُجيب</h1>
          
          {/* جرس الإشعارات (المرحلة 8 - جديد) */}
          <button 
            onClick={() => setShowNotifications(true)}
            className="relative text-stone-700 hover:text-stone-900"
          >
            <Bell size={32} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </header>

        {/* الآية الرئيسية */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl p-6 mb-6 text-center shadow-xl">
          <p className="text-3xl leading-relaxed mb-2">
            {quranVerses.main.text}
          </p>
          <p className="text-xl text-emerald-100">
            {quranVerses.main.subtitle}
          </p>
        </div>

        {/* البانر */}
        {banner && banner.is_active && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl p-6 mb-6 text-center shadow-lg">
            <h2 className="text-3xl font-bold mb-2">{banner.title}</h2>
            <p className="text-xl leading-relaxed">{banner.content}</p>
          </div>
        )}

        {/* الإحصائيات */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-2xl font-bold text-emerald-700">{stats.believersCount.toLocaleString()}</p>
            <p className="text-sm text-stone-600">مؤمن</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-3xl mb-2">🤲</div>
            <p className="text-2xl font-bold text-blue-700">{stats.todayPrayers.toLocaleString()}</p>
            <p className="text-sm text-stone-600">دعاء اليوم</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-2xl font-bold text-purple-700">{stats.activeRequests}</p>
            <p className="text-sm text-stone-600">طلب نشط</p>
          </div>
        </div>

        {/* الأكثر تفاعلاً */}
        {topActiveUsers && topActiveUsers.length > 0 && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <h2 className="text-3xl font-bold text-stone-800 mb-4 text-center">
              ⭐ الأكثر تفاعلاً
            </h2>
            <div className="space-y-3">
              {topActiveUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-emerald-700">#{index + 1}</span>
                    <div>
                      <p className="text-xl font-semibold text-stone-800">{user.full_name}</p>
                      {user.verification_badge && (
                        <span className="text-blue-600 text-sm">✓ موثق</span>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-emerald-700">{user.total_prayers}</p>
                    <p className="text-xs text-stone-600">دعوة</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الدعاء الجماعي */}
        {collectivePrayer && collectivePrayer.is_active && (
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-2xl p-6 mb-6 shadow-xl">
            <h2 className="text-3xl font-bold mb-4 text-center">
              🤲 الدعاء الجماعي
            </h2>
            <p className="text-2xl leading-relaxed text-center mb-4">
              {collectivePrayer.prayer_text}
            </p>
            <button 
              onClick={() => prayForRequest(collectivePrayer.id)}
              className="w-full bg-white text-purple-700 py-4 rounded-xl font-bold text-2xl hover:bg-purple-50 transition-all"
            >
              آمين 🤲
            </button>
            <p className="text-center mt-3 text-purple-200 text-lg">
              {collectivePrayer.prayer_count} شخص دعا
            </p>
          </div>
        )}

        {/* أزرار طلب الدعاء */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-stone-800 mb-4 text-center">
            من تريد أن يدعو لك؟
          </h2>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => {
                setSelectedPrayerType('personal');
                setShowPrayerForm(true);
                setPrayerForm({ ...prayerForm, type: 'personal' });
                setSelectedVerse(quranVerses.personal);
              }}
              className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-6 rounded-xl font-bold text-xl shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all"
            >
              <div className="text-4xl mb-2">🤲</div>
              دعاء شخصي
            </button>

            <button
              onClick={() => {
                setSelectedPrayerType('friend');
                setShowPrayerForm(true);
                setPrayerForm({ ...prayerForm, type: 'friend' });
                setSelectedVerse(quranVerses.friend);
              }}
              className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-6 rounded-xl font-bold text-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              <div className="text-4xl mb-2">💙</div>
              لصديق
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setSelectedPrayerType('deceased');
                setShowPrayerForm(true);
                setPrayerForm({ ...prayerForm, type: 'deceased' });
                setSelectedVerse(quranVerses.deceased);
              }}
              className="bg-gradient-to-br from-stone-600 to-stone-700 text-white py-6 rounded-xl font-bold text-xl shadow-lg hover:from-stone-700 hover:to-stone-800 transition-all"
            >
              <div className="text-4xl mb-2">🕊️</div>
              لمتوفى
            </button>

            <button
              onClick={() => {
                setSelectedPrayerType('sick');
                setShowPrayerForm(true);
                setPrayerForm({ ...prayerForm, type: 'sick' });
                setSelectedVerse(quranVerses.sick);
              }}
              className="bg-gradient-to-br from-red-600 to-red-700 text-white py-6 rounded-xl font-bold text-xl shadow-lg hover:from-red-700 hover:to-red-800 transition-all"
            >
              <div className="text-4xl mb-2">💊</div>
              لمريض
            </button>
          </div>

          {/* نموذج طلب الدعاء */}
          {showPrayerForm && (
            <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => setShowPrayerForm(false)}>
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* الآية الخاصة بنوع الدعاء */}
                {selectedVerse && (
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-xl p-4 mb-6 text-center">
                    <p className="text-xl leading-relaxed mb-1">
                      {selectedVerse.text}
                    </p>
                    <p className="text-sm text-emerald-100">
                      {selectedVerse.subtitle}
                    </p>
                  </div>
                )}

                <h3 className="text-3xl font-bold text-stone-800 mb-6 text-center">
                  {prayerForm.type === 'personal' && '🤲 دعاء شخصي'}
                  {prayerForm.type === 'friend' && '💙 دعاء لصديق'}
                  {prayerForm.type === 'deceased' && '🕊️ دعاء لمتوفى'}
                  {prayerForm.type === 'sick' && '💊 دعاء لمريض'}
                </h3>

                <div className="space-y-4">
                  {/* الاسم */}
                  <div>
                    <label className="block text-stone-700 font-semibold mb-2 text-xl">
                      {prayerForm.type === 'personal' ? 'اسمك' : 'اسم الشخص'}
                      {prayerForm.type === 'sick' && ' (اختياري - للخصوصية)'}
                    </label>
                    <input
                      type="text"
                      value={prayerForm.name}
                      onChange={(e) => setPrayerForm({ ...prayerForm, name: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-none text-xl"
                      placeholder={prayerForm.type === 'sick' ? 'يمكنك تركه فارغاً...' : 'أدخل الاسم...'}
                      required={prayerForm.type !== 'sick'}
                    />
                  </div>

                  {/* اسم الأم أو الأب */}
                  {prayerForm.type !== 'sick' && (
                    <div>
                      <label className="block text-stone-700 font-semibold mb-2 text-xl">
                        اسم الأم أو الأب (اختياري)
                      </label>
                      <div className="flex gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setPrayerForm({ ...prayerForm, isMotherName: true })}
                          className={`flex-1 py-3 rounded-lg font-semibold text-lg ${
                            prayerForm.isMotherName ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          اسم الأم
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrayerForm({ ...prayerForm, isMotherName: false })}
                          className={`flex-1 py-3 rounded-lg font-semibold text-lg ${
                            !prayerForm.isMotherName ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          اسم الأب
                        </button>
                      </div>
                      <input
                        type="text"
                        value={prayerForm.motherOrFatherName}
                        onChange={(e) => setPrayerForm({ ...prayerForm, motherOrFatherName: e.target.value })}
                        className="w-full px-4 py-4 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-none text-xl"
                        placeholder={prayerForm.isMotherName ? "اسم الأم..." : "اسم الأب..."}
                      />
                      <p className="text-sm text-emerald-700 mt-1 font-semibold">
                        💡 إدخال اسم الوالد يمنحك فرصة الظهور في "الأكثر تفاعلاً"
                      </p>
                    </div>
                  )}

                  {/* الغرض */}
                  <div>
                    <label className="block text-stone-700 font-semibold mb-2 text-xl">
                      الغرض من الدعاء
                    </label>
                    <select
                      value={prayerForm.purpose}
                      onChange={(e) => setPrayerForm({ ...prayerForm, purpose: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-none text-xl bg-white"
                    >
                      <option value="">اختر الغرض...</option>
                      {(prayerForm.type === 'deceased' 
                        ? prayerPurposes.deceased 
                        : prayerForm.type === 'sick'
                        ? prayerPurposes.sick
                        : prayerPurposes.general
                      ).map((purpose, index) => (
                        <option key={index} value={purpose}>{purpose}</option>
                      ))}
                    </select>
                  </div>

                  {/* الأزرار */}
                  <div className="flex gap-3">
                    <button
                      onClick={submitPrayerRequest}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-bold text-2xl shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all"
                    >
                      ✓ إرسال
                    </button>
                    <button
                      onClick={() => setShowPrayerForm(false)}
                      className="px-6 bg-stone-300 text-stone-700 py-4 rounded-xl font-semibold text-xl hover:bg-stone-400 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* طلبات الدعاء */}
        {prayerRequests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-stone-800">
                من يحتاج دعاءك الآن
              </h2>
              <span className="bg-emerald-600 text-white px-4 py-2 rounded-full font-bold text-xl">
                {prayerRequests.length}
              </span>
            </div>
            <p className="text-stone-600 text-xl mb-6 text-center">
              "فَاذْكُرُونِي أَذْكُرْكُمْ"
            </p>

            <div className="space-y-4">
              {prayerRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="bg-white rounded-xl p-6 shadow-md border-2 border-stone-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {request.type === 'sick' ? (
                        <p className="text-stone-800 text-2xl font-semibold">
                          💊 مريض يطلب دعاءكم
                        </p>
                      ) : (
                        <p className="text-stone-800 text-2xl font-semibold">
                          {request.name}
                          {request.type === 'deceased' && ' 🕊️'}
                          {request.type === 'sick' && ' 💊'}
                        </p>
                      )}
                      <p className="text-stone-600 text-lg mt-1">
                        {request.purpose}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-emerald-700 font-bold text-xl">
                        {request.prayer_count} دعاء
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => prayForRequest(request.id)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-bold text-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg"
                  >
                    🤲 خذ لحظة وادعُ
                  </button>
                </div>
              ))}
            </div>

            {prayerRequests.length > 5 && (
              <button className="w-full mt-4 bg-stone-200 text-stone-800 py-4 rounded-xl font-bold text-2xl hover:bg-stone-300 transition-all">
                عرض المزيد ({prayerRequests.length - 5})
              </button>
            )}
          </div>
        )}

        {/* التوعية */}
        {awareness && awareness.is_active && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-8 shadow-md">
            <h2 className="text-3xl font-bold text-amber-900 mb-4 text-center">
              💡 توعية
            </h2>
            <div className="text-amber-800 text-xl leading-relaxed whitespace-pre-line">
              {awareness.content}
            </div>
            {awareness.links && Array.isArray(awareness.links) && awareness.links.length > 0 && (
              <div className="mt-4 space-y-2">
                {awareness.links.map((link, index) => {
                  if (!link || !link.url || !link.title) return null;
                  return (
                    <a
                      key={`awareness-link-${index}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-amber-100 hover:bg-amber-200 py-3 px-4 rounded-lg text-amber-900 font-semibold text-lg transition-all"
                    >
                      🔗 {link.title}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* زر المشاركة */}
        <button 
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'يُجيب - منصة الدعاء الجماعي',
                text: 'انضم إلينا في الدعاء - "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ"',
                url: window.location.href
              });
            } else {
              setToastMessage({
                message: 'انسخ الرابط وشاركه مع من تحب',
                type: 'info'
              });
            }
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 rounded-2xl font-bold text-2xl mb-4 shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-3"
        >
          <Share2 size={28} />
          شارك الموقع
        </button>

        {/* زر التحميل الثابت */}
        <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-5 rounded-2xl font-bold text-2xl mb-8 shadow-xl hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-3">
          <Download size={28} />
          حمّل التطبيق على شاشتك
        </button>

        {/* Footer */}
        <footer className="text-center py-8 border-t-2 border-stone-300 mt-12">
          <p className="text-stone-700 text-2xl font-semibold mb-2">
            منصة الدعاء الجماعي © 2025
          </p>
          <p className="text-stone-600 text-xl mb-3">
            فكرة وتطوير <span className="font-bold text-emerald-700">الغافقي</span>
          </p>
          <p className="text-stone-500 text-lg">
            نسألكم الدعاء 🤲
          </p>
        </footer>

      </div>
    </div>
  );
}