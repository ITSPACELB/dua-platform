'use client';

import { useState, useEffect } from 'react';

/**
 * 🏆 لوحة المتصدرين (Leaderboard)
 * عرض أفضل المستخدمين حسب النقاط
 */
export default function Leaderboard({ user }) {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, level2, level3
  const [timeRange, setTimeRange] = useState('month'); // week, month, all
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, [filter, timeRange]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/leaderboard?filter=${filter}&range=${timeRange}`
      );

      if (response.ok) {
        const data = await response.json();
        setTopUsers(data.users || []);
        setUserRank(data.userRank || null);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // أيقونة الميدالية حسب الترتيب
  const getMedalIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // لون الترتيب
  const getRankColor = (rank) => {
    if (rank === 1) return 'text-amber-500';
    if (rank === 2) return 'text-stone-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-stone-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-stone-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* العنوان والفلاتر */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">🏆 لوحة المتصدرين</h1>
            <p className="text-purple-100">أفضل المستخدمين حسب النقاط</p>
          </div>

          {/* الفلاتر */}
          <div className="flex gap-3 flex-wrap">
            {/* فلتر المستوى */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white text-purple-900 px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="all">جميع المستويات</option>
              <option value="level2">المستوى 2 فقط</option>
              <option value="level3">المستوى 3 فقط</option>
            </select>

            {/* فلتر الفترة الزمنية */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white text-purple-900 px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
              <option value="all">كل الأوقات</option>
            </select>
          </div>
        </div>
      </div>

      {/* ترتيب المستخدم الحالي */}
      {user && userRank && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                #{userRank.rank}
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-800">ترتيبك</h3>
                <p className="text-stone-600">من بين {topUsers.length} مستخدم</p>
              </div>
            </div>
            <div className="text-left">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {userRank.points || 0}
              </div>
              <div className="text-stone-600 text-sm">نقطة</div>
            </div>
          </div>
        </div>
      )}

      {/* القائمة الرئيسية */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {/* Top 3 مميز */}
        {topUsers.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 border-b-4 border-purple-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* المركز الأول */}
              {topUsers[0] && (
                <div className="md:order-2">
                  <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-6 border-4 border-amber-400 shadow-xl transform md:-mt-4">
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-2">🥇</div>
                      <div className="bg-amber-500 text-white px-4 py-1 rounded-full inline-block text-sm font-bold">
                        المركز الأول
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-center text-stone-800 mb-2">
                      {topUsers[0].full_name}
                    </h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-1">
                        {topUsers[0].points || 0}
                      </div>
                      <div className="text-stone-600 text-sm">نقطة</div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-amber-300 flex justify-around text-sm">
                      <div className="text-center">
                        <div className="font-bold text-amber-600">⭐ {topUsers[0].total_stars || 0}</div>
                        <div className="text-stone-500 text-xs">نجوم</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-stone-600">{topUsers[0].total_prayers || 0}</div>
                        <div className="text-stone-500 text-xs">دعوة</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* المركز الثاني */}
              {topUsers[1] && (
                <div className="md:order-1">
                  <div className="bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl p-6 border-4 border-stone-300 shadow-lg">
                    <div className="text-center mb-4">
                      <div className="text-5xl mb-2">🥈</div>
                      <div className="bg-stone-400 text-white px-4 py-1 rounded-full inline-block text-sm font-bold">
                        المركز الثاني
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-center text-stone-800 mb-2">
                      {topUsers[1].full_name}
                    </h3>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {topUsers[1].points || 0}
                      </div>
                      <div className="text-stone-600 text-sm">نقطة</div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-stone-300 flex justify-around text-sm">
                      <div className="text-center">
                        <div className="font-bold text-amber-600">⭐ {topUsers[1].total_stars || 0}</div>
                        <div className="text-stone-500 text-xs">نجوم</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-stone-600">{topUsers[1].total_prayers || 0}</div>
                        <div className="text-stone-500 text-xs">دعوة</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* المركز الثالث */}
              {topUsers[2] && (
                <div className="md:order-3">
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-6 border-4 border-orange-300 shadow-lg">
                    <div className="text-center mb-4">
                      <div className="text-5xl mb-2">🥉</div>
                      <div className="bg-orange-600 text-white px-4 py-1 rounded-full inline-block text-sm font-bold">
                        المركز الثالث
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-center text-stone-800 mb-2">
                      {topUsers[2].full_name}
                    </h3>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {topUsers[2].points || 0}
                      </div>
                      <div className="text-stone-600 text-sm">نقطة</div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-orange-300 flex justify-around text-sm">
                      <div className="text-center">
                        <div className="font-bold text-amber-600">⭐ {topUsers[2].total_stars || 0}</div>
                        <div className="text-stone-500 text-xs">نجوم</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-stone-600">{topUsers[2].total_prayers || 0}</div>
                        <div className="text-stone-500 text-xs">دعوة</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* باقي المستخدمين (من 4 فما فوق) */}
        {topUsers.length > 3 && (
          <div className="p-6">
            <div className="space-y-3">
              {topUsers.slice(3).map((user, index) => {
                const rank = index + 4;
                const isCurrentUser = user.id === user?.id;

                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      isCurrentUser
                        ? 'bg-purple-50 border-purple-300 shadow-lg'
                        : 'bg-stone-50 border-stone-200 hover:border-purple-200 hover:shadow-md'
                    }`}
                  >
                    {/* الترتيب والاسم */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`text-2xl font-bold ${getRankColor(rank)} min-w-[3rem] text-center`}>
                        #{rank}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-stone-800 mb-1">
                          {user.full_name}
                          {isCurrentUser && (
                            <span className="mr-2 text-purple-600 text-sm">(أنت)</span>
                          )}
                        </h4>
                        <div className="flex items-center gap-3 text-sm">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            user.level === 3 ? 'bg-green-100 text-green-700' :
                            user.level === 2 ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {user.level === 3 ? 'مسجل' : user.level === 2 ? 'جزئي' : 'زائر'}
                          </span>
                          <span className="text-stone-500">
                            🔥 {user.daily_streak || 0} يوم
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* الإحصائيات */}
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {user.points || 0}
                        </div>
                        <div className="text-stone-500 text-xs">نقطة</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-amber-500">
                          ⭐ {user.total_stars || 0}
                        </div>
                        <div className="text-stone-500 text-xs">نجوم</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-stone-600">
                          {user.total_prayers || 0}
                        </div>
                        <div className="text-stone-500 text-xs">دعوة</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* لا يوجد مستخدمين */}
        {topUsers.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">
              لا يوجد مستخدمين بعد
            </h3>
            <p className="text-stone-600">
              كن أول من يتصدر القائمة!
            </p>
          </div>
        )}

      </div>

      {/* رسالة تحفيزية */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200 p-6 text-center">
        <p className="text-stone-700 leading-relaxed mb-2">
          "وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ"
        </p>
        <p className="text-purple-600 text-sm font-semibold">
          المطففين: 26
        </p>
      </div>

    </div>
  );
}

/**
 * 🏅 مكون صغير لعرض أفضل 3 فقط
 */
export function TopThreeMini({ users }) {
  if (!users || users.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h3 className="font-bold text-stone-800 mb-3 text-center">
        🏆 المتصدرون
      </h3>
      <div className="space-y-2">
        {users.slice(0, 3).map((user, index) => (
          <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </span>
              <span className="font-semibold text-stone-800 text-sm">
                {user.full_name}
              </span>
            </div>
            <span className="text-purple-600 font-bold text-sm">
              {user.points || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}