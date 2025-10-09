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

// حساب معدل التفاعل
function calculateInteractionRate(prayersGiven, notificationsReceived) {
  if (notificationsReceived === 0) return 0;
  return Math.round((prayersGiven / notificationsReceived) * 100);
}

// تحديد مستوى التوثيق
function getVerificationLevel(interactionRate) {
  if (interactionRate >= 98) {
    return {
      name: 'GOLD',
      color: 'amber',
      icon: '👑',
      threshold: 98
    };
  } else if (interactionRate >= 90) {
    return {
      name: 'GREEN',
      color: 'emerald',
      icon: '✓✓',
      threshold: 90
    };
  } else if (interactionRate >= 80) {
    return {
      name: 'BLUE',
      color: 'blue',
      icon: '✓',
      threshold: 80
    };
  } else {
    return {
      name: 'NONE',
      color: 'stone',
      icon: '',
      threshold: 0
    };
  }
}

// الميزات المفتوحة حسب المستوى
function getUnlockedFeatures(interactionRate) {
  const features = [];
  
  if (interactionRate >= 80) {
    features.push('priority_display'); // ظهور أولوي في القوائم
    features.push('blue_badge'); // شارة زرقاء
  }
  
  if (interactionRate >= 90) {
    features.push('green_badge'); // شارة خضراء مزدوجة
    features.push('top_priority'); // أولوية عليا
  }
  
  if (interactionRate >= 98) {
    features.push('gold_badge'); // شارة ذهبية
    features.push('max_priority'); // أعلى أولوية
    features.push('special_reactions'); // ردود خاصة
  }
  
  return features;
}

// حساب المستوى القادم
function calculateNextLevel(rate) {
  if (rate < 80) {
    return {
      level: 'BLUE',
      levelName: 'التوثيق الأزرق',
      remaining: 80 - rate,
      icon: '✓',
      color: 'blue'
    };
  }
  if (rate < 90) {
    return {
      level: 'GREEN',
      levelName: 'التوثيق الأخضر',
      remaining: 90 - rate,
      icon: '✓✓',
      color: 'emerald'
    };
  }
  if (rate < 98) {
    return {
      level: 'GOLD',
      levelName: 'التوثيق الذهبي',
      remaining: 98 - rate,
      icon: '👑',
      color: 'amber'
    };
  }
  return {
    level: 'MAX',
    levelName: 'المستوى الأقصى',
    remaining: 0,
    icon: '👑',
    color: 'amber'
  };
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
          answeredPrayers: 0,
          verificationLevel: {
            name: 'NONE',
            color: 'stone',
            icon: '',
            threshold: 0
          },
          unlockedFeatures: [],
          nextLevel: {
            level: 'BLUE',
            levelName: 'التوثيق الأزرق',
            remaining: 80,
            icon: '✓',
            color: 'blue'
          }
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

    // حساب معدل التفاعل والتوثيق
    const interactionRate = calculateInteractionRate(
      parseInt(stats.total_prayers_given),
      parseInt(stats.total_notifications_received)
    );

    const verificationLevel = getVerificationLevel(interactionRate);
    const unlockedFeatures = getUnlockedFeatures(interactionRate);
    const nextLevel = calculateNextLevel(interactionRate);

    return NextResponse.json({
      success: true,
      stats: {
        totalPrayersGiven: parseInt(stats.total_prayers_given),
        totalNotificationsReceived: parseInt(stats.total_notifications_received),
        interactionRate,
        lastPrayerDate: stats.last_prayer_date,
        prayersThisMonth: parseInt(monthPrayersResult.rows[0].count),
        prayersReceivedCount: parseInt(receivedPrayersResult.rows[0].count),
        answeredPrayers: parseInt(answeredResult.rows[0].count),
        verificationLevel: {
          name: verificationLevel.name,
          color: verificationLevel.color,
          icon: verificationLevel.icon,
          threshold: verificationLevel.threshold
        },
        unlockedFeatures,
        nextLevel
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
      `SELECT total_prayers_given, total_notifications_received, interaction_rate 
       FROM user_stats 
       WHERE user_id = $1`,
      [userId]
    );

    const stats = updatedStats.rows[0];
    const interactionRate = calculateInteractionRate(
      parseInt(stats.total_prayers_given),
      parseInt(stats.total_notifications_received)
    );

    const verificationLevel = getVerificationLevel(interactionRate);
    const unlockedFeatures = getUnlockedFeatures(interactionRate);
    const nextLevel = calculateNextLevel(interactionRate);

    return NextResponse.json({
      success: true,
      stats: {
        totalPrayersGiven: parseInt(stats.total_prayers_given),
        interactionRate,
        verificationLevel: {
          name: verificationLevel.name,
          color: verificationLevel.color,
          icon: verificationLevel.icon,
          threshold: verificationLevel.threshold
        },
        unlockedFeatures,
        nextLevel
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