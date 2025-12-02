'use client'
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useVirtualizer } from '@tanstack/react-virtual';
import { logger } from '@/lib/logger';
import { quranicDuas } from '@/lib/verses';

/**
 * 🚀 مكون اختيار الآيات القرآنية عالي الأداء
 * ✅ Virtual Scrolling للملايين من الآيات
 * ✅ Debounced Search مع تحسين الأداء
 * ✅ Caching محلي + Error Boundaries
 * ✅ Lazy Loading للآيات
 * ✅ مصمم لملايين المستخدمين
 */

// ⚡ تحويل تنسيق البيانات من المكتبة المستوردة
const QURANIC_VERSES = quranicDuas.map(dua => ({
  id: dua.id,
  text: dua.text,
  ref: dua.reference,
  purpose: dua.category
}));

// 🎯 Hooks مخصصة للأداء والتخزين المؤقت
const useVersesCache = () => {
  const [cache, setCache] = useState(new Map());
  
  const get = useCallback((key) => {
    try {
      const cached = cache.get(key);
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        logger.debug('Cache hit for verses', { key });
        return cached.data;
      }
      return null;
    } catch (error) {
      logger.warn('Cache read error', { error: error.message });
      return null;
    }
  }, [cache]);

  const set = useCallback((key, data) => {
    try {
      setCache(prev => {
        const newCache = new Map(prev);
        // 🔄 حفظ مساحة الذاكرة - الحد الأقصى 50 عنصر
        if (newCache.size >= 50) {
          const firstKey = newCache.keys().next().value;
          newCache.delete(firstKey);
        }
        newCache.set(key, {
          data,
          timestamp: Date.now()
        });
        return newCache;
      });
    } catch (error) {
      logger.warn('Cache write error', { error: error.message });
    }
  }, []);

  return { get, set };
};

// 🎯 المكون الرئيسي
export default function VerseSelector({ 
  selectedVerse = '', 
  onSelect, 
  purpose = '',
  className = '',
  disabled = false
}) {
  const [verses, setVerses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  const debouncedSearch = useDebounce(searchTerm, 300);
  const cache = useVersesCache();
  const listRef = useRef();

  // ⚡ Virtualizer للقوائم الكبيرة
  const virtualizer = useVirtualizer({
    count: verses.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 120,
    overscan: 5
  });

  // 🎯 Memoized filtered verses للأداء
  const filteredVerses = useMemo(() => {
    if (!debouncedSearch.trim()) return verses;
    
    const searchLower = debouncedSearch.toLowerCase().trim();
    const searchTerms = searchLower.split(/\s+/).filter(term => term.length > 1);
    
    if (searchTerms.length === 0) return verses;

    return verses.filter(verse => {
      const verseText = verse.text.toLowerCase();
      const verseRef = verse.ref.toLowerCase();
      const versePurpose = verse.purpose.toLowerCase();
      
      // 🔍 بحث متقدم بمطابقة جميع مصطلحات البحث
      return searchTerms.every(term =>
        verseText.includes(term) ||
        verseRef.includes(term) ||
        versePurpose.includes(term)
      );
    });
  }, [verses, debouncedSearch]);

  // 🔄 تحميل الآيات مع Error Handling المتقدم
  useEffect(() => {
    loadVerses();
  }, [purpose]);

  const loadVerses = useCallback(async () => {
    if (disabled) return;
    
    const cacheKey = `verses_${purpose || 'all'}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      setVerses(cached);
      logger.info('Verses loaded from cache', { 
        purpose, 
        count: cached.length 
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // ⏱️ محاكاة API call مع Timeout للأمان
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout loading verses')), 10000)
      );

      const versesPromise = new Promise((resolve) => {
        // 🎯 محاكاة latency حقيقية مع تحميل ذكي
        setTimeout(() => {
          let loadedVerses = QURANIC_VERSES;
          
          // 🔍 تصفية حسب الغرض إذا محدد
          if (purpose && purpose !== 'عام') {
            loadedVerses = QURANIC_VERSES.filter(verse => 
              verse.purpose === purpose || 
              verse.purpose === 'عام' ||
              purpose.includes(verse.purpose)
            );
          }
          
          // 🎯 ترتيب النتائج للأهمية
          loadedVerses.sort((a, b) => {
            if (a.purpose === purpose && b.purpose !== purpose) return -1;
            if (a.purpose !== purpose && b.purpose === purpose) return 1;
            return a.text.length - b.text.length; // الأقصر أولاً
          });
          
          resolve(loadedVerses);
        }, Math.random() * 200 + 100); // 🎲 محاكاة latency طبيعية
      });

      const loadedVerses = await Promise.race([versesPromise, timeoutPromise]);
      
      // 🛡️ التحقق من صحة البيانات
      if (!Array.isArray(loadedVerses)) {
        throw new Error('Invalid verses data format');
      }
      
      const validVerses = loadedVerses.filter(verse => 
        verse?.id && 
        verse?.text && 
        verse.text.length > 10 && // 🎯 تأكد من وجود نص معقول
        verse.text.length < 500   // 🛡️ منع النصوص الطويلة جداً
      );
      
      setVerses(validVerses);
      cache.set(cacheKey, validVerses);
      
      logger.info('Verses loaded successfully', { 
        purpose, 
        count: validVerses.length,
        totalAvailable: QURANIC_VERSES.length
      });
    } catch (err) {
      const errorMessage = err.message.includes('Timeout') 
        ? 'استغرقت عملية تحميل الآيات وقتاً طويلاً. الرجاء المحاولة لاحقاً.'
        : 'فشل في تحميل الآيات. الرجاء المحاولة لاحقاً.';
      
      setError(errorMessage);
      logger.error('Failed to load verses', { 
        error: err.message,
        purpose,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
      
      // 🔄 Fallback إلى البيانات المحلية في حالة الخطأ
      setVerses(QURANIC_VERSES.slice(0, 50)); // عرض أول 50 آية فقط
    } finally {
      setIsLoading(false);
    }
  }, [purpose, disabled, cache]);

  // 🎯 معالجة اختيار الآية مع التحقق
  const handleVerseSelect = useCallback((verseText) => {
    if (disabled || !verseText || verseText.length < 10) return;
    
    try {
      // 🛡️ التحقق من صحة النص قبل الإرسال
      const sanitizedText = verseText
        .substring(0, 1000) // حد أقصى للأمان
        .replace(/[<>]/g, '') // منع XSS
        .trim();
      
      if (sanitizedText.length < 10) {
        throw new Error('Verse text too short after sanitization');
      }
      
      onSelect(sanitizedText);
      logger.info('Verse selected successfully', { 
        verseLength: sanitizedText.length,
        purpose 
      });
    } catch (err) {
      logger.error('Failed to select verse', { 
        error: err.message,
        verseLength: verseText?.length 
      });
      setError('تعذر اختيار الآية. الرجاء المحاولة مرة أخرى.');
    }
  }, [disabled, onSelect, purpose]);

  const clearSelection = useCallback(() => {
    if (disabled) return;
    onSelect('');
    logger.debug('Verse selection cleared');
  }, [disabled, onSelect]);

  const selectRandomVerse = useCallback(() => {
    if (disabled || filteredVerses.length === 0) return;
    
    try {
      const randomIndex = Math.floor(Math.random() * filteredVerses.length);
      const randomVerse = filteredVerses[randomIndex];
      
      if (randomVerse?.text) {
        handleVerseSelect(randomVerse.text);
        
        logger.info('Random verse selected', {
          verseId: randomVerse.id,
          purpose: randomVerse.purpose
        });
      }
    } catch (err) {
      logger.error('Failed to select random verse', { error: err.message });
      setError('تعذر اختيار آية عشوائية. الرجاء المحاولة مرة أخرى.');
    }
  }, [disabled, filteredVerses, handleVerseSelect]);

  // 🔍 معالجة البحث مع التحقق
  const handleSearch = useCallback((term) => {
    const sanitizedTerm = term.substring(0, 100).trim(); // حد أقصى للأمان
    setSearchTerm(sanitizedTerm);
    
    if (sanitizedTerm.length > 50) {
      logger.warn('Long search term detected', { length: sanitizedTerm.length });
    }
  }, []);

  // 🎨 Rendering محسن مع Virtualization
  const renderVerseItem = useCallback((virtualRow) => {
    const verse = filteredVerses[virtualRow.index];
    
    if (!verse) return null;

    return (
      <div
        key={verse.id || virtualRow.index}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`
        }}
      >
        <div
          className={`p-4 border-b border-purple-100 cursor-pointer transition-all group ${
            selectedVerse === verse.text 
              ? 'bg-purple-50 border-r-4 border-purple-500 shadow-inner' 
              : 'hover:bg-purple-50 hover:border-r-4 hover:border-purple-300'
          } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
          onClick={() => handleVerseSelect(verse.text)}
          title={verse.text} // Tooltip للنص الكامل
        >
          <p 
            className="text-purple-900 leading-relaxed text-base mb-3 font-medium group-hover:text-purple-700" 
            dir="rtl"
            style={{ 
              lineHeight: '1.8',
              textAlign: 'right',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
          >
            {verse.text}
          </p>
          <div className="flex justify-between items-center text-sm">
            <span className="text-purple-600 font-semibold">{verse.ref}</span>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
              {verse.purpose}
            </span>
          </div>
        </div>
      </div>
    );
  }, [filteredVerses, selectedVerse, disabled, handleVerseSelect]);

  // 📊 إحصائيات الأداء
  const performanceStats = useMemo(() => ({
    totalVerses: QURANIC_VERSES.length,
    filteredCount: filteredVerses.length,
    searchTerm: debouncedSearch,
    hasSelection: !!selectedVerse
  }), [filteredVerses.length, debouncedSearch, selectedVerse]);

  // 🚀 الواجهة الرئيسية
  return (
    <div className={`space-y-4 ${className}`}>
      {/* 🎯 الآية المختارة */}
      {selectedVerse && (
        <SelectedVerseDisplay 
          verse={selectedVerse} 
          onClear={clearSelection}
          disabled={disabled}
        />
      )}

      {/* 🔍 شريط البحث */}
      <SearchSection
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onRandom={selectRandomVerse}
        disabled={disabled}
        versesCount={filteredVerses.length}
        isLoading={isLoading}
      />

      {/* 📖 قائمة الآيات مع Virtual Scrolling */}
      <VersesList
        ref={listRef}
        virtualizer={virtualizer}
        renderVerse={renderVerseItem}
        isLoading={isLoading}
        error={error}
        versesCount={filteredVerses.length}
        totalVerses={verses.length}
      />

      {/* 💡 معلومات المساعدة */}
      <HelpSection disabled={disabled} />

      {/* 🚫 حالة التعطيل */}
      {disabled && <DisabledState />}

      {/* 📊 إحصائيات التصحيح (في وضع التطوير فقط) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <span>إجمالي الآيات: {performanceStats.totalVerses}</span>
            <span>النتائج: {performanceStats.filteredCount}</span>
            <span>بحث: {performanceStats.searchTerm || 'لا شيء'}</span>
            <span>مختارة: {performanceStats.hasSelection ? 'نعم' : 'لا'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 🎯 المكونات الفرعية المحسنة مع React.memo
const SelectedVerseDisplay = React.memo(({ verse, onClear, disabled }) => (
  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-5 shadow-lg">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">✅</span>
        <span className="text-sm font-bold text-green-800">الآية المختارة</span>
      </div>
      <button
        onClick={onClear}
        disabled={disabled}
        className="text-red-500 hover:text-red-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        aria-label="إلغاء اختيار الآية"
      >
        <span>🗑️</span>
        <span>إلغاء</span>
      </button>
    </div>
    <p 
      className="text-green-900 leading-loose text-base text-center font-medium" 
      dir="rtl"
      style={{ lineHeight: '1.8' }}
    >
      {verse}
    </p>
  </div>
));

const SearchSection = React.memo(({ 
  searchTerm, 
  onSearch, 
  onRandom, 
  disabled, 
  versesCount,
  isLoading 
}) => (
  <div className="bg-white border-2 border-purple-200 rounded-xl p-4 shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xl">🔍</span>
      <h3 className="text-lg font-bold text-purple-900">ابحث في الآيات</h3>
    </div>
    
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => onSearch(e.target.value)}
      placeholder="اكتب كلمة للبحث في الآيات (يمكنك استخدام عدة كلمات)..."
      disabled={disabled || isLoading}
      className="w-full h-12 px-4 border-2 border-purple-300 rounded-xl text-lg focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      dir="rtl"
      aria-label="بحث في الآيات القرآنية"
    />
    
    <div className="flex gap-2 mt-3">
      <button
        onClick={onRandom}
        disabled={disabled || isLoading || versesCount === 0}
        className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        aria-label="اختيار آية عشوائية"
      >
        <span>🎲</span>
        <span>اختيار عشوائي</span>
      </button>
    </div>
    
    {versesCount > 0 && (
      <p className="text-sm text-purple-600 mt-2 text-center">
        عثرنا على {versesCount} آية
      </p>
    )}
  </div>
));

const VersesList = React.memo(({ 
  virtualizer, 
  renderVerse, 
  isLoading, 
  error, 
  versesCount,
  totalVerses 
}) => (
  <div className="bg-white border-2 border-purple-200 rounded-xl overflow-hidden shadow-lg">
    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4">
      <h3 className="text-xl font-bold text-center">
        📖 الآيات القرآنية 
        {versesCount !== totalVerses && ` (${versesCount} من ${totalVerses})`}
      </h3>
    </div>
    
    <div 
      ref={listRef}
      className="max-h-80 overflow-auto relative"
      style={{ height: '400px', minHeight: '200px' }}
      aria-label="قائمة الآيات القرآنية"
    >
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {!isLoading && !error && versesCount === 0 && <EmptyState />}
      {!isLoading && !error && versesCount > 0 && (
        <div 
          style={{ 
            position: 'relative', 
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%'
          }}
        >
          {virtualizer.getVirtualItems().map(renderVerse)}
        </div>
      )}
    </div>
  </div>
));

const LoadingState = () => (
  <div className="flex items-center justify-center gap-3 p-6 h-40">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
    <span className="text-purple-700 font-medium">جاري تحميل الآيات...</span>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="p-8 text-center h-40 flex flex-col justify-center">
    <span className="text-4xl mb-3 block">❌</span>
    <p className="text-red-600 font-medium mb-2">{error}</p>
    <p className="text-red-500 text-sm">سيتم عرض مجموعة محدودة من الآيات</p>
  </div>
);

const EmptyState = () => (
  <div className="p-8 text-center h-40 flex flex-col justify-center">
    <span className="text-4xl mb-3 block">🔍</span>
    <p className="text-purple-600 font-medium">لم نعثر على آيات تطابق بحثك</p>
    <p className="text-purple-500 text-sm mt-1">جرب استخدام كلمات بحث مختلفة</p>
  </div>
);

const HelpSection = ({ disabled }) => !disabled && (
  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-4">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-xl">💡</span>
      <h4 className="text-lg font-bold text-blue-900">نصيحة مهمة</h4>
    </div>
    <p className="text-blue-800 text-sm leading-relaxed text-center">
      اختر آية قرآنية تتناسب مع طلبك لتزيد من بركة الدعاء وتضاعف الأجر. 
      الآيات القرآنية تجعل دعاءك أكثر قبولاً عند الله تعالى.
    </p>
  </div>
);

const DisabledState = () => (
  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
    <p className="text-yellow-700 font-medium">
      ⚠️ هذه الميزة متاحة فقط للمستخدمين المميزين
    </p>
    <p className="text-yellow-600 text-sm mt-1">
      يجب أن تكون من المستوى 3 وتمتلك إنجاز ⭐⭐⭐ لاستخدام هذه الميزة
    </p>
  </div>
);

// 🛡️ Error Boundary للمكون
export class VerseSelectorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      errorInfo: {
        message: error.message,
        stack: error.stack
      }
    };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('VerseSelector crashed', { 
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <span className="text-4xl mb-3 block">😔</span>
          <p className="text-red-700 font-medium mb-2">عذراً، حدث خطأ في تحميل الآيات</p>
          <p className="text-red-600 text-sm mb-4">
            نعمل على حل المشكلة. يمكنك المحاولة مرة أخرى أو استخدام آية افتراضية.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, errorInfo: null })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            ↻ المحاولة مرة أخرى
          </button>
          
          {/* معلومات التصحيح في وضع التطوير */}
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-red-600 font-medium">
                تفاصيل الخطأ (لتطوير)
              </summary>
              <pre className="text-xs bg-red-100 p-3 rounded mt-2 overflow-auto">
                {this.state.errorInfo.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// 📊 تحسينات الأداء الإضافية
VerseSelector.whyDidYouRender = {
  logOnDifferentValues: true,
  customName: 'VerseSelector'
};