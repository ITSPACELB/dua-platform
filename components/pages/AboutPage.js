// ===============================================
// ℹ️ صفحة من نحن (About Page)
// قصة المنصة + نموذج التواصل
// ===============================================

import { useState } from 'react';
import { Mail } from 'lucide-react';
import IslamicBanner from '../shared/IslamicBanner';
import MenuBar from '../shared/MenuBar';

export default function AboutPage({ user, onNavigate, onEditProfile }) {
  const [contactMessage, setContactMessage] = useState('');

  const handleSendMessage = () => {
    if (!contactMessage.trim()) {
      alert('الرجاء كتابة رسالة');
      return;
    }
    // TODO: ربط بـ API إرسال البريد
    alert('تم إرسال رسالتك بنجاح! سنرد عليك قريباً إن شاء الله');
    setContactMessage('');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* 🕌 البانر */}
      <IslamicBanner />
      
      {/* 📱 القائمة */}
      <MenuBar 
        user={user}
        currentPage="about"
        onNavigate={onNavigate}
        onEditProfile={onEditProfile}
      />
      
      {/* 📄 المحتوى */}
      <div className="flex-1 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg border border-stone-200 p-8">
          
          {/* 💚 القصة */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">💚</div>
            <h2 className="text-2xl font-semibold text-stone-800 mb-6">من نحن</h2>
          </div>
          
          <div className="space-y-4 text-stone-700 leading-relaxed">
            <p>ذات يوم، مررت بمحنة صعبة...</p>
            
            <p>كل ما كنت أحتاجه هو دعوة صادقة من قلب مؤمن</p>
            
            <p>
              الدعاء غيّر حياتي بإذن الله، وأيقنت أن الله يريدنا أن ندعوه وأن ندعو لبعضنا البعض
            </p>
            
            {/* 📖 الآية */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 my-6">
              <p className="text-center" style={{fontFamily: 'Traditional Arabic, serif'}}>
                ﴿ ادْعُونِي أَسْتَجِبْ لَكُمْ ﴾
              </p>
            </div>
            
            <p>
              الدعاء يغير مسارات القدر بإذن الله، وقد يكون دعاؤك سبب فرج إنسان
            </p>
            
            <p>أتمنى أن تتغير حياة الجميع للأحسن، بإذن الله 🤲</p>
          </div>

          {/* ✉️ نموذج التواصل */}
          <div className="mt-8 pt-8 border-t border-stone-200">
            <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              تواصل معنا
            </h3>
            
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              rows="4"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
            />
            
            <button
              onClick={handleSendMessage}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              إرسال الرسالة إن شاء الله
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}