// ════════════════════════════════════════════════════════════
// 📤 Upload Book Cover API - رفع صور أغلفة الكتب
// ════════════════════════════════════════════════════════════
// المسار: app/api/upload/book-cover/route.js
// ════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
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
// 📤 POST - رفع صورة غلاف كتاب
// ════════════════════════════════════════════════════════════
export async function POST(request) {
  const auth = verifyAdmin(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('cover');

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'لم يتم إرفاق ملف'
      }, { status: 400 });
    }

    // التحقق من نوع الملف
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'نوع الملف غير مدعوم. يرجى رفع صورة (JPG, PNG, WEBP)'
      }, { status: 400 });
    }

    // التحقق من حجم الملف (أقل من 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'حجم الملف كبير جداً. الحد الأقصى 5MB'
      }, { status: 400 });
    }

    // إنشاء اسم ملف فريد
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const fileName = `book-cover-${timestamp}-${randomString}.${extension}`;

    // مسار حفظ الملف
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'book-covers');
    
    // إنشاء المجلد إذا لم يكن موجوداً
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    // تحويل الملف لـ buffer وحفظه
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // رابط الصورة
    const fileUrl = `/uploads/book-covers/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      message: 'تم رفع الصورة بنجاح'
    });

  } catch (error) {
    console.error('Error uploading cover:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء رفع الصورة'
    }, { status: 500 });
  }
}

// ════════════════════════════════════════════════════════════
// ℹ️ GET - معلومات عن API
// ════════════════════════════════════════════════════════════
export async function GET() {
  return NextResponse.json({
    info: 'Book Cover Upload API',
    maxSize: '5MB',
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    method: 'POST',
    requiresAuth: true
  });
}