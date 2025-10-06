import { createClient } from '@supabase/supabase-js'

// هذه المتغيرات ستكون في ملف .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// دوال مساعدة لقاعدة البيانات

// 1. تسجيل مستخدم جديد
export async function registerUser(userData) {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        full_name: userData.fullName,
        mother_name: userData.motherName,
        city: userData.city,
        show_full_name: userData.showFullName,
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

// 2. طلب دعاء جديد
export async function createPrayerRequest(userId, type = 'need', deceasedData = null) {
  const requestData = {
    user_id: userId,
    type: type,
    status: 'active',
    prayer_count: 0,
    created_at: new Date().toISOString()
  }

  if (type === 'deceased' && deceasedData) {
    requestData.deceased_name = deceasedData.fullName
    requestData.deceased_mother = deceasedData.motherName
    requestData.relation = deceasedData.relation
  }

  const { data, error } = await supabase
    .from('prayer_requests')
    .insert([requestData])
    .select()
    .single()

  if (error) throw error
  return data
}

// 3. الحصول على كل الطلبات النشطة
export async function getActivePrayerRequests() {
  const { data, error } = await supabase
    .from('prayer_requests')
    .select(`
      *,
      users (
        full_name,
        mother_name,
        city,
        show_full_name
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 4. تسجيل دعاء
export async function recordPrayer(userId, requestId) {
  const { data, error } = await supabase
    .from('prayers')
    .insert([
      {
        user_id: userId,
        request_id: requestId,
        prayed_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) throw error

  // زيادة عداد الدعاء في الطلب
  await supabase.rpc('increment_prayer_count', { request_id: requestId })

  return data
}

// 5. تحديث حالة الطلب (تيسرت / لم تتيسر)
export async function updateRequestStatus(requestId, resolved) {
  const { data, error } = await supabase
    .from('prayer_requests')
    .update({
      status: resolved ? 'resolved' : 'active',
      resolved_at: resolved ? new Date().toISOString() : null
    })
    .eq('id', requestId)
    .select()
    .single()

  if (error) throw error
  return data
}

// 6. الحصول على إحصائيات المستخدم
export async function getUserStats(userId) {
  // عدد الدعوات التي قام بها
  const { count: prayerCount } = await supabase
    .from('prayers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // عدد من دعا له
  const { count: prayedForCount } = await supabase
    .from('prayers')
    .select('*', { count: 'exact', head: true })
    .eq('request_id', userId)

  return {
    totalPrayers: prayerCount || 0,
    prayedForMe: prayedForCount || 0
  }
}

// 7. الحصول على عدد المستخدمين الكلي
export async function getTotalUsers() {
  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count || 0
}

// 8. الحصول على البشائر (الطلبات التي تم حلها)
export async function getResolvedRequests(limit = 10) {
  const { data, error } = await supabase
    .from('prayer_requests')
    .select(`
      *,
      users (
        full_name,
        mother_name,
        show_full_name
      )
    `)
    .eq('status', 'resolved')
    .order('resolved_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// 9. إرسال رسالة تواصل
export async function sendContactMessage(message, userId = null) {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert([
      {
        message: message,
        user_id: userId,
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) throw error
  return data
}