'use client'
import { useState, useEffect } from 'react';

/**
 * نظام تقييم المنصة بالنجوم
 * مع دعم Google Schema (AggregateRating)
 * تصميم واضح وكبير لكبار السن
 */
export default function RatingSystem() {
  // ============================================================================
  // 📊 بيانات التقييم
  // ============================================================================
  const [rating, setRating] = useState({
    average: 4.9,
    count: 12847,
    distribution: {
      5: 11234,
      4: 1156,
      3: 289,
      2: 98,
      1: 70
    }
  });

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // ============================================================================
  // 🔄 useEffect: التحقق من تقييم المستخدم السابق
  // ============================================================================
  useEffect(() => {
    const savedRating = localStorage.getItem('user-rating');
    if (savedRating) {
      setUserRating(parseInt(savedRating));
      setHasRated(true);
    }

    // جلب التقييمات من API (اختياري)
    fetchRatings();
  }, []);

  // ============================================================================
  // 🌐 جلب التقييمات من الخادم
  // ============================================================================
  const fetchRatings = async () => {
    try {
      const response = await fetch('/api/ratings');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRating(data.rating);
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  // ============================================================================
  // ⭐ معالجة التقييم
  // ============================================================================
  const handleRate = async (stars) => {
    if (hasRated) return;

    setUserRating(stars);
    setHasRated(true);
    setShowThankYou(true);
    localStorage.setItem('user-rating', stars.toString());

    // إرسال التقييم للخادم
    try {
      await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating: stars })
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
    }

    // إخفاء رسالة الشكر بعد 3 ثواني
    setTimeout(() => {
      setShowThankYou(false);
    }, 3000);

    // تحديث البيانات
    fetchRatings();
  };

  // ============================================================================
  // 🎨 عرض النجوم
  // ============================================================================
  const renderStars = (count, size = 'large', interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starNumber = i + 1;
      const isFilled = interactive 
        ? starNumber <= (hoverRating || userRating)
        : starNumber <= count;

      return (
        <button
          key={i}
          onClick={() => interactive && !hasRated && handleRate(starNumber)}
          onMouseEnter={() => interactive && !hasRated && setHoverRating(starNumber)}
          onMouseLeave={() => interactive && !hasRated && setHoverRating(0)}
          disabled={hasRated}
          className={`transition-all ${
            size === 'large' ? 'text-6xl' : 'text-4xl'
          } ${
            interactive && !hasRated ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          } ${
            hasRated ? 'opacity-60' : ''
          }`}
        >
          {isFilled ? '⭐' : '☆'}
        </button>
      );
    });
  };

  // ============================================================================
  // 📊 حساب النسبة المئوية لكل تقييم
  // ============================================================================
  const getPercentage = (count) => {
    return ((count / rating.count) * 100).toFixed(1);
  };

  // ============================================================================
  // 🎨 واجهة المستخدم
  // ============================================================================
  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-lg">
      
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

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-center border-b-4 border-amber-700">
        <h2 className="text-white font-bold text-3xl">
          ⭐ تقييم المنصة
        </h2>
      </div>

      <div className="p-8">
        
        {/* التقييم الإجمالي */}
        <div className="text-center mb-8 pb-8 border-b-2 border-stone-200">
          <div className="text-7xl font-bold text-amber-600 mb-3">
            {rating.average.toFixed(1)}
          </div>
          <div className="flex justify-center gap-2 mb-4">
            {renderStars(Math.round(rating.average), 'large', false)}
          </div>
          <p className="text-2xl text-stone-600 font-semibold">
            بناءً على {rating.count.toLocaleString('ar-IQ')} تقييم
          </p>
        </div>

        {/* توزيع التقييمات */}
        <div className="mb-8 pb-8 border-b-2 border-stone-200 space-y-4">
          <h3 className="text-2xl font-bold text-stone-800 mb-5 text-center">
            توزيع التقييمات
          </h3>
          {[5, 4, 3, 2, 1].map(stars => (
            <div key={stars} className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-32">
                <span className="text-2xl font-bold text-stone-700">{stars}</span>
                <span className="text-3xl">⭐</span>
              </div>
              <div className="flex-1 bg-stone-200 rounded-full h-8 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    stars >= 4 ? 'bg-emerald-500' : stars === 3 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${getPercentage(rating.distribution[stars])}%` }}
                />
              </div>
              <div className="w-24 text-left">
                <span className="text-xl font-bold text-stone-600">
                  {getPercentage(rating.distribution[stars])}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* قسم تقييم المستخدم */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-8 border-2 border-amber-200">
          <h3 className="text-2xl font-bold text-stone-800 mb-5 text-center">
            {hasRated ? 'شكراً لتقييمك!' : 'قيّم تجربتك معنا'}
          </h3>
          
          <div className="flex justify-center gap-3 mb-6">
            {renderStars(userRating, 'large', true)}
          </div>

          {!hasRated && (
            <p className="text-center text-xl text-stone-600">
              اضغط على النجوم لتقييم المنصة
            </p>
          )}

          {hasRated && !showThankYou && (
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600 mb-2">
                ✓ تم إرسال تقييمك
              </p>
              <p className="text-lg text-stone-600">
                قيمت المنصة بـ {userRating} نجوم
              </p>
            </div>
          )}

          {showThankYou && (
            <div className="text-center animate-bounce">
              <p className="text-3xl font-bold text-emerald-600 mb-2">
                🎉 جزاك الله خيراً!
              </p>
              <p className="text-xl text-stone-600">
                رأيك يساعدنا في التحسين المستمر
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}