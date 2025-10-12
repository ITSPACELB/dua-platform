import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
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
// 📤 POST - حفظ اشتراك Web Push
// ============================================================================
export async function POST(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { subscription } = await request.json();

        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return NextResponse.json(
                { error: 'بيانات الاشتراك غير كاملة' },
                { status: 400 }
            );
        }

        // حفظ أو تحديث الاشتراك
        await query(
            `INSERT INTO subscriptions (user_id, endpoint, keys, created_at, last_used)
             VALUES ($1, $2, $3, NOW(), NOW())
             ON CONFLICT (user_id, endpoint) 
             DO UPDATE SET keys = $3, last_used = NOW()`,
            [
                decoded.userId,
                subscription.endpoint,
                JSON.stringify(subscription.keys)
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'تم حفظ اشتراك الإشعارات بنجاح'
        });

    } catch (error) {
        console.error('Subscription save error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء حفظ الاشتراك' },
            { status: 500 }
        );
    }
}

// ============================================================================
// 🗑️ DELETE - حذف اشتراك
// ============================================================================
export async function DELETE(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { endpoint } = await request.json();

        if (!endpoint) {
            return NextResponse.json(
                { error: 'endpoint مطلوب' },
                { status: 400 }
            );
        }

        await query(
            'DELETE FROM subscriptions WHERE user_id = $1 AND endpoint = $2',
            [decoded.userId, endpoint]
        );

        return NextResponse.json({
            success: true,
            message: 'تم حذف الاشتراك'
        });

    } catch (error) {
        console.error('Subscription delete error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء حذف الاشتراك' },
            { status: 500 }
        );
    }
}