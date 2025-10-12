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
// 📤 POST - طلب دعاء لمريض (مع خيار إخفاء الاسم)
// ============================================================================
export async function POST(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { 
            sickPersonName, 
            sickPersonMotherName, 
            isNamePrivate = false 
        } = await request.json();

        // التحقق من البيانات: إذا لم يكن الاسم خاصاً، يجب إدخال الاسم
        if (!isNamePrivate && (!sickPersonName || !sickPersonMotherName)) {
            return NextResponse.json(
                { error: 'اسم المريض واسم والدته مطلوبان، أو اختر "اسم خاص"' },
                { status: 400 }
            );
        }

        // فحص الحد الزمني (6 ساعات)
        const limitCheck = await query(
            `SELECT value FROM platform_settings WHERE key = 'request_limits'`
        );
        
        const limits = limitCheck.rows[0]?.value || { sick_hours: 6 };
        const hoursLimit = limits.sick_hours;

        const lastRequest = await query(
            `SELECT created_at 
             FROM prayer_requests 
             WHERE user_id = $1 AND type = 'sick'
             ORDER BY created_at DESC 
             LIMIT 1`,
            [decoded.userId]
        );

        if (lastRequest.rows.length > 0) {
            const lastRequestTime = new Date(lastRequest.rows[0].created_at);
            const now = new Date();
            const hoursPassed = (now - lastRequestTime) / (1000 * 60 * 60);

            if (hoursPassed < hoursLimit) {
                const hoursRemaining = Math.ceil(hoursLimit - hoursPassed);
                const nextAllowedAt = new Date(lastRequestTime.getTime() + (hoursLimit * 60 * 60 * 1000));
                
                return NextResponse.json({
                    error: 'يجب الانتظار قبل طلب دعاء جديد للمريض',
                    canRequest: false,
                    hoursRemaining,
                    nextAllowedAt
                }, { status: 429 });
            }
        }

        // إنشاء طلب الدعاء للمريض
        const result = await query(
            `INSERT INTO prayer_requests (
                user_id,
                type,
                is_name_private,
                sick_name,
                sick_mother_name,
                status,
                created_at,
                expires_at
            ) VALUES ($1, 'sick', $2, $3, $4, 'active', NOW(), NOW() + INTERVAL '24 hours')
            RETURNING id, created_at, expires_at`,
            [
                decoded.userId, 
                isNamePrivate,
                isNamePrivate ? null : sickPersonName, 
                isNamePrivate ? null : sickPersonMotherName
            ]
        );

        const newRequest = result.rows[0];

        return NextResponse.json({
            success: true,
            message: 'تم إرسال طلب الدعاء للمريض بنجاح',
            request: {
                id: newRequest.id,
                isNamePrivate,
                sickPersonName: isNamePrivate ? 'مريض (اسم خاص)' : sickPersonName,
                createdAt: newRequest.created_at,
                expiresAt: newRequest.expires_at
            }
        });

    } catch (error) {
        console.error('Sick prayer request error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء إنشاء طلب الدعاء' },
            { status: 500 }
        );
    }
}