// ════════════════════════════════════════════════════════════
// 📚 Publish Book from Request API
// ════════════════════════════════════════════════════════════
// المسار: app/api/admin/library/requests/[id]/publish/route.js
// ════════════════════════════════════════════════════════════

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
      return { valid: false, error: 'Unauthorized' };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return { valid: false, error: 'Insufficient permissions' };
    }

    return { valid: true, decoded };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, error: 'Invalid token' };
  }
}

// ════════════════════════════════════════════════════════════
// 📚 POST - نشر كتاب من طلب معتمد
// ════════════════════════════════════════════════════════════
export async function POST(request, { params }) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { book_file_url } = body;

    if (!book_file_url) {
      return NextResponse.json({
        success: false,
        error: 'يجب إدخال رابط الكتاب'
      }, { status: 400 });
    }

    // جلب معلومات الطلب
    const requestResult = await query(
      'SELECT * FROM library_requests WHERE id = $1 AND status = $2',
      [id, 'approved']
    );

    if (requestResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'الطلب غير موجود أو غير معتمد'
      }, { status: 404 });
    }

    const requestData = requestResult.rows[0];

    // إضافة الكتاب للمكتبة
    const insertResult = await query(
      `INSERT INTO library 
       (title, author, description, category, language, file_url, cover_url, pages, size_mb, active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING *`,
      [
        requestData.book_title,
        requestData.book_author,
        requestData.book_description,
        requestData.book_category,
        requestData.book_language,
        book_file_url,
        requestData.book_cover_url,
        requestData.book_pages,
        requestData.book_size_mb,
        true
      ]
    );

    // تحديث حالة الطلب إلى منشور
    await query(
      `UPDATE library_requests
       SET status = 'published',
           published_at = NOW()
       WHERE id = $1`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'تم نشر الكتاب بنجاح',
      book: insertResult.rows[0]
    });

  } catch (error) {
    console.error('Error publishing book:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء نشر الكتاب'
    }, { status: 500 });
  }
}