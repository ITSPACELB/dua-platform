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
// 📥 GET - جلب البانر الحالي
// ============================================================================
export async function GET(request) {
  try {
    const admin = await verifyAdmin(request);
    
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const result = await query(`
      SELECT * FROM banner 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    return NextResponse.json({
      success: true,
      banner: result.rows[0] || null
    });
  } catch (error) {
    console.error('GET banner error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب البانر', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// 📝 POST - تحديث أو إنشاء البانر
// ============================================================================
export async function POST(request) {
  try {
    const admin = await verifyAdmin(request);
    
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { content, link, is_active } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'محتوى البانر مطلوب' },
        { status: 400 }
      );
    }

    await query('BEGIN');
    
    try {
      // حذف جميع البانرات القديمة
      await query('DELETE FROM banner');

      // إنشاء بانر جديد
      const result = await query(
        `INSERT INTO banner (content, link, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING *`,
        [content, link || null, is_active !== false]
      );

      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'تم تحديث البانر بنجاح',
        banner: result.rows[0]
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('POST banner error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث البانر', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// 🔄 PATCH - تفعيل/إيقاف البانر
// ============================================================================
export async function PATCH(request) {
  try {
    const admin = await verifyAdmin(request);
    
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'حالة التفعيل مطلوبة' },
        { status: 400 }
      );
    }

    // تحديث آخر بانر
    const result = await query(
      `UPDATE banner 
       SET is_active = $1, updated_at = NOW()
       WHERE id = (SELECT id FROM banner ORDER BY created_at DESC LIMIT 1)
       RETURNING *`,
      [is_active]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'لا يوجد بانر لتحديثه' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: is_active ? 'تم تفعيل البانر' : 'تم إيقاف البانر',
      banner: result.rows[0]
    });
  } catch (error) {
    console.error('PATCH banner error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث حالة البانر', details: error.message },
      { status: 500 }
    );
  }
}