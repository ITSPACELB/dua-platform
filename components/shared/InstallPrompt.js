// PWA install prompt component

// State: showPrompt, deferredPrompt

useEffect(() => {
  const handler = (e) => {
    e.preventDefault()
    setDeferredPrompt(e)
    
    // Show prompt if:
    // 1. Not installed
    // 2. Not dismissed in last 7 days
    const lastDismissed = localStorage.getItem('installPromptDismissed')
    if (!lastDismissed || Date.now() - parseInt(lastDismissed) > 7 * 24 * 60 * 60 * 1000) {
      setShowPrompt(true)
    }
  }
  
  window.addEventListener('beforeinstallprompt', handler)
  return () => window.removeEventListener('beforeinstallprompt', handler)
}, [])

const handleInstall = async () => {
  if (!deferredPrompt) return
  
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  
  if (outcome === 'accepted') {
    console.log('PWA installed')
  }
  
  setDeferredPrompt(null)
  setShowPrompt(false)
}

const handleDismiss = () => {
  localStorage.setItem('installPromptDismissed', Date.now().toString())
  setShowPrompt(false)
}

// UI: Modal with benefits
{showPrompt && (
  <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-2xl p-6 border-2 border-emerald-500 z-50">
    <button onClick={handleDismiss} className="absolute top-2 left-2 text-stone-400">✕</button>
    
    <div className="text-center mb-4">
      <div className="text-4xl mb-2">📱</div>
      <h3 className="text-lg font-bold text-stone-800">ثبّت التطبيق</h3>
    </div>
    
    <ul className="text-sm text-stone-700 space-y-2 mb-4">
      <li>✓ استقبال الإشعارات فوراً</li>
      <li>✓ الوصول السريع من الشاشة الرئيسية</li>
      <li>✓ يعمل بدون إنترنت</li>
    </ul>
    
    <button onClick={handleInstall} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold">
      تثبيت الآن
    </button>
  </div>
)}