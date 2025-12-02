import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

// ════════════════════════════════════════════════════════════
// 🔐 API تسجيل دخول الأدمن - نظام بسيط وآمن
// ════════════════════════════════════════════════════════════

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // التحقق من البيانات
    if (!username || !password) {
      return Response.json(
        { success: false, error: 'الرجاء إدخال اسم المستخدم وكلمة المرور' },
        { status: 400 }
      );
    }

    // البحث عن المستخدم في قاعدة البيانات
    const result = await query(
      `SELECT id, email, role, password_hash 
       FROM admin_users 
       WHERE email = $1 
       AND (role = 'admin' OR role = 'super_admin')
       AND is_active = true`,
      [username]
    );

    // التحقق من وجود المستخدم
    if (result.rows.length === 0) {
      return Response.json(
        { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return Response.json(
        { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // إنشاء token بسيط (يمكن استبداله بـ JWT لاحقاً)
    const token = `admin-${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // حفظ الـ token في قاعدة البيانات (اختياري)
    await query(
      `UPDATE admin_users SET last_login = NOW() WHERE id = $1`,
      [user.id]
    );

    // إرجاع البيانات
    return Response.json({
      success: true,
      token: token,
      role: user.role,
      user: {
        id: user.id,
        name: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json(
      { success: false, error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}