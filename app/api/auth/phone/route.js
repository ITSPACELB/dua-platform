import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * POST /api/auth/phone
 * الحصول على المستخدم بواسطة رقم الهاتف
 */
export async function POST(request) {
  try {
    const { phone_number, full_name, mother_or_father_name } = await request.json()
    
    if (!phone_number || !full_name) {
      return NextResponse.json({
        success: false,
        error: 'رقم الهاتف والاسم مطلوبان'
      }, { status: 400 })
    }

    // البحث عن المستخدم
    const result = await query(`
      SELECT 
        u.*,
        us.total_prayers,
        us.prayers_today,
        us.prayers_week,
        us.prayers_month,
        us.total_stars,
        us.level
      FROM users u
      LEFT JOIN user_stats us ON u.id = us.user_id
      WHERE 
        u.phone_number = $1 
        AND u.full_name = $2
        ${mother_or_father_name ? 'AND u.mother_or_father_name = $3' : ''}
      LIMIT 1
    `, mother_or_father_name 
      ? [phone_number, full_name, mother_or_father_name]
      : [phone_number, full_name]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        user: null,
        message: 'لم يتم العثور على مستخدم بهذه البيانات'
      })
    }

    return NextResponse.json({
      success: true,
      user: result.rows[0]
    })

  } catch (error) {
    console.error('Error in POST /api/auth/phone:', error)
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في البحث'
    }, { status: 500 })
  }
}