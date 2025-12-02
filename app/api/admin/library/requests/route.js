// ═══════════════════════════════════════════════════════════
// 📚 Library Requests API - مع نظام التحقق
// ═══════════════════════════════════════════════════════════
// المسار: app/api/admin/library/requests/route.js
// ═══════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

// ═══════════════════════════════════════════════════════════
// GET - جلب الطلبات (للأدمن فقط)
// ═══════════════════════════════════════════════════════════

export async function GET(request) {
  // ✅ التحقق من صلاحيات الأدمن
  const authCheck = await requireAdmin(request);
  if (authCheck.error) {
    return authCheck.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, approved, rejected

    let sql = 'SELECT * FROM library_requests WHERE 1=1';
    const params = [];
    
    if (status) {
      sql += ' AND status = $1';
      params.push(status);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const result = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      requests: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching library requests:', error);
    return NextResponse.json(
      { success: false, error: 'فشل جلب الطلبات' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// PUT - تحديث حالة الطلب (موافقة/رفض)
// ═══════════════════════════════════════════════════════════

export async function PUT(request) {
  // ✅ التحقق من صلاحيات الأدمن
  const authCheck = await requireAdmin(request);
  if (authCheck.error) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const { id, status, admin_notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'معرّف الطلب والحالة مطلوبة' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'الحالة غير صحيحة' },
        { status: 400 }
      );
    }

    // تحديث حالة الطلب
    const result = await query(
      `UPDATE library_requests 
       SET status = $1, 
           admin_notes = $2, 
           reviewed_at = NOW(),
           reviewed_by = $3
       WHERE id = $4 
       RETURNING *`,
      [status, admin_notes || null, authCheck.auth.userId, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    const updatedRequest = result.rows[0];

    // إذا تمت الموافقة، أضف الكتاب للمكتبة تلقائياً
    if (status === 'approved') {
      await query(
        `INSERT INTO library 
         (title, author, description, category, language, file_url, cover_url, pages, size_mb, is_active, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW())`,
        [
          updatedRequest.book_title,
          updatedRequest.book_author,
          updatedRequest.book_description,
          updatedRequest.book_category,
          updatedRequest.book_language,
          updatedRequest.book_file_url || 'pending',
          updatedRequest.book_cover_url,
          updatedRequest.book_pages,
          updatedRequest.book_size_mb
        ]
      );
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: status === 'approved' ? 'تمت الموافقة على الطلب ونشر الكتاب' : 'تم رفض الطلب'
    });

  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تحديث الطلب' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// DELETE - حذف طلب
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
        { success: false, error: 'معرّف الطلب مطلوب' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM library_requests WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الطلب بنجاح'
    });

  } catch (error) {
    console.error('Error deleting request:', error);
    return NextResponse.json(
      { success: false, error: 'فشل حذف الطلب' },
      { status: 500 }
    );
  }
}