import { query, getClient } from './db'

// ═══════════════════════════════════════════════════════════
// استعلامات المستخدمين
// ═══════════════════════════════════════════════════════════

// إنشاء مستخدم جديد
export async function createUser(userData) {
  const {
    fullName,
    motherOrFatherName,
    phoneNumber,
    countryCode,
    email,
    country,
    age,
    gender,
    deviceFingerprint,
  } = userData

  const text = `
    INSERT INTO users (
      full_name, mother_or_father_name, phone_number, country_code,
      email, country, age, gender, device_fingerprint, is_anonymous
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `

  const isAnonymous = !fullName || !phoneNumber

  const values = [
    fullName || null,
    motherOrFatherName || null,
    phoneNumber || null,
    countryCode || null,
    email || null,
    country || null,
    age || null,
    gender || null,
    deviceFingerprint,
    isAnonymous,
  ]

  const result = await query(text, values)
  
  // إنشاء إحصائيات للمستخدم الجديد
  await createUserStats(result.rows[0].id)
  
  return result.rows[0]
}

// الحصول على مستخدم بالـ ID
export async function getUserById(userId) {
  const text = 'SELECT * FROM users WHERE id = $1'
  const result = await query(text, [userId])
  return result.rows[0] || null
}

// الحصول على مستخدم ببصمة الجهاز
export async function getUserByFingerprint(fingerprint) {
  const text = 'SELECT * FROM users WHERE device_fingerprint = $1'
  const result = await query(text, [fingerprint])
  return result.rows[0] || null
}

// الحصول على مستخدم برقم الهاتف
export async function getUserByPhone(phoneNumber, countryCode) {
  const text = 'SELECT * FROM users WHERE phone_number = $1 AND country_code = $2'
  const result = await query(text, [phoneNumber, countryCode])
  return result.rows[0] || null
}

// تحديث بيانات مستخدم
export async function updateUser(userId, updates) {
  const fields = []
  const values = []
  let paramCount = 1

  Object.keys(updates).forEach((key) => {
    fields.push(`${key} = $${paramCount}`)
    values.push(updates[key])
    paramCount++
  })

  values.push(userId)

  const text = `
    UPDATE users 
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id = $${paramCount}
    RETURNING *
  `

  const result = await query(text, values)
  return result.rows[0]
}

// عدد المستخدمين الكلي (المتفاعلين فقط)
export async function getTotalActiveUsers() {
  const text = `
    SELECT COUNT(DISTINCT user_id) as count
    FROM (
      SELECT user_id FROM prayers
      UNION
      SELECT user_id FROM prayer_requests WHERE user_id IS NOT NULL
    ) as active_users
  `
  const result = await query(text)
  return parseInt(result.rows[0].count)
}

// ═══════════════════════════════════════════════════════════
// استعلامات طلبات الدعاء
// ═══════════════════════════════════════════════════════════

// إنشاء طلب دعاء جديد
export async function createPrayerRequest(requestData) {
  const {
    userId,
    type,
    name,
    motherOrFatherName,
    purpose,
    customVerse,
    isSecondRequest,
  } = requestData

  const text = `
    INSERT INTO prayer_requests (
      user_id, type, name, mother_or_father_name, purpose,
      custom_verse, is_second_request, expires_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() + INTERVAL '24 hours')
    RETURNING *
  `

  const values = [
    userId || null,
    type,
    name || null,
    motherOrFatherName || null,
    purpose || null,
    customVerse || null,
    isSecondRequest || false,
  ]

  const result = await query(text, values)
  return result.rows[0]
}

// الحصول على طلبات الدعاء النشطة
export async function getActiveRequests(limit = 50, offset = 0) {
  const text = `
    SELECT 
      pr.*,
      u.full_name as user_full_name,
      u.mother_or_father_name as user_parent_name,
      u.is_anonymous as user_is_anonymous
    FROM prayer_requests pr
    LEFT JOIN users u ON pr.user_id = u.id
    WHERE pr.status = 'active' AND pr.expires_at > NOW()
    ORDER BY pr.created_at DESC
    LIMIT $1 OFFSET $2
  `
  const result = await query(text, [limit, offset])
  return result.rows
}

// الحصول على طلب دعاء بالـ ID
export async function getRequestById(requestId) {
  const text = `
    SELECT 
      pr.*,
      u.full_name as user_full_name,
      u.is_anonymous as user_is_anonymous
    FROM prayer_requests pr
    LEFT JOIN users u ON pr.user_id = u.id
    WHERE pr.id = $1
  `
  const result = await query(text, [requestId])
  return result.rows[0] || null
}

// عدد الطلبات النشطة
export async function getActiveRequestsCount() {
  const text = `
    SELECT COUNT(*) as count
    FROM prayer_requests
    WHERE status = 'active' AND expires_at > NOW()
  `
  const result = await query(text)
  return parseInt(result.rows[0].count)
}

// تحديث حالة طلب دعاء
export async function updateRequestStatus(requestId, status) {
  const text = `
    UPDATE prayer_requests
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `
  const result = await query(text, [status, requestId])
  return result.rows[0]
}

// زيادة عداد الدعاء
export async function incrementPrayerCount(requestId) {
  const text = `
    UPDATE prayer_requests
    SET prayer_count = prayer_count + 1
    WHERE id = $1
    RETURNING prayer_count
  `
  const result = await query(text, [requestId])
  return result.rows[0].prayer_count
}

// ═══════════════════════════════════════════════════════════
// استعلامات الدعوات
// ═══════════════════════════════════════════════════════════

// تسجيل دعاء
export async function recordPrayer(userId, requestId) {
  const client = await getClient()
  
  try {
    await client.query('BEGIN')

    // تسجيل الدعاء
    const insertText = `
      INSERT INTO prayers (user_id, request_id)
      VALUES ($1, $2)
      RETURNING *
    `
    const insertResult = await client.query(insertText, [userId, requestId])

    // زيادة العداد
    await client.query(
      'UPDATE prayer_requests SET prayer_count = prayer_count + 1 WHERE id = $1',
      [requestId]
    )

    // تحديث إحصائيات المستخدم
    await client.query('SELECT update_user_stats($1)', [userId])
    await client.query('SELECT calculate_interaction_rate($1)', [userId])

    await client.query('COMMIT')
    return insertResult.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// الحصول على دعوات مستخدم
export async function getUserPrayers(userId, limit = 100) {
  const text = `
    SELECT 
      p.*,
      pr.name as request_name,
      pr.type as request_type
    FROM prayers p
    JOIN prayer_requests pr ON p.request_id = pr.id
    WHERE p.user_id = $1
    ORDER BY p.prayed_at DESC
    LIMIT $2
  `
  const result = await query(text, [userId, limit])
  return result.rows
}

// التحقق إذا المستخدم دعا لطلب معين
export async function hasUserPrayed(userId, requestId) {
  const text = `
    SELECT EXISTS(
      SELECT 1 FROM prayers
      WHERE user_id = $1 AND request_id = $2
    ) as has_prayed
  `
  const result = await query(text, [userId, requestId])
  return result.rows[0].has_prayed
}

// ═══════════════════════════════════════════════════════════
// استعلامات الإحصائيات
// ═══════════════════════════════════════════════════════════

// إنشاء إحصائيات مستخدم جديد
export async function createUserStats(userId) {
  const text = `
    INSERT INTO user_stats (user_id)
    VALUES ($1)
    ON CONFLICT (user_id) DO NOTHING
    RETURNING *
  `
  const result = await query(text, [userId])
  return result.rows[0]
}

// الحصول على إحصائيات مستخدم
export async function getUserStats(userId) {
  const text = 'SELECT * FROM user_stats WHERE user_id = $1'
  const result = await query(text, [userId])
  return result.rows[0] || null
}

// تحديث إحصائيات مستخدم
export async function updateUserStats(userId) {
  const text = 'SELECT update_user_stats($1)'
  await query(text, [userId])
  
  const text2 = 'SELECT calculate_interaction_rate($1)'
  await query(text2, [userId])
  
  return getUserStats(userId)
}

// الحصول على أفضل المستخدمين (الأكثر تفاعلاً)
export async function getTopUsers(limit = 10) {
  const text = `
    SELECT 
      u.id,
      u.full_name,
      u.mother_or_father_name,
      u.is_anonymous,
      us.total_prayers,
      us.interaction_rate,
      us.total_stars,
      us.current_level
    FROM user_stats us
    JOIN users u ON us.user_id = u.id
    WHERE u.full_name IS NOT NULL 
      AND u.mother_or_father_name IS NOT NULL
      AND u.phone_number IS NOT NULL
    ORDER BY us.interaction_rate DESC, us.total_prayers DESC
    LIMIT $1
  `
  const result = await query(text, [limit])
  return result.rows
}

// ═══════════════════════════════════════════════════════════
// استعلامات الإنجازات
// ═══════════════════════════════════════════════════════════

// تسجيل إنجاز
export async function recordAchievement(userId, achievementType, starsEarned) {
  const text = `
    INSERT INTO achievements (user_id, achievement_type, stars_earned, expires_at)
    VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')
    RETURNING *
  `
  const result = await query(text, [userId, achievementType, starsEarned])

  // تحديث النجوم الكلية
  await query(
    'UPDATE user_stats SET total_stars = total_stars + $1 WHERE user_id = $2',
    [starsEarned, userId]
  )

  return result.rows[0]
}

// الحصول على إنجازات مستخدم
export async function getUserAchievements(userId) {
  const text = `
    SELECT * FROM achievements
    WHERE user_id = $1
    ORDER BY achieved_at DESC
  `
  const result = await query(text, [userId])
  return result.rows
}

// ═══════════════════════════════════════════════════════════
// استعلامات إعدادات الأدمن
// ═══════════════════════════════════════════════════════════

// الحصول على إعداد
export async function getAdminSetting(key) {
  const text = 'SELECT * FROM admin_settings WHERE setting_key = $1'
  const result = await query(text, [key])
  return result.rows[0]?.setting_value || null
}

// تحديث إعداد
export async function updateAdminSetting(key, value) {
  const text = `
    INSERT INTO admin_settings (setting_key, setting_value)
    VALUES ($1, $2)
    ON CONFLICT (setting_key) 
    DO UPDATE SET setting_value = $2, updated_at = NOW()
    RETURNING *
  `
  const result = await query(text, [key, JSON.stringify(value)])
  return result.rows[0]
}

// ═══════════════════════════════════════════════════════════
// استعلامات البانر
// ═══════════════════════════════════════════════════════════

// الحصول على البانر النشط
export async function getActiveBanner() {
  const text = 'SELECT * FROM banner WHERE is_active = true ORDER BY updated_at DESC LIMIT 1'
  const result = await query(text)
  return result.rows[0] || null
}

// تحديث البانر
export async function updateBanner(content, link, isActive) {
  const text = `
    UPDATE banner SET content = $1, link = $2, is_active = $3, updated_at = NOW()
    WHERE id = (SELECT id FROM banner ORDER BY updated_at DESC LIMIT 1)
    RETURNING *
  `
  const result = await query(text, [content, link, isActive])
  return result.rows[0]
}

// ═══════════════════════════════════════════════════════════
// استعلامات الدعاء الجماعي
// ═══════════════════════════════════════════════════════════

// الحصول على الدعاء الجماعي النشط
export async function getActiveCollectivePrayer() {
  const text = `
    SELECT * FROM collective_prayer
    WHERE is_active = true 
      AND (end_date IS NULL OR end_date > NOW())
    ORDER BY created_at DESC
    LIMIT 1
  `
  const result = await query(text)
  return result.rows[0] || null
}

// إنشاء/تحديث دعاء جماعي
export async function updateCollectivePrayer(data) {
  const { verse, purpose, customText, startDate, endDate, isActive } = data

  // تعطيل كل الدعوات الجماعية السابقة
  await query('UPDATE collective_prayer SET is_active = false')

  const text = `
    INSERT INTO collective_prayer (verse, purpose, custom_text, start_date, end_date, is_active)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `
  const result = await query(text, [verse, purpose, customText, startDate, endDate, isActive])
  return result.rows[0]
}

// ═══════════════════════════════════════════════════════════
// استعلامات التوعية
// ═══════════════════════════════════════════════════════════

// الحصول على التوعية النشطة
export async function getActiveAwareness() {
  const text = 'SELECT * FROM awareness WHERE is_active = true ORDER BY updated_at DESC LIMIT 1'
  const result = await query(text)
  return result.rows[0] || null
}

// تحديث التوعية
export async function updateAwareness(title, content, links, isActive) {
  // تعطيل التوعية السابقة
  await query('UPDATE awareness SET is_active = false')

  const text = `
    INSERT INTO awareness (title, content, links, is_active)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `
  const result = await query(text, [title, content, JSON.stringify(links), isActive])
  return result.rows[0]
}

// ═══════════════════════════════════════════════════════════
// استعلامات المكتبة
// ═══════════════════════════════════════════════════════════

// الحصول على كل الكتب
export async function getAllBooks(limit = 50) {
  const text = 'SELECT * FROM library ORDER BY created_at DESC LIMIT $1'
  const result = await query(text, [limit])
  return result.rows
}

// إضافة كتاب
export async function addBook(bookData) {
  const { title, author, description, coverImage, downloadLink, externalLink, category } = bookData

  const text = `
    INSERT INTO library (title, author, description, cover_image, download_link, external_link, category)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `
  const result = await query(text, [title, author, description, coverImage, downloadLink, externalLink, category])
  return result.rows[0]
}

// حذف كتاب
export async function deleteBook(bookId) {
  const text = 'DELETE FROM library WHERE id = $1 RETURNING *'
  const result = await query(text, [bookId])
  return result.rows[0]
}

// ═══════════════════════════════════════════════════════════
// استعلامات رسائل التواصل
// ═══════════════════════════════════════════════════════════

// إضافة رسالة تواصل
export async function addContactMessage(name, email, message) {
  const text = `
    INSERT INTO contact_messages (name, email, message)
    VALUES ($1, $2, $3)
    RETURNING *
  `
  const result = await query(text, [name, email, message])
  return result.rows[0]
}

// الحصول على رسائل التواصل
export async function getContactMessages(isRead = null, limit = 50) {
  let text = 'SELECT * FROM contact_messages'
  const values = []

  if (isRead !== null) {
    text += ' WHERE is_read = $1'
    values.push(isRead)
  }

  text += ' ORDER BY created_at DESC LIMIT $' + (values.length + 1)
  values.push(limit)

  const result = await query(text, values)
  return result.rows
}

// تحديد رسالة كمقروءة
export async function markMessageAsRead(messageId) {
  const text = 'UPDATE contact_messages SET is_read = true WHERE id = $1 RETURNING *'
  const result = await query(text, [messageId])
  return result.rows[0]
}