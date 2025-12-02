'use client'
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Calendar,
  Heart,
  MessageCircle,
  Award,
  Star,
  RefreshCw,
  Globe,
  Sparkles,
  Share2
} from 'lucide-react';

export default function StatsPage({ onNavigate, userId }) {
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const statsResponse = await fetch('/api/stats');
      
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setStats(data);
      } else {
        console.warn('فشل جلب الإحصائيات العامة');
        setError('تعذر تحميل الإحصائيات');
      }

      if (userId) {
        await loadUserStats();
      }

    } catch (err) {
      console.error('خطأ في تحميل الإحصائيات:', err);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setUserStats(null);
        return;
      }

      const response = await fetch('/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data.data);
      } else if (response.status === 401) {
        setUserStats(null);
        localStorage.removeItem('auth_token');
      } else {
        setUserStats(null);
      }
    } catch (err) {
      console.error('خطأ في جلب الإحصائيات الشخصية:', err);
      setUserStats(null);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const StatCard = ({ icon: Icon, label, value, color = 'blue', trend, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${getColorValue(color)}20` }}
        >
          <Icon 
            className="w-6 h-6" 
            style={{ color: getColorValue(color) }}
          />
        </div>
        {trend !== undefined && trend !== null && (
          <span className={`text-sm font-semibold ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value !== undefined && value !== null ? value.toLocaleString() : '0'}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );

  const getColorValue = (color) => {
    const colors = {
      blue: '#3B82F6',
      red: '#EF4444',
      purple: '#A855F7',
      green: '#10B981',
      amber: '#F59E0B',
      emerald: '#10B981',
      indigo: '#6366F1'
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => onNavigate('home')}
            className="mb-4 flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span>←</span>
            <span>رجوع</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="w-8 h-8" />
                الإحصائيات
              </h1>
              <p className="text-blue-100 mt-2">
                تابع إحصائيات المنصة وتفاعل المستخدمين
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">تحديث</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {userStats && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" />
              إحصائياتي الشخصية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Heart} label="دعواتي" value={userStats.totalPrayers || 0} color="red" />
              <StatCard icon={MessageCircle} label="طلباتي" value={userStats.totalRequests || 0} color="blue" />
              <StatCard icon={Star} label="النجوم" value={userStats.totalStars || 0} color="amber" />
              <StatCard icon={TrendingUp} label="المستوى" value={userStats.level || 1} color="green" />
            </div>
          </div>
        )}

        {stats && stats.stats && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              إحصائيات المنصة
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} label="إجمالي المؤمنين" value={stats.stats.believersCount || 0} color="blue" subtitle="المستخدمون المسجلون" />
              <StatCard icon={Heart} label="دعوات اليوم" value={stats.stats.todayPrayersCount || 0} color="red" subtitle="الدعوات المسجلة اليوم" />
              <StatCard icon={MessageCircle} label="الطلبات النشطة" value={stats.stats.activeRequestsCount || 0} color="purple" subtitle="طلبات تنتظر الدعاء" />
              <StatCard icon={Calendar} label="المتفاعلون اليوم" value={stats.stats.todayActiveUsersCount || 0} color="green" subtitle="مستخدمون نشطون" />
            </div>
          </div>
        )}

        {/* 💚 قسم فضل الدعاء والمشاركة - بدلاً من الأكثر تفاعلاً */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-600" />
            فضل الدعاء والمشاركة
          </h2>
          
          <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-teal-900/20 rounded-2xl p-8 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full mb-4 shadow-xl">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                ﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                كل دعاء تدعوه لأخيك، هو استثمار في الآخرة وبركة في الدنيا
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-700 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      الدعاء للآخرين
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                      «مَا مِنْ عَبْدٍ مُسْلِمٍ يَدْعُو لِأَخِيهِ بِظَهْرِ الْغَيْبِ، إِلَّا قَالَ الْمَلَكُ: وَلَكَ بِمِثْلٍ»
                    </p>
                    <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold">دعاؤك لغيرك = دعاء الملائكة لك</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      طلب الدعاء من الصالحين
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                      ﴿وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ﴾ - طلبك للدعاء يفتح لك أبواب الرحمة من كل مكان
                    </p>
                    <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold">دعاء المؤمنين يُستجاب لك</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-amber-200 dark:border-amber-700 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      نشر المنصة
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                      «مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ» - كل دعاء يُدعى بسببك، في ميزان حسناتك
                    </p>
                    <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold">صدقة جارية لا تنقطع</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      الدعاء للموتى
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                      «إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلاثٍ» - دعاؤك للميت يرفع درجته في الجنة
                    </p>
                    <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold">هدية تصل للميت في قبره</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-700 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-emerald-600" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  مجتمع عالمي موحّد
                </h4>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {['🇸🇦', '🇪🇬', '🇦🇪', '🇯🇴', '🇮🇶', '🇰🇼', '🇴🇲', '🇶🇦', '🇧🇭', '🇱🇧', '🇸🇾', '🇵🇸', '🇾🇪', '🇱🇾', '🇹🇳', '🇩🇿', '🇲🇦', '🇸🇩'].map((flag, i) => (
                  <div 
                    key={i}
                    className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl hover:scale-110 transition-transform cursor-default border border-gray-200 dark:border-gray-600"
                  >
                    {flag}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {stats?.stats?.believersCount || 0}+
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">مؤمن</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">18+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">دولة عربية</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">
                    {stats?.stats?.todayPrayersCount || 0}+
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">دعاء اليوم</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl p-6 border-2 border-dashed border-emerald-300 dark:border-emerald-700 text-center">
              <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                <strong className="text-emerald-700 dark:text-emerald-400">﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ﴾</strong>
                <br />
                <span className="text-base">من الخليج إلى المحيط - مؤمنون يجمعهم حب الخير ويوحدهم الدعاء</span>
              </p>
            </div>

          </div>
        </div>

        {!stats && !loading && !error && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              لا توجد إحصائيات متاحة حالياً
            </p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
