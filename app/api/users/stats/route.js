import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// دالة للتحقق من الـ token
function verifyToken(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// GET - جلب إحصائيات المستخدم
export async function GET(request) {
  try {
    // التحقق من الـ token
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'غير مصرح. الرجاء تسجيل الدخول.' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // جلب إحصائيات المستخدم
    const statsResult = await query(
      `SELECT 
        total_prayers_given,
        total_notifications_received,
        interaction_rate,
        last_prayer_date
       FROM user_stats 
       WHERE user_id = $1`,
      [userId]
    );

    if (statsResult.rows.length === 0) {
      // إنشاء سجل إحصائيات إذا لم يكن موجوداً
      await query(
        `INSERT INTO user_stats (user_id, total_prayers_given, total_notifications_received, interaction_rate)
         VALUES ($1, 0, 0, 0)`,
        [userId]
      );
      
      return NextResponse.json({
        success: true,
        stats: {
          totalPrayersGiven: 0,
          totalNotificationsReceived: 0,
          interactionRate: 0,
          lastPrayerDate: null,
          prayersThisMonth: 0,
          prayersReceivedCount: 0,
          answeredPrayers: 0
        }
      });
    }

    const stats = statsResult.rows[0];

    // حساب دعوات هذا الشهر
    const monthPrayersResult = await query(
      `SELECT COUNT(*) as count
       FROM prayers
       WHERE user_id = $1 
       AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );

    // حساب عدد من دعوا للمستخدم
    const receivedPrayersResult = await query(
      `SELECT COUNT(DISTINCT pr.user_id) as count
       FROM prayer_requests pr
       JOIN prayers p ON pr.id = p.request_id
       WHERE pr.requester_id = $1`,
      [userId]
    );

    // حساب الطلبات المستجابة
    const answeredResult = await query(
      `SELECT COUNT(*) as count
       FROM prayer_requests
       WHERE requester_id = $1 AND status = 'answered'`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalPrayersGiven: parseInt(stats.total_prayers_given),
        totalNotificationsReceived: parseInt(stats.total_notifications_received),
        interactionRate: parseFloat(stats.interaction_rate),
        lastPrayerDate: stats.last_prayer_date,
        prayersThisMonth: parseInt(monthPrayersResult.rows[0].count),
        prayersReceivedCount: parseInt(receivedPrayersResult.rows[0].count),
        answeredPrayers: parseInt(answeredResult.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الإحصائيات' },
      { status: 500 }
    );
  }
}

// POST - تحديث إحصائيات المستخدم (عند القيام بدعاء جديد)
export async function POST(request) {
  try {
    // التحقق من الـ token
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'غير مصرح. الرجاء تسجيل الدخول.' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // تحديث العداد
    await query(
      `UPDATE user_stats 
       SET 
         total_prayers_given = total_prayers_given + 1,
         last_prayer_date = NOW(),
         interaction_rate = CASE 
           WHEN total_notifications_received > 0 
           THEN (total_prayers_given + 1)::float / total_notifications_received * 100
           ELSE 0
         END
       WHERE user_id = $1`,
      [userId]
    );

    // جلب الإحصائيات المحدثة
    const updatedStats = await query(
      `SELECT total_prayers_given, interaction_rate 
       FROM user_stats 
       WHERE user_id = $1`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalPrayersGiven: parseInt(updatedStats.rows[0].total_prayers_given),
        interactionRate: parseFloat(updatedStats.rows[0].interaction_rate)
      }
    });

  } catch (error) {
    console.error('Stats update error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الإحصائيات' },
      { status: 500 }
    );
  }
}