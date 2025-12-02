import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================================================
// 🔐 التحقق من صلاحيات المسؤول
// ============================================================================
async function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // ✅ استخدم adminId بدلاً من userId
    const adminCheck = await query(
      'SELECT role FROM admin_users WHERE id = $1',
      [decoded.adminId]
    );

    if (adminCheck.rows.length === 0) {
      return null;
    }

    return { ...decoded, role: adminCheck.rows[0].role };
  } catch (error) {
    console.error('Admin verification error:', error);
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
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all';
    const limit = 20;
    const offset = (page - 1) * limit;

    // بناء الاستعلام
    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (search) {
      // ✅ استخدم full_name بدلاً من display_name
      conditions.push(`(full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone_number ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (filter === 'anonymous') {
      conditions.push('is_anonymous = true');
    } else if (filter === 'registered') {
      conditions.push('is_anonymous = false');
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // جلب المستخدمين مع إحصائياتهم
    const usersQuery = `
      SELECT 
        u.id,
        u.full_name,
        u.mother_or_father_name,
        u.phone_number,
        u.country_code,
        u.email,
        u.country,
        u.age,
        u.gender,
        u.is_anonymous,
        u.created_at,
        u.updated_at,
        COALESCE(us.total_prayers, 0) as total_prayers,
        COALESCE(us.total_stars, 0) as total_stars,
        COALESCE(us.current_level, 0) as current_level,
        COALESCE(us.interaction_rate, 0) as interaction_rate,
        COUNT(DISTINCT pr.id) as active_requests
      FROM users u
      LEFT JOIN user_stats us ON u.id = us.user_id
      LEFT JOIN prayer_requests pr ON u.id = pr.user_id AND pr.status = 'active'
      ${whereClause}
      GROUP BY 
        u.id, 
        u.full_name,
        u.mother_or_father_name,
        u.phone_number,
        u.country_code,
        u.email,
        u.country,
        u.age,
        u.gender,
        u.is_anonymous,
        u.created_at,
        u.updated_at,
        us.total_prayers,
        us.total_stars,
        us.current_level,
        us.interaction_rate
      ORDER BY u.created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await query(usersQuery, params);

    // عد المستخدمين
    const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
    const countResult = await query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('GET users error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المستخدمين', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// 🗑️ DELETE - حذف مستخدم
// ============================================================================
export async function DELETE(request) {
  try {
    const admin = await verifyAdmin(request);
    
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    // حذف المستخدم وجميع بياناته المرتبطة
    await query('BEGIN');
    
    try {
      // حذف إحصائيات المستخدم
      await query('DELETE FROM user_stats WHERE user_id = $1', [userId]);
      
      // حذف إنجازات المستخدم
      await query('DELETE FROM achievements WHERE user_id = $1', [userId]);
      
      // حذف صلوات المستخدم
      await query('DELETE FROM prayers WHERE user_id = $1', [userId]);
      
      // حذف طلبات الدعاء
      await query('DELETE FROM prayer_requests WHERE user_id = $1', [userId]);
      
      // حذف المستخدم نفسه
      const deleteResult = await query(
        'DELETE FROM users WHERE id = $1 RETURNING full_name',
        [userId]
      );

      if (deleteResult.rows.length === 0) {
        await query('ROLLBACK');
        return NextResponse.json(
          { error: 'المستخدم غير موجود' },
          { status: 404 }
        );
      }

      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'تم حذف المستخدم بنجاح',
        deletedUser: deleteResult.rows[0].full_name
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('DELETE user error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف المستخدم', details: error.message },
      { status: 500 }
    );
  }
}