import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request) {
  try {
    const { fullName, motherName, city, showFullName, email } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!fullName || !motherName) {
      return NextResponse.json(
        { error: 'الاسم الكامل واسم الأم مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من وجود المستخدم
    const existingUser = await query(
      'SELECT id FROM users WHERE full_name = $1 AND mother_name = $2',
      [fullName, motherName]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'المستخدم موجود بالفعل. استخدم تسجيل الدخول.' },
        { status: 409 }
      );
    }

    // إنشاء المستخدم
    const result = await query(
      `INSERT INTO users (full_name, mother_name, city, show_full_name, email, created_at, last_login)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, full_name, mother_name, city, show_full_name, email, created_at`,
      [fullName, motherName, city || null, showFullName !== false, email || null]
    );

    const user = result.rows[0];

    // إنشاء سجل إحصائيات للمستخدم
    await query(
      `INSERT INTO user_stats (user_id, total_prayers_given, total_notifications_received, interaction_rate)
       VALUES ($1, 0, 0, 0)`,
      [user.id]
    );

    // إنشاء JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        fullName: user.full_name,
        motherName: user.mother_name 
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // إنشاء displayName
    const displayName = user.show_full_name
      ? `${user.full_name}${user.city ? ` (${user.city})` : ''}`
      : `${user.full_name.split(' ')[0]}...`;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        motherName: user.mother_name,
        city: user.city,
        displayName,
        email: user.email,
        showFullName: user.show_full_name,
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