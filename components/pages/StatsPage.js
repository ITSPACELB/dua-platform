// ===============================================
// 📊 صفحة الإحصائيات (Stats Page)
// عرض إحصائيات المستخدم الشخصية
// ===============================================

import IslamicBanner from '../shared/IslamicBanner';
import MenuBar from '../shared/MenuBar';

export default function StatsPage({ user, onNavigate, onEditProfile }) {
  // 📊 بيانات وهمية (سيتم ربطها بـ API لاحقاً)
  const userPrayerCount = 47;

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
      />
      
      {/* 📄 المحتوى */}
      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* 🎯 دعوات هذا الشهر */}
          <div className="bg-white rounded-lg border border-stone-200 p-6 text-center">
            <div className="text-5xl font-bold text-emerald-600 mb-2">
              {userPrayerCount}
            </div>
            <p className="text-stone-600">دعاء هذا الشهر</p>
            <p className="text-sm text-emerald-600 mt-2">ماشاء الله تبارك الله</p>
          </div>

          {/* 📈 إحصائيات عامة */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4">إحصائيات عامة</h3>
            <div className="space-y-3">
              
              <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                <span className="text-stone-600">إجمالي دعواتك</span>
                <span className="font-semibold text-emerald-600">{userPrayerCount}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                <span className="text-stone-600">دعا لك</span>
                <span className="font-semibold text-emerald-600">24 مؤمن</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                <span className="text-stone-600">طلبات استُجيبت</span>
                <span className="font-semibold text-amber-600">3</span>
              </div>
            </div>
          </div>

          {/* 💚 الأثر */}
          <div className="bg-gradient-to-br from-emerald-50 to-amber-50 rounded-lg border border-emerald-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-3 text-center">
              أثرك في المنصة
            </h3>
            <p className="text-sm text-stone-600 text-center mb-4">
              دعواتك ساهمت في راحة {userPrayerCount} قلب إن شاء الله
            </p>
            <div className="text-center text-3xl">💚</div>
          </div>
        </div>
      </div>
    </div>
  );
}