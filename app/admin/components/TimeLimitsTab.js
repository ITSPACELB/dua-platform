'use client'
import { useState, useEffect } from 'react';

export default function TimeLimitsTab() {
  const [limits, setLimits] = useState({
    prayer_hours: 3,
    deceased_hours: 24,
    sick_hours: 6
  });
  const [allowMultiplePrayers, setAllowMultiplePrayers] = useState(false);
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
        if (data.success) {
          if (data.settings.request_limits) {
            setLimits(data.settings.request_limits.value);
          }
          if (data.settings.allow_multiple_prayers) {
            setAllowMultiplePrayers(data.settings.allow_multiple_prayers.value);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Load settings error:', err);
        setLoading(false);
      });
  };

  const handleSaveSettings = () => {
    if (!confirm('هل تريد حفظ هذه الإعدادات؟')) {
      return;
    }

    const token = localStorage.getItem('token');
    setSaving(true);

    // حفظ حدود الأوقات
    Promise.all([
      fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'request_limits',
          value: limits
        })
      }),
      fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'allow_multiple_prayers',
          value: allowMultiplePrayers
        })
      })
    ])
      .then(responses => Promise.all(responses.map(r => r.json())))
      .then(results => {
        if (results.every(r => r.success)) {
          alert('✅ تم حفظ الإعدادات بنجاح');
        } else {
          alert('❌ حدث خطأ أثناء الحفظ');
        }
        setSaving(false);
      })
      .catch(err => {
        console.error('Save settings error:', err);
        alert('❌ حدث خطأ أثناء الحفظ');
        setSaving(false);
      });
  };

  const handleReset = () => {
    if (!confirm('هل تريد إعادة تعيين الإعدادات للقيم الافتراضية؟')) {
      return;
    }
    
    setLimits({
      prayer_hours: 3,
      deceased_hours: 24,
      sick_hours: 6
    });
    setAllowMultiplePrayers(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 animate-pulse">⏰</div>
        <p className="text-stone-600">جاري تحميل الإعدادات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          ⏰ التحكم بأوقات الدعاء
        </h2>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">⏱️</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">إدارة الحدود الزمنية</h3>
            <p className="text-orange-100 text-sm">
              تحكم في المدة الزمنية المطلوبة بين كل طلب دعاء والآخر لكل نوع من أنواع الطلبات
            </p>
          </div>
        </div>
      </div>

      {/* Time Limits Settings */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2 text-xl">
          ⏳ الحدود الزمنية للطلبات
        </h3>

        <div className="space-y-6">
          {/* General Prayer */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">🤲</div>
              <div className="flex-1">
                <h4 className="font-bold text-stone-800 text-lg">طلب الدعاء العام</h4>
                <p className="text-sm text-stone-600">المدة بين كل طلب دعاء عام والآخر</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="168"
                value={limits.prayer_hours}
                onChange={(e) => setLimits({...limits, prayer_hours: parseInt(e.target.value) || 0})}
                className="w-32 px-4 py-3 border-2 border-emerald-400 rounded-lg focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none text-center text-2xl font-bold"
              />
              <span className="text-lg font-semibold text-stone-700">ساعة</span>
              
              <div className="flex-1 bg-white rounded-lg p-3 border border-emerald-200">
                <div className="text-xs text-stone-600 mb-1">الافتراضي: 3 ساعات</div>
                <div className="text-sm text-emerald-700 font-semibold">
                  {limits.prayer_hours === 0 && '⚠️ بدون حد (يمكن الطلب فوراً)'}
                  {limits.prayer_hours > 0 && limits.prayer_hours < 24 && `✓ ${limits.prayer_hours} ساعة بين كل طلب`}
                  {limits.prayer_hours >= 24 && `✓ ${Math.floor(limits.prayer_hours / 24)} يوم بين كل طلب`}
                </div>
              </div>
            </div>
          </div>

          {/* Deceased Prayer */}
          <div className="bg-gradient-to-br from-stone-50 to-stone-100 border-2 border-stone-300 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">🕊️</div>
              <div className="flex-1">
                <h4 className="font-bold text-stone-800 text-lg">طلب الدعاء للمتوفى</h4>
                <p className="text-sm text-stone-600">المدة بين كل طلب دعاء لمتوفى والآخر</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="168"
                value={limits.deceased_hours}
                onChange={(e) => setLimits({...limits, deceased_hours: parseInt(e.target.value) || 0})}
                className="w-32 px-4 py-3 border-2 border-stone-400 rounded-lg focus:border-stone-600 focus:ring-2 focus:ring-stone-200 outline-none text-center text-2xl font-bold"
              />
              <span className="text-lg font-semibold text-stone-700">ساعة</span>
              
              <div className="flex-1 bg-white rounded-lg p-3 border border-stone-200">
                <div className="text-xs text-stone-600 mb-1">الافتراضي: 24 ساعة (يوم واحد)</div>
                <div className="text-sm text-stone-700 font-semibold">
                  {limits.deceased_hours === 0 && '⚠️ بدون حد (يمكن الطلب فوراً)'}
                  {limits.deceased_hours > 0 && limits.deceased_hours < 24 && `✓ ${limits.deceased_hours} ساعة بين كل طلب`}
                  {limits.deceased_hours >= 24 && `✓ ${Math.floor(limits.deceased_hours / 24)} يوم بين كل طلب`}
                </div>
              </div>
            </div>
          </div>

          {/* Sick Prayer */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">🏥</div>
              <div className="flex-1">
                <h4 className="font-bold text-stone-800 text-lg">طلب الدعاء للمريض</h4>
                <p className="text-sm text-stone-600">المدة بين كل طلب دعاء لمريض والآخر</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="168"
                value={limits.sick_hours}
                onChange={(e) => setLimits({...limits, sick_hours: parseInt(e.target.value) || 0})}
                className="w-32 px-4 py-3 border-2 border-blue-400 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none text-center text-2xl font-bold"
              />
              <span className="text-lg font-semibold text-stone-700">ساعة</span>
              
              <div className="flex-1 bg-white rounded-lg p-3 border border-blue-200">
                <div className="text-xs text-stone-600 mb-1">الافتراضي: 6 ساعات</div>
                <div className="text-sm text-blue-700 font-semibold">
                  {limits.sick_hours === 0 && '⚠️ بدون حد (يمكن الطلب فوراً)'}
                  {limits.sick_hours > 0 && limits.sick_hours < 24 && `✓ ${limits.sick_hours} ساعة بين كل طلب`}
                  {limits.sick_hours >= 24 && `✓ ${Math.floor(limits.sick_hours / 24)} يوم بين كل طلب`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multiple Prayers Setting */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2 text-xl">
          🔄 الدعاء المتكرر
        </h3>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">🔁</div>
                <div>
                  <h4 className="font-bold text-stone-800 text-lg">السماح بالدعاء أكثر من مرة</h4>
                  <p className="text-sm text-stone-600">هل يمكن للمستخدم الدعاء لنفس الطلب عدة مرات؟</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-purple-200 mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowMultiplePrayers}
                    onChange={(e) => setAllowMultiplePrayers(e.target.checked)}
                    className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-stone-800">
                      {allowMultiplePrayers ? '✅ مفعّل' : '❌ معطّل'}
                    </span>
                    <p className="text-xs text-stone-600 mt-1">
                      {allowMultiplePrayers 
                        ? 'المستخدمون يمكنهم الدعاء لنفس الطلب عدة مرات'
                        : 'المستخدم يمكنه الدعاء مرة واحدة فقط لكل طلب (الافتراضي)'
                      }
                    </p>
                  </div>
                </label>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">ملاحظة مهمة:</p>
                    <p>إذا قمت بتفعيل هذا الخيار، سيتمكن المستخدمون من الدعاء لنفس الطلب عدة مرات، مما قد يؤثر على الإحصائيات ومعدل التفاعل.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          ⚡ إعدادات سريعة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setLimits({ prayer_hours: 1, deceased_hours: 12, sick_hours: 3 })}
            className="p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-300 rounded-lg transition-all text-right"
          >
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-bold text-stone-800 mb-1">حدود قصيرة</h4>
            <p className="text-xs text-stone-600">عام: 1 ساعة | متوفى: 12 ساعة | مريض: 3 ساعات</p>
          </button>

          <button
            onClick={() => setLimits({ prayer_hours: 3, deceased_hours: 24, sick_hours: 6 })}
            className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-300 rounded-lg transition-all text-right"
          >
            <div className="text-2xl mb-2">⚖️</div>
            <h4 className="font-bold text-stone-800 mb-1">الإعدادات الافتراضية</h4>
            <p className="text-xs text-stone-600">عام: 3 ساعات | متوفى: 24 ساعة | مريض: 6 ساعات</p>
          </button>

          <button
            onClick={() => setLimits({ prayer_hours: 6, deceased_hours: 48, sick_hours: 12 })}
            className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-2 border-orange-300 rounded-lg transition-all text-right"
          >
            <div className="text-2xl mb-2">🔒</div>
            <h4 className="font-bold text-stone-800 mb-1">حدود طويلة</h4>
            <p className="text-xs text-stone-600">عام: 6 ساعات | متوفى: 48 ساعة | مريض: 12 ساعة</p>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <span className="animate-spin">⏳</span>
              جاري الحفظ...
            </>
          ) : (
            <>
              <span>💾</span>
              حفظ الإعدادات
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="px-8 bg-stone-600 text-white py-4 rounded-lg hover:bg-stone-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <span>🔄</span>
          إعادة تعيين
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
          💡 نصائح مهمة:
        </h4>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>الحدود الزمنية تمنع إساءة استخدام النظام وتحافظ على جودة الطلبات</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>القيم الافتراضية متوازنة ومناسبة لمعظم الحالات</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>يمكنك وضع القيمة 0 لإزالة الحد الزمني تماماً (غير موصى به)</span>
          </li>
          <li className="flex items-start gap-2">
            <span>⚠️</span>
            <span>التغييرات ستطبق فوراً على جميع المستخدمين</span>
          </li>
        </ul>
      </div>
    </div>
  );
}