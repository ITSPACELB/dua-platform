'use client'
import { useState } from 'react';
import IslamicBanner from '../shared/IslamicBanner';

export default function RegisterPage({ onRegister, onSwitchToLogin }) {
  // ============================================================================
  // 📝 حالة النموذج
  // ============================================================================
  const [formData, setFormData] = useState({
    fullName: '',
    motherName: '',
    phoneNumber: '',
    city: '',
    showFullName: true
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ============================================================================
  // 📤 معالجة التسجيل
  // ============================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const fullName = formData.fullName.trim();
    const motherName = formData.motherName.trim();

    // التحقق من الحقول المطلوبة
    if (!fullName || !motherName) {
      setErrorMessage('الرجاء إدخال اسمك الكامل واسم والدتك');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          motherName,
          phoneNumber: formData.phoneNumber.trim() || null,
          city: formData.city.trim() || null,
          showFullName: formData.showFullName
        })
      });

      const data = await response.json();

      if (response.ok) {
        // نجح التسجيل
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onRegister(data.user, data.token);
      } else {
        setErrorMessage(data.error || 'حدث خطأ أثناء التسجيل');
        setLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('خطأ في الاتصال بالخادم');
      setLoading(false);
    }
  };

  // ============================================================================
  // 🎨 واجهة المستخدم
  // ============================================================================
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <IslamicBanner />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border-2 border-stone-200 shadow-lg p-8 w-full max-w-2xl">
          
          {/* العنوان الرئيسي */}
          <h2 className="text-3xl font-bold text-stone-800 mb-8 text-center">
            📝 تسجيل حساب جديد
          </h2>

          {/* قسم الفوائد - قبل النموذج */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-bold text-emerald-800 mb-4 text-center">
              💡 لماذا التسجيل؟
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">📊</span>
                <p className="text-lg text-stone-700 leading-relaxed">
                  <strong>متابعة من دعا لك:</strong> شاهد عدد المؤمنين الذين دعوا لك اليوم
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">🏆</span>
                <p className="text-lg text-stone-700 leading-relaxed">
                  <strong>الحصول على شارات التوثيق:</strong> احصل على الشارة الزرقاء (80%+)، الخضراء (90%+)، أو الذهبية (98%+)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">⭐</span>
                <p className="text-lg text-stone-700 leading-relaxed">
                  <strong>إمكانية الدعاء الجماعي:</strong> ادعُ لجميع المؤمنين عند وصول نسبة التفاعل 95%
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">👑</span>
                <p className="text-lg text-stone-700 leading-relaxed">
                  <strong>إمكانية الدعاء الخاص:</strong> أرسل دعاءً خاصاً لشخص محدد عند وصول نسبة التفاعل 98%
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">📈</span>
                <p className="text-lg text-stone-700 leading-relaxed">
                  <strong>متابعة إحصائياتك:</strong> راقب عدد الأدعية التي قمت بها ونسبة تفاعلك
                </p>
              </div>
            </div>
          </div>

          {/* ملاحظة مهمة */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-8 text-center">
            <p className="text-lg text-blue-800 leading-relaxed">
              ℹ️ <strong>ملاحظة:</strong> يمكنك استخدام المنصة بدون تسجيل - التسجيل اختياري لكن يفتح مميزات إضافية
            </p>
          </div>

          {/* النموذج */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* رسالة الخطأ */}
            {errorMessage && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-shake">
                <p className="text-lg text-red-700 text-center font-semibold">
                  ⚠️ {errorMessage}
                </p>
              </div>
            )}

            {/* الاسم الكامل */}
            <div>
              <label className="block text-stone-700 font-bold mb-3 text-xl">
                الاسم الكامل *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="مثال: أحمد محمد العلي"
                className="w-full h-14 px-5 text-lg border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 focus:outline-none transition-all"
                disabled={loading}
                required
              />
            </div>

            {/* اسم الأم */}
            <div>
              <label className="block text-stone-700 font-bold mb-3 text-xl">
                اسم والدتك *
              </label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => setFormData({...formData, motherName: e.target.value})}
                placeholder="مثال: فاطمة"
                className="w-full h-14 px-5 text-lg border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 focus:outline-none transition-all"
                disabled={loading}
                required
              />
            </div>

            {/* رقم الهاتف */}
            <div>
              <label className="block text-stone-700 font-bold mb-3 text-xl">
                رقم الهاتف (اختياري)
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                placeholder="+964 XXX XXX XXXX مثال"
                className="w-full h-14 px-5 text-lg border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 focus:outline-none transition-all"
                disabled={loading}
                dir="ltr"
              />
              <p className="text-base text-stone-500 mt-2">
                💡 رقم الهاتف اختياري ويُستخدم لإرسال إشعارات مهمة فقط
              </p>
            </div>

            {/* المدينة */}
            <div>
              <label className="block text-stone-700 font-bold mb-3 text-xl">
                المدينة (اختياري)
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="مثال: بغداد"
                className="w-full h-14 px-5 text-lg border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 focus:outline-none transition-all"
                disabled={loading}
              />
            </div>

            {/* إظهار الاسم الكامل */}
            <div className="bg-stone-50 border-2 border-stone-200 rounded-xl p-5">
              <label className="flex items-center gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showFullName}
                  onChange={(e) => setFormData({...formData, showFullName: e.target.checked})}
                  className="w-6 h-6 text-emerald-600 border-2 border-stone-300 rounded focus:ring-4 focus:ring-emerald-200"
                  disabled={loading}
                />
                <span className="text-lg text-stone-700 font-semibold">
                  إظهار اسمي الكامل للمؤمنين
                </span>
              </label>
              <p className="text-base text-stone-500 mt-3 mr-10">
                إذا لم تختر هذا الخيار، سيظهر اسمك الأول فقط (مثال: أحمد...)
              </p>
            </div>

            {/* زر التسجيل */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="animate-spin">⏳</span>
                  جاري التسجيل...
                </span>
              ) : (
                '✅ تسجيل حساب جديد'
              )}
            </button>
          </form>

          {/* رابط تسجيل الدخول */}
          <div className="mt-8 text-center border-t-2 border-stone-200 pt-6">
            <p className="text-lg text-stone-600 mb-3">
              لديك حساب بالفعل؟
            </p>
            <button
              onClick={onSwitchToLogin}
              className="text-emerald-600 hover:text-emerald-700 font-bold text-xl transition-colors"
            >
              🔑 تسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}