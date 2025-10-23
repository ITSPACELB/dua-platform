import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { calculateUserLevel } from '@/lib/levelsSystem'

/**
 * POST /api/auth/upgrade
 * ترقية/تحديث بيانات مستخدم موجود
 */
export async function POST(request) {
  try {
    const data = await request.json()
    const { fingerprint } = data

    if (!fingerprint) {
      return NextResponse.json({
        success: false,
        error: 'البصمة مطلوبة'
      }, { status: 400 })
    }

    // البحث عن المستخدم
    const userResult = await query(`
      SELECT * FROM users WHERE device_fingerprint = $1 LIMIT 1
    `, [fingerprint])

    if (userResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'المستخدم غير موجود'
      }, { status: 404 })
    }

    // تحديث البيانات
    const updateFields = []
    const updateValues = []
    let valueIndex = 1

    const fieldsToUpdate = [
      'full_name',
      'mother_or_father_name',
      'is_mother_name',
      'phone_number',
      'country_code',
      'email',
      'country',
      'age',
      'gender'
    ]

    fieldsToUpdate.forEach(field => {
      if (data[field] !== undefined) {
        updateFields.push(`${field} = $${valueIndex}`)
        updateValues.push(data[field])
        valueIndex++
      }
    })

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'لا توجد بيانات للتحديث'
      }, { status: 400 })
    }

    // تحديث المستخدم
    updateValues.push(fingerprint)
    const result = await query(`
      UPDATE users
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE device_fingerprint = $${valueIndex}
      RETURNING *
    `, updateValues)

    const updatedUser = result.rows[0]

    // تحديث المستوى في user_stats
    const newLevel = calculateUserLevel(updatedUser).level
    await query(`
      UPDATE user_stats
      SET level = $1, updated_at = NOW()
      WHERE user_id = $2
    `, [newLevel, updatedUser.id])

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'تم تحديث البيانات بنجاح'
    })

  } catch (error) {
    console.error('Error in POST /api/auth/upgrade:', error)
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في التحديث'
    }, { status: 500 })
  }
}