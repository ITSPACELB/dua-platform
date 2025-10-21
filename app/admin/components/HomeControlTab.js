'use client'
import { useState, useEffect } from 'react';

export default function HomeControlTab() {
  const [sections, setSections] = useState({
    hero_banner: true,
    stats_section: true,
    how_it_works: true,
    prayer_requests: true,
    recent_prayers: true,
    testimonials: true,
    about_section: true,
    cta_section: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const token = localStorage.getItem('token');
    
    fetch('/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings.home_sections) {
          setSections(data.settings.home_sections.value);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Load settings error:', err);
        setLoading(false);
      });
  };

  const handleSaveSettings = () => {
    if (!confirm('هل تريد حفظ التغييرات على الصفحة الرئيسية؟')) {
      return;
    }

    const token = localStorage.getItem('token');
    setSaving(true);

    fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: 'home_sections',
        value: sections
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('✅ تم حفظ الإعدادات بنجاح\n\nقم بتحديث الصفحة الرئيسية لرؤية التغييرات');
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

  const toggleSection = (key) => {
    setSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectAll = () => {
    const newSections = {};
    Object.keys(sections).forEach(key => {
      newSections[key] = true;
    });
    setSections(newSections);
  };

  const deselectAll = () => {
    const newSections = {};
    Object.keys(sections).forEach(key => {
      newSections[key] = false;
    });
    setSections(newSections);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 animate-pulse">🏠</div>
        <p className="text-stone-600">جاري تحميل الإعدادات...</p>
      </div>
    );
  }

  const sectionsConfig = [
    {
      key: 'hero_banner',
      title: 'البانر الرئيسي',
      icon: '🎯',
      description: 'القسم الأول في الصفحة مع العنوان الرئيسي وزر الدخول',
      color: 'emerald'
    },
    {
      key: 'stats_section',
      title: 'الإحصائيات',
      icon: '📊',
      description: 'عرض إحصائيات المنصة (المستخدمين، الطلبات، الدعوات)',
      color: 'blue'
    },
    {
      key: 'how_it_works',
      title: 'كيف يعمل؟',
      icon: '❓',
      description: 'شرح خطوات استخدام المنصة',
      color: 'purple'
    },
    {
      key: 'prayer_requests',
      title: 'طلبات الدعاء النشطة',
      icon: '🙏',
      description: 'عرض أحدث طلبات الدعاء المتاحة',
      color: 'amber'
    },
    {
      key: 'recent_prayers',
      title: 'آخر الدعوات',
      icon: '🤲',
      description: 'عرض آخر الدعوات التي تمت',
      color: 'green'
    },
    {
      key: 'testimonials',
      title: 'الشهادات والتقييمات',
      icon: '⭐',
      description: 'آراء وتجارب المستخدمين',
      color: 'yellow'
    },
    {
      key: 'about_section',
      title: 'عن المنصة',
      icon: '📄',
      description: 'معلومات عن المنصة ورسالتها',
      color: 'indigo'
    },
    {
      key: 'cta_section',
      title: 'دعوة للانضمام',
      icon: '🚀',
      description: 'قسم تحفيزي للتسجيل والمشاركة',
      color: 'rose'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          🏠 التحكم بالصفحة الرئيسية
        </h2>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">🎛️</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">التحكم الكامل بالصفحة الرئيسية</h3>
            <p className="text-indigo-100 text-sm mb-3">
              اختر الأقسام التي تريد إظهارها أو إخفاءها في الصفحة الرئيسية للمنصة
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-sm">
              <p className="mb-1">💡 <strong>نصيحة:</strong></p>
              <p className="text-indigo-100">التغييرات ستطبق فوراً على جميع الزوار بعد الحفظ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          ⚡ إجراءات سريعة
        </h3>
        <div className="flex gap-3">
          <button
            onClick={selectAll}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold flex items-center gap-2"
          >
            <span>✓</span>
            تفعيل الكل
          </button>
          <button
            onClick={deselectAll}
            className="px-6 py-3 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors font-semibold flex items-center gap-2"
          >
            <span>✗</span>
            إلغاء الكل
          </button>
          <div className="flex-1"></div>
          <div className="bg-stone-100 px-4 py-3 rounded-lg text-sm text-stone-700 font-semibold">
            {Object.values(sections).filter(v => v).length} / {Object.keys(sections).length} مفعّل
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sectionsConfig.map((section) => {
          const isActive = sections[section.key];
          
          return (
            <div
              key={section.key}
              className={`bg-white border-2 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden ${
                isActive 
                  ? `border-${section.color}-400` 
                  : 'border-stone-200'
              }`}
            >
              <div className={`p-6 ${
                isActive 
                  ? `bg-gradient-to-br from-${section.color}-50 to-${section.color}-100` 
                  : 'bg-stone-50'
              }`}>
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{section.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-800 text-lg mb-2">
                      {section.title}
                    </h4>
                    <p className="text-sm text-stone-600 mb-4">
                      {section.description}
                    </p>
                    
                    {/* Toggle Switch */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => toggleSection(section.key)}
                          className="sr-only peer"
                        />
                        <div className={`w-16 h-8 rounded-full transition-colors ${
                          isActive ? `bg-${section.color}-600` : 'bg-stone-300'
                        }`}></div>
                        <div className={`absolute top-1 right-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          isActive ? 'translate-x-8' : ''
                        }`}></div>
                      </div>
                      <span className={`font-bold ${
                        isActive ? `text-${section.color}-700` : 'text-stone-600'
                      }`}>
                        {isActive ? '✅ مفعّل' : '❌ معطّل'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Section */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          👁️ معاينة الصفحة الرئيسية
        </h3>
        <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-lg p-8">
          <div className="space-y-4">
            {sectionsConfig.map((section) => 
              sections[section.key] ? (
                <div key={section.key} className="bg-white border border-stone-200 rounded-lg p-4 flex items-center gap-3">
                  <div className="text-2xl">{section.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-stone-800">{section.title}</p>
                    <p className="text-xs text-stone-500">{section.description}</p>
                  </div>
                  <span className="text-green-600 font-bold text-sm">✓ ظاهر</span>
                </div>
              ) : null
            )}
            {Object.values(sections).filter(v => v).length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-stone-600">لم يتم تفعيل أي قسم</p>
                <p className="text-sm text-stone-500 mt-2">الصفحة الرئيسية ستكون فارغة</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveSettings}
        disabled={saving}
        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <span className="animate-spin">⏳</span>
            جاري الحفظ...
          </>
        ) : (
          <>
            <span>💾</span>
            حفظ التغييرات على الصفحة الرئيسية
          </>
        )}
      </button>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h4 className="font-bold text-amber-800 mb-2">تنبيه مهم</h4>
            <ul className="space-y-1 text-sm text-amber-700">
              <li>• التغييرات ستطبق فوراً على جميع الزوار</li>
              <li>• تأكد من اختيار الأقسام المناسبة لتجربة مستخدم متكاملة</li>
              <li>• يُنصح بإبقاء "البانر الرئيسي" و "طلبات الدعاء" مفعّلة دائماً</li>
              <li>• يمكنك تعديل الإعدادات في أي وقت</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-r from-stone-50 to-stone-100 border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          📊 إحصائيات الأقسام
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-emerald-600">
              {Object.values(sections).filter(v => v).length}
            </div>
            <div className="text-sm text-stone-600 mt-1">قسم مفعّل</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-red-600">
              {Object.values(sections).filter(v => !v).length}
            </div>
            <div className="text-sm text-stone-600 mt-1">قسم معطّل</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-blue-600">
              {Object.keys(sections).length}
            </div>
            <div className="text-sm text-stone-600 mt-1">إجمالي الأقسام</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round((Object.values(sections).filter(v => v).length / Object.keys(sections).length) * 100)}%
            </div>
            <div className="text-sm text-stone-600 mt-1">نسبة التفعيل</div>
          </div>
        </div>
      </div>
    </div>
  );
}