'use client'
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  // ============================================================================
  // 🔐 حالة تسجيل الدخول
  // ============================================================================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // ============================================================================
  // 📊 حالة التبويبات
  // ============================================================================
  const [activeTab, setActiveTab] = useState('banner');

  // ============================================================================
  // 🎨 حالة البانر (القسم 1)
  // ============================================================================
  const [banner, setBanner] = useState({
    content: '✦ ✦ ✦\n\nيُجيب\n\nمنصة الدعاء الجماعي',
    link: '',
    isActive: true
  });

  // ============================================================================
  // 👥 حالة الأكثر تفاعلاً (القسم 2)
  // ============================================================================
  const [topActive, setTopActive] = useState({
    mode: 'manual',
    manualNames: [
      { name: 'محمد بن عبدالله', visible: true },
      { name: 'فاطمة بنت أحمد', visible: true },
      { name: 'عبدالرحمن بن خالد', visible: true }
    ],
    count: 5
  });

  // ============================================================================
  // 🤲 حالة الدعاء الجماعي (القسم 3)
  // ============================================================================
  const [collectivePrayer, setCollectivePrayer] = useState({
    type: 'verse',
    content: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    timing: 'always',
    startDate: '',
    endDate: '',
    isActive: true
  });

  // ============================================================================
  // 💡 حالة التوعية (القسم 4)
  // ============================================================================
  const [awareness, setAwareness] = useState({
    content: 'قال رسول الله ﷺ: "الدعاء هو العبادة"',
    links: [{ title: '', url: '' }],
    isActive: true
  });

  // ============================================================================
  // 📚 حالة المكتبة (القسم 5)
  // ============================================================================
  const [library, setLibrary] = useState({
    books: [{ title: '', url: '' }]
  });

  // ============================================================================
  // 📄 حالة من نحن (القسم 6)
  // ============================================================================
  const [aboutUs, setAboutUs] = useState({
    content: 'منصة يُجيب - منصة الدعاء الجماعي',
    links: [{ title: '', url: '' }],
    email: 'haydar.cd@gmail.com'
  });

  // ============================================================================
  // ⭐ حالة نسب المستويات (القسم 7)
  // ============================================================================
  const [levelRatios, setLevelRatios] = useState({
    level1: 70,
    level2: 20,
    level3: 10
  });

  // ============================================================================
  // ⏰ حالة مدة طلبات الدعاء (القسم 8)
  // ============================================================================
  const [prayerRequestDuration, setPrayerRequestDuration] = useState({
    duration: 'daily',
    customDays: 1
  });

  // ============================================================================
  // 🔔 حالة الإشعارات (القسم 9 - محدث المرحلة 8)
  // ============================================================================
  const [notificationSettings, setNotificationSettings] = useState({
    oneSignalEnabled: true,
    whatsappEnabled: false,
    appId: '',
    apiKey: ''
  });

  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'general',
    target: 'all',
    url: ''
  });

  const [notificationStats, setNotificationStats] = useState({
    totalSubscribers: 0,
    sentToday: 0,
    clickRate: 0
  });

  // ============================================================================
  // 🔐 حالة البصمة (القسم 10)
  // ============================================================================
  const [fingerprintSettings, setFingerprintSettings] = useState({
    enabled: true
  });

  // ============================================================================
  // 🎨 حالة أزرار الواجهة (القسم 11)
  // ============================================================================
  const [interfaceButtons, setInterfaceButtons] = useState({
    share: true,
    download: true,
    library: true,
    about: true,
    help: true,
    rating: false,
    donate: false
  });

  // ============================================================================
  // 📡 تحميل الإعدادات
  // ============================================================================
  useEffect(() => {
    if (isLoggedIn) {
      loadSettings();
      loadNotificationStats();
    }
  }, [isLoggedIn]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin');
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          if (data.settings.banner) setBanner(data.settings.banner);
          if (data.settings.topActive) setTopActive(data.settings.topActive);
          if (data.settings.collectivePrayer) setCollectivePrayer(data.settings.collectivePrayer);
          if (data.settings.awareness) setAwareness(data.settings.awareness);
          if (data.settings.library) setLibrary(data.settings.library);
          if (data.settings.aboutUs) setAboutUs(data.settings.aboutUs);
          if (data.settings.levelRatios) setLevelRatios(data.settings.levelRatios);
          if (data.settings.prayerRequestDuration) setPrayerRequestDuration(data.settings.prayerRequestDuration);
          if (data.settings.notificationSettings) setNotificationSettings(data.settings.notificationSettings);
          if (data.settings.fingerprintSettings) setFingerprintSettings(data.settings.fingerprintSettings);
          if (data.settings.interfaceButtons) setInterfaceButtons(data.settings.interfaceButtons);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // ============================================================================
  // 📊 تحميل إحصائيات الإشعارات (المرحلة 8 - جديد)
  // ============================================================================
  const loadNotificationStats = async () => {
    try {
      const response = await fetch('/api/notifications/stats');
      if (response.ok) {
        const data = await response.json();
        setNotificationStats(data.stats || {
          totalSubscribers: 0,
          sentToday: 0,
          clickRate: 0
        });
      }
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  // ============================================================================
  // 🔐 تسجيل الدخول
  // ============================================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (loginForm.email === 'haydar.cd@gmail.com' && loginForm.password === '123456') {
      setIsLoggedIn(true);
      localStorage.setItem('admin_logged_in', 'true');
    } else {
      setLoginError('⛔ البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem('admin_logged_in');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // ============================================================================
  // 💾 حفظ الإعدادات
  // ============================================================================
  const saveSettings = async (settingKey, settingValue) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_setting',
          settingKey,
          settingValue
        })
      });

      if (response.ok) {
        alert('✅ تم الحفظ بنجاح!');
      } else {
        alert('❌ حدث خطأ أثناء الحفظ');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ حدث خطأ أثناء الحفظ');
    }
  };

  // ============================================================================
  // 🔔 إرسال إشعار (المرحلة 8 - محدث)
  // ============================================================================
  const sendNotification = async () => {
    if (!notification.title || !notification.message) {
      alert('⚠️ يرجى إدخال العنوان والرسالة');
      return;
    }

    if (!notificationSettings.oneSignalEnabled && !notificationSettings.whatsappEnabled) {
      alert('⚠️ يرجى تفعيل إحدى منصات الإشعارات');
      return;
    }

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification,
          settings: notificationSettings
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ تم إرسال الإشعار بنجاح!\n📊 تم الإرسال إلى: ${data.sentCount || 0} مستخدم`);
        setNotification({ title: '', message: '', type: 'general', target: 'all', url: '' });
        loadNotificationStats();
      } else {
        alert('❌ حدث خطأ أثناء إرسال الإشعار');
      }
    } catch (error) {
      console.error('Notification error:', error);
      alert('❌ حدث خطأ أثناء إرسال الإشعار');
    }
  };

  // ============================================================================
  // 🚪 تسجيل الخروج
  // ============================================================================
  const handleLogout = () => {
    if (confirm('هل تريد تسجيل الخروج من لوحة الإدارة؟')) {
      setIsLoggedIn(false);
      localStorage.removeItem('admin_logged_in');
      setActiveTab('banner');
    }
  };

  // ============================================================================
  // 🎨 صفحة تسجيل الدخول
  // ============================================================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">👑</div>
            <h1 className="text-3xl font-bold text-emerald-800 mb-2">لوحة الإدارة</h1>
            <p className="text-stone-600">منصة الدعاء الجماعي - يُجيب</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-2">كلمة المرور</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-lg font-bold text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg"
            >
              🔐 تسجيل الدخول
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-500">
            <p>Admin: haydar.cd@gmail.com</p>
            <p>Password: 123456</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 🎨 التبويبات
  // ============================================================================
  const tabs = [
    { id: 'banner', label: 'البانر', icon: '📢', color: 'emerald' },
    { id: 'topActive', label: 'الأكثر تفاعلاً', icon: '👥', color: 'blue' },
    { id: 'collective', label: 'الدعاء الجماعي', icon: '🤲', color: 'purple' },
    { id: 'awareness', label: 'التوعية', icon: '💡', color: 'amber' },
    { id: 'library', label: 'المكتبة', icon: '📚', color: 'teal' },
    { id: 'about', label: 'من نحن', icon: '📄', color: 'indigo' },
    { id: 'levels', label: 'نسب المستويات', icon: '⭐', color: 'yellow' },
    { id: 'duration', label: 'مدة الطلبات', icon: '⏰', color: 'orange' },
    { id: 'notifications', label: 'الإشعارات', icon: '🔔', color: 'red' },
    { id: 'fingerprint', label: 'البصمة', icon: '🔐', color: 'pink' },
    { id: 'buttons', label: 'أزرار الواجهة', icon: '🎨', color: 'cyan' }
  ];

  // ============================================================================
  // 🎨 لوحة الإدارة الرئيسية
  // ============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* الهيدر */}
      <header className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">👑 لوحة الإدارة</h1>
              <p className="text-emerald-100 text-lg">منصة الدعاء الجماعي - يُجيب</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold transition-all shadow-lg"
            >
              🚪 تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* التبويبات */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.id
                    ? `bg-gradient-to-br from-${tab.color}-600 to-${tab.color}-700 text-white shadow-lg scale-105`
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <div className="text-2xl mb-1">{tab.icon}</div>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* المحتوى */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* قسم البانر */}
          {activeTab === 'banner' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-emerald-800 border-b-4 border-emerald-600 pb-3 mb-6">
                📢 إدارة البانر
              </h2>

              <div>
                <label className="block text-stone-700 font-semibold mb-2 text-lg">محتوى البانر</label>
                <textarea
                  value={banner.content}
                  onChange={(e) => setBanner({ ...banner, content: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:outline-none text-lg"
                  rows="5"
                  placeholder="أدخل محتوى البانر..."
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-2 text-lg">رابط (اختياري)</label>
                <input
                  type="url"
                  value={banner.link}
                  onChange={(e) => setBanner({ ...banner, link: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:outline-none text-lg"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="bannerActive"
                  checked={banner.isActive}
                  onChange={(e) => setBanner({ ...banner, isActive: e.target.checked })}
                  className="w-6 h-6"
                />
                <label htmlFor="bannerActive" className="text-lg font-semibold text-stone-700">
                  تفعيل البانر
                </label>
              </div>

              <button
                onClick={() => saveSettings('banner', banner)}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-lg font-bold text-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg"
              >
                💾 حفظ إعدادات البانر
              </button>
            </div>
          )}

          {/* قسم الأكثر تفاعلاً */}
          {activeTab === 'topActive' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-blue-800 border-b-4 border-blue-600 pb-3 mb-6">
                👥 إدارة الأكثر تفاعلاً
              </h2>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="topActiveMode"
                    checked={topActive.mode === 'manual'}
                    onChange={() => setTopActive({ ...topActive, mode: 'manual' })}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold text-lg">✍️ يدوي - اختيار الأسماء</span>
                </label>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="topActiveMode"
                    checked={topActive.mode === 'auto'}
                    onChange={() => setTopActive({ ...topActive, mode: 'auto' })}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold text-lg">🤖 تلقائي - من قاعدة البيانات</span>
                </label>
              </div>

              {topActive.mode === 'manual' && (
                <div className="space-y-4">
                  {topActive.manualNames.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const newNames = [...topActive.manualNames];
                          newNames[index].name = e.target.value;
                          setTopActive({ ...topActive, manualNames: newNames });
                        }}
                        className="flex-1 px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                        placeholder={`الاسم ${index + 1}...`}
                      />
                      <button
                        onClick={() => {
                          const newNames = [...topActive.manualNames];
                          newNames[index].visible = !newNames[index].visible;
                          setTopActive({ ...topActive, manualNames: newNames });
                        }}
                        className={`px-4 py-3 rounded-lg font-semibold ${
                          item.visible ? 'bg-green-600 text-white' : 'bg-stone-300 text-stone-700'
                        }`}
                      >
                        {item.visible ? '👁️' : '🚫'}
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      if (topActive.manualNames.length < 5) {
                        setTopActive({
                          ...topActive,
                          manualNames: [...topActive.manualNames, { name: '', visible: true }]
                        });
                      }
                    }}
                    className="w-full border-2 border-dashed border-blue-400 text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition-all"
                    disabled={topActive.manualNames.length >= 5}
                  >
                    ➕ إضافة اسم جديد (حد أقصى 5)
                  </button>
                </div>
              )}

              {topActive.mode === 'auto' && (
                <div>
                  <label className="block text-stone-700 font-semibold mb-2 text-lg">عدد الأسماء المعروضة</label>
                  <select
                    value={topActive.count}
                    onChange={(e) => setTopActive({ ...topActive, count: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                  >
                    <option value="2">2 أسماء</option>
                    <option value="3">3 أسماء</option>
                    <option value="4">4 أسماء</option>
                    <option value="5">5 أسماء</option>
                  </select>
                </div>
              )}

              <button
                onClick={() => saveSettings('topActive', topActive)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-bold text-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                💾 حفظ إعدادات الأكثر تفاعلاً
              </button>
            </div>
          )}

          {/* قسم الدعاء الجماعي */}
          {activeTab === 'collective' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-purple-800 border-b-4 border-purple-600 pb-3 mb-6">
                🤲 إدارة الدعاء الجماعي
              </h2>

              <div className="space-y-4">
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="collectiveType"
                      checked={collectivePrayer.type === 'verse'}
                      onChange={() => setCollectivePrayer({ ...collectivePrayer, type: 'verse' })}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold text-lg">📖 آية قرآنية</span>
                  </label>
                </div>

                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="collectiveType"
                      checked={collectivePrayer.type === 'purpose'}
                      onChange={() => setCollectivePrayer({ ...collectivePrayer, type: 'purpose' })}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold text-lg">🎯 غرض محدد</span>
                  </label>
                </div>

                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="collectiveType"
                      checked={collectivePrayer.type === 'custom'}
                      onChange={() => setCollectivePrayer({ ...collectivePrayer, type: 'custom' })}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold text-lg">✍️ نص حر</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-2 text-lg">المحتوى</label>
                <textarea
                  value={collectivePrayer.content}
                  onChange={(e) => setCollectivePrayer({ ...collectivePrayer, content: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                  rows="4"
                  placeholder="أدخل محتوى الدعاء..."
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-3 text-lg">التوقيت</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border-2 border-stone-200 rounded-lg hover:bg-purple-50 cursor-pointer">
                    <input
                      type="radio"
                      name="timing"
                      checked={collectivePrayer.timing === 'always'}
                      onChange={() => setCollectivePrayer({ ...collectivePrayer, timing: 'always' })}
                      className="w-5 h-5"
                    />
                    <span>⏰ دائم</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border-2 border-stone-200 rounded-lg hover:bg-purple-50 cursor-pointer">
                    <input
                      type="radio"
                      name="timing"
                      checked={collectivePrayer.timing === 'scheduled'}
                      onChange={() => setCollectivePrayer({ ...collectivePrayer, timing: 'scheduled' })}
                      className="w-5 h-5"
                    />
                    <span>📅 محدد بتاريخ</span>
                  </label>
                </div>
              </div>

              {collectivePrayer.timing === 'scheduled' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-2">من تاريخ</label>
                    <input
                      type="date"
                      value={collectivePrayer.startDate}
                      onChange={(e) => setCollectivePrayer({ ...collectivePrayer, startDate: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-semibold mb-2">إلى تاريخ</label>
                    <input
                      type="date"
                      value={collectivePrayer.endDate}
                      onChange={(e) => setCollectivePrayer({ ...collectivePrayer, endDate: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="collectiveActive"
                  checked={collectivePrayer.isActive}
                  onChange={(e) => setCollectivePrayer({ ...collectivePrayer, isActive: e.target.checked })}
                  className="w-6 h-6"
                />
                <label htmlFor="collectiveActive" className="text-lg font-semibold text-stone-700">
                  تفعيل الدعاء الجماعي
                </label>
              </div>

              <button
                onClick={() => saveSettings('collectivePrayer', collectivePrayer)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-lg font-bold text-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
              >
                💾 حفظ إعدادات الدعاء الجماعي
              </button>
            </div>
          )}

          {/* قسم التوعية */}
          {activeTab === 'awareness' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-amber-800 border-b-4 border-amber-600 pb-3 mb-6">
                💡 إدارة التوعية
              </h2>

              <div>
                <label className="block text-stone-700 font-semibold mb-2 text-lg">المحتوى</label>
                <textarea
                  value={awareness.content}
                  onChange={(e) => setAwareness({ ...awareness, content: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-amber-500 focus:outline-none text-lg"
                  rows="5"
                  placeholder="أدخل محتوى التوعية..."
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-3 text-lg">الروابط (اختياري)</label>
                {awareness.links.map((link, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => {
                        const newLinks = [...awareness.links];
                        newLinks[index].title = e.target.value;
                        setAwareness({ ...awareness, links: newLinks });
                      }}
                      className="px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-amber-500 focus:outline-none"
                      placeholder="عنوان الرابط"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...awareness.links];
                        newLinks[index].url = e.target.value;
                        setAwareness({ ...awareness, links: newLinks });
                      }}
                      className="px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-amber-500 focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                ))}
                <button
                  onClick={() => setAwareness({ ...awareness, links: [...awareness.links, { title: '', url: '' }] })}
                  className="w-full border-2 border-dashed border-amber-400 text-amber-600 py-3 rounded-lg font-bold hover:bg-amber-50 transition-all"
                >
                  ➕ إضافة رابط
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="awarenessActive"
                  checked={awareness.isActive}
                  onChange={(e) => setAwareness({ ...awareness, isActive: e.target.checked })}
                  className="w-6 h-6"
                />
                <label htmlFor="awarenessActive" className="text-lg font-semibold text-stone-700">
                  تفعيل التوعية
                </label>
              </div>

              <button
                onClick={() => saveSettings('awareness', awareness)}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-4 rounded-lg font-bold text-xl hover:from-amber-700 hover:to-amber-800 transition-all shadow-lg"
              >
                💾 حفظ إعدادات التوعية
              </button>
            </div>
          )}

          {/* قسم المكتبة */}
          {activeTab === 'library' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-teal-800 border-b-4 border-teal-600 pb-3 mb-6">
                📚 إدارة المكتبة
              </h2>

              <div>
                <label className="block text-stone-700 font-semibold mb-3 text-lg">الكتب والمواد</label>
                {library.books.map((book, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={book.title}
                      onChange={(e) => {
                        const newBooks = [...library.books];
                        newBooks[index].title = e.target.value;
                        setLibrary({ ...library, books: newBooks });
                      }}
                      className="px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-teal-500 focus:outline-none"
                      placeholder="عنوان الكتاب"
                    />
                    <input
                      type="url"
                      value={book.url}
                      onChange={(e) => {
                        const newBooks = [...library.books];
                        newBooks[index].url = e.target.value;
                        setLibrary({ ...library, books: newBooks });
                      }}
                      className="px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-teal-500 focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                ))}
                <button
                  onClick={() => setLibrary({ ...library, books: [...library.books, { title: '', url: '' }] })}
                  className="w-full border-2 border-dashed border-teal-400 text-teal-600 py-3 rounded-lg font-bold hover:bg-teal-50 transition-all"
                >
                  ➕ إضافة كتاب
                </button>
              </div>

              <button
                onClick={() => saveSettings('library', library)}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-lg font-bold text-xl hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg"
              >
                💾 حفظ إعدادات المكتبة
              </button>
            </div>
          )}

          {/* قسم من نحن */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-indigo-800 border-b-4 border-indigo-600 pb-3 mb-6">
                📄 إدارة من نحن
              </h2>

              <div>
                <label className="block text-stone-700 font-semibold mb-2 text-lg">المحتوى</label>
                <textarea
                  value={aboutUs.content}
                  onChange={(e) => setAboutUs({ ...aboutUs, content: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-indigo-500 focus:outline-none text-lg"
                  rows="6"
                  placeholder="أدخل معلومات عن المنصة..."
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-3 text-lg">الروابط (اختياري)</label>
                {aboutUs.links.map((link, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => {
                        const newLinks = [...aboutUs.links];
                        newLinks[index].title = e.target.value;
                        setAboutUs({ ...aboutUs, links: newLinks });
                      }}
                      className="px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      placeholder="عنوان الرابط"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...aboutUs.links];
                        newLinks[index].url = e.target.value;
                        setAboutUs({ ...aboutUs, links: newLinks });
                      }}
                      className="px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      placeholder="https://..."
                    />
                  </div>
                ))}
                <button
                  onClick={() => setAboutUs({ ...aboutUs, links: [...aboutUs.links, { title: '', url: '' }] })}
                  className="w-full border-2 border-dashed border-indigo-400 text-indigo-600 py-3 rounded-lg font-bold hover:bg-indigo-50 transition-all"
                >
                  ➕ إضافة رابط
                </button>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-2 text-lg">البريد الإلكتروني (محمي)</label>
                <input
                  type="email"
                  value={aboutUs.email}
                  onChange={(e) => setAboutUs({ ...aboutUs, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-indigo-500 focus:outline-none text-lg"
                  placeholder="admin@example.com"
                />
                <p className="text-sm text-stone-500 mt-2">سيتم حماية البريد من السبام</p>
              </div>

              <button
                onClick={() => saveSettings('aboutUs', aboutUs)}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-lg font-bold text-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg"
              >
                💾 حفظ إعدادات من نحن
              </button>
            </div>
          )}

          {/* قسم نسب المستويات */}
          {activeTab === 'levels' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-yellow-800 border-b-4 border-yellow-600 pb-3 mb-6">
                ⭐ إدارة نسب المستويات
              </h2>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                <p className="text-lg font-semibold text-yellow-900 mb-4">
                  🎯 القرعة اليومية للمستخدمين المسجلين جزئياً
                </p>
                <p className="text-stone-700">
                  المجموع يجب أن يكون 100%
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-stone-700 font-semibold mb-2 text-lg">
                    🥉 المستوى 1 (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={levelRatios.level1}
                    onChange={(e) => setLevelRatios({ ...levelRatios, level1: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-yellow-500 focus:outline-none text-lg"
                  />
                  <p className="text-sm text-stone-500 mt-1">نسبة المستخدمين الذين سيبقون في المستوى 1</p>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-2 text-lg">
                    🥈 المستوى 2 (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={levelRatios.level2}
                    onChange={(e) => setLevelRatios({ ...levelRatios, level2: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-yellow-500 focus:outline-none text-lg"
                  />
                  <p className="text-sm text-stone-500 mt-1">نسبة المستخدمين الذين سيرتقون للمستوى 2</p>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-2 text-lg">
                    🥇 المستوى 3 (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={levelRatios.level3}
                    onChange={(e) => setLevelRatios({ ...levelRatios, level3: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-yellow-500 focus:outline-none text-lg"
                  />
                  <p className="text-sm text-stone-500 mt-1">نسبة المستخدمين الذين سيرتقون للمستوى 3</p>
                </div>
              </div>

              <div className={`p-4 rounded-lg font-bold text-lg ${
                (levelRatios.level1 + levelRatios.level2 + levelRatios.level3) === 100
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                المجموع: {levelRatios.level1 + levelRatios.level2 + levelRatios.level3}%
                {(levelRatios.level1 + levelRatios.level2 + levelRatios.level3) === 100 ? ' ✓' : ' ✗ يجب أن يكون 100%'}
              </div>

              <button
                onClick={() => saveSettings('levelRatios', levelRatios)}
                disabled={(levelRatios.level1 + levelRatios.level2 + levelRatios.level3) !== 100}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-4 rounded-lg font-bold text-xl hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 حفظ نسب المستويات
              </button>
            </div>
          )}

          {/* قسم مدة الطلبات */}
          {activeTab === 'duration' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-orange-800 border-b-4 border-orange-600 pb-3 mb-6">
                ⏰ إدارة مدة طلبات الدعاء
              </h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-stone-200 rounded-lg hover:bg-orange-50 cursor-pointer">
                  <input
                    type="radio"
                    name="duration"
                    checked={prayerRequestDuration.duration === 'daily'}
                    onChange={() => setPrayerRequestDuration({ ...prayerRequestDuration, duration: 'daily' })}
                    className="w-5 h-5"
                  />
                  <span className="text-lg font-semibold">📅 يومي (24 ساعة)</span>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-stone-200 rounded-lg hover:bg-orange-50 cursor-pointer">
                  <input
                    type="radio"
                    name="duration"
                    checked={prayerRequestDuration.duration === 'weekly'}
                    onChange={() => setPrayerRequestDuration({ ...prayerRequestDuration, duration: 'weekly' })}
                    className="w-5 h-5"
                  />
                  <span className="text-lg font-semibold">📆 أسبوعي (7 أيام)</span>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-stone-200 rounded-lg hover:bg-orange-50 cursor-pointer">
                  <input
                    type="radio"
                    name="duration"
                    checked={prayerRequestDuration.duration === 'monthly'}
                    onChange={() => setPrayerRequestDuration({ ...prayerRequestDuration, duration: 'monthly' })}
                    className="w-5 h-5"
                  />
                  <span className="text-lg font-semibold">📊 شهري (30 يوم)</span>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-stone-200 rounded-lg hover:bg-orange-50 cursor-pointer">
                  <input
                    type="radio"
                    name="duration"
                    checked={prayerRequestDuration.duration === 'custom'}
                    onChange={() => setPrayerRequestDuration({ ...prayerRequestDuration, duration: 'custom' })}
                    className="w-5 h-5"
                  />
                  <span className="text-lg font-semibold">⚙️ مخصص</span>
                </label>
              </div>

              {prayerRequestDuration.duration === 'custom' && (
                <div>
                  <label className="block text-stone-700 font-semibold mb-2 text-lg">عدد الأيام</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={prayerRequestDuration.customDays}
                    onChange={(e) => setPrayerRequestDuration({ ...prayerRequestDuration, customDays: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-orange-500 focus:outline-none text-lg"
                  />
                </div>
              )}

              <button
                onClick={() => saveSettings('prayerRequestDuration', prayerRequestDuration)}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 rounded-lg font-bold text-xl hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg"
              >
                💾 حفظ مدة الطلبات
              </button>
            </div>
          )}

          {/* قسم الإشعارات (المرحلة 8 - محدث) */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-red-800 border-b-4 border-red-600 pb-3 mb-6">
                🔔 إدارة الإشعارات
              </h2>

              {/* الإحصائيات */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">👥</div>
                  <p className="text-2xl font-bold text-blue-800">{notificationStats.totalSubscribers}</p>
                  <p className="text-sm text-blue-700">مشترك</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">📤</div>
                  <p className="text-2xl font-bold text-green-800">{notificationStats.sentToday}</p>
                  <p className="text-sm text-green-700">اليوم</p>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-2xl font-bold text-purple-800">{notificationStats.clickRate}%</p>
                  <p className="text-sm text-purple-700">معدل النقر</p>
                </div>
              </div>

              {/* إعدادات OneSignal */}
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-red-900 mb-4">⚙️ إعدادات OneSignal</h3>
                
                <div className="mb-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notificationSettings.oneSignalEnabled}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        oneSignalEnabled: e.target.checked
                      })}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold">تفعيل إشعارات OneSignal</span>
                  </label>
                </div>

                {notificationSettings.oneSignalEnabled && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-stone-700 font-semibold mb-2">App ID</label>
                      <input
                        type="text"
                        value={notificationSettings.appId}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          appId: e.target.value
                        })}
                        className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-red-500 focus:outline-none"
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-2">REST API Key</label>
                      <input
                        type="password"
                        value={notificationSettings.apiKey}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          apiKey: e.target.value
                        })}
                        className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-red-500 focus:outline-none"
                        placeholder="••••••••••••••••••••"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* إعدادات واتساب */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-green-900 mb-4">💬 إعدادات واتساب</h3>
                
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notificationSettings.whatsappEnabled}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        whatsappEnabled: e.target.checked
                      })}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold">تفعيل إشعارات واتساب (قريباً)</span>
                  </label>
                </div>
              </div>

              <button
                onClick={() => saveSettings('notificationSettings', notificationSettings)}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-lg font-bold text-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-lg mb-8"
              >
                💾 حفظ إعدادات الإشعارات
              </button>

              {/* إرسال إشعار جديد */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-6">
                <h3 className="text-2xl font-bold text-red-900 mb-6">📣 إرسال إشعار جديد</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-2">العنوان</label>
                    <input
                      type="text"
                      value={notification.title}
                      onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
                      placeholder="عنوان الإشعار..."
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-2">الرسالة</label>
                    <textarea
                      value={notification.message}
                      onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
                      rows="3"
                      placeholder="محتوى الإشعار..."
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-2">النوع</label>
                    <select
                      value={notification.type}
                      onChange={(e) => setNotification({ ...notification, type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
                    >
                      <option value="general">📢 عام</option>
                      <option value="prayer">🤲 دعاء</option>
                      <option value="achievement">🏆 إنجاز</option>
                      <option value="reminder">⏰ تذكير</option>
                      <option value="update">🔄 تحديث</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-2">المستهدفون</label>
                    <select
                      value={notification.target}
                      onChange={(e) => setNotification({ ...notification, target: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
                    >
                      <option value="all">👥 الكل</option>
                      <option value="level_1">🥉 المستوى 1</option>
                      <option value="level_2">🥈 المستوى 2</option>
                      <option value="level_3">🥇 المستوى 3</option>
                      <option value="registered">📝 المسجلين فقط</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-2">رابط (اختياري)</label>
                    <input
                      type="url"
                      value={notification.url}
                      onChange={(e) => setNotification({ ...notification, url: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-red-500 focus:outline-none text-lg"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <button
                  onClick={sendNotification}
                  className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-lg font-bold text-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
                >
                  📤 إرسال الإشعار الآن
                </button>
              </div>
            </div>
          )}

          {/* قسم البصمة */}
          {activeTab === 'fingerprint' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-pink-800 border-b-4 border-pink-600 pb-3 mb-6">
                🔐 إدارة البصمة
              </h2>

              <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-6">
                <p className="text-lg text-pink-900 mb-4">
                  تفعيل/تعطيل إشعار حفظ البصمة للمستخدمين
                </p>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={fingerprintSettings.enabled}
                    onChange={(e) => setFingerprintSettings({ ...fingerprintSettings, enabled: e.target.checked })}
                    className="w-6 h-6"
                  />
                  <span className="font-semibold text-lg">
                    {fingerprintSettings.enabled ? '✅ مفعل - سيظهر إشعار حفظ البصمة' : '❌ معطل - لن يظهر الإشعار'}
                  </span>
                </label>
              </div>

              <button
                onClick={() => saveSettings('fingerprintSettings', fingerprintSettings)}
                className="w-full bg-gradient-to-r from-pink-600 to-pink-700 text-white py-4 rounded-lg font-bold text-xl hover:from-pink-700 hover:to-pink-800 transition-all shadow-lg"
              >
                💾 حفظ إعدادات البصمة
              </button>
            </div>
          )}

          {/* قسم أزرار الواجهة */}
          {activeTab === 'buttons' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-cyan-800 border-b-4 border-cyan-600 pb-3 mb-6">
                🎨 إدارة أزرار الواجهة
              </h2>

              <div className="space-y-3">
                {[
                  { key: 'share', label: '🔗 زر المشاركة' },
                  { key: 'download', label: '📥 زر التحميل' },
                  { key: 'library', label: '📚 زر المكتبة' },
                  { key: 'about', label: '📄 زر عن المنصة' },
                  { key: 'help', label: '❓ زر المساعدة' },
                  { key: 'rating', label: '⭐ زر التقييم' },
                  { key: 'donate', label: '💰 زر التبرع' }
                ].map((button) => (
                  <div key={button.key} className="bg-cyan-50 border-2 border-cyan-200 rounded-lg p-4">
                    <label className="flex items-center justify-between">
                      <span className="font-semibold text-lg">{button.label}</span>
                      <input
                        type="checkbox"
                        checked={interfaceButtons[button.key]}
                        onChange={(e) => setInterfaceButtons({
                          ...interfaceButtons,
                          [button.key]: e.target.checked
                        })}
                        className="w-6 h-6"
                      />
                      <span className={`font-bold ${interfaceButtons[button.key] ? 'text-cyan-600' : 'text-stone-400'}`}>
                        {interfaceButtons[button.key] ? 'ظاهر' : 'مخفي'}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <button
                onClick={() => saveSettings('interfaceButtons', interfaceButtons)}
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-4 rounded-lg font-bold text-xl hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-lg"
              >
                💾 حفظ إعدادات الأزرار
              </button>
            </div>
          )}

        </div>
      </main>

      {/* الفوتر */}
      <footer className="bg-gradient-to-r from-stone-800 to-stone-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-lg font-semibold mb-2">منصة الدعاء الجماعي © 2025</p>
          <p className="text-stone-400 text-sm mb-3">الغافقي - نسألكم الدعاء</p>
          <p className="text-xs text-stone-500">لوحة إدارة متقدمة | النسخة 3.0</p>
        </div>
      </footer>
    </div>
  );
}