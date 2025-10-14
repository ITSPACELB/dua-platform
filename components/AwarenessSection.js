'use client'
import { useState, useEffect } from 'react';

/**
 * قسم التوعية والإعلانات
 * يتحكم به الأدمن بالكامل
 * يظهر كبانر بارز قبل قسم طلبات الدعاء
 */
export default function AwarenessSection() {
  // ============================================================================
  // 📊 حالة القسم
  // ============================================================================
  const [awareness, setAwareness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // ============================================================================
  // 🔄 useEffect: جلب محتوى التوعية
  // ============================================================================
  useEffect(() => {
    fetchAwareness();
  }, []);

  // ============================================================================
  // 🌐 جلب محتوى التوعية من API
  // ============================================================================
  const fetchAwareness = async () => {
    try {
      const response = await fetch('/api/awareness');
      const data = await response.json();

      if (data.success && data.show) {
        // التحقق من أن المستخدم لم يخفي هذا الإعلان سابقاً
        const dismissedKey = `awareness-dismissed-${data.id}`;
        const isDismissedBefore = localStorage.getItem(dismissedKey);

        if (!isDismissedBefore) {
          setAwareness(data);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching awareness:', error);
      setLoading(false);
    }
  };

  // ============================================================================
  // ❌ إخفاء القسم
  // ============================================================================
  const handleDismiss = () => {
    if (awareness && awareness.id) {
      const dismissedKey = `awareness-dismissed-${awareness.id}`;
      localStorage.setItem(dismissedKey, 'true');
      setIsDismissed(true);
    }
  };

  // ============================================================================
  // 🎨 الحصول على الألوان حسب النوع
  // ============================================================================
  const getTypeConfig = (type) => {
    const configs = {
      info: {
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'ℹ️'
      },
      warning: {
        gradient: 'from-amber-500 to-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        icon: '⚠️'
      },
      success: {
        gradient: 'from-emerald-500 to-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-800',
        icon: '✅'
      }
    };
    return configs[type] || configs.info;
  };

  // ============================================================================
  // 🎨 عدم عرض القسم في الحالات التالية
  // ============================================================================
  if (loading || !awareness || isDismissed) {
    return null;
  }

  // ============================================================================
  // 🎨 الحصول على التكوين حسب النوع
  // ============================================================================
  const config = getTypeConfig(awareness.type);

  // ============================================================================
  // 🎨 واجهة المستخدم
  // ============================================================================
  return (
    <div className={`w-full rounded-2xl border-2 ${config.border} overflow-hidden shadow-lg animate-fade-in`}>
      
      {/* Header مع الأيقونة وزر الإغلاق */}
      <div className={`bg-gradient-to-r ${config.gradient} p-6 relative`}>
        <div className="flex items-start justify-between gap-4">
          {/* الأيقونة والعنوان */}
          <div className="flex items-center gap-4 flex-1">
            <div className="text-5xl">{config.icon}</div>
            <h2 className="text-white font-extrabold text-2xl md:text-3xl leading-tight">
              {awareness.title}
            </h2>
          </div>

          {/* زر الإغلاق */}
          <button
            onClick={handleDismiss}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-all flex-shrink-0"
            aria-label="إخفاء الإعلان"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* المحتوى */}
      <div className={`${config.bg} p-8`}>
        <div className={`${config.text} text-lg md:text-xl leading-relaxed whitespace-pre-line`}>
          {awareness.content}
        </div>
      </div>

      {/* شريط سفلي للتأكيد البصري */}
      <div className={`bg-gradient-to-r ${config.gradient} h-2`}></div>
    </div>
  );
}