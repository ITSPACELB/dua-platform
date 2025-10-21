// ============================================================================
// 🛠️ دوال مساعدة عامة - منصة يُجيب
// ============================================================================

/**
 * 🕐 تنسيق الوقت منذ النشر
 */
export function getTimeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'الآن';
  if (diffMins === 1) return 'منذ دقيقة';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return 'منذ ساعة';
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'منذ يوم';
  if (diffDays < 30) return `منذ ${diffDays} يوم`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return 'منذ شهر';
  if (diffMonths < 12) return `منذ ${diffMonths} شهر`;

  const diffYears = Math.floor(diffMonths / 12);
  if (diffYears === 1) return 'منذ سنة';
  return `منذ ${diffYears} سنة`;
}

/**
 * 📅 تنسيق التاريخ بالعربية
 */
export function formatDate(date, format = 'long') {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('ar-SA');
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * 🔢 تنسيق الأرقام بالعربية
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('ar').format(num);
}

/**
 * 💬 اختصار النص
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * 🎨 الحصول على لون التوثيق
 */
export function getVerificationColor(level) {
  const colors = {
    GOLD: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    GREEN: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    BLUE: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    NONE: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200' }
  };
  
  return colors[level] || colors.NONE;
}

/**
 * 🌟 حساب مستوى التوثيق من معدل التفاعل
 */
export function getVerificationLevelFromRate(interactionRate) {
  if (interactionRate >= 98) {
    return {
      name: 'GOLD',
      nameAr: 'التوثيق الذهبي',
      color: 'amber',
      icon: '👑',
      threshold: 98
    };
  } else if (interactionRate >= 90) {
    return {
      name: 'GREEN',
      nameAr: 'التوثيق الأخضر',
      color: 'emerald',
      icon: '✓✓',
      threshold: 90
    };
  } else if (interactionRate >= 80) {
    return {
      name: 'BLUE',
      nameAr: 'التوثيق الأزرق',
      color: 'blue',
      icon: '✓',
      threshold: 80
    };
  } else {
    return {
      name: 'NONE',
      nameAr: 'بدون توثيق',
      color: 'stone',
      icon: '',
      threshold: 0
    };
  }
}

/**
 * 📊 حساب النسبة المئوية
 */
export function calculatePercentage(part, total) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * 🔄 تحديث عنوان الصفحة مع عداد
 */
export function updatePageTitle(count = 0, baseTitle = 'منصة الدعاء الجماعي') {
  if (count > 0) {
    document.title = `(${count}) ${baseTitle}`;
  } else {
    document.title = baseTitle;
  }
}

/**
 * 🔔 طلب إذن الإشعارات
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return { granted: false, error: 'المتصفح لا يدعم الإشعارات' };
  }

  if (Notification.permission === 'granted') {
    return { granted: true };
  }

  if (Notification.permission === 'denied') {
    return { granted: false, error: 'تم رفض إذن الإشعارات مسبقاً' };
  }

  const permission = await Notification.requestPermission();
  return { granted: permission === 'granted' };
}

/**
 * 📤 مشاركة عبر Web Share API
 */
export async function shareContent(title, text, url) {
  if (!navigator.share) {
    // Fallback: نسخ الرابط
    try {
      await navigator.clipboard.writeText(url);
      return { success: true, method: 'clipboard' };
    } catch {
      return { success: false, error: 'لا يمكن المشاركة في هذا المتصفح' };
    }
  }

  try {
    await navigator.share({ title, text, url });
    return { success: true, method: 'share' };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'تم إلغاء المشاركة' };
    }
    return { success: false, error: 'حدث خطأ أثناء المشاركة' };
  }
}

/**
 * 💾 حفظ في localStorage مع معالجة الأخطاء
 */
export function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { success: true };
  } catch (error) {
    console.error('localStorage error:', error);
    return { success: false, error: 'لا يمكن حفظ البيانات' };
  }
}

/**
 * 📥 جلب من localStorage مع معالجة الأخطاء
 */
export function getLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('localStorage error:', error);
    return defaultValue;
  }
}

/**
 * 🗑️ حذف من localStorage
 */
export function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    console.error('localStorage error:', error);
    return { success: false, error: 'لا يمكن حذف البيانات' };
  }
}

/**
 * 🎲 اختيار عنصر عشوائي من مصفوفة
 */
export function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * ⏱️ تأخير (للاستخدام مع async/await)
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 🔍 البحث في مصفوفة من الكائنات
 */
export function searchInArray(array, searchTerm, fields = []) {
  const term = searchTerm.toLowerCase().trim();
  
  if (!term) return array;
  
  return array.filter(item => {
    return fields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(term);
    });
  });
}

/**
 * 📋 نسخ نص إلى الحافظة
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    console.error('Clipboard error:', error);
    return { success: false, error: 'لا يمكن النسخ' };
  }
}

/**
 * 🌐 فحص الاتصال بالإنترنت
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * 📱 فحص إذا كان الجهاز موبايل
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 🎯 تنفيذ دالة مرة واحدة فقط (debounce)
 */
export function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 🚀 تنفيذ دالة بحد أقصى مرة واحدة في فترة زمنية (throttle)
 */
export function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}