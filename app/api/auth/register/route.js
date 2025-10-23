import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { calculateUserLevel } from '@/lib/levelsSystem'

/**
 * POST /api/auth/register
 * تسجيل مستخدم جديد
 */
export async function POST(request) {
  try {
    const data = await request.json()
    const {
      fingerprint,
      full_name,
      mother_or_father_name,
      is_mother_name = true,
      phone_number,
      country_code,
      email,
      country,
      age,
      gender
    } = data

    if (!fingerprint) {
      return NextResponse.json({
        success: false,
        error: 'البصمة مطلوبة'
      }, { status: 400 })
    }

    if (!full_name) {
      return NextResponse.json({
        success: false,
        error: 'الاسم مطلوب'
      }, { status: 400 })
    }

    // إنشاء المستخدم
    const result = await query(`
      INSERT INTO users (
        id,
        device_fingerprint,
        full_name,
        mother_or_father_name,
        is_mother_name,
        phone_number,
        country_code,
        email,
        country,
        age,
        gender,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        NOW(), NOW()
      )
      RETURNING *
    `, [
      fingerprint,
      full_name,
      mother_or_father_name || null,
      is_mother_name,
      phone_number || null,
      country_code || null,
      email || null,
      country || null,
      age || null,
      gender || null
    ])

    const user = result.rows[0]

    // إنشاء سجل إحصائيات
    await query(`
      INSERT INTO user_stats (
        id, user_id, 
        total_prayers, prayers_today, prayers_week, prayers_month, prayers_year,
        total_stars, level,
        updated_at
      ) VALUES (
        gen_random_uuid(), $1,
        0, 0, 0, 0, 0,
        0, $2,
        NOW()
      )
    `, [user.id, calculateUserLevel(user).level])

    return NextResponse.json({
      success: true,
      user,
      message: 'تم إنشاء الحساب بنجاح'
    })

  } catch (error) {
    console.error('Error in POST /api/auth/register:', error)
    
    // تحقق من وجود مستخدم بنفس البصمة
    if (error.code === '23505') {
      return NextResponse.json({
        success: false,
        error: 'يوجد حساب مسجل بهذه البصمة مسبقاً'
      }, { status: 409 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في التسجيل'
    }, { status: 500 })
  }
}