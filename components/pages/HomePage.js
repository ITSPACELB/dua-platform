'use client'
import { useState, useEffect } from 'react';
import IslamicBanner from '../shared/IslamicBanner';
import MenuBar from '../shared/MenuBar';
import CountdownTimer from '../shared/CountdownTimer';
import VerificationBadge from '../shared/VerificationBadge';
import TopWeeklyUser from '../shared/TopWeeklyUser';
import InstallPrompt from '../shared/InstallPrompt';
import ShareButton from '../shared/ShareButton';
import PWAInstallButton from '../PWAInstallButton';
import RatingSystem from '../RatingSystem';
import BadgesSection from '../BadgesSection';
import BooksSection from '../BooksSection';
import AwarenessSection from '../AwarenessSection';
import PrayerModal from '../shared/PrayerModal';
import PrayerCard from '../shared/PrayerCard';
import PrayerOptions from '../sections/PrayerOptions';
import { encouragingMessages, blessingsExample, TOTAL_USERS } from '../constants/messages';

export default function HomePage({ user, onNavigate, onLogout }) {
  // ============================================================================
  // 🎲 رسالة تشجيعية عشوائية
  // ============================================================================
  const [randomMessage, setRandomMessage] = useState('');

useEffect(() => {
  // اختر الرسالة العشوائية بعد التحميل (client-side only)
  setRandomMessage(
    encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
  );
}, []);

  // ============================================================================
  // 📋 حالة الطلبات
  // ============================================================================
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ============================================================================
  // 🔍 الفلترة والتصفية
  // ============================================================================
  const [activeTab, setActiveTab] = useState('all');
  const [filteredRequests, setFilteredRequests] = useState([]);

  // ============================================================================
  // 📄 العرض والتصفح (Pagination & Load More)
  // ============================================================================
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [displayedRequests, setDisplayedRequests] = useState([]);

  // ============================================================================
  // 🕌 نافذة طلب الدعاء
  // ============================================================================
  const [openModal, setOpenModal] = useState(null); // null | 'general' | 'sick' | 'deceased' | 'collective'

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
  // 🎨 التمييز البصري للأسماء المتشابهة
  // ============================================================================
  const getUniqueColorForUser = (userId, displayName) => {
    const colors = [
      { border: 'border-l-emerald-500', bg: 'bg-emerald-50/30', accent: 'text-emerald-700' },
      { border: 'border-l-blue-500', bg: 'bg-blue-50/30', accent: 'text-blue-700' },
      { border: 'border-l-purple-500', bg: 'bg-purple-50/30', accent: 'text-purple-700' },
      { border: 'border-l-pink-500', bg: 'bg-pink-50/30', accent: 'text-pink-700' },
      { border: 'border-l-amber-500', bg: 'bg-amber-50/30', accent: 'text-amber-700' },
      { border: 'border-l-teal-500', bg: 'bg-teal-50/30', accent: 'text-teal-700' },
      { border: 'border-l-indigo-500', bg: 'bg-indigo-50/30', accent: 'text-indigo-700' },
      { border: 'border-l-rose-500', bg: 'bg-rose-50/30', accent: 'text-rose-700' }
    ];
    const colorIndex = userId % colors.length;
    return colors[colorIndex];
  };

  // ============================================================================
  // 📄 useEffect: جلب طلبات الدعاء
  // ============================================================================
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (!token) return;

      fetch('/api/prayer-request?limit=100', {
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
  // 📄 useEffect: فلترة الطلبات عند تغيير التبويب
  // ============================================================================
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredRequests(requests);
    } else if (activeTab === 'general') {
      setFilteredRequests(requests.filter(r => r.type === 'general' || !r.type));
    } else if (activeTab === 'deceased') {
      setFilteredRequests(requests.filter(r => r.type === 'deceased'));
    } else if (activeTab === 'sick') {
      setFilteredRequests(requests.filter(r => r.type === 'sick'));
    }
    setCurrentPage(1);
  }, [activeTab, requests]);

  // ============================================================================
  // 📄 useEffect: تحديث الطلبات المعروضة حسب الصفحة
  // ============================================================================
  useEffect(() => {
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    setDisplayedRequests(filteredRequests.slice(startIndex, endIndex));
  }, [filteredRequests, currentPage, itemsPerPage]);

  // ============================================================================
  // 📄 useEffect: جلب إحصائيات المستخدم
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
  // 📄 useEffect: جلب المستخدمين النشطين (للدعاء الخاص)
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
  // 📄 useEffect: جلب أفضل مستخدم أسبوعياً
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
  // 📤 معالجة إرسال طلب الدعاء (من Modal)
  // ============================================================================
  const handlePrayerSubmit = async (data) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      let endpoint = '/api/prayer-request';
      let body = { prayerType: data.type };

      if (data.type === 'deceased') {
        body.deceasedName = data.name;
        body.deceasedMotherName = data.motherName;
        body.relation = data.relation;
      } else if (data.type === 'sick') {
        body.sickPersonName = data.name;
        body.sickPersonMotherName = data.motherName;
        body.isNamePrivate = !data.name;
      } else if (data.type === 'collective') {
        endpoint = '/api/prayer/collective';
        body = {
          date: data.date,
          time: data.time,
          intention: data.intention
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || 'تم إرسال طلبك بنجاح!');
        window.location.reload();
      } else {
        alert(result.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('حدث خطأ أثناء الإرسال');
    }
  };

  // ============================================================================
  // � الدعاء لطلب معين
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
  // 📄 تحميل المزيد
  // ============================================================================
  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  // ============================================================================
  // 📄 الانتقال لصفحة معينة
  // ============================================================================
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
  // 🎯 حساب عدد الصفحات
  // ============================================================================
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const remainingRequests = filteredRequests.length - displayedRequests.length;

  // ============================================================================
  // 🎨 واجهة المستخدم
  // ============================================================================
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* زر التثبيت الثابت في الأعلى */}
      <PWAInstallButton />
      
      <IslamicBanner />
      
      <MenuBar 
        user={user}
        currentPage="home"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* 📢 قسم التوعية - إذا مفعل من الأدمن */}
        <AwarenessSection />
        
        {/* 👥 عداد المستخدمين */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-5 text-center">
          <p className="text-emerald-700 font-bold text-xl">
            🌍 انضم إلى {TOTAL_USERS.toLocaleString()} مؤمن
          </p>
          <p className="text-emerald-600 text-lg mt-1">من حول العالم</p>
        </div>

        {/* 💬 رسالة تشجيعية */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
          <p className="text-stone-700 text-lg leading-relaxed whitespace-pre-line text-center">
            {randomMessage}
          </p>
        </div>

        {/* 🎯 خيارات الدعاء - البطاقات الأربعة */}
        <PrayerOptions 
          onSelectOption={(type) => setOpenModal(type)}
          userStats={stats}
        />

        {/* 🕌 نافذة طلب الدعاء */}
        <PrayerModal
          isOpen={openModal !== null}
          type={openModal}
          onClose={() => setOpenModal(null)}
          onSubmit={handlePrayerSubmit}
        />

        {/* 📊 إحصائية شخصية */}
        {stats && (
          <div className="bg-white p-6 rounded-xl border-2 border-stone-200 text-center shadow-md">
            <p className="text-stone-600 text-lg mb-2 font-semibold">دعا لك اليوم</p>
            <p className="text-5xl font-bold text-emerald-600">
              {stats.prayersReceivedCount || 0}
            </p>
            <p className="text-stone-500 text-xl mt-1">مؤمن</p>
          </div>
        )}

        {/* 🏆 أفضل مستخدم أسبوعياً */}
        {topWeeklyUser && (
          <TopWeeklyUser topUser={topWeeklyUser} />
        )}

        {/* ⭐ دعاء خاص */}
        {canPrivate && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-8 rounded-xl shadow-xl">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="text-2xl font-bold">دعاء خاص</h3>
              <p className="text-lg opacity-90 mt-1">ميزة التوثيق الذهبي 👑</p>
            </div>
            <select 
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-4 text-lg rounded-lg text-stone-800 border-0 focus:ring-4 focus:ring-amber-300 mb-3"
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
              rows="4"
              className="w-full p-4 text-lg rounded-lg text-stone-800 border-0 focus:ring-4 focus:ring-amber-300 mb-3 resize-none"
            />
            <button 
              onClick={handlePrivatePrayer} 
              className="w-full bg-white text-amber-600 py-4 rounded-lg text-xl font-bold hover:bg-amber-50 transition-colors shadow-md"
            >
              إرسال دعاء خاص
            </button>
          </div>
        )}
        {/* 🤲 قسم طلبات الدعاء */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-lg">
          
          {/* Header */}
          <div className="bg-emerald-600 p-6 text-center border-b-4 border-emerald-700">
            <h2 className="text-white font-bold text-3xl">
              � طلبات الدعاء الجماعي
            </h2>
          </div>

          {/* Tabs للفلترة */}
          <div className="flex gap-2 p-5 bg-stone-50 border-b-2 border-stone-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-xl text-lg font-bold whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-stone-700 border-2 border-stone-300 hover:border-emerald-400'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-3 rounded-xl text-lg font-bold whitespace-nowrap transition-all ${
                activeTab === 'general'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-stone-700 border-2 border-stone-300 hover:border-emerald-400'
              }`}
            >
              🤲 عام
            </button>
            <button
              onClick={() => setActiveTab('deceased')}
              className={`px-6 py-3 rounded-xl text-lg font-bold whitespace-nowrap transition-all ${
                activeTab === 'deceased'
                  ? 'bg-stone-600 text-white shadow-md'
                  : 'bg-white text-stone-700 border-2 border-stone-300 hover:border-stone-400'
              }`}
            >
              🕊️ متوفى
            </button>
            <button
              onClick={() => setActiveTab('sick')}
              className={`px-6 py-3 rounded-xl text-lg font-bold whitespace-nowrap transition-all ${
                activeTab === 'sick'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-stone-700 border-2 border-stone-300 hover:border-red-400'
              }`}
            >
              🏥 مريض
            </button>
          </div>

          {/* العداد */}
          {filteredRequests.length > 0 && (
            <div className="bg-emerald-50 border-2 border-emerald-200 mx-5 mt-5 rounded-xl p-5 text-center">
              <p className="text-emerald-800 font-bold text-2xl">
                📊 يوجد {filteredRequests.length} {
                  filteredRequests.length === 1 ? 'طلب دعاء نشط' :
                  filteredRequests.length === 2 ? 'طلبان نشطان' :
                  'طلبات دعاء نشطة'
                }
              </p>
            </div>
          )}

          {/* البطاقات */}
          {loading ? (
            <div className="p-16 text-center">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-stone-600 text-2xl font-semibold">جاري التحميل...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-6xl mb-4">🤲</div>
              <p className="text-stone-500 text-2xl font-bold mb-3">
                لا توجد طلبات حالياً
              </p>
              <p className="text-stone-400 text-xl">
                كن أول من يطلب الدعاء
              </p>
            </div>
          ) : (
            <>
              {/* عرض الطلبات باستخدام PrayerCard */}
              <div className="p-5 space-y-12">
                {displayedRequests.map(request => (
                  <PrayerCard
                    key={request.id}
                    request={request}
                    onPray={handlePray}
                  />
                ))}
              </div>

              {/* زر Load More */}
              {remainingRequests > 0 && (
                <div className="p-5 bg-stone-50 border-t-2 border-stone-200">
                  <button
                    onClick={handleLoadMore}
                    className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                  >
                    <div className="text-center">
                      <p className="text-xl font-bold mb-1">
                        🔄 عرض 10 طلبات أخرى ⬇️
                      </p>
                      <p className="text-base opacity-90">
                        (يوجد {remainingRequests} {remainingRequests === 1 ? 'طلب متبقي' : remainingRequests === 2 ? 'طلبان متبقيان' : 'طلبات متبقية'})
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-5 bg-white border-t-2 border-stone-200">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-5 py-3 rounded-lg text-lg font-bold transition-all ${
                        currentPage === 1
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                      }`}
                    >
                      ◀️
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-12 h-12 rounded-lg text-lg font-bold transition-all ${
                            currentPage === pageNum
                              ? 'bg-emerald-600 text-white shadow-md scale-110'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-5 py-3 rounded-lg text-lg font-bold transition-all ${
                        currentPage === totalPages
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                      }`}
                    >
                      ▶️
                    </button>
                  </div>
                  <p className="text-center text-stone-600 mt-4 text-lg font-semibold">
                    صفحة {currentPage} من {totalPages}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        {/* 🌟 قسم التقييم */}
        <RatingSystem />

        {/* 🏆 قسم الشارات */}
        <BadgesSection />

        {/* 🎉 بشائر اليوم */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-lg">
          <div className="bg-amber-500 p-6 border-b-4 border-amber-600">
            <h3 className="text-white font-bold text-center text-2xl">✨ بشائر اليوم</h3>
          </div>
          
          <div className="p-6 space-y-4">
            {blessingsExample.map((blessing, idx) => (
              <div key={idx} className="flex items-center justify-between bg-amber-50 border-2 border-amber-200 p-5 rounded-xl hover:shadow-md transition-shadow">
                <div>
                  <p className="font-bold text-stone-800 text-xl">✓ {blessing.name}</p>
                  <p className="text-lg text-stone-600">تيسرت حاجته إن شاء الله</p>
                </div>
                <p className="text-lg text-stone-600 font-semibold">❤️ {blessing.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 📚 مكتبة الكتب - إذا مفعلة من الأدمن */}
        <BooksSection />

        {/* 📤 زر المشاركة */}
        <ShareButton 
          title="منصة الدعاء الجماعي"
          text="ادع واطلب الدعاء من آلاف المؤمنين حول العالم 🤲"
          url="https://yojeeb.com"
        />

        {/* 👤 Footer */}
        <div className="text-center text-lg text-stone-600 py-8 border-t-2 border-stone-200">
          <p className="mb-2 font-semibold">منصة الدعاء الجماعي © 2025</p>
          <p>فكرة وتطوير: <span className="text-emerald-600 font-bold">حيدر الغافقي 🌿</span></p>
        </div>
      </div>

      <InstallPrompt />
    </div>
  );
}