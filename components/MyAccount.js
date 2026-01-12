'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Star, 
  TrendingUp, 
  Award,
  Edit,
  Save,
  X,
  Shield,
  Heart,
  Target
} from 'lucide-react'
import { 
  getFullUserStatus, 
  loginUser, 
  registerOrUpdateUser,
  logoutUser 
} from '@/lib/auth'
import { AchievementToast } from './AchievementNotification'

export default function MyAccount() {
  // ============================================
  // 🎨 الحالات
  // ============================================
  const [userStatus, setUserStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [toast, setToast] = useState(null)
  
  // ============================================
  // 📝 نماذج البيانات
  // ============================================
  const [loginForm, setLoginForm] = useState({
    type: 'phone', // phone or fingerprint
    phone: '',
    countryCode: '+964',
    fullName: '',
    parentName: '',
    isMotherName: true
  })

  const [editForm, setEditForm] = useState({
    full_name: '',
    mother_or_father_name: '',
    is_mother_name: true,
    phone_number: '',
    country_code: '+964',
    email: '',
    country: '',
    age: '',
    gender: ''
  })

  // ============================================
  // 📱 رموز الدول
  // ============================================
  const countryCodes = [
    { code: '+964', country: 'العراق', flag: '🇮🇶' },
    { code: '+966', country: 'السعودية', flag: '🇸🇦' },
    { code: '+971', country: 'الإمارات', flag: '🇦🇪' },
    { code: '+962', country: 'الأردن', flag: '🇯🇴' },
    { code: '+965', country: 'الكويت', flag: '🇰🇼' },
    { code: '+973', country: 'البحرين', flag: '🇧🇭' },
    { code: '+974', country: 'قطر', flag: '🇶🇦' },
    { code: '+968', country: 'عمان', flag: '🇴🇲' },
    { code: '+963', country: 'سوريا', flag: '🇸🇾' },
    { code: '+961', country: 'لبنان', flag: '🇱🇧' },
    { code: '+20', country: 'مصر', flag: '🇪🇬' },
    { code: '+213', country: 'الجزائر', flag: '🇩🇿' },
    { code: '+212', country: 'المغرب', flag: '🇲🇦' },
    { code: '+216', country: 'تونس', flag: '🇹🇳' },
    { code: '+218', country: 'ليبيا', flag: '🇱🇾' }
  ]

  // ============================================
  // ⏱️ تحميل البيانات
  // ============================================
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    setLoading(true)
    try {
      const status = await getFullUserStatus()
      setUserStatus(status)
      
      // تعبئة نموذج التعديل
      if (status.serverUser) {
        setEditForm({
          full_name: status.serverUser.full_name || '',
          mother_or_father_name: status.serverUser.mother_or_father_name || '',
          is_mother_name: status.serverUser.is_mother_name !== false,
          phone_number: status.serverUser.phone_number || '',
          country_code: status.serverUser.country_code || '+964',
          email: status.serverUser.email || '',
          country: status.serverUser.country || '',
          age: status.serverUser.age || '',
          gender: status.serverUser.gender || ''
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setToast({
        message: 'حدث خطأ في تحميل البيانات',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // 🔐 تسجيل الدخول
  // ============================================
  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (loginForm.type === 'phone') {
      if (!loginForm.phone || !loginForm.fullName) {
        setToast({
          message: 'الرجاء إدخال رقم الهاتف والاسم',
          type: 'warning'
        })
        return
      }
    }

    setLoading(true)
    try {
      const result = await loginUser({
        type: loginForm.type,
        fingerprint: userStatus?.fingerprint,
        phone: loginForm.countryCode + loginForm.phone,
        fullName: loginForm.fullName,
        parentName: loginForm.parentName
      })

      if (result.success) {
        setToast({
          message: 'مرحباً بك! تم الدخول بنجاح',
          type: 'success'
        })
        setShowLoginForm(false)
        await loadUserData()
      } else {
        setToast({
          message: result.message,
          type: 'warning'
        })
      }
    } catch (error) {
      setToast({
        message: 'حدث خطأ في تسجيل الدخول',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // 📝 التسجيل / التحديث
  // ============================================
  const handleSave = async (e) => {
    e.preventDefault()
    
    if (!editForm.full_name) {
      setToast({
        message: 'الاسم مطلوب',
        type: 'warning'
      })
      return
    }

    setLoading(true)
    try {
      const updatedUser = await registerOrUpdateUser(editForm)
      
      if (updatedUser) {
        setToast({
          message: '✅ تم حفظ بياناتك بنجاح!',
          type: 'success'
        })
        setIsEditing(false)
        await loadUserData()
      }
    } catch (error) {
      setToast({
        message: 'حدث خطأ في الحفظ',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // 🚪 تسجيل الخروج
  // ============================================
  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      logoutUser()
      setToast({
        message: 'تم تسجيل الخروج',
        type: 'info'
      })
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  // ============================================
  // 💫 واجهة التحميل
  // ============================================
  if (loading && !userStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-2xl text-stone-700">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // ============================================
  // 🔓 واجهة تسجيل الدخول (للمستخدمين الجدد)
  // ============================================
  if (!userStatus?.serverUser && !showLoginForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 py-8 px-4">
        {toast && (
          <AchievementToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="max-w-2xl mx-auto">
          {/* رسالة ترحيبية */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl p-8 mb-6 shadow-xl text-center">
            <div className="text-6xl mb-4">🤲</div>
            <h1 className="text-4xl font-bold mb-3">مرحباً بك</h1>
            <p className="text-2xl leading-relaxed">
              "وَإِنَّ رَبِّي لَسَمِيعُ الدُّعَاءِ"
            </p>
          </div>

          {/* بطاقة التوضيح */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
            <h2 className="text-3xl font-bold text-stone-800 mb-4">
              لم تحفظ بياناتك بعد
            </h2>
            
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-6">
              <p className="text-xl text-amber-900 leading-relaxed mb-4">
                حتى الآن، أنت تستخدم الموقع كـ <span className="font-bold">زائر</span>
              </p>
              <p className="text-lg text-amber-800 leading-relaxed">
                إذا أردت الاحتفاظ بدعواتك ومعرفة من دعا لك، وللدخول في القرعة اليومية والفوز بالمميزات...
              </p>
            </div>

            {/* المزايا */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 text-lg">
                <span className="text-2xl">✓</span>
                <span className="text-stone-700">احفظ دعواتك وإحصائياتك</span>
              </div>
              <div className="flex items-start gap-3 text-lg">
                <span className="text-2xl">✓</span>
                <span className="text-stone-700">اعرف من دعا لك</span>
              </div>
              <div className="flex items-start gap-3 text-lg">
                <span className="text-2xl">✓</span>
                <span className="text-stone-700">ادخل القرعة اليومية</span>
              </div>
              <div className="flex items-start gap-3 text-lg">
                <span className="text-2xl">✓</span>
                <span className="text-stone-700">افز بعرض اسمك في الموقع</span>
              </div>
            </div>

            {/* الأزرار */}
            <div className="space-y-3">
              <button
                onClick={() => setShowLoginForm(true)}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-bold text-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg"
              >
                احفظ بياناتك الآن
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-stone-200 text-stone-700 py-3 rounded-xl font-semibold text-xl hover:bg-stone-300 transition-all"
              >
                العودة للصفحة الرئيسية
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // 📝 نموذج تسجيل الدخول / التسجيل
  // ============================================
  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 py-8 px-4">
        {toast && (
          <AchievementToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-stone-800 mb-6">
              حفظ البيانات
            </h2>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* الاسم */}
              <div>
                <label className="block text-stone-700 font-semibold mb-2 text-xl">
                  الاسم الكامل <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={loginForm.fullName}
                  onChange={(e) => setLoginForm({ ...loginForm, fullName: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-none text-xl"
                  placeholder="أدخل اسمك..."
                  required
                />
              </div>

              {/* الشهرة أو اسم الوالد */}
              <div>
                <label className="block text-stone-700 font-semibold mb-2 text-xl">
                  الشهرة أو اسم الوالد (اختياري)
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setLoginForm({ ...loginForm, isMotherName: true })}
                    className={`flex-1 py-3 rounded-lg font-semibold text-lg ${
                      loginForm.isMotherName ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    الشهرة
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginForm({ ...loginForm, isMotherName: false })}
                    className={`flex-1 py-3 rounded-lg font-semibold text-lg ${
                      !loginForm.isMotherName ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    اسم الوالد
                  </button>
                </div>
                <input
                  type="text"
                  value={loginForm.parentName}
                  onChange={(e) => setLoginForm({ ...loginForm, parentName: e.target.value })}
                  className="w-full px-4 py-4 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-none text-xl"
                  placeholder="الشهرة أو اسم الوالد..."
                />
                <p className="text-sm text-emerald-700 mt-2 font-semibold">
                  💡 إدخال الشهرة أو اسم الوالد يمنحك مميزات إضافية
                </p>
              </div>

              {/* رقم الهاتف */}
              <div>
                <label className="block text-stone-700 font-semibold mb-2 text-xl">
                  رقم الهاتف (اختياري)
                </label>
                <div className="flex gap-2">
                  <select
                    value={loginForm.countryCode}
                    onChange={(e) => setLoginForm({ ...loginForm, countryCode: e.target.value })}
                    className="px-4 py-4 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-none text-xl bg-white"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={loginForm.phone}
                    onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                    className="flex-1 px-4 py-4 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-none text-xl"
                    placeholder="7XXXXXXXXX"
                  />
                </div>
                <p className="text-sm text-blue-700 mt-2 font-semibold">
                  📱 رقم الهاتف يتيح لك استقبال إشعارات عندما يدعو لك أحد
                </p>
              </div>

              {/* الأزرار */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-xl font-bold text-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? '⏳ جاري الحفظ...' : '✓ حفظ'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoginForm(false)}
                  className="px-6 bg-stone-300 text-stone-700 py-4 rounded-xl font-semibold text-xl hover:bg-stone-400 transition-all"
                >
                  ✕
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ============================================
  // 👤 صفحة الحساب الكاملة
  // ============================================
  const user = userStatus.serverUser
  const stats = userStatus.stats || {}
  const achievements = userStatus.achievements || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 py-8 px-4" style={{ fontFamily: 'Markazi Text, serif' }}>
      {toast && (
        <AchievementToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* الهيدر */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-stone-800">حسابي</h1>
          <button
            onClick={() => window.location.href = '/'}
            className="text-stone-600 hover:text-stone-800 text-xl"
          >
            ← العودة
          </button>
        </div>

        {/* معلومات المستخدم */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{userStatus.displayName}</h2>
                <p className="text-xl text-emerald-100">
                  {userStatus.levelName} - المستوى {userStatus.level}
                </p>
              </div>
            </div>
            
            {stats.total_stars > 0 && (
              <div className="text-center">
                <div className="text-4xl mb-1">
                  {Array(stats.total_stars).fill('⭐').join('')}
                </div>
                <p className="text-sm text-emerald-100">{stats.total_stars} نجمة</p>
              </div>
            )}
          </div>
        </div>

        {/* رسالة الترقية */}
        {userStatus.needsUpgrade && userStatus.nextStep && (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-6 mb-6">
            <h3 className="text-2xl font-bold text-purple-900 mb-3 flex items-center gap-2">
              <TrendingUp size={28} />
              ارتقِ بحسابك
            </h3>
            <p className="text-xl text-purple-800 mb-4">{userStatus.nextStep}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-purple-800 transition-all"
            >
              إكمال البيانات
            </button>
          </div>
        )}

        {/* الإحصائيات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <div className="text-3xl mb-2">🤲</div>
            <p className="text-2xl font-bold text-emerald-700">{stats.total_prayers || 0}</p>
            <p className="text-sm text-stone-600">دعوة كلية</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-2xl font-bold text-blue-700">{stats.prayers_today || 0}</p>
            <p className="text-sm text-stone-600">اليوم</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-2xl font-bold text-purple-700">{stats.prayers_week || 0}</p>
            <p className="text-sm text-stone-600">هذا الأسبوع</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-2xl font-bold text-amber-700">{stats.prayers_month || 0}</p>
            <p className="text-sm text-stone-600">هذا الشهر</p>
          </div>
        </div>

        {/* الإنجازات */}
        {achievements.length > 0 && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <h3 className="text-2xl font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Award size={28} className="text-amber-600" />
              إنجازاتك
            </h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-amber-900">{achievement.achievement_type}</p>
                    <p className="text-sm text-amber-700">
                      {new Date(achievement.achieved_at).toLocaleDateString('ar')}
                    </p>
                  </div>
                  <div className="text-3xl">
                    {Array(achievement.stars_earned).fill('⭐').join('')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* معلومات الحساب */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-stone-800">معلومات الحساب</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-emerald-700 hover:text-emerald-800 flex items-center gap-2"
              >
                <Edit size={20} />
                تعديل
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-lg">
                <User className="text-stone-500" size={24} />
                <span className="text-stone-700">{user.full_name || 'لم يتم الإدخال'}</span>
              </div>
              
              {user.mother_or_father_name && (
                <div className="flex items-center gap-3 text-lg">
                  <Heart className="text-stone-500" size={24} />
                  <span className="text-stone-700">
                    الشهرة: 
                    {user.mother_or_father_name}
                  </span>
                </div>
              )}
              
              {user.phone_number && (
                <div className="flex items-center gap-3 text-lg">
                  <Phone className="text-stone-500" size={24} />
                  <span className="text-stone-700" dir="ltr">{user.phone_number}</span>
                </div>
              )}
              
              {user.email && (
                <div className="flex items-center gap-3 text-lg">
                  <Mail className="text-stone-500" size={24} />
                  <span className="text-stone-700">{user.email}</span>
                </div>
              )}
              
              {user.country && (
                <div className="flex items-center gap-3 text-lg">
                  <MapPin className="text-stone-500" size={24} />
                  <span className="text-stone-700">{user.country}</span>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {/* نموذج التعديل - نفس حقول التسجيل */}
              <div>
                <label className="block text-stone-700 font-semibold mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-2">الشهرة أو اسم الوالد</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, is_mother_name: true })}
                    className={`flex-1 py-2 rounded-lg font-semibold ${
                      editForm.is_mother_name ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    الشهرة
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, is_mother_name: false })}
                    className={`flex-1 py-2 rounded-lg font-semibold ${
                      !editForm.is_mother_name ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    اسم الوالد
                  </button>
                </div>
                <input
                  type="text"
                  value={editForm.mother_or_father_name}
                  onChange={(e) => setEditForm({ ...editForm, mother_or_father_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-2">رقم الهاتف</label>
                <div className="flex gap-2">
                  <select
                    value={editForm.country_code}
                    onChange={(e) => setEditForm({ ...editForm, country_code: e.target.value })}
                    className="px-4 py-3 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-none text-lg bg-white"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={editForm.phone_number}
                    onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                    className="flex-1 px-4 py-3 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
                    placeholder="7XXXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-2">البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-2">الدولة (اختياري)</label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-stone-700 font-semibold mb-2">العمر (اختياري)</label>
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-2">الجنس (اختياري)</label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-none text-lg bg-white"
                >
                  <option value="">اختر...</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50"
                >
                  {loading ? '⏳ جاري الحفظ...' : '✓ حفظ التعديلات'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 bg-stone-300 text-stone-700 py-3 rounded-xl font-semibold text-lg hover:bg-stone-400 transition-all"
                >
                  ✕
                </button>
              </div>
            </form>
          )}
        </div>

        {/* تسجيل الخروج */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-100 text-red-700 py-3 rounded-xl font-semibold text-lg hover:bg-red-200 transition-all"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  )
}