'use client'

export default function TopWeeklyUser({ topUser }) {
  if (!topUser) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white">
      <div className="text-center">
        <div className="text-4xl mb-2">🏆</div>
        <h3 className="text-lg font-bold mb-1">أفضل مستخدم هذا الأسبوع</h3>
        <p className="text-2xl font-bold mb-1">{topUser.displayName}</p>
        <p className="text-sm opacity-90">{topUser.prayerCount} دعاء</p>
      </div>
    </div>
  );
}
