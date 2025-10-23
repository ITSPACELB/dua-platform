import { NextResponse } from 'next/server'
import {
  createPrayerRequest,
  getActiveRequests,
  getActiveRequestsCount,
  recordPrayer,
  hasUserPrayed,
  getUserById,
  createUser,
  getUserByFingerprint,
} from '@/lib/queries'

// ═══════════════════════════════════════════════════════════
// GET - الحصول على طلبات الدعاء النشطة
// ═══════════════════════════════════════════════════════════
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0

    const requests = await getActiveRequests(limit, offset)
    const totalCount = await getActiveRequestsCount()

    return NextResponse.json({
      success: true,
      requests,
      totalCount,
      hasMore: offset + requests.length < totalCount,
    })
  } catch (error) {
    console.error('خطأ في جلب الطلبات:', error)
    return NextResponse.json(
      { success: false, error: 'فشل جلب الطلبات' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════
// POST - إنشاء طلب دعاء جديد أو تسجيل دعاء
// ═══════════════════════════════════════════════════════════
export async function POST(request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create_request') {
      return await handleCreateRequest(body)
    } else if (action === 'record_prayer') {
      return await handleRecordPrayer(body)
    } else {
      return NextResponse.json(
        { success: false, error: 'Action غير صحيح' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('خطأ في API الدعوات:', error)
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════
// دالة إنشاء طلب دعاء جديد
// ═══════════════════════════════════════════════════════════
async function handleCreateRequest(body) {
  const {
    deviceFingerprint,
    type, // personal, friend, deceased, sick
    name,
    motherOrFatherName,
    purpose,
    customVerse,
    isSecondRequest,
  } = body

  // التحقق من الحقول المطلوبة
  if (!deviceFingerprint || !type) {
    return NextResponse.json(
      { success: false, error: 'بيانات ناقصة' },
      { status: 400 }
    )
  }

  // الحصول على المستخدم أو إنشاء واحد جديد
  let user = await getUserByFingerprint(deviceFingerprint)
  
  if (!user) {
    user = await createUser({
      fullName: name || null,
      motherOrFatherName: motherOrFatherName || null,
      deviceFingerprint,
    })
  }

  // التحقق من الحد اليومي (إلا إذا كان طلب ثاني للمميزين)
  if (!isSecondRequest) {
    // التحقق من آخر طلب للمستخدم
    const lastRequest = await getLastUserRequest(user.id)
    if (lastRequest) {
      const hoursSinceLastRequest = (Date.now() - new Date(lastRequest.created_at)) / (1000 * 60 * 60)
      if (hoursSinceLastRequest < 24) {
        return NextResponse.json(
          {
            success: false,
            error: 'يمكنك طلب الدعاء مرة واحدة كل 24 ساعة',
            nextAllowedTime: new Date(new Date(lastRequest.created_at).getTime() + 24 * 60 * 60 * 1000),
          },
          { status: 429 }
        )
      }
    }
  }

  // إنشاء الطلب
  const newRequest = await createPrayerRequest({
    userId: user.id,
    type,
    name,
    motherOrFatherName,
    purpose,
    customVerse,
    isSecondRequest: isSecondRequest || false,
  })

  return NextResponse.json({
    success: true,
    request: newRequest,
    message: 'تم إرسال طلبك! سيصل إشعار للمؤمنين إن شاء الله',
  })
}

// ═══════════════════════════════════════════════════════════
// دالة تسجيل دعاء
// ═══════════════════════════════════════════════════════════
async function handleRecordPrayer(body) {
  const { deviceFingerprint, requestId } = body

  if (!deviceFingerprint || !requestId) {
    return NextResponse.json(
      { success: false, error: 'بيانات ناقصة' },
      { status: 400 }
    )
  }

  // الحصول على المستخدم أو إنشاء واحد جديد
  let user = await getUserByFingerprint(deviceFingerprint)
  
  if (!user) {
    user = await createUser({ deviceFingerprint })
  }

  // التحقق إذا المستخدم دعا مسبقاً لهذا الطلب
  const alreadyPrayed = await hasUserPrayed(user.id, requestId)
  
  if (alreadyPrayed) {
    return NextResponse.json(
      { success: false, error: 'لقد دعوت لهذا الطلب مسبقاً' },
      { status: 400 }
    )
  }

  // تسجيل الدعاء
  const prayer = await recordPrayer(user.id, requestId)

  return NextResponse.json({
    success: true,
    prayer,
    message: 'جزاك الله خيراً - تم تسجيل دعائك',
  })
}

// ═══════════════════════════════════════════════════════════
// دالة مساعدة للحصول على آخر طلب للمستخدم
// ═══════════════════════════════════════════════════════════
async function getLastUserRequest(userId) {
  const { query } = await import('@/lib/db')
  const text = `
    SELECT * FROM prayer_requests
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1
  `
  const result = await query(text, [userId])
  return result.rows[0] || null
}