'use client'
import { useState, useEffect } from 'react';
import { Share2 } from 'lucide-react';
import IslamicBanner from '../shared/IslamicBanner';
import MenuBar from '../shared/MenuBar';
import CountdownTimer from '../shared/CountdownTimer';
import VerificationBadge from '../shared/VerificationBadge';
import ReactionButtons from '../shared/ReactionButtons';
import TopWeeklyUser from '../shared/TopWeeklyUser';
import InstallPrompt from '../shared/InstallPrompt';
import ShareButton from '../shared/ShareButton';
import { encouragingMessages, blessingsExample, TOTAL_USERS } from '../constants/messages';

export default function HomePage({ user, onNavigate, onEditProfile, onLogout }) {
  // ============================================================================
  // 🎲 رسالة تشجيعية عشوائية
  // ============================================================================
  const [randomMessage] = useState(
    encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
  );

  // ============================================================================
  // 📋 حالة الطلبات
  // ============================================================================
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // ⏰ حدود الطلبات (Time Limits)
  // ============================================================================
  const [prayerLimit, setPrayerLimit] = useState({
    canRequest: true,
    remainingSeconds: 0,
    nextAllowedAt: null
  });

  const [deceasedLimit, setDeceasedLimit] = useState({
    canRequest: true,
    remainingSeconds: 0,
    nextAllowedAt: null
  });

  const [sickLimit, setSickLimit] = useState({
    canRequest: true,
    remainingSeconds: 0,
    nextAllowedAt: null
  });

  // ============================================================================
  // 📝 نماذج الطلبات
  // ============================================================================
  const [showDeceasedForm, setShowDeceasedForm] = useState(false);
  const [showSickForm, setShowSickForm] = useState(false);
  
  const [deceasedForm, setDeceasedForm] = useState({
    fullName: '',
    motherName: '',
    relation: ''
  });

  const [sickForm, setSickForm] = useState({
    fullName: '',
    motherName: '',
    isPrivate: false
  });

  // ============================================================================
  // 📊 إحصائيات وميزات المستخدم
  // ============================================================================
  const [stats, setStats] = useState(null);
  const [canCollective, setCanCollective] = useState(false);
  const [canPrivate, setCanPrivate] = useState(false);

  // ============================================================================
  // ⭐ للدعاء الخاص
  // ============================================================================
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [privateMessage, setPrivateMessage] = useState('');

  // ============================================================================
  // 🏆 أفضل مستخدم أسبوعياً
  // ============================================================================
  const [topWeeklyUser, setTopWeeklyUser] = useState(null);

  // ============================================================================
  // 🔄 useEffect: جلب حدود الطلبات عند التحميل
  // ============================================================================
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (!token) return;

      fetch('/api/prayer-request/check-limit', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setPrayerLimit({
            canRequest: data.canRequestPrayer,
            remainingSeconds: data.remainingSeconds?.prayer || 0,
            nextAllowedAt: data.nextPrayerAllowedAt
          });
          setDeceasedLimit({
            canRequest: data.canRequestDeceased,
            remainingSeconds: data.remainingSeconds?.deceased || 0,
            nextAllowedAt: data.nextDeceasedAllowedAt
          });
          setSickLimit({
            canRequest: data.canRequestSick,
            remainingSeconds: data.remainingSeconds?.sick || 0,
            nextAllowedAt: data.nextSickAllowedAt
          });
        })
        .catch(err => console.error('Error checking limits:', err));
    }
  }, [user]);

  // ============================================================================
  // 🔄 useEffect: جلب طلبات الدعاء
  // ============================================================================
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (!token) return;

      fetch('/api/prayer-request?limit=20', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setRequests(data.requests);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching requests:', err);
          setLoading(false);
        });
    }
  }, [user]);

  // ============================================================================
  // 🔄 useEffect: جلب إحصائيات المستخدم
  // ============================================================================
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      fetch('/api/users/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStats(data.stats);
            setCanCollective(data.stats.interactionRate >= 95);
            setCanPrivate(data.stats.interactionRate >= 98);
          }
        })
        .catch(err => console.error('Error fetching stats:', err));
    }
  }, [user]);

  // ============================================================================
  // 🔄 useEffect: جلب المستخدمين النشطين (للدعاء الخاص)
  // ============================================================================
  useEffect(() => {
    if (canPrivate && user) {
      const token = localStorage.getItem('token');
      if (!token) return;

      fetch('/api/users/active?limit=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setActiveUsers(data.users);
          }
        })
        .catch(err => console.error('Error fetching active users:', err));
    }
  }, [canPrivate, user]);

  // ============================================================================
  // 🔄 useEffect: جلب أفضل مستخدم أسبوعياً
  // ============================================================================
  useEffect(() => {
    fetch('/api/users/top-weekly')
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setTopWeeklyUser(data);
        }
      })
      .catch(err => console.error('Error fetching top user:', err));
  }, []);

  // ============================================================================
  // 🤲 طلب دعاء عام
  // ============================================================================
  const handleRequestPrayer = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/prayer-request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prayerType: 'general' })
      });

      const data = await res.json();

      if (res.ok) {
        alert('تم إرسال طلبك! سيصل إشعار للمؤمنين خلال 30 دقيقة إن شاء الله');
        window.location.reload();
      } else {
        alert(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Request prayer error:', error);
      alert('حدث خطأ أثناء إرسال الطلب');
    }
  };

  // ============================================================================
  // 🕊️ طلب دعاء للمتوفى
  // ============================================================================
  const handleDeceasedPrayer = async () => {
    if (!deceasedForm.fullName || !deceasedForm.motherName) {
      alert('الرجاء إدخال الاسم الكامل واسم الأم للمتوفى');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/prayer/deceased', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deceasedName: deceasedForm.fullName,
          deceasedMotherName: deceasedForm.motherName,
          relation: deceasedForm.relation
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('تم إرسال طلب الدعاء للمتوفى إن شاء الله');
        setShowDeceasedForm(false);
        setDeceasedForm({ fullName: '', motherName: '', relation: '' });
        window.location.reload();
      } else {
        alert(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Deceased prayer error:', error);
      alert('حدث خطأ أثناء إرسال الطلب');
    }
  };

  // ============================================================================
  // 🏥 طلب دعاء للمريض
  // ============================================================================
  const handleSickPrayer = async () => {
    if (!sickForm.isPrivate && (!sickForm.fullName || !sickForm.motherName)) {
      alert('الرجاء إدخال اسم المريض واسم والدته، أو اختر "اسم خاص"');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/prayer/sick', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sickPersonName: sickForm.fullName,
          sickPersonMotherName: sickForm.motherName,
          isNamePrivate: sickForm.isPrivate
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('تم إرسال طلب الدعاء للمريض إن شاء الله');
        setShowSickForm(false);
        setSickForm({ fullName: '', motherName: '', isPrivate: false });
        window.location.reload();
      } else {
        alert(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Sick prayer error:', error);
      alert('حدث خطأ أثناء إرسال الطلب');
    }
  };

  // ============================================================================
  // 🙏 الدعاء لطلب معين
  // ============================================================================
  const handlePray = async (requestId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/prayer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || 'جزاك الله خيراً');
        setRequests(requests.map(req => 
          req.id === requestId ? { ...req, hasPrayed: true, prayerCount: req.prayerCount + 1 } : req
        ));
      } else {
        alert(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Prayer error:', error);
      alert('حدث خطأ أثناء حفظ الدعاء');
    }
  };

  // ============================================================================
  // 🌍 دعاء جماعي
  // ============================================================================
  const handleCollectivePrayer = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/prayer/collective', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: null })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || 'تم إرسال دعاءك لكل المؤمنين! جزاك الله خيراً 🌍');
      } else {
        alert(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Collective prayer error:', error);
      alert('حدث خطأ');
    }
  };

  // ============================================================================
  // ⭐ دعاء خاص
  // ============================================================================
  const handlePrivatePrayer = async () => {
    if (!selectedUser || !privateMessage.trim()) {
      alert('الرجاء اختيار شخص وكتابة رسالة الدعاء');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/prayer/private', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: parseInt(selectedUser),
          message: privateMessage
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || 'تم إرسال دعاء خاص إن شاء الله ⭐');
        setSelectedUser('');
        setPrivateMessage('');
      } else {
        alert(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Private prayer error:', error);
      alert('حدث خطأ');
    }
  };

  // ============================================================================
  // 💬 رد فعل
  // ============================================================================
  const handleReact = async (requestId, reactionType) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId, reactionType })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || 'تم إرسال رد الفعل');
      } else {
        alert(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Reaction error:', error);
      alert('حدث خطأ');
    }
  };

  // ============================================================================
  // 🕐 حساب الوقت منذ النشر
  // ============================================================================
  const getTimeAgo = (timestamp) => {
    const mins = Math.floor((Date.now() - new Date(timestamp)) / 60000);
    if (mins < 1) return 'الآن';
    if (mins === 1) return 'منذ دقيقة';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours === 1) return 'منذ ساعة';
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  // ============================================================================
  // 🎨 واجهة المستخدم
  // ============================================================================
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <IslamicBanner />
      
      <MenuBar 
        user={user}
        currentPage="home"
        onNavigate={onNavigate}
        onEditProfile={onEditProfile}
        onLogout={onLogout}
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        
        {/* 👥 عداد المستخدمين */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4 text-center">
          <p className="text-emerald-700 font-semibold text-lg">
            🌍 انضم إلى {TOTAL_USERS.toLocaleString()} مؤمن
          </p>
          <p className="text-emerald-600 text-sm">من حول العالم</p>
        </div>

        {/* 💬 رسالة تشجيعية */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line text-center">
            {randomMessage}
          </p>
        </div>

        {/* 🚀 أزرار الطلب */}
        <div className="grid grid-cols-1 gap-4">
          
          {/* زر طلب دعاء عام */}
          {prayerLimit.canRequest ? (
            <button
              onClick={handleRequestPrayer}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🤲</div>
                <h3 className="text-lg font-semibold mb-2">احتاج دعاءكم</h3>
                <p className="text-sm opacity-90">
                  احتفظ بحاجتك في قلبك ودع المؤمنين يشاركونك الدعاء
                </p>
              </div>
            </button>
          ) : (
            <div className="bg-emerald-600 opacity-60 text-white p-6 rounded-lg">
              <div className="text-center">
                <div className="text-3xl mb-2">🤲</div>
                <h3 className="text-lg font-semibold mb-2">احتاج دعاءكم</h3>
                <p className="text-sm opacity-90 mb-3">
                  احتفظ بحاجتك في قلبك ودع المؤمنين يشاركونك الدعاء
                </p>
                <CountdownTimer 
                  targetTimestamp={prayerLimit.nextAllowedAt}
                  onComplete={() => setPrayerLimit({...prayerLimit, canRequest: true})}
                  label="يمكنك طلب دعاء جديد بعد"
                />
              </div>
            </div>
          )}

          {/* زر طلب دعاء للمتوفى */}
          {deceasedLimit.canRequest ? (
            <button
              onClick={() => setShowDeceasedForm(true)}
              className="bg-stone-600 hover:bg-stone-700 text-white p-6 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🕊️</div>
                <h3 className="text-lg font-semibold mb-2">ادعوا لمتوفٍ عزيز</h3>
                <p className="text-sm opacity-90">
                  ادعُ لروح من فارقنا واطلب من المؤمنين الدعاء له
                </p>
              </div>
            </button>
          ) : (
            <div className="bg-stone-600 opacity-60 text-white p-6 rounded-lg">
              <div className="text-center">
                <div className="text-3xl mb-2">🕊️</div>
                <h3 className="text-lg font-semibold mb-2">ادعوا لمتوفٍ عزيز</h3>
                <p className="text-sm opacity-90 mb-3">
                  ادعُ لروح من فارقنا واطلب من المؤمنين الدعاء له
                </p>
                <CountdownTimer 
                  targetTimestamp={deceasedLimit.nextAllowedAt}
                  onComplete={() => setDeceasedLimit({...deceasedLimit, canRequest: true})}
                  label="يمكنك طلب دعاء جديد بعد"
                />
              </div>
            </div>
          )}

          {/* زر طلب دعاء للمريض */}
          {sickLimit.canRequest ? (
            <button
              onClick={() => setShowSickForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition-colors"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🏥</div>
                <h3 className="text-lg font-semibold mb-2">ادعوا لمريض</h3>
                <p className="text-sm opacity-90">
                  اطلب الدعاء لمريض (مع خيار إخفاء الاسم)
                </p>
              </div>
            </button>
          ) : (
            <div className="bg-blue-600 opacity-60 text-white p-6 rounded-lg">
              <div className="text-center">
                <div className="text-3xl mb-2">🏥</div>
                <h3 className="text-lg font-semibold mb-2">ادعوا لمريض</h3>
                <p className="text-sm opacity-90 mb-3">
                  اطلب الدعاء لمريض (مع خيار إخفاء الاسم)
                </p>
                <CountdownTimer 
                  targetTimestamp={sickLimit.nextAllowedAt}
                  onComplete={() => setSickLimit({...sickLimit, canRequest: true})}
                  label="يمكنك طلب دعاء جديد بعد"
                />
              </div>
            </div>
          )}
        </div>

        {/* 🕊️ نموذج المتوفى */}
        {showDeceasedForm && (
          <div className="bg-white p-6 rounded-lg border border-stone-200">
            <h3 className="text-lg font-semibold text-stone-800 mb-4 text-center">
              الدعاء لمن فارقنا
            </h3>
            
            <div className="space-y-4">
              <input
                type="text"
                value={deceasedForm.fullName}
                onChange={(e) => setDeceasedForm({...deceasedForm, fullName: e.target.value})}
                placeholder="الاسم الكامل للمتوفى"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              
              <input
                type="text"
                value={deceasedForm.motherName}
                onChange={(e) => setDeceasedForm({...deceasedForm, motherName: e.target.value})}
                placeholder="اسم والدة المتوفى"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              
              <div>
                <label className="block text-stone-700 font-medium mb-2 text-sm">
                  صلة القرابة (اختياري)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['أب', 'أم', 'أخ', 'أخت', 'صديق', 'قريب'].map(rel => (
                    <button
                      key={rel}
                      onClick={() => setDeceasedForm({...deceasedForm, relation: rel})}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        deceasedForm.relation === rel
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleDeceasedPrayer}
                  className="flex-1 bg-stone-600 hover:bg-stone-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  إرسال طلب الدعاء
                </button>
                <button
                  onClick={() => setShowDeceasedForm(false)}
                  className="px-6 bg-stone-200 hover:bg-stone-300 text-stone-700 py-2.5 rounded-lg font-medium transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🏥 نموذج المريض */}
        {showSickForm && (
          <div className="bg-white p-6 rounded-lg border border-stone-200">
            <h3 className="text-lg font-semibold text-stone-800 mb-4 text-center">
              الدعاء للمريض
            </h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sickForm.isPrivate}
                    onChange={(e) => setSickForm({...sickForm, isPrivate: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-stone-700">
                    اسم خاص (لا يُعرض الاسم للمؤمنين)
                  </span>
                </label>
              </div>

              {!sickForm.isPrivate && (
                <>
                  <input
                    type="text"
                    value={sickForm.fullName}
                    onChange={(e) => setSickForm({...sickForm, fullName: e.target.value})}
                    placeholder="اسم المريض"
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  
                  <input
                    type="text"
                    value={sickForm.motherName}
                    onChange={(e) => setSickForm({...sickForm, motherName: e.target.value})}
                    placeholder="اسم والدة المريض"
                    className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={handleSickPrayer}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  إرسال طلب الدعاء
                </button>
                <button
                  onClick={() => {
                    setShowSickForm(false);
                    setSickForm({ fullName: '', motherName: '', isPrivate: false });
                  }}
                  className="px-6 bg-stone-200 hover:bg-stone-300 text-stone-700 py-2.5 rounded-lg font-medium transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 📊 إحصائية شخصية */}
        {stats && (
          <div className="bg-white p-5 rounded-lg border border-stone-200 text-center">
            <p className="text-stone-600 text-sm mb-1">دعا لك اليوم</p>
            <p className="text-3xl font-semibold text-emerald-600">
              {stats.prayersReceivedCount || 0}
            </p>
            <p className="text-stone-500 text-sm">مؤمن</p>
          </div>
        )}

        {/* 🏆 أفضل مستخدم أسبوعياً */}
        {topWeeklyUser && (
          <TopWeeklyUser topUser={topWeeklyUser} />
        )}

        {/* 🌍 دعاء جماعي */}
        {canCollective && (
          <button
            onClick={handleCollectivePrayer}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-lg transition-all hover:shadow-lg w-full"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🌍</div>
              <h3 className="text-lg font-bold mb-1">ادعُ لكل المؤمنين</h3>
              <p className="text-sm opacity-90">ميزة التوثيق المتقدم 🟢</p>
            </div>
          </button>
        )}

        {/* ⭐ دعاء خاص */}
        {canPrivate && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 rounded-lg">
            <div className="text-center mb-3">
              <div className="text-3xl mb-2">⭐</div>
              <h3 className="text-lg font-bold">دعاء خاص</h3>
              <p className="text-sm opacity-90 mb-3">ميزة التوثيق الذهبي 👑</p>
            </div>
            <select 
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-3 rounded-lg text-stone-800 border-0 focus:ring-2 focus:ring-amber-300 mb-2"
            >
              <option value="">اختر شخصاً...</option>
              {activeUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.displayName} {u.verificationLevel?.icon}
                </option>
              ))}
            </select>
            <textarea
              value={privateMessage}
              onChange={(e) => setPrivateMessage(e.target.value)}
              placeholder="اكتب رسالة الدعاء..."
              rows="3"
              className="w-full p-3 rounded-lg text-stone-800 border-0 focus:ring-2 focus:ring-amber-300 mb-2 resize-none"
            />
            <button 
              onClick={handlePrivatePrayer} 
              className="w-full bg-white text-amber-600 py-2.5 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
            >
              إرسال دعاء خاص
            </button>
          </div>
        )}

        {/* 🤲 من يطلب دعاءنا */}
        <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
          <div className="bg-emerald-600 p-4 border-b border-emerald-700">
            <h3 className="text-white font-semibold text-center">
              من يطلب دعاءنا الآن
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-stone-600">
              جاري التحميل...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-stone-600">
              لا توجد طلبات حالياً
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {requests.map(request => (
                <div key={request.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">
                          {request.type === 'deceased' ? '🕊️' : request.type === 'sick' ? '🏥' : '🤲'}
                        </span>
                        <h4 className="font-semibold text-stone-800">
                          {request.displayName}
                        </h4>
                        {request.verificationLevel && (
                          <VerificationBadge level={request.verificationLevel} size="sm" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-stone-600 mb-2">
                        <span>{getTimeAgo(request.timestamp)}</span>
                        <span>•</span>
                        <span>دعا له {request.prayerCount}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!request.hasPrayed ? (
                    <button
                      onClick={() => handlePray(request.id)}
                      className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                        request.type === 'deceased'
                          ? 'bg-stone-600 hover:bg-stone-700 text-white'
                          : request.type === 'sick'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      خذ لحظة وادعُ {request.type === 'deceased' ? 'له' : request.type === 'sick' ? 'له' : `لـ ${request.displayName.split(' ')[0]}`} 🤲
                    </button>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                      <p className="text-emerald-700 font-medium">✓ دعوت له - جزاك الله خيراً</p>
                    </div>
                  )}

                  {/* ردود الفعل إذا كان صاحب الطلب */}
                  {request.userId === user?.id && (
                    <div className="mt-4 pt-4 border-t border-stone-200">
                      <p className="text-sm text-stone-600 mb-2">
                        {request.prayerCount} شخص دعا لك
                      </p>
                      <ReactionButtons 
                        requestId={request.id}
                        currentUserReaction={null}
                        onReact={handleReact}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🎉 بشائر اليوم */}
        <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
          <div className="bg-amber-500 p-4 border-b border-amber-600">
            <h3 className="text-white font-semibold text-center">بشائر اليوم</h3>
          </div>
          
          <div className="p-5 space-y-3">
            {blessingsExample.map((blessing, idx) => (
              <div key={idx} className="flex items-center justify-between bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <div>
                  <p className="font-semibold text-stone-800">✓ {blessing.name}</p>
                  <p className="text-sm text-stone-600">تيسرت حاجته إن شاء الله</p>
                </div>
                <p className="text-sm text-stone-600">دعا له {blessing.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 📤 زر المشاركة */}
        <ShareButton 
          title="منصة الدعاء الجماعي"
          text="ادعُ واطلب الدعاء من آلاف المؤمنين حول العالم 🤲"
          url="https://yojeeb.com"
        />

        {/* 👤 Footer */}
        <div className="text-center text-sm text-stone-600 py-6 border-t border-stone-200">
          <p className="mb-2">منصة الدعاء الجماعي © 2025</p>
          <p>فكرة وتطوير: <span className="text-emerald-600 font-semibold">حيدر الغافقي 🌿</span></p>
        </div>
      </div>

      <InstallPrompt />
    </div>
  );
}