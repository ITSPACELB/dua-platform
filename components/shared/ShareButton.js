'use client'
import { Share2 } from 'lucide-react';

export default function ShareButton({ title, text, url }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('تم نسخ الرابط!');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-full bg-sky-600 hover:bg-sky-700 text-white p-5 rounded-lg transition-colors flex items-center justify-center gap-3"
    >
      <Share2 className="w-5 h-5" />
      <div className="text-center">
        <p className="font-semibold">شارك الموقع</p>
        <p className="text-sm opacity-90">كل مؤمن جديد يعني دعوات أكثر إن شاء الله</p>
      </div>
    </button>
  );
}
