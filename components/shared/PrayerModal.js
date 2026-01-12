'use client'
import { useState, useEffect, useRef } from 'react';
import PhoneInput from './PhoneInput';
import { quranQuotes } from '@/lib/quranQuotes';
import { getAllVersesByPurpose } from '@/lib/verses';

// ════════════════════════════════════════════════════════════
// 🕌 نافذة طلب الدعاء المنبثقة
// ════════════════════════════════════════════════════════════
// الأنواع: personal, friend, general, sick, deceased, collective
// الميزات:
// - أنيميشن slide down سلس (400ms)
// - إغلاق عند الضغط خارج النافذة أو ESC
// - تركيز تلقائي على أول حقل
// - اقتباسات قرآنية لكل نوع
// - حقول مختلفة حسب النوع
// - purpose field لكل الأنواع
// - parentName موحد (بدل motherName/fatherName)
// ════════════════════════════════════════════════════════════

export default function PrayerModal({ 
  isOpen, 
  onClose, 
  type = 'general',
  onSubmit,
  userLevel = 1,          // ✅ التعديل 1: إضافة prop للمستوى
  hasVerseAchievement = false // ✅ التعديل 1: إضافة prop للإنجاز
}) {
  // ═══════════════════════════════════════════════════════════
  // 🔧 الحالة والمراجع - ✅ التعديل 2: إضافة customVerse إلى state
  // ═══════════════════════════════════════════════════════════
  const [formData, setFormData] = useState({
    name: '',
    parentName: '',        // موحد (بدل motherName/fatherName)
    purpose: '',           // جديد
    customVerse: '',       // ✅ التعديل 2: حقل الآية المخصصة الجديد
    phone: '',
    relation: '',          // للمتوفى فقط
    date: '',              // للدعاء الجماعي
    time: '',              // للدعاء الجماعي
    intention: ''          // للدعاء الجماعي
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // ═══════════════════════════════════════════════════════════
  // 🎯 تركيز تلقائي عند الفتح
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ═══════════════════════════════════════════════════════════
  // 🔒 إغلاق عند الضغط على ESC
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // ═══════════════════════════════════════════════════════════
  // 🔄 إعادة تعيين النموذج عند الإغلاق - ✅ التعديل 3: إعادة تعيين customVerse
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        parentName: '',
        purpose: '',
        customVerse: '',   // ✅ التعديل 3: إعادة تعيين الحقل الجديد
        phone: '',
        relation: '',
        date: '',
        time: '',
        intention: ''
      });
    }
  }, [isOpen]);

  // ═══════════════════════════════════════════════════════════
  // 📝 معالجة تغيير الحقول
  // ═══════════════════════════════════════════════════════════
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ═══════════════════════════════════════════════════════════
  // 📤 إرسال النموذج
  // ═══════════════════════════════════════════════════════════
  const handleSubmit = async (withData = true) => {
    setIsSubmitting(true);
    
    try {
      const dataToSubmit = withData ? formData : {};
      await onSubmit({ type, ...dataToSubmit, withData });
      onClose();
    } catch (error) {
      console.error('Error submitting prayer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 🚫 إذا لم تكن مفتوحة، لا تعرض شيئاً
  // ═══════════════════════════════════════════════════════════
  if (!isOpen) return null;

  // ═══════════════════════════════════════════════════════════
  // 📖 الحصول على الاقتباس القرآني المناسب
  // ═══════════════════════════════════════════════════════════
  const quote = quranQuotes[type] || quranQuotes.general;

  // ═══════════════════════════════════════════════════════════
  // 🎨 محتوى النموذج حسب النوع
  // ═══════════════════════════════════════════════════════════
  const renderFormContent = () => {
    switch (type) {
      // ═══════════════════════════════════════════════════════
      // 🤲 دعاء شخصي - ✅ التعديل 4: إضافة قسم الآية المخصصة
      // ═══════════════════════════════════════════════════════
      case 'personal':
        return (
          <>
            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                اسمك <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="أدخل اسمك"
                required
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                الشهرة أو اسم الوالد (اختياري)
              </label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => handleChange('parentName', e.target.value)}
                placeholder="الشهرة أو اسم الوالد"
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
              <p className="text-sm text-emerald-700 mt-1 font-semibold">
                💡 يمكنك كتابة الشهرة أو اسم العائلة أو اسم الوالد
              </p>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                الغرض من الدعاء <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                required
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 bg-white"
                dir="rtl"
              >
                <option value="">اختر الغرض...</option>
                <option value="الرزق">الرزق</option>
                <option value="الزواج">الزواج</option>
                <option value="الفرج">الفرج</option>
                <option value="الذرية الصالحة">الذرية الصالحة</option>
                <option value="النصر">النصر</option>
                <option value="الحفظ">الحفظ</option>
                <option value="البركة">البركة</option>
                <option value="القوة">القوة</option>
                <option value="الهداية">الهداية</option>
                <option value="التوفيق">التوفيق</option>
                <option value="السكينة">السكينة</option>
                <option value="الصبر">الصبر</option>
                <option value="العلم">العلم</option>
                <option value="الحكمة">الحكمة</option>
                <option value="القبول">القبول</option>
                <option value="التيسير">التيسير</option>
                <option value="الأمان">الأمان</option>
                <option value="الستر">الستر</option>
              </select>
            </div>

{/* ✅ التعديل 4: قسم الآية المخصصة للمستخدمين Level 3 مع إنجاز ⭐⭐⭐ */}
{userLevel >= 3 && hasVerseAchievement && formData.purpose && (
  <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-2xl">👑</span>
      <div>
        <h4 className="text-base sm:text-lg font-bold text-purple-900">آية قرآنية مخصصة</h4>
        <p className="text-sm text-purple-700">ميزة خاصة للمستخدمين المميزين</p>
      </div>
    </div>
    
    <label className="block text-base sm:text-lg font-semibold text-purple-800 mb-2">
      اختر آية قرآنية (اختياري)
    </label>
    <select
      value={formData.customVerse}
      onChange={(e) => handleChange('customVerse', e.target.value)}
      className="w-full h-12 sm:h-14 px-4 border-2 border-purple-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-purple-500 bg-white"
      dir="rtl"
    >
      <option value="">-- اختر آية مناسبة --</option>
      {(() => {
        try {
          const verses = getAllVersesByPurpose ? getAllVersesByPurpose(formData.purpose) : [];
          return verses.map((verse, index) => {
            // ✅ تأكد من أن verse.text هو string
            const verseText = typeof verse.text === 'string' 
              ? verse.text 
              : typeof verse.text === 'object' && verse.text.text
                ? verse.text.text
                : 'آية قرآنية';
            
            const verseRef = verse.ref || verse.source || '';
            
            return (
              <option key={verse.id || index} value={verseText}>
                {verseText.substring(0, 60)}... {verseRef && `(${verseRef})`}
              </option>
            );
          });
        } catch (error) {
          console.error('Error loading verses:', error);
          return (
            <option disabled>حدث خطأ في تحميل الآيات</option>
          );
        }
      })()}
    </select>
    
    {formData.customVerse && (
      <div className="mt-4 p-4 bg-white border-2 border-purple-300 rounded-xl">
        <p className="text-sm font-bold text-purple-600 mb-2">📖 الآية المختارة:</p>
        <p className="text-purple-800 leading-loose text-base text-center" dir="rtl">
          {typeof formData.customVerse === 'string' 
            ? formData.customVerse 
            : formData.customVerse.text || 'آية قرآنية'}
        </p>
      </div>
    )}
  </div>
)}

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                رقم الهاتف (اختياري)
              </label>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => handleChange('phone', value)}
              />
              <p className="text-xs text-stone-500 mt-1">
                للتواصل في حال الاستجابة
              </p>
            </div>
          </>
        );

      // ═══════════════════════════════════════════════════════
      // ❤️ دعاء لصديق - ⚠️ لم يتغير (الكود الأصلي محفوظ)
      // ═══════════════════════════════════════════════════════
      case 'friend':
        return (
          <>
            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                اسم صديقك <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="أدخل اسم صديقك"
                required
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                الشهرة أو اسم الوالد (اختياري)
              </label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => handleChange('parentName', e.target.value)}
                placeholder="الشهرة أو اسم الوالد"
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
              <p className="text-sm text-emerald-700 mt-1 font-semibold">
                💡 يمكنك كتابة الشهرة أو اسم العائلة أو اسم الوالد
              </p>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                الغرض من الدعاء <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                required
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 bg-white"
                dir="rtl"
              >
                <option value="">اختر الغرض...</option>
                <option value="الرزق">الرزق</option>
                <option value="الزواج">الزواج</option>
                <option value="الفرج">الفرج</option>
                <option value="الذرية الصالحة">الذرية الصالحة</option>
                <option value="النصر">النصر</option>
                <option value="الحفظ">الحفظ</option>
                <option value="البركة">البركة</option>
                <option value="القوة">القوة</option>
                <option value="الهداية">الهداية</option>
                <option value="التوفيق">التوفيق</option>
                <option value="السكينة">السكينة</option>
                <option value="الصبر">الصبر</option>
                <option value="العلم">العلم</option>
                <option value="الحكمة">الحكمة</option>
                <option value="القبول">القبول</option>
                <option value="التيسير">التيسير</option>
                <option value="الأمان">الأمان</option>
                <option value="الستر">الستر</option>
              </select>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                رقم الهاتف (اختياري)
              </label>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => handleChange('phone', value)}
              />
              <p className="text-xs text-stone-500 mt-1">
                للتواصل في حال الاستجابة
              </p>
            </div>
          </>
        );

      // ═══════════════════════════════════════════════════════
      // 🤲 دعاء عام - ⚠️ لم يتغير (الكود الأصلي محفوظ)
      // ═══════════════════════════════════════════════════════
      case 'general':
        return (
          <>
            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                الاسم (اختياري)
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="أدخل اسمك"
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
              <p className="text-sm text-stone-600 mt-1">
                💡 يساعد الآخرين على معرفة من يدعون له
              </p>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                الشهرة أو اسم الوالد (اختياري)
              </label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => handleChange('parentName', e.target.value)}
                placeholder="الشهرة أو اسم الوالد"
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
              <p className="text-sm text-emerald-700 mt-1 font-semibold">
                💡 يمكنك كتابة الشهرة أو اسم العائلة أو اسم الوالد
              </p>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                الغرض من الدعاء <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                required
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 bg-white"
                dir="rtl"
              >
                <option value="">اختر الغرض...</option>
                <option value="الرزق">الرزق</option>
                <option value="الزواج">الزواج</option>
                <option value="الفرج">الفرج</option>
                <option value="الذرية الصالحة">الذرية الصالحة</option>
                <option value="النصر">النصر</option>
                <option value="الحفظ">الحفظ</option>
                <option value="البركة">البركة</option>
                <option value="القوة">القوة</option>
                <option value="الهداية">الهداية</option>
                <option value="التوفيق">التوفيق</option>
                <option value="السكينة">السكينة</option>
                <option value="الصبر">الصبر</option>
                <option value="العلم">العلم</option>
                <option value="الحكمة">الحكمة</option>
                <option value="القبول">القبول</option>
                <option value="التيسير">التيسير</option>
                <option value="الأمان">الأمان</option>
                <option value="الستر">الستر</option>
              </select>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                رقم الهاتف (اختياري)
              </label>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => handleChange('phone', value)}
              />
            </div>
          </>
        );

      // ═══════════════════════════════════════════════════════
      // 🏥 دعاء للمريض - ⚠️ لم يتغير (الكود الأصلي محفوظ)
      // ═══════════════════════════════════════════════════════
      case 'sick':
        return (
          <>
            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                اسم المريض (اختياري)
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="أدخل اسم المريض"
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
              <p className="text-sm text-stone-600 mt-1">
                ℹ️ إذا لم تدخل الاسم، سيظهر: "مريض يطلب دعاءكم"
              </p>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                الشهرة أو اسم الوالد (اختياري)
              </label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => handleChange('parentName', e.target.value)}
                placeholder="الشهرة أو اسم الوالد"
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
              <p className="text-sm text-emerald-700 mt-1 font-semibold">
                💡 يمكنك كتابة الشهرة أو اسم العائلة أو اسم الوالد
              </p>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                الغرض من الدعاء <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                required
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 bg-white"
                dir="rtl"
              >
                <option value="">اختر الغرض...</option>
                <option value="الشفاء العاجل">الشفاء العاجل</option>
                <option value="رفع البلاء">رفع البلاء</option>
                <option value="العافية">العافية</option>
                <option value="السلامة">السلامة</option>
              </select>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                رقم الهاتف (اختياري)
              </label>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => handleChange('phone', value)}
              />
            </div>
          </>
        );

      // ═══════════════════════════════════════════════════════
      // 🕊️ دعاء للميت - ⚠️ لم يتغير (الكود الأصلي محفوظ)
      // ═══════════════════════════════════════════════════════
      case 'deceased':
        return (
          <>
            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                اسم المتوفى <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="أدخل اسم المتوفى"
                required
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                الشهرة أو اسم الوالد <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => handleChange('parentName', e.target.value)}
                placeholder="الشهرة أو اسم الوالد"
                required
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
              <p className="text-sm text-emerald-700 mt-1 font-semibold">
                💡 يمكنك كتابة الشهرة أو اسم العائلة أو اسم الوالد
              </p>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                الغرض من الدعاء <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                required
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 bg-white"
                dir="rtl"
              >
                <option value="">اختر الغرض...</option>
                <option value="المغفرة">المغفرة</option>
                <option value="الرحمة">الرحمة</option>
                <option value="الجنة">الجنة</option>
                <option value="النور في القبر">النور في القبر</option>
                <option value="الفسحة">الفسحة</option>
                <option value="رفع الدرجات">رفع الدرجات</option>
              </select>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                صلة القرابة <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.relation}
                onChange={(e) => handleChange('relation', e.target.value)}
                required
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white"
                dir="rtl"
              >
                <option value="">اختر صلة القرابة</option>
                <option value="أب">أب</option>
                <option value="أم">أم</option>
                <option value="أخ">أخ</option>
                <option value="أخت">أخت</option>
                <option value="ابن">ابن</option>
                <option value="بنت">بنت</option>
                <option value="جد">جد</option>
                <option value="جدة">جدة</option>
                <option value="صديق">صديق</option>
                <option value="قريب">قريب</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                رقم الهاتف (اختياري)
              </label>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => handleChange('phone', value)}
              />
            </div>
          </>
        );

      // ═══════════════════════════════════════════════════════
      // ⭐ دعاء جماعي - ⚠️ لم يتغير (الكود الأصلي محفوظ)
      // ═══════════════════════════════════════════════════════
      case 'collective':
        return (
          <>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
              <h4 className="text-xl font-bold text-amber-900 mb-3">
                ✨ ما هو الدعاء الجماعي؟
              </h4>
              <p className="text-base text-amber-800 leading-relaxed">
                تحديد وقت معين يجتمع فيه المؤمنون للدعاء في نفس اللحظة، مما يزيد من قوة الدعاء وبركته
              </p>
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                التاريخ <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                الوقت <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                required
                className="w-full h-12 sm:h-14 px-4 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="ltr"
                style={{ textAlign: 'left' }}
              />
            </div>

            <div>
              <label className="block text-base sm:text-lg font-semibold text-stone-800 mb-2">
                النية (اختياري - لن تظهر للعامة)
              </label>
              <textarea
                value={formData.intention}
                onChange={(e) => handleChange('intention', e.target.value)}
                placeholder="اكتب نيتك الخاصة للدعاء..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl text-base sm:text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all resize-none"
                dir="rtl"
              />
              <p className="text-sm text-stone-600 mt-1">
                🔒 النية خاصة بك ولن يراها أحد غيرك
              </p>
            </div>

            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-emerald-900 mb-3">
                📢 ما الذي سيحدث؟
              </h4>
              <ul className="space-y-2 text-base text-emerald-800">
                <li className="flex items-start gap-2">
                  <span>🔔</span>
                  <span>سيتم إرسال إشعار لجميع المستخدمين</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>⏰</span>
                  <span>سيتم تذكيرهم قبل الموعد بـ 30 دقيقة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🤲</span>
                  <span>الجميع سيدعو في نفس الوقت المحدد</span>
                </li>
              </ul>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // ═══════════════════════════════════════════════════════════
  // ✅ التحقق من صحة النموذج - ⚠️ لم يتغير (الكود الأصلي محفوظ)
  // ═══════════════════════════════════════════════════════════
  const isFormValid = () => {
    switch (type) {
      case 'personal':
      case 'friend':
        return formData.name && formData.purpose;
      
      case 'general':
      case 'sick':
        return formData.purpose;
      
      case 'deceased':
        return formData.name && formData.parentName && formData.relation && formData.purpose;
      
      case 'collective':
        return formData.date && formData.time;
      
      default:
        return true;
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 🎨 واجهة المستخدم - ⚠️ لم يتغير (الكود الأصلي محفوظ)
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      {/* النافذة المنبثقة */}
      <div
        ref={modalRef}
        className="w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl animate-slide-down overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* الرأس */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 sm:p-6 md:p-8 text-white">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {type === 'personal' && '🤲 دعاء شخصي'}
              {type === 'friend' && '❤️ دعاء لصديق'}
              {type === 'general' && '🤲 اطلب دعاء'}
              {type === 'sick' && '🏥 دعاء لشفاء مريض'}
              {type === 'deceased' && '🕊️ دعاء لروح متوفى'}
              {type === 'collective' && '⭐ دعاء جماعي'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* الاقتباس القرآني */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-base sm:text-lg sm:text-xl font-semibold mb-1">{quote.text}</p>
            <p className="text-sm text-white/80">{quote.source}</p>
          </div>
        </div>

        {/* المحتوى */}
        <div className="p-4 sm:p-6 md:p-8 max-h-[55vh] sm:max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {renderFormContent()}
          </div>
        </div>

        {/* الأزرار */}
        <div className="p-4 sm:p-6 md:p-8 bg-stone-50 border-t-2 border-stone-200">
          {type === 'collective' ? (
            <button
              onClick={() => handleSubmit(true)}
              disabled={!isFormValid() || isSubmitting}
              className="w-full h-16 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xl font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? '⏳ جاري الإرسال...' : '⭐ عقد نية الدعاء الجماعي'}
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(true)}
              disabled={!isFormValid() || isSubmitting}
              className="w-full h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xl font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? '⏳ جاري الإرسال...' : '📤 إرسال الطلب'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}