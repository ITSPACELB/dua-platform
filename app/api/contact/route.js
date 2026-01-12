import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// ════════════════════════════════════════════════════════════
// 📧 API: إرسال رسالة التواصل عبر البريد الإلكتروني
// ════════════════════════════════════════════════════════════

export async function POST(request) {
  try {
    const { message, senderName, senderEmail } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'الرجاء كتابة رسالة' },
        { status: 400 }
      );
    }

    // إعداد الناقل (transporter) لـ Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // إعداد الرسالة
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // إرسال لنفس الإيميل
      subject: `📬 رسالة جديدة من منصة يُجيب`,
      html: `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #16a34a; text-align: center; margin-bottom: 20px;">
              📬 رسالة جديدة من منصة يُجيب
            </h2>
            
            <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="color: #166534; font-size: 16px; line-height: 1.8; margin: 0;">
                ${message.replace(/\n/g, '<br>')}
              </p>
            </div>
            
            ${senderName ? `<p style="color: #666;"><strong>الاسم:</strong> ${senderName}</p>` : ''}
            ${senderEmail ? `<p style="color: #666;"><strong>البريد:</strong> ${senderEmail}</p>` : ''}
            
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              تم الإرسال من منصة يُجيب - ${new Date().toLocaleString('ar-SA')}
            </p>
          </div>
        </div>
      `
    };

    // إرسال الرسالة
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رسالتك بنجاح! سنرد عليك قريباً إن شاء الله'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في إرسال الرسالة، حاول مرة أخرى' },
      { status: 500 }
    );
  }
}
