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
// 📤 POST - دعاء خاص (للمستخدمين الموثقين 98%+)
// ============================================================================
export async function POST(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { receiverId, message } = await request.json();

        // التحقق من البيانات المطلوبة
        if (!receiverId || !message) {
            return NextResponse.json(
                { error: 'معرّف المستقبل والرسالة مطلوبان' },
                { status: 400 }
            );
        }

        // منع إرسال دعاء لنفسه
        if (receiverId === decoded.userId) {
            return NextResponse.json(
                { error: 'لا يمكنك إرسال دعاء خاص لنفسك' },
                { status: 400 }
            );
        }

        // فحص معدل التفاعل (يجب أن يكون 98% أو أكثر)
        const statsResult = await query(
            `SELECT interaction_rate FROM user_stats WHERE user_id = $1`,
            [decoded.userId]
        );

        if (statsResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'لم يتم العثور على إحصائيات المستخدم' },
                { status: 404 }
            );
        }

        const interactionRate = statsResult.rows[0].interaction_rate || 0;

        if (interactionRate < 98) {
            return NextResponse.json({
                error: 'الدعاء الخاص متاح للمستخدمين الذهبيين (98%+) فقط',
                currentRate: interactionRate,
                requiredRate: 98,
                remaining: 98 - interactionRate
            }, { status: 403 });
        }

        // فحص عدد الدعوات الخاصة اليوم (حد أقصى 5)
        const todayCount = await query(
            `SELECT COUNT(*) as count 
             FROM private_prayers 
             WHERE sender_id = $1 
             AND created_at > CURRENT_DATE`,
            [decoded.userId]
        );

        const dailyCount = parseInt(todayCount.rows[0].count);

        if (dailyCount >= 5) {
            return NextResponse.json({
                error: 'لقد وصلت للحد الأقصى اليومي (5 دعوات خاصة)',
                dailyLimit: 5,
                sentToday: dailyCount
            }, { status: 429 });
        }

        // التحقق من وجود المستقبل
        const receiverCheck = await query(
            `SELECT id, full_name FROM users WHERE id = $1`,
            [receiverId]
        );

        if (receiverCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'المستقبل غير موجود' },
                { status: 404 }
            );
        }

        // إنشاء الدعاء الخاص
        const result = await query(
            `INSERT INTO private_prayers (sender_id, receiver_id, message, created_at)
             VALUES ($1, $2, $3, NOW())
             RETURNING id, created_at`,
            [decoded.userId, receiverId, message]
        );

        const privatePrayer = result.rows[0];

        // TODO: إرسال إشعار للمستقبل (سيتم في المرحلة 5)

        return NextResponse.json({
            success: true,
            message: 'تم إرسال دعاءك الخاص ⭐',
            privatePrayer: {
                id: privatePrayer.id,
                receiverId,
                createdAt: privatePrayer.created_at,
                remainingToday: 5 - dailyCount - 1
            }
        });

    } catch (error) {
        console.error('Private prayer error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء إرسال الدعاء الخاص' },
            { status: 500 }
        );
    }
}

// ============================================================================
// 📥 GET - جلب الدعوات الخاصة المستلمة
// ============================================================================
export async function GET(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // جلب الدعوات الخاصة
        const result = await query(
            `SELECT 
                pp.id,
                pp.message,
                pp.created_at,
                pp.read_at,
                u.full_name as sender_name,
                u.nickname as sender_nickname,
                us.interaction_rate
             FROM private_prayers pp
             JOIN users u ON pp.sender_id = u.id
             LEFT JOIN user_stats us ON u.id = us.user_id
             WHERE pp.receiver_id = $1
             ORDER BY pp.created_at DESC
             LIMIT 50`,
            [decoded.userId]
        );

        const prayers = result.rows.map(row => {
            const displayName = row.sender_nickname || row.sender_name.split(' ')[0];
            
            let verificationIcon = '';
            if (row.interaction_rate >= 98) {
                verificationIcon = '👑';
            }

            return {
                id: row.id,
                message: row.message,
                senderName: displayName,
                verificationIcon,
                createdAt: row.created_at,
                isRead: !!row.read_at
            };
        });

        return NextResponse.json({
            success: true,
            prayers
        });

    } catch (error) {
        console.error('Get private prayers error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب الدعوات' },
            { status: 500 }
        );
    }
}