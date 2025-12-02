// ═══════════════════════════════════════════════════════════
// 📚 Library Admin API - مع نظام التحقق البسيط
// ═══════════════════════════════════════════════════════════
// المسار: app/api/admin/library/route.js
// ═══════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

// ═══════════════════════════════════════════════════════════
// GET - جلب الكتب (للأدمن فقط)
// ═══════════════════════════════════════════════════════════

export async function GET(request) {
  // ✅ التحقق من صلاحيات الأدمن
  const authCheck = await requireAdmin(request);
  if (authCheck.error) {
    return authCheck.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    const search = searchParams.get('search');
    
    let sql = 'SELECT * FROM library WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    // فلترة حسب الفئة
    if (category) {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    // فلترة حسب الحالة
    if (active !== null) {
      sql += ` AND is_active = $${paramIndex}`;
      params.push(active === 'true');
      paramIndex++;
    }
    
    // بحث في العنوان
    if (search) {
      sql += ` AND title ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const result = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      books: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching library books:', error);
    return NextResponse.json(
      { success: false, error: 'فشل جلب الكتب' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// POST - إضافة كتاب جديد
// ═══════════════════════════════════════════════════════════

export async function POST(request) {
  // ✅ التحقق من صلاحيات الأدمن
  const authCheck = await requireAdmin(request);
  if (authCheck.error) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const {
      title,
      author,
      description,
      category,
      language = 'ar',
      file_url,
      cover_url = null,
      pages = null,
      size_mb = null
    } = body;

    // التحقق من الحقول المطلوبة
    if (!title || !author || !description || !category || !file_url) {
      return NextResponse.json(
        { success: false, error: 'الرجاء إدخال جميع الحقول المطلوبة' },
        { status: 400 }
      );
    }

    // إدراج الكتاب
    const result = await query(
      `INSERT INTO library 
       (title, author, description, category, language, file_url, cover_url, pages, size_mb, is_active, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW())
       RETURNING *`,
      [title, author, description, category, language, file_url, cover_url, pages, size_mb]
    );

    return NextResponse.json({
      success: true,
      book: result.rows[0],
      message: 'تم إضافة الكتاب بنجاح'
    });

  } catch (error) {
    console.error('Error adding book:', error);
    return NextResponse.json(
      { success: false, error: 'فشل إضافة الكتاب' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// PUT - تعديل كتاب
// ═══════════════════════════════════════════════════════════

export async function PUT(request) {
  // ✅ التحقق من صلاحيات الأدمن
  const authCheck = await requireAdmin(request);
  if (authCheck.error) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرّف الكتاب مطلوب' },
        { status: 400 }
      );
    }

    // بناء استعلام التحديث
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'لا توجد حقول للتحديث' },
        { status: 400 }
      );
    }

    values.push(id);
    const sql = `UPDATE library SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'الكتاب غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      book: result.rows[0],
      message: 'تم تحديث الكتاب بنجاح'
    });

  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تحديث الكتاب' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE - حذف كتاب
// ═══════════════════════════════════════════════════════════

export async function DELETE(request) {
  // ✅ التحقق من صلاحيات الأدمن
  const authCheck = await requireAdmin(request);
  if (authCheck.error) {
    return authCheck.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرّف الكتاب مطلوب' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM library WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'الكتاب غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الكتاب بنجاح'
    });

  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { success: false, error: 'فشل حذف الكتاب' },
      { status: 500 }
    );
  }
}