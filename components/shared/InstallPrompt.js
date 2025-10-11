'use client'
import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-emerald-600 text-white p-4 rounded-lg shadow-lg z-50">
      <p className="font-semibold mb-2">ثبّت التطبيق على جهازك</p>
      <div className="flex gap-2">
        <button onClick={handleInstall} className="flex-1 bg-white text-emerald-600 py-2 rounded-lg font-semibold">
          تثبيت
        </button>
        <button onClick={() => setShowPrompt(false)} className="px-4 bg-emerald-700 rounded-lg">
          لاحقاً
        </button>
      </div>
    </div>
  );
}
