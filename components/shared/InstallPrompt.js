'use client'
import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  // ============================================================================
  // 📊 حالة العرض والتثبيت
  // ============================================================================
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  // ============================================================================
  // 🔄 useEffect: اكتشاف نظام التشغيل والاستماع لحدث التثبيت
  // ============================================================================
  useEffect(() => {
    // اكتشاف أجهزة iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // معالج حدث التثبيت (لأجهزة Android وأنظمة أخرى)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // التحقق من عدم رفض المستخدم سابقاً
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // إظهار رسالة iOS إذا لم يتم تثبيته بعد
    if (iOS && !window.matchMedia('(display-mode: standalone)').matches) {
      const dismissed = localStorage.getItem('pwa-install-dismissed-ios');
      if (!dismissed) {
        setShowPrompt(true);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // ============================================================================
  // 📲 معالجة التثبيت
  // ============================================================================
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  // ============================================================================
  // ❌ رفض التثبيت
  // ============================================================================
  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem('pwa-install-dismissed-ios', 'true');
    } else {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  // ============================================================================
  // 🎨 عدم إظهار أي شيء إذا كان مخفياً
  // ============================================================================
  if (!showPrompt) return null;

  // ============================================================================
  // 📱 رسالة خاصة لأجهزة iOS
  // ============================================================================
  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-2xl z-50 border-2 border-blue-400 animate-bounce">
        <div className="text-center mb-4">
          <div className="text-4xl mb-3">📲</div>
          <p className="font-bold text-xl mb-2">ثبّت التطبيق على جهازك</p>
          <p className="text-base opacity-90 leading-relaxed">
            للتثبيت: اضغط على زر المشاركة 
            <span className="inline-block mx-2 text-2xl">⬆️</span>
            ثم اختر "أضف إلى الشاشة الرئيسية"
          </p>
        </div>
        <button 
          onClick={handleDismiss} 
          className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-md"
        >
          فهمت، شكراً
        </button>
      </div>
    );
  }

  // ============================================================================
  // 🤖 رسالة عامة لأجهزة Android وأنظمة أخرى
  // ============================================================================
  return (
    <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-2xl shadow-2xl z-50 border-2 border-emerald-400 animate-bounce">
      <div className="text-center mb-4">
        <div className="text-4xl mb-3">📲</div>
        <p className="font-bold text-xl mb-2">ثبّت التطبيق على جهازك</p>
        <p className="text-base opacity-90">
          استخدم التطبيق بسهولة من الشاشة الرئيسية
        </p>
      </div>
      <div className="flex gap-3">
        <button 
          onClick={handleInstall} 
          className="flex-1 bg-white text-emerald-600 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-colors shadow-md"
        >
          ✓ تثبيت الآن
        </button>
        <button 
          onClick={handleDismiss} 
          className="px-6 bg-emerald-800 hover:bg-emerald-900 rounded-xl font-bold text-lg transition-colors"
        >
          لاحقاً
        </button>
      </div>
    </div>
  );
}