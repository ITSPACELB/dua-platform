// ============================================
// 🔐 نظام البصمة والمصادقة بدون تسجيل دخول
// ============================================

/**
 * توليد بصمة فريدة للجهاز
 */
export function generateDeviceFingerprint() {
  if (typeof window === 'undefined') return null

  const components = []

  // معلومات المتصفح
  components.push(navigator.userAgent)
  components.push(navigator.language)
  components.push(navigator.platform)
  components.push(navigator.hardwareConcurrency || 0)
  components.push(navigator.deviceMemory || 0)

  // معلومات الشاشة
  components.push(screen.width)
  components.push(screen.height)
  components.push(screen.colorDepth)
  components.push(screen.pixelDepth)
  components.push(window.devicePixelRatio || 1)

  // المنطقة الزمنية
  components.push(new Date().getTimezoneOffset())

  // Canvas fingerprint (أكثر دقة)
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('يُجيب', 2, 15)
    components.push(canvas.toDataURL())
  } catch (e) {
    components.push('canvas_blocked')
  }

  // WebGL fingerprint
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL))
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      }
    }
  } catch (e) {
    components.push('webgl_blocked')
  }

  // تحويل لـ hash
  const fingerprint = simpleHash(components.join('|||'))
  return fingerprint
}

/**
 * دالة hash بسيطة
 */
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // تحويل لـ 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * حفظ البصمة في localStorage
 */
export function saveFingerprint(fingerprint) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('device_fingerprint', fingerprint)
    localStorage.setItem('fingerprint_saved_at', new Date().toISOString())
  } catch (e) {
    console.error('فشل حفظ البصمة:', e)
  }
}

/**
 * استرجاع البصمة
 */
export function getStoredFingerprint() {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('device_fingerprint')
  } catch (e) {
    console.error('فشل استرجاع البصمة:', e)
    return null
  }
}

/**
 * الحصول على البصمة (محفوظة أو جديدة)
 */
export function getOrCreateFingerprint() {
  let fingerprint = getStoredFingerprint()
  
  if (!fingerprint) {
    fingerprint = generateDeviceFingerprint()
    if (fingerprint) {
      saveFingerprint(fingerprint)
    }
  }
  
  return fingerprint
}

/**
 * ============================================
 * 🆕 دوال جديدة للمصادقة والحسابات
 * ============================================
 */

/**
 * التحقق من حفظ البصمة بالفعل
 */
export function isFingerprintSaved() {
  if (typeof window === 'undefined') return false
  return !!getStoredFingerprint()
}

/**
 * حذف البصمة المحفوظة
 */
export function clearFingerprint() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem('device_fingerprint')
    localStorage.removeItem('fingerprint_saved_at')
  } catch (e) {
    console.error('فشل حذف البصمة:', e)
  }
}

/**
 * التحقق من أن البصمة الحالية تطابق المحفوظة
 */
export function verifyFingerprint() {
  const stored = getStoredFingerprint()
  if (!stored) return false
  
  const current = generateDeviceFingerprint()
  return stored === current
}

/**
 * حفظ بيانات المستخدم مع البصمة
 */
export function saveUserDataWithFingerprint(userData) {
  if (typeof window === 'undefined') return false
  
  try {
    const fingerprint = getOrCreateFingerprint()
    
    // حفظ البيانات مع البصمة
    const userDataToSave = {
      ...userData,
      fingerprint,
      savedAt: new Date().toISOString()
    }
    
    localStorage.setItem('user_data', JSON.stringify(userDataToSave))
    return true
  } catch (e) {
    console.error('فشل حفظ بيانات المستخدم:', e)
    return false
  }
}

/**
 * استرجاع بيانات المستخدم المحفوظة
 */
export function getSavedUserData() {
  if (typeof window === 'undefined') return null
  
  try {
    const savedData = localStorage.getItem('user_data')
    if (!savedData) return null
    
    const userData = JSON.parse(savedData)
    
    // التحقق من البصمة
    const currentFingerprint = getOrCreateFingerprint()
    if (userData.fingerprint !== currentFingerprint) {
      // البصمة لا تطابق - ربما جهاز مختلف
      return null
    }
    
    return userData
  } catch (e) {
    console.error('فشل استرجاع بيانات المستخدم:', e)
    return null
  }
}

/**
 * تحديث بيانات المستخدم
 */
export function updateUserData(updates) {
  if (typeof window === 'undefined') return false
  
  try {
    const currentData = getSavedUserData() || {}
    const updatedData = {
      ...currentData,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem('user_data', JSON.stringify(updatedData))
    return true
  } catch (e) {
    console.error('فشل تحديث بيانات المستخدم:', e)
    return false
  }
}

/**
 * حذف جميع البيانات المحفوظة
 */
export function clearAllData() {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem('device_fingerprint')
    localStorage.removeItem('fingerprint_saved_at')
    localStorage.removeItem('user_data')
  } catch (e) {
    console.error('فشل حذف البيانات:', e)
  }
}

/**
 * التحقق من حالة البصمة (للأدمن)
 * يستخدم لمعرفة هل يجب إظهار إشعار البصمة أم لا
 */
export function shouldShowFingerprintPrompt() {
  if (typeof window === 'undefined') return false
  
  // لا تظهر إذا كانت البصمة محفوظة مسبقاً
  if (isFingerprintSaved()) return false
  
  // التحقق من إعداد الأدمن
  try {
    const dismissed = localStorage.getItem('fingerprint_prompt_dismissed')
    if (dismissed) return false
  } catch (e) {
    // ignore
  }
  
  return true
}

/**
 * إخفاء إشعار البصمة (عندما يرفض المستخدم)
 */
export function dismissFingerprintPrompt() {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('fingerprint_prompt_dismissed', 'true')
    localStorage.setItem('fingerprint_prompt_dismissed_at', new Date().toISOString())
  } catch (e) {
    console.error('فشل حفظ حالة الإشعار:', e)
  }
}

/**
 * إعادة تفعيل إشعار البصمة (للأدمن)
 */
export function resetFingerprintPrompt() {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem('fingerprint_prompt_dismissed')
    localStorage.removeItem('fingerprint_prompt_dismissed_at')
  } catch (e) {
    console.error('فشل إعادة تفعيل الإشعار:', e)
  }
}

/**
 * حساب مستوى المستخدم بناءً على البيانات المحفوظة
 */
export function calculateUserLevel(userData = null) {
  const data = userData || getSavedUserData()
  
  if (!data) {
    return {
      level: 1,
      name: 'زائر',
      displayName: 'مؤمن',
      needsUpgrade: true
    }
  }
  
  const hasName = !!(data.full_name || data.name)
  const hasParentName = !!(data.mother_or_father_name || data.parent_name)
  const hasPhone = !!(data.phone_number || data.phone)
  
  // مستوى 3: مسجل كامل
  if (hasName && hasParentName && hasPhone) {
    return {
      level: 3,
      name: 'مسجل',
      displayName: data.full_name || data.name,
      needsUpgrade: false
    }
  }
  
  // مستوى 2: جزئي
  if (hasName && hasParentName) {
    return {
      level: 2,
      name: 'جزئي',
      displayName: data.full_name || data.name,
      needsUpgrade: true,
      nextStep: 'أضف رقم هاتفك للحصول على إشعارات'
    }
  }
  
  // مستوى 1: زائر
  return {
    level: 1,
    name: 'زائر',
    displayName: 'مؤمن',
    needsUpgrade: true,
    nextStep: 'أدخل اسمك واسم والدك لتدخل القرعة'
  }
}

/**
 * توليد اسم عرض للمستخدم
 */
export function generateDisplayName(userData = null) {
  const data = userData || getSavedUserData()
  const level = calculateUserLevel(data)
  
  if (level.level === 1) {
    // زائر - استخدم جزء من البصمة كرقم
    const fingerprint = getOrCreateFingerprint()
    const uniqueNumber = fingerprint ? fingerprint.slice(0, 6) : Math.floor(Math.random() * 10000)
    return `مؤمن ${uniqueNumber}`
  }
  
  // مستوى 2 أو 3 - استخدم الاسم الحقيقي
  return data?.full_name || data?.name || 'مؤمن'
}

/**
 * معلومات كاملة عن حالة المستخدم
 */
export function getUserStatus() {
  const fingerprint = getOrCreateFingerprint()
  const userData = getSavedUserData()
  const level = calculateUserLevel(userData)
  const displayName = generateDisplayName(userData)
  
  return {
    hasFingerprint: !!fingerprint,
    fingerprint,
    isFingerprintSaved: isFingerprintSaved(),
    hasUserData: !!userData,
    userData,
    level: level.level,
    levelName: level.name,
    displayName,
    needsUpgrade: level.needsUpgrade,
    nextStep: level.nextStep
  }
}

export default {
  generateDeviceFingerprint,
  saveFingerprint,
  getStoredFingerprint,
  getOrCreateFingerprint,
  isFingerprintSaved,
  clearFingerprint,
  verifyFingerprint,
  saveUserDataWithFingerprint,
  getSavedUserData,
  updateUserData,
  clearAllData,
  shouldShowFingerprintPrompt,
  dismissFingerprintPrompt,
  resetFingerprintPrompt,
  calculateUserLevel,
  generateDisplayName,
  getUserStatus
}