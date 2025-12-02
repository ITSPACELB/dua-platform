// ============================================================================
// 📚 صفحة المكتبة - منصة يُجيب
// ============================================================================
// تجمع: الكتب الإسلامية + شارات التوثيق
// ============================================================================

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import MenuBar from './shared/MenuBar'
import BooksSection from './BooksSection';
import BadgesSection from './shared/BadgesSection';

export default function LibraryPage({ user, currentPage, onNavigate, onLogout }) {
  // ============================================================================
  // 🎨 حالة التبويبات
  // ============================================================================
  const [activeTab, setActiveTab] = useState('books'); // books | badges

  // ============================================================================
  // 🎨 العرض
  // ============================================================================
  return (
    <div className="min-h-screen bg-stone-50">
      {/* 📱 القائمة */}
      <MenuBar 
        user={user}
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      
      {/* 📄 المحتوى */}
      <div className="max-w-6xl mx-auto p-4">
        
        {/* العنوان الرئيسي */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 mb-6 text-center shadow-xl">
          <div className="flex items-center justify-center gap-4 mb-4">
            <BookOpen size={48} className="text-white" />
            <h1 className="text-4xl font-bold text-white">المكتبة</h1>
          </div>
          <p className="text-white text-xl opacity-90">
            كتب إسلامية مفيدة وشارات التوثيق
          </p>
        </div>

        {/* التبويبات */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 mb-6 overflow-hidden shadow-lg">
          <div className="flex">
            {/* تبويب الكتب */}
            <button
              onClick={() => setActiveTab('books')}
              className={`flex-1 py-5 text-xl font-bold transition-all ${
                activeTab === 'books'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
            >
              📚 الكتب الإسلامية
            </button>

            {/* تبويب الشارات */}
            <button
              onClick={() => setActiveTab('badges')}
              className={`flex-1 py-5 text-xl font-bold transition-all ${
                activeTab === 'badges'
                  ? 'bg-purple-600 text-white'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
            >
              🏆 شارات التوثيق
            </button>
          </div>
        </div>

        {/* المحتوى حسب التبويب */}
        <div className="animate-fade-in">
          {activeTab === 'books' && <BooksSection />}
          {activeTab === 'badges' && <BadgesSection />}
        </div>

        {/* ملاحظة سفلية */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 text-center">
          <p className="text-blue-800 text-lg leading-relaxed">
            💡 <strong>ملاحظة:</strong> المكتبة والشارات يتم تحديثها من قبل الإدارة
          </p>
        </div>
      </div>
    </div>
  );
}