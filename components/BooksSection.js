'use client'
import { useState, useEffect } from 'react';

/**
 * قسم مكتبة الكتب الإسلامية
 * يعرض الكتب المتاحة للتحميل
 * يتحكم به الأدمن من لوحة التحكم
 */
export default function BooksSection() {
  // ============================================================================
  // 📊 حالة المكتبة
  // ============================================================================
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);

  // ============================================================================
  // 🔄 useEffect: جلب إعدادات المكتبة والكتب
  // ============================================================================
  useEffect(() => {
    fetchLibrarySettings();
  }, []);

  // ============================================================================
  // 🌐 جلب إعدادات المكتبة من الأدمن
  // ============================================================================
  const fetchLibrarySettings = async () => {
    try {
      const response = await fetch('/api/admin/library/settings');
      const data = await response.json();

      if (data.success && data.showLibrary) {
        setShowLibrary(true);
        fetchBooks();
      } else {
        setShowLibrary(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching library settings:', error);
      setShowLibrary(false);
      setLoading(false);
    }
  };

  // ============================================================================
  // 📚 جلب قائمة الكتب
  // ============================================================================
  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();

      if (data.success) {
        setBooks(data.books || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      setLoading(false);
    }
  };

  // ============================================================================
  // 📥 معالجة تحميل الكتاب
  // ============================================================================
  const handleDownload = (book) => {
    if (book.downloadUrl) {
      window.open(book.downloadUrl, '_blank');
    } else {
      alert('رابط التحميل غير متوفر');
    }
  };

  // ============================================================================
  // 🎨 عدم عرض القسم إذا كان مخفياً من الأدمن
  // ============================================================================
  if (!showLibrary) {
    return null;
  }

  // ============================================================================
  // 🎨 حالة التحميل
  // ============================================================================
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-center border-b-4 border-emerald-800">
          <h2 className="text-white font-bold text-3xl">
            📖 مكتبة الكتب الإسلامية
          </h2>
        </div>
        <div className="p-16 text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-stone-600 text-2xl font-semibold">جاري تحميل المكتبة...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 🎨 حالة فارغة - لا توجد كتب
  // ============================================================================
  if (books.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-center border-b-4 border-emerald-800">
          <h2 className="text-white font-bold text-3xl">
            📖 مكتبة الكتب الإسلامية
          </h2>
        </div>
        <div className="p-16 text-center">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-stone-500 text-2xl font-bold">
            لا توجد كتب متاحة حالياً
          </p>
          <p className="text-stone-400 text-xl mt-3">
            سيتم إضافة الكتب قريباً إن شاء الله
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 🎨 واجهة عرض الكتب
  // ============================================================================
  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden shadow-lg">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-center border-b-4 border-emerald-800">
        <h2 className="text-white font-bold text-3xl mb-2">
          📖 مكتبة الكتب الإسلامية
        </h2>
        <p className="text-white text-xl opacity-90">
          اقرأ وحمّل الكتب المفيدة مجاناً
        </p>
      </div>

      {/* Books Grid */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white border-2 border-stone-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              {/* Book Cover */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 text-center border-b-2 border-stone-200">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div
                  className="text-8xl"
                  style={{ display: book.coverUrl ? 'none' : 'block' }}
                >
                  📚
                </div>
              </div>

              {/* Book Details */}
              <div className="p-6">
                {/* Title */}
                <h3 className="text-stone-800 font-bold text-xl mb-2 leading-tight">
                  {book.title}
                </h3>

                {/* Author */}
                <p className="text-stone-600 text-lg mb-3">
                  ✍️ {book.author}
                </p>

                {/* Description */}
                {book.description && (
                  <p className="text-stone-600 text-base leading-relaxed mb-4">
                    {book.description.length > 100
                      ? `${book.description.substring(0, 100)}...`
                      : book.description}
                  </p>
                )}

                {/* File Size */}
                {book.fileSize && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-stone-500 text-base">
                      📦 حجم الملف: {book.fileSize}
                    </span>
                  </div>
                )}

                {/* Download Button */}
                <button
                  onClick={() => handleDownload(book)}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                >
                  📥 تحميل الكتاب
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-emerald-50 border-t-2 border-emerald-200 p-6 text-center">
        <p className="text-stone-700 text-lg">
          💡 جميع الكتب مجانية للقراءة والتحميل
        </p>
      </div>
    </div>
  );
}