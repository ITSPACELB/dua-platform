// ============================================
// 🔐 نظام المصادقة بدون تسجيل دخول
// ============================================
// ✅ محسّن: registerOrUpdateUser مبسّط
// ✅ محسّن: named exports للتوافق
// ✅ محسّن: حذف upgradeUser (غير ضروري)
// ============================================

import { 
  getOrCreateFingerprint, 
  getSavedUserData,
  saveUserDataWithFingerprint,
  getUserStatus 
} from './deviceFingerprint'

/**
 * ============================================
 * 📊 استرجاع المستخدم من قاعدة البيانات
 * ============================================
 */

/**
 * الحصول على المستخدم بواسطة البصمة
 */
async function getUserByFingerprint(fingerprint) {
  if (!fingerprint) return null

  try {
    const response = await fetch('/api/auth/fingerprint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fingerprint })
    })

    if (response.ok) {
      const data = await response.json()
      return data.user || null
    }

    return null
  } catch (error) {
    console.error('Error getting user by fingerprint:', error)
    return null
  }
}

/**
 * الحصول على المستخدم بواسطة رقم الهاتف والاسم
 */
async function getUserByPhone(phoneNumber, fullName, parentName) {
  if (!phoneNumber || !fullName) return null

  try {
    const response = await fetch('/api/auth/phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phone_number: phoneNumber,
        full_name: fullName,
        mother_or_father_name: parentName
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.user || null
    }

    return null
  } catch (error) {
    console.error('Error getting user by phone:', error)
    return null
  }
}

/**
 * ============================================
 * 👤 إنشاء وإدارة المستخدمين
 * ============================================
 */

/**
 * إنشاء مستخدم زائر (مؤمن + رقم)
 */
async function createAnonymousUser() {
  const fingerprint = getOrCreateFingerprint()
  if (!fingerprint) {
    throw new Error('فشل توليد البصمة')
  }

  try {
    const response = await fetch('/api/auth/create-anonymous', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fingerprint })
    })

    if (response.ok) {
      const data = await response.json()
      
      // حفظ البيانات محلياً
      if (data.user) {
        saveUserDataWithFingerprint(data.user)
      }
      
      return data.user
    }

    throw new Error('فشل إنشاء المستخدم')
  } catch (error) {
    console.error('Error creating anonymous user:', error)
    throw error
  }
}

/**
 * ============================================
 * 📝 تسجيل / تحديث المستخدم (مُحسّن!)
 * ============================================
 * ✅ مبسّط: يستخدم /api/auth/register مباشرة
 * ✅ /api/auth/register يعمل للحالتين (create OR update)
 * ✅ لا حاجة لـ upgradeUser() منفصل
 */
async function registerOrUpdateUser(userData) {
  const fingerprint = getOrCreateFingerprint()
  
  if (!fingerprint) {
    throw new Error('فشل الحصول على البصمة')
  }

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fingerprint,
        full_name: userData.full_name || userData.fullName,
        mother_or_father_name: userData.mother_or_father_name || userData.motherOrFatherName,
        is_mother_name: userData.is_mother_name !== false,
        phone_number: userData.phone_number || userData.phoneNumber,
        country_code: userData.country_code || userData.countryCode || '+964',
        email: userData.email,
        country: userData.country,
        age: userData.age,
        gender: userData.gender
      })
    })

    if (response.ok) {
      const data = await response.json()
      
      // حفظ البيانات المحدثة
      if (data.user) {
        saveUserDataWithFingerprint(data.user)
      }
      
      return data.user
    }

    const error = await response.json()
    throw new Error(error.error || 'فشل تحديث البيانات')
  } catch (error) {
    console.error('Error registering/updating user:', error)
    throw error
  }
}

/**
 * ============================================
 * 🔍 التحقق من الصلاحيات
 * ============================================
 */

/**
 * التحقق من صلاحية دخول المستخدم
 */
async function verifyUserAccess() {
  const localStatus = getUserStatus()
  
  // إذا كان لديه بيانات محفوظة، نتحقق منها
  if (localStatus.hasUserData) {
    const serverUser = await getUserByFingerprint(localStatus.fingerprint)
    
    if (serverUser) {
      // تحديث البيانات المحلية
      saveUserDataWithFingerprint(serverUser)
      return {
        hasAccess: true,
        user: serverUser,
        level: localStatus.level
      }
    }
  }

  // مستخدم جديد تماماً
  return {
    hasAccess: false,
    user: null,
    level: 1,
    needsRegistration: true
  }
}

/**
 * تسجيل دخول المستخدم (في صفحة "حسابي")
 */
async function loginUser(credentials) {
  const { type, fingerprint, phone, fullName, parentName } = credentials

  try {
    let user = null

    // محاولة الدخول بالبصمة
    if (type === 'fingerprint' && fingerprint) {
      user = await getUserByFingerprint(fingerprint)
    }
    
    // محاولة الدخول برقم الهاتف
    else if (type === 'phone' && phone && fullName) {
      user = await getUserByPhone(phone, fullName, parentName)
    }

    if (user) {
      // حفظ البيانات محلياً
      saveUserDataWithFingerprint(user)
      
      return {
        success: true,
        user,
        message: 'تم الدخول بنجاح'
      }
    }

    return {
      success: false,
      user: null,
      message: 'لم نجد حساباً بهذه البيانات'
    }

  } catch (error) {
    console.error('Error logging in:', error)
    return {
      success: false,
      user: null,
      message: 'حدث خطأ في الدخول'
    }
  }
}

/**
 * ============================================
 * 📊 الإحصائيات والإنجازات
 * ============================================
 */

/**
 * جلب إحصائيات المستخدم
 */
async function getUserStats(userId) {
  if (!userId) return null

  try {
    const response = await fetch(`/api/auth/stats/${userId}`)
    
    if (response.ok) {
      const data = await response.json()
      return data.stats || null
    }

    return null
  } catch (error) {
    console.error('Error getting user stats:', error)
    return null
  }
}

/**
 * جلب إنجازات المستخدم
 */
async function getUserAchievements(userId) {
  if (!userId) return []

  try {
    const response = await fetch(`/api/auth/achievements/${userId}`)
    
    if (response.ok) {
      const data = await response.json()
      return data.achievements || []
    }

    return []
  } catch (error) {
    console.error('Error getting user achievements:', error)
    return []
  }
}

/**
 * ============================================
 * 🔄 التكامل مع المكونات
 * ============================================
 */

/**
 * الحصول على حالة المستخدم الكاملة (محلي + سيرفر)
 */
async function getFullUserStatus() {
  const localStatus = getUserStatus()
  
  if (!localStatus.hasFingerprint) {
    return {
      ...localStatus,
      serverUser: null,
      stats: null,
      achievements: []
    }
  }

  try {
    // جلب بيانات السيرفر
    const serverUser = await getUserByFingerprint(localStatus.fingerprint)
    
    if (serverUser) {
      // جلب الإحصائيات والإنجازات
      const [stats, achievements] = await Promise.all([
        getUserStats(serverUser.id),
        getUserAchievements(serverUser.id)
      ])

      return {
        ...localStatus,
        serverUser,
        stats,
        achievements,
        needsSync: false
      }
    }

    return {
      ...localStatus,
      serverUser: null,
      stats: null,
      achievements: [],
      needsSync: true
    }
  } catch (error) {
    console.error('Error getting full user status:', error)
    return {
      ...localStatus,
      serverUser: null,
      stats: null,
      achievements: [],
      error: error.message
    }
  }
}

/**
 * مزامنة البيانات المحلية مع السيرفر
 */
async function syncUserData() {
  const localData = getSavedUserData()
  const fingerprint = getOrCreateFingerprint()
  
  if (!fingerprint) return false

  try {
    // محاولة الحصول على بيانات السيرفر
    const serverUser = await getUserByFingerprint(fingerprint)
    
    if (serverUser) {
      // تحديث البيانات المحلية
      saveUserDataWithFingerprint(serverUser)
      return true
    }
    
    // إذا كان لديه بيانات محلية ولكن لا يوجد في السيرفر، نرسلها
    if (localData) {
      await registerOrUpdateUser(localData)
      return true
    }

    return false
  } catch (error) {
    console.error('Error syncing user data:', error)
    return false
  }
}

/**
 * ============================================
 * 🚪 تسجيل الخروج
 * ============================================
 */

/**
 * تسجيل خروج المستخدم (حذف البيانات المحلية)
 */
function logoutUser() {
  if (typeof window === 'undefined') return
  
  try {
    // حذف البيانات المحلية فقط، البصمة تبقى
    localStorage.removeItem('user_data')
    return true
  } catch (e) {
    console.error('فشل تسجيل الخروج:', e)
    return false
  }
}

/**
 * ============================================
 * 📤 Exports
 * ============================================
 */

// Named Exports (للاستيراد المباشر)
export {
  getUserByFingerprint,
  getUserByPhone,
  createAnonymousUser,
  registerOrUpdateUser,
  verifyUserAccess,
  loginUser,
  getUserStats,
  getUserAchievements,
  getFullUserStatus,
  syncUserData,
  logoutUser
}

// Default Export (للتوافق مع الكود القديم)
export default {
  getUserByFingerprint,
  getUserByPhone,
  createAnonymousUser,
  registerOrUpdateUser,
  verifyUserAccess,
  loginUser,
  getUserStats,
  getUserAchievements,
  getFullUserStatus,
  syncUserData,
  logoutUser
}