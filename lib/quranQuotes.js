// ════════════════════════════════════════════════════════════
// 📖 مكتبة الآيات القرآنية والأدعية المأثورة
// ════════════════════════════════════════════════════════════
// الغرض: مركز موحد للآيات القرآنية والأدعية الصحيحة
// الاستخدام: يتم استيرادها في جميع أنحاء المنصة للرسائل الروحانية
// ════════════════════════════════════════════════════════════

/**
 * مكتبة الاقتباسات القرآنية والأدعية حسب السياق
 * كل اقتباس يحتوي على: النص العربي + المصدر + الترجمة (اختياري)
 */
export const quranQuotes = {
  // ═══════════════════════════════════════════════════════════
  // 🤲 طلبات الدعاء العامة
  // ═══════════════════════════════════════════════════════════
  general: {
    text: "رَبِّ يَسِّرْ وَلَا تُعَسِّرْ",
    source: "دعاء مأثور",
    translation: "O Lord, make it easy and do not make it difficult"
  },

  // ═══════════════════════════════════════════════════════════
  // 🏥 الدعاء للمريض
  // ═══════════════════════════════════════════════════════════
  sick: {
    text: "رَبِّ اشْفِهِ شِفَاءً لَا يُغَادِرُ سَقَماً",
    source: "دعاء للمريض",
    translation: "O Lord, heal them with a healing that leaves no illness",
    verse: {
      text: "وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ",
      source: "سورة الشعراء: 80"
    }
  },

  // ═══════════════════════════════════════════════════════════
  // 🕊️ الدعاء للميت
  // ═══════════════════════════════════════════════════════════
  deceased: {
    text: "اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ",
    source: "دعاء للميت",
    translation: "O Allah, forgive them and have mercy on them",
    additional: {
      text: "رَبِّ اغْفِرْ وَارْحَمْ",
      source: "دعاء مأثور"
    }
  },

  // ═══════════════════════════════════════════════════════════
  // ⭐ الدعاء الجماعي
  // ═══════════════════════════════════════════════════════════
  collective: {
    text: "إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ",
    source: "سورة الحجرات: 10",
    translation: "The believers are but brothers",
    hadith: {
      text: "ما اجتمع قوم في بيت من بيوت الله يتلون كتاب الله... إلا نزلت عليهم السكينة",
      source: "صحيح مسلم"
    }
  },

  // ═══════════════════════════════════════════════════════════
  // 📿 استجابة الدعاء
  // ═══════════════════════════════════════════════════════════
  response: {
    text: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ",
    source: "سورة البقرة: 186",
    translation: "And when My servants ask you about Me - indeed I am near",
    continuation: {
      text: "أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
      source: "سورة البقرة: 186"
    }
  },

  // ═══════════════════════════════════════════════════════════
  // 🌟 اقتباسات إضافية للاستخدام في واجهات مختلفة
  // ═══════════════════════════════════════════════════════════
  welcome: {
    text: "وَقُلْ رَبِّ زِدْنِي عِلْماً",
    source: "سورة طه: 114",
    translation: "And say: My Lord, increase me in knowledge"
  },

  gratitude: {
    text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    source: "سورة الفاتحة: 2",
    translation: "Praise be to Allah, Lord of all the worlds"
  },

  patience: {
    text: "إِنَّ مَعَ الْعُسْرِ يُسْراً",
    source: "سورة الشرح: 6",
    translation: "Indeed, with hardship comes ease"
  },

  unity: {
    text: "وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعاً وَلَا تَفَرَّقُوا",
    source: "سورة آل عمران: 103",
    translation: "And hold firmly to the rope of Allah all together and do not become divided"
  }
};

/**
 * دالة مساعدة للحصول على اقتباس حسب النوع
 * @param {string} type - نوع الدعاء (general, sick, deceased, collective, response)
 * @returns {object} الاقتباس المطلوب
 */
export const getQuoteByType = (type) => {
  return quranQuotes[type] || quranQuotes.general;
};

/**
 * دالة للحصول على اقتباس عشوائي
 * @returns {object} اقتباس عشوائي من المكتبة
 */
export const getRandomQuote = () => {
  const quotes = Object.values(quranQuotes);
  return quotes[Math.floor(Math.random() * quotes.length)];
};

/**
 * دالة للحصول على نص الآية فقط
 * @param {string} type - نوع الدعاء
 * @returns {string} نص الآية
 */
export const getQuoteText = (type) => {
  return quranQuotes[type]?.text || quranQuotes.general.text;
};

/**
 * دالة للحصول على المصدر فقط
 * @param {string} type - نوع الدعاء
 * @returns {string} المصدر
 */
export const getQuoteSource = (type) => {
  return quranQuotes[type]?.source || quranQuotes.general.source;
};