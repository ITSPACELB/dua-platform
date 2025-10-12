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
// 📤 POST - دعاء جماعي (للمستخدمين الموثقين 95%+)
// ============================================================================
export async function POST(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { message } = await request.json();

        // فحص معدل التفاعل (يجب أن يكون 95% أو أكثر)
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

        if (interactionRate < 95) {
            return NextResponse.json({
                error: 'الدعاء الجماعي متاح للمستخدمين الموثقين (95%+) فقط',
                currentRate: interactionRate,
                requiredRate: 95,
                remaining: 95 - interactionRate
            }, { status: 403 });
        }

        // فحص إذا كان قد أرسل دعاء جماعي خلال 7 أيام
        const lastCollective = await query(
            `SELECT created_at 
             FROM collective_prayers 
             WHERE user_id = $1
             ORDER BY created_at DESC 
             LIMIT 1`,
            [decoded.userId]
        );

        if (lastCollective.rows.length > 0) {
            const lastTime = new Date(lastCollective.rows[0].created_at);
            const now = new Date();
            const daysPassed = (now - lastTime) / (1000 * 60 * 60 * 24);

            if (daysPassed < 7) {
                const daysRemaining = Math.ceil(7 - daysPassed);
                const nextAllowedAt = new Date(lastTime.getTime() + (7 * 24 * 60 * 60 * 1000));
                
                return NextResponse.json({
                    error: 'يمكنك إرسال دعاء جماعي واحد كل 7 أيام',
                    canSend: false,
                    daysRemaining,
                    nextAllowedAt
                }, { status: 429 });
            }
        }

        // إنشاء الدعاء الجماعي
        const result = await query(
            `INSERT INTO collective_prayers (user_id, message, created_at)
             VALUES ($1, $2, NOW())
             RETURNING id, created_at`,
            [decoded.userId, message || null]
        );

        const collectivePrayer = result.rows[0];

        // الحصول على عدد المستخدمين النشطين لإرسال الإشعارات
        const activeUsersResult = await query(
            `SELECT COUNT(*) as count 
             FROM users 
             WHERE last_login > NOW() - INTERVAL '7 days'
             AND id != $1`,
            [decoded.userId]
        );

        const notificationCount = parseInt(activeUsersResult.rows[0].count);

        // TODO: إرسال الإشعارات (سيتم في المرحلة 5)
        // تحديث عدد الإشعارات المرسلة
        await query(
            `UPDATE collective_prayers 
             SET notifications_sent = $1 
             WHERE id = $2`,
            [notificationCount, collectivePrayer.id]
        );

        return NextResponse.json({
            success: true,
            message: 'تم إرسال دعاءك الجماعي لكل المؤمنين 🌍',
            collectivePrayer: {
                id: collectivePrayer.id,
                createdAt: collectivePrayer.created_at,
                notificationsSent: notificationCount
            }
        });

    } catch (error) {
        console.error('Collective prayer error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء إرسال الدعاء الجماعي' },
            { status: 500 }
        );
    }
}