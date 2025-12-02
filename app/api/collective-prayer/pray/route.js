import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

// ============================================================================
// 📥 GET - جلب الدعاء الجماعي النشط مع حالة التوقيت
// ============================================================================
export async function GET(request) {
  try {
    const result = await query(
      `SELECT 
        id, 
        content as prayer_text, 
        type as verse_reference, 
        is_active, 
        start_date as scheduled_date, 
        scheduled_datetime,
        duration_minutes,
        final_participant_count,
        ended_at,
        created_at
       FROM collective_prayer
       WHERE is_active = true
       ORDER BY created_at DESC
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'لا يوجد دعاء جماعي نشط حالياً'
      });
    }

    const prayer = result.rows[0];

    // ════════════════════════════════════════════════════════
    // ⏰ فحص حالة التوقيت
    // ════════════════════════════════════════════════════════
    const now = new Date();
    const scheduledTime = prayer.scheduled_datetime ? new Date(prayer.scheduled_datetime) : null;
    const endTime = scheduledTime ? new Date(scheduledTime.getTime() + (prayer.duration_minutes || 30) * 60000) : null;

    let status = 'waiting'; // القيمة الافتراضية
    let timeRemaining = null;
    let timeUntilEnd = null;

    if (!scheduledTime) {
      // إذا لم يكن هناك موعد محدد، الدعاء نشط دائماً
      status = 'active';
    } else if (now < scheduledTime) {
      // قبل الموعد - انتظار
      status = 'waiting';
      timeRemaining = Math.floor((scheduledTime - now) / 1000); // بالثواني
    } else if (now >= scheduledTime && now <= endTime) {
      // وقت الدعاء - نشط
      status = 'active';
      timeUntilEnd = Math.floor((endTime - now) / 1000); // بالثواني
    } else {
      // بعد انتهاء الوقت - منتهي
      status = 'ended';
      
      // حفظ العدد النهائي إذا لم يُحفظ بعد
      if (!prayer.ended_at) {
        const finalCount = await query(
          `SELECT COUNT(DISTINCT user_id) as count 
           FROM collective_prayer_participants 
           WHERE prayer_id = $1`,
          [prayer.id]
        );
        
        const count = parseInt(finalCount.rows[0]?.count) || 0;
        
        await query(
          `UPDATE collective_prayer 
           SET final_participant_count = $1, ended_at = NOW() 
           WHERE id = $2`,
          [count, prayer.id]
        );
        
        prayer.final_participant_count = count;
      }
    }

    // جلب عدد المشاركين الحالي
    const countResult = await query(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM collective_prayer_participants 
       WHERE prayer_id = $1`,
      [prayer.id]
    );

    prayer.participantCount = parseInt(countResult.rows[0]?.count) || 0;
    prayer.status = status;
    prayer.timeRemaining = timeRemaining;
    prayer.timeUntilEnd = timeUntilEnd;

    return NextResponse.json({
      success: true,
      prayer
    });

  } catch (error) {
    console.error('GET collective-prayer error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الدعاء الجماعي' },
      { status: 500 }
    );
  }
}

// ============================================================================
// 🤲 POST - المشاركة في الدعاء الجماعي
// ============================================================================
export async function POST(request) {
  try {
    // ============================================================================
    // 🔐 التحقق من المستخدم (Token أو Fingerprint)
    // ============================================================================
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const body = await request.json();
    const { fingerprint, prayerId } = body;

    let userId = null;

    // محاولة 1: Token
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        console.log('Invalid token, trying fingerprint');
      }
    }

    // محاولة 2: Fingerprint
    if (!userId && fingerprint) {
      const userResult = await query(
        `SELECT id FROM users WHERE device_fingerprint = $1`,
        [fingerprint]
      );

      if (userResult.rows.length === 0) {
        // إنشاء مستخدم جديد
        const newUserResult = await query(
          `INSERT INTO users (device_fingerprint, created_at) 
           VALUES ($1, NOW()) 
           RETURNING id`,
          [fingerprint]
        );
        userId = newUserResult.rows[0].id;

        // إنشاء سجل إحصائيات
        await query(
          `INSERT INTO user_stats (user_id, total_prayers, prayers_today, prayers_week, prayers_month, prayers_year, total_stars, level) 
           VALUES ($1, 0, 0, 0, 0, 0, 0, 0)`,
          [userId]
        );
      } else {
        userId = userResult.rows[0].id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'يجب التسجيل أو السماح بالبصمة' },
        { status: 401 }
      );
    }

    // ============================================================================
    // 📿 التحقق من وجود الدعاء الجماعي
    // ============================================================================
    if (!prayerId) {
      return NextResponse.json(
        { error: 'معرف الدعاء الجماعي مطلوب' },
        { status: 400 }
      );
    }

    const prayerResult = await query(
      `SELECT id, is_active, scheduled_datetime, duration_minutes FROM collective_prayer WHERE id = $1`,
      [prayerId]
    );

    if (prayerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'الدعاء الجماعي غير موجود' },
        { status: 404 }
      );
    }

    if (!prayerResult.rows[0].is_active) {
      return NextResponse.json(
        { error: 'الدعاء الجماعي غير نشط حالياً' },
        { status: 400 }
      );
    }

    // ════════════════════════════════════════════════════════
    // ⏰ التحقق من التوقيت
    // ════════════════════════════════════════════════════════
    const prayer = prayerResult.rows[0];
    const scheduledTime = prayer.scheduled_datetime ? new Date(prayer.scheduled_datetime) : null;
    
    if (scheduledTime) {
      const now = new Date();
      const endTime = new Date(scheduledTime.getTime() + (prayer.duration_minutes || 30) * 60000);
      
      if (now < scheduledTime) {
        return NextResponse.json(
          { error: 'الدعاء لم يبدأ بعد. الرجاء الانتظار حتى الموعد المحدد ⏰' },
          { status: 400 }
        );
      }
      
      if (now > endTime) {
        return NextResponse.json(
          { error: 'انتهى وقت المشاركة في هذا الدعاء الجماعي ✅' },
          { status: 400 }
        );
      }
    }

    // ============================================================================
    // 🚫 التحقق من عدم التكرار
    // ============================================================================
    const existingParticipation = await query(
      `SELECT id FROM collective_prayer_participants 
       WHERE user_id = $1 AND prayer_id = $2`,
      [userId, prayerId]
    );

    if (existingParticipation.rows.length > 0) {
      return NextResponse.json(
        { error: 'لقد شاركت في هذا الدعاء الجماعي من قبل ✅' },
        { status: 400 }
      );
    }

    // ============================================================================
    // 💾 إضافة المشاركة
    // ============================================================================
    await query(
      `INSERT INTO collective_prayer_participants (user_id, prayer_id, created_at)
       VALUES ($1, $2, NOW())`,
      [userId, prayerId]
    );

    // ============================================================================
    // 📊 تحديث إحصائيات المستخدم
    // ============================================================================
    await query(
      `UPDATE user_stats 
       SET 
         total_prayers = total_prayers + 1,
         prayers_today = prayers_today + 1,
         prayers_week = prayers_week + 1,
         prayers_month = prayers_month + 1,
         prayers_year = prayers_year + 1
       WHERE user_id = $1`,
      [userId]
    );

    // ============================================================================
    // 📈 جلب عدد المشاركين المحدث
    // ============================================================================
    const countResult = await query(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM collective_prayer_participants 
       WHERE prayer_id = $1`,
      [prayerId]
    );

    const participantCount = parseInt(countResult.rows[0]?.count) || 0;

    // ============================================================================
    // ✅ رسالة النجاح
    // ============================================================================
    return NextResponse.json({
      success: true,
      message: '🤲 تم تسجيل مشاركتك في الدعاء الجماعي\n\n"وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ"',
      participantCount
    });

  } catch (error) {
    console.error('POST collective-prayer/pray error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء المشاركة في الدعاء الجماعي' },
      { status: 500 }
    );
  }
}