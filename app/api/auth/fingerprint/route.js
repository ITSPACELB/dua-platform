import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * POST /api/auth/fingerprint
 * الحصول على المستخدم بواسطة البصمة
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
      WHERE u.device_fingerprint = $1
      LIMIT 1
    `, [fingerprint])

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        user: null,
        message: 'لم يتم العثور على مستخدم'
      })
    }

    return NextResponse.json({
      success: true,
      user: result.rows[0]
    })

  } catch (error) {
    console.error('Error in POST /api/auth/fingerprint:', error)
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في البحث'
    }, { status: 500 })
  }
}