// ===============================================
// 📊 صفحة الإحصائيات (Stats Page)
// عرض إحصائيات المستخدم الشخصية
// ===============================================

import { useState, useEffect } from 'react';
import IslamicBanner from '../shared/IslamicBanner';
import MenuBar from '../shared/MenuBar';
import VerificationBadge from '../shared/VerificationBadge';

// تحويل أسماء الميزات للعربية
function getFeatureName(feature) {
  const featureNames = {
    'priority_display': 'ظهور بالأولوية في القوائم',
    'blue_badge': 'شارة التوثيق الزرقاء ✓',
    'green_badge': 'شارة التوثيق الخضراء ✓✓',
    'gold_badge': 'شارة التوثيق الذهبية 👑',
    'top_priority': 'أولوية عليا',
    'max_priority': 'أعلى أولوية',
    'special_reactions': 'ردود فعل خاصة'
  };
  return featureNames[feature] || feature;
}

export default function StatsPage({ user, onNavigate, onEditProfile, onLogout }) {
  // 📊 حالة التوثيق
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);

  // جلب بيانات التوثيق من API
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      fetch('/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setVerificationData(data.stats);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching stats:', err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-600">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* 🕌 البانر */}
      <IslamicBanner />

      {/* 📱 القائمة */}
      <MenuBar
        user={user}
        currentPage="stats"
        onNavigate={onNavigate}
        onEditProfile={onEditProfile}
        onLogout={onLogout}
      />

      {/* 📄 المحتوى */}
      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* 🎯 دعوات هذا الشهر */}
          <div className="bg-white rounded-lg border border-stone-200 p-6 text-center">
            <div className="text-5xl font-bold text-emerald-600 mb-2">
              {verificationData?.prayersThisMonth || 0}
            </div>
            <p className="text-stone-600">دعاء هذا الشهر</p>
            <p className="text-sm text-emerald-600 mt-2">ماشاء الله تبارك الله</p>
          </div>

          {/* 🏆 حالة التوثيق */}
          {verificationData && (
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="text-lg font-bold text-stone-800 mb-4">
                حالة التوثيق
              </h3>

              <div className="text-center mb-4">
                <VerificationBadge
                  level={verificationData.verificationLevel}
                  size="lg"
                />
                <p className="text-2xl font-bold text-emerald-600 mt-2">
                  {verificationData.interactionRate}%
                </p>
                <p className="text-sm text-stone-600">معدل التفاعل</p>
              </div>

              {verificationData.nextLevel?.level !== 'MAX' && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                  <p className="text-sm text-stone-700 text-center">
                    باقي <span className="font-bold text-amber-600">{verificationData.nextLevel.remaining}%</span>
                    {' '}للوصول إلى <span className="font-bold">{verificationData.nextLevel.levelName}</span>
                    {' '}{verificationData.nextLevel.icon}
                  </p>
                </div>
              )}

              {verificationData.unlockedFeatures && verificationData.unlockedFeatures.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-stone-800 mb-3">المميزات المفتوحة:</h4>
                  <ul className="space-y-2">
                    {verificationData.unlockedFeatures.map(feature => (
                      <li key={feature} className="text-emerald-600 flex items-center gap-2 text-sm">
                        <span className="text-emerald-600">✓</span>
                        <span>{getFeatureName(feature)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(!verificationData.unlockedFeatures || verificationData.unlockedFeatures.length === 0) && (
                <div className="mt-6 text-center">
                  <p className="text-stone-600 text-sm">
                    استمر في الدعاء للآخرين لفتح المميزات! 💪
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 📈 إحصائيات عامة */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4">إحصائيات عامة</h3>
            <div className="space-y-3">

              <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                <span className="text-stone-600">إجمالي دعواتك</span>
                <span className="font-semibold text-emerald-600">
                  {verificationData?.totalPrayersGiven || 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                <span className="text-stone-600">دعا لك</span>
                <span className="font-semibold text-emerald-600">
                  {verificationData?.prayersReceivedCount || 0} مؤمن
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                <span className="text-stone-600">طلبات استُجيبت</span>
                <span className="font-semibold text-amber-600">
                  {verificationData?.answeredPrayers || 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                <span className="text-stone-600">إشعارات استلمتها</span>
                <span className="font-semibold text-blue-600">
                  {verificationData?.totalNotificationsReceived || 0}
                </span>
              </div>
            </div>
          </div>

          {/* 💚 الأثر */}
          <div className="bg-gradient-to-br from-emerald-50 to-amber-50 rounded-lg border border-emerald-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-3 text-center">
              أثرك في المنصة
            </h3>
            <p className="text-sm text-stone-600 text-center mb-4">
              دعواتك ساهمت في راحة {verificationData?.totalPrayersGiven || 0} قلب إن شاء الله
            </p>
            <div className="text-center text-3xl">💚</div>
          </div>
        </div>
      </div>
    </div>
  );
}