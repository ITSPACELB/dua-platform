'use client';

import { useState, useEffect } from 'react';

/**
 * 📖 كومبوننت عرض الآية القرآنية المختارة
 * يظهر في الصفحة الرئيسية للجميع
 * يعرض: اسم الفائز + الآية + الشرح + المدة المتبقية
 */
export default function SelectedVerseDisplay() {
  const [verseData, setVerseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState('');

  // جلب الآية النشطة
  useEffect(() => {
    loadSelectedVerse();
  }, []);

  // تحديث الوقت المتبقي كل دقيقة
  useEffect(() => {
    if (verseData?.expires_at) {
      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 60000); // كل دقيقة
      return () => clearInterval(interval);
    }
  }, [verseData]);

  const loadSelectedVerse = async () => {
    try {
      const response = await fetch('/api/achievements?action=getActiveVerse');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.verse) {
          setVerseData(data.verse);
        }
      }
    } catch (error) {
      console.error('Error loading selected verse:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTimeRemaining = () => {
    if (!verseData?.expires_at) return;

    const now = new Date();
    const expiryDate = new Date(verseData.expires_at);
    const diffMs = expiryDate - now;

    if (diffMs <= 0) {
      setTimeRemaining('انتهت');
      return;
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      setTimeRemaining(`${days} ${days === 1 ? 'يوم' : 'أيام'}`);
    } else if (hours > 0) {
      setTimeRemaining(`${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`);
    } else {
      setTimeRemaining('أقل من ساعة');
    }
  };

  // إذا كان يحمّل
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl border-2 border-purple-200 p-6 animate-pulse">
        <div className="h-6 bg-purple-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-purple-100 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-purple-100 rounded w-2/3"></div>
      </div>
    );
  }

  // إذا لا توجد آية نشطة
  if (!verseData) {
    return null; // لا نعرض شيء
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl border-2 border-purple-300 shadow-lg p-6 mb-6">
      {/* العنوان الرئيسي */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl">📖</span>
          <h2 className="text-2xl font-bold text-purple-900">
            الآية المختارة هذا الشهر
          </h2>
        </div>
        <p className="text-purple-700 text-sm">
          اختارها الفائز بإنجاز ⭐⭐⭐ وتُستخدم في دعواتنا الجماعية
        </p>
      </div>

      {/* معلومات الفائز */}
      <div className="bg-white rounded-xl border-2 border-purple-200 p-4 mb-4">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐⭐⭐</span>
            <span className="text-purple-900 font-bold text-lg">
              {verseData.user_name}
            </span>
          </div>
          <span className="text-purple-600 text-sm px-3 py-1 bg-purple-100 rounded-full">
            اختار هذه الآية الكريمة
          </span>
        </div>
      </div>

      {/* الآية القرآنية */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 mb-4 text-center border-2 border-purple-300">
        <div className="mb-4">
          <div className="text-purple-800 text-2xl leading-relaxed font-arabic mb-3">
            {verseData.verse_text}
          </div>
          <div className="text-purple-600 font-semibold text-lg">
            {verseData.verse_reference}
          </div>
        </div>

        {/* التصنيف */}
        {verseData.verse_category && (
          <div className="inline-block bg-white px-4 py-2 rounded-full border border-purple-300">
            <span className="text-purple-700 text-sm font-medium">
              {verseData.verse_category === 'prayer' && '🤲 دعاء'}
              {verseData.verse_category === 'hope' && '🌟 رجاء'}
              {verseData.verse_category === 'gratitude' && '💝 شكر'}
              {verseData.verse_category === 'patience' && '⏳ صبر'}
              {!['prayer', 'hope', 'gratitude', 'patience'].includes(verseData.verse_category) && verseData.verse_category}
            </span>
          </div>
        )}
      </div>

      {/* الشرح للمستخدمين */}
      <div className="bg-purple-50 rounded-xl p-4 mb-4 border border-purple-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <p className="text-purple-900 leading-relaxed">
              هذه الآية الكريمة ستُستخدم في جميع دعواتنا الجماعية طوال هذا الشهر،
              بفضل اختيار <span className="font-bold">{verseData.user_name}</span> الموفق.
              كل مَن يدعو في الدعاء الجماعي سيُختم دعاؤه بهذه الآية المباركة إن شاء الله.
            </p>
          </div>
        </div>
      </div>

      {/* إحصائيات الاستخدام */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* عدد مرات الاستخدام */}
        <div className="bg-white rounded-lg border border-purple-200 p-3 text-center">
          <div className="text-purple-900 font-bold text-2xl mb-1">
            {verseData.usage_count || 0}
          </div>
          <div className="text-purple-600 text-sm">
            مرة استُخدمت
          </div>
        </div>

        {/* الوقت المتبقي */}
        <div className="bg-white rounded-lg border border-purple-200 p-3 text-center">
          <div className="text-purple-900 font-bold text-2xl mb-1">
            {timeRemaining}
          </div>
          <div className="text-purple-600 text-sm">
            متبقية
          </div>
        </div>
      </div>

      {/* تفاعل المستخدمين (اختياري) */}
      {verseData.likes_count > 0 && (
        <div className="text-center pt-4 border-t border-purple-200">
          <div className="flex items-center justify-center gap-2 text-purple-700">
            <span className="text-xl">❤️</span>
            <span className="font-medium">
              {verseData.likes_count} مستخدم أعجبه هذا الاختيار
            </span>
          </div>
        </div>
      )}

      {/* آية تحفيزية صغيرة */}
      <div className="mt-4 pt-4 border-t-2 border-purple-200 text-center">
        <p className="text-purple-700 text-sm leading-relaxed">
          "وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ"
        </p>
        <p className="text-purple-500 text-xs mt-1">
          الذاريات: 55
        </p>
      </div>
    </div>
  );
}

/**
 * 🎨 كومبوننت مصغّر لعرض الآية (في مكان آخر)
 */
export function SelectedVerseMini({ verseData }) {
  if (!verseData) return null;

  return (
    <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 border border-purple-300">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">📖</span>
        <span className="text-purple-900 font-semibold text-sm">
          الآية المختارة
        </span>
      </div>
      <div className="text-purple-800 text-base leading-relaxed mb-2">
        {verseData.verse_text}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-purple-600">{verseData.verse_reference}</span>
        <span className="text-purple-500">اختارها: {verseData.user_name}</span>
      </div>
    </div>
  );
}

/**
 * 🏆 كومبوننت نجاح اختيار الآية (Notification)
 */
export function VerseSelectionSuccess({ verse, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose && onClose();
    }, 10000); // 10 ثواني

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60">
      <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-3xl shadow-2xl max-w-lg w-full p-8 transform animate-bounce-in">
        {/* أيقونة النجاح */}
        <div className="text-center mb-6">
          <div className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-6 mb-4">
            <span className="text-6xl">📖</span>
          </div>
          <h2 className="text-3xl font-bold text-purple-900 mb-2">
            مبروك! 🎉
          </h2>
          <p className="text-purple-700 text-lg">
            تم اختيار الآية بنجاح
          </p>
        </div>

        {/* الآية */}
        <div className="bg-white rounded-2xl border-2 border-purple-300 p-6 mb-6">
          <div className="text-purple-900 text-xl leading-relaxed text-center mb-3">
            {verse.text}
          </div>
          <div className="text-purple-600 font-semibold text-center">
            {verse.reference}
          </div>
        </div>

        {/* الرسالة */}
        <div className="bg-purple-50 rounded-xl p-4 mb-6 border border-purple-200">
          <p className="text-purple-800 text-center leading-relaxed">
            ستُستخدم هذه الآية الكريمة في جميع الدعوات الجماعية
            طوال الشهر إن شاء الله. جزاك الله خيراً على هذا الاختيار المبارك! 🤲
          </p>
        </div>

        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          الحمد لله ✨
        </button>
      </div>
    </div>
  );
}