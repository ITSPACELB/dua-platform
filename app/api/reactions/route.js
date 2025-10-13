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
// 📤 POST - إضافة رد فعل (heart/angel/like)
// ============================================================================
export async function POST(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { requestId, reactionType } = await request.json();

        if (!requestId || !reactionType) {
            return NextResponse.json(
                { error: 'معرّف الطلب ونوع رد الفعل مطلوبان' },
                { status: 400 }
            );
        }

        if (!['heart', 'angel', 'like'].includes(reactionType)) {
            return NextResponse.json(
                { error: 'نوع رد الفعل غير صحيح' },
                { status: 400 }
            );
        }

        const requestCheck = await query(
            `SELECT id, user_id, status FROM prayer_requests WHERE id = $1`,
            [requestId]
        );

        if (requestCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'الطلب غير موجود' },
                { status: 404 }
            );
        }

        const prayerRequest = requestCheck.rows[0];

        if (prayerRequest.user_id === decoded.userId) {
            return NextResponse.json(
                { error: 'لا يمكنك التفاعل مع طلبك الخاص' },
                { status: 400 }
            );
        }

        const prayerCheck = await query(
            `SELECT id FROM prayers WHERE user_id = $1 AND request_id = $2`,
            [decoded.userId, requestId]
        );

        if (prayerCheck.rows.length === 0) {
            return NextResponse.json(
                { error: 'يجب أن تدعو للطلب أولاً قبل التفاعل' },
                { status: 403 }
            );
        }

        try {
            await query(
                `INSERT INTO reactions (request_id, user_id, reactor_id, reaction_type, created_at)
                 VALUES ($1, $2, $3, $4, NOW())
                 ON CONFLICT (request_id, reactor_id)
                 DO UPDATE SET reaction_type = $4, created_at = NOW()`,
                [requestId, prayerRequest.user_id, decoded.userId, reactionType]
            );

            const totalReactions = await query(
                `SELECT 
                    reaction_type,
                    COUNT(*) as count
                 FROM reactions
                 WHERE request_id = $1
                 GROUP BY reaction_type`,
                [requestId]
            );

            const reactionCounts = {
                heart: 0,
                angel: 0,
                like: 0
            };

            totalReactions.rows.forEach(row => {
                reactionCounts[row.reaction_type] = parseInt(row.count);
            });

            return NextResponse.json({
                success: true,
                message: 'تم إضافة رد الفعل بنجاح',
                reactionType,
                totalReactions: reactionCounts
            });

        } catch (error) {
            console.error('Reaction insert error:', error);
            return NextResponse.json(
                { error: 'حدث خطأ أثناء إضافة رد الفعل' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Reaction error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء معالجة رد الفعل' },
            { status: 500 }
        );
    }
}

// ============================================================================
// 📥 GET - جلب ردود الفعل لطلب معين
// ============================================================================
export async function GET(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const requestId = searchParams.get('requestId');

        if (!requestId) {
            return NextResponse.json(
                { error: 'معرّف الطلب مطلوب' },
                { status: 400 }
            );
        }

        const reactionStats = await query(
            `SELECT 
                reaction_type,
                COUNT(*) as count
             FROM reactions
             WHERE request_id = $1
             GROUP BY reaction_type`,
            [requestId]
        );

        const reactionCounts = {
            heart: 0,
            angel: 0,
            like: 0
        };

        reactionStats.rows.forEach(row => {
            reactionCounts[row.reaction_type] = parseInt(row.count);
        });

        const topReactors = await query(
            `SELECT 
                u.full_name,
                u.nickname,
                us.interaction_rate,
                r.reaction_type
             FROM reactions r
             JOIN users u ON r.reactor_id = u.id
             LEFT JOIN user_stats us ON u.id = us.user_id
             WHERE r.request_id = $1
             ORDER BY us.interaction_rate DESC NULLS LAST
             LIMIT 5`,
            [requestId]
        );

        const reactors = topReactors.rows.map(row => {
            const displayName = row.nickname || row.full_name.split(' ')[0];
            
            let verificationLevel = null;
            const rate = row.interaction_rate || 0;
            
            if (rate >= 98) {
                verificationLevel = { name: 'GOLD', icon: '👑' };
            } else if (rate >= 90) {
                verificationLevel = { name: 'GREEN', icon: '✓✓' };
            } else if (rate >= 80) {
                verificationLevel = { name: 'BLUE', icon: '✓' };
            }

            return {
                name: displayName,
                reactionType: row.reaction_type,
                verificationLevel
            };
        });

        const userReaction = await query(
            `SELECT reaction_type FROM reactions 
             WHERE request_id = $1 AND reactor_id = $2`,
            [requestId, decoded.userId]
        );

        return NextResponse.json({
            success: true,
            reactions: reactionCounts,
            topReactors: reactors,
            userReaction: userReaction.rows[0]?.reaction_type || null,
            totalCount: reactionStats.rows.reduce((sum, row) => sum + parseInt(row.count), 0)
        });

    } catch (error) {
        console.error('Get reactions error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب ردود الفعل' },
            { status: 500 }
        );
    }
}