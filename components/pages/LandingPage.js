// ===============================================
// 🏠 صفحة الهبوط (Landing Page)
// أول صفحة يراها المستخدم الجديد
// ===============================================

import { Users } from 'lucide-react';
import IslamicBanner from '../shared/IslamicBanner';
import { TOTAL_USERS } from '../constants/messages';

export default function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* 🕌 البانر العلوي */}
      <IslamicBanner />
      
      {/* 📄 المحتوى */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-stone-200 p-8 text-center">
          
          {/* 🎨 الأيقونة */}
          <div className="w-20 h-20 bg-emerald-600 rounded-full mx-auto flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>

          {/* 📝 العنوان */}
          <h1 className="text-2xl font-semibold text-stone-800 mb-6">
            منصة الدعاء الجماعي
          </h1>
          
          {/* 📖 الآية */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-6">
            <p className="text-stone-700 leading-relaxed text-base" style={{fontFamily: 'Traditional Arabic, serif'}}>
              ﴿ وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ ﴾
            </p>
          </div>
          
          {/* 💬 الوصف */}
          <p className="text-stone-600 text-base leading-relaxed mb-2">
            دعاء واحد قد يغير حياة إنسان
          </p>
          <p className="text-stone-600 text-base leading-relaxed mb-6">
            وقد يغير حياتك إن شاء الله
          </p>

          {/* 👥 عداد المستخدمين */}
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-emerald-700 font-semibold text-lg">
              🌍 انضم إلى {TOTAL_USERS.toLocaleString()} مؤمن
            </p>
            <p className="text-emerald-600 text-sm">من حول العالم</p>
          </div>

          {/* 🚀 زر البدء */}
          <button
            onClick={onStart}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            ابدأ الآن إن شاء الله
          </button>
        </div>
      </div>
    </div>
  );
}