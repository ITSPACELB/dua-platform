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

// ============================================================================
// 📤 POST - إضافة/تحديث رقم الهاتف (مع مكافأة)
// ============================================================================
export async function POST(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { phoneNumber } = await request.json();

        if (!phoneNumber) {
            return NextResponse.json(
                { error: 'رقم الهاتف مطلوب' },
                { status: 400 }
            );
        }

        // التحقق من صحة تنسيق الرقم
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return NextResponse.json(
                { error: 'تنسيق رقم الهاتف غير صحيح' },
                { status: 400 }
            );
        }

        // فحص إذا كان الرقم مستخدماً
        const phoneCheck = await query(
            'SELECT id FROM users WHERE phone_number = $1 AND id != $2',
            [phoneNumber, decoded.userId]
        );

        if (phoneCheck.rows.length > 0) {
            return NextResponse.json(
                { error: 'رقم الهاتف مستخدم من قبل' },
                { status: 409 }
            );
        }

        // فحص إذا كان المستخدم حصل على المكافأة من قبل
        const userCheck = await query(
            'SELECT phone_bonus_applied FROM users WHERE id = $1',
            [decoded.userId]
        );

        const alreadyHasBonus = userCheck.rows[0]?.phone_bonus_applied || false;

        // تحديث رقم الهاتف
        await query(
            `UPDATE users 
             SET phone_number = $1, 
                 phone_verified = true,
                 phone_bonus_applied = CASE WHEN phone_bonus_applied = false THEN true ELSE phone_bonus_applied END
             WHERE id = $2`,
            [phoneNumber, decoded.userId]
        );

        // إضافة نقاط المكافأة إذا لم يحصل عليها من قبل
        let bonusPoints = 0;
        if (!alreadyHasBonus) {
            const bonusSettings = await query(
                `SELECT value FROM platform_settings WHERE key = 'phone_bonus_points'`
            );
            bonusPoints = bonusSettings.rows[0]?.value?.value || 5;

            // إضافة النقاط
            await query(
                `UPDATE user_stats 
                 SET 
                    total_prayers_given = total_prayers_given + $1,
                    interaction_rate = CASE 
                        WHEN total_notifications_received > 0 
                        THEN ((total_prayers_given + $1)::float / total_notifications_received * 100)
                        ELSE 100
                    END
                 WHERE user_id = $2`,
                [bonusPoints, decoded.userId]
            );
        }

        return NextResponse.json({
            success: true,
            message: alreadyHasBonus 
                ? 'تم تحديث رقم الهاتف بنجاح'
                : `تم تحديث رقم الهاتف! حصلت على ${bonusPoints} نقاط مكافأة 🎁`,
            phoneNumber,
            bonusPoints: alreadyHasBonus ? 0 : bonusPoints
        });

    } catch (error) {
        console.error('Phone verification error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء التحقق من الهاتف' },
            { status: 500 }
        );
    }
}

// ============================================================================
// 📥 GET - التحقق من حالة رقم الهاتف
// ============================================================================
export async function GET(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const result = await query(
            `SELECT phone_number, phone_verified, phone_bonus_applied 
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

        const user = result.rows[0];

        return NextResponse.json({
            hasPhone: !!user.phone_number,
            phoneNumber: user.phone_number,
            isVerified: user.phone_verified,
            hasBonusApplied: user.phone_bonus_applied
        });

    } catch (error) {
        console.error('Get phone status error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ' },
            { status: 500 }
        );
    }
}