// ===============================================
// 🔑 صفحة تسجيل الدخول (Login Page)
// الدخول بالاسم واسم الأم
// ===============================================

import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import IslamicBanner from '../shared/IslamicBanner';

export default function LoginPage({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({ fullName: '', motherName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'حدث خطأ');
        setLoading(false);
        return;
      }

      onLogin(data.user, data.token);
    } catch (err) {
      setError('فشل الاتصال بالخادم');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* 🕌 البانر */}
      <IslamicBanner />
      
      {/* 📄 المحتوى */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-stone-200 p-8">
          
          {/* 🎨 الأيقونة */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-stone-800 mb-2">
              تسجيل الدخول
            </h1>
            <p className="text-stone-600 text-sm">
              أدخل بياناتك للوصول إلى حسابك
            </p>
          </div>

          {/* ⚠️ رسالة الخطأ */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* 📋 النموذج */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-stone-700 font-medium mb-2 text-sm">
                الاسم الكامل
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="محمد أحمد العلي"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-stone-700 font-medium mb-2 text-sm">
                اسم الأم
              </label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => setFormData({...formData, motherName: e.target.value})}
                placeholder="فاطمة"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-400 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>

          {/* 🔗 رابط التسجيل */}
          <div className="mt-6 pt-6 border-t border-stone-200 text-center">
            <p className="text-stone-600 text-sm mb-3">
              ليس لديك حساب؟
            </p>
            <button
              onClick={onSwitchToRegister}
              className="w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-lg font-medium transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              إنشاء حساب جديد
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}