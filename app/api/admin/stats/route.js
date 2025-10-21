export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================================================
// 🔐 التحقق من صلاحيات المسؤول
// ============================================================================
async function verifyAdmin(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    const token = authHeader.substring(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // فحص إذا كان المستخدم مسؤولاً
        const adminCheck = await query(
            'SELECT role FROM admin_users WHERE user_id = $1',
            [decoded.userId]
        );
        
        if (adminCheck.rows.length === 0) {
            return null;
        }
        
        return { ...decoded, role: adminCheck.rows[0].role };
    } catch (error) {
        return null;
    }
}

// ============================================================================
// 📥 GET - جلب إحصائيات المنصة
// ============================================================================
export async function GET(request) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'غير مصرح - صلاحيات مسؤول مطلوبة' }, { status: 403 });
        }

        // 1️⃣ إجمالي المستخدمين
        const totalUsersResult = await query(
            'SELECT COUNT(*) as count FROM users'
        );
        const totalUsers = parseInt(totalUsersResult.rows[0].count);

        // 2️⃣ المستخدمين النشطين (آخر 7 أيام)
        const activeUsersResult = await query(
            `SELECT COUNT(*) as count FROM users 
             WHERE last_login > NOW() - INTERVAL '7 days'`
        );
        const activeUsers = parseInt(activeUsersResult.rows[0].count);

        // 3️⃣ المستخدمين الجدد (آخر 30 يوم)
        const newUsersResult = await query(
            `SELECT COUNT(*) as count FROM users 
             WHERE created_at > NOW() - INTERVAL '30 days'`
        );
        const newUsers = parseInt(newUsersResult.rows[0].count);

        // 4️⃣ إجمالي طلبات الدعاء
        const totalRequestsResult = await query(
            'SELECT COUNT(*) as count FROM prayer_requests'
        );
        const totalRequests = parseInt(totalRequestsResult.rows[0].count);

        // 5️⃣ الطلبات النشطة حالياً
        const activeRequestsResult = await query(
            `SELECT COUNT(*) as count FROM prayer_requests 
             WHERE status = 'active' AND expires_at > NOW()`
        );
        const activeRequests = parseInt(activeRequestsResult.rows[0].count);

        // 6️⃣ الطلبات المستجابة
        const answeredRequestsResult = await query(
            `SELECT COUNT(*) as count FROM prayer_requests 
             WHERE status = 'answered'`
        );
        const answeredRequests = parseInt(answeredRequestsResult.rows[0].count);

        // 7️⃣ إجمالي الدعوات
        const totalPrayersResult = await query(
            'SELECT COUNT(*) as count FROM prayers'
        );
        const totalPrayers = parseInt(totalPrayersResult.rows[0].count);

        // 8️⃣ الدعوات اليوم
        const todayPrayersResult = await query(
            `SELECT COUNT(*) as count FROM prayers 
             WHERE prayed_at > CURRENT_DATE`
        );
        const todayPrayers = parseInt(todayPrayersResult.rows[0].count);

        // 9️⃣ الدعوات هذا الشهر
        const monthPrayersResult = await query(
            `SELECT COUNT(*) as count FROM prayers 
             WHERE prayed_at >= DATE_TRUNC('month', CURRENT_DATE)`
        );
        const monthPrayers = parseInt(monthPrayersResult.rows[0].count);

        // 🔟 معدل التفاعل العام
        const avgInteractionResult = await query(
            'SELECT AVG(interaction_rate) as avg FROM user_stats WHERE interaction_rate > 0'
        );
        const avgInteraction = parseFloat(avgInteractionResult.rows[0].avg || 0).toFixed(2);

        // 1️⃣1️⃣ توزيع أنواع الطلبات
        const requestTypesResult = await query(
            `SELECT type, COUNT(*) as count 
             FROM prayer_requests 
             GROUP BY type`
        );
        const requestTypes = requestTypesResult.rows.map(row => ({
            type: row.type,
            count: parseInt(row.count)
        }));

        // 1️⃣2️⃣ المستخدمين الموثقين
        const verifiedUsersResult = await query(
            `SELECT 
                COUNT(CASE WHEN interaction_rate >= 98 THEN 1 END) as gold,
                COUNT(CASE WHEN interaction_rate >= 90 AND interaction_rate < 98 THEN 1 END) as green,
                COUNT(CASE WHEN interaction_rate >= 80 AND interaction_rate < 90 THEN 1 END) as blue
             FROM user_stats`
        );
        const verifiedUsers = {
            gold: parseInt(verifiedUsersResult.rows[0].gold),
            green: parseInt(verifiedUsersResult.rows[0].green),
            blue: parseInt(verifiedUsersResult.rows[0].blue)
        };

        // 1️⃣3️⃣ إجمالي المشاركات
        const totalSharesResult = await query(
            'SELECT COUNT(*) as count FROM shares'
        );
        const totalShares = parseInt(totalSharesResult.rows[0].count);

        // 1️⃣4️⃣ إحصائيات النمو (آخر 7 أيام)
        const growthStatsResult = await query(
            `SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
             FROM users
             WHERE created_at > NOW() - INTERVAL '7 days'
             GROUP BY DATE(created_at)
             ORDER BY date ASC`
        );
        const growthStats = growthStatsResult.rows.map(row => ({
            date: row.date,
            count: parseInt(row.count)
        }));

        return NextResponse.json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    new: newUsers
                },
                requests: {
                    total: totalRequests,
                    active: activeRequests,
                    answered: answeredRequests,
                    types: requestTypes
                },
                prayers: {
                    total: totalPrayers,
                    today: todayPrayers,
                    thisMonth: monthPrayers
                },
                verification: verifiedUsers,
                engagement: {
                    avgInteraction: parseFloat(avgInteraction),
                    totalShares
                },
                growth: growthStats
            }
        });

    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب الإحصائيات' },
            { status: 500 }
        );
    }
}
