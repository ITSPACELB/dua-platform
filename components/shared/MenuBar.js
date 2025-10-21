// ════════════════════════════════════════════════════════════
// 📱 القائمة الجانبية المحدثة (Header + Menu)
// ════════════════════════════════════════════════════════════
// التحديثات:
// ❌ حذف أيقونة التعديل (Edit2)
// ✅ إضافة "معلوماتك الشخصية" في القائمة
// ════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Menu, Home, User, TrendingUp, Award, Heart, HelpCircle, LogOut } from 'lucide-react';

export default function MenuBar({ user, currentPage, onNavigate, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  // ═══════════════════════════════════════════════════════════
  // 📋 عناصر القائمة المحدثة
  // ═══════════════════════════════════════════════════════════
  const menuItems = [
    { 
      id: 'home', 
      label: '🏠 الرئيسية', 
      icon: Home 
    },
    { 
      id: 'profile', 
      label: '👤 معلوماتك الشخصية', 
      icon: User 
    },
    { 
      id: 'stats', 
      label: '📊 إحصائياتك', 
      icon: TrendingUp 
    },
    { 
      id: 'achievements', 
      label: '🏆 إنجازاتك', 
      icon: Award 
    },
    { 
      id: 'about', 
      label: '📄 من نحن', 
      icon: Heart 
    },
    { 
      id: 'faq', 
      label: '❓ الأسئلة الشائعة', 
      icon: HelpCircle 
    },
  ];

  // ═══════════════════════════════════════════════════════════
  // 🎯 معالجة النقر على عنصر القائمة
  // ═══════════════════════════════════════════════════════════
  const handleMenuClick = (pageId) => {
    onNavigate(pageId);
    setShowMenu(false);
  };

  // ═══════════════════════════════════════════════════════════
  // 🚪 معالجة تسجيل الخروج
  // ═══════════════════════════════════════════════════════════
  const handleLogout = () => {
    setShowMenu(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════ */}
      {/* الهيدر الثابت */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="bg-white border-b-2 border-stone-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            
            {/* زر القائمة */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-stone-600 hover:text-emerald-600 transition-all duration-200 hover:scale-110 p-2 rounded-lg hover:bg-emerald-50"
              aria-label="فتح القائمة"
            >
              <Menu className="w-7 h-7" />
            </button>

            {/* العنوان */}
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-stone-800">
                منصة يُجيب
              </h1>
              <p className="text-sm text-stone-600">
                مرحباً {user?.displayName || 'ضيف'} 🌟
              </p>
            </div>

            {/* مساحة فارغة للتوازن (بدلاً من زر التعديل) */}
            <div className="w-11" />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* القائمة المنسدلة */}
        {/* ═══════════════════════════════════════════════════════ */}
        {showMenu && (
          <>
            {/* خلفية شفافة للإغلاق */}
            <div 
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* القائمة */}
            <div className="absolute top-full left-0 right-0 bg-white border-b-2 border-stone-200 shadow-xl z-50 animate-slide-down">
              <div className="max-w-4xl mx-auto">
                
                {/* عناصر القائمة */}
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      className={`
                        w-full px-6 py-4 text-right 
                        hover:bg-emerald-50 transition-all duration-200
                        border-b border-stone-100 
                        flex items-center gap-4
                        ${currentPage === item.id ? 'bg-emerald-100 border-r-4 border-r-emerald-600' : ''}
                      `}
                    >
                      <Icon className={`w-6 h-6 ${currentPage === item.id ? 'text-emerald-700' : 'text-emerald-600'}`} />
                      <span className={`text-lg font-semibold ${currentPage === item.id ? 'text-emerald-800' : 'text-stone-700'}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}

                {/* زر تسجيل الخروج */}
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-4 text-right hover:bg-red-50 transition-all duration-200 flex items-center gap-4 border-t-2 border-stone-200"
                >
                  <LogOut className="w-6 h-6 text-red-600" />
                  <span className="text-lg font-semibold text-red-700">
                    🚪 تسجيل خروج
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}