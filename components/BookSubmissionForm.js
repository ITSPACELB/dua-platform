import React, { useState, useRef, useEffect } from 'react';
import { 
  BookPlus, 
  User, 
  Phone, 
  Mail, 
  Globe, 
  BookOpen,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Loader,
  X,
  AlertCircle
} from 'lucide-react';

// ════════════════════════════════════════════════════════════
// 📚 نموذج طلب نشر كتاب - النسخة النهائية المثالية
// ════════════════════════════════════════════════════════════

export default function BookSubmissionForm({ onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1 = النموذج, 2 = التأكيد
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const errorRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [formData, setFormData] = useState({
    requester_name: '',
    requester_phone: '',
    requester_email: '',
    requester_country: '',
    book_title: '',
    book_author: '',
    book_description: '',
    book_category: 'دينية - عامة',
    book_language: 'ar',
    reason_for_publishing: '',
    is_author: false,
    additional_notes: ''
  });

  const categories = [
    'دينية - عامة',
    'دينية - قرآن وتفسير',
    'دينية - حديث',
    'دينية - فقه',
    'دينية - عقيدة',
    'دينية - سيرة',
    'دينية - أدعية وأذكار',
    'تربوية',
    'ثقافية',
    'علمية',
    'أدبية',
    'تاريخية',
    'أخرى'
  ];

  // ════════════════════════════════════════════════════════════
  // Scroll إلى رسالة الخطأ عند ظهورها
  // ════════════════════════════════════════════════════════════
  useEffect(() => {
    if (error && errorRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [error]);

  // ════════════════════════════════════════════════════════════
  // معالج التغيير
  // ════════════════════════════════════════════════════════════
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(null);
  };

  // ════════════════════════════════════════════════════════════
  // التحقق من البيانات
  // ════════════════════════════════════════════════════════════
  const validateForm = () => {
    if (!formData.requester_name.trim()) {
      setError('⚠️ الرجاء إدخال اسمك الكامل');
      return false;
    }
    
    if (!formData.requester_phone.trim()) {
      setError('⚠️ الرجاء إدخال رقم هاتفك');
      return false;
    }
    
    if (!formData.requester_email.trim()) {
      setError('⚠️ الرجاء إدخال بريدك الإلكتروني');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.requester_email)) {
      setError('⚠️ البريد الإلكتروني غير صحيح');
      return false;
    }
    
    if (!formData.book_title.trim()) {
      setError('⚠️ الرجاء إدخال عنوان الكتاب');
      return false;
    }
    
    if (!formData.book_author.trim()) {
      setError('⚠️ الرجاء إدخال اسم المؤلف');
      return false;
    }
    
    if (!formData.book_description.trim() || formData.book_description.trim().length < 20) {
      setError('⚠️ الرجاء إدخال وصف للكتاب (20 حرف على الأقل)');
      return false;
    }

    return true;
  };

  // ════════════════════════════════════════════════════════════
  // إرسال الطلب
  // ════════════════════════════════════════════════════════════
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    console.log('📝 بدء إرسال الطلب...', formData);

    if (!validateForm()) {
      console.log('❌ فشل التحقق من البيانات');
      return;
    }

    setLoading(true);
    console.log('🔄 جاري الإرسال...');

    try {
      const requestBody = {
        ...formData,
        book_file_url: 'سيتم التواصل',
        book_cover_url: null,
        book_pages: null,
        book_size_mb: null
      };

      console.log('📤 البيانات المرسلة:', requestBody);

      const response = await fetch('/api/library/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 استجابة السيرفر:', response.status);

      const data = await response.json();
      console.log('📊 البيانات المستلمة:', data);

      if (data.success) {
        console.log('✅ نجح الإرسال!');
        setStep(2);
        if (onSuccess) onSuccess();
      } else {
        console.error('❌ خطأ من السيرفر:', data.error);
        setError(data.error || '❌ حدث خطأ أثناء إرسال الطلب');
      }
    } catch (err) {
      console.error('❌ خطأ في الاتصال:', err);
      setError('❌ حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      console.log('✅ انتهى الإرسال');
    }
  };

  // ════════════════════════════════════════════════════════════
  // صفحة التأكيد
  // ════════════════════════════════════════════════════════════
  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl animate-fadeIn">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle className="w-14 h-14 text-white" strokeWidth={3} />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            تم إرسال طلبك بنجاح! 🎉
          </h2>
          
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6">
            <p className="text-green-900 font-bold mb-2">✅ استلمنا طلبك</p>
            <p className="text-green-800 text-sm">
              سنتواصل معك خلال 24-48 ساعة
            </p>
          </div>
          
          <p className="text-gray-700 mb-6 leading-relaxed">
            شكراً لك على اقتراح كتاب للنشر في مكتبتنا.
            <br />
            <strong className="text-emerald-600">سنتواصل معك قريباً</strong> عبر البريد الإلكتروني أو الهاتف لترتيب تفاصيل رفع الكتاب.
          </p>
          
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            حسناً، شكراً
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // النموذج الرئيسي
  // ════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[95vh] flex flex-col shadow-2xl">
        
        {/* Header - ثابت */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 sm:p-8 text-white rounded-t-3xl relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm"
            aria-label="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <BookPlus className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">اقترح كتاباً للنشر</h2>
            </div>
          </div>
          <p className="text-white/95 text-sm sm:text-base">
            املأ النموذج وسنتواصل معك لترتيب تفاصيل النشر
          </p>
        </div>

        {/* Content - قابل للـ scroll */}
        <div ref={scrollContainerRef} className="overflow-y-auto flex-1 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6" id="book-submission-form">
            
            {/* رسالة خطأ */}
            {error && (
              <div 
                ref={errorRef}
                className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 flex items-start gap-3 shadow-lg animate-shake"
              >
                <AlertCircle className="w-7 h-7 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-900 font-bold text-lg mb-1">تنبيه!</p>
                  <p className="text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* القسم 1: معلوماتك */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-200">
                <User className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  معلوماتك الشخصية
                </h3>
              </div>

              {/* الاسم */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  الاسم الكامل <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="requester_name"
                  value={formData.requester_name}
                  onChange={handleChange}
                  className="w-full px-4 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                  placeholder="أحمد محمد علي"
                  required
                />
              </div>

              {/* رقم الهاتف */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  <Phone className="w-4 h-4 inline ml-1" />
                  رقم الهاتف <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  name="requester_phone"
                  value={formData.requester_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                  placeholder="+961 70 123 456"
                  required
                />
              </div>

              {/* البريد الإلكتروني */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  <Mail className="w-4 h-4 inline ml-1" />
                  البريد الإلكتروني <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  name="requester_email"
                  value={formData.requester_email}
                  onChange={handleChange}
                  className="w-full px-4 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                  placeholder="example@email.com"
                  required
                />
              </div>

              {/* الدولة (اختياري) */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  <Globe className="w-4 h-4 inline ml-1" />
                  الدولة / المدينة <span className="text-gray-400 text-xs">(اختياري)</span>
                </label>
                <input
                  type="text"
                  name="requester_country"
                  value={formData.requester_country}
                  onChange={handleChange}
                  className="w-full px-4 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                  placeholder="لبنان - بيروت"
                />
              </div>
            </div>

            {/* القسم 2: معلومات الكتاب */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-200">
                <BookOpen className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  معلومات الكتاب
                </h3>
              </div>

              {/* عنوان الكتاب */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  عنوان الكتاب <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="book_title"
                  value={formData.book_title}
                  onChange={handleChange}
                  className="w-full px-4 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                  placeholder="حصن المسلم"
                  required
                />
              </div>

              {/* اسم المؤلف */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  اسم المؤلف <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="book_author"
                  value={formData.book_author}
                  onChange={handleChange}
                  className="w-full px-4 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
                  placeholder="سعيد بن علي القحطاني"
                  required
                />
              </div>

              {/* الوصف */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  <FileText className="w-4 h-4 inline ml-1" />
                  وصف مختصر للكتاب <span className="text-red-600">*</span>
                  <span className="text-gray-500 text-xs mr-2">(20 حرف على الأقل)</span>
                </label>
                <textarea
                  name="book_description"
                  value={formData.book_description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none resize-none transition-all"
                  placeholder="اكتب وصفاً موجزاً عن محتوى الكتاب وفائدته..."
                  required
                />
                <div className="text-xs text-gray-500 mt-2 text-left">
                  {formData.book_description.length} حرف
                </div>
              </div>

              {/* التصنيف واللغة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* التصنيف */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    التصنيف <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="book_category"
                    value={formData.book_category}
                    onChange={handleChange}
                    className="w-full px-4 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all bg-white"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* اللغة */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    اللغة <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="book_language"
                    value={formData.book_language}
                    onChange={handleChange}
                    className="w-full px-4 py-4 text-base sm:text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all bg-white"
                    required
                  >
                    <option value="ar">العربية 🇸🇦</option>
                    <option value="en">English 🇬🇧</option>
                    <option value="fr">Français 🇫🇷</option>
                    <option value="other">أخرى 🌍</option>
                  </select>
                </div>
              </div>
            </div>

            {/* القسم 3: معلومات إضافية */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-200">
                <FileText className="w-6 h-6 text-gray-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  معلومات إضافية <span className="text-gray-400 text-sm">(اختياري)</span>
                </h3>
              </div>

              {/* سبب النشر */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  لماذا تريد نشر هذا الكتاب؟
                </label>
                <textarea
                  name="reason_for_publishing"
                  value={formData.reason_for_publishing}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none resize-none transition-all"
                  placeholder="مثال: كتاب مفيد جداً في موضوع الأدعية اليومية..."
                />
              </div>

              {/* هل أنت المؤلف - يعمل بشكل مثالي مع مؤشر واضح */}
              <div 
                onClick={() => setFormData(prev => ({...prev, is_author: !prev.is_author}))}
                className={`rounded-2xl p-5 transition-all cursor-pointer border-2 ${
                  formData.is_author 
                    ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-500 shadow-lg' 
                    : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                      formData.is_author
                        ? 'bg-amber-600 border-amber-600 scale-110'
                        : 'bg-white border-amber-400'
                    }`}>
                      {formData.is_author && (
                        <svg className="w-6 h-6 text-white font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className={`text-lg font-bold block mb-1 select-none transition-colors ${
                      formData.is_author ? 'text-amber-900' : 'text-gray-900'
                    }`}>
                      ✍️ أنا مؤلف هذا الكتاب
                    </span>
                    <span className="text-sm text-gray-600 select-none">
                      {formData.is_author ? '✅ تم التحديد' : 'اضغط هنا إذا كنت المؤلف الأصلي (اختياري)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ملاحظات */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  ملاحظات إضافية
                </label>
                <textarea
                  name="additional_notes"
                  value={formData.additional_notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none resize-none transition-all"
                  placeholder="أي معلومات إضافية تود إضافتها..."
                />
              </div>
            </div>

            {/* ملاحظة مهمة */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-900 font-bold mb-1">📌 ملاحظة مهمة</p>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    بعد إرسال الطلب، سنتواصل معك عبر البريد الإلكتروني أو الهاتف خلال 24-48 ساعة لترتيب تفاصيل رفع الكتاب ومراجعته قبل النشر.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - ثابت */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 sm:p-8 border-t-2 border-gray-200 bg-gray-50 rounded-b-3xl flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 px-6 rounded-2xl transition-all active:scale-95"
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="book-submission-form"
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                إرسال الطلب
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}