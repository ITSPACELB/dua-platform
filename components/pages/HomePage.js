// ===============================================
// 🏡 الصفحة الرئيسية (Home Page)
// عرض طلبات الدعاء + إرسال طلب جديد
// ===============================================

import { useState, useEffect } from 'react';
import { Share2, Send, X } from 'lucide-react';
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
  // 🎲 رسالة تشجيعية عشوائية
  const [randomMessage] = useState(
    encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
  );

  // ⏰ حدود الطلبات (Time Limits)
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

  // 📋 طلبات الدعاء (بيانات وهمية)
  const [requests] = useState([
    {
      id: 1,
      userId: 123,
      userName: 'أحمد بن سارة',
      type: 'need',
      timestamp: new Date(Date.now() - 5 * 60000),
      prayerCount: 12,
      prayed: false,
      verificationLevel: {
        name: 'BLUE',
        color: 'blue',
        icon: '✓',
        threshold: 80
      }
    },
    {
      id: 2,
      userId: 456,
      userName: 'ماريا بنت كاثرين',
      type: 'need',
      timestamp: new Date(Date.now() - 15 * 60000),
      prayerCount: 8,
      prayed: false,
      verificationLevel: {
        name: 'GREEN',
        color: 'emerald',
        icon: '✓✓',
        threshold: 90
      }
    },
    {
      id: 3,
      userId: 789,
      deceasedName: 'يوسف بن مريم',
      relation: 'أب',
      type: 'deceased',
      timestamp: new Date(Date.now() - 20 * 60000),
      prayerCount: 15,
      prayed: false,
      verificationLevel: null
    }
  ]);

  // 🕊️ نموذج الدعاء للمتوفى
  const [showDeceasedForm, setShowDeceasedForm] = useState(false);
  const [deceasedForm, setDeceasedForm] = useState({
    fullName: '',
    motherName: '',
    relation: ''
  });

  // 🌟 ميزات التوثيق المتقدم
  const [stats, setStats] = useState(null);
  const [canCollective, setCanCollective] = useState(false);
  const [canPrivate, setCanPrivate] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [activeUsers] = useState([
    { id: 1, displayName: 'أحمد بن سارة', verificationLevel: { icon: '✓' } },
    { id: 2, displayName: 'ماريا بنت كاثرين', verificationLevel: { icon: '✓✓' } },
    { id: 3, displayName: 'فاطمة بنت علي', verificationLevel: { icon: '👑' } }
  ]);

  // 🏆 أفضل مستخدم أسبوعياً
  const [topWeeklyUser, setTopWeeklyUser] = useState(null);

  // ⏰ التحقق من حدود الطلبات عند التحميل
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
        })
        .catch(err => console.error('Error checking limits:', err));
    }
  }, [user]);

  // 🌟 جلب بيانات التوثيق والميزات
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
            setCanCollective(data.stats.unlockedFeatures?.includes('collective_prayer') || false);
            setCanPrivate(data.stats.unlockedFeatures?.includes('private_prayer') || false);
          }
        })
        .catch(err => console.error('Error fetching stats:', err));
    }
  }, [user]);

  // 🏆 جلب أفضل مستخدم أسبوعياً
  useEffect(() => {
    fetch('/api/users/top-weekly')
      .then(res => res.json())
      .then(data => setTopWeeklyUser(data))
      .catch(err => console.error('Error fetching top weekly user:', err));
  }, []);

  // 🕐 حساب الوقت
  const getTimeAgo = (timestamp) => {
    const mins = Math.floor((Date.now() - timestamp) / 60000);
    if (mins < 1) return 'الآن';
    if (mins === 1) return 'منذ دقيقة';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours === 1) return 'منذ ساعة';
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  const handleRequestPrayer = async () => {
    // TODO: ربط بـ API
    alert('تم إرسال طلبك! سيصل إشعار للمؤمنين خلال 30 دقيقة إن شاء الله');
  };

  const handleDeceasedPrayer = () => {
    if (!deceasedForm.fullName || !deceasedForm.motherName) {
      alert('الرجاء إدخال الاسم الكامل واسم الأم للمتوفى');
      return;
    }
    // TODO: ربط بـ API
    alert('تم إرسال طلب الدعاء للمتوفى إن شاء الله');
    setShowDeceasedForm(false);
    setDeceasedForm({ fullName: '', motherName: '', relation: '' });
  };

  const handleReact = async (requestId, reactionType) => {
    // TODO: ربط بـ API
    console.log('React:', requestId, reactionType);
    alert(`تم إرسال رد الفعل: ${reactionType}`);
  };

  const handleCollectivePrayer = async () => {
    // TODO: ربط بـ API
    alert('تم إرسال دعاءك لكل المؤمنين! جزاك الله خيراً 🌍');
  };

  const handlePrivatePrayer = async () => {
    if (!selectedUser) {
      alert('الرجاء اختيار شخص للدعاء له');
      return;
    }
    // TODO: ربط بـ API
    alert('تم إرسال دعاء خاص إن شاء الله ⭐');
    setSelectedUser('');
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* 🕌 البانر */}
      <IslamicBanner />
      
      {/* 📱 القائمة */}
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
          {/* زر طلب الدعاء */}
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

          {/* زر الدعاء للمتوفى */}
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

        {/* 📊 إحصائية شخصية */}
        <div className="bg-white p-5 rounded-lg border border-stone-200 text-center">
          <p className="text-stone-600 text-sm mb-1">دعا لك اليوم</p>
          <p className="text-3xl font-semibold text-emerald-600">24</p>
          <p className="text-stone-500 text-sm">مؤمن</p>
        </div>

        {/* 🏆 أفضل مستخدم أسبوعياً */}
        {topWeeklyUser && (
          <TopWeeklyUser topUser={topWeeklyUser} />
        )}

        {/* 🌟 ميزات التوثيق المتقدم */}
        {canCollective && (
          <button
            onClick={handleCollectivePrayer}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-lg transition-all hover:shadow-lg"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🌍</div>
              <h3 className="text-lg font-bold mb-1">ادعُ لكل المؤمنين</h3>
              <p className="text-sm opacity-90">ميزة التوثيق المتقدم 🟢</p>
            </div>
          </button>
        )}

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
              className="w-full p-3 rounded-lg text-stone-800 border-0 focus:ring-2 focus:ring-amber-300"
            >
              <option value="">اختر شخصاً...</option>
              {activeUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.displayName} {u.verificationLevel?.icon}
                </option>
              ))}
            </select>
            <button 
              onClick={handlePrivatePrayer} 
              className="mt-3 w-full bg-white text-amber-600 py-2.5 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
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
          
          <div className="divide-y divide-stone-100">
            {requests.map(request => (
              <div key={request.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{request.type === 'deceased' ? '🕊️' : '🤲'}</span>
                      <h4 className="font-semibold text-stone-800">
                        {request.type === 'deceased' 
                          ? `${request.deceasedName}${request.relation ? ` (${request.relation})` : ''}`
                          : request.userName
                        }
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
                
                {!request.prayed && (
                  <button
                    onClick={() => alert('سيتم ربطه بـ API الدعاء')}
                    className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                      request.type === 'deceased'
                        ? 'bg-stone-600 hover:bg-stone-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    خذ لحظة وادعُ {request.type === 'deceased' ? 'له' : `لـ ${request.userName.split(' ')[0]}`} 🤲
                  </button>
                )}

                {/* Show reactions if user is request owner */}
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
          <p>فكرة وتطوير: <span className="text-emerald-600 font-semibold">حيدر الغافقي  🌿</span></p>
        </div>
      </div>

      {/* 📲 Install Prompt */}
      <InstallPrompt />
    </div>
  );
}