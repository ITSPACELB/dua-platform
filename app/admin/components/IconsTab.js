'use client'
import { useState, useEffect } from 'react';

export default function IconsTab() {
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadIcons();
  }, []);

  const loadIcons = () => {
    const token = localStorage.getItem('token');
    
    fetch('/api/admin/icons', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIcons(data.icons);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Load icons error:', err);
        setLoading(false);
      });
  };

  const handleUploadIcon = async (file, size) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('icon', file);
    formData.append('size', size);

    const token = localStorage.getItem('token');
    setUploading(true);

    try {
      const response = await fetch('/api/admin/icons', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ تم رفع الأيقونة ${size}x${size} بنجاح`);
        loadIcons();
      } else {
        alert('❌ ' + (data.error || 'فشل الرفع'));
      }
    } catch (err) {
      console.error('Upload icon error:', err);
      alert('❌ حدث خطأ أثناء رفع الأيقونة');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteIcon = (size) => {
    if (!confirm(`⚠️ هل تريد حذف الأيقونة ${size}x${size}؟`)) {
      return;
    }

    const token = localStorage.getItem('token');

    fetch('/api/admin/icons', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ size })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('✅ تم حذف الأيقونة');
          loadIcons();
        } else {
          alert('❌ ' + (data.error || 'فشل الحذف'));
        }
      })
      .catch(err => {
        console.error('Delete icon error:', err);
        alert('❌ حدث خطأ');
      });
  };

  const handleGenerateIcons = () => {
    if (!confirm('🎨 هل تريد توليد جميع الأيقونات تلقائياً من الأيقونة الرئيسية (512x512)؟\n\nسيتم إنشاء جميع الأحجام المطلوبة.')) {
      return;
    }

    const token = localStorage.getItem('token');
    setUploading(true);

    fetch('/api/admin/icons/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('✅ تم توليد جميع الأيقونات بنجاح');
          loadIcons();
        } else {
          alert('❌ ' + (data.error || 'فشل التوليد'));
        }
        setUploading(false);
      })
      .catch(err => {
        console.error('Generate icons error:', err);
        alert('❌ حدث خطأ');
        setUploading(false);
      });
  };

  const iconSizes = [
    { size: 72, usage: 'أيقونة صغيرة - iOS' },
    { size: 96, usage: 'أيقونة متوسطة - Android' },
    { size: 128, usage: 'أيقونة - Chrome Web Store' },
    { size: 144, usage: 'أيقونة كبيرة - Windows' },
    { size: 152, usage: 'أيقونة - iPad' },
    { size: 192, usage: 'أيقونة - Android Home Screen' },
    { size: 384, usage: 'أيقونة كبيرة - High DPI' },
    { size: 512, usage: 'أيقونة رئيسية - PWA' }
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 animate-pulse">🎨</div>
        <p className="text-stone-600">جاري تحميل الأيقونات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          🎨 إدارة أيقونات المنصة
        </h2>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl shadow-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">🎯</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">أيقونات PWA والموبايل</h3>
            <p className="text-pink-100 text-sm mb-3">
              إدارة أيقونات التطبيق التي تظهر على الشاشة الرئيسية للأجهزة المختلفة
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-sm">
              <p className="mb-2">💡 <strong>متطلبات الأيقونات:</strong></p>
              <ul className="space-y-1 text-pink-100">
                <li>• <strong>الصيغة:</strong> PNG بخلفية شفافة</li>
                <li>• <strong>الحجم:</strong> مربع (مثلاً: 512x512 بكسل)</li>
                <li>• <strong>التصميم:</strong> بسيط وواضح يظهر جيداً بأحجام صغيرة</li>
                <li>• <strong>الألوان:</strong> متناسقة مع هوية المنصة</li>
              </ul>
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
            onClick={handleGenerateIcons}
            disabled={uploading}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>✨</span>
            توليد جميع الأحجام تلقائياً
          </button>
          <div className="flex-1"></div>
          <div className="bg-stone-100 px-4 py-3 rounded-lg text-sm text-stone-700 font-semibold">
            {icons.length} / {iconSizes.length} أيقونة موجودة
          </div>
        </div>
        <p className="text-xs text-stone-500 mt-3">
          💡 قم برفع الأيقونة الرئيسية (512x512) أولاً، ثم اضغط "توليد جميع الأحجام" لإنشاء باقي الأحجام تلقائياً
        </p>
      </div>

      {/* Icons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {iconSizes.map(({ size, usage }) => {
          const existingIcon = icons.find(icon => icon.size === size);
          
          return (
            <div
              key={size}
              className={`bg-white border-2 rounded-xl shadow-md hover:shadow-lg transition-all p-6 ${
                existingIcon ? 'border-green-400' : 'border-stone-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon Preview */}
                <div className="flex-shrink-0">
                  {existingIcon ? (
                    <div className="relative">
                      <img
                        src={existingIcon.url}
                        alt={`Icon ${size}x${size}`}
                        className="w-24 h-24 rounded-lg shadow-md border-2 border-green-500"
                      />
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-stone-100 border-2 border-dashed border-stone-300 flex items-center justify-center">
                      <span className="text-3xl text-stone-400">🎨</span>
                    </div>
                  )}
                </div>

                {/* Icon Info */}
                <div className="flex-1">
                  <h4 className="font-bold text-stone-800 text-lg mb-1">
                    {size}x{size} بكسل
                  </h4>
                  <p className="text-sm text-stone-600 mb-3">
                    {usage}
                  </p>

                  {existingIcon ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                          ✓ موجودة
                        </span>
                        <span className="text-stone-500">
                          {(existingIcon.fileSize / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <label className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer text-center text-sm font-semibold">
                          <input
                            type="file"
                            accept="image/png"
                            onChange={(e) => e.target.files[0] && handleUploadIcon(e.target.files[0], size)}
                            className="hidden"
                            disabled={uploading}
                          />
                          🔄 استبدال
                        </label>
                        <button
                          onClick={() => handleDeleteIcon(size)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="block">
                      <input
                        type="file"
                        accept="image/png"
                        onChange={(e) => e.target.files[0] && handleUploadIcon(e.target.files[0], size)}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-2 px-4 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all cursor-pointer text-center text-sm font-semibold">
                        📤 رفع الأيقونة
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3 animate-spin">⏳</div>
          <p className="text-blue-700 font-semibold">جاري المعالجة...</p>
          <p className="text-sm text-blue-600 mt-1">قد يستغرق هذا بضع ثوانٍ</p>
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          📐 إرشادات تصميم الأيقونات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-stone-700 flex items-center gap-2">
              ✅ افعل:
            </h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>استخدم تصميماً بسيطاً وواضحاً</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>اجعل الأيقونة مربعة الشكل</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>استخدم خلفية شفافة (PNG)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>استخدم ألوان المنصة (الأخضر الزمردي)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>اختبر الأيقونة بأحجام مختلفة</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-stone-700 flex items-center gap-2">
              ❌ لا تفعل:
            </h4>
            <ul className="space-y-2 text-sm text-stone-600">
              <li className="flex items-start gap-2">
                <span className="text-red-600">•</span>
                <span>لا تستخدم تفاصيل كثيرة جداً</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">•</span>
                <span>لا تستخدم نصوصاً صغيرة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">•</span>
                <span>لا تستخدم صوراً منخفضة الجودة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">•</span>
                <span>لا تستخدم خلفيات معقدة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">•</span>
                <span>لا تنسخ أيقونات تطبيقات أخرى</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-gradient-to-r from-stone-50 to-stone-100 border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          👁️ معاينة الأيقونات على الأجهزة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* iOS Preview */}
          <div className="bg-white rounded-xl p-6 border border-stone-200">
            <h4 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
              📱 iPhone/iPad
            </h4>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 text-center">
              {icons.find(i => i.size === 152) ? (
                <img
                  src={icons.find(i => i.size === 152).url}
                  alt="iOS Icon"
                  className="w-20 h-20 mx-auto rounded-2xl shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl">
                  🎨
                </div>
              )}
              <p className="text-xs text-stone-600 mt-3">يُجيب</p>
            </div>
          </div>

          {/* Android Preview */}
          <div className="bg-white rounded-xl p-6 border border-stone-200">
            <h4 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
              📱 Android
            </h4>
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-8 text-center">
              {icons.find(i => i.size === 192) ? (
                <img
                  src={icons.find(i => i.size === 192).url}
                  alt="Android Icon"
                  className="w-20 h-20 mx-auto rounded-2xl shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl">
                  🎨
                </div>
              )}
              <p className="text-xs text-stone-600 mt-3">يُجيب</p>
            </div>
          </div>

          {/* Desktop Preview */}
          <div className="bg-white rounded-xl p-6 border border-stone-200">
            <h4 className="font-semibold text-stone-700 mb-4 flex items-center gap-2">
              💻 سطح المكتب
            </h4>
            <div className="bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl p-8 text-center">
              {icons.find(i => i.size === 512) ? (
                <img
                  src={icons.find(i => i.size === 512).url}
                  alt="Desktop Icon"
                  className="w-20 h-20 mx-auto rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 mx-auto bg-white rounded-xl shadow-lg flex items-center justify-center text-3xl">
                  🎨
                </div>
              )}
              <p className="text-xs text-stone-600 mt-3">يُجيب</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          📊 إحصائيات الأيقونات
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600">{icons.length}</div>
            <div className="text-sm text-stone-600 mt-1">أيقونة موجودة</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-3xl font-bold text-red-600">{iconSizes.length - icons.length}</div>
            <div className="text-sm text-stone-600 mt-1">أيقونة مفقودة</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">
              {icons.length > 0 ? Math.round((icons.length / iconSizes.length) * 100) : 0}%
            </div>
            <div className="text-sm text-stone-600 mt-1">نسبة الاكتمال</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-600">
              {icons.reduce((sum, icon) => sum + (icon.fileSize || 0), 0) > 0
                ? (icons.reduce((sum, icon) => sum + (icon.fileSize || 0), 0) / 1024).toFixed(1)
                : 0}
            </div>
            <div className="text-sm text-stone-600 mt-1">KB إجمالي</div>
          </div>
        </div>
      </div>
    </div>
  );
}