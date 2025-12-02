import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ════════════════════════════════════════════════════════════
// 🔐 التحقق من صلاحيات الأدمن
// ════════════════════════════════════════════════════════════
function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'غير مصرح' };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // التحقق من الصلاحيات
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return { valid: false, error: 'غير مصرح' };
    }

    return { valid: true, decoded };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, error: 'Token غير صالح' };
  }
}

// ════════════════════════════════════════════════════════════
// 📥 GET - جلب الأدعية الجماعية
// ════════════════════════════════════════════════════════════
export async function GET(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all'); // جلب الكل أم النشط فقط
    const id = searchParams.get('id'); // جلب دعاء محدد

    // جلب دعاء محدد
    if (id) {
      const result = await query(
        `SELECT 
          id,
          type,
          content,
          timing,
          is_active,
          start_date,
          scheduled_datetime,
          duration_minutes,
          final_participant_count,
          created_at,
          updated_at
         FROM collective_prayer
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'الدعاء غير موجود' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        prayer: result.rows[0]
      });
    }

    // جلب كل الأدعية أو النشطة فقط
    let sql = `
      SELECT 
        id,
        type,
        content,
        timing,
        is_active,
        start_date,
        scheduled_datetime,
        duration_minutes,
        final_participant_count,
        created_at,
        updated_at
      FROM collective_prayer
    `;

    if (!all) {
      sql += ' WHERE is_active = true';
    }

    sql += ' ORDER BY id DESC';

    const result = await query(sql);

    return NextResponse.json({
      success: true,
      prayers: result.rows
    });

  } catch (error) {
    console.error('GET collective-prayer error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الأدعية' },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════
// ➕ POST - إضافة دعاء جماعي جديد
// ════════════════════════════════════════════════════════════
export async function POST(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { type, content, timing, start_date, is_active } = body;

    // التحقق من البيانات المطلوبة
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'نص الدعاء مطلوب' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'verse' && type !== 'custom')) {
      return NextResponse.json(
        { error: 'نوع الدعاء يجب أن يكون verse أو custom' },
        { status: 400 }
      );
    }

    if (!timing || (timing !== 'scheduled' && timing !== 'permanent')) {
      return NextResponse.json(
        { error: 'التوقيت يجب أن يكون scheduled أو permanent' },
        { status: 400 }
      );
    }

    // إذا كان موقوت، يجب تحديد الوقت
    if (timing === 'scheduled' && !start_date) {
      return NextResponse.json(
        { error: 'يجب تحديد وقت البداية للدعاء الموقوت' },
        { status: 400 }
      );
    }

    // إدراج الدعاء الجديد
    const result = await query(
      `INSERT INTO collective_prayer 
        (type, content, timing, is_active, start_date, scheduled_datetime, duration_minutes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $5, 30, NOW(), NOW())
       RETURNING *`,
      [
        type,
        content.trim(),
        timing,
        is_active !== false, // افتراضياً نشط
        start_date || null
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'تم إضافة الدعاء الجماعي بنجاح',
      prayer: result.rows[0]
    });

  } catch (error) {
    console.error('POST collective-prayer error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء إنشاء الدعاء الجماعي' },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════
// ✏️ PATCH - تعديل دعاء جماعي
// ════════════════════════════════════════════════════════════
export async function PATCH(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'معرف الدعاء مطلوب' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { type, content, timing, start_date, is_active, duration_minutes } = body;

    // بناء استعلام التحديث الديناميكي
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (type !== undefined) {
      if (type !== 'verse' && type !== 'custom') {
        return NextResponse.json(
          { error: 'نوع الدعاء يجب أن يكون verse أو custom' },
          { status: 400 }
        );
      }
      updates.push(`type = $${paramIndex++}`);
      params.push(type);
    }

    if (content !== undefined) {
      if (!content.trim()) {
        return NextResponse.json(
          { error: 'نص الدعاء لا يمكن أن يكون فارغاً' },
          { status: 400 }
        );
      }
      updates.push(`content = $${paramIndex++}`);
      params.push(content.trim());
    }

    if (timing !== undefined) {
      if (timing !== 'scheduled' && timing !== 'permanent') {
        return NextResponse.json(
          { error: 'التوقيت يجب أن يكون scheduled أو permanent' },
          { status: 400 }
        );
      }
      updates.push(`timing = $${paramIndex++}`);
      params.push(timing);
    }

    if (start_date !== undefined) {
      updates.push(`start_date = $${paramIndex++}`);
      params.push(start_date);
      // تحديث scheduled_datetime أيضاً ليتطابق
      updates.push(`scheduled_datetime = $${paramIndex++}`);
      params.push(start_date);
    }

    if (duration_minutes !== undefined) {
      updates.push(`duration_minutes = $${paramIndex++}`);
      params.push(duration_minutes);
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(is_active);
    }

    // إضافة updated_at
    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) { // فقط updated_at
      return NextResponse.json(
        { error: 'لا توجد بيانات للتحديث' },
        { status: 400 }
      );
    }

    // إضافة id في النهاية
    params.push(id);

    const sql = `
      UPDATE collective_prayer 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الدعاء غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الدعاء بنجاح',
      prayer: result.rows[0]
    });

  } catch (error) {
    console.error('PATCH collective-prayer error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث الدعاء' },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════
// 🗑️ DELETE - حذف دعاء جماعي
// ════════════════════════════════════════════════════════════
export async function DELETE(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'معرف الدعاء مطلوب' },
        { status: 400 }
      );
    }

    // حذف المشاركات أولاً
    await query(
      'DELETE FROM collective_prayer_participants WHERE prayer_id = $1',
      [id]
    );

    // ثم حذف الدعاء
    const result = await query(
      'DELETE FROM collective_prayer WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'الدعاء غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الدعاء بنجاح'
    });

  } catch (error) {
    console.error('DELETE collective-prayer error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الدعاء' },
      { status: 500 }
    );
  }
}