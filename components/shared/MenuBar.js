// ===============================================
// 📱 القائمة الجانبية (Header + Menu)
// تظهر في أعلى الصفحات الداخلية
// ===============================================

import { useState } from 'react';
import { Menu, Edit2, Users, TrendingUp, Award, Heart, HelpCircle } from 'lucide-react';

export default function MenuBar({ user, currentPage, onNavigate, onEditProfile }) {
  const [showMenu, setShowMenu] = useState(false);

  // 📋 عناصر القائمة
  const menuItems = [
    { id: 'home', label: 'الرئيسية', icon: Users },
    { id: 'stats', label: 'الإحصائيات', icon: TrendingUp },
    { id: 'achievements', label: 'الإنجازات', icon: Award },
    { id: 'about', label: 'من نحن', icon: Heart },
    { id: 'faq', label: 'الأسئلة الشائعة', icon: HelpCircle },
  ];

  const handleMenuClick = (pageId) => {
    onNavigate(pageId);
    setShowMenu(false);
  };

  return (
    <>
      {/* 🎯 الهيدر الثابت */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* زر القائمة */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-stone-600 hover:text-emerald-600 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* العنوان */}
            <div className="text-center">
              <h1 className="text-lg font-semibold text-stone-800">
                منصة الدعاء الجماعي
              </h1>
              <p className="text-xs text-stone-600">
                مرحباً {user?.displayName}
              </p>
            </div>

            {/* زر تعديل الملف الشخصي */}
            <button
              onClick={onEditProfile}
              className="text-stone-600 hover:text-emerald-600 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 📂 القائمة المنسدلة */}
        {showMenu && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-stone-200 shadow-lg">
            <div className="max-w-2xl mx-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full px-4 py-3 text-right hover:bg-stone-50 transition-colors border-b border-stone-100 flex items-center gap-3 ${
                      currentPage === item.id ? 'bg-emerald-50' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 text-emerald-600" />
                    <span className="text-stone-700">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}