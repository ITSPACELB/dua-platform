'use client'
import { useState, useEffect } from 'react';

/**
 * زر تثبيت PWA ثابت في أعلى الصفحة
 * يظهر فقط إذا كان التطبيق غير مثبت
 * مصمم بخطوط كبيرة ووضوح عالي لكبار السن
 */
export default function PWAInstallButton() {
  // ============================================================================
  // 📊 حالة الزر
  // ============================================================================
  const [showButton, setShowButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // ============================================================================
  // 🔄 useEffect: اكتشاف البيئة والحالة
  // ============================================================================
  useEffect(() => {
    // التحقق من أن التطبيق مثبت بالفعل
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // اكتشاف أجهزة iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // إذا كان التطبيق مثبتاً، لا نعرض الزر
    if (standalone) {
      setShowButton(false);
      return;
    }

    // معالج حدث التثبيت (Android وأنظمة أخرى)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // التحقق من عدم إخفاء الزر سابقاً
      const hidden = sessionStorage.getItem('pwa-button-hidden');
      if (!hidden) {
        setShowButton(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // لأجهزة iOS، نعرض الزر دائماً (ما لم يخفيه المستخدم)
    if (iOS && !standalone) {
      const hidden = sessionStorage.getItem('pwa-button-hidden');
      if (!hidden) {
        setShowButton(true);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // ============================================================================
  // 📲 معالجة التثبيت
  // ============================================================================
  const handleInstall = async () => {
    if (isIOS) {
      // لأجهزة iOS، نعرض تعليمات
      alert('للتثبيت على iPhone/iPad:\n\n1. اضغط على زر المشاركة ⬆️\n2. اختر "أضف إلى الشاشة الرئيسية"\n3. اضغط "إضافة"');
      return;
    }

    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowButton(false);
        sessionStorage.setItem('pwa-button-hidden', 'true');
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  // ============================================================================
  // ❌ إخفاء الزر
  // ============================================================================
  const handleHide = () => {
    setShowButton(false);
    sessionStorage.setItem('pwa-button-hidden', 'true');
  };

  // ============================================================================
  // 🎨 عدم إظهار الزر إذا كان مخفياً أو التطبيق مثبت
  // ============================================================================
  if (!showButton || isStandalone) return null;

  // ============================================================================
  // 🎨 واجهة الزر - تصميم كلاسيكي واضح
  // ============================================================================
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-2xl border-b-4 border-emerald-800">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* النص والأيقونة */}
          <div className="flex items-center gap-4 flex-1">
            <div className="text-4xl">📲</div>
            <div className="flex-1">
              <p className="font-bold text-xl leading-tight mb-1">
                ثبّت التطبيق على جهازك
              </p>
              <p className="text-base opacity-90 leading-tight">
                {isIOS 
                  ? 'اضغط ⬆️ ثم "أضف إلى الشاشة الرئيسية"'
                  : 'استخدمه بسهولة من الشاشة الرئيسية'
                }
              </p>
            </div>
          </div>

          {/* الأزرار */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
            >
              {isIOS ? 'كيف؟' : 'تثبيت'}
            </button>
            <button
              onClick={handleHide}
              className="bg-emerald-800 hover:bg-emerald-900 px-4 py-3 rounded-xl font-bold text-base transition-all"
              aria-label="إخفاء"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}