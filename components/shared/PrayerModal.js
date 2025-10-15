'use client'
import { useState, useEffect, useRef } from 'react';
import PhoneInput from './PhoneInput';
import { quranQuotes } from '@/lib/quranQuotes';

// ════════════════════════════════════════════════════════════
// 🕌 نافذة طلب الدعاء المنبثقة
// ════════════════════════════════════════════════════════════
// الأنواع: general, sick, deceased, collective
// الميزات:
// - أنيميشن slide down سلس (400ms)
// - إغلاق عند الضغط خارج النافذة أو ESC
// - تركيز تلقائي على أول حقل
// - اقتباسات قرآنية لكل نوع
// - حقول مختلفة حسب النوع
// ════════════════════════════════════════════════════════════

export default function PrayerModal({ 
  isOpen, 
  onClose, 
  type = 'general',
  onSubmit 
}) {
  // ═══════════════════════════════════════════════════════════
  // 🔧 الحالة والمراجع
  // ═══════════════════════════════════════════════════════════
  const [formData, setFormData] = useState({
    name: '',
    motherName: '',
    fatherName: '',
    phone: '',
    relation: '',
    date: '',
    time: '',
    intention: ''
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
  // 🔄 إعادة تعيين النموذج عند الإغلاق
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        motherName: '',
        fatherName: '',
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
      // 🤲 دعاء عام
      // ═══════════════════════════════════════════════════════
      case 'general':
        return (
          <>
            <div>
              <label className="block text-lg font-semibold text-stone-800 mb-2">
                الاسم (اختياري)
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="أدخل اسمك"
                className="w-full h-14 px-4 border-2 border-stone-300 rounded-xl text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
              <p className="text-sm text-stone-600 mt-1">
                💡 يساعد الآخرين على معرفة من يدعون له
              </p>
            </div>

            <div>
              <label className="block text-lg font-semibold text-stone-800 mb-2">
                اسم الأم (اختياري)
              </label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => handleChange('motherName', e.target.value)}
                placeholder="اسم والدتك"
                className="w-full h-14 px-4 border-2 border-stone-300 rounded-xl text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-stone-800 mb-2">
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
      // 🏥 دعاء للمريض
      // ═══════════════════════════════════════════════════════
      case 'sick':
        return (
          <>
            <div>
              <label className="block text-lg font-semibold text-stone-800 mb-2">
                اسم المريض (اختياري)
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="أدخل اسم المريض"
                className="w-full h-14 px-4 border-2 border-stone-300 rounded-xl text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
              <p className="text-sm text-stone-600 mt-1">
                ℹ️ إذا لم تدخل الاسم، سيظهر: "مريض يطلب دعاءكم"
              </p>
            </div>

            <div>
              <label className="block text-lg font-semibold text-stone-800 mb-2">
                اسم الأم (اختياري)
              </label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => handleChange('motherName', e.target.value)}
                placeholder="اسم والدة المريض"
                className="w-full h-14 px-4 border-2 border-stone-300 rounded-xl text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-stone-800 mb-2">
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
      // 🕊️ دعاء للميت
      // ═══════════════════════════════════════════════════════
      case 'deceased':
        return (
          <>
            <div>
              <label className="block text-lg font-semibold text-stone-800 mb-2">
                اسم المتوفى <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="أدخل اسم المتوفى"
                required
                className="w-full h-14 px-4 border-2 border-stone-300 rounded-xl text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-stone-800 mb-2">
                اسم الأم <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => handleChange('motherName', e.target.value)}
                placeholder="اسم والدة المتوفى"
                required
                className="w-full h-14 px-4 border-2 border-stone-300 rounded-xl text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-stone-800 mb-2">
                صلة القرابة <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.relation}
                onChange={(e) => handleChange('relation', e.target.value)}
                required
                className="w-full h-14 px-4 border-2 border-stone-300 rounded-xl text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all bg-white"
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
              <label className="block text-lg font-semibold text-stone-800 mb-2">
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
      // ⭐ دعاء جماعي
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
              <label className="block text-lg font-semibold text-stone-800 mb-2">
                التاريخ <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full h-14 px-4 border-2 border-stone-300 rounded-xl text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-stone-800 mb-2">
                الوقت <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                required
                className="w-full h-14 px-4 border-2 border-stone-300 rounded-xl text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all"
                dir="ltr"
                style={{ textAlign: 'left' }}
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-stone-800 mb-2">
                النية (اختياري - لن تظهر للعامة)
              </label>
              <textarea
                value={formData.intention}
                onChange={(e) => handleChange('intention', e.target.value)}
                placeholder="اكتب نيتك الخاصة للدعاء..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl text-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 transition-all resize-none"
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
  // ✅ التحقق من صحة النموذج
  // ═══════════════════════════════════════════════════════════
  const isFormValid = () => {
    switch (type) {
      case 'deceased':
        return formData.name && formData.motherName && formData.relation;
      case 'collective':
        return formData.date && formData.time;
      default:
        return true; // الحقول اختيارية للأنواع الأخرى
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 🎨 واجهة المستخدم
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      {/* النافذة المنبثقة */}
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl animate-slide-down overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* الرأس */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-white">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-3xl font-bold">
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
            <p className="text-xl font-semibold mb-1">{quote.text}</p>
            <p className="text-sm text-white/80">{quote.source}</p>
          </div>
        </div>

        {/* المحتوى */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {renderFormContent()}
          </div>
        </div>

        {/* الأزرار */}
        <div className="p-8 bg-stone-50 border-t-2 border-stone-200">
          {type === 'collective' ? (
            <button
              onClick={() => handleSubmit(true)}
              disabled={!isFormValid() || isSubmitting}
              className="w-full h-16 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xl font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? '⏳ جاري الإرسال...' : '⭐ عقد نية الدعاء الجماعي'}
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={() => handleSubmit(true)}
                disabled={!isFormValid() || isSubmitting}
                className="flex-1 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xl font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? '⏳ جاري الإرسال...' : '📤 إرسال مع البيانات'}
              </button>
              
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="flex-1 h-16 bg-gradient-to-r from-stone-500 to-stone-600 hover:from-stone-600 hover:to-stone-700 text-white text-xl font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? '⏳ جاري الإرسال...' : '🔒 إرسال بدون بيانات'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}