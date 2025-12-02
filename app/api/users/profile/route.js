import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// ════════════════════════════════════════════════════════════
// 📄 API: إدارة الملف الشخصي للمستخدم
// ════════════════════════════════════════════════════════════
// ✅ يعمل مع نظام Fingerprint الحالي
// ✅ بدون تأثير على باقي الملفات
// ✅ معايير احترافية عالية
// ✅ مُصلح: إزالة ::uuid casting
// ════════════════════════════════════════════════════════════

/**
 * GET /api/users/profile
 * جلب معلومات الملف الشخصي للمستخدم الحالي
 */
export async function GET(request) {
  const client = await pool.connect();
  
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'يرجى تسجيل الدخول' },
        { status: 401 }
      );
    }

    const result = await client.query(
      `SELECT 
        id,
        phone_number,
        full_name,
        mother_or_father_name,
        email,
        age,
        country,
        level,
        created_at
      FROM users
      WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    const statsResult = await client.query(
      `SELECT 
        COALESCE(total_prayers, 0) as total_prayers,
        COALESCE(total_stars, 0) as total_stars,
        COALESCE(prayers_today, 0) as prayers_today,
        COALESCE(prayers_week, 0) as prayers_week,
        COALESCE(prayers_month, 0) as prayers_month,
        COALESCE(interaction_rate, 0) as interaction_rate,
        COALESCE(daily_streak, 0) as daily_streak
      FROM user_stats
      WHERE user_id = $1`,
      [userId]
    );

    const stats = statsResult.rows[0] || { 
      total_prayers: 0, 
      total_stars: 0,
      prayers_today: 0,
      prayers_week: 0,
      prayers_month: 0,
      interaction_rate: 0,
      daily_streak: 0
    };

    const profile = {
      id: user.id,
      phoneNumber: user.phone_number,
      fullName: user.full_name,
      motherOrFatherName: user.mother_or_father_name,
      email: user.email,
      age: user.age,
      country: user.country,
      createdAt: user.created_at,
      level: user.level || 1,
      totalPrayers: parseInt(stats.total_prayers) || 0,
      totalStars: parseInt(stats.total_stars) || 0,
      prayersToday: parseInt(stats.prayers_today) || 0,
      prayersWeek: parseInt(stats.prayers_week) || 0,
      prayersMonth: parseInt(stats.prayers_month) || 0,
      interactionRate: parseFloat(stats.interaction_rate) || 0,
      dailyStreak: parseInt(stats.daily_streak) || 0
    };

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('❌ GET profile error:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب البيانات' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * PUT /api/users/profile
 * تحديث معلومات الملف الشخصي
 */
export async function PUT(request) {
  const client = await pool.connect();
  
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'يرجى تسجيل الدخول' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fullName, motherOrFatherName, email, age, country, phoneNumber } = body;

    // التحققات
    if (!fullName || fullName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'الاسم الكامل مطلوب' },
        { status: 400 }
      );
    }

    if (fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'الاسم يجب أن يكون حرفين على الأقل' },
        { status: 400 }
      );
    }

    if (!motherOrFatherName || motherOrFatherName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'اسم الأم أو الأب مطلوب' },
        { status: 400 }
      );
    }

    if (motherOrFatherName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'اسم الأم أو الأب يجب أن يكون حرفين على الأقل' },
        { status: 400 }
      );
    }

    // Email validation
    let validatedEmail = null;
    if (email && email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: 'صيغة البريد الإلكتروني غير صحيحة' },
          { status: 400 }
        );
      }

      validatedEmail = email.toLowerCase().trim();

      const emailCheck = await client.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [validatedEmail, userId]
      );

      if (emailCheck.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني مستخدم من قبل' },
          { status: 409 }
        );
      }
    }

    // Phone validation
    let validatedPhone = null;
    if (phoneNumber && phoneNumber.trim().length > 0) {
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'صيغة رقم الهاتف غير صحيحة. يجب أن يبدأ بـ + متبوعاً برمز الدولة والرقم' 
          },
          { status: 400 }
        );
      }

      validatedPhone = phoneNumber.trim();

      const phoneCheck = await client.query(
        'SELECT id FROM users WHERE phone_number = $1 AND id != $2',
        [validatedPhone, userId]
      );

      if (phoneCheck.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: 'رقم الهاتف مستخدم من قبل' },
          { status: 409 }
        );
      }
    }

    // Age validation
    let validatedAge = null;
    if (age !== undefined && age !== null && age !== '') {
      const ageNum = parseInt(age);
      
      if (isNaN(ageNum)) {
        return NextResponse.json(
          { success: false, error: 'العمر يجب أن يكون رقماً' },
          { status: 400 }
        );
      }

      if (ageNum < 1 || ageNum > 120) {
        return NextResponse.json(
          { success: false, error: 'العمر يجب أن يكون بين 1 و 120' },
          { status: 400 }
        );
      }

      validatedAge = ageNum;
    }

    // Country validation
    let validatedCountry = null;
    if (country && country.trim().length > 0) {
      validatedCountry = country.trim();
    }

    // التحديث
    const updateResult = await client.query(
      `UPDATE users 
       SET 
         full_name = $1,
         mother_or_father_name = $2,
         email = $3,
         age = $4,
         country = $5,
         phone_number = $6,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING 
         id,
         phone_number,
         full_name,
         mother_or_father_name,
         email,
         age,
         country,
         level,
         created_at`,
      [
        fullName.trim(),
        motherOrFatherName.trim(),
        validatedEmail,
        validatedAge,
        validatedCountry,
        validatedPhone,
        userId
      ]
    );

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'فشل في تحديث البيانات' },
        { status: 500 }
      );
    }

    const updatedUser = updateResult.rows[0];

    const statsResult = await client.query(
      `SELECT 
        COALESCE(total_prayers, 0) as total_prayers,
        COALESCE(total_stars, 0) as total_stars,
        COALESCE(prayers_today, 0) as prayers_today,
        COALESCE(prayers_week, 0) as prayers_week,
        COALESCE(prayers_month, 0) as prayers_month,
        COALESCE(interaction_rate, 0) as interaction_rate,
        COALESCE(daily_streak, 0) as daily_streak
      FROM user_stats
      WHERE user_id = $1`,
      [userId]
    );

    const stats = statsResult.rows[0] || { 
      total_prayers: 0, 
      total_stars: 0,
      prayers_today: 0,
      prayers_week: 0,
      prayers_month: 0,
      interaction_rate: 0,
      daily_streak: 0
    };

    const profile = {
      id: updatedUser.id,
      phoneNumber: updatedUser.phone_number,
      fullName: updatedUser.full_name,
      motherOrFatherName: updatedUser.mother_or_father_name,
      email: updatedUser.email,
      age: updatedUser.age,
      country: updatedUser.country,
      createdAt: updatedUser.created_at,
      level: updatedUser.level || 1,
      totalPrayers: parseInt(stats.total_prayers) || 0,
      totalStars: parseInt(stats.total_stars) || 0,
      prayersToday: parseInt(stats.prayers_today) || 0,
      prayersWeek: parseInt(stats.prayers_week) || 0,
      prayersMonth: parseInt(stats.prayers_month) || 0,
      interactionRate: parseFloat(stats.interaction_rate) || 0,
      dailyStreak: parseInt(stats.daily_streak) || 0
    };

    return NextResponse.json({
      success: true,
      message: 'تم تحديث معلوماتك بنجاح',
      profile
    });

  } catch (error) {
    console.error('❌ PUT profile error:', error);

    if (error.code === '23505') {
      if (error.constraint === 'users_email_key') {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني مستخدم من قبل' },
          { status: 409 }
        );
      }
      if (error.constraint === 'users_phone_number_key') {
        return NextResponse.json(
          { success: false, error: 'رقم الهاتف مستخدم من قبل' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'هذه البيانات مستخدمة من قبل' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث البيانات' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}