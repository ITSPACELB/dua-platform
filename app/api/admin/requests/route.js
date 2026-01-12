// ════════════════════════════════════════════════════════════════════
// 📋 API إدارة طلبات الدعاء - النسخة المحسّنة
// ════════════════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminCheck = await query('SELECT role FROM admin_users WHERE id = $1', [decoded.adminId]);
    if (adminCheck.rows.length === 0) return null;
    return { ...decoded, role: adminCheck.rows[0].role };
  } catch (error) {
    return null;
  }
}

export async function GET(request) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const offset = (page - 1) * limit;

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (status !== 'all') {
      conditions.push(`pr.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (type !== 'all') {
      conditions.push(`pr.type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const requestsQuery = `
      SELECT pr.*, u.full_name as requester_name, u.level as requester_level
      FROM prayer_requests pr
      LEFT JOIN users u ON pr.user_id = u.id
      ${whereClause}
      ORDER BY pr.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const requestsResult = await query(requestsQuery, params);

    const countQuery = `SELECT COUNT(*) as total FROM prayer_requests pr ${whereClause}`;
    const countResult = await query(countQuery, params.slice(0, -2));
    const totalRequests = parseInt(countResult.rows[0].total);

    const typeLabels = { personal: 'دعاء شخصي', friend: 'دعاء لصديق', deceased: 'دعاء لمتوفى', sick: 'دعاء لمريض' };
    const statusLabels = { active: 'نشط', completed: 'مستجاب', expired: 'منتهي' };

    const requests = requestsResult.rows.map(req => ({
      id: req.id,
      userId: req.user_id,
      type: req.type,
      typeLabel: typeLabels[req.type] || req.type,
      name: req.name || 'بدون اسم',
      motherName: req.mother_or_father_name || '',
      status: req.status,
      statusLabel: statusLabels[req.status] || req.status,
      prayerCount: req.prayer_count || 0,
      createdAt: req.created_at,
      requester: { name: req.requester_name || 'مستخدم', level: req.requester_level || 1 }
    }));

    return NextResponse.json({
      success: true,
      requests,
      pagination: { page, limit, totalRequests, totalPages: Math.ceil(totalRequests / limit) }
    });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'معرف الطلب مطلوب' }, { status: 400 });

    const result = await query('DELETE FROM prayer_requests WHERE id = $1 RETURNING name', [id]);
    if (result.rows.length === 0) return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });

    return NextResponse.json({ success: true, message: `تم حذف طلب الدعاء "${result.rows[0].name || 'بدون اسم'}" بنجاح` });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ', details: error.message }, { status: 500 });
  }
}
