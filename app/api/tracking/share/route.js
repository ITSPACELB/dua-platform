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
// 📤 POST - تتبع المشاركة
// ============================================================================
export async function POST(request) {
    try {
        const decoded = verifyToken(request);
        
        const { platform } = await request.json();

        // التحقق من المنصة
        const validPlatforms = ['whatsapp', 'facebook', 'twitter', 'telegram', 'copy_link', 'other'];
        const sharePlatform = validPlatforms.includes(platform) ? platform : 'other';

        // حفظ المشاركة
        await query(
            `INSERT INTO shares (user_id, platform, shared_at)
             VALUES ($1, $2, NOW())`,
            [decoded?.userId || null, sharePlatform]
        );

        // إذا كان المستخدم مسجلاً، تحديث إحصائياته
        if (decoded?.userId) {
            // فحص عدد المشاركات اليوم (لمنع الاحتيال)
            const todayShares = await query(
                `SELECT COUNT(*) as count 
                 FROM shares 
                 WHERE user_id = $1 AND shared_at > CURRENT_DATE`,
                [decoded.userId]
            );

            const shareCount = parseInt(todayShares.rows[0].count);

            // إذا كانت أقل من 10 مشاركات اليوم، نعتبرها صحيحة
            if (shareCount <= 10) {
                // إضافة نقطة واحدة للمشاركة
                await query(
                    `UPDATE user_stats 
                     SET 
                        total_prayers_given = total_prayers_given + 1,
                        interaction_rate = CASE 
                            WHEN total_notifications_received > 0 
                            THEN ((total_prayers_given + 1)::float / total_notifications_received * 100)
                            ELSE 100
                        END
                     WHERE user_id = $1`,
                    [decoded.userId]
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: 'شكراً لمشاركة المنصة! جزاك الله خيراً 🌟'
        });

    } catch (error) {
        console.error('Track share error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء تتبع المشاركة' },
            { status: 500 }
        );
    }
}

// ============================================================================
// 📥 GET - إحصائيات المشاركات
// ============================================================================
export async function GET(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // إجمالي المشاركات
        const totalShares = await query(
            `SELECT COUNT(*) as count FROM shares WHERE user_id = $1`,
            [decoded.userId]
        );

        // المشاركات حسب المنصة
        const sharesByPlatform = await query(
            `SELECT platform, COUNT(*) as count 
             FROM shares 
             WHERE user_id = $1
             GROUP BY platform
             ORDER BY count DESC`,
            [decoded.userId]
        );

        // المشاركات هذا الشهر
        const monthlyShares = await query(
            `SELECT COUNT(*) as count 
             FROM shares 
             WHERE user_id = $1 
             AND shared_at >= DATE_TRUNC('month', CURRENT_DATE)`,
            [decoded.userId]
        );

        return NextResponse.json({
            success: true,
            stats: {
                total: parseInt(totalShares.rows[0].count),
                thisMonth: parseInt(monthlyShares.rows[0].count),
                byPlatform: sharesByPlatform.rows.map(row => ({
                    platform: row.platform,
                    count: parseInt(row.count)
                }))
            }
        });

    } catch (error) {
        console.error('Get share stats error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب الإحصائيات' },
            { status: 500 }
        );
    }
}