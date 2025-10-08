// ===============================================
// 🏡 الصفحة الرئيسية (Home Page)
// عرض طلبات الدعاء + إرسال طلب جديد
// ===============================================

import { useState } from 'react';
import { Share2, Send, X } from 'lucide-react';
import IslamicBanner from '../shared/IslamicBanner';
import MenuBar from '../shared/MenuBar';
import { encouragingMessages, blessingsExample, TOTAL_USERS } from '../constants/messages';

export default function HomePage({ user, onNavigate, onEditProfile }) {
  // 🎲 رسالة تشجيعية عشوائية
  const [randomMessage] = useState(
    encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
  );

  // 📋 طلبات الدعاء (بيانات وهمية)
  const [requests] = useState([
    {
      id: 1,
      userName: 'أحمد بن سارة',
      type: 'need',
      timestamp: new Date(Date.now() - 5 * 60000),
      prayerCount: 12,
      prayed: false
    },
    {
      id: 2,
      userName: 'ماريا بنت كاثرين',
      type: 'need',
      timestamp: new Date(Date.now() - 15 * 60000),
      prayerCount: 8,
      prayed: false
    },
    {
      id: 3,
      deceasedName: 'يوسف بن مريم',
      relation: 'أب',
      type: 'deceased',
      timestamp: new Date(Date.now() - 20 * 60000),
      prayerCount: 15,
      prayed: false
    }
  ]);

  // 🕐 حساب الوقت
  const getTimeAgo = (timestamp) => {
    const mins = Math.floor((Date.now() - timestamp) / 60000);
    if (mins < 1) return 'الآن';
    if (mins === 1) return 'منذ دقيقة';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours === 1) return 'منذ ساعة';
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  // 🕊️ نموذج الدعاء للمتوفى
  const [showDeceasedForm, setShowDeceasedForm] = useState(false);
  const [deceasedForm, setDeceasedForm] = useState({
    fullName: '',
    motherName: '',
    relation: ''
  });

  const handleDeceasedPrayer = () => {
    if (!deceasedForm.fullName || !deceasedForm.motherName) {
      alert('الرجاء إدخال الاسم الكامل واسم الأم للمتوفى');
      return;
    }
    // TODO: ربط بـ API
    alert('تم إرسال طلب الدعاء للمتوفى إن شاء الله');
    setShowDeceasedForm(false);
    setDeceasedForm({ fullName: '', motherName: '', relation: '' });
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* 🕌 البانر */}
      <IslamicBanner />
      
      {/* 📱 القائمة */}
      <MenuBar 
        user={user}
        currentPage="home"
        onNavigate={onNavigate}
        onEditProfile={onEditProfile}
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        
        {/* 👥 عداد المستخدمين */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4 text-center">
          <p className="text-emerald-700 font-semibold text-lg">
            🌍 انضم إلى {TOTAL_USERS.toLocaleString()} مؤمن
          </p>
          <p className="text-emerald-600 text-sm">من حول العالم</p>
        </div>

        {/* 💬 رسالة تشجيعية */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line text-center">
            {randomMessage}
          </p>
        </div>

        {/* 🚀 أزرار الطلب */}
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => alert('سيتم ربطه بـ API لاحقاً')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-lg transition-colors"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🤲</div>
              <h3 className="text-lg font-semibold mb-2">احتاج دعاءكم</h3>
              <p className="text-sm opacity-90">
                احتفظ بحاجتك في قلبك ودع المؤمنين يشاركونك الدعاء
              </p>
            </div>
          </button>

          <button
            onClick={() => setShowDeceasedForm(true)}
            className="bg-stone-600 hover:bg-stone-700 text-white p-6 rounded-lg transition-colors"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🕊️</div>
              <h3 className="text-lg font-semibold mb-2">ادعوا لمتوفٍ عزيز</h3>
              <p className="text-sm opacity-90">
                ادعُ لروح من فارقنا واطلب من المؤمنين الدعاء له
              </p>
            </div>
          </button>
        </div>

        {/* 🕊️ نموذج المتوفى */}
        {showDeceasedForm && (
          <div className="bg-white p-6 rounded-lg border border-stone-200">
            <h3 className="text-lg font-semibold text-stone-800 mb-4 text-center">
              الدعاء لمن فارقنا
            </h3>
            
            <div className="space-y-4">
              <input
                type="text"
                value={deceasedForm.fullName}
                onChange={(e) => setDeceasedForm({...deceasedForm, fullName: e.target.value})}
                placeholder="الاسم الكامل للمتوفى"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              
              <input
                type="text"
                value={deceasedForm.motherName}
                onChange={(e) => setDeceasedForm({...deceasedForm, motherName: e.target.value})}
                placeholder="اسم والدة المتوفى"
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              
              <div>
                <label className="block text-stone-700 font-medium mb-2 text-sm">
                  صلة القرابة (اختياري)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['أب', 'أم', 'أخ', 'أخت', 'صديق', 'قريب'].map(rel => (
                    <button
                      key={rel}
                      onClick={() => setDeceasedForm({...deceasedForm, relation: rel})}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        deceasedForm.relation === rel
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleDeceasedPrayer}
                  className="flex-1 bg-stone-600 hover:bg-stone-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  إرسال طلب الدعاء
                </button>
                <button
                  onClick={() => setShowDeceasedForm(false)}
                  className="px-6 bg-stone-200 hover:bg-stone-300 text-stone-700 py-2.5 rounded-lg font-medium transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 📊 إحصائية شخصية */}
        <div className="bg-white p-5 rounded-lg border border-stone-200 text-center">
          <p className="text-stone-600 text-sm mb-1">دعا لك اليوم</p>
          <p className="text-3xl font-semibold text-emerald-600">24</p>
          <p className="text-stone-500 text-sm">مؤمن</p>
        </div>

        {/* 🤲 من يطلب دعاءنا */}
        <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
          <div className="bg-emerald-600 p-4 border-b border-emerald-700">
            <h3 className="text-white font-semibold text-center">
              من يطلب دعاءنا الآن
            </h3>
          </div>
          
          <div className="divide-y divide-stone-100">
            {requests.map(request => (
              <div key={request.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{request.type === 'deceased' ? '🕊️' : '🤲'}</span>
                      <h4 className="font-semibold text-stone-800">
                        {request.type === 'deceased' 
                          ? `${request.deceasedName}${request.relation ? ` (${request.relation})` : ''}`
                          : request.userName
                        }
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone-600 mb-2">
                      <span>{getTimeAgo(request.timestamp)}</span>
                      <span>•</span>
                      <span>دعا له {request.prayerCount}</span>
                    </div>
                  </div>
                </div>
                
                {!request.prayed && (
                  <button
                    onClick={() => alert('سيتم ربطه بـ API الدعاء')}
                    className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                      request.type === 'deceased'
                        ? 'bg-stone-600 hover:bg-stone-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    خذ لحظة وادعُ {request.type === 'deceased' ? 'له' : `لـ ${request.userName.split(' ')[0]}`} 🤲
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 🎉 بشائر اليوم */}
        <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
          <div className="bg-amber-500 p-4 border-b border-amber-600">
            <h3 className="text-white font-semibold text-center">بشائر اليوم</h3>
          </div>
          
          <div className="p-5 space-y-3">
            {blessingsExample.map((blessing, idx) => (
              <div key={idx} className="flex items-center justify-between bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <div>
                  <p className="font-semibold text-stone-800">✓ {blessing.name}</p>
                  <p className="text-sm text-stone-600">تيسرت حاجته إن شاء الله</p>
                </div>
                <p className="text-sm text-stone-600">دعا له {blessing.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 📤 زر المشاركة */}
        <button className="w-full bg-sky-600 hover:bg-sky-700 text-white p-5 rounded-lg transition-colors flex items-center justify-center gap-3">
          <Share2 className="w-5 h-5" />
          <div className="text-center">
            <p className="font-semibold">شارك الموقع</p>
            <p className="text-sm opacity-90">كل مؤمن جديد يعني دعوات أكثر إن شاء الله</p>
          </div>
        </button>

        {/* 👤 Footer */}
        <div className="text-center text-sm text-stone-600 py-6 border-t border-stone-200">
          <p className="mb-2">منصة الدعاء الجماعي © 2025</p>
          <p>فكرة وتطوير: <span className="text-emerald-600 font-semibold">الغافقي 🌿</span></p>
        </div>
      </div>
    </div>
  );
}