// ============================================
// 🔐 نظام المصادقة بدون تسجيل دخول
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
export async function getUserByFingerprint(fingerprint) {
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
export async function getUserByPhone(phoneNumber, fullName, parentName) {
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
export async function createAnonymousUser() {
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
 * ترقية المستخدم (من زائر إلى جزئي أو مسجل)
 */
export async function upgradeUser(userData) {
  const fingerprint = getOrCreateFingerprint()
  if (!fingerprint) {
    throw new Error('فشل الحصول على البصمة')
  }

  try {
    const response = await fetch('/api/auth/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fingerprint,
        ...userData
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
    console.error('Error upgrading user:', error)
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
export async function verifyUserAccess() {
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
export async function loginUser(credentials) {
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
 * 📝 تسجيل حساب جديد
 * ============================================
 */

/**
 * تسجيل مستخدم جديد أو تحديث بيانات موجود
 */
export async function registerOrUpdateUser(userData) {
  const fingerprint = getOrCreateFingerprint()
  
  try {
    // التحقق من وجود مستخدم بهذه البصمة
    const existingUser = await getUserByFingerprint(fingerprint)
    
    if (existingUser) {
      // تحديث المستخدم الموجود
      return await upgradeUser(userData)
    } else {
      // إنشاء مستخدم جديد
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fingerprint,
          ...userData
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.user) {
          saveUserDataWithFingerprint(data.user)
        }
        
        return data.user
      }

      throw new Error('فشل التسجيل')
    }
  } catch (error) {
    console.error('Error registering user:', error)
    throw error
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
export async function getUserStats(userId) {
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
export async function getUserAchievements(userId) {
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
export async function getFullUserStatus() {
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
export async function syncUserData() {
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
export function logoutUser() {
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

export default {
  getUserByFingerprint,
  getUserByPhone,
  createAnonymousUser,
  upgradeUser,
  verifyUserAccess,
  loginUser,
  registerOrUpdateUser,
  getUserStats,
  getUserAchievements,
  getFullUserStatus,
  syncUserData,
  logoutUser
}