'use client'
import { useState, useEffect } from 'react';
import PhoneInput from '../shared/PhoneInput';
import { countries } from '@/lib/countries';

// ════════════════════════════════════════════════════════════
// 👤 صفحة معلوماتك الشخصية
// ════════════════════════════════════════════════════════════
// الميزات:
// - نموذج كامل للمعلومات الشخصية
// - حقول: الاسم، اسم الأم، اسم الأب، البريد، العمر، الدولة، الهاتف
// - استخدام مكون PhoneInput للهاتف
// - تصميم احترافي ونظيف
// - حفظ البيانات في قاعدة البيانات
// ════════════════════════════════════════════════════════════

export default function ProfileInfoPage({ user }) {
  // ═══════════════════════════════════════════════════════════
  // 🔧 الحالة
  // ═══════════════════════════════════════════════════════════
  const [formData, setFormData] = useState({
    fullName: '',
    motherName: '',
    fatherName: '',
    email: '',
    age: '',
    country: '',
    phone: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(true);

  // ═══════════════════════════════════════════════════════════
  // 🎯 تحميل البيانات الحالية عند فتح الصفحة
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          setFormData({
            fullName: data.profile.full_name || '',
            motherName: data.profile.mother_name || '',
            fatherName: data.profile.father_name || '',
            email: data.profile.email || '',
            age: data.profile.age || '',
            country: data.profile.country || '',
            phone: data.profile.phone || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 📝 معالجة تغيير الحقول
  // ═══════════════════════════════════════════════════════════
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // إخفاء رسالة الحفظ عند التعديل
    if (saveMessage.text) {
      setSaveMessage({ type: '', text: '' });
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 💾 حفظ البيانات
  // ═══════════════════════════════════════════════════════════
  const handleSave = async (e) => {
    e.preventDefault();

    // التحقق من الحقول الإلزامية
    if (!formData.fullName.trim() || !formData.motherName.trim()) {
      setSaveMessage({
        type: 'error',
        text: '⚠️ الاسم الكامل واسم الأم مطلوبان'
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          motherName: formData.motherName.trim(),
          fatherName: formData.fatherName.trim(),
          email: formData.email.trim(),
          age: formData.age ? parseInt(formData.age) : null,
          country: formData.country,
          phone: formData.phone
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSaveMessage({
          type: 'success',
          text: '✅ تم حفظ معلوماتك بنجاح'
        });
        
        // إخفاء الرسالة بعد 5 ثواني
        setTimeout(() => {
          setSaveMessage({ type: '', text: '' });
        }, 5000);
      } else {
        setSaveMessage({
          type: 'error',
          text: `❌ ${data.error || 'حدث خطأ أثناء الحفظ'}`
        });
      }
    } catch (error) {
      console.error('Save profile error:', error);
      setSaveMessage({
        type: 'error',
        text: '❌ حدث خطأ في الاتصال'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // ⏳ شاشة التحميل
  // ═══════════════════════════════════════════════════════════
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⏳</div>
          <p className="text-xl text-stone-600">جاري تحميل معلوماتك...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 🎨 واجهة المستخدم
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-emerald-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* ═══════════════════════════════════════════════════════ */}
        {/* العنوان */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-4xl font-bold text-stone-800 mb-2">
            معلوماتك الشخصية
          </h1>
          <p className="text-lg text-stone-600">
            قم بتحديث بياناتك للحصول على تجربة أفضل
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* النموذج */}
        {/* ═══════════════════════════════════════════════════════ */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl border-2 border-stone-200 shadow-xl p-8">
          <div className="space-y-6">
            
            {/* الاسم الكامل */}
            <div>
              <label className="block text-lg font-bold text-stone-800 mb-2">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="أدخل اسمك الكامل"
                required
                className="w-full h-14 px-4 border-2 border-stone-300 rounded-xl text-lg font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
            </div>

            {/* اسم الأم */}
            <div>
              <label className="block text-lg font-bold text-stone-800 mb-2">
                اسم الأم <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => handleChange('motherName', e.target.value)}
                placeholder="اسم والدتك"
                required
                className="w-full h-14 px-4 border-2 border-stone-300 rounded-xl text-lg font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
            </div>

            {/* اسم الأب */}
            <div>
              <label className="block text-lg font-bold text-stone-800 mb-2">
                اسم الأب (اختياري)
              </label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => handleChange('fatherName', e.target.value)}
                placeholder="اسم والدك"
                className="w-full h-14 px-4 border-2 border-stone-300 rounded-xl text-lg font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-lg font-bold text-stone-800 mb-2">
                البريد الإلكتروني (اختياري)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="example@email.com"
                className="w-full h-14 px-4 border-2 border-stone-300 rounded-xl text-lg font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="ltr"
                style={{ textAlign: 'left' }}
              />
            </div>

            {/* العمر */}
            <div>
              <label className="block text-lg font-bold text-stone-800 mb-2">
                العمر (اختياري)
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="مثال: 25"
                min="1"
                max="120"
                className="w-full h-14 px-4 border-2 border-stone-300 rounded-xl text-lg font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="ltr"
                style={{ textAlign: 'left' }}
              />
            </div>

            {/* الدولة */}
            <div>
              <label className="block text-lg font-bold text-stone-800 mb-2">
                الدولة (اختياري)
              </label>
              <select
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full h-14 px-4 border-2 border-stone-300 rounded-xl text-lg font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white"
                dir="rtl"
              >
                <option value="">اختر دولتك</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* رقم الهاتف */}
            <div>
              <label className="block text-lg font-bold text-stone-800 mb-2">
                رقم الهاتف (اختياري)
              </label>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => handleChange('phone', value)}
              />
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* رسالة الحفظ */}
          {/* ═══════════════════════════════════════════════════════ */}
          {saveMessage.text && (
            <div className={`mt-6 p-4 rounded-xl border-2 ${
              saveMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-red-50 border-red-300 text-red-800'
            }`}>
              <p className="text-lg font-semibold text-center">
                {saveMessage.text}
              </p>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════ */}
          {/* زر الحفظ */}
          {/* ═══════════════════════════════════════════════════════ */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-16 mt-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-2xl font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            {isSaving ? (
              <>
                <span className="animate-spin text-3xl">⏳</span>
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <span className="text-3xl">💾</span>
                <span>حفظ المعلومات</span>
              </>
            )}
          </button>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* ملاحظة */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <p className="text-base text-amber-800 text-center">
              ℹ️ معلوماتك آمنة ومحمية. سيتم استخدامها فقط لتحسين تجربتك في المنصة
            </p>
          </div>
        </form>

      </div>
    </div>
  );
}