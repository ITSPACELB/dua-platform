'use client'
import { useState, useEffect } from 'react';

export default function StatsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, today, week, month

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = () => {
    const token = localStorage.getItem('token');
    setLoading(true);

    fetch(`/api/admin/stats?range=${timeRange}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Stats error:', err);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 animate-pulse">📊</div>
        <p className="text-stone-600">جاري تحميل الإحصائيات...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-stone-600">فشل تحميل الإحصائيات</p>
        <button
          onClick={loadStats}
          className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          📊 إحصائيات المنصة
        </h2>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'الكل' },
            { value: 'today', label: 'اليوم' },
            { value: 'week', label: 'هذا الأسبوع' },
            { value: 'month', label: 'هذا الشهر' }
          ].map(range => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === range.value
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="text-5xl">👥</div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
              المستخدمين
            </div>
          </div>
          <p className="text-4xl font-bold mb-2">{stats.users.total.toLocaleString()}</p>
          <p className="text-blue-100 text-sm">إجمالي المستخدمين</p>
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-sm">
            <span>نشط: {stats.users.active}</span>
            <span>جديد: {stats.users.new}</span>
          </div>
        </div>

        {/* Prayer Requests */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="text-5xl">🙏</div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
              الطلبات
            </div>
          </div>
          <p className="text-4xl font-bold mb-2">{stats.requests.total.toLocaleString()}</p>
          <p className="text-purple-100 text-sm">طلبات الدعاء</p>
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-sm">
            <span>نشط: {stats.requests.active}</span>
            <span>مستجاب: {stats.requests.answered}</span>
          </div>
        </div>

        {/* Total Prayers */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="text-5xl">🤲</div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
              الدعوات
            </div>
          </div>
          <p className="text-4xl font-bold mb-2">{stats.prayers.total.toLocaleString()}</p>
          <p className="text-amber-100 text-sm">إجمالي الدعوات</p>
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-sm">
            <span>اليوم: {stats.prayers.today}</span>
            <span>الشهر: {stats.prayers.thisMonth}</span>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="text-5xl">📈</div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
              التفاعل
            </div>
          </div>
          <p className="text-4xl font-bold mb-2">{stats.engagement?.avgInteraction || '0'}%</p>
          <p className="text-emerald-100 text-sm">معدل التفاعل العام</p>
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-sm">
            <span>مشاركات: {stats.engagement?.totalShares || 0}</span>
          </div>
        </div>
      </div>

      {/* Verification Stats */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
          ⭐ المستخدمون الموثقون
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200">
            <div className="text-5xl mb-3">👑</div>
            <p className="text-4xl font-bold text-amber-600 mb-2">{stats.verification.gold}</p>
            <p className="text-sm font-semibold text-stone-700 mb-1">ذهبي (98%+)</p>
            <p className="text-xs text-stone-600">صلاحيات متقدمة</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200">
            <div className="text-5xl mb-3">✓✓</div>
            <p className="text-4xl font-bold text-emerald-600 mb-2">{stats.verification.green}</p>
            <p className="text-sm font-semibold text-stone-700 mb-1">أخضر (90%+)</p>
            <p className="text-xs text-stone-600">موثق متقدم</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
            <div className="text-5xl mb-3">✓</div>
            <p className="text-4xl font-bold text-blue-600 mb-2">{stats.verification.blue}</p>
            <p className="text-sm font-semibold text-stone-700 mb-1">أزرق (80%+)</p>
            <p className="text-xs text-stone-600">موثق</p>
          </div>
        </div>
      </div>

      {/* Request Types */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
          📊 توزيع أنواع الطلبات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.requests.types?.map((type, idx) => {
            const colors = {
              general: 'emerald',
              deceased: 'stone',
              sick: 'blue'
            };
            const labels = {
              general: 'دعاء عام',
              deceased: 'للمتوفى',
              sick: 'للمريض'
            };
            const color = colors[type.type] || 'stone';
            
            return (
              <div key={idx} className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-stone-700">{labels[type.type]}</span>
                  <span className={`text-2xl font-bold text-${color}-600`}>{type.count}</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2">
                  <div
                    className={`bg-${color}-500 h-2 rounded-full transition-all`}
                    style={{ width: `${(type.count / stats.requests.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-stone-600 mt-2 text-center">
                  {((type.count / stats.requests.total) * 100).toFixed(1)}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Growth Chart */}
      {stats.growth && stats.growth.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            📈 نمو المستخدمين (آخر 7 أيام)
          </h3>
          <div className="space-y-3">
            {stats.growth.map((day, idx) => {
              const maxCount = Math.max(...stats.growth.map(d => d.count));
              const percentage = (day.count / maxCount) * 100;
              
              return (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-sm text-stone-600 w-32 font-medium">
                    {new Date(day.date).toLocaleDateString('ar-EG', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <div className="flex-1 bg-stone-100 rounded-full h-10 overflow-hidden relative">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full flex items-center justify-end px-4 text-white font-bold transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 10)}%` }}
                    >
                      {day.count > 0 && (
                        <span className="text-sm">{day.count}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-stone-50 to-stone-100 border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
          ⚡ إجراءات سريعة
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white hover:bg-emerald-50 border-2 border-emerald-200 text-stone-700 p-4 rounded-lg transition-all hover:shadow-md">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-sm font-semibold">إدارة المستخدمين</p>
          </button>
          <button className="bg-white hover:bg-purple-50 border-2 border-purple-200 text-stone-700 p-4 rounded-lg transition-all hover:shadow-md">
            <div className="text-3xl mb-2">🙏</div>
            <p className="text-sm font-semibold">طلبات الدعاء</p>
          </button>
          <button className="bg-white hover:bg-amber-50 border-2 border-amber-200 text-stone-700 p-4 rounded-lg transition-all hover:shadow-md">
            <div className="text-3xl mb-2">🔔</div>
            <p className="text-sm font-semibold">إرسال إشعار</p>
          </button>
          <button className="bg-white hover:bg-blue-50 border-2 border-blue-200 text-stone-700 p-4 rounded-lg transition-all hover:shadow-md">
            <div className="text-3xl mb-2">📱</div>
            <p className="text-sm font-semibold">رسائل واتساب</p>
          </button>
        </div>
      </div>
    </div>
  );
}