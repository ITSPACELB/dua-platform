'use client'
import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetTimestamp, onComplete, label }) {
  // ============================================================================
  // ⏰ حساب الوقت المتبقي
  // ============================================================================
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!targetTimestamp) return;

    // حساب الوقت المتبقي بالثواني
    const calculateRemaining = () => {
      const now = new Date().getTime();
      const target = new Date(targetTimestamp).getTime();
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      return diff;
    };

    // تحديث فوري
    setTimeRemaining(calculateRemaining());

    // تحديث كل ثانية
    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        if (onComplete) {
          onComplete();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp, onComplete]);

  // ============================================================================
  // 🕐 تحويل الثواني إلى ساعات ودقائق وثواني
  // ============================================================================
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  // تنسيق الأرقام (إضافة صفر للأرقام الأحادية)
  const formatNumber = (num) => String(num).padStart(2, '0');

  // ============================================================================
  // 🎨 واجهة المستخدم
  // ============================================================================
  return (
    <div className="text-center">
      {label && (
        <p className="text-sm font-medium text-white mb-2 opacity-90">
          {label}
        </p>
      )}
      <div className="flex items-center justify-center gap-1 text-white font-bold">
        {hours > 0 && (
          <>
            <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[3rem]">
              <span className="text-2xl">{formatNumber(hours)}</span>
            </div>
            <span className="text-2xl">:</span>
          </>
        )}
        <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[3rem]">
          <span className="text-2xl">{formatNumber(minutes)}</span>
        </div>
        <span className="text-2xl">:</span>
        <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[3rem]">
          <span className="text-2xl">{formatNumber(seconds)}</span>
        </div>
      </div>
      {hours > 0 && (
        <p className="text-xs text-white mt-2 opacity-75">
          ساعة : دقيقة : ثانية
        </p>
      )}
      {hours === 0 && (
        <p className="text-xs text-white mt-2 opacity-75">
          دقيقة : ثانية
        </p>
      )}
    </div>
  );
}