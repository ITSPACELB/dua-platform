'use client'
import { useState } from 'react';
import { Shield, Lock, User } from 'lucide-react';

// ════════════════════════════════════════════════════════════
// 🔐 Admin Login - نظام بسيط وآمن
// ════════════════════════════════════════════════════════════

export default function AdminLogin({ onLoginSuccess }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // استدعاء API تسجيل الدخول
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success) {
        // حفظ Token و Role
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        
        // نجح تسجيل الدخول
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        } else {
          window.location.reload();
        }
      } else {
        setError(data.error || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('حدث خطأ في الاتصال. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Logo/Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center mb-4 shadow-2xl">
            <Shield className="w-14 h-14 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            لوحة تحكم الأدمن
          </h1>
          <p className="text-emerald-200">
            تسجيل دخول آمن
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-xl mb-6 text-center font-bold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username */}
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                <User className="w-4 h-4 inline ml-1" />
                اسم المستخدم
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                placeholder="admin"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-lg"
                required
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-bold mb-2 text-sm">
                <Lock className="w-4 h-4 inline ml-1" />
                كلمة المرور
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-lg"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري التحقق...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  دخول
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              🔒 نظام محمي وآمن
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}