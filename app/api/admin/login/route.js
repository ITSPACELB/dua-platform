import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================================================
// 🔐 POST - تسجيل دخول المسؤول
// ============================================================================
export async function POST(request) {
    try {
        const { email, password } = await request.json();

        // التحقق من البيانات المطلوبة
        if (!email || !password) {
            return NextResponse.json(
                { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
                { status: 400 }
            );
        }

        // البحث عن المسؤول في قاعدة البيانات
        const adminResult = await query(
            `SELECT 
                au.id,
                au.user_id,
                au.email,
                au.password_hash,
                au.role,
                u.full_name
             FROM admin_users au
             LEFT JOIN users u ON au.user_id = u.id
             WHERE au.email = $1 AND au.is_active = true`,
            [email.toLowerCase().trim()]
        );

        // التحقق من وجود المسؤول
        if (adminResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
                { status: 401 }
            );
        }

        const admin = adminResult.rows[0];

        // التحقق من كلمة المرور
        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
        
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
                { status: 401 }
            );
        }

        // إنشاء JWT token
        const token = jwt.sign(
            {
                userId: admin.user_id,
                adminId: admin.id,
                email: admin.email,
                role: admin.role
            },
            JWT_SECRET,
            { expiresIn: '7d' } // صالح لمدة 7 أيام
        );

        // تحديث آخر دخول
        await query(
            'UPDATE admin_users SET last_login = NOW() WHERE id = $1',
            [admin.id]
        );

        // إرجاع النتيجة
        return NextResponse.json({
            success: true,
            token,
            role: admin.role,
            userId: admin.user_id,
            email: admin.email,
            displayName: admin.full_name || 'المسؤول'
        });

    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء تسجيل الدخول' },
            { status: 500 }
        );
    }
}