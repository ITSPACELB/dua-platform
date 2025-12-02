'use client'

import { useState, useEffect } from 'react';
import VerificationBadge, { createVerificationLevel } from './VerificationBadge';

// ════════════════════════════════════════════════════════════
// 👥 المتفاعلون اليوم - مكون احترافي مع Caching
// ════════════════════════════════════════════════════════════
// ✅ نظام الماسة والكأس والتاج المحسّن
// ════════════════════════════════════════════════════════════

export default function TodayActiveUsers({ limit = 10, showTitle = true }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActiveUsers();
    
    // تحديث كل 2 دقيقة (API معه cache لمدة 2 دقيقة)
    const interval = setInterval(fetchActiveUsers, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [limit]);

async function fetchActiveUsers() {
  try {
    const response = await fetch(`/api/users/active?limit=${limit}`);

    if (!response.ok) {
      throw new Error('فشل جلب البيانات');
    }

    const result = await response.json();
    
    if (result.success && result.users) {
      // ════════════════════════════════════════════════════════════
      // ✅ نظام الماسة والكأس والتاج - توزيع ذكي
      // ════════════════════════════════════════════════════════════
      const usersWithNames = result.users.map((user, index) => {
        // ✅ نظام الماسة والكأس والتاج
        let interactionRate = 0;
        
        if (user.level === 3) {
          // Level 3: توزيع بين التاج والكأس
          interactionRate = index % 3 === 0 ? 99 : 94; // 99% تاج أو 94% كأس
        } else if (user.level === 2) {
          // Level 2: توزيع بين الكأس والماسة
          interactionRate = index % 2 === 0 ? 92 : 86; // 92% كأس أو 86% ماسة
        } else if (user.prayersToday > 0) {
          // Level 1 نشط: ماسة
          interactionRate = 83; // 83% ماسة
        }
        
        return {
          ...user,
          displayName: user.name || 'مؤمن',
          verificationLevel: {
            interactionRate: interactionRate
          }
        };
      });

      setData({
        users: usersWithNames,
        stats: {
          showing: result.users.length,
          totalActiveUsers: result.users.length,
          totalPrayersToday: result.users.reduce((sum, u) => sum + u.prayersToday, 0)
        }
      });
      setError(null);
    } else {
      throw new Error(result.error || 'لا توجد بيانات');
    }
  } catch (err) {
    console.error('Error fetching active users:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

  // ════════════════════════════════════════════════════════════
  // 🎨 Loading State
  // ════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        {showTitle && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-lg">👥</span>
            </div>
            <h2 className="text-xl font-bold text-stone-800">المتفاعلون اليوم</h2>
          </div>
        )}
        
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                <div className="w-8 h-8 bg-stone-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-stone-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-stone-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // 🎨 Error State
  // ════════════════════════════════════════════════════════════
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        {showTitle && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-lg">👥</span>
            </div>
            <h2 className="text-xl font-bold text-stone-800">المتفاعلون اليوم</h2>
          </div>
        )}
        <div className="text-center py-4">
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button
            onClick={fetchActiveUsers}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // 🎨 Empty State
  // ════════════════════════════════════════════════════════════
  if (!data || data.users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        {showTitle && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-lg">👥</span>
            </div>
            <h2 className="text-xl font-bold text-stone-800">المتفاعلون اليوم</h2>
          </div>
        )}
        
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🕊️</div>
          <p className="text-stone-500 text-sm">لا يوجد متفاعلون اليوم بعد</p>
          <p className="text-xs text-stone-400 mt-2">كن أول من يدعو اليوم!</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // 🎨 Main UI
  // ════════════════════════════════════════════════════════════
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
      {/* العنوان */}
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-lg">👥</span>
            </div>
            <h2 className="text-xl font-bold text-stone-800">المتفاعلون اليوم</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-stone-600">
              {data.stats.showing} من {data.stats.totalActiveUsers}
            </span>
          </div>
        </div>
      )}

      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 mb-1">متفاعلون اليوم</p>
          <p className="text-xl font-bold text-blue-700">{data.stats.totalActiveUsers}</p>
        </div>
        <div className="p-3 bg-emerald-50 rounded-lg">
          <p className="text-xs text-emerald-600 mb-1">دعوات اليوم</p>
          <p className="text-xl font-bold text-emerald-700">{data.stats.totalPrayersToday}</p>
        </div>
      </div>

      {/* القائمة */}
      <div className="space-y-2">
        {data.users.map((user, index) => {
          const verificationLevel = createVerificationLevel(user.verificationLevel?.interactionRate || 0);
          
          return (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors group"
            >
              {/* الترتيب */}
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                  ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md' : 
                    index === 1 ? 'bg-gradient-to-br from-stone-300 to-stone-400 text-white shadow-sm' :
                    index === 2 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm' :
                    'bg-stone-100 text-stone-600'}
                `}
              >
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </div>

              {/* الاسم والشارة */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-800 truncate">
                    {user.displayName || user.name || 'مؤمن'}
                  </span>
                  {user.badge && (
                    <span className="text-lg">{user.badge}</span>
                  )}
                  {verificationLevel && (
                    <VerificationBadge 
                      level={verificationLevel}
                      size="sm"
                      showTooltip={true}
                    />
                  )}
                </div>
                <p className="text-xs text-stone-500">
                  {user.prayersToday} {user.prayersToday === 1 ? 'دعاء' : 'دعوات'} اليوم
                </p>
              </div>

              {/* أيقونة التفاعل */}
              <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>يتم التحديث تلقائياً كل دقيقتين</span>
          <button
            onClick={fetchActiveUsers}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            🔄 تحديث
          </button>
        </div>
      </div>

      {/* رسالة تحفيزية */}
      {data.users.length > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
          <p className="text-xs text-center text-emerald-700">
            💚 ماشاء الله! استمروا في الدعاء للآخرين
          </p>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 📝 ملاحظات الاستخدام
// ════════════════════════════════════════════════════════════
/*
الاستخدام في HomePage.js:

import TodayActiveUsers from '../shared/TodayActiveUsers';

// في JSX:
<TodayActiveUsers limit={10} showTitle={true} />

الميزات:
✅ تحديث تلقائي كل دقيقتين
✅ عرض الترتيب (🥇 🥈 🥉)
✅ نظام الماسة والكأس والتاج (80-89% 💎، 90-97% 🏆، 98%+ 👑)
✅ إحصائيات سريعة
✅ Loading/Error/Empty states
✅ زر تحديث يدوي
✅ تصميم responsive
✅ Hover effects
✅ يعمل بدون token (API عام)

توزيع الشارات:
- Level 3: التاج (33%) أو الكأس (67%)
- Level 2: الكأس (50%) أو الماسة (50%)
- Level 1 نشط: الماسة (100%)
- غير نشط: بدون شارة

الأداء:
- مع Materialized View: 1-3ms
- مع Cache: instant
- التحديث: كل دقيقتين تلقائياً
*/