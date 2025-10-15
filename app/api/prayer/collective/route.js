import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// ════════════════════════════════════════════════════════════
// 📥 GET - جلب معلومات الملف الشخصي
// ════════════════════════════════════════════════════════════
export async function GET(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // ═══════════════════════════════════════════════════════
        // 📊 جلب بيانات المستخدم
        // ═══════════════════════════════════════════════════════
        const result = await query(
            `SELECT 
                id,
                full_name,
                mother_name,
                father_name,
                email,
                age,
                country,
                phone,
                profile_updated_at
             FROM users 
             WHERE id = $1`,
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'المستخدم غير موجود' },
                { status: 404 }
            );
        }

        const profile = result.rows[0];

        return NextResponse.json({
            success: true,
            profile: {
                full_name: profile.full_name,
                mother_name: profile.mother_name,
                father_name: profile.father_name,
                email: profile.email,
                age: profile.age,
                country: profile.country,
                phone: profile.phone,
                profile_updated_at: profile.profile_updated_at
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب الملف الشخصي' },
            { status: 500 }
        );
    }
}

// ════════════════════════════════════════════════════════════
// 📤 PUT - تحديث معلومات الملف الشخصي
// ════════════════════════════════════════════════════════════
export async function PUT(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { 
            fullName, 
            motherName, 
            fatherName, 
            email, 
            age, 
            country, 
            phone 
        } = await request.json();

        // ═══════════════════════════════════════════════════════
        // ✅ التحقق من الحقول الإلزامية
        // ═══════════════════════════════════════════════════════
        if (!fullName || !fullName.trim()) {
            return NextResponse.json(
                { error: 'الاسم الكامل مطلوب' },
                { status: 400 }
            );
        }

        if (!motherName || !motherName.trim()) {
            return NextResponse.json(
                { error: 'اسم الأم مطلوب' },
                { status: 400 }
            );
        }

        // ═══════════════════════════════════════════════════════
        // 📧 التحقق من البريد الإلكتروني (إذا تم إدخاله)
        // ═══════════════════════════════════════════════════════
        if (email && email.trim()) {
            // فحص إذا كان البريد مستخدم من قبل مستخدم آخر
            const emailCheck = await query(
                `SELECT id FROM users 
                 WHERE email = $1 AND id != $2`,
                [email.trim(), decoded.userId]
            );

            if (emailCheck.rows.length > 0) {
                return NextResponse.json(
                    { error: 'البريد الإلكتروني مستخدم من قبل' },
                    { status: 400 }
                );
            }

            // التحقق من صحة صيغة البريد
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return NextResponse.json(
                    { error: 'صيغة البريد الإلكتروني غير صحيحة' },
                    { status: 400 }
                );
            }
        }

        // ═══════════════════════════════════════════════════════
        // 📱 التحقق من رقم الهاتف (إذا تم إدخاله)
        // ═══════════════════════════════════════════════════════
        if (phone && phone.trim()) {
            // فحص إذا كان الرقم مستخدم من قبل مستخدم آخر
            const phoneCheck = await query(
                `SELECT id FROM users 
                 WHERE phone = $1 AND id != $2`,
                [phone.trim(), decoded.userId]
            );

            if (phoneCheck.rows.length > 0) {
                return NextResponse.json(
                    { error: 'رقم الهاتف مستخدم من قبل' },
                    { status: 400 }
                );
            }

            // التحقق من صيغة الرقم (E.164 format)
            const phoneRegex = /^\+[1-9]\d{9,14}$/;
            if (!phoneRegex.test(phone.trim())) {
                return NextResponse.json(
                    { error: 'رقم الهاتف يجب أن يبدأ بـ + ورمز الدولة (مثال: +966501234567)' },
                    { status: 400 }
                );
            }
        }

        // ═══════════════════════════════════════════════════════
        // 🔢 التحقق من العمر (إذا تم إدخاله)
        // ═══════════════════════════════════════════════════════
        if (age !== null && age !== undefined && age !== '') {
            const ageNum = parseInt(age);
            if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
                return NextResponse.json(
                    { error: 'العمر يجب أن يكون بين 1 و 120' },
                    { status: 400 }
                );
            }
        }

        // ═══════════════════════════════════════════════════════
        // 💾 تحديث البيانات
        // ═══════════════════════════════════════════════════════
        const result = await query(
            `UPDATE users 
             SET 
                full_name = $1,
                mother_name = $2,
                father_name = $3,
                email = $4,
                age = $5,
                country = $6,
                phone = $7
             WHERE id = $8
             RETURNING 
                id, 
                full_name, 
                mother_name, 
                father_name, 
                email, 
                age, 
                country, 
                phone,
                profile_updated_at`,
            [
                fullName.trim(),
                motherName.trim(),
                fatherName?.trim() || null,
                email?.trim() || null,
                age ? parseInt(age) : null,
                country || null,
                phone?.trim() || null,
                decoded.userId
            ]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'فشل في تحديث الملف الشخصي' },
                { status: 500 }
            );
        }

        const updatedProfile = result.rows[0];

        return NextResponse.json({
            success: true,
            message: 'تم تحديث ملفك الشخصي بنجاح',
            profile: {
                full_name: updatedProfile.full_name,
                mother_name: updatedProfile.mother_name,
                father_name: updatedProfile.father_name,
                email: updatedProfile.email,
                age: updatedProfile.age,
                country: updatedProfile.country,
                phone: updatedProfile.phone,
                profile_updated_at: updatedProfile.profile_updated_at
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        
        // معالجة أخطاء قاعدة البيانات
        if (error.code === '23505') { // UNIQUE violation
            if (error.constraint === 'unique_email') {
                return NextResponse.json(
                    { error: 'البريد الإلكتروني مستخدم من قبل' },
                    { status: 400 }
                );
            } else if (error.constraint === 'unique_phone') {
                return NextResponse.json(
                    { error: 'رقم الهاتف مستخدم من قبل' },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { error: 'حدث خطأ أثناء تحديث الملف الشخصي' },
            { status: 500 }
        );
    }
}