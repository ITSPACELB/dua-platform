import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/users/profile
 * جلب معلومات الملف الشخصي للمستخدم الحالي
 */
export async function GET(request) {
  const client = await pool.connect();
  
  try {
    // التحقق من التوكن
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'يرجى تسجيل الدخول' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'جلسة منتهية، يرجى تسجيل الدخول مجدداً' },
        { status: 401 }
      );
    }

    // جلب معلومات المستخدم
    const result = await client.query(
      `SELECT 
        id,
        phone_number,
        full_name,
        mother_name,
        father_name,
        email,
        age,
        country,
        created_at,
        verification_level,
        interaction_rate
      FROM users 
      WHERE id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    // تحويل أسماء الأعمدة من snake_case إلى camelCase
    const profile = {
      id: user.id,
      phoneNumber: user.phone_number,
      fullName: user.full_name,
      motherName: user.mother_name,
      fatherName: user.father_name,
      email: user.email,
      age: user.age,
      country: user.country,
      createdAt: user.created_at,
      verificationLevel: user.verification_level,
      interactionRate: user.interaction_rate
    };

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('GET profile error:', error);
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
    // التحقق من التوكن
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'يرجى تسجيل الدخول' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'جلسة منتهية، يرجى تسجيل الدخول مجدداً' },
        { status: 401 }
      );
    }

    // قراءة البيانات من الطلب
    const body = await request.json();
    const { fullName, motherName, fatherName, email, age, country, phoneNumber } = body;

    // ==================== التحققات ====================

    // 1. التحقق من الاسم الكامل (مطلوب)
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

    if (fullName.length > 255) {
      return NextResponse.json(
        { success: false, error: 'الاسم طويل جداً (الحد الأقصى 255 حرف)' },
        { status: 400 }
      );
    }

    // 2. التحقق من اسم الأم (مطلوب)
    if (!motherName || motherName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'اسم الأم مطلوب' },
        { status: 400 }
      );
    }

    if (motherName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'اسم الأم يجب أن يكون حرفين على الأقل' },
        { status: 400 }
      );
    }

    if (motherName.length > 255) {
      return NextResponse.json(
        { success: false, error: 'اسم الأم طويل جداً (الحد الأقصى 255 حرف)' },
        { status: 400 }
      );
    }

    // 3. التحقق من اسم الأب (اختياري)
    if (fatherName && fatherName.length > 255) {
      return NextResponse.json(
        { success: false, error: 'اسم الأب طويل جداً (الحد الأقصى 255 حرف)' },
        { status: 400 }
      );
    }

    // 4. التحقق من البريد الإلكتروني (اختياري)
    let validatedEmail = null;
    if (email && email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: 'صيغة البريد الإلكتروني غير صحيحة' },
          { status: 400 }
        );
      }

      if (email.length > 255) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني طويل جداً' },
          { status: 400 }
        );
      }

      validatedEmail = email.toLowerCase().trim();

      // التحقق من عدم تكرار البريد (إذا تم تغييره)
      const emailCheck = await client.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [validatedEmail, decoded.userId]
      );

      if (emailCheck.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني مستخدم من قبل' },
          { status: 409 }
        );
      }
    }

    // 5. التحقق من رقم الهاتف (اختياري)
    let validatedPhone = null;
    if (phoneNumber && phoneNumber.trim().length > 0) {
      // التحقق من صيغة E.164 (مثال: +966501234567)
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'صيغة رقم الهاتف غير صحيحة. يجب أن يبدأ بـ + متبوعاً برمز الدولة والرقم (مثال: +966501234567)' 
          },
          { status: 400 }
        );
      }

      validatedPhone = phoneNumber.trim();

      // التحقق من عدم تكرار الرقم (إذا تم تغييره)
      const phoneCheck = await client.query(
        'SELECT id FROM users WHERE phone_number = $1 AND id != $2',
        [validatedPhone, decoded.userId]
      );

      if (phoneCheck.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: 'رقم الهاتف مستخدم من قبل' },
          { status: 409 }
        );
      }
    }

    // 6. التحقق من العمر (اختياري)
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

    // 7. التحقق من الدولة (اختياري)
    let validatedCountry = null;
    if (country && country.trim().length > 0) {
      if (country.length > 100) {
        return NextResponse.json(
          { success: false, error: 'اسم الدولة طويل جداً' },
          { status: 400 }
        );
      }
      validatedCountry = country.trim();
    }

    // ==================== تحديث قاعدة البيانات ====================

    const updateResult = await client.query(
      `UPDATE users 
       SET 
         full_name = $1,
         mother_name = $2,
         father_name = $3,
         email = $4,
         age = $5,
         country = $6,
         phone_number = COALESCE($7, phone_number),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING 
         id,
         phone_number,
         full_name,
         mother_name,
         father_name,
         email,
         age,
         country,
         verification_level,
         interaction_rate`,
      [
        fullName.trim(),
        motherName.trim(),
        fatherName?.trim() || null,
        validatedEmail,
        validatedAge,
        validatedCountry,
        validatedPhone,
        decoded.userId
      ]
    );

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'فشل في تحديث البيانات' },
        { status: 500 }
      );
    }

    const updatedUser = updateResult.rows[0];

    // تحويل إلى camelCase
    const profile = {
      id: updatedUser.id,
      phoneNumber: updatedUser.phone_number,
      fullName: updatedUser.full_name,
      motherName: updatedUser.mother_name,
      fatherName: updatedUser.father_name,
      email: updatedUser.email,
      age: updatedUser.age,
      country: updatedUser.country,
      verificationLevel: updatedUser.verification_level,
      interactionRate: updatedUser.interaction_rate
    };

    return NextResponse.json({
      success: true,
      message: 'تم تحديث معلوماتك بنجاح',
      profile
    });

  } catch (error) {
    console.error('PUT profile error:', error);

    // معالجة أخطاء UNIQUE constraints من PostgreSQL
    if (error.code === '23505') { // Unique violation error code
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