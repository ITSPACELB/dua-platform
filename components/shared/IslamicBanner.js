// ===============================================
// 🕌 البانر الإسلامي العلوي
// يظهر في أعلى كل صفحة كمساحة إعلانية
// ===============================================

export default function IslamicBanner() {
  return (
    <div className="h-20 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 relative overflow-hidden">
      {/* 🎨 الزخرفة الخلفية */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="h-full w-full" 
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
          }}
        ></div>
      </div>
      
      {/* 📝 المحتوى */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-amber-200 text-xs mb-1 opacity-75">
            مساحة إعلانية
          </div>
          <div className="text-white text-sm font-arabic">
            ✦ ✦ ✦
          </div>
        </div>
      </div>
    </div>
  );
}