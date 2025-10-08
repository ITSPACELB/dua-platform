// ===============================================
// 🏆 صفحة الإنجازات (Achievements Page)
// عرض التقدم والمستويات
// ===============================================

import IslamicBanner from '../shared/IslamicBanner';
import MenuBar from '../shared/MenuBar';
import { achievements } from '../constants/messages';

export default function AchievementsPage({ user, onNavigate, onEditProfile }) {
  // 📊 بيانات وهمية (سيتم ربطها بـ API)
  const userPrayerCount = 47;
  
  // 🎯 الإنجاز القادم
  const nextAchievement = achievements.find(a => a.count > userPrayerCount) || achievements[achievements.length - 1];
  const remaining = nextAchievement.count - userPrayerCount;
  const progress = (userPrayerCount / nextAchievement.count) * 100;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* 🕌 البانر */}
      <IslamicBanner />
      
      {/* 📱 القائمة */}
      <MenuBar 
        user={user}
        currentPage="achievements"
        onNavigate={onNavigate}
        onEditProfile={onEditProfile}
      />
      
      {/* 📄 المحتوى */}
      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* 📊 العداد التحفيزي */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 p-6">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-emerald-700 mb-2">
                {userPrayerCount}
              </div>
              <p className="text-stone-600">دعاء هذا الشهر</p>
            </div>

            {/* شريط التقدم */}
            <div className="mb-4">
              <div className="w-full bg-emerald-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full transition-all duration-500"
                  style={{width: `${Math.min(progress, 100)}%`}}
                ></div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-stone-600 mb-2">
                باقي <span className="font-bold text-emerald-700">{remaining}</span> {remaining === 1 ? 'دعاء' : 'دعوات'} لتصل إلى:
              </p>
              <p className="text-emerald-700 font-semibold">
                {nextAchievement.icon} {nextAchievement.title}
              </p>
            </div>
          </div>

          {/* 🏅 قائمة الإنجازات */}
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4 text-center">
              مستويات الإنجازات
            </h3>
            <div className="space-y-3">
              {achievements.map((achievement, idx) => {
                const isCompleted = userPrayerCount >= achievement.count;
                const isCurrent = achievement.count === nextAchievement.count;
                
                return (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCompleted 
                        ? 'bg-emerald-50 border-emerald-500' 
                        : isCurrent
                          ? 'bg-amber-50 border-amber-500'
                          : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-stone-800">
                            {achievement.count}
                          </span>
                          {isCompleted && <span className="text-emerald-600">✓</span>}
                          {isCurrent && <span className="text-amber-600">← الهدف الحالي</span>}
                        </div>
                        <p className="text-sm text-stone-600">{achievement.title}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 💬 رسالة تحفيزية */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-6 text-center">
            <p className="text-stone-700 leading-relaxed">
              "كل دعاء تدعوه يُكتب لك<br/>وتدعو لك الملائكة بمثله إن شاء الله"
            </p>
            <div className="text-3xl mt-3">🤲</div>
          </div>
        </div>
      </div>
    </div>
  );
}