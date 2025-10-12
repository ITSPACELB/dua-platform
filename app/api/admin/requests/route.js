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
// 📥 GET - جلب طلبات الدعاء
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
        const status = searchParams.get('status') || 'all'; // all, active, answered, expired
        const type = searchParams.get('type') || 'all'; // all, general, deceased, sick

        const offset = (page - 1) * limit;

        // بناء WHERE clause
        let whereClause = '1=1';
        
        if (status !== 'all') {
            whereClause += ` AND pr.status = '${status}'`;
        }
        
        if (type !== 'all') {
            whereClause += ` AND pr.prayer_type = '${type}'`;
        }

        // جلب الطلبات
        const requestsResult = await query(
            `SELECT 
                pr.id,
                pr.requester_id,
                pr.prayer_type,
                pr.status,
                pr.deceased_name,
                pr.deceased_mother_name,
                pr.relation,
                pr.is_name_private,
                pr.sick_person_name,
                pr.sick_person_mother_name,
                pr.created_at,
                pr.expires_at,
                pr.answered_at,
                pr.total_prayers_received,
                u.full_name,
                u.mother_name,
                u.nickname
             FROM prayer_requests pr
             JOIN users u ON pr.requester_id = u.id
             WHERE ${whereClause}
             ORDER BY pr.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        // عد الإجمالي
        const countResult = await query(
            `SELECT COUNT(*) as count FROM prayer_requests pr WHERE ${whereClause}`
        );

        const totalRequests = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalRequests / limit);

        const requests = requestsResult.rows.map(row => ({
            id: row.id,
            requesterId: row.requester_id,
            requesterName: row.nickname || row.full_name,
            type: row.prayer_type,
            status: row.status,
            deceasedName: row.deceased_name,
            deceasedMotherName: row.deceased_mother_name,
            relation: row.relation,
            isNamePrivate: row.is_name_private,
            sickPersonName: row.sick_person_name,
            sickPersonMotherName: row.sick_person_mother_name,
            createdAt: row.created_at,
            expiresAt: row.expires_at,
            answeredAt: row.answered_at,
            totalPrayers: row.total_prayers_received
        }));

        return NextResponse.json({
            success: true,
            requests,
            pagination: {
                page,
                limit,
                totalRequests,
                totalPages
            }
        });

    } catch (error) {
        console.error('Admin get requests error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب الطلبات' },
            { status: 500 }
        );
    }
}

// ============================================================================
// 🗑️ DELETE - حذف طلب (Super Admin فقط)
// ============================================================================
export async function DELETE(request) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin || admin.role !== 'super_admin') {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { requestId } = await request.json();

        if (!requestId) {
            return NextResponse.json({ error: 'معرّف الطلب مطلوب' }, { status: 400 });
        }

        await query('DELETE FROM prayer_requests WHERE id = $1', [requestId]);

        return NextResponse.json({
            success: true,
            message: 'تم حذف الطلب بنجاح'
        });

    } catch (error) {
        console.error('Admin delete request error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء حذف الطلب' },
            { status: 500 }
        );
    }
}