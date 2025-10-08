import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request) {
  try {
    const { fullName, motherName } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!fullName || !motherName) {
      return NextResponse.json(
        { error: 'الاسم الكامل واسم الأم مطلوبان' },
        { status: 400 }
      );
    }

    // البحث عن المستخدم
    const result = await query(
      `SELECT id, full_name, mother_name, city, show_full_name, email, created_at 
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

    const user = result.rows[0];

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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}