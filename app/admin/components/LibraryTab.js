'use client'
import { useState, useEffect } from 'react';

export default function LibraryTab() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    description: '',
    category: 'quran',
    cover_url: '',
    file_url: '',
    pages: 0,
    language: 'ar'
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = () => {
    const token = localStorage.getItem('token');
    
    fetch('/api/admin/library', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBooks(data.books);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Load books error:', err);
        setLoading(false);
      });
  };

  const handleFileUpload = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = localStorage.getItem('token');
    setUploading(true);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        if (type === 'cover') {
          setNewBook({...newBook, cover_url: data.url});
        } else if (type === 'book') {
          setNewBook({...newBook, file_url: data.url});
        }
        alert('✅ تم رفع الملف بنجاح');
      } else {
        alert('❌ ' + (data.error || 'فشل الرفع'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('❌ حدث خطأ أثناء رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const handleAddBook = () => {
    if (!newBook.title.trim() || !newBook.author.trim() || !newBook.file_url) {
      alert('⚠️ يجب إدخال العنوان والمؤلف ورفع ملف الكتاب');
      return;
    }

    const token = localStorage.getItem('token');

    fetch('/api/admin/library', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newBook)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('✅ تم إضافة الكتاب بنجاح');
          setNewBook({
            title: '',
            author: '',
            description: '',
            category: 'quran',
            cover_url: '',
            file_url: '',
            pages: 0,
            language: 'ar'
          });
          setShowAddForm(false);
          loadBooks();
        } else {
          alert('❌ ' + (data.error || 'فشل الإضافة'));
        }
      })
      .catch(err => {
        console.error('Add book error:', err);
        alert('❌ حدث خطأ أثناء الإضافة');
      });
  };

  const handleDeleteBook = (bookId) => {
    if (!confirm('⚠️ هل تريد حذف هذا الكتاب؟')) {
      return;
    }

    const token = localStorage.getItem('token');

    fetch('/api/admin/library', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: bookId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('✅ تم حذف الكتاب');
          loadBooks();
        } else {
          alert('❌ ' + (data.error || 'فشل الحذف'));
        }
      })
      .catch(err => {
        console.error('Delete book error:', err);
        alert('❌ حدث خطأ');
      });
  };

  const categories = {
    quran: { label: 'القرآن الكريم', icon: '📖', color: 'emerald' },
    hadith: { label: 'الحديث الشريف', icon: '📚', color: 'blue' },
    fiqh: { label: 'الفقه', icon: '⚖️', color: 'purple' },
    seerah: { label: 'السيرة النبوية', icon: '🕌', color: 'amber' },
    tafseer: { label: 'التفسير', icon: '📜', color: 'teal' },
    duaa: { label: 'الأدعية', icon: '🤲', color: 'rose' },
    other: { label: 'أخرى', icon: '📕', color: 'stone' }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 animate-pulse">📚</div>
        <p className="text-stone-600">جاري تحميل المكتبة...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          📚 مكتبة الكتب الإسلامية
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all font-semibold shadow-lg flex items-center gap-2"
        >
          <span>{showAddForm ? '✗' : '+'}</span>
          {showAddForm ? 'إلغاء' : 'إضافة كتاب جديد'}
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl shadow-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">📖</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">المكتبة الإسلامية الرقمية</h3>
            <p className="text-teal-100 text-sm mb-3">
              أضف كتباً إسلامية قيّمة ليستفيد منها مستخدمو المنصة
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-sm">
              <p className="mb-2">💡 <strong>أنواع الملفات المدعومة:</strong></p>
              <ul className="space-y-1 text-teal-100">
                <li>• <strong>PDF:</strong> الأفضل للكتب (حجم أقصى: 50 ميجا)</li>
                <li>• <strong>الغلاف:</strong> صورة JPG أو PNG (حجم أقصى: 5 ميجا)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add Book Form */}
      {showAddForm && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
          <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2 text-xl">
            ➕ إضافة كتاب جديد
          </h3>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                📌 عنوان الكتاب: *
              </label>
              <input
                type="text"
                value={newBook.title}
                onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                placeholder="مثال: صحيح البخاري"
                maxLength={200}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                ✍️ المؤلف: *
              </label>
              <input
                type="text"
                value={newBook.author}
                onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                placeholder="مثال: الإمام البخاري"
                maxLength={100}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                📝 الوصف:
              </label>
              <textarea
                value={newBook.description}
                onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                placeholder="وصف مختصر عن الكتاب..."
                rows="3"
                maxLength={500}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none resize-none"
              />
              <p className="text-xs text-stone-500 mt-1">{newBook.description.length}/500 حرف</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  📚 التصنيف:
                </label>
                <select
                  value={newBook.category}
                  onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                >
                  {Object.entries(categories).map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pages */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  📄 عدد الصفحات:
                </label>
                <input
                  type="number"
                  value={newBook.pages}
                  onChange={(e) => setNewBook({...newBook, pages: parseInt(e.target.value) || 0})}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                />
              </div>
            </div>

            {/* Cover Upload */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                🖼️ رفع غلاف الكتاب (اختياري):
              </label>
              <div className="flex gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'cover')}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                />
                {newBook.cover_url && (
                  <img src={newBook.cover_url} alt="Cover" className="w-16 h-20 object-cover rounded border-2 border-teal-500" />
                )}
              </div>
            </div>

            {/* Book File Upload */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                📥 رفع ملف الكتاب (PDF): *
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'book')}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                />
                {newBook.file_url && (
                  <span className="bg-green-100 text-green-700 px-3 py-2 rounded font-semibold text-sm">
                    ✓ تم الرفع
                  </span>
                )}
              </div>
              {uploading && (
                <p className="text-sm text-teal-600 mt-2 flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  جاري رفع الملف...
                </p>
              )}
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddBook}
              disabled={uploading || !newBook.title || !newBook.author || !newBook.file_url}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>➕</span>
              إضافة الكتاب إلى المكتبة
            </button>
          </div>
        </div>
      )}

      {/* Books Grid */}
      <div>
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          📚 الكتب المتاحة ({books.length})
        </h3>

        {books.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-stone-600 text-lg mb-2">المكتبة فارغة</p>
            <p className="text-sm text-stone-500">اضغط على "إضافة كتاب جديد" لرفع أول كتاب</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => {
              const cat = categories[book.category] || categories.other;
              
              return (
                <div key={book.id} className="bg-white border border-stone-200 rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group">
                  {/* Book Cover */}
                  <div className="relative h-64 bg-gradient-to-br from-stone-100 to-stone-200">
                    {book.cover_url ? (
                      <img 
                        src={book.cover_url} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-6xl">{cat.icon}</div>
                      </div>
                    )}
                    <div className={`absolute top-2 left-2 bg-${cat.color}-500 text-white px-3 py-1 rounded-full text-xs font-bold`}>
                      {cat.label}
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="p-4">
                    <h4 className="font-bold text-stone-800 text-lg mb-2 line-clamp-2">
                      {book.title}
                    </h4>
                    <p className="text-sm text-stone-600 mb-3">
                      ✍️ {book.author}
                    </p>
                    {book.description && (
                      <p className="text-xs text-stone-500 mb-3 line-clamp-2">
                        {book.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-stone-600 mb-4">
                      {book.pages > 0 && (
                        <span className="bg-stone-100 px-2 py-1 rounded">
                          📄 {book.pages} صفحة
                        </span>
                      )}
                      <span className="bg-stone-100 px-2 py-1 rounded">
                        👁️ {book.downloads || 0} تحميل
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      
                        href={book.file_url}
                        <a
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-semibold text-center"
                      >
                        📥 تحميل
                      </a>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-r from-stone-50 to-stone-100 border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          📊 إحصائيات المكتبة
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-teal-600">{books.length}</div>
            <div className="text-sm text-stone-600 mt-1">إجمالي الكتب</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-blue-600">
              {new Set(books.map(b => b.category)).size}
            </div>
            <div className="text-sm text-stone-600 mt-1">تصنيف</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-purple-600">
              {books.reduce((sum, b) => sum + (b.downloads || 0), 0)}
            </div>
            <div className="text-sm text-stone-600 mt-1">إجمالي التحميلات</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-amber-600">
              {books.filter(b => b.cover_url).length}
            </div>
            <div className="text-sm text-stone-600 mt-1">كتاب بغلاف</div>
          </div>
        </div>
      </div>
    </div>
  );
}