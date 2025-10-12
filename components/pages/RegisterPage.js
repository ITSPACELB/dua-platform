'use client'
import { useState } from 'react';
import IslamicBanner from '../shared/IslamicBanner';
import UniqueQuestionPicker from '../shared/UniqueQuestionPicker';
import PhoneInput from '../shared/PhoneInput';

export default function RegisterPage({ onRegister, onSwitchToLogin }) {
  // ============================================================================
  // 📝 حالة الخطوات
  // ============================================================================
  const [step, setStep] = useState(1); // 1: بيانات أساسية، 2: سؤال سري، 3: رقم هاتف
  
  const [formData, setFormData] = useState({
    fullName: '',
    motherName: '',
    city: '',
    nickname: '',
    phoneNumber: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // ============================================================================
  // 🔐 للسؤال السري
  // ============================================================================
  const [requiresQuestion, setRequiresQuestion] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [questionAnswer, setQuestionAnswer] = useState('');
  const [existingQuestions, setExistingQuestions] = useState([]);

  // ============================================================================
  // 📱 رقم الهاتف
  // ============================================================================
  const [showPhoneStep, setShowPhoneStep] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [registeredToken, setRegisteredToken] = useState(null);

  // ============================================================================
  // 📤 الخطوة 1: إرسال البيانات الأساسية
  // ============================================================================
  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    
    const fullName = formData.fullName.trim();
    const motherName = formData.motherName.trim();

    if (!fullName || !motherName) {
      setErrorMessage('الرجاء إدخال اسمك واسم والدتك');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          motherName,
          city: formData.city.trim(),
          nickname: formData.nickname.trim(),
          phoneNumber: formData.phoneNumber.trim() || null,
          showFullName: true
        })
      });

      const registerData = await registerResponse.json();

      if (registerResponse.ok) {
        // نجح التسجيل
        setRegisteredUser(registerData.user);
        setRegisteredToken(registerData.token);
        
        if (!formData.phoneNumber) {
          // الانتقال لخطوة الهاتف
          setShowPhoneStep(true);
          setStep(3);
          setLoading(false);
        } else {
          // تم إدخال الهاتف مسبقاً - تسجيل دخول مباشر
          localStorage.setItem('token', registerData.token);
          localStorage.setItem('user', JSON.stringify(registerData.user));
          onRegister(registerData.user, registerData.token);
        }
      } else if (registerData.requiresQuestion) {
        // يحتاج سؤال سري
        setRequiresQuestion(true);
        setExistingQuestions(registerData.existingQuestions || []);
        setStep(2);
        setLoading(false);
      } else {
        setErrorMessage(registerData.error || 'حدث خطأ');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('خطأ في الاتصال');
      setLoading(false);
    }
  };

  // ============================================================================
  // 🔐 الخطوة 2: إرسال مع السؤال السري
  // ============================================================================
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();

    if (!selectedQuestion || !questionAnswer.trim()) {
      setErrorMessage('الرجاء اختيار سؤال وإدخال الإجابة');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          motherName: formData.motherName.trim(),
          city: formData.city.trim(),
          nickname: formData.nickname.trim(),
          phoneNumber: formData.phoneNumber.trim() || null,
          showFullName: true,
          uniqueQuestion: selectedQuestion,
          questionAnswer: questionAnswer.trim()
        })
      });

      const registerData = await registerResponse.json();

      if (registerResponse.ok) {
        setRegisteredUser(registerData.user);
        setRegisteredToken(registerData.token);
        
        if (!formData.phoneNumber) {
          // الانتقال لخطوة الهاتف
          setShowPhoneStep(true);
          setStep(3);
          setLoading(false);
        } else {
          localStorage.setItem('token', registerData.token);
          localStorage.setItem('user', JSON.stringify(registerData.user));
          onRegister(registerData.user, registerData.token);
        }
      } else {
        setErrorMessage(registerData.error || 'حدث خطأ');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('خطأ في الاتصال');
      setLoading(false);
    }
  };

  // ============================================================================
  // 📱 الخطوة 3: إضافة رقم الهاتف (اختياري)
  // ============================================================================
  const handlePhoneSubmit = async () => {
    if (!formData.phoneNumber.trim()) {
      // تخطي الهاتف
      localStorage.setItem('token', registeredToken);
      localStorage.setItem('user', JSON.stringify(registeredUser));
      onRegister(registeredUser, registeredToken);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${registeredToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        localStorage.setItem('token', registeredToken);
        localStorage.setItem('user', JSON.stringify(registeredUser));
        onRegister(registeredUser, registeredToken);
      } else {
        setErrorMessage(data.error || 'حدث خطأ');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('خطأ في الاتصال');
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
        <div className="bg-white rounded-lg border border-stone-200 p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">
            تسجيل حساب جديد
          </h2>

          {/* الخطوة 1: البيانات الأساسية */}
          {step === 1 && (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 text-center">{errorMessage}</p>
                </div>
              )}

              <div>
                <label className="block text-stone-700 font-medium mb-2">
                  اسمك الكامل
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="مثال: أحمد محمد العلي"
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
                  الكنية (اختياري)
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                  placeholder="مثال: أبو محمد"
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

              <div>
                <label className="block text-stone-700 font-medium mb-2">
                  رقم الهاتف (اختياري - مكافأة 5 نقاط 🎁)
                </label>
                <PhoneInput
                  value={formData.phoneNumber}
                  onChange={(value) => setFormData({...formData, phoneNumber: value})}
                  placeholder="+966 50 123 4567"
                  disabled={loading}
                />
                <p className="text-xs text-stone-500 mt-1">
                  احصل على 5 نقاط مكافأة عند إدخال رقم هاتف صحيح
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'جاري التسجيل...' : 'متابعة'}
              </button>
            </form>
          )}

          {/* الخطوة 2: السؤال السري */}
          {step === 2 && (
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

              <UniqueQuestionPicker
                selectedQuestion={selectedQuestion}
                onQuestionChange={setSelectedQuestion}
                questionAnswer={questionAnswer}
                onAnswerChange={setQuestionAnswer}
                existingQuestions={existingQuestions}
                disabled={loading}
              />

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
                  setStep(1);
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

          {/* الخطوة 3: رقم الهاتف */}
          {step === 3 && showPhoneStep && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-emerald-700 text-center">
                  ✅ تم التسجيل بنجاح!
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-stone-700 text-center">
                  🎁 أضف رقم هاتفك واحصل على 5 نقاط مكافأة
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 text-center">{errorMessage}</p>
                </div>
              )}

              <div>
                <label className="block text-stone-700 font-medium mb-2">
                  رقم الهاتف (اختياري)
                </label>
                <PhoneInput
                  value={formData.phoneNumber}
                  onChange={(value) => setFormData({...formData, phoneNumber: value})}
                  placeholder="+966 50 123 4567"
                  disabled={loading}
                />
              </div>

              <button
                onClick={handlePhoneSubmit}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'جاري الحفظ...' : formData.phoneNumber.trim() ? 'حفظ والمتابعة' : 'تخطي'}
              </button>
            </div>
          )}

          {/* رابط تسجيل الدخول */}
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