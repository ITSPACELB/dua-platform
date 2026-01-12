// ════════════════════════════════════════════════════════════════════
// 👥 API إدارة المستخدمين - النسخة المحسّنة
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
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';
    const offset = (page - 1) * limit;

    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(u.full_name ILIKE $${paramIndex} OR u.phone_number ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (filter === 'level1') conditions.push(`u.level = 1`);
    else if (filter === 'level2') conditions.push(`u.level = 2`);
    else if (filter === 'level3') conditions.push(`u.level = 3`);
    else if (filter === 'active') conditions.push(`u.id IN (SELECT DISTINCT user_id FROM prayers WHERE prayed_at >= NOW() - INTERVAL '7 days')`);

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const usersQuery = `
      SELECT 
        u.id, u.full_name, u.mother_or_father_name, u.phone_number, u.country, u.level,
        u.is_anonymous, u.created_at, u.updated_at,
        COALESCE(ps.total_prayers, 0) as prayer_count,
        COALESCE(ps.prayers_today, 0) as prayers_today,
        COALESCE(rs.total_requests, 0) as request_count,
        ps.last_prayer_at
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) as total_prayers,
          COUNT(CASE WHEN DATE(prayed_at) = CURRENT_DATE THEN 1 END) as prayers_today,
          MAX(prayed_at) as last_prayer_at
        FROM prayers GROUP BY user_id
      ) ps ON u.id = ps.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as total_requests FROM prayer_requests GROUP BY user_id
      ) rs ON u.id = rs.user_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const usersResult = await query(usersQuery, params);

    const countQuery = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
    const countResult = await query(countQuery, params.slice(0, -2));
    const totalUsers = parseInt(countResult.rows[0].total);

    const users = usersResult.rows.map(user => {
      let verificationLevel = 'NONE';
      if (user.level === 3) verificationLevel = 'GOLD';
      else if (user.level === 2) verificationLevel = 'GREEN';
      else if (user.level === 1 && user.phone_number) verificationLevel = 'BLUE';
      
      const totalPrayers = parseInt(user.prayer_count) || 0;
      const daysSinceCreation = Math.max(1, Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)));
      const interactionRate = Math.min(100, Math.round((totalPrayers / daysSinceCreation) * 10));
      
      return {
        id: user.id,
        fullName: user.full_name || 'بدون اسم',
        motherName: user.mother_or_father_name || '',
        phoneNumber: user.phone_number || '',
        city: user.country || '',
        level: user.level || 1,
        verificationLevel,
        createdAt: user.created_at,
        lastLogin: user.last_prayer_at || user.updated_at,
        stats: {
          prayersGiven: totalPrayers,
          totalPrayers,
          prayersToday: parseInt(user.prayers_today) || 0,
          totalRequests: parseInt(user.request_count) || 0,
          interactionRate
        }
      };
    });

    return NextResponse.json({
      success: true,
      users,
      pagination: { page, limit, totalUsers, totalPages: Math.ceil(totalUsers / limit) }
    });
  } catch (error) {
    console.error('GET users error:', error);
    return NextResponse.json({ error: 'حدث خطأ', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    if (!userId) return NextResponse.json({ error: 'معرف المستخدم مطلوب' }, { status: 400 });

    const userCheck = await query('SELECT id, full_name FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });

    await query('DELETE FROM users WHERE id = $1', [userId]);
    return NextResponse.json({ success: true, message: `تم حذف المستخدم "${userCheck.rows[0].full_name || 'بدون اسم'}" بنجاح` });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ', details: error.message }, { status: 500 });
  }
}
