// ===============================================
// ✍️ صفحة التسجيل (Register Page)
// تسجيل مستخدم جديد
// ===============================================

import { useState } from 'react';
import IslamicBanner from '../shared/IslamicBanner';

export default function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: '',
    motherName: '',
    showFullName: true,
    city: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.motherName) {
      alert('الرجاء إدخال الاسم الكامل واسم الأم');
      return;
    }
    
    setLoading(true);
    await onRegister(formData);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* 🕌 البانر */}
      <IslamicBanner />
      
      {/* 📄 المحتوى */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-stone-200 p-8">
          
          {/* 📝 العنوان */}
          <h2 className="text-xl font-semibold text-stone-800 mb-6 text-center">
            معلوماتك للدعاء
          </h2>
          
          {/* 📋 النموذج */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* الاسم الكامل */}
            <div>
              <label className="block text-stone-700 font-medium mb-2 text-sm">
                اسمك الكامل <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="محمد أحمد العلي"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
                required
              />
            </div>
            
            {/* اسم الأم */}
            <div>
              <label className="block text-stone-700 font-medium mb-2 text-sm">
                اسم والدتك <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => setFormData({...formData, motherName: e.target.value})}
                placeholder="فاطمة"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
                required
              />
            </div>
            
            {/* 💡 ملاحظة */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-stone-700 leading-relaxed">
                الدعاء بالاسم واسم الأم له قوة روحانية خاصة في كل الأديان
              </p>
            </div>
            
            {/* المدينة */}
            <div>
              <label className="block text-stone-700 font-medium mb-2 text-sm">
                مدينتك (للتمييز إن لزم)
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="القاهرة"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
              />
            </div>
            
            {/* ✅ إظهار الاسم */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showFullName}
                onChange={(e) => setFormData({...formData, showFullName: e.target.checked})}
                className="mt-1 w-4 h-4 text-emerald-600 border-stone-300 rounded focus:ring-emerald-500"
              />
              <span className="text-stone-700 text-sm">
                أوافق على إظهار اسمي كاملاً للمؤمنين الذين سيدعون لي
              </span>
            </label>

            {/* 🚀 أزرار */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-400 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              {loading ? 'جاري التسجيل...' : 'تسجيل ومتابعة إن شاء الله'}
            </button>
            
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="w-full text-stone-600 py-2 hover:text-stone-800 transition-colors"
            >
              لديك حساب؟ تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}