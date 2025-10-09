import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request) {
  try {
    const { 
      fullName, 
      motherName, 
      nickname, 
      city, 
      showFullName, 
      email,
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

    // 1. Check uniqueness (internal check)
    const existingUsers = await query(
      'SELECT id, unique_question FROM users WHERE full_name = $1 AND mother_name = $2',
      [fullName, motherName]
    );

    const isUnique = existingUsers.rows.length === 0;

    // 2. If not unique && no question → return 409 with available questions
    if (!isUnique && !uniqueQuestion) {
      // Get available questions from existing users
      const availableQuestions = existingUsers.rows
        .map(u => u.unique_question)
        .filter(q => q); // Filter out null questions

      return NextResponse.json(
        { 
          error: 'المستخدم موجود بالفعل. يرجى اختيار سؤال تمييز.',
          requiresQuestion: true,
          availableQuestions: availableQuestions.length > 0 ? availableQuestions : undefined
        },
        { status: 409 }
      );
    }

    // If question provided, validate uniqueness of the combination
    if (uniqueQuestion && !isUnique) {
      // Check if same question already exists for this name combination
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

    // 3. Hash question_answer with bcrypt (if provided)
    let questionAnswerHash = null;
    if (questionAnswer) {
      questionAnswerHash = await bcrypt.hash(questionAnswer.trim().toLowerCase(), 10);
    }

    // 4. INSERT INTO users
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
        created_at, 
        last_login
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING id, full_name, mother_name, nickname, city, show_full_name, email, unique_question, created_at`,
      [
        fullName, 
        motherName, 
        nickname || null,
        uniqueQuestion || null,
        questionAnswerHash,
        city || null, 
        showFullName !== false, 
        email || null
      ]
    );

    const user = result.rows[0];

    // إنشاء سجل إحصائيات للمستخدم
    await query(
      `INSERT INTO user_stats (user_id, total_prayers_given, total_notifications_received, interaction_rate)
       VALUES ($1, 0, 0, 0)`,
      [user.id]
    );

    // 5. Generate JWT (30 days)
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

    // إنشاء displayName
    const displayName = user.nickname 
      ? user.nickname
      : user.show_full_name
        ? `${user.full_name}${user.city ? ` (${user.city})` : ''}`
        : `${user.full_name.split(' ')[0]}...`;

    // 6. Return {user, token}
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
        showFullName: user.show_full_name,
        uniqueQuestion: user.unique_question,
        createdAt: user.created_at
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