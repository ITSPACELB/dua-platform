'use client'
import { useState, useEffect } from 'react';
import { BookOpen, Download, Search, Filter, Star, BookMarked, ExternalLink, Loader } from 'lucide-react';
import BookSubmissionForm from './BookSubmissionForm';

// ════════════════════════════════════════════════════════════
// 📚 مكتبة الكتب - النسخة العالمية الاحترافية
// ════════════════════════════════════════════════════════════

export default function BooksSection() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // التصنيفات
  const categories = [
    { value: 'all', label: 'الكل', icon: '📚' },
    { value: 'دينية - عامة', label: 'دينية - عامة', icon: '🕌' },
    { value: 'دينية - قرآن وتفسير', label: 'قرآن وتفسير', icon: '📖' },
    { value: 'دينية - حديث', label: 'حديث', icon: '📜' },
    { value: 'دينية - فقه', label: 'فقه', icon: '⚖️' },
    { value: 'دينية - عقيدة', label: 'عقيدة', icon: '☪️' },
    { value: 'دينية - سيرة', label: 'سيرة', icon: '🕋' },
    { value: 'دينية - أدعية وأذكار', label: 'أدعية وأذكار', icon: '🤲' },
    { value: 'تربوية', label: 'تربوية', icon: '🎓' },
    { value: 'ثقافية', label: 'ثقافية', icon: '🌍' },
    { value: 'علمية', label: 'علمية', icon: '🔬' },
    { value: 'أدبية', label: 'أدبية', icon: '✍️' },
    { value: 'تاريخية', label: 'تاريخية', icon: '🏛️' }
  ];

  // ════════════════════════════════════════════════════════════
  // 🔄 جلب الكتب
  // ════════════════════════════════════════════════════════════
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();

      if (data.success) {
        setBooks(data.books || []);
        setFilteredBooks(data.books || []);
        setShowLibrary(true);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      setShowLibrary(false);
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // 🔍 البحث والتصفية
  // ════════════════════════════════════════════════════════════
  useEffect(() => {
    let result = books;

    // تصفية حسب التصنيف
    if (selectedCategory !== 'all') {
      result = result.filter(book => book.category === selectedCategory);
    }

    // بحث في العنوان والمؤلف
    if (searchTerm) {
      result = result.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBooks(result);
  }, [searchTerm, selectedCategory, books]);

  // ════════════════════════════════════════════════════════════
  // 📥 تحميل الكتاب
  // ════════════════════════════════════════════════════════════
  const handleDownload = (book) => {
    if (book.file_url) {
      window.open(book.file_url, '_blank');
    } else {
      alert('رابط التحميل غير متوفر');
    }
  };

  // ════════════════════════════════════════════════════════════
  // 🎨 عدم العرض إذا مخفي
  // ════════════════════════════════════════════════════════════
  if (!showLibrary) {
    return null;
  }

  // ════════════════════════════════════════════════════════════
  // ⏳ حالة التحميل
  // ════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-8 text-center">
          <h2 className="text-white font-bold text-4xl flex items-center justify-center gap-3">
            <BookOpen className="w-10 h-10" />
            مكتبة الكتب
          </h2>
        </div>
        <div className="p-20 text-center">
          <Loader className="w-16 h-16 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 text-xl font-semibold">جاري تحميل المكتبة...</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // 🎨 الواجهة الرئيسية
  // ════════════════════════════════════════════════════════════
  return (
    <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden shadow-2xl">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-right">
            <h2 className="font-bold text-3xl md:text-4xl flex items-center justify-center md:justify-start gap-3 mb-2">
              <BookOpen className="w-10 h-10" />
              مكتبة الكتب
            </h2>
            <p className="text-white/90 text-sm md:text-base">
              مجموعة مختارة من الكتب الإسلامية والثقافية
            </p>
          </div>
          
          {/* زر اقتراح كتاب */}
          <button
            onClick={() => setShowSubmissionForm(true)}
            className="bg-white hover:bg-gray-100 text-green-700 font-bold py-3 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <BookMarked className="w-5 h-5" />
            اقترح كتاباً للنشر
          </button>
        </div>
      </div>

      {/* البحث والتصفية */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-green-50 border-b-2 border-gray-200">
        <div className="max-w-6xl mx-auto space-y-4">
          
          {/* شريط البحث */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن كتاب أو مؤلف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
            />
          </div>

          {/* التصنيفات */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500'
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* عدد النتائج */}
          <div className="text-center text-gray-600">
            <span className="font-bold text-green-700 text-lg">{filteredBooks.length}</span> كتاب متاح
          </div>
        </div>
      </div>

      {/* قائمة الكتب */}
      <div className="p-6 md:p-8">
        {filteredBooks.length === 0 ? (
          // لا توجد نتائج
          <div className="text-center py-20">
            <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl font-bold mb-2">
              {searchTerm || selectedCategory !== 'all' 
                ? 'لا توجد نتائج للبحث' 
                : 'لا توجد كتب حالياً'}
            </p>
            <p className="text-gray-400">
              {searchTerm || selectedCategory !== 'all'
                ? 'جرب كلمات بحث أخرى أو اختر تصنيف مختلف'
                : 'تحقق لاحقاً من الكتب الجديدة'}
            </p>
          </div>
        ) : (
          // عرض الكتب
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} onDownload={handleDownload} />
            ))}
          </div>
        )}
      </div>

      {/* Modal نموذج الطلب */}
      {showSubmissionForm && (
        <BookSubmissionForm
          onClose={() => setShowSubmissionForm(false)}
          onSuccess={() => {
            setShowSubmissionForm(false);
            // يمكن إضافة رسالة نجاح هنا
          }}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 📖 بطاقة الكتاب - Component منفصل
// ════════════════════════════════════════════════════════════
function BookCard({ book, onDownload }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group hover:border-green-400 flex flex-col">
      
      {/* صورة الغلاف */}
      <div className="relative h-64 bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 overflow-hidden">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-24 h-24 text-green-600 opacity-50" />
          </div>
        )}
        
        {/* Badge التصنيف */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-green-700 shadow-lg">
          {book.category}
        </div>

        {/* Badge اللغة */}
        {book.language && book.language !== 'ar' && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            {book.language === 'en' ? '🇬🇧 EN' : book.language === 'fr' ? '🇫🇷 FR' : book.language.toUpperCase()}
          </div>
        )}
      </div>

      {/* محتوى البطاقة */}
      <div className="p-5 flex-1 flex flex-col">
        
        {/* العنوان */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors min-h-[3.5rem]">
          {book.title}
        </h3>

        {/* المؤلف */}
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <span className="text-sm">✍️</span>
          <p className="text-sm font-medium line-clamp-1">{book.author}</p>
        </div>

        {/* الوصف */}
        {book.description && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-1">
            {book.description}
          </p>
        )}

        {/* معلومات إضافية */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200">
          {book.pages && (
            <span className="flex items-center gap-1">
              📄 {book.pages} صفحة
            </span>
          )}
          {book.size_mb && (
            <span className="flex items-center gap-1">
              💾 {book.size_mb} MB
            </span>
          )}
        </div>

        {/* زر التحميل */}
        <button
          onClick={() => onDownload(book)}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          تحميل الكتاب
        </button>
      </div>
    </div>
  );
}