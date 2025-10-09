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
      
      {/* 📝 المحتوى */}
      <div className="absolute inset-0 flex items-center justify-center">
        {bannerData?.active ? (
          <a 
            href={bannerData.link || '#'} 
            target={bannerData.link ? '_blank' : '_self'}
            rel={bannerData.link ? 'noopener noreferrer' : undefined}
            className="block w-full h-full flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <div className="text-white text-center px-4">
              <p className="font-medium">{bannerData.text}</p>
            </div>
          </a>
        ) : (
          <div className="text-center">
            <div className="text-amber-200 text-xs mb-1 opacity-75">
              مساحة إعلانية
            </div>
            <div className="text-white text-sm font-arabic">
              ✦ ✦ ✦
            </div>
          </div>
        )}
      </div>
    </div>
  );
}