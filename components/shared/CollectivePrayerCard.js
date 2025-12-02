'use client'
import { useState, useEffect } from 'react';

// ════════════════════════════════════════════════════════════
// 🕌 بطاقة الدعاء الجماعي الموقوت
// ════════════════════════════════════════════════════════════
// الحالات:
// - waiting: قبل الموعد (عد تنازلي)
// - active: وقت الدعاء (زر نشط + عد تنازلي للنهاية)
// - ended: انتهى (عرض العدد النهائي)
// ════════════════════════════════════════════════════════════

export default function CollectivePrayerCard({ prayer, onParticipate }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState(prayer.status);
  const [hasParticipated, setHasParticipated] = useState(false);

  // ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
  // ⏰ العد التنازلي الحي - محسّن
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!prayer || !prayer.scheduled_datetime) {
      setTimeLeft('غير محدد');
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const scheduledTime = new Date(prayer.scheduled_datetime);
      const endTime = new Date(scheduledTime.getTime() + (prayer.duration_minutes || 30) * 60000);

      // حساب الحالة والوقت المتبقي
      if (now < scheduledTime) {
        // قبل الموعد - حالة انتظار
        const remaining = Math.floor((scheduledTime - now) / 1000);
        if (remaining <= 0) {
          setStatus('active');
          setTimeLeft(null);
        } else {
          setStatus('waiting');
          setTimeLeft(formatTime(remaining));
        }
      } else if (now >= scheduledTime && now <= endTime) {
        // وقت الدعاء - حالة نشطة
        const remaining = Math.floor((endTime - now) / 1000);
        if (remaining <= 0) {
          setStatus('ended');
          setTimeLeft(null);
        } else {
          setStatus('active');
          setTimeLeft(formatTime(remaining));
        }
      } else {
        // بعد انتهاء الوقت
        setStatus('ended');
        setTimeLeft(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [prayer]);
  
  // ═══════════════════════════════════════════════════════════
  // 🕐 تنسيق الوقت
  // ═══════════════════════════════════════════════════════════
  const formatTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days} ${days === 1 ? 'يوم' : days === 2 ? 'يومين' : 'أيام'} ${hours} ${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتين' : 'ساعات'} ${minutes} ${minutes === 1 ? 'دقيقة' : minutes === 2 ? 'دقيقتين' : 'دقائق'}`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتين' : 'ساعات'} ${minutes} ${minutes === 1 ? 'دقيقة' : minutes === 2 ? 'دقيقتين' : 'دقائق'}`;
    } else if (minutes > 0) {
      return `${minutes} ${minutes === 1 ? 'دقيقة' : minutes === 2 ? 'دقيقتين' : 'دقائق'} ${secs} ${secs === 1 ? 'ثانية' : secs === 2 ? 'ثانيتين' : 'ثواني'}`;
    } else {
      return `${secs} ${secs === 1 ? 'ثانية' : secs === 2 ? 'ثانيتين' : 'ثواني'}`;
    }
  };

  // ═══════════════════════════════════════════════════════════
  // 📅 تنسيق التاريخ
  // ═══════════════════════════════════════════════════════════
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-IQ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!prayer) return null;

  // ═══════════════════════════════════════════════════════════
  // 🎨 حالة: في الانتظار
  // ═══════════════════════════════════════════════════════════
  if (status === 'waiting') {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-2xl p-6 mb-6 mt-6 shadow-xl border-2 border-purple-200">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-800 mb-2">
            🕌 الدعاء الجماعي القادم
          </h2>
        </div>

        <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
          <p className="text-2xl text-center text-stone-700 leading-relaxed mb-3">
            {prayer.prayer_text}
          </p>
          {prayer.verse_reference && (
            <p className="text-base text-center text-stone-500 font-semibold">
              — {prayer.verse_reference}
            </p>
          )}
        </div>

        {prayer.scheduled_datetime && (
          <div className="bg-purple-100 rounded-xl p-4 mb-4">
            <p className="text-center text-purple-900 font-bold text-lg mb-2">
              📅 {formatDate(prayer.scheduled_datetime)}
            </p>
          </div>
        )}

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 mb-4 text-white">
          <p className="text-center text-xl mb-2">⏳ يبدأ خلال:</p>
          <p className="text-center text-4xl font-bold">
            {timeLeft || 'جاري الحساب...'}
          </p>
        </div>

        <button
          disabled
          className="w-full py-4 bg-stone-300 text-stone-600 rounded-xl font-bold text-xl cursor-not-allowed"
        >
          جاري الانتظار...
        </button>

        <div className="mt-4 bg-white rounded-xl p-4 border-2 border-dashed border-purple-300">
          <p className="text-center text-stone-700 text-sm leading-relaxed">
            <span className="font-bold text-purple-700">💫 استعد للمشاركة!</span>
            <br />
            سيُفعّل الزر تلقائياً عند الموعد المحدد
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 🎨 حالة: نشط (وقت الدعاء)
  // ═══════════════════════════════════════════════════════════
  if (status === 'active') {
    return (
      <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 rounded-2xl p-6 mb-6 mt-6 shadow-xl border-2 border-emerald-300 animate-pulse-slow">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800 mb-2">
            🌟 الدعاء الجماعي بدأ!
          </h2>
        </div>

        <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
          <p className="text-2xl text-center text-stone-700 leading-relaxed mb-3">
            {prayer.prayer_text}
          </p>
          {prayer.verse_reference && (
            <p className="text-base text-center text-stone-500 font-semibold">
              — {prayer.verse_reference}
            </p>
          )}
        </div>

        <div className="bg-emerald-100 rounded-xl p-4 mb-4">
          <p className="text-center text-emerald-900 font-bold text-2xl">
            👥 {prayer.participantCount.toLocaleString()} يدعون الآن
          </p>
        </div>

        {timeLeft && (
          <div className="bg-amber-100 rounded-xl p-3 mb-4">
            <p className="text-center text-amber-900 font-semibold text-lg">
              ⏱️ باقي: {timeLeft}
            </p>
          </div>
        )}

        <button
          onClick={() => onParticipate(prayer.id)}
          className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold text-2xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <span className="text-3xl">🤲</span>
          <span>شارك الآن!</span>
        </button>

        <div className="mt-4 bg-white rounded-xl p-4 border-2 border-dashed border-emerald-300">
          <p className="text-center text-stone-700 text-sm leading-relaxed">
            <span className="font-bold text-emerald-700">✨ دعاؤك مستجاب بإذن الله</span>
            <br />
            الملائكة تدعو لك بمثل ما تدعو
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 🎨 حالة: انتهى
  // ═══════════════════════════════════════════════════════════
  if (status === 'ended') {
    return (
      <div className="bg-gradient-to-br from-stone-50 via-white to-stone-50 rounded-2xl p-6 mb-6 mt-6 shadow-xl border-2 border-stone-200">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-stone-800 mb-2">
            <span className="text-emerald-600">✅</span> انتهى الدعاء الجماعي
          </h2>
        </div>

        <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
          <p className="text-2xl text-center text-stone-700 leading-relaxed mb-3">
            {prayer.prayer_text}
          </p>
          {prayer.verse_reference && (
            <p className="text-base text-center text-stone-500 font-semibold">
              — {prayer.verse_reference}
            </p>
          )}
        </div>

        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl p-6 mb-4">
          <p className="text-center text-emerald-900 font-bold text-3xl mb-2">
            شارك {(prayer.final_participant_count || prayer.participantCount).toLocaleString()} مؤمن
          </p>
          <p className="text-center text-emerald-700 text-xl">
            جزاهم الله خيراً 🤲
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-dashed border-stone-300">
          <p className="text-center text-stone-700 text-base leading-relaxed">
            <span className="font-bold text-stone-800">🕌 الدعاء القادم</span>
            <br />
            تابع الموقع لمعرفة موعد الدعاء الجماعي القادم
          </p>
        </div>
      </div>
    );
  }

  return null;
}