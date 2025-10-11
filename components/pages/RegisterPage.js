'use client'
import { useState } from 'react';
import IslamicBanner from '../shared/IslamicBanner';
import UniqueQuestionPicker from '../shared/UniqueQuestionPicker';

const QUESTIONS = [
  'ما اسم والدك؟',
  'ما اسم جدك؟',
  'ما كنيتك؟',
  'ما اسم أخيك الأكبر؟',
  'كم أخ لديك؟',
  'كم أخت لديك؟',
  'ما هو عملك؟',
  'ما هي شهادتك الدراسية؟',
  'ما اسم مدينة ولادتك؟',
  'ما اسم أول مدرسة لك؟',
  'ما لون سيارتك الأولى؟',
  'ما اسم حيوانك الأليف الأول؟',
  'ما اسم أقرب صديق لك في الطفولة؟'
];

export default function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: '',
    motherName: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    
    const fullName = formData.fullName.trim();
    const motherName = formData.motherName.trim();

    if (!fullName || !motherName) {
      alert('الرجاء إدخال اسمك واسم والدتك');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // فحص التفرد
      const checkResponse = await fetch('/api/auth/check-uniqueness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, motherName })
      });

      const checkData = await checkResponse.json();

      if (checkData.isUnique) {
        // الاسم فريد - تسجيل مباشر
        await registerUser();
      } else {
        // الاسم مكرر - عرض الأسئلة
        setShowQuestions(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('خطأ في الاتصال');
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();

    if (!selectedQuestion || !questionAnswer.trim()) {
      alert('الرجاء اختيار سؤال وإدخال الإجابة');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // فحص تفرد السؤال والإجابة
      const checkResponse = await fetch('/api/auth/check-uniqueness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          motherName: formData.motherName.trim(),
          uniqueQuestion: selectedQuestion,
          questionAnswer: questionAnswer.trim()
        })
      });

      const checkData = await checkResponse.json();

      if (checkData.isUnique) {
        await registerUser();
      } else {
        setErrorMessage('هذا السؤال والإجابة مستخدمان بالفعل. اختر سؤالاً آخر أو غيّر الإجابة');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('خطأ في الاتصال');
      setLoading(false);
    }
  };

  const registerUser = async () => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          motherName: formData.motherName.trim(),
          city: formData.city.trim(),
          showFullName: true,
          uniqueQuestion: selectedQuestion || null,
          questionAnswer: questionAnswer.trim() || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onRegister(data.user, data.token);
      } else {
        alert(data.error || 'حدث خطأ أثناء التسجيل');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('خطأ في الاتصال');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <IslamicBanner />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-stone-200 p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">
            تسجيل حساب جديد
          </h2>

          {!showQuestions ? (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div>
                <label className="block text-stone-700 font-medium mb-2">
                  اسمك
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="مثال: أحمد"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-2">
                  اسم والدتك
                </label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => setFormData({...formData, motherName: e.target.value})}
                  placeholder="مثال: فاطمة"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-2">
                  مدينتك (اختياري)
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="مثال: الرياض"
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'جاري التحقق...' : 'متابعة'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleQuestionSubmit} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-stone-700 text-center">
                  ⚠️ هناك مستخدم آخر بنفس الاسم واسم الأم
                  <br />
                  اختر سؤالاً سرياً للتمييز
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 text-center">{errorMessage}</p>
                </div>
              )}

              <div>
                <label className="block text-stone-700 font-medium mb-2">
                  اختر سؤالاً سرياً
                </label>
                <select
                  value={selectedQuestion}
                  onChange={(e) => {
                    setSelectedQuestion(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  disabled={loading}
                >
                  <option value="">-- اختر سؤالاً --</option>
                  {QUESTIONS.map((q, idx) => (
                    <option key={idx} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              {selectedQuestion && (
                <div>
                  <label className="block text-stone-700 font-medium mb-2">
                    الإجابة
                  </label>
                  <input
                    type="text"
                    value={questionAnswer}
                    onChange={(e) => {
                      setQuestionAnswer(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="أدخل الإجابة"
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    disabled={loading}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'جاري التسجيل...' : 'تسجيل'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowQuestions(false);
                  setSelectedQuestion('');
                  setQuestionAnswer('');
                  setErrorMessage('');
                }}
                className="w-full text-stone-600 hover:text-stone-800 py-2"
              >
                ← رجوع
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={onSwitchToLogin}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              لديك حساب؟ تسجيل دخول
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
