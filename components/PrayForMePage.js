'use client';

import { useState, useEffect } from 'react';
import { Heart, Users, Share2, ArrowLeft, Loader2, AlertCircle, Check, X, Sparkles } from 'lucide-react';

// ============================================================================
// 🔑 توليد Fingerprint
// ============================================================================
const generateFingerprint = () => {
  if (typeof window === 'undefined') return 'server';
  const stored = localStorage.getItem('deviceFingerprint');
  if (stored) return stored;
  const fp = Math.random().toString(36).substring(2, 8);
  localStorage.setItem('deviceFingerprint', fp);
  return fp;
};

// ============================================================================
// 🔍 التحقق من تسجيل المستخدم
// ============================================================================
const checkUserRegistration = () => {
  if (typeof window === 'undefined') return { hasName: false, hasParentName: false };
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      const hasName = !!(parsed.full_name || parsed.name || parsed.fullName);
      const hasParentName = !!(parsed.mother_or_father_name || parsed.parent_name || parsed.motherOrFatherName);
      return { hasName, hasParentName, isRegistered: hasName && hasParentName };
    }
  } catch (e) {}
  return { hasName: false, hasParentName: false, isRegistered: false };
};

// ============================================================================
// 🎨 ألوان حسب نوع الطلب
// ============================================================================
const typeStyles = {
  personal: {
    bg: 'bg-gradient-to-br from-amber-50 to-white',
    border: 'border-amber-300',
    accent: 'bg-amber-500',
    text: 'text-amber-700',
    button: 'bg-amber-500 hover:bg-amber-600',
    icon: '🤲',
    label: 'دعاء شخصي'
  },
  friend: {
    bg: 'bg-gradient-to-br from-blue-50 to-white',
    border: 'border-blue-300',
    accent: 'bg-blue-500',
    text: 'text-blue-700',
    button: 'bg-blue-500 hover:bg-blue-600',
    icon: '👥',
    label: 'لصديق'
  },
  deceased: {
    bg: 'bg-gradient-to-br from-stone-100 to-white',
    border: 'border-stone-400',
    accent: 'bg-stone-600',
    text: 'text-stone-700',
    button: 'bg-stone-600 hover:bg-stone-700',
    icon: '🕊️',
    label: 'لمتوفى'
  },
  sick: {
    bg: 'bg-gradient-to-br from-teal-50 to-white',
    border: 'border-teal-300',
    accent: 'bg-teal-500',
    text: 'text-teal-700',
    button: 'bg-teal-500 hover:bg-teal-600',
    icon: '🏥',
    label: 'لمريض'
  }
};

// 📿 جمل الدعاء المقترحة
const prayerSuggestions = {
  sick: "اللهم الشفاء العاجل",
  deceased: "اللهم الرحمة والمغفرة",
  personal: "اللهم تحقيق الأمنيات",
  friend: "اللهم البركة والتوفيق"
};

// ============================================================================
// 🤲 مكون صفحة "ادعُ لي"
// ============================================================================
export default function PrayForMePage({ code }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prayingFor, setPrayingFor] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userRegistration, setUserRegistration] = useState({ isRegistered: false });
  const [registerName, setRegisterName] = useState("");
  const [registerParentName, setRegisterParentName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // ============================================================================
  // 📡 جلب البيانات
  // ============================================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fingerprint = generateFingerprint();
        const response = await fetch(`/api/pray?code=${code}&fingerprint=${fingerprint}`);
        const result = await response.json();
        if (result.success) {
          setData(result);
        } else {
          setError(result.error || 'حدث خطأ');
        }
      } catch (err) {
        setError('فشل في الاتصال بالخادم');
      } finally {
        setLoading(false);
      }
    };
    if (code) fetchData();
    
    // التحقق من تسجيل المستخدم
    setUserRegistration(checkUserRegistration());
  }, [code]);

  // ============================================================================
  // 🤲 دالة الدعاء
  // ============================================================================
  const handlePray = async (requestId) => {
    const request = data?.requests?.find(r => r.id === requestId);
    if (request?.hasPrayed) return;

    setPrayingFor(requestId);

    try {
      const fingerprint = generateFingerprint();
      const response = await fetch('/api/prayer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-fingerprint': fingerprint
        },
        body: JSON.stringify({
          action: 'record_prayer',
          deviceFingerprint: fingerprint,
          requestId: requestId
        }),
      });

      if (response.ok) {
        setData(prev => ({
          ...prev,
          requests: prev.requests.map(r =>
            r.id === requestId ? { ...r, hasPrayed: true, prayer_count: (r.prayer_count || 0) + 1 } : r
          ),
          stats: { ...prev.stats, totalPrayersReceived: prev.stats.totalPrayersReceived + 1 }
        }));

        // إظهار Modal للمستخدم غير المسجل
        if (!userRegistration.isRegistered) {
          setShowSuccessModal(true);
        }
      }
    } catch (err) {
      console.error('خطأ في إرسال الدعاء:', err);
    } finally {
      setPrayingFor(null);
    }
  };

  // ============================================================================
  // 📤 دالة المشاركة
  // ============================================================================
  const handleShare = async () => {
    const shareUrl = `https://yojeeb.com/pray/${code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `ادعُ لـ ${data?.user?.name}`, url: shareUrl });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  // ============================================================================
  // 📝 دالة التسجيل السريع
  // ============================================================================
  const handleQuickRegister = async () => {
    if (!registerName.trim() || !registerParentName.trim()) return;
    setIsRegistering(true);
    try {
      const fingerprint = generateFingerprint();
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fingerprint: fingerprint,
          full_name: registerName.trim(),
          mother_or_father_name: registerParentName.trim()
        })
      });
      const result = await response.json();
      if (result.success) {
        localStorage.setItem("user", JSON.stringify(result.user));
        setRegisterSuccess(true);
        setUserRegistration({ hasName: true, hasParentName: true, isRegistered: true });
        setTimeout(() => { window.location.href = "/"; }, 2000);
      } else {
        console.error("خطأ:", result.error);
      }
    } catch (err) {
      console.error("خطأ في التسجيل:", err);
    } finally {
      setIsRegistering(false);
    }
  };

  // ============================================================================
  // 👤 عرض الاسم مع الشهرة
  // ============================================================================
  const getDisplayName = (request) => {
    const name = request.name || '';
    const parentName = request.mother_or_father_name || '';
    if (name && parentName) {
      return `${name} ${parentName}`;
    }
    return name || 'شخص يطلب دعاءكم';
  };

  // ============================================================================
  // 🔄 حالة التحميل
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-xl text-stone-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ❌ حالة الخطأ
  // ============================================================================
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4" dir="rtl">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-stone-800 mb-2">عذراً!</h1>
          <p className="text-lg text-stone-600 mb-6">{error}</p>
          <a href="/?page=profile" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
            <ArrowLeft size={20} />
            العودة للرئيسية
          </a>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 🎨 العرض الرئيسي
  // ============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50" dir="rtl">
      
      {/* ════════════════════════════════════════════════════════════ */}
      {/* 🎉 Modal النجاح */}
      {/* ════════════════════════════════════════════════════════════ */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl">
            <div className="text-5xl mb-4">🤲</div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              تقبّل الله، وحقق لك ما تتمنى
            </h2>
            <p className="text-lg text-stone-600 mb-6">إن شاء الله</p>
            
            <div className="border-t border-stone-200 pt-6 mt-4">
              <p className="text-stone-600 mb-4">سجّل اسمك لتطلب الدعاء لك ولمن تحب</p>
              
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setTimeout(() => {
                    document.getElementById("register-form")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="block w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg mb-3 hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg text-center"
              >
                🤲 ادخل اسمك وشارك طلبات دعائك
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-stone-500 hover:text-stone-700 font-medium"
              >
                لاحقاً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 🏠 Header */}
      {/* ════════════════════════════════════════════════════════════ */}
      <header className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-6 px-4">
        <div className="max-w-2xl mx-auto">
          {/* الشريط العلوي */}
          <div className="flex items-center justify-between mb-6">
            <a href="/?page=profile" className="text-xl font-bold flex items-center gap-2 text-white">
              🤲 Yojeeb
            </a>
            <a 
              href="/?page=profile"
              className="bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-md"
            >
              جرّب المنصة
            </a>
          </div>
          
          {/* العنوان الرئيسي */}
          <div className="text-center">
            <div className="text-5xl mb-4">🤲</div>
            <h1 className="text-3xl font-bold mb-2">طلبات دعاء من {data?.user?.name}</h1>
            <p className="text-emerald-100 text-lg">الدعاء قد يغير حياة</p>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 📊 الإحصائيات */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="max-w-2xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">{data?.stats?.totalRequests || 0}</div>
            <div className="text-stone-500 text-sm">طلب دعاء</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{data?.stats?.totalPrayersReceived || 0}</div>
            <div className="text-stone-500 text-sm">دعوة</div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 🤲 طلبات الدعاء */}
      {/* ════════════════════════════════════════════════════════════ */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
          <Heart className="text-red-500" size={24} />
          طلبات الدعاء
        </h2>

        {data?.requests?.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <div className="text-4xl mb-4">🕊️</div>
            <p className="text-stone-600">لا توجد طلبات دعاء حالياً</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.requests?.map((request) => {
              const style = typeStyles[request.type] || typeStyles.personal;
              return (
                <div 
                  key={request.id} 
                  className={`${style.bg} ${style.border} border-2 rounded-2xl shadow-md p-5 transition-all ${
                    request.hasPrayed ? 'opacity-60' : 'hover:shadow-lg'
                  }`}
                >
                  {/* الصف العلوي */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`${style.accent} text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1`}>
                      <span>{style.icon}</span>
                      <span>{style.label}</span>
                    </span>
                    <div className="flex items-center gap-1 text-stone-600">
                      <span className="text-lg">🤲</span>
                      <span className="font-bold text-lg">{request.prayer_count || 0}</span>
                      <span className="text-sm">دعوة</span>
                    </div>
                  </div>

                  {/* الاسم */}
                  <h3 className={`text-xl font-bold ${style.text} mb-2`}>
                    {getDisplayName(request)}
                  </h3>

                  {/* الغرض */}
                  {request.purpose && (
                    <p className="text-stone-600 text-base mb-3">
                      🎯 {request.purpose}
                    </p>
                  )}

                  {/* جملة الدعاء المقترحة */}
                  <div className="bg-white/80 rounded-lg p-3 mb-3 text-center border border-stone-200">
                    <p className="text-stone-700 text-lg font-medium">
                      📿 {prayerSuggestions[request.type] || "اللهم استجب"}{request.purpose && ` و${request.purpose}`}
                    </p>
                  </div>

                  {/* زر الدعاء */}
                  <button
                    onClick={() => handlePray(request.id)}
                    disabled={prayingFor === request.id || request.hasPrayed}
                    className={`w-full py-3 rounded-xl text-white text-lg font-bold ${style.button} transition-all disabled:opacity-50 shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
                  >
                    {prayingFor === request.id ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : request.hasPrayed ? (
                      <>✅ تم الدعاء - جزاك الله خيراً</>
                    ) : (
                      <>🤲 ادعُ الآن</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {/* ════════════════════════════════════════════════════════════ */}
        {/* ✨ نموذج التسجيل المباشر */}
        {/* ════════════════════════════════════════════════════════════ */}
        {!userRegistration.isRegistered && !registerSuccess && (
          <div id="register-form" className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6">
            <div className="text-center mb-4">
              <Sparkles className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-stone-800">انضم لمنصة يُجيب</h3>
              <p className="text-stone-600 text-sm mt-1">سجّل اسمك لتطلب الدعاء لك ولمن تحب</p>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="اسمك الكامل"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-emerald-400 focus:outline-none text-right text-lg"
                dir="rtl"
              />
              <input
                type="text"
                placeholder="الشهرة أو اسم الوالد"
                value={registerParentName}
                onChange={(e) => setRegisterParentName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-emerald-400 focus:outline-none text-right text-lg"
                dir="rtl"
              />
              <button
                onClick={handleQuickRegister}
                disabled={isRegistering || !registerName.trim() || !registerParentName.trim()}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRegistering ? <Loader2 className="animate-spin" size={20} /> : "🤲"}
                {isRegistering ? "جاري الحفظ..." : "سجّل وادخل المنصة"}
              </button>
            </div>
          </div>
        )}
        {/* رسالة النجاح */}
        {registerSuccess && (
          <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 text-center">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="text-xl font-bold text-green-700">تم التسجيل بنجاح!</h3>
            <p className="text-green-600 mt-2">جاري نقلك للمنصة...</p>
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 🦶 Footer */}
      {/* ════════════════════════════════════════════════════════════ */}
      <footer className="bg-white border-t border-stone-200 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg mb-4 flex items-center justify-center gap-2 hover:from-purple-600 hover:to-purple-700 shadow-lg"
          >
            {copied ? <Check size={22} /> : <Share2 size={22} />}
            {copied ? 'تم نسخ الرابط!' : 'شارك هذه الصفحة'}
          </button>
          <div className="text-center">
            <a href="/?page=profile" className="text-emerald-600 hover:text-emerald-700 font-bold text-lg">
              🤲 يُجيب - الدعاء يجمعنا
            </a>
            <p className="text-stone-400 text-sm mt-2 flex items-center justify-center gap-2"><img src="/icon-128.png" alt="الغافقي" className="w-5 h-5 rounded" />من ابتكار الغافقي</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
