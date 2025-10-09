// ===============================================
// ✍️ صفحة التسجيل (Register Page)
// تسجيل مستخدم جديد
// ===============================================

import { useState } from 'react';
import IslamicBanner from '../shared/IslamicBanner';
import UniqueQuestionPicker from '../shared/UniqueQuestionPicker';

export default function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: '',
    motherName: '',
    nickname: '',
    showFullName: true,
    city: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionAnswer, setQuestionAnswer] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.motherName) {
      alert('الرجاء إدخال الاسم الكامل واسم الأم');
      return;
    }
    
    await handleRegister();
  };

  const handleRegister = async () => {
    setLoading(true);
    
    try {
      // 1. Check uniqueness via API
      const checkResponse = await fetch('/api/auth/check-uniqueness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          motherName: formData.motherName,
          nickname: formData.nickname
        })
      });

      const checkData = await checkResponse.json();

      // 2. If duplicate → show UniqueQuestionPicker
      if (!checkData.isUnique) {
        setShowQuestionPicker(true);
        setLoading(false);
        return;
      }

      // 3. If unique → register
      const registerData = {
        fullName: formData.fullName,
        motherName: formData.motherName,
        nickname: formData.nickname,
        city: formData.city,
        showFullName: formData.showFullName,
        email: formData.email
      };

      // Add question data if it exists
      if (selectedQuestion && questionAnswer) {
        registerData.uniqueQuestion = selectedQuestion;
        registerData.questionAnswer = questionAnswer;
      }

      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });

      const result = await registerResponse.json();

      if (registerResponse.ok) {
        // 4. On success → saveAuth() + navigate('home')
        await onRegister(result);
      } else {
        alert(result.error || 'حدث خطأ أثناء التسجيل');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = (question, answer) => {
    setSelectedQuestion(question);
    setQuestionAnswer(answer);
    setShowQuestionPicker(false);
    // Continue registration with question data
    handleRegister();
  };

  if (showQuestionPicker) {
    return (
      <UniqueQuestionPicker
        onSubmit={handleQuestionSubmit}
        onCancel={() => {
          setShowQuestionPicker(false);
          setLoading(false);
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
          
          {/* 📝 العنوان */}
          <h2 className="text-2xl font-semibold text-stone-800 mb-6 text-center">
            معلوماتك للدعاء
          </h2>
          
          {/* 📋 النموذج */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* الاسم الكامل */}
            <div>
              <label className="block text-stone-800 font-medium mb-2">
                اسمك الكامل <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="محمد أحمد العلي"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors text-base"
                required
              />
            </div>
            
            {/* اسم الأم */}
            <div>
              <label className="block text-stone-800 font-medium mb-2">
                اسم والدتك <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => setFormData({...formData, motherName: e.target.value})}
                placeholder="فاطمة"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors text-base"
                required
              />
            </div>

            {/* الاسم الحركي */}
            <div>
              <label className="block text-stone-800 font-medium mb-2">
                الاسم الحركي (اختياري)
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                placeholder="كوكب، شمس، جبل، أبو جبل..."
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors text-base"
              />
              <p className="text-stone-700 text-sm mt-2">
                يمكنك اختيار اسم حركي للخصوصية. سيظهر هذا الاسم بدلاً من اسمك الحقيقي إن أردت
              </p>
            </div>
            
            {/* 💡 ملاحظة */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-stone-700 leading-relaxed">
                الدعاء بالاسم واسم الأم له قوة روحانية خاصة في كل الأديان
              </p>
            </div>
            
            {/* المدينة */}
            <div>
              <label className="block text-stone-800 font-medium mb-2">
                مدينتك (للتمييز إن لزم)
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="القاهرة"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors text-base"
              />
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-stone-800 font-medium mb-2">
                البريد الإلكتروني (اختياري)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="example@email.com"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors text-base"
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
              <span className="text-stone-700">
                أوافق على إظهار اسمي كاملاً للمؤمنين الذين سيدعون لي
              </span>
            </label>

            {/* 🚀 أزرار */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-400 text-white py-2.5 rounded-lg font-medium transition-colors text-base"
            >
              {loading ? 'جاري التسجيل...' : 'تسجيل ومتابعة إن شاء الله'}
            </button>
            
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="w-full text-stone-700 py-2 hover:text-stone-800 transition-colors"
            >
              لديك حساب؟ تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}