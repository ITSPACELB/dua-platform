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
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const limit = 20;
    const offset = (page - 1) * limit;

    // بناء الاستعلام
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

    // جلب الطلبات مع معلومات المستخدم
    const requestsQuery = `
      SELECT 
        pr.id,
        pr.user_id,
        pr.type,
        pr.name,
        pr.mother_or_father_name,
        pr.purpose,
        pr.custom_verse,
        pr.status,
        pr.prayer_count,
        pr.is_second_request,
        pr.created_at,
        pr.expires_at,
        u.full_name as user_full_name,
        u.phone_number as user_phone,
        u.country as user_country,
        u.is_anonymous as user_is_anonymous
      FROM prayer_requests pr
      LEFT JOIN users u ON pr.user_id = u.id
      ${whereClause}
      ORDER BY pr.created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await query(requestsQuery, params);

    // عد الطلبات
    const countQuery = `SELECT COUNT(*) FROM prayer_requests pr ${whereClause}`;
    const countResult = await query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      requests: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('GET requests error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الطلبات', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// 🔄 PATCH - تحديث حالة طلب
// ============================================================================
export async function PATCH(request) {
  try {
    const admin = await verifyAdmin(request);
    
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { requestId, status } = await request.json();

    if (!requestId || !status) {
      return NextResponse.json(
        { error: 'معرف الطلب والحالة مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من الحالة المسموح بها
    const allowedStatuses = ['active', 'rejected', 'completed', 'expired'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'حالة غير صالحة' },
        { status: 400 }
      );
    }

    const result = await query(
      'UPDATE prayer_requests SET status = $1 WHERE id = $2 RETURNING id, name, status',
      [status, requestId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'طلب الدعاء غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الحالة بنجاح',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('PATCH request error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الطلب', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// 🗑️ DELETE - حذف طلب دعاء
// ============================================================================
export async function DELETE(request) {
  try {
    const admin = await verifyAdmin(request);
    
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('id');

    if (!requestId) {
      return NextResponse.json(
        { error: 'معرف الطلب مطلوب' },
        { status: 400 }
      );
    }

    await query('BEGIN');
    
    try {
      // حذف الصلوات المرتبطة بالطلب
      await query('DELETE FROM prayers WHERE request_id = $1', [requestId]);
      
      // حذف طلب الدعاء
      const deleteResult = await query(
        'DELETE FROM prayer_requests WHERE id = $1 RETURNING name',
        [requestId]
      );

      if (deleteResult.rows.length === 0) {
        await query('ROLLBACK');
        return NextResponse.json(
          { error: 'طلب الدعاء غير موجود' },
          { status: 404 }
        );
      }

      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'تم حذف طلب الدعاء بنجاح',
        deletedRequest: deleteResult.rows[0].name
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('DELETE request error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الطلب', details: error.message },
      { status: 500 }
    );
  }
}