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
// 📤 POST - حفظ دعاء لطلب معين
// ============================================================================
export async function POST(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { requestId } = await request.json();

        if (!requestId) {
            return NextResponse.json(
                { error: 'معرّف الطلب مطلوب' },
                { status: 400 }
            );
        }

        // فحص إذا كان الطلب موجود ونشط
        const requestCheck = await query(
            `SELECT id, requester_id, status 
             FROM prayer_requests 
             WHERE id = $1`,
            [requestId]
        );

        if (requestCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'الطلب غير موجود' },
                { status: 404 }
            );
        }

        const prayerRequest = requestCheck.rows[0];

        if (prayerRequest.status !== 'active') {
            return NextResponse.json(
                { error: 'هذا الطلب لم يعد نشطاً' },
                { status: 400 }
            );
        }

        // منع المستخدم من الدعاء لنفسه
        if (prayerRequest.requester_id === decoded.userId) {
            return NextResponse.json(
                { error: 'لا يمكنك الدعاء لطلبك الخاص' },
                { status: 400 }
            );
        }

        // محاولة حفظ الدعاء (UNIQUE constraint يمنع التكرار)
        try {
            await query(
                `INSERT INTO prayers (request_id, user_id, prayed_at)
                 VALUES ($1, $2, NOW())`,
                [requestId, decoded.userId]
            );

            // الحصول على الإحصائيات المحدثة
            const statsResult = await query(
                `SELECT 
                    total_prayers_given,
                    total_notifications_received,
                    interaction_rate
                 FROM user_stats 
                 WHERE user_id = $1`,
                [decoded.userId]
            );

            const stats = statsResult.rows[0];

            // حساب مستوى التوثيق
            const interactionRate = stats?.interaction_rate || 0;
            let verificationLevel = { name: 'NONE', color: 'stone', icon: '', threshold: 0 };
            
            if (interactionRate >= 98) {
                verificationLevel = { name: 'GOLD', color: 'amber', icon: '👑', threshold: 98 };
            } else if (interactionRate >= 90) {
                verificationLevel = { name: 'GREEN', color: 'emerald', icon: '✓✓', threshold: 90 };
            } else if (interactionRate >= 80) {
                verificationLevel = { name: 'BLUE', color: 'blue', icon: '✓', threshold: 80 };
            }

            return NextResponse.json({
                success: true,
                message: 'جزاك الله خيراً',
                stats: {
                    totalPrayersGiven: stats?.total_prayers_given || 0,
                    interactionRate,
                    verificationLevel
                }
            });

        } catch (error) {
            if (error.code === '23505') { // UNIQUE constraint violation
                return NextResponse.json(
                    { error: 'لقد دعوت لهذا الطلب من قبل' },
                    { status: 400 }
                );
            }
            throw error;
        }

    } catch (error) {
        console.error('Prayer save error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء حفظ الدعاء' },
            { status: 500 }
        );
    }
}