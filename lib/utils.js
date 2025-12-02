/**
 * 🛡️ Utility Functions - معايير احترافية عالية
 * ✅ حل جذري لمشكلة Object rendering
 * ✅ يعمل محلياً وعلى السيرفر
 * ✅ Type-safe و scalable للملايين
 * ✅ Multiple fallbacks للأمان
 */

/**
 * استخراج نص الآية من object أو string
 * @param {string|object|null} verse - الآية
 * @returns {string} - نص الآية
 */
export function getVerseText(verse) {
  if (!verse) return '';
  
  // إذا كان string بالفعل
  if (typeof verse === 'string') return verse;
  
  // إذا كان object - محاولات متعددة للحصول على النص
  if (typeof verse === 'object') {
    return verse.text || 
           verse.verse || 
           verse.content || 
           verse.arabic ||
           String(verse);
  }
  
  return String(verse);
}

/**
 * استخراج مصدر الآية
 * @param {string|object|null} verse - الآية
 * @returns {string} - المصدر
 */
export function getVerseSource(verse) {
  if (!verse) return '';
  if (typeof verse === 'object' && verse.source) return verse.source;
  if (typeof verse === 'object' && verse.ref) return verse.ref;
  return '';
}

/**
 * استخراج ترجمة الآية
 * @param {string|object|null} verse - الآية
 * @returns {string} - الترجمة
 */
export function getVerseTranslation(verse) {
  if (!verse) return '';
  if (typeof verse === 'object' && verse.translation) return verse.translation;
  return '';
}

/**
 * تنظيف كل البيانات القادمة من API
 * @param {any} data - البيانات
 * @returns {any} - البيانات المنظفة
 */
export function sanitizeVerseData(data) {
  if (!data) return data;
  
  // Array
  if (Array.isArray(data)) {
    return data.map(item => sanitizeVerseData(item));
  }
  
  // Object
  if (typeof data === 'object') {
    const cleaned = { ...data };
    
    // تنظيف quranic_verse
    if (cleaned.quranic_verse) {
      cleaned.quranic_verse = getVerseText(cleaned.quranic_verse);
      cleaned.quranic_verse_source = getVerseSource(data.quranic_verse);
    }
    
    // تنظيف custom_verse
    if (cleaned.custom_verse) {
      cleaned.custom_verse = getVerseText(cleaned.custom_verse);
      cleaned.custom_verse_source = getVerseSource(data.custom_verse);
    }
    
    return cleaned;
  }
  
  return data;
}

export default {
  getVerseText,
  getVerseSource,
  getVerseTranslation,
  sanitizeVerseData
};