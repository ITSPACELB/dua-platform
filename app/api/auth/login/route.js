import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================================================
// 📤 POST - تسجيل الدخول (محسّن مع التحقق من السؤال السري)
// ============================================================================
export async function POST(request) {
  try {
    const { 
      fullName, 
      motherName, 
      uniqueQuestion, 
      questionAnswer 
    } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!fullName || !motherName) {
      return NextResponse.json(
        { error: 'الاسم الكامل واسم الأم مطلوبان' },
        { status: 400 }
      );
    }

    // البحث عن المستخدمين بهذا الاسم
    const result = await query(
      `SELECT 
        id, 
        full_name, 
        mother_name, 
        city, 
        show_full_name, 
        email, 
        nickname,
        phone_number,
        unique_question,
        question_answer_hash,
        created_at 
       FROM users 
       WHERE full_name = $1 AND mother_name = $2`,
      [fullName, motherName]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود. الرجاء التسجيل أولاً.' },
        { status: 404 }
      );
    }

    // إذا كان هناك أكثر من مستخدم → يجب السؤال السري
    if (result.rows.length > 1 && !uniqueQuestion) {
      const availableQuestions = result.rows
        .map(u => u.unique_question)
        .filter(q => q);

      return NextResponse.json({
        requiresQuestion: true,
        availableQuestions,
        message: 'يوجد أكثر من مستخدم بهذا الاسم. اختر سؤالك السري.'
      }, { status: 200 });
    }

    // إذا كان هناك مستخدم واحد ولديه سؤال سري → يجب الإجابة
    if (result.rows.length === 1 && result.rows[0].unique_question && !questionAnswer) {
      return NextResponse.json({
        requiresQuestion: true,
        question: result.rows[0].unique_question,
        message: 'يرجى الإجابة على سؤالك السري'
      }, { status: 200 });
    }

    // إيجاد المستخدم الصحيح
    let user = null;

    if (uniqueQuestion && questionAnswer) {
      // البحث بالسؤال
      const userWithQuestion = result.rows.find(u => u.unique_question === uniqueQuestion);
      
      if (!userWithQuestion) {
        return NextResponse.json(
          { error: 'السؤال السري غير صحيح' },
          { status: 401 }
        );
      }

      // التحقق من الإجابة
      const isAnswerCorrect = await bcrypt.compare(
        questionAnswer.trim().toLowerCase(),
        userWithQuestion.question_answer_hash
      );

      if (!isAnswerCorrect) {
        return NextResponse.json(
          { error: 'إجابة السؤال السري غير صحيحة' },
          { status: 401 }
        );
      }

      user = userWithQuestion;
    } else {
      // مستخدم واحد فقط بدون سؤال
      user = result.rows[0];
    }

    // تحديث آخر تسجيل دخول
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

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
        createdAt: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}