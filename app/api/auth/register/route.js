import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { calculateUserLevel } from '@/lib/levelsSystem'

/**
 * POST /api/auth/register
 * تسجيل مستخدم جديد أو تحديث بيانات موجود
 * ✅ يعمل للحالتين!
 * ✅ مُصلح: بدون is_mother_name
 */
export async function POST(request) {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')

    const data = await request.json()
    const {
      fingerprint,
      full_name,
      mother_or_father_name,
      phone_number,
      country_code,
      email,
      country,
      age,
      gender
    } = data

    // ═══════════════════════════════════════════════════════
    // التحققات الأساسية
    // ═══════════════════════════════════════════════════════
    if (!fingerprint) {
      await client.query('ROLLBACK')
      return NextResponse.json({
        success: false,
        error: 'البصمة مطلوبة'
      }, { status: 400 })
    }

    // ═══════════════════════════════════════════════════════
    // البحث عن مستخدم موجود
    // ═══════════════════════════════════════════════════════
    const existingUser = await client.query(
      'SELECT * FROM users WHERE device_fingerprint = $1',
      [fingerprint]
    )

    let user
    let isNewUser = false

    // ═══════════════════════════════════════════════════════
    // السيناريو 1: مستخدم جديد تماماً
    // ═══════════════════════════════════════════════════════
    if (existingUser.rows.length === 0) {
      isNewUser = true

      if (!full_name) {
        await client.query('ROLLBACK')
        return NextResponse.json({
          success: false,
          error: 'الاسم مطلوب للتسجيل الجديد'
        }, { status: 400 })
      }
      // إنشاء share_code عشوائي
      const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      // إنشاء المستخدم
      const insertResult = await client.query(`
        INSERT INTO users (
          id,
          device_fingerprint,
          full_name,
          mother_or_father_name,
          phone_number,
          country_code,
          email,
          country,
          age,
          gender,
          share_code,
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
        phone_number || null,
        country_code || null,
        email || null,
        country || null,
        age || null,
        gender || null,
        shareCode
      ])
      user = insertResult.rows[0]

      // حساب المستوى
      const userLevel = calculateUserLevel(user)

      // إنشاء user_stats
      await client.query(`
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
      `, [user.id, userLevel.level])

    // ═══════════════════════════════════════════════════════
    // السيناريو 2: مستخدم موجود - تحديث البيانات
    // ═══════════════════════════════════════════════════════
    } else {
      user = existingUser.rows[0]

      // التحقق من رقم الهاتف المكرر
      if (phone_number && phone_number !== user.phone_number) {
        const phoneCheck = await client.query(
          'SELECT id FROM users WHERE phone_number = $1 AND id != $2',
          [phone_number, user.id]
        )

        if (phoneCheck.rows.length > 0) {
          await client.query('ROLLBACK')
          return NextResponse.json({
            success: false,
            error: 'رقم الهاتف مستخدم من قبل'
          }, { status: 409 })
        }
      }

      // التحقق من البريد الإلكتروني المكرر
      if (email && email !== user.email) {
        const emailCheck = await client.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [email, user.id]
        )

        if (emailCheck.rows.length > 0) {
          await client.query('ROLLBACK')
          return NextResponse.json({
            success: false,
            error: 'البريد الإلكتروني مستخدم من قبل'
          }, { status: 409 })
        }
      }

      // تحديث المستخدم (استخدام COALESCE للحفاظ على البيانات الموجودة)
      const updateResult = await client.query(`
        UPDATE users 
        SET 
          full_name = COALESCE($1, full_name),
          mother_or_father_name = COALESCE($2, mother_or_father_name),
          phone_number = COALESCE($3, phone_number),
          country_code = COALESCE($4, country_code),
          email = COALESCE($5, email),
          country = COALESCE($6, country),
          age = COALESCE($7, age),
          gender = COALESCE($8, gender),
          updated_at = NOW()
        WHERE id = $9
        RETURNING *
      `, [
        full_name,
        mother_or_father_name,
        phone_number,
        country_code,
        email,
        country,
        age,
        gender,
        user.id
      ])

      user = updateResult.rows[0]

      // إعادة حساب المستوى
      const userLevel = calculateUserLevel(user)

      // تحديث user_stats
      await client.query(
        'UPDATE user_stats SET level = $1, updated_at = NOW() WHERE user_id = $2',
        [userLevel.level, user.id]
      )
    }

    await client.query('COMMIT')

    // ═══════════════════════════════════════════════════════
    // إرجاع النتيجة
    // ═══════════════════════════════════════════════════════
    const statsResult = await client.query(
      'SELECT * FROM user_stats WHERE user_id = $1',
      [user.id]
    )

    const userLevel = calculateUserLevel(user)

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        level: userLevel.level,
        levelName: userLevel.name
      },
      stats: statsResult.rows[0] || null,
      message: isNewUser ? 'تم إنشاء الحساب بنجاح' : 'تم تحديث بياناتك بنجاح',
      isNewUser
    })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error in POST /api/auth/register:', error)
    
    // معالجة الأخطاء المحددة
    if (error.code === '23505') {
      if (error.constraint === 'users_phone_number_key') {
        return NextResponse.json({
          success: false,
          error: 'رقم الهاتف مستخدم من قبل'
        }, { status: 409 })
      }
      if (error.constraint === 'users_email_key') {
        return NextResponse.json({
          success: false,
          error: 'البريد الإلكتروني مستخدم من قبل'
        }, { status: 409 })
      }
      return NextResponse.json({
        success: false,
        error: 'البيانات مستخدمة من قبل'
      }, { status: 409 })
    }
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في التسجيل/التحديث',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  } finally {
    client.release()
  }
}