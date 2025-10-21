// ===============================================
// 🕌 البانر الإسلامي العلوي
// يظهر في أعلى كل صفحة كمساحة إعلانية
// ===============================================

import { useState, useEffect } from 'react';

export default function IslamicBanner() {
  const [bannerData, setBannerData] = useState(null);

  useEffect(() => {
    fetch('/api/settings/banner')
      .then(res => res.json())
      .then(data => setBannerData(data))
      .catch(err => console.error('Error fetching banner:', err));
  }, []);

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
      
      {/* 📝 المحتوى - Logo "يُجيب" */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="logo-text mb-1">يُجيب</div>
          {bannerData?.active && (
            <div className="text-amber-200 text-xs opacity-75">
              {bannerData.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}