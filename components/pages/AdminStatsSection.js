'use client';
import { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, Calendar, Clock, Award, 
  Star, Zap, Target, BarChart3, PieChart,
  ArrowUp, ArrowDown, Minus, RefreshCw
} from 'lucide-react';

// ════════════════════════════════════════════════════════════════════════════
// 📊 مكون الإحصائيات الشاملة للأدمن
// ════════════════════════════════════════════════════════════════════════════

export default function AdminStatsSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ══════════════════════════════════════════════════════════════════════════
  // 🔄 جلب الإحصائيات
  // ══════════════════════════════════════════════════════════════════════════
  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('غير مصرح');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setLastUpdated(data.lastUpdated);
        setError(null);
      } else {
        setError(data.error || 'حدث خطأ');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('فشل في جلب الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // 🎨 مكونات مساعدة
  // ══════════════════════════════════════════════════════════════════════════
  
  // بطاقة إحصائية
  const StatCard = ({ icon, title, value, subtitle, gradient, iconBg }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 border-2 shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold opacity-80 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value?.toLocaleString('ar-EG') || 0}</p>
          {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
        </div>
        <div className={`${iconBg} p-3 rounded-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );

  // بطاقة صغيرة
  const MiniCard = ({ icon, label, value, color }) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${color} border`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs opacity-70">{label}</p>
        <p className="text-lg font-bold">{value?.toLocaleString('ar-EG') || 0}</p>
      </div>
    </div>
  );

  // شريط التقدم
  const ProgressBar = ({ value, max, color, label }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>{label}</span>
          <span className="font-bold">{value?.toLocaleString('ar-EG')}</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 📊 رسم بياني للساعات
  // ══════════════════════════════════════════════════════════════════════════
  const HourlyChart = ({ data, peak }) => {
    if (!data) return null;
    
    const maxValue = Math.max(...Object.values(data), 1);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="bg-white rounded-xl p-4 border-2 border-stone-200">
        <h4 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          توزيع الدعوات حسب الساعة (آخر 7 أيام)
        </h4>
        <div className="flex items-end justify-between h-32 gap-1">
          {hours.map(hour => {
            const count = data[hour] || 0;
            const height = maxValue > 0 ? (count / maxValue) * 100 : 0;
            const isPeak = hour === peak?.hour;
            return (
              <div key={hour} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-t transition-all duration-300 ${
                    isPeak ? 'bg-emerald-500' : 'bg-blue-400 hover:bg-blue-500'
                  }`}
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${hour}:00 - ${count} دعاء`}
                />
                {hour % 4 === 0 && (
                  <span className="text-[10px] text-stone-500 mt-1">{hour}</span>
                )}
              </div>
            );
          })}
        </div>
        {peak && peak.count > 0 && (
          <p className="text-sm text-stone-600 mt-3 text-center">
            ⚡ ساعة الذروة: <strong>{peak.hour}:00</strong> ({peak.count} دعاء)
          </p>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 🔄 حالة التحميل والخطأ
  // ══════════════════════════════════════════════════════════════════════════
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-xl text-stone-600 font-bold">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 text-xl font-bold mb-4">⚠️ {error}</p>
        <button 
          onClick={fetchStats}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-10 text-stone-500">
        لا توجد إحصائيات متاحة
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 🎨 الواجهة الرئيسية
  // ══════════════════════════════════════════════════════════════════════════
  
  return (
    <div className="space-y-8">
      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* العنوان وزر التحديث */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-emerald-600" />
            📊 إحصائيات المنصة الشاملة
          </h2>
          {lastUpdated && (
            <p className="text-sm text-stone-500 mt-1">
              آخر تحديث: {new Date(lastUpdated).toLocaleString('ar-EG')}
            </p>
          )}
        </div>
        <button 
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* البطاقات الرئيسية */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6 text-blue-700" />}
          title="إجمالي المستخدمين"
          value={stats.users?.total}
          subtitle={`${stats.users?.new?.week || 0} جديد هذا الأسبوع`}
          gradient="from-blue-50 to-blue-100 border-blue-200 text-blue-900"
          iconBg="bg-blue-200"
        />
        
        <StatCard
          icon={<span className="text-2xl">🤲</span>}
          title="إجمالي الدعوات"
          value={stats.prayers?.total}
          subtitle={`${stats.prayers?.today || 0} اليوم`}
          gradient="from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900"
          iconBg="bg-emerald-200"
        />
        
        <StatCard
          icon={<span className="text-2xl">📋</span>}
          title="طلبات الدعاء"
          value={stats.requests?.total}
          subtitle={`${stats.requests?.byStatus?.active || 0} نشط`}
          gradient="from-amber-50 to-amber-100 border-amber-200 text-amber-900"
          iconBg="bg-amber-200"
        />
        
        <StatCard
          icon={<Star className="w-6 h-6 text-purple-700" />}
          title="إجمالي النجوم"
          value={stats.stars?.total}
          subtitle={`متوسط ${stats.stars?.avg || 0} لكل مستخدم`}
          gradient="from-purple-50 to-purple-100 border-purple-200 text-purple-900"
          iconBg="bg-purple-200"
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 👥 تفاصيل المستخدمين */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-lg">
        <h3 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          👥 تفاصيل المستخدمين
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* حسب المستوى */}
          <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl p-4 border border-stone-200">
            <h4 className="font-bold text-stone-700 mb-4">📊 حسب المستوى</h4>
            <ProgressBar 
              label="🥉 المستوى 1 (زائر)" 
              value={stats.users?.byLevel?.level1 || 0} 
              max={stats.users?.total || 1}
              color="bg-stone-400"
            />
            <ProgressBar 
              label="🥈 المستوى 2 (جزئي)" 
              value={stats.users?.byLevel?.level2 || 0} 
              max={stats.users?.total || 1}
              color="bg-blue-500"
            />
            <ProgressBar 
              label="🥇 المستوى 3 (مسجل)" 
              value={stats.users?.byLevel?.level3 || 0} 
              max={stats.users?.total || 1}
              color="bg-emerald-500"
            />
          </div>
          
          {/* الجدد */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <h4 className="font-bold text-green-700 mb-4">🆕 المستخدمين الجدد</h4>
            <div className="space-y-3">
              <MiniCard icon="📅" label="اليوم" value={stats.users?.new?.today} color="bg-green-100 border-green-200" />
              <MiniCard icon="📆" label="هذا الأسبوع" value={stats.users?.new?.week} color="bg-green-100 border-green-200" />
              <MiniCard icon="🗓️" label="هذا الشهر" value={stats.users?.new?.month} color="bg-green-100 border-green-200" />
            </div>
          </div>
          
          {/* النشطين */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <h4 className="font-bold text-orange-700 mb-4">⚡ المستخدمين النشطين</h4>
            <div className="space-y-3">
              <MiniCard icon="🔥" label="اليوم" value={stats.users?.active?.today} color="bg-orange-100 border-orange-200" />
              <MiniCard icon="📊" label="هذا الأسبوع" value={stats.users?.active?.week} color="bg-orange-100 border-orange-200" />
              <MiniCard icon="📈" label="هذا الشهر" value={stats.users?.active?.month} color="bg-orange-100 border-orange-200" />
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 🤲 تفاصيل الدعوات + 📋 الطلبات */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الدعوات */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-lg">
          <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🤲</span>
            إحصائيات الدعوات
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <MiniCard icon="📅" label="اليوم" value={stats.prayers?.today} color="bg-emerald-50 border-emerald-200" />
            <MiniCard icon="📆" label="الأسبوع" value={stats.prayers?.week} color="bg-emerald-50 border-emerald-200" />
            <MiniCard icon="🗓️" label="الشهر" value={stats.prayers?.month} color="bg-emerald-50 border-emerald-200" />
            <MiniCard icon="📊" label="المتوسط اليومي" value={stats.prayers?.avgDaily} color="bg-emerald-50 border-emerald-200" />
          </div>
        </div>

        {/* الطلبات */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-lg">
          <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            طلبات الدعاء
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <MiniCard icon="🤲" label="شخصي" value={stats.requests?.byType?.personal} color="bg-blue-50 border-blue-200" />
            <MiniCard icon="👥" label="لصديق" value={stats.requests?.byType?.friend} color="bg-purple-50 border-purple-200" />
            <MiniCard icon="🕊️" label="لمتوفى" value={stats.requests?.byType?.deceased} color="bg-stone-50 border-stone-200" />
            <MiniCard icon="🏥" label="لمريض" value={stats.requests?.byType?.sick} color="bg-red-50 border-red-200" />
          </div>
          
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-sm text-amber-800">
              📊 متوسط الدعوات لكل طلب: <strong>{stats.requests?.avgPrayersPerRequest || 0}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 💎 الشارات + 🔥 التتابع */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الشارات */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-lg">
          <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💎</span>
            شارات التوثيق
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 text-center border-2 border-purple-300">
              <span className="text-4xl block mb-2">👑</span>
              <p className="text-2xl font-bold text-purple-800">{stats.badges?.crown || 0}</p>
              <p className="text-sm text-purple-600">التاج الملكي (98%+)</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-4 text-center border-2 border-yellow-300">
              <span className="text-4xl block mb-2">🏆</span>
              <p className="text-2xl font-bold text-yellow-800">{stats.badges?.trophy || 0}</p>
              <p className="text-sm text-yellow-600">الكأس الذهبي (90-97%)</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 text-center border-2 border-blue-300">
              <span className="text-4xl block mb-2">💎</span>
              <p className="text-2xl font-bold text-blue-800">{stats.badges?.diamond || 0}</p>
              <p className="text-sm text-blue-600">الماسة الزرقاء (80-89%)</p>
            </div>
            <div className="bg-gradient-to-br from-stone-100 to-stone-200 rounded-xl p-4 text-center border-2 border-stone-300">
              <span className="text-4xl block mb-2">⚪</span>
              <p className="text-2xl font-bold text-stone-800">{stats.badges?.none || 0}</p>
              <p className="text-sm text-stone-600">بدون شارة</p>
            </div>
          </div>
        </div>

        {/* التتابع */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-lg">
          <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-500" />
            🔥 التتابع (Streak)
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-4 text-center border-2 border-orange-300">
              <p className="text-3xl font-bold text-orange-800">{stats.streak?.maxCurrent || 0}</p>
              <p className="text-sm text-orange-600">أعلى تتابع حالي</p>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-4 text-center border-2 border-red-300">
              <p className="text-3xl font-bold text-red-800">{stats.streak?.allTimeMax || 0}</p>
              <p className="text-sm text-red-600">الرقم القياسي</p>
            </div>
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-4 text-center border-2 border-amber-300">
              <p className="text-3xl font-bold text-amber-800">{stats.streak?.avg || 0}</p>
              <p className="text-sm text-amber-600">المتوسط</p>
            </div>
          </div>
          
          <div className="mt-4 bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p className="text-sm text-orange-700">
              ⭐ إجمالي النجوم: <strong>{stats.stars?.total || 0}</strong> | 
              أعلى رصيد: <strong>{stats.stars?.max || 0}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ⏰ ساعات الذروة */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <HourlyChart data={stats.peakHours?.distribution} peak={stats.peakHours?.peak} />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 🏆 المتصدرين + 📋 الطلبات الأكثر دعاءً */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* المتصدرين */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-lg">
          <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            🏆 أكثر المستخدمين نشاطاً
          </h3>
          
          <div className="space-y-3">
            {stats.topUsers?.map((user, index) => (
              <div 
                key={user.id || index}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  index === 0 ? 'bg-gradient-to-l from-amber-100 to-amber-50 border-amber-300' :
                  index === 1 ? 'bg-gradient-to-l from-stone-100 to-stone-50 border-stone-300' :
                  index === 2 ? 'bg-gradient-to-l from-orange-100 to-orange-50 border-orange-300' :
                  'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </span>
                  <div>
                    <p className="font-bold text-stone-800">{user.name}</p>
                    <p className="text-xs text-stone-500">
                      المستوى {user.level} | 
                      🔥 {user.dailyStreak} يوم | 
                      ⭐ {user.totalStars}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-emerald-600">{user.totalPrayers}</p>
                  <p className="text-xs text-stone-500">دعاء</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* الطلبات الأكثر دعاءً */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-lg">
          <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-500" />
            📋 الطلبات الأكثر دعاءً
          </h3>
          
          <div className="space-y-3">
            {stats.requests?.top?.map((request, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {request.type === 'personal' ? '🤲' :
                     request.type === 'friend' ? '👥' :
                     request.type === 'deceased' ? '🕊️' : '🏥'}
                  </span>
                  <div>
                    <p className="font-bold text-stone-800">{request.name}</p>
                    <p className="text-xs text-stone-500">
                      {request.type === 'personal' ? 'شخصي' :
                       request.type === 'friend' ? 'لصديق' :
                       request.type === 'deceased' ? 'لمتوفى' : 'لمريض'}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-blue-600">{request.prayerCount}</p>
                  <p className="text-xs text-stone-500">دعاء</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 🤝 الدعاء الجماعي + 🎰 القرعة + 🏅 الإنجازات */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* الدعاء الجماعي */}
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl border-2 border-teal-200 p-6 shadow-lg">
          <h3 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            الدعاء الجماعي
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-teal-700">الجلسات</span>
              <span className="text-2xl font-bold text-teal-800">{stats.collectivePrayer?.totalSessions || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-teal-700">المشاركات</span>
              <span className="text-2xl font-bold text-teal-800">{stats.collectivePrayer?.totalParticipants || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-teal-700">مشاركين فريدين</span>
              <span className="text-2xl font-bold text-teal-800">{stats.collectivePrayer?.uniqueParticipants || 0}</span>
            </div>
          </div>
        </div>

        {/* القرعة */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl border-2 border-pink-200 p-6 shadow-lg">
          <h3 className="text-lg font-bold text-pink-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎰</span>
            القرعة اليومية
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-pink-700">عدد السحوبات</span>
              <span className="text-2xl font-bold text-pink-800">{stats.lottery?.totalRuns || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-pink-700">إجمالي الفائزين</span>
              <span className="text-2xl font-bold text-pink-800">{stats.lottery?.totalWinners || 0}</span>
            </div>
            {stats.lottery?.lastRun && (
              <div className="pt-2 border-t border-pink-200 text-sm text-pink-600">
                آخر قرعة: {new Date(stats.lottery.lastRun.date).toLocaleDateString('ar-EG')}
              </div>
            )}
          </div>
        </div>

        {/* الإنجازات */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border-2 border-indigo-200 p-6 shadow-lg">
          <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🏅</span>
            الإنجازات
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-indigo-700">إجمالي الإنجازات</span>
              <span className="text-2xl font-bold text-indigo-800">{stats.achievements?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-indigo-700">الإنجازات النشطة</span>
              <span className="text-2xl font-bold text-indigo-800">{stats.achievements?.active || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-indigo-700">مستخدمين لديهم إنجازات</span>
              <span className="text-2xl font-bold text-indigo-800">{stats.achievements?.usersWithAchievements || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 📈 نسب المستويات للقرعة */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-lg">
        <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
          <PieChart className="w-6 h-6 text-purple-500" />
          📈 نسب المستويات في القرعة
        </h3>
        
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-stone-300 to-stone-400 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-white">{stats.levelRatios?.level1 || 70}%</span>
            </div>
            <p className="text-sm text-stone-600">المستوى 1</p>
          </div>
          
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-white">{stats.levelRatios?.level2 || 20}%</span>
            </div>
            <p className="text-sm text-stone-600">المستوى 2</p>
          </div>
          
          <div className="text-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-white">{stats.levelRatios?.level3 || 10}%</span>
            </div>
            <p className="text-sm text-stone-600">المستوى 3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
