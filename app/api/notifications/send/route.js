import { NextResponse } from 'next/server';
import { sendNotificationToUser } from '@/lib/notification-service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function verifyToken(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// ============================================================================
// 📤 POST - إرسال إشعار (للاختبار)
// ============================================================================
export async function POST(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { title, body, url, type } = await request.json();

        if (!title || !body) {
            return NextResponse.json(
                { error: 'العنوان والمحتوى مطلوبان' },
                { status: 400 }
            );
        }

        const payload = {
            type: type || 'general',
            title,
            body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            url: url || '/',
            data: {}
        };

        const result = await sendNotificationToUser(decoded.userId, payload);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'تم إرسال الإشعار بنجاح'
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.reason || result.error
            }, { status: 400 });
        }

    } catch (error) {
        console.error('Send notification error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء إرسال الإشعار' },
            { status: 500 }
        );
    }
}