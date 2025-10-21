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
// 📤 POST - طلب دعاء لمتوفى
// ============================================================================
export async function POST(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { deceasedName, deceasedMotherName, relation } = await request.json();

        if (!deceasedName || !deceasedMotherName) {
            return NextResponse.json(
                { error: 'اسم المتوفى واسم والدته مطلوبان' },
                { status: 400 }
            );
        }

        const limitCheck = await query(
            `SELECT value FROM platform_settings WHERE key = 'request_limits'`
        );
        
        const limits = limitCheck.rows[0]?.value || { deceased_hours: 24 };
        const hoursLimit = limits.deceased_hours;

        const lastRequest = await query(
            `SELECT created_at 
             FROM prayer_requests 
             WHERE user_id = $1 AND type = 'deceased'
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
                    error: 'يجب الانتظار قبل طلب دعاء جديد للمتوفى',
                    canRequest: false,
                    hoursRemaining,
                    nextAllowedAt
                }, { status: 429 });
            }
        }

        const result = await query(
            `INSERT INTO prayer_requests (
                user_id,
                type,
                deceased_name,
                deceased_mother_name,
                relation,
                status,
                created_at,
                expires_at
            ) VALUES ($1, 'deceased', $2, $3, $4, 'active', NOW(), NOW() + INTERVAL '24 hours')
            RETURNING id, created_at, expires_at`,
            [decoded.userId, deceasedName, deceasedMotherName, relation || null]
        );

        const newRequest = result.rows[0];

        return NextResponse.json({
            success: true,
            message: 'تم إرسال طلب الدعاء للمتوفى بنجاح',
            request: {
                id: newRequest.id,
                deceasedName,
                relation,
                createdAt: newRequest.created_at,
                expiresAt: newRequest.expires_at
            }
        });

    } catch (error) {
        console.error('Deceased prayer request error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء إنشاء طلب الدعاء' },
            { status: 500 }
        );
    }
}