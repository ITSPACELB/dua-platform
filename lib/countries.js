// ════════════════════════════════════════════════════════════
// 🌍 مكتبة الدول العربية والإسلامية
// ════════════════════════════════════════════════════════════
// الغرض: قائمة شاملة بالدول مع أكواد الاتصال والأعلام
// الاستخدام: مكون إدخال رقم الهاتف الدولي
// ════════════════════════════════════════════════════════════

/**
 * قائمة الدول مع بياناتها الكاملة
 * كل دولة تحتوي على: الكود - كود الاتصال - العلم - الاسم
 */
export const countries = [
  // ═══════════════════════════════════════════════════════════
  // 🕌 دول الخليج العربي
  // ═══════════════════════════════════════════════════════════
  { 
    code: 'SA', 
    dialCode: '+966', 
    flag: '🇸🇦', 
    name: 'السعودية',
    nameEn: 'Saudi Arabia'
  },
  { 
    code: 'AE', 
    dialCode: '+971', 
    flag: '🇦🇪', 
    name: 'الإمارات',
    nameEn: 'United Arab Emirates'
  },
  { 
    code: 'KW', 
    dialCode: '+965', 
    flag: '🇰🇼', 
    name: 'الكويت',
    nameEn: 'Kuwait'
  },
  { 
    code: 'QA', 
    dialCode: '+974', 
    flag: '🇶🇦', 
    name: 'قطر',
    nameEn: 'Qatar'
  },
  { 
    code: 'BH', 
    dialCode: '+973', 
    flag: '🇧🇭', 
    name: 'البحرين',
    nameEn: 'Bahrain'
  },
  { 
    code: 'OM', 
    dialCode: '+968', 
    flag: '🇴🇲', 
    name: 'عُمان',
    nameEn: 'Oman'
  },

  // ═══════════════════════════════════════════════════════════
  // 🌙 دول الشام
  // ═══════════════════════════════════════════════════════════
  { 
    code: 'IQ', 
    dialCode: '+964', 
    flag: '🇮🇶', 
    name: 'العراق',
    nameEn: 'Iraq'
  },
  { 
    code: 'JO', 
    dialCode: '+962', 
    flag: '🇯🇴', 
    name: 'الأردن',
    nameEn: 'Jordan'
  },
  { 
    code: 'LB', 
    dialCode: '+961', 
    flag: '🇱🇧', 
    name: 'لبنان',
    nameEn: 'Lebanon'
  },
  { 
    code: 'SY', 
    dialCode: '+963', 
    flag: '🇸🇾', 
    name: 'سوريا',
    nameEn: 'Syria'
  },
  { 
    code: 'PS', 
    dialCode: '+970', 
    flag: '🇵🇸', 
    name: 'فلسطين',
    nameEn: 'Palestine'
  },

  // ═══════════════════════════════════════════════════════════
  // 🐫 الجزيرة العربية
  // ═══════════════════════════════════════════════════════════
  { 
    code: 'YE', 
    dialCode: '+967', 
    flag: '🇾🇪', 
    name: 'اليمن',
    nameEn: 'Yemen'
  },

  // ═══════════════════════════════════════════════════════════
  // 🏜️ شمال أفريقيا
  // ═══════════════════════════════════════════════════════════
  { 
    code: 'EG', 
    dialCode: '+20', 
    flag: '🇪🇬', 
    name: 'مصر',
    nameEn: 'Egypt'
  },
  { 
    code: 'LY', 
    dialCode: '+218', 
    flag: '🇱🇾', 
    name: 'ليبيا',
    nameEn: 'Libya'
  },
  { 
    code: 'TN', 
    dialCode: '+216', 
    flag: '🇹🇳', 
    name: 'تونس',
    nameEn: 'Tunisia'
  },
  { 
    code: 'DZ', 
    dialCode: '+213', 
    flag: '🇩🇿', 
    name: 'الجزائر',
    nameEn: 'Algeria'
  },
  { 
    code: 'MA', 
    dialCode: '+212', 
    flag: '🇲🇦', 
    name: 'المغرب',
    nameEn: 'Morocco'
  },
  { 
    code: 'MR', 
    dialCode: '+222', 
    flag: '🇲🇷', 
    name: 'موريتانيا',
    nameEn: 'Mauritania'
  },

  // ═══════════════════════════════════════════════════════════
  // 🌍 شرق أفريقيا
  // ═══════════════════════════════════════════════════════════
  { 
    code: 'SD', 
    dialCode: '+249', 
    flag: '🇸🇩', 
    name: 'السودان',
    nameEn: 'Sudan'
  },
  { 
    code: 'SO', 
    dialCode: '+252', 
    flag: '🇸🇴', 
    name: 'الصومال',
    nameEn: 'Somalia'
  },
  { 
    code: 'DJ', 
    dialCode: '+253', 
    flag: '🇩🇯', 
    name: 'جيبوتي',
    nameEn: 'Djibouti'
  },
  { 
    code: 'KM', 
    dialCode: '+269', 
    flag: '🇰🇲', 
    name: 'جزر القمر',
    nameEn: 'Comoros'
  },

  // ═══════════════════════════════════════════════════════════
  // 🕌 دول إسلامية أخرى
  // ═══════════════════════════════════════════════════════════
  { 
    code: 'TR', 
    dialCode: '+90', 
    flag: '🇹🇷', 
    name: 'تركيا',
    nameEn: 'Turkey'
  },
  { 
    code: 'IR', 
    dialCode: '+98', 
    flag: '🇮🇷', 
    name: 'إيران',
    nameEn: 'Iran'
  },
  { 
    code: 'PK', 
    dialCode: '+92', 
    flag: '🇵🇰', 
    name: 'باكستان',
    nameEn: 'Pakistan'
  },
  { 
    code: 'AF', 
    dialCode: '+93', 
    flag: '🇦🇫', 
    name: 'أفغانستان',
    nameEn: 'Afghanistan'
  },
  { 
    code: 'BD', 
    dialCode: '+880', 
    flag: '🇧🇩', 
    name: 'بنغلاديش',
    nameEn: 'Bangladesh'
  },
  { 
    code: 'MY', 
    dialCode: '+60', 
    flag: '🇲🇾', 
    name: 'ماليزيا',
    nameEn: 'Malaysia'
  },
  { 
    code: 'ID', 
    dialCode: '+62', 
    flag: '🇮🇩', 
    name: 'إندونيسيا',
    nameEn: 'Indonesia'
  },
];

/**
 * دالة مساعدة للبحث عن دولة بواسطة الكود
 * @param {string} code - كود الدولة (مثل: 'SA', 'EG')
 * @returns {object} بيانات الدولة
 */
export const getCountryByCode = (code) => {
  return countries.find(country => country.code === code);
};

/**
 * دالة للبحث عن دولة بواسطة كود الاتصال
 * @param {string} dialCode - كود الاتصال (مثل: '+966', '+20')
 * @returns {object} بيانات الدولة
 */
export const getCountryByDialCode = (dialCode) => {
  return countries.find(country => country.dialCode === dialCode);
};

/**
 * دالة للحصول على السعودية كافتراضي
 * @returns {object} بيانات السعودية
 */
export const getDefaultCountry = () => {
  return countries.find(country => country.code === 'SA') || countries[0];
};

/**
 * دالة للحصول على قائمة أكواد الاتصال فقط
 * @returns {array} مصفوفة بأكواد الاتصال
 */
export const getAllDialCodes = () => {
  return countries.map(country => country.dialCode);
};

/**
 * دالة للحصول على دول الخليج فقط
 * @returns {array} مصفوفة بدول الخليج
 */
export const getGCCCountries = () => {
  const gccCodes = ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'];
  return countries.filter(country => gccCodes.includes(country.code));
};