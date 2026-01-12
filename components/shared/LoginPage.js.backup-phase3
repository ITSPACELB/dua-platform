'use client'
import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import IslamicBanner from '../shared/IslamicBanner';
import UniqueQuestionPicker from '../shared/UniqueQuestionPicker';

export default function LoginPage({ onLogin, onSwitchToRegister }) {
  // ============================================================================
  // 📝 حالة النموذج
  // ============================================================================
  const [formData, setFormData] = useState({ fullName: '', motherName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // ============================================================================
  // 🔐 للسؤال السري
  // ============================================================================
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [availableQuestions, setAvailableQuestions] = useState([]);

  // ============================================================================
  // 📤 معالجة الإرسال
  // ============================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin();
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const loginData = {
        fullName: formData.fullName.trim(),
        motherName: formData.motherName.trim()
      };

      // إضافة بيانات السؤال إن وُجدت
      if (selectedQuestion && questionAnswer) {
        loginData.uniqueQuestion = selectedQuestion;
        loginData.questionAnswer = questionAnswer.trim();
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await res.json();

      if (!res.ok) {
        // فحص إذا كان يحتاج سؤال سري
        if (data.requiresQuestion) {
          setAvailableQuestions(data.availableQuestions || []);
          setShowQuestionPicker(true);
          setLoading(false);
          return;
        }

        setError(data.error || 'حدث خطأ');
        setLoading(false);
        return;
      }

      // نجح تسجيل الدخول
      onLogin(data.user, data.token);
    } catch (err) {
      setError('فشل الاتصال بالخادم');
      setLoading(false);
    }
  };

  // ============================================================================
  // 🎨 واجهة السؤال السري
  // ============================================================================
  if (showQuestionPicker) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <IslamicBanner />
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-stone-200 p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🔐</div>
              <h2 className="text-xl font-semibold text-stone-800 mb-2">
                السؤال السري
              </h2>
              <p className="text-stone-600 text-sm">
                يوجد أكثر من حساب بهذا الاسم. اختر سؤالك السري.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <UniqueQuestionPicker
              selectedQuestion={selectedQuestion}
              onQuestionChange={setSelectedQuestion}
              questionAnswer={questionAnswer}
              onAnswerChange={setQuestionAnswer}
              availableQuestions={availableQuestions}
              disabled={loading}
              isLogin={true}
            />

            <button
              onClick={() => handleLogin()}
              disabled={loading || !selectedQuestion || !questionAnswer}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-400 text-white py-3 rounded-lg font-medium transition-colors mt-4"
            >
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>

            <button
              onClick={() => {
                setShowQuestionPicker(false);
                setSelectedQuestion('');
                setQuestionAnswer('');
                setLoading(false);
              }}
              className="w-full text-stone-600 hover:text-stone-800 py-2 mt-2"
            >
              ← رجوع
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 🎨 واجهة تسجيل الدخول الرئيسية
  // ============================================================================
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <IslamicBanner />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-stone-200 p-8">
          
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

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