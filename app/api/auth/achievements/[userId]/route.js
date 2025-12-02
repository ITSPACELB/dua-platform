import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/auth/achievements/[userId]
 * جلب إنجازات المستخدم النشطة
 */
export async function GET(request, { params }) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'معرّف المستخدم مطلوب'
      }, { status: 400 })
    }

    // جلب الإنجازات النشطة فقط
    const result = await query(`
      SELECT 
        id,
        achievement_type,
        stars_earned,
        achieved_at,
        expires_at,
        is_active
      FROM achievements
      WHERE user_id = $1
      AND expires_at > NOW()
      AND is_active = true
      ORDER BY achieved_at DESC
    `, [userId])

    const achievements = result.rows.map(row => ({
      id: row.id,
      type: row.achievement_type,
      stars: parseInt(row.stars_earned) || 0,
      achievedAt: row.achieved_at,
      expiresAt: row.expires_at,
      daysRemaining: Math.ceil(
        (new Date(row.expires_at) - new Date()) / (1000 * 60 * 60 * 24)
      )
    }))

    // حساب إجمالي النجوم النشطة
    const totalActiveStars = achievements.reduce((sum, a) => sum + a.stars, 0)

    return NextResponse.json({
      success: true,
      achievements,
      totalActiveStars,
      count: achievements.length
    })

  } catch (error) {
    console.error('Error in GET /api/auth/achievements/[userId]:', error)
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب الإنجازات'
    }, { status: 500 })
  }
}