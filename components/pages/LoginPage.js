// ===============================================
// 🔑 صفحة تسجيل الدخول (Login Page)
// الدخول بالاسم واسم الأم
// ===============================================

import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import IslamicBanner from '../shared/IslamicBanner';
import UniqueQuestionPicker from '../shared/UniqueQuestionPicker';

export default function LoginPage({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({ fullName: '', motherName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionAnswer, setQuestionAnswer] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin();
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Prepare login data
      const loginData = {
        fullName: formData.fullName,
        motherName: formData.motherName
      };

      // Add question data if it exists
      if (selectedQuestion && questionAnswer) {
        loginData.uniqueQuestion = selectedQuestion;
        loginData.questionAnswer = questionAnswer;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await res.json();

      if (!res.ok) {
        // 1. Check if multiple users exist
        if (data.requiresQuestion) {
          setShowQuestionPicker(true);
          setLoading(false);
          return;
        }

        setError(data.error || 'حدث خطأ');
        setLoading(false);
        return;
      }

      // 4. On success → saveAuth() + navigate('home')
      onLogin(data.user, data.token);
    } catch (err) {
      setError('فشل الاتصال بالخادم');
      setLoading(false);
    }
  };

  const handleQuestionSubmit = (question, answer) => {
    setSelectedQuestion(question);
    setQuestionAnswer(answer);
    setShowQuestionPicker(false);
    // Continue login with question data
    handleLogin();
  };

  if (showQuestionPicker) {
    return (
      <UniqueQuestionPicker
        onSubmit={handleQuestionSubmit}
        onCancel={() => {
          setShowQuestionPicker(false);
          setLoading(false);
          setSelectedQuestion(null);
          setQuestionAnswer('');
        }}
      />
    );
  }

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
            <p className="text-stone-700">
              أدخل بياناتك للوصول إلى حسابك
            </p>
          </div>

          {/* ⚠️ رسالة الخطأ */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* 📋 النموذج */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-stone-800 font-medium mb-2">
                الاسم الكامل
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="محمد أحمد العلي"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-base"
                required
              />
            </div>

            <div>
              <label className="block text-stone-800 font-medium mb-2">
                اسم الأم
              </label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => setFormData({...formData, motherName: e.target.value})}
                placeholder="فاطمة"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-base"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-400 text-white py-3 rounded-lg font-medium transition-colors text-base"
            >
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>

          {/* 🔗 رابط التسجيل */}
          <div className="mt-6 pt-6 border-t border-stone-200 text-center">
            <p className="text-stone-700 mb-3">
              ليس لديك حساب؟
            </p>
            <button
              onClick={onSwitchToRegister}
              className="w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 py-3 rounded-lg font-medium transition-colors"
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