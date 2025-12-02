// ════════════════════════════════════════════════════════════
// 📝 Library Requests API - طلبات نشر الكتب
// ════════════════════════════════════════════════════════════
// المسار: app/api/library/requests/route.js
// الوظائف: POST (إرسال طلب), GET (جلب طلب)
// ════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import nodemailer from 'nodemailer';

// ════════════════════════════════════════════════════════════
// 📧 إعدادات البريد الإلكتروني
// ════════════════════════════════════════════════════════════
const ADMIN_EMAIL = 'itspacelb@gmail.com';

// إنشاء transporter للإيميل
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// ════════════════════════════════════════════════════════════
// 📧 إرسال إيميل للأدمن
// ════════════════════════════════════════════════════════════
async function sendAdminNotification(requestData) {
  try {
    const transporter = createEmailTransporter();

    const emailHTML = `
<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .section { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
        .section:last-child { border-bottom: none; }
        .section-title { color: #10b981; font-weight: bold; font-size: 18px; margin-bottom: 15px; }
        .field { margin: 10px 0; padding: 10px; background: #f9fafb; border-radius: 5px; }
        .field-label { color: #6b7280; font-size: 14px; margin-bottom: 5px; }
        .field-value { color: #111827; font-size: 16px; font-weight: 500; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 طلب نشر كتاب جديد</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">منصة يُجيب للدعاء الجماعي</p>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="section-title">📖 معلومات الكتاب</div>
                <div class="field">
                    <div class="field-label">العنوان</div>
                    <div class="field-value">${requestData.book_title}</div>
                </div>
                <div class="field">
                    <div class="field-label">المؤلف</div>
                    <div class="field-value">${requestData.book_author}</div>
                </div>
                <div class="field">
                    <div class="field-label">التصنيف</div>
                    <div class="field-value">${requestData.book_category}</div>
                </div>
                <div class="field">
                    <div class="field-label">اللغة</div>
                    <div class="field-value">${requestData.book_language}</div>
                </div>
                <div class="field">
                    <div class="field-label">الوصف</div>
                    <div class="field-value">${requestData.book_description}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">👤 معلومات مقدم الطلب</div>
                <div class="field">
                    <div class="field-label">الاسم</div>
                    <div class="field-value">${requestData.requester_name}</div>
                </div>
                <div class="field">
                    <div class="field-label">📱 رقم الهاتف</div>
                    <div class="field-value"><a href="tel:${requestData.requester_phone}" style="color: #10b981;">${requestData.requester_phone}</a></div>
                </div>
                <div class="field">
                    <div class="field-label">📧 البريد الإلكتروني</div>
                    <div class="field-value"><a href="mailto:${requestData.requester_email}" style="color: #10b981;">${requestData.requester_email}</a></div>
                </div>
                ${requestData.requester_country ? `
                <div class="field">
                    <div class="field-label">🌍 الدولة</div>
                    <div class="field-value">${requestData.requester_country}</div>
                </div>
                ` : ''}
            </div>

            <div class="section">
                <div class="section-title">📎 الروابط</div>
                <div class="field">
                    <div class="field-label">رابط الكتاب</div>
                    <div class="field-value"><a href="${requestData.book_file_url}" target="_blank" style="color: #10b981;">${requestData.book_file_url}</a></div>
                </div>
                ${requestData.book_cover_url ? `
                <div class="field">
                    <div class="field-label">رابط الغلاف</div>
                    <div class="field-value"><a href="${requestData.book_cover_url}" target="_blank" style="color: #10b981;">${requestData.book_cover_url}</a></div>
                </div>
                ` : ''}
            </div>

            ${requestData.reason_for_publishing || requestData.is_author || requestData.additional_notes ? `
            <div class="section">
                <div class="section-title">📝 معلومات إضافية</div>
                ${requestData.reason_for_publishing ? `
                <div class="field">
                    <div class="field-label">سبب النشر</div>
                    <div class="field-value">${requestData.reason_for_publishing}</div>
                </div>
                ` : ''}
                ${requestData.is_author ? `
                <div class="field">
                    <div class="field-value">✅ المقدم هو المؤلف</div>
                </div>
                ` : ''}
                ${requestData.additional_notes ? `
                <div class="field">
                    <div class="field-label">ملاحظات</div>
                    <div class="field-value">${requestData.additional_notes}</div>
                </div>
                ` : ''}
            </div>
            ` : ''}

            <div style="text-align: center;">
                <a href="https://yojeeb.com/admin" class="button">🔗 مراجعة في لوحة التحكم</a>
            </div>
        </div>

        <div class="footer">
            <p><strong>منصة يُجيب</strong> - نظام إدارة المكتبة</p>
        </div>
    </div>
</body>
</html>
    `;

    const mailOptions = {
      from: `"منصة يُجيب 📚" <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `📚 طلب نشر كتاب جديد - ${requestData.book_title}`,
      html: emailHTML
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// ════════════════════════════════════════════════════════════
// POST - إرسال طلب نشر كتاب
// ════════════════════════════════════════════════════════════
export async function POST(request) {
  try {
    const body = await request.json();

    // التحقق من الحقول الإجبارية
    const requiredFields = {
      requester_name: 'الاسم',
      requester_phone: 'رقم الهاتف',
      requester_email: 'البريد الإلكتروني',
      book_title: 'عنوان الكتاب',
      book_author: 'اسم المؤلف',
      book_description: 'وصف الكتاب',
      book_category: 'التصنيف',
      book_language: 'اللغة',
      book_file_url: 'رابط الكتاب'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json({
          success: false,
          error: `الحقل "${label}" مطلوب`
        }, { status: 400 });
      }
    }

    // التحقق من البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.requester_email)) {
      return NextResponse.json({
        success: false,
        error: 'البريد الإلكتروني غير صحيح'
      }, { status: 400 });
    }

    // إدراج الطلب
    const result = await query(
      `INSERT INTO library_requests (
        requester_name, requester_phone, requester_email, requester_country,
        book_title, book_author, book_description, book_category, book_language,
        book_file_url, book_cover_url, book_pages, book_size_mb,
        reason_for_publishing, is_author, additional_notes,
        status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'pending', NOW())
      RETURNING id`,
      [
        body.requester_name.trim(),
        body.requester_phone.trim(),
        body.requester_email.trim().toLowerCase(),
        body.requester_country?.trim() || null,
        body.book_title.trim(),
        body.book_author.trim(),
        body.book_description.trim(),
        body.book_category.trim(),
        body.book_language.trim(),
        body.book_file_url.trim(),
        body.book_cover_url?.trim() || null,
        body.book_pages || null,
        body.book_size_mb || null,
        body.reason_for_publishing?.trim() || null,
        body.is_author || false,
        body.additional_notes?.trim() || null
      ]
    );

    // إرسال إيميل للأدمن
    const emailSent = await sendAdminNotification(body);

    return NextResponse.json({
      success: true,
      message: 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً.',
      requestId: result.rows[0].id,
      emailSent
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating library request:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء إرسال الطلب. الرجاء المحاولة مرة أخرى.'
    }, { status: 500 });
  }
}

// ════════════════════════════════════════════════════════════
// GET - جلب طلب معين
// ════════════════════════════════════════════════════════════
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'معرف الطلب مطلوب'
      }, { status: 400 });
    }

    const result = await query(
      `SELECT id, book_title, book_author, status, created_at
       FROM library_requests WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'الطلب غير موجود'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      request: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching request:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ'
    }, { status: 500 });
  }
}