'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, CheckCircle, XCircle, Plus, Trash2, Edit2 } from 'lucide-react';

/**
 * 🎨 لوحة الإعدادات الاحترافية المُحسّنة
 * ✅ حل مشكلة الكتابة في textarea
 * ✅ تحسين Toggle Switches
 * ✅ تصميم احترافي للتبويبات
 */
export default function AdminSettingsPanel() {
  // ════════════════════════════════════════════════════════════
  // 🎨 الحالات الأساسية
  // ════════════════════════════════════════════════════════════
  const [activeSection, setActiveSection] = useState('banner');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // ════════════════════════════════════════════════════════════
  // 🎨 حالات مؤقتة للتعديل - مع قيم افتراضية آمنة
  // ════════════════════════════════════════════════════════════
  const [bannerSettings, setBannerSettings] = useState({
    isActive: true,
    text: '',
    backgroundColor: '#10b981',
    textColor: '#ffffff'
  });

  const [awarenessSettings, setAwarenessSettings] = useState({
    isActive: true,
    content: '',
    links: []
  });

  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: false,
    emailEnabled: false,
    smsEnabled: false
  });

  const [tabsSettings, setTabsSettings] = useState({
    home: true,
    prayers: true,
    profile: true,
    achievements: true,
    notifications: true
  });

  // ════════════════════════════════════════════════════════════
  // 📡 جلب الإعدادات عند التحميل
  // ════════════════════════════════════════════════════════════
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const settingsObj = {};
          data.settings.forEach(setting => {
            settingsObj[setting.key] = setting;
          });
          setSettings(settingsObj);

          // ✅ تحديث الحالات المحلية بشكل آمن
          if (settingsObj.banner?.value) {
            setBannerSettings(prev => ({
              ...prev,
              ...settingsObj.banner.value
            }));
          }
          if (settingsObj.awareness?.value) {
            setAwarenessSettings(prev => ({
              ...prev,
              ...settingsObj.awareness.value
            }));
          }
          if (settingsObj.notifications?.value) {
            setNotificationSettings(prev => ({
              ...prev,
              ...settingsObj.notifications.value
            }));
          }
          if (settingsObj.tabs_visibility?.value) {
            setTabsSettings(prev => ({
              ...prev,
              ...settingsObj.tabs_visibility.value
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('error', 'خطأ في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // 💾 حفظ الإعدادات
  // ════════════════════════════════════════════════════════════
  const saveSetting = async (key, value) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key, value })
      });

      if (response.ok) {
        showMessage('success', 'تم الحفظ بنجاح! ✅');
        await loadSettings();
      } else {
        const data = await response.json();
        showMessage('error', data.error || 'فشل الحفظ');
      }
    } catch (error) {
      console.error('Error saving:', error);
      showMessage('error', 'خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // 💬 عرض الرسائل
  // ════════════════════════════════════════════════════════════
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // ════════════════════════════════════════════════════════════
  // 🎨 مكون البانر - ✅ مُحسّن
  // ════════════════════════════════════════════════════════════
  const BannerSection = () => {
    // ✅ Handler منفصل لتجنب مشكلة الكتابة
    const handleTextChange = (e) => {
      const newValue = e.target.value;
      setBannerSettings(prev => ({
        ...prev,
        text: newValue
      }));
    };

    const handleBackgroundColorChange = (e) => {
      const newValue = e.target.value;
      setBannerSettings(prev => ({
        ...prev,
        backgroundColor: newValue
      }));
    };

    const handleTextColorChange = (e) => {
      const newValue = e.target.value;
      setBannerSettings(prev => ({
        ...prev,
        textColor: newValue
      }));
    };

    const handleActiveToggle = (e) => {
      const isActive = e.target.checked;
      setBannerSettings(prev => ({
        ...prev,
        isActive: isActive
      }));
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <span className="text-3xl">🎨</span>
            البانر العلوي
          </h3>
          
          {/* ✅ Toggle محسّن */}
          <div className="flex items-center gap-3">
            <span className="text-stone-700 font-semibold">تفعيل البانر</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={bannerSettings.isActive}
                onChange={handleActiveToggle}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* النص - ✅ مُحسّن */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-stone-700 mb-2">
              نص البانر
            </label>
            <textarea
              value={bannerSettings.text}
              onChange={handleTextChange}
              rows="3"
              className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
              placeholder="أدخل نص البانر..."
            />
          </div>

          {/* لون الخلفية */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">
              لون الخلفية
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={bannerSettings.backgroundColor}
                onChange={handleBackgroundColorChange}
                className="w-20 h-12 border-2 border-stone-300 rounded-xl cursor-pointer"
              />
              <input
                type="text"
                value={bannerSettings.backgroundColor}
                onChange={handleBackgroundColorChange}
                className="flex-1 px-4 py-2 border-2 border-stone-300 rounded-xl focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* لون النص */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">
              لون النص
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={bannerSettings.textColor}
                onChange={handleTextColorChange}
                className="w-20 h-12 border-2 border-stone-300 rounded-xl cursor-pointer"
              />
              <input
                type="text"
                value={bannerSettings.textColor}
                onChange={handleTextColorChange}
                className="flex-1 px-4 py-2 border-2 border-stone-300 rounded-xl focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* معاينة */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">
            معاينة مباشرة
          </label>
          <div
            className="p-6 rounded-xl text-center font-bold text-xl border-2 border-stone-200"
            style={{
              backgroundColor: bannerSettings.backgroundColor,
              color: bannerSettings.textColor
            }}
          >
            {bannerSettings.text || 'مثال على البانر...'}
          </div>
        </div>

        {/* زر الحفظ */}
        <button
          onClick={() => saveSetting('banner', bannerSettings)}
          disabled={saving}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              حفظ إعدادات البانر
            </>
          )}
        </button>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // 💡 مكون التوعية - ✅ مُحسّن
  // ════════════════════════════════════════════════════════════
  const AwarenessSection = () => {
    const [newLink, setNewLink] = useState({ title: '', url: '' });

    // ✅ Handler منفصل لتجنب مشكلة الكتابة
    const handleContentChange = (e) => {
      const newValue = e.target.value;
      setAwarenessSettings(prev => ({
        ...prev,
        content: newValue
      }));
    };

    const handleActiveToggle = (e) => {
      const isActive = e.target.checked;
      setAwarenessSettings(prev => ({
        ...prev,
        isActive: isActive
      }));
    };

    const addLink = () => {
      if (newLink.title && newLink.url) {
        setAwarenessSettings(prev => ({
          ...prev,
          links: [...(prev.links || []), { ...newLink }]
        }));
        setNewLink({ title: '', url: '' });
      }
    };

    const removeLink = (index) => {
      setAwarenessSettings(prev => ({
        ...prev,
        links: prev.links.filter((_, i) => i !== index)
      }));
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <span className="text-3xl">💡</span>
            التوعية
          </h3>
          
          {/* ✅ Toggle محسّن */}
          <div className="flex items-center gap-3">
            <span className="text-stone-700 font-semibold">تفعيل التوعية</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={awarenessSettings.isActive}
                onChange={handleActiveToggle}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* المحتوى - ✅ مُحسّن */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">
            محتوى التوعية
          </label>
          <textarea
            value={awarenessSettings.content}
            onChange={handleContentChange}
            rows="4"
            className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
            placeholder="أدخل محتوى التوعية..."
          />
        </div>

        {/* الروابط */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-3">
            الروابط ({awarenessSettings.links?.length || 0})
          </label>

          {/* قائمة الروابط */}
          {awarenessSettings.links && awarenessSettings.links.length > 0 && (
            <div className="space-y-2 mb-4">
              {awarenessSettings.links.map((link, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-emerald-600 text-xl">🔗</span>
                  <div className="flex-1">
                    <p className="font-semibold text-stone-800">{link.title}</p>
                    <p className="text-sm text-stone-600 truncate">{link.url}</p>
                  </div>
                  <button
                    onClick={() => removeLink(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* إضافة رابط جديد */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm font-bold text-blue-900 mb-3">إضافة رابط جديد</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                placeholder="عنوان الرابط"
                className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500"
              />
              <input
                type="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://..."
                className="px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500"
              />
            </div>
            <button
              onClick={addLink}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              إضافة الرابط
            </button>
          </div>
        </div>

        {/* زر الحفظ */}
        <button
          onClick={() => saveSetting('awareness', awarenessSettings)}
          disabled={saving}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              حفظ إعدادات التوعية
            </>
          )}
        </button>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // 🔔 مكون الإشعارات
  // ════════════════════════════════════════════════════════════
  const NotificationsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <span className="text-3xl">🔔</span>
          الإشعارات
        </h3>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-amber-800 text-sm">
          ⚠️ <strong>ملاحظة:</strong> نظام الإشعارات سيتم تفعيله مستقبلاً. يمكنك التحكم بالإعدادات الآن للاستعداد.
        </p>
      </div>

      <div className="space-y-4">
        {/* Push Notifications */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
          <div className="flex items-center gap-4">
            <span className="text-3xl">📱</span>
            <div>
              <p className="font-bold text-stone-800">إشعارات الدفع (Push)</p>
              <p className="text-sm text-stone-600">إشعارات فورية في التطبيق</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.pushEnabled}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushEnabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
          <div className="flex items-center gap-4">
            <span className="text-3xl">📧</span>
            <div>
              <p className="font-bold text-stone-800">إشعارات البريد الإلكتروني</p>
              <p className="text-sm text-stone-600">رسائل عبر البريد</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.emailEnabled}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailEnabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* SMS Notifications */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl">
          <div className="flex items-center gap-4">
            <span className="text-3xl">📲</span>
            <div>
              <p className="font-bold text-stone-800">إشعارات SMS</p>
              <p className="text-sm text-stone-600">رسائل نصية قصيرة</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.smsEnabled}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsEnabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      {/* زر الحفظ */}
      <button
        onClick={() => saveSetting('notifications', notificationSettings)}
        disabled={saving}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            حفظ إعدادات الإشعارات
          </>
        )}
      </button>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // 📱 مكون التبويبات - ✅ مُحسّن بالكامل
  // ════════════════════════════════════════════════════════════
  const TabsSection = () => {
    const tabs = [
      { key: 'home', icon: '🏠', label: 'الصفحة الرئيسية', description: 'عرض الدعوات والبانر' },
      { key: 'prayers', icon: '🤲', label: 'الدعوات', description: 'صفحة الدعوات المطلوبة' },
      { key: 'profile', icon: '👤', label: 'الملف الشخصي', description: 'معلومات المستخدم' },
      { key: 'achievements', icon: '🏆', label: 'الإنجازات', description: 'الشارات والجوائز' },
      { key: 'notifications', icon: '🔔', label: 'الإشعارات', description: 'إشعارات التطبيق' }
    ];

    const handleToggle = (key) => {
      setTabsSettings(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    };

    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          <span className="text-3xl">📱</span>
          إظهار/إخفاء التبويبات
        </h3>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-blue-800 text-sm">
            💡 <strong>تحكم في الواجهة:</strong> اختر التبويبات التي تريد إظهارها في القائمة السفلية للمستخدمين
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {tabs.map(tab => (
            <div
              key={tab.key}
              className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                tabsSettings[tab.key]
                  ? 'bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-emerald-400 shadow-md'
                  : 'bg-stone-50 border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-4xl">{tab.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-stone-800 mb-1">{tab.label}</p>
                    <p className="text-sm text-stone-600">{tab.description}</p>
                  </div>
                </div>
                
                {/* ✅ Toggle Switch محسّن */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tabsSettings[tab.key]}
                    onChange={() => handleToggle(tab.key)}
                    className="sr-only peer"
                  />
                  <div className="w-16 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-emerald-600 shadow-inner"></div>
                  <span className="ms-3 text-sm font-semibold text-stone-700">
                    {tabsSettings[tab.key] ? 'مفعّل' : 'معطّل'}
                  </span>
                </label>
              </div>

              {/* مؤشر الحالة */}
              {tabsSettings[tab.key] && (
                <div className="absolute top-2 left-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* زر الحفظ */}
        <button
          onClick={() => saveSetting('tabs_visibility', tabsSettings)}
          disabled={saving}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              حفظ إعدادات التبويبات
            </>
          )}
        </button>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // 🎨 الواجهة الرئيسية
  // ════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-stone-600 text-lg">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رسالة التنبيه */}
      {message && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce ${
            message.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <XCircle className="w-6 h-6" />
          )}
          <span className="font-bold">{message.text}</span>
        </div>
      )}

      {/* التبويبات الداخلية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveSection('banner')}
          className={`px-6 py-4 rounded-xl font-bold text-base transition-all ${
            activeSection === 'banner'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105'
              : 'bg-white text-stone-700 border-2 border-stone-200 hover:border-emerald-300 hover:shadow-md'
          }`}
        >
          <span className="text-2xl block mb-1">🎨</span>
          البانر
        </button>
        <button
          onClick={() => setActiveSection('awareness')}
          className={`px-6 py-4 rounded-xl font-bold text-base transition-all ${
            activeSection === 'awareness'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105'
              : 'bg-white text-stone-700 border-2 border-stone-200 hover:border-emerald-300 hover:shadow-md'
          }`}
        >
          <span className="text-2xl block mb-1">💡</span>
          التوعية
        </button>
        <button
          onClick={() => setActiveSection('notifications')}
          className={`px-6 py-4 rounded-xl font-bold text-base transition-all ${
            activeSection === 'notifications'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105'
              : 'bg-white text-stone-700 border-2 border-stone-200 hover:border-emerald-300 hover:shadow-md'
          }`}
        >
          <span className="text-2xl block mb-1">🔔</span>
          الإشعارات
        </button>
        <button
          onClick={() => setActiveSection('tabs')}
          className={`px-6 py-4 rounded-xl font-bold text-base transition-all ${
            activeSection === 'tabs'
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105'
              : 'bg-white text-stone-700 border-2 border-stone-200 hover:border-emerald-300 hover:shadow-md'
          }`}
        >
          <span className="text-2xl block mb-1">📱</span>
          التبويبات
        </button>
      </div>

      {/* المحتوى */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-8 shadow-lg">
        {activeSection === 'banner' && <BannerSection />}
        {activeSection === 'awareness' && <AwarenessSection />}
        {activeSection === 'notifications' && <NotificationsSection />}
        {activeSection === 'tabs' && <TabsSection />}
      </div>
    </div>
  );
}