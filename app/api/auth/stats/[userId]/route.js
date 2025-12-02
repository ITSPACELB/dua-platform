import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/auth/stats/[userId]
 * جلب إحصائيات المستخدم
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

    // جلب الإحصائيات الأساسية
    const statsResult = await query(`
      SELECT 
        total_prayers_given,
        total_notifications_received,
        interaction_rate,
        total_stars,
        last_prayer_date
      FROM user_stats
      WHERE user_id = $1
    `, [userId])

    if (statsResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'لم يتم العثور على إحصائيات'
      }, { status: 404 })
    }

    const stats = statsResult.rows[0]

    // حساب دعوات هذا الشهر
    const monthPrayersResult = await query(`
      SELECT COUNT(*) as count
      FROM prayers
      WHERE user_id = $1 
      AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `, [userId])

    // حساب عدد من دعوا للمستخدم
    const receivedPrayersResult = await query(`
      SELECT COUNT(DISTINCT p.user_id) as count
      FROM prayer_requests pr
      JOIN prayers p ON pr.id = p.request_id
      WHERE pr.user_id = $1
    `, [userId])

    // حساب الطلبات المستجابة
    const answeredResult = await query(`
      SELECT COUNT(*) as count
      FROM prayer_requests
      WHERE user_id = $1 AND status = 'answered'
    `, [userId])

    // حساب مستوى التوثيق
    const interactionRate = parseInt(stats.interaction_rate) || 0
    let verificationLevel = { name: 'NONE', color: 'stone', icon: '', threshold: 0 }
    
    if (interactionRate >= 98) {
      verificationLevel = { name: 'GOLD', color: 'amber', icon: '👑', threshold: 98 }
    } else if (interactionRate >= 90) {
      verificationLevel = { name: 'GREEN', color: 'emerald', icon: '✓✓', threshold: 90 }
    } else if (interactionRate >= 80) {
      verificationLevel = { name: 'BLUE', color: 'blue', icon: '✓', threshold: 80 }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalPrayersGiven: parseInt(stats.total_prayers_given) || 0,
        totalNotificationsReceived: parseInt(stats.total_notifications_received) || 0,
        interactionRate,
        totalStars: parseInt(stats.total_stars) || 0,
        lastPrayerDate: stats.last_prayer_date,
        prayersThisMonth: parseInt(monthPrayersResult.rows[0].count) || 0,
        prayersReceivedCount: parseInt(receivedPrayersResult.rows[0].count) || 0,
        answeredPrayers: parseInt(answeredResult.rows[0].count) || 0,
        verificationLevel
      }
    })

  } catch (error) {
    console.error('Error in GET /api/auth/stats/[userId]:', error)
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب الإحصائيات'
    }, { status: 500 })
  }
}