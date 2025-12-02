// ════════════════════════════════════════════════════════════
// 📚 Books API - جلب الكتب المنشورة
// ════════════════════════════════════════════════════════════
// المسار: app/api/books/route.js
// الوظيفة: GET - جلب جميع الكتب النشطة من المكتبة
// ════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ════════════════════════════════════════════════════════════
// GET - جلب الكتب المنشورة
// ════════════════════════════════════════════════════════════
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let sql = `
      SELECT 
        id,
        title,
        author,
        description,
        category,
        language,
        file_url as "downloadUrl",
        cover_image_url as "coverUrl",
        pages,
        size_mb,
        views_count,
        downloads_count,
        created_at
      FROM library
      WHERE is_active = true
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // فلترة حسب التصنيف
    if (category) {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    // ترتيب حسب الأحدث
    sql += ' ORDER BY display_order ASC, created_at DESC';
    
    const result = await query(sql, params);
    
    // تنسيق حجم الملف
    const books = result.rows.map(book => ({
      ...book,
      fileSize: book.size_mb ? `${book.size_mb} MB` : null
    }));
    
    return NextResponse.json({
      success: true,
      books,
      count: books.length
    });
    
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء جلب الكتب',
      books: []
    }, { status: 500 });
  }
}