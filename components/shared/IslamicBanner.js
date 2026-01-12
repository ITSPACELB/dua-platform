'use client'
import { useState, useEffect } from 'react';

export default function IslamicBanner() {
  const [bannerData, setBannerData] = useState(null);

  useEffect(() => {
    // ✅ الآن يجلب من API الصحيح
    fetch('/api/public/settings?key=banner')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.setting) {
          // Parse value
          const value = typeof data.setting.value === 'string'
            ? JSON.parse(data.setting.value)
            : data.setting.value;
          
          setBannerData(value);
        }
      })
      .catch(err => console.error('Error fetching banner:', err));
  }, []);

  // Default colors if not set
  const bgColor = bannerData?.backgroundColor || '#10b981';
  const textColor = bannerData?.textColor || '#ffffff';

  return (
    <div 
      className="h-20 relative overflow-hidden"
      style={{
        background: `linear-gradient(to right, ${bgColor}, ${bgColor})`
      }}
    >
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
          <div 
            className="logo-text mb-1"
            style={{ color: textColor }}
          >
            يُجيب
          </div>
        </div>
      </div>
    </div>
  );
}
