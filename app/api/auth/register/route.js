import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================================================
// 📤 POST - تسجيل مستخدم جديد (محسّن)
// ============================================================================
export async function POST(request) {
  try {
    const { 
      fullName, 
      motherName, 
      nickname, 
      city, 
      showFullName, 
      email,
      phoneNumber,
      uniqueQuestion,
      questionAnswer 
    } = await request.json();

    // التحقق من البيانات الأساسية المطلوبة
    if (!fullName || !motherName) {
      return NextResponse.json(
        { error: 'الاسم الكامل واسم الأم مطلوبان' },
        { status: 400 }
      );
    }

    // فحص التفرد - البحث عن مستخدمين بنفس الاسم
    const existingUsers = await query(
      'SELECT id, unique_question FROM users WHERE full_name = $1 AND mother_name = $2',
      [fullName, motherName]
    );

    const isUnique = existingUsers.rows.length === 0;

    // إذا لم يكن فريداً ولا يوجد سؤال سري → رفض
    if (!isUnique && !uniqueQuestion) {
      const existingQuestions = existingUsers.rows
        .map(u => u.unique_question)
        .filter(q => q);

      return NextResponse.json(
        { 
          error: 'المستخدم موجود بالفعل. يرجى اختيار سؤال تمييز.',
          requiresQuestion: true,
          existingQuestions: existingQuestions.length > 0 ? existingQuestions : undefined
        },
        { status: 409 }
      );
    }

    // إذا كان هناك سؤال، تحقق من عدم تكراره
    if (uniqueQuestion && !isUnique) {
      const duplicateQuestion = await query(
        'SELECT id FROM users WHERE full_name = $1 AND mother_name = $2 AND unique_question = $3',
        [fullName, motherName, uniqueQuestion]
      );

      if (duplicateQuestion.rows.length > 0) {
        return NextResponse.json(
          { 
            error: 'هذا السؤال مستخدم بالفعل. يرجى اختيار سؤال آخر.',
            requiresQuestion: true
          },
          { status: 409 }
        );
      }
    }

    // تشفير إجابة السؤال السري (إلزامي الآن)
    let questionAnswerHash = null;
    if (questionAnswer) {
      questionAnswerHash = await bcrypt.hash(questionAnswer.trim().toLowerCase(), 10);
    } else if (!isUnique) {
      // إذا لم يكن فريداً، السؤال والجواب إلزاميان
      return NextResponse.json(
        { 
          error: 'يجب إدخال إجابة السؤال السري',
          requiresQuestion: true
        },
        { status: 400 }
      );
    }

    // التحقق من رقم الهاتف (إن وُجد)
    let phoneVerified = false;
    let phoneBonusApplied = false;
    
    if (phoneNumber) {
      // التحقق من صحة تنسيق رقم الهاتف
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return NextResponse.json(
          { error: 'تنسيق رقم الهاتف غير صحيح' },
          { status: 400 }
        );
      }

      // فحص إذا كان الرقم مستخدماً من قبل
      const phoneCheck = await query(
        'SELECT id FROM users WHERE phone_number = $1',
        [phoneNumber]
      );

      if (phoneCheck.rows.length > 0) {
        return NextResponse.json(
          { error: 'رقم الهاتف مستخدم من قبل' },
          { status: 409 }
        );
      }
    }

    // إدراج المستخدم الجديد
    const result = await query(
      `INSERT INTO users (
        full_name, 
        mother_name, 
        nickname, 
        unique_question, 
        question_answer_hash, 
        city, 
        show_full_name, 
        email,
        phone_number,
        phone_verified,
        phone_bonus_applied,
        created_at, 
        last_login
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING id, full_name, mother_name, nickname, city, show_full_name, email, phone_number, unique_question, created_at`,
      [
        fullName, 
        motherName, 
        nickname || null,
        uniqueQuestion || null,
        questionAnswerHash,
        city || null, 
        showFullName !== false, 
        email || null,
        phoneNumber || null,
        phoneVerified,
        phoneBonusApplied
      ]
    );

    const user = result.rows[0];

    // حساب نقاط المكافأة إذا كان هناك رقم هاتف
    let bonusPoints = 0;
    if (phoneNumber) {
      const bonusSettings = await query(
        `SELECT value FROM platform_settings WHERE key = 'phone_bonus_points'`
      );
      bonusPoints = bonusSettings.rows[0]?.value?.value || 5;
    }

    // إنشاء سجل إحصائيات للمستخدم (مع نقاط المكافأة)
    await query(
      `INSERT INTO user_stats (
        user_id, 
        total_prayers_given, 
        total_notifications_received, 
        interaction_rate
      )
       VALUES ($1, $2, 0, $3)`,
      [
        user.id, 
        bonusPoints, // نقاط المكافأة تُضاف كدعوات
        bonusPoints > 0 ? 100 : 0 // إذا كان هناك مكافأة، معدل التفاعل يبدأ من 100%
      ]
    );

    // تحديث phone_bonus_applied إذا كانت هناك مكافأة
    if (bonusPoints > 0) {
      await query(
        'UPDATE users SET phone_bonus_applied = true WHERE id = $1',
        [user.id]
      );
    }

    // إنشاء JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        fullName: user.full_name,
        motherName: user.mother_name,
        nickname: user.nickname
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // إنشاء اسم العرض
    const displayName = user.nickname 
      ? user.nickname
      : user.show_full_name
        ? `${user.full_name}${user.city ? ` (${user.city})` : ''}`
        : `${user.full_name.split(' ')[0]}...`;

    return NextResponse.json({
      success: true,
      message: bonusPoints > 0 
        ? `مرحباً بك! حصلت على ${bonusPoints} نقاط مكافأة 🎁`
        : 'تم التسجيل بنجاح',
      user: {
        id: user.id,
        fullName: user.full_name,
        motherName: user.mother_name,
        nickname: user.nickname,
        city: user.city,
        displayName,
        email: user.email,
        phoneNumber: user.phone_number,
        showFullName: user.show_full_name,
        uniqueQuestion: user.unique_question,
        createdAt: user.created_at,
        bonusPoints
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    );
  }
}