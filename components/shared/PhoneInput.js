'use client'
import { useState, useRef, useEffect } from 'react';
import { countries, getDefaultCountry } from '@/lib/countries';

// ════════════════════════════════════════════════════════════
// 📱 مكون إدخال رقم الهاتف الدولي الاحترافي
// ════════════════════════════════════════════════════════════
// الميزات:
// - قائمة منسدلة للدول مع الأعلام
// - عرض كود الاتصال تلقائياً
// - تصميم احترافي متناسق مع المنصة
// - دعم RTL للعربية و LTR لأرقام الهاتف
// - ارتفاع 56px وخط 18px حسب المتطلبات
// ════════════════════════════════════════════════════════════

export default function PhoneInput({ 
  value = '', 
  onChange, 
  disabled = false,
  className = ''
}) {
  // ═══════════════════════════════════════════════════════════
  // 🔧 الحالة والمراجع
  // ═══════════════════════════════════════════════════════════
  const [selectedCountry, setSelectedCountry] = useState(getDefaultCountry());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // ═══════════════════════════════════════════════════════════
  // 🎯 تهيئة القيمة الأولية
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (value) {
      // فصل كود الدولة عن الرقم
      const matchedCountry = countries.find(c => value.startsWith(c.dialCode));
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        setPhoneNumber(value.replace(matchedCountry.dialCode, '').trim());
      } else {
        setPhoneNumber(value);
      }
    }
  }, []);

  // ═══════════════════════════════════════════════════════════
  // 🔒 إغلاق القائمة عند الضغط خارجها
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // 📞 معالجة تغيير رقم الهاتف
  // ═══════════════════════════════════════════════════════════
  const handlePhoneChange = (e) => {
    let input = e.target.value;
    
    // إزالة كل شيء ما عدا الأرقام والمسافات
    input = input.replace(/[^\d\s]/g, '');
    
    // تنسيق الرقم تلقائياً (إضافة مسافات)
    input = input.replace(/\s+/g, '').replace(/(\d{2})(?=\d)/g, '$1 ').trim();
    
    setPhoneNumber(input);
    
    // إرجاع الرقم الكامل مع كود الدولة
    const fullNumber = `${selectedCountry.dialCode} ${input}`.trim();
    onChange(fullNumber);
  };

  // ═══════════════════════════════════════════════════════════
  // 🌍 معالجة اختيار دولة
  // ═══════════════════════════════════════════════════════════
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchQuery('');
    
    // تحديث الرقم الكامل
    const fullNumber = `${country.dialCode} ${phoneNumber}`.trim();
    onChange(fullNumber);
  };

  // ═══════════════════════════════════════════════════════════
  // 🔍 تصفية الدول حسب البحث
  // ═══════════════════════════════════════════════════════════
  const filteredCountries = countries.filter(country => 
    country.name.includes(searchQuery) || 
    country.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery)
  );

  // ═══════════════════════════════════════════════════════════
  // ✅ التحقق من صحة الرقم
  // ═══════════════════════════════════════════════════════════
  const isValidPhone = () => {
    const cleanNumber = phoneNumber.replace(/\s/g, '');
    return cleanNumber.length >= 9 && cleanNumber.length <= 15;
  };

  const showValidation = phoneNumber.length > 0;
  const isValid = isValidPhone();

  // ═══════════════════════════════════════════════════════════
  // 🎨 واجهة المستخدم
  // ═══════════════════════════════════════════════════════════
  return (
    <div className={`relative ${className}`}>
      {/* ═══════════════════════════════════════════════════════ */}
      {/* الحاوية الرئيسية */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-2">
        
        {/* ═══════════════════════════════════════════════════════ */}
        {/* زر اختيار الدولة */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className={`
              h-14 px-4 flex items-center gap-2 
              border-2 border-stone-300 rounded-xl
              bg-white hover:border-emerald-500
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isDropdownOpen ? 'border-emerald-500 ring-4 ring-emerald-200' : ''}
            `}
          >
            <span className="text-2xl">{selectedCountry.flag}</span>
            <span className="text-lg font-medium text-stone-700 whitespace-nowrap">
              {selectedCountry.dialCode}
            </span>
            <svg 
              className={`w-4 h-4 text-stone-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* ═══════════════════════════════════════════════════════ */}
          {/* القائمة المنسدلة */}
          {/* ═══════════════════════════════════════════════════════ */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white border-2 border-stone-200 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden">
              {/* حقل البحث */}
              <div className="p-3 border-b border-stone-200 sticky top-0 bg-white">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن دولة..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-base focus:outline-none focus:border-emerald-500"
                  dir="rtl"
                />
              </div>

              {/* قائمة الدول */}
              <div className="overflow-y-auto max-h-80">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`
                        w-full px-4 py-3 flex items-center gap-3 
                        hover:bg-emerald-50 transition-colors text-right
                        ${selectedCountry.code === country.code ? 'bg-emerald-100' : ''}
                      `}
                    >
                      <span className="text-2xl">{country.flag}</span>
                      <span className="flex-1 text-lg font-medium text-stone-800">
                        {country.name}
                      </span>
                      <span className="text-base text-stone-600 font-mono">
                        {country.dialCode}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-stone-500">
                    لا توجد نتائج
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* حقل إدخال الرقم */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div className="flex-1 relative">
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="50 123 4567"
            disabled={disabled}
            className={`
              w-full h-14 px-4 pr-12
              border-2 rounded-xl
              text-lg font-medium
              focus:outline-none focus:ring-4
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${showValidation
                ? isValid
                  ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-200'
                  : 'border-red-500 focus:border-red-500 focus:ring-red-200'
                : 'border-stone-300 focus:border-emerald-500 focus:ring-emerald-200'
              }
            `}
            dir="ltr"
            style={{ textAlign: 'left' }}
          />
          
          {/* أيقونة التحقق */}
          {showValidation && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              {isValid ? (
                <span className="text-emerald-500 text-2xl font-bold">✓</span>
              ) : (
                <span className="text-red-500 text-2xl font-bold">✗</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* رسائل المساعدة */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="mt-2">
        {showValidation && !isValid && (
          <p className="text-sm text-red-600 font-medium">
            ⚠️ الرقم يجب أن يتكون من 9-15 رقماً
          </p>
        )}
        
        {!showValidation && (
          <p className="text-sm text-stone-600">
            💡 لإرسال إشعارات واتساب عند طلب الدعاء لك
          </p>
        )}

        {showValidation && isValid && (
          <p className="text-sm text-emerald-600 font-medium">
            ✓ الرقم صحيح
          </p>
        )}
      </div>
    </div>
  );
}