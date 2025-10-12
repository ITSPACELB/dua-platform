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
// 📥 GET - جلب قائمة المستخدمين
// ============================================================================
export async function GET(request) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search') || '';
        const filter = searchParams.get('filter') || 'all'; // all, active, verified

        const offset = (page - 1) * limit;

        // بناء WHERE clause
        let whereClause = '1=1';
        const params = [];

        if (search) {
            whereClause += ` AND (u.full_name ILIKE $${params.length + 1} OR u.mother_name ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        if (filter === 'active') {
            whereClause += ` AND u.last_login > NOW() - INTERVAL '7 days'`;
        } else if (filter === 'verified') {
            whereClause += ` AND us.interaction_rate >= 80`;
        }

        // جلب المستخدمين
        const usersResult = await query(
            `SELECT 
                u.id,
                u.full_name,
                u.mother_name,
                u.nickname,
                u.city,
                u.phone_number,
                u.email,
                u.created_at,
                u.last_login,
                us.total_prayers_given,
                us.total_notifications_received,
                us.interaction_rate
             FROM users u
             LEFT JOIN user_stats us ON u.id = us.user_id
             WHERE ${whereClause}
             ORDER BY u.created_at DESC
             LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limit, offset]
        );

        // عد الإجمالي
        const countResult = await query(
            `SELECT COUNT(*) as count FROM users u
             LEFT JOIN user_stats us ON u.id = us.user_id
             WHERE ${whereClause}`,
            params
        );

        const totalUsers = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalUsers / limit);

        const users = usersResult.rows.map(row => {
            const interactionRate = row.interaction_rate || 0;
            let verificationLevel = 'NONE';
            
            if (interactionRate >= 98) verificationLevel = 'GOLD';
            else if (interactionRate >= 90) verificationLevel = 'GREEN';
            else if (interactionRate >= 80) verificationLevel = 'BLUE';

            return {
                id: row.id,
                fullName: row.full_name,
                motherName: row.mother_name,
                nickname: row.nickname,
                city: row.city,
                phoneNumber: row.phone_number,
                email: row.email,
                createdAt: row.created_at,
                lastLogin: row.last_login,
                stats: {
                    prayersGiven: row.total_prayers_given || 0,
                    notificationsReceived: row.total_notifications_received || 0,
                    interactionRate: interactionRate
                },
                verificationLevel
            };
        });

        return NextResponse.json({
            success: true,
            users,
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages
            }
        });

    } catch (error) {
        console.error('Admin get users error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب المستخدمين' },
            { status: 500 }
        );
    }
}

// ============================================================================
// 🗑️ DELETE - حذف مستخدم (Super Admin فقط)
// ============================================================================
export async function DELETE(request) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin || admin.role !== 'super_admin') {
            return NextResponse.json({ error: 'غير مصرح - صلاحيات Super Admin مطلوبة' }, { status: 403 });
        }

        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'معرّف المستخدم مطلوب' }, { status: 400 });
        }

        // منع حذف المسؤول لنفسه
        if (userId === admin.userId) {
            return NextResponse.json({ error: 'لا يمكنك حذف حسابك الخاص' }, { status: 400 });
        }

        await query('DELETE FROM users WHERE id = $1', [userId]);

        return NextResponse.json({
            success: true,
            message: 'تم حذف المستخدم بنجاح'
        });

    } catch (error) {
        console.error('Admin delete user error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء حذف المستخدم' },
            { status: 500 }
        );
    }
}