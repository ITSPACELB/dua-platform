'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  // ============================================================================
  // 🎨 الحالات
  // ============================================================================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  // ============================================================================
  // 🔐 التحقق من تسجيل الدخول المسبق
  // ============================================================================
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && (userRole === 'admin' || userRole === 'super_admin')) {
      // إذا كان مسجل دخول، توجيه مباشر للصفحة الرئيسية
      // (سيتم عرض AdminPage تلقائياً من خلال MenuBar)
      window.location.href = '/';
    } else {
      setChecking(false);
    }
  }, []);

  // ============================================================================
  // 📤 معالجة تسجيل الدخول
  // ============================================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // حفظ البيانات
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('user', JSON.stringify({
          id: data.userId,
          displayName: data.displayName,
          email: data.email,
        }));

        // التوجيه للصفحة الرئيسية
        window.location.href = '/';
      } else {
        setError(data.error || 'فشل تسجيل الدخول');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ⏳ شاشة التحميل
  // ============================================================================
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <p className="text-xl text-emerald-700 font-bold">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 🎨 الواجهة
  // ============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* البطاقة */}
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-emerald-200 overflow-hidden">
          
          {/* الهيدر */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-white mb-2">
              لوحة الإدارة
            </h1>
            <p className="text-emerald-100 text-lg">
              منصة يُجيب
            </p>
          </div>

          {/* النموذج */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* الخطأ */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-700 font-semibold text-lg">{error}</p>
                </div>
              )}

              {/* البريد الإلكتروني */}
              <div>
                <label className="block text-stone-700 font-bold mb-2 text-lg">
                  📧 البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:outline-none text-lg transition-colors"
                  placeholder="admin@example.com"
                  disabled={loading}
                />
              </div>

              {/* كلمة المرور */}
              <div>
                <label className="block text-stone-700 font-bold mb-2 text-lg">
                  🔑 كلمة المرور
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:outline-none text-lg transition-colors"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              {/* زر الدخول */}
              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full py-4 rounded-lg font-bold text-xl transition-all shadow-lg
                  ${loading 
                    ? 'bg-stone-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                  }
                `}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    جاري الدخول...
                  </span>
                ) : (
                  '🚀 تسجيل الدخول'
                )}
              </button>
            </form>
          </div>

          {/* الفوتر */}
          <div className="bg-stone-50 border-t-2 border-stone-200 p-6 text-center">
            <p className="text-stone-600 text-sm">
              تسجيل الدخول مخصص للمسؤولين فقط
            </p>
            <p className="text-stone-500 text-xs mt-2">
              © 2025 منصة يُجيب - جميع الحقوق محفوظة
            </p>
          </div>
        </div>

        {/* رابط العودة */}
        <div className="text-center mt-6">
          <button
            onClick={() => window.location.href = '/'}
            className="text-emerald-700 hover:text-emerald-900 font-semibold text-lg transition-colors"
          >
            ← العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}