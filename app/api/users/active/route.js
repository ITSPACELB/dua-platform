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
// 📥 GET - جلب المستخدمين النشطين (للدعاء الخاص)
// ============================================================================
export async function GET(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');

        // جلب المستخدمين النشطين (آخر 7 أيام)
        const result = await query(
            `SELECT 
                u.id,
                u.full_name,
                u.nickname,
                u.city,
                u.show_full_name,
                us.interaction_rate
             FROM users u
             LEFT JOIN user_stats us ON u.id = us.user_id
             WHERE u.last_login > NOW() - INTERVAL '7 days'
             AND u.id != $1
             ORDER BY us.interaction_rate DESC NULLS LAST
             LIMIT $2`,
            [decoded.userId, limit]
        );

        const users = result.rows.map(row => {
            const displayName = row.nickname 
                ? row.nickname
                : row.show_full_name
                    ? `${row.full_name}${row.city ? ` (${row.city})` : ''}`
                    : `${row.full_name.split(' ')[0]}...`;

            const interactionRate = row.interaction_rate || 0;
            let verificationLevel = null;

            if (interactionRate >= 98) {
                verificationLevel = { name: 'GOLD', color: 'amber', icon: '👑', threshold: 98 };
            } else if (interactionRate >= 90) {
                verificationLevel = { name: 'GREEN', color: 'emerald', icon: '✓✓', threshold: 90 };
            } else if (interactionRate >= 80) {
                verificationLevel = { name: 'BLUE', color: 'blue', icon: '✓', threshold: 80 };
            }

            return {
                id: row.id,
                displayName,
                verificationLevel,
                interactionRate
            };
        });

        return NextResponse.json({
            success: true,
            users,
            count: users.length
        });

    } catch (error) {
        console.error('Get active users error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب المستخدمين' },
            { status: 500 }
        );
    }
}