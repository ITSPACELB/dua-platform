'use client';

import { useState, useEffect } from 'react';

/**
 * 🎛️ لوحة التحكم الشاملة بنظام الإنجازات
 * للأدمن فقط - تحكم كامل بالقرعة والمكافآت
 */
export default function AdminAchievementsPanel({ user }) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [lotteryHistory, setLotteryHistory] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [manualWinners, setManualWinners] = useState([]);
  const [toast, setToast] = useState(null);
  const [runningTask, setRunningTask] = useState(null);

  // جلب البيانات عند التحميل
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSettings(),
        loadLotteryHistory(),
        loadTopUsers()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // جلب الإعدادات
  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/achievements-control?action=getSettings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // جلب سجل القرعات
  const loadLotteryHistory = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/achievements-control?action=getLotteryHistory&limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLotteryHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  // جلب أفضل المستخدمين
  const loadTopUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/achievements-control?action=getTopUsers&limit=20', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTopUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading top users:', error);
    }
  };

  // تشغيل القرعة يدوياً
  const runLotteryManually = async () => {
    setRunningTask('lottery');
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/cron/daily-lottery', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task: 'lottery' })
      });

      const data = await response.json();

      if (data.success) {
        showToast('success', 'تم تشغيل القرعة بنجاح!');
        await loadAllData();
      } else {
        showToast('error', data.result?.lottery?.message || 'فشل تشغيل القرعة');
      }
    } catch (error) {
      showToast('error', 'خطأ في الاتصال');
    } finally {
      setRunningTask(null);
    }
  };

  // تبديل التلقائي/اليدوي
  const toggleAutomatic = async (feature) => {
    try {
      const token = localStorage.getItem('auth_token');
      const currentSetting = settings?.find(s => s.feature_name === feature);
      
      const response = await fetch('/api/admin/achievements-control', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'toggleAutomatic',
          feature,
          isAutomatic: !currentSetting?.is_automatic
        })
      });

      if (response.ok) {
        showToast('success', 'تم التحديث بنجاح');
        await loadSettings();
      }
    } catch (error) {
      showToast('error', 'فشل التحديث');
    }
  };

  // إضافة فائز يدوي
  const addManualWinner = async () => {
    if (manualWinners.length >= 2) {
      showToast('warning', 'الحد الأقصى فائزان');
      return;
    }

    const userId = prompt('أدخل ID المستخدم:');
    const userName = prompt('أدخل اسم المستخدم:');

    if (!userId || !userName) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/achievements-control', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'setManualWinners',
          winners: [...manualWinners, { id: userId, name: userName }]
        })
      });

      if (response.ok) {
        showToast('success', 'تم إضافة الفائز');
        setManualWinners([...manualWinners, { id: userId, name: userName }]);
      }
    } catch (error) {
      showToast('error', 'فشلت الإضافة');
    }
  };

  // منح إنجاز يدوياً
  const grantAchievement = async (userId, achievementType) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, achievementType })
      });

      if (response.ok) {
        showToast('success', 'تم منح الإنجاز بنجاح');
      }
    } catch (error) {
      showToast('error', 'فشل منح الإنجاز');
    }
  };

  // عرض Toast
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-stone-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const lotterySettings = settings?.find(s => s.feature_name === 'lottery');
  const autoStars2Settings = settings?.find(s => s.feature_name === 'auto_grant_stars2');
  const autoStars3Settings = settings?.find(s => s.feature_name === 'auto_grant_stars3');

  return (
    <div className="min-h-screen bg-stone-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* العنوان */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">🎛️ لوحة التحكم بالإنجازات</h1>
          <p className="text-purple-100">إدارة شاملة للقرعة والمكافآت والإنجازات</p>
        </div>

        {/* الإجراءات السريعة */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-stone-800 mb-4">⚡ إجراءات سريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* تشغيل القرعة */}
            <button
              onClick={runLotteryManually}
              disabled={runningTask === 'lottery'}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 px-6 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {runningTask === 'lottery' ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  جاري التشغيل...
                </span>
              ) : (
                '🎲 تشغيل القرعة الآن'
              )}
            </button>

            {/* إضافة فائز يدوي */}
            <button
              onClick={addManualWinner}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              👑 إضافة فائز يدوي
            </button>

            {/* تحديث البيانات */}
            <button
              onClick={loadAllData}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
            >
              🔄 تحديث البيانات
            </button>
          </div>
        </div>

        {/* الإعدادات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* القرعة اليومية */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-800">🎲 القرعة اليومية</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                lotterySettings?.is_automatic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {lotterySettings?.is_automatic ? 'تلقائي' : 'يدوي'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 text-sm">الحالة:</span>
                <span className={`font-semibold ${
                  lotterySettings?.is_enabled ? 'text-green-600' : 'text-red-600'
                }`}>
                  {lotterySettings?.is_enabled ? 'مفعّل ✓' : 'معطّل ✗'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-600 text-sm">عدد الفائزين:</span>
                <span className="font-semibold text-stone-800">
                  {lotterySettings?.setting_value?.winners || 2}
                </span>
              </div>

              <button
                onClick={() => toggleAutomatic('lottery')}
                className="w-full mt-4 bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded-lg hover:bg-purple-200 transition-colors"
              >
                {lotterySettings?.is_automatic ? '→ تحويل ليدوي' : '→ تحويل لتلقائي'}
              </button>
            </div>
          </div>

          {/* الدعاء المضاعف */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-800">⭐⭐ الدعاء المضاعف</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                autoStars2Settings?.is_automatic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {autoStars2Settings?.is_automatic ? 'تلقائي' : 'يدوي'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 text-sm">الحد الأدنى:</span>
                <span className="font-semibold text-stone-800">
                  {autoStars2Settings?.setting_value?.threshold || 50} دعوة
                </span>
              </div>

              <button
                onClick={() => toggleAutomatic('auto_grant_stars2')}
                className="w-full mt-4 bg-amber-100 text-amber-700 font-semibold py-2 px-4 rounded-lg hover:bg-amber-200 transition-colors"
              >
                {autoStars2Settings?.is_automatic ? '→ تحويل ليدوي' : '→ تحويل لتلقائي'}
              </button>
            </div>
          </div>

          {/* اختيار الآية */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-800">⭐⭐⭐ اختيار الآية</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                autoStars3Settings?.is_automatic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {autoStars3Settings?.is_automatic ? 'تلقائي' : 'يدوي'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 text-sm">الحد الأدنى:</span>
                <span className="font-semibold text-stone-800">
                  {autoStars3Settings?.setting_value?.threshold || 100} دعوة
                </span>
              </div>

              <button
                onClick={() => toggleAutomatic('auto_grant_stars3')}
                className="w-full mt-4 bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors"
              >
                {autoStars3Settings?.is_automatic ? '→ تحويل ليدوي' : '→ تحويل لتلقائي'}
              </button>
            </div>
          </div>
        </div>

        {/* أفضل المستخدمين */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-stone-800 mb-4">🏆 أفضل 20 مستخدم (حسب النقاط)</h2>
          
          {topUsers.length === 0 ? (
            <p className="text-stone-500 text-center py-8">لا يوجد مستخدمين بعد</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-100">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-stone-700">الترتيب</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-stone-700">الاسم</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-stone-700">المستوى</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-stone-700">النقاط</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-stone-700">النجوم</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-stone-700">الدعوات</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-stone-700">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {topUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${
                          index === 0 ? 'text-amber-500 text-lg' :
                          index === 1 ? 'text-stone-400 text-lg' :
                          index === 2 ? 'text-orange-600 text-lg' :
                          'text-stone-600'
                        }`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-stone-800">
                        {user.full_name}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.level === 3 ? 'bg-green-100 text-green-700' :
                          user.level === 2 ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.level === 3 ? 'مسجل' : user.level === 2 ? 'جزئي' : 'زائر'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-purple-600">
                        {user.points || 0}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-amber-500 font-semibold">
                          ⭐ {user.total_stars || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-stone-600">
                        {user.total_prayers || 0}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              grantAchievement(user.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="text-sm border border-stone-300 rounded px-2 py-1"
                        >
                          <option value="">منح إنجاز</option>
                          <option value="name_display">⭐ عرض الاسم</option>
                          <option value="double_prayer">⭐⭐ دعاء مضاعف</option>
                          <option value="verse_selection">⭐⭐⭐ اختيار آية</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* سجل القرعات */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-stone-800 mb-4">📜 سجل آخر 10 قرعات</h2>
          
          {lotteryHistory.length === 0 ? (
            <p className="text-stone-500 text-center py-8">لا يوجد سجل قرعات بعد</p>
          ) : (
            <div className="space-y-3">
              {lotteryHistory.map((lottery, index) => (
                <div key={index} className="border border-stone-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-stone-600 text-sm">
                      {new Date(lottery.lottery_time).toLocaleString('ar-IQ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      lottery.lottery_type === 'automatic' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {lottery.lottery_type === 'automatic' ? 'تلقائي' : 'يدوي'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-stone-500">المؤهلون:</span>
                      <span className="font-semibold text-stone-800 mr-2">{lottery.total_eligible}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">الفائزون:</span>
                      <span className="font-semibold text-stone-800 mr-2">{lottery.winners_count}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">المستوى 3:</span>
                      <span className="font-semibold text-stone-800 mr-2">{lottery.level3_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className={`rounded-xl shadow-2xl px-6 py-4 flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' :
            toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
          } text-white`}>
            <span className="text-2xl">
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✗'}
              {toast.type === 'warning' && '⚠'}
              {toast.type === 'info' && 'ℹ'}
            </span>
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}