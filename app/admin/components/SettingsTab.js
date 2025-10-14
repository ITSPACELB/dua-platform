'use client'
import { useState, useEffect } from 'react';

export default function SettingsTab() {
  const [settings, setSettings] = useState({
    site_name: '',
    site_description: '',
    site_url: '',
    maintenance_mode: false,
    allow_registration: true,
    verification_thresholds: {
      blue: 80,
      green: 90,
      gold: 98
    },
    points_system: {
      prayer_given: 1,
      request_answered: 5,
      daily_login: 2
    },
    banner_settings: {
      show_banner: true,
      banner_text: '',
      banner_color: 'blue'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const token = localStorage.getItem('token');
    
    fetch('/api/admin/settings/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.settings);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Load settings error:', err);
        setLoading(false);
      });
  };

  const handleSave = () => {
    if (!confirm('⚠️ هل تريد حفظ جميع الإعدادات؟\n\nهذه التغييرات ستؤثر على المنصة بالكامل!')) {
      return;
    }

    const token = localStorage.getItem('token');
    setSaving(true);

    fetch('/api/admin/settings/all', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('✅ تم حفظ جميع الإعدادات بنجاح');
        } else {
          alert('❌ ' + (data.error || 'فشل الحفظ'));
        }
        setSaving(false);
      })
      .catch(err => {
        console.error('Save settings error:', err);
        alert('❌ حدث خطأ أثناء الحفظ');
        setSaving(false);
      });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 animate-pulse">⚙️</div>
        <p className="text-stone-600">جاري تحميل الإعدادات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          ⚙️ الإعدادات العامة
        </h2>
      </div>

      {/* Warning Banner */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">⚠️</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">تحذير: إعدادات Super Admin</h3>
            <p className="text-red-100 text-sm mb-3">
              هذه الإعدادات حساسة وتؤثر على المنصة بالكامل. تأكد من فهم كل إعداد قبل تغييره.
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-sm">
              <p className="mb-1">💡 <strong>ملاحظة:</strong></p>
              <p className="text-red-100">أي تغييرات ستطبق فوراً على جميع المستخدمين بعد الحفظ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Site Information */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2 text-xl">
          🌐 معلومات المنصة
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              📌 اسم المنصة:
            </label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => setSettings({...settings, site_name: e.target.value})}
              placeholder="يُجيب - منصة الدعاء الجماعي"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              📝 وصف المنصة:
            </label>
            <textarea
              value={settings.site_description}
              onChange={(e) => setSettings({...settings, site_description: e.target.value})}
              placeholder="منصة إسلامية لتبادل الدعاء الجماعي..."
              rows="3"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              🔗 رابط المنصة:
            </label>
            <input
              type="url"
              value={settings.site_url}
              onChange={(e) => setSettings({...settings, site_url: e.target.value})}
              placeholder="https://yojeeb.com"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2 text-xl">
          🔧 إعدادات النظام
        </h3>

        <div className="space-y-4">
          {/* Maintenance Mode */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenance_mode}
                onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})}
                className="w-6 h-6 text-amber-600 rounded focus:ring-amber-500"
              />
              <div className="flex-1">
                <span className="font-bold text-stone-800">🔧 وضع الصيانة</span>
                <p className="text-sm text-stone-600 mt-1">
                  عند التفعيل، لن يتمكن المستخدمون العاديون من الوصول للمنصة (الأدمن فقط)
                </p>
              </div>
              <span className={`px-4 py-2 rounded-lg font-bold ${
                settings.maintenance_mode 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-stone-200 text-stone-600'
              }`}>
                {settings.maintenance_mode ? '🔒 مُفعّل' : '✓ عادي'}
              </span>
            </label>
          </div>

          {/* Allow Registration */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allow_registration}
                onChange={(e) => setSettings({...settings, allow_registration: e.target.checked})}
                className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="font-bold text-stone-800">👥 السماح بالتسجيل</span>
                <p className="text-sm text-stone-600 mt-1">
                  السماح للمستخدمين الجدد بإنشاء حسابات
                </p>
              </div>
              <span className={`px-4 py-2 rounded-lg font-bold ${
                settings.allow_registration 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-500 text-white'
              }`}>
                {settings.allow_registration ? '✓ مسموح' : '✗ ممنوع'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Verification Thresholds */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2 text-xl">
          ⭐ عتبات التوثيق
        </h3>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">✓</div>
              <div className="flex-1">
                <h4 className="font-bold text-stone-800 mb-1">توثيق أزرق</h4>
                <p className="text-sm text-stone-600 mb-2">معدل التفاعل المطلوب</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.verification_thresholds.blue}
                    onChange={(e) => setSettings({
                      ...settings,
                      verification_thresholds: {
                        ...settings.verification_thresholds,
                        blue: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-24 px-4 py-2 border-2 border-blue-400 rounded-lg text-center text-xl font-bold"
                  />
                  <span className="text-lg font-semibold">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">✓✓</div>
              <div className="flex-1">
                <h4 className="font-bold text-stone-800 mb-1">توثيق أخضر</h4>
                <p className="text-sm text-stone-600 mb-2">معدل التفاعل المطلوب</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.verification_thresholds.green}
                    onChange={(e) => setSettings({
                      ...settings,
                      verification_thresholds: {
                        ...settings.verification_thresholds,
                        green: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-24 px-4 py-2 border-2 border-emerald-400 rounded-lg text-center text-xl font-bold"
                  />
                  <span className="text-lg font-semibold">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">👑</div>
              <div className="flex-1">
                <h4 className="font-bold text-stone-800 mb-1">توثيق ذهبي</h4>
                <p className="text-sm text-stone-600 mb-2">معدل التفاعل المطلوب</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.verification_thresholds.gold}
                    onChange={(e) => setSettings({
                      ...settings,
                      verification_thresholds: {
                        ...settings.verification_thresholds,
                        gold: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-24 px-4 py-2 border-2 border-amber-400 rounded-lg text-center text-xl font-bold"
                  />
                  <span className="text-lg font-semibold">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Points System */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2 text-xl">
          🎯 نظام النقاط
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-4">
            <div className="text-center mb-3">
              <div className="text-4xl mb-2">🤲</div>
              <h4 className="font-semibold text-stone-800">الدعاء لشخص</h4>
            </div>
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                min="0"
                value={settings.points_system.prayer_given}
                onChange={(e) => setSettings({
                  ...settings,
                  points_system: {
                    ...settings.points_system,
                    prayer_given: parseInt(e.target.value) || 0
                  }
                })}
                className="w-20 px-3 py-2 border-2 border-purple-400 rounded-lg text-center text-lg font-bold"
              />
              <span className="font-semibold">نقطة</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-4">
            <div className="text-center mb-3">
              <div className="text-4xl mb-2">✨</div>
              <h4 className="font-semibold text-stone-800">دعاء مستجاب</h4>
            </div>
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                min="0"
                value={settings.points_system.request_answered}
                onChange={(e) => setSettings({
                  ...settings,
                  points_system: {
                    ...settings.points_system,
                    request_answered: parseInt(e.target.value) || 0
                  }
                })}
                className="w-20 px-3 py-2 border-2 border-green-400 rounded-lg text-center text-lg font-bold"
              />
              <span className="font-semibold">نقطة</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4">
            <div className="text-center mb-3">
              <div className="text-4xl mb-2">📅</div>
              <h4 className="font-semibold text-stone-800">تسجيل دخول يومي</h4>
            </div>
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                min="0"
                value={settings.points_system.daily_login}
                onChange={(e) => setSettings({
                  ...settings,
                  points_system: {
                    ...settings.points_system,
                    daily_login: parseInt(e.target.value) || 0
                  }
                })}
                className="w-20 px-3 py-2 border-2 border-blue-400 rounded-lg text-center text-lg font-bold"
              />
              <span className="font-semibold">نقطة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Settings */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2 text-xl">
          📢 إعدادات البانر الإعلاني
        </h3>

        <div className="space-y-4">
          {/* Show Banner Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.banner_settings.show_banner}
              onChange={(e) => setSettings({
                ...settings,
                banner_settings: {
                  ...settings.banner_settings,
                  show_banner: e.target.checked
                }
              })}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label className="font-semibold text-stone-800">عرض البانر في الصفحة الرئيسية</label>
          </div>

          {/* Banner Text */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              📝 نص البانر:
            </label>
            <textarea
              value={settings.banner_settings.banner_text}
              onChange={(e) => setSettings({
                ...settings,
                banner_settings: {
                  ...settings.banner_settings,
                  banner_text: e.target.value
                }
              })}
              placeholder="مثال: 🌟 انضم إلينا الآن واحصل على نقاط مكافأة!"
              rows="2"
              disabled={!settings.banner_settings.show_banner}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none disabled:opacity-50"
            />
          </div>

          {/* Banner Color */}
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              🎨 لون البانر:
            </label>
            <select
              value={settings.banner_settings.banner_color}
              onChange={(e) => setSettings({
                ...settings,
                banner_settings: {
                  ...settings.banner_settings,
                  banner_color: e.target.value
                }
              })}
              disabled={!settings.banner_settings.show_banner}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none disabled:opacity-50"
            >
              <option value="blue">أزرق</option>
              <option value="green">أخضر</option>
              <option value="emerald">زمردي</option>
              <option value="amber">كهرماني</option>
              <option value="red">أحمر</option>
              <option value="purple">بنفسجي</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <span className="animate-spin">⏳</span>
            جاري حفظ جميع الإعدادات...
          </>
        ) : (
          <>
            <span>💾</span>
            حفظ جميع الإعدادات
          </>
        )}
      </button>

      {/* Warning */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h4 className="font-bold text-red-800 mb-2">تحذيرات مهمة</h4>
            <ul className="space-y-1 text-sm text-red-700">
              <li>• وضع الصيانة سيمنع جميع المستخدمين العاديين من الوصول للمنصة</li>
              <li>• تغيير عتبات التوثيق سيؤثر على جميع المستخدمين فوراً</li>
              <li>• نظام النقاط يؤثر على تحفيز المستخدمين - اختر القيم بعناية</li>
              <li>• تأكد من اختبار التغييرات في بيئة تطوير أولاً إن أمكن</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}