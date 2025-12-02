import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * POST /api/auth/create-anonymous
 * إنشاء مستخدم زائر (مؤمن + رقم)
 */
export async function POST(request) {
  try {
    const { fingerprint } = await request.json()
    
    if (!fingerprint) {
      return NextResponse.json({
        success: false,
        error: 'البصمة مطلوبة'
      }, { status: 400 })
    }

    // التحقق من عدم وجود مستخدم بهذه البصمة
    const existingUser = await query(`
      SELECT id FROM users WHERE device_fingerprint = $1 LIMIT 1
    `, [fingerprint])

    if (existingUser.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'يوجد مستخدم بهذه البصمة مسبقاً'
      }, { status: 409 })
    }

    // توليد رقم عشوائي من البصمة
    const uniqueNumber = fingerprint.substring(0, 6)
    const displayName = `مؤمن ${uniqueNumber}`

    // إنشاء مستخدم زائر
    const result = await query(`
      INSERT INTO users (
        id,
        device_fingerprint,
        full_name,
        is_anonymous,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        $1,
        $2,
        true,
        NOW(),
        NOW()
      )
      RETURNING *
    `, [fingerprint, displayName])

    const user = result.rows[0]

    // إنشاء سجل إحصائيات
    await query(`
      INSERT INTO user_stats (
        id, user_id,
        total_prayers_given,
        total_notifications_received,
        interaction_rate,
        total_stars,
        last_prayer_date,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(), $1,
        0, 0, 0, 0, NULL,
        NOW(), NOW()
      )
    `, [user.id])

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        level: 1,
        displayName
      },
      message: 'تم إنشاء حساب زائر بنجاح'
    })

  } catch (error) {
    console.error('Error in POST /api/auth/create-anonymous:', error)
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في إنشاء الحساب'
    }, { status: 500 })
  }
}