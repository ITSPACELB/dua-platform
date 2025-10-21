// ============================================================================
// ✅ دوال التحقق من البيانات - منصة يُجيب
// ============================================================================

/**
 * 📝 التحقق من الاسم الكامل
 */
export function validateFullName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'الاسم مطلوب' };
  }

  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'الاسم قصير جداً' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'الاسم طويل جداً' };
  }

  // يجب أن يحتوي على حروف عربية أو إنجليزية فقط
  const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]+$/;
  if (!nameRegex.test(trimmed)) {
    return { valid: false, error: 'الاسم يجب أن يحتوي على حروف فقط' };
  }

  return { valid: true, value: trimmed };
}

/**
 * 📱 التحقق من رقم الهاتف
 */
export function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: true, value: null }; // اختياري
  }

  const trimmed = phone.trim();
  
  if (trimmed.length === 0) {
    return { valid: true, value: null };
  }

  // يجب أن يبدأ بـ + ويحتوي على 10-15 رقم
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  if (!phoneRegex.test(trimmed)) {
    return { 
      valid: false, 
      error: 'رقم الهاتف يجب أن يبدأ بـ + ورمز الدولة (مثال: +966501234567)' 
    };
  }

  return { valid: true, value: trimmed };
}

/**
 * 📧 التحقق من البريد الإلكتروني
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: true, value: null }; // اختياري
  }

  const trimmed = email.trim();
  
  if (trimmed.length === 0) {
    return { valid: true, value: null };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'البريد الإلكتروني غير صحيح' };
  }

  return { valid: true, value: trimmed.toLowerCase() };
}

/**
 * 🔐 التحقق من السؤال السري
 */
export function validateUniqueQuestion(question, answer) {
  if (!question || typeof question !== 'string') {
    return { valid: false, error: 'السؤال السري مطلوب' };
  }

  if (!answer || typeof answer !== 'string') {
    return { valid: false, error: 'إجابة السؤال مطلوبة' };
  }

  const trimmedAnswer = answer.trim();
  
  if (trimmedAnswer.length < 1) {
    return { valid: false, error: 'الإجابة قصيرة جداً' };
  }

  if (trimmedAnswer.length > 100) {
    return { valid: false, error: 'الإجابة طويلة جداً' };
  }

  return { 
    valid: true, 
    question: question.trim(),
    answer: trimmedAnswer.toLowerCase() // للمقارنة
  };
}

/**
 * 📝 التحقق من نص الدعاء
 */
export function validatePrayerMessage(message) {
  if (!message || typeof message !== 'string') {
    return { valid: true, value: null }; // اختياري
  }

  const trimmed = message.trim();
  
  if (trimmed.length === 0) {
    return { valid: true, value: null };
  }

  if (trimmed.length > 500) {
    return { valid: false, error: 'الرسالة طويلة جداً (الحد الأقصى 500 حرف)' };
  }

  return { valid: true, value: trimmed };
}

/**
 * 🎯 التحقق من نوع الطلب
 */
export function validatePrayerType(type) {
  const validTypes = ['general', 'deceased', 'sick'];
  
  if (!validTypes.includes(type)) {
    return { valid: false, error: 'نوع الطلب غير صحيح' };
  }

  return { valid: true, value: type };
}

/**
 * 🔢 التحقق من الأرقام الموجبة
 */
export function validatePositiveInteger(value, fieldName = 'القيمة') {
  const num = parseInt(value);
  
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} يجب أن يكون رقماً` };
  }

  if (num < 0) {
    return { valid: false, error: `${fieldName} يجب أن يكون موجباً` };
  }

  return { valid: true, value: num };
}

/**
 * 🌐 التحقق من URL
 */
export function validateURL(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'الرابط مطلوب' };
  }

  try {
    new URL(url);
    return { valid: true, value: url };
  } catch {
    return { valid: false, error: 'الرابط غير صحيح' };
  }
}

/**
 * 📅 التحقق من التاريخ
 */
export function validateDate(date) {
  const parsed = new Date(date);
  
  if (isNaN(parsed.getTime())) {
    return { valid: false, error: 'التاريخ غير صحيح' };
  }

  return { valid: true, value: parsed };
}

/**
 * 🛡️ تنظيف HTML من النصوص
 */
export function sanitizeHTML(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}