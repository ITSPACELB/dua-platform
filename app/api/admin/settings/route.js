import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================================================
// 🔐 التحقق من المسؤول
// ============================================================================
function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'غير مصرح' };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return { valid: false, error: 'غير مصرح' };
    }

    return { valid: true, decoded };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, error: 'Token غير صالح' };
  }
}

// ============================================================================
// 📥 GET - جلب الإعدادات
// ============================================================================
export async function GET(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // جلب إعداد محدد
      const result = await query(
        'SELECT * FROM platform_settings WHERE key = $1',
        [key]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'الإعداد غير موجود' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        setting: result.rows[0]
      });
    } else {
      // جلب كل الإعدادات
      const result = await query('SELECT * FROM platform_settings ORDER BY key');
      
      return NextResponse.json({
        success: true,
        settings: result.rows
      });
    }
  } catch (error) {
    console.error('GET settings error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الإعدادات' },
      { status: 500 }
    );
  }
}

// ============================================================================
// 📤 POST - إنشاء أو تحديث إعداد
// ============================================================================
export async function POST(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { key, value } = await request.json();

    if (!key || !value) {
      return NextResponse.json(
        { error: 'المفتاح والقيمة مطلوبان' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO platform_settings (key, value, updated_by) 
       VALUES ($1, $2, $3)
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = NOW(), updated_by = $3
       RETURNING *`,
      [key, JSON.stringify(value), auth.decoded.adminId]
    );

    return NextResponse.json({
      success: true,
      setting: result.rows[0]
    });
  } catch (error) {
    console.error('POST settings error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حفظ الإعداد' },
      { status: 500 }
    );
  }
}

// ============================================================================
// 🔄 PUT - تحديث إعداد
// ============================================================================
export async function PUT(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { key, value } = await request.json();

    if (!key || !value) {
      return NextResponse.json(
        { error: 'المفتاح والقيمة مطلوبان' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE platform_settings 
       SET value = $1, updated_at = NOW(), updated_by = $2
       WHERE key = $3
       RETURNING *`,
      [JSON.stringify(value), auth.decoded.adminId, key]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الإعداد غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      setting: result.rows[0]
    });
  } catch (error) {
    console.error('PUT settings error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الإعداد' },
      { status: 500 }
    );
  }
}

// ============================================================================
// 🗑️ DELETE - حذف إعداد
// ============================================================================
export async function DELETE(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'المفتاح مطلوب' },
        { status: 400 }
      );
    }

    await query('DELETE FROM platform_settings WHERE key = $1', [key]);

    return NextResponse.json({
      success: true,
      message: 'تم حذف الإعداد بنجاح'
    });
  } catch (error) {
    console.error('DELETE settings error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الإعداد' },
      { status: 500 }
    );
  }
}