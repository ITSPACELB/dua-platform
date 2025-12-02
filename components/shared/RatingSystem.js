'use client'
import { useState, useEffect } from 'react';

// ════════════════════════════════════════════════════════════
// ⭐ نظام التقييم المُعاد تصميمه
// ════════════════════════════════════════════════════════════
// التصميم الجديد:
// - يبدأ من 0.0 (صادق وشفاف)
// - 5 نجوم كبيرة أفقية
// - النجمة الخامسة مختارة افتراضياً
// - hover effect: scale 125%
// - تصميم فاخر مع amber gradient
// - اقتباس قرآني قصير
// - منع التقييمات المتكررة
// ════════════════════════════════════════════════════════════

export default function RatingSystem() {
  // ═══════════════════════════════════════════════════════════
  // 🔧 الحالة
  // ═══════════════════════════════════════════════════════════
  const [rating, setRating] = useState({
    average: 0.0,
    count: 0
  });

  const [selectedStars, setSelectedStars] = useState(5); // افتراضياً 5 نجوم
  const [hoverStars, setHoverStars] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // 🎯 التحقق من التقييم السابق عند التحميل
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    // التحقق من localStorage
    const userRating = localStorage.getItem('dua-platform-rating');
    if (userRating) {
      setHasRated(true);
      setSelectedStars(parseInt(userRating));
    }

    // جلب التقييم الإجمالي
    fetchRatings();
  }, []);

  // ═══════════════════════════════════════════════════════════
  // 🌐 جلب التقييمات من الخادم
  // ═══════════════════════════════════════════════════════════
  const fetchRatings = async () => {
    try {
      const response = await fetch('/api/reviews');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          setRating({
            average: data.stats.averageRating || 0.0,
            count: data.stats.totalReviews || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // ⭐ معالجة التقييم
  // ═══════════════════════════════════════════════════════════
  const handleSubmitRating = async () => {
    if (hasRated || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // إرسال التقييم للخادم
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating: selectedStars })
      });

      if (response.ok) {
        // حفظ في localStorage
        localStorage.setItem('dua-platform-rating', selectedStars.toString());
        setHasRated(true);
        setShowSuccess(true);

        // إخفاء رسالة النجاح بعد 5 ثواني
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);

        // تحديث التقييم الإجمالي
        fetchRatings();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 🎨 عرض النجوم
  // ═══════════════════════════════════════════════════════════
  const displayStars = hoverStars || selectedStars;

  // ═══════════════════════════════════════════════════════════
  // 📖 الاقتباس القرآني
  // ═══════════════════════════════════════════════════════════
  const quranQuote = {
    text: "تَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
    source: "سورة العصر"
  };

  // ═══════════════════════════════════════════════════════════
  // 🎨 واجهة المستخدم
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-4xl mx-auto">
      
      {/* JSON-LD Schema لـ Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "يُجيب - منصة الدعاء الجماعي",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": rating.average.toFixed(1),
              "reviewCount": rating.count,
              "bestRating": "5",
              "worstRating": "1"
            }
          })
        }}
      />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* البطاقة الرئيسية */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl border-2 border-amber-200 shadow-xl overflow-hidden">
        
        {/* ═══════════════════════════════════════════════════════ */}
        {/* العنوان */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="text-center p-8 border-b-2 border-amber-200">
          <h2 className="text-4xl font-bold text-stone-800 mb-3">
            ⭐ قيّمنا وساعدنا نصل لأناس أكثر
          </h2>
          <p className="text-lg text-stone-600">
            رأيك يساعدنا في تحسين المنصة وخدمة المزيد من المؤمنين
          </p>
        </div>

        <div className="p-8">
          
          {/* ═══════════════════════════════════════════════════════ */}
          {/* التقييم الإجمالي */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div className="text-center mb-8">
            <div className="inline-flex items-baseline gap-3 mb-2">
              <span className="text-7xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                {rating.average.toFixed(1)}
              </span>
              <span className="text-3xl text-stone-600">/ 5.0</span>
            </div>
            <p className="text-xl text-stone-600">
              ({rating.count.toLocaleString('ar-IQ')} {rating.count === 0 ? 'تقييمات' : rating.count === 1 ? 'تقييم' : rating.count === 2 ? 'تقييمان' : 'تقييمات'})
            </p>
          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* قسم التقييم */}
          {/* ═══════════════════════════════════════════════════════ */}
          {!hasRated ? (
            <div className="bg-white rounded-2xl border-2 border-amber-300 p-8 shadow-lg">
              
              {/* النجوم */}
              <div className="flex justify-center gap-4 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => !isSubmitting && setSelectedStars(star)}
                    onMouseEnter={() => !isSubmitting && setHoverStars(star)}
                    onMouseLeave={() => !isSubmitting && setHoverStars(0)}
                    disabled={isSubmitting}
                    className={`
                      text-6xl transition-all duration-200 star-hover
                      ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                      ${star <= displayStars ? 'scale-100' : 'scale-90 opacity-40'}
                    `}
                    aria-label={`تقييم ${star} نجوم`}
                  >
                    {star <= displayStars ? (
                      <span className="text-amber-500">⭐</span>
                    ) : (
                      <span className="text-stone-300">☆</span>
                    )}
                  </button>
                ))}
              </div>

              {/* النص التوضيحي */}
              <p className="text-center text-xl text-stone-600 mb-6">
                اضغط على النجوم لاختيار تقييمك (الافتراضي: 5 نجوم)
              </p>

              {/* زر التقييم */}
              <button
                onClick={handleSubmitRating}
                disabled={isSubmitting}
                className="w-full h-16 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-2xl font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin text-3xl">⏳</span>
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl">⭐</span>
                    <span>قيّمنا بـ {selectedStars} {selectedStars === 5 ? 'نجوم' : selectedStars >= 3 ? 'نجوم' : 'نجمة'}</span>
                  </>
                )}
              </button>

              {/* الاقتباس القرآني */}
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-center text-lg font-semibold text-amber-900 mb-1">
                  {quranQuote.text}
                </p>
                <p className="text-center text-sm text-amber-700">
                  {quranQuote.source}
                </p>
              </div>
            </div>
          ) : (
            // ═══════════════════════════════════════════════════════
            // رسالة بعد التقييم
            // ═══════════════════════════════════════════════════════
            <div className={`bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl border-2 border-emerald-300 p-8 text-center transition-all duration-500 ${showSuccess ? 'animate-slide-down' : ''}`}>
              <div className="text-6xl mb-4">
                {showSuccess ? '🎉' : '✅'}
              </div>
              <h3 className="text-3xl font-bold text-emerald-700 mb-3">
                {showSuccess ? 'جزاك الله خيراً على تقييمك!' : 'شكراً لك!'}
              </h3>
              <p className="text-xl text-emerald-600 mb-4">
                قيّمت المنصة بـ {selectedStars} {selectedStars === 5 ? 'نجوم' : selectedStars >= 3 ? 'نجوم' : 'نجمة'}
              </p>
              
              {/* النجوم المختارة */}
              <div className="flex justify-center gap-3 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className="text-5xl"
                  >
                    {star <= selectedStars ? (
                      <span className="text-amber-500">⭐</span>
                    ) : (
                      <span className="text-stone-300">☆</span>
                    )}
                  </span>
                ))}
              </div>

              <p className="text-lg text-stone-600">
                تقييمك يساعدنا في الوصول لمزيد من الناس وتحسين خدماتنا
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}