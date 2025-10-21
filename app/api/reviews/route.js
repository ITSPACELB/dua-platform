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
// 📤 POST - طلب تقييم Google (بعد 20 دعاء)
// ============================================================================
export async function POST(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // فحص عدد الدعوات
        const statsResult = await query(
            `SELECT total_prayers_given FROM user_stats WHERE user_id = $1`,
            [decoded.userId]
        );

        if (statsResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'لم يتم العثور على إحصائيات' },
                { status: 404 }
            );
        }

        const prayerCount = statsResult.rows[0].total_prayers_given;

        if (prayerCount < 20) {
            return NextResponse.json({
                shouldAskReview: false,
                currentCount: prayerCount,
                requiredCount: 20,
                message: `باقي ${20 - prayerCount} دعاء لطلب التقييم`
            });
        }

        // فحص إذا طُلب منه التقييم خلال آخر 30 يوماً
        const lastRequest = await query(
            `SELECT requested_at 
             FROM review_requests 
             WHERE user_id = $1
             ORDER BY requested_at DESC
             LIMIT 1`,
            [decoded.userId]
        );

        if (lastRequest.rows.length > 0) {
            const lastRequestTime = new Date(lastRequest.rows[0].requested_at);
            const now = new Date();
            const daysPassed = (now - lastRequestTime) / (1000 * 60 * 60 * 24);

            if (daysPassed < 30) {
                return NextResponse.json({
                    shouldAskReview: false,
                    message: 'تم طلب التقييم مؤخراً'
                });
            }
        }

        // تسجيل طلب التقييم
        await query(
            `INSERT INTO review_requests (user_id, requested_at, reviewed)
             VALUES ($1, NOW(), false)`,
            [decoded.userId]
        );

        // رابط التقييم (استبدله برابط Google My Business الحقيقي)
        const reviewUrl = process.env.GOOGLE_REVIEW_URL || 'https://g.page/r/YOUR_BUSINESS_ID/review';

        return NextResponse.json({
            shouldAskReview: true,
            reviewUrl,
            message: 'نشكرك على استخدام المنصة! نسعد بتقييمك'
        });

    } catch (error) {
        console.error('Review request error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ' },
            { status: 500 }
        );
    }
}

// ============================================================================
// 📥 GET - تحديث حالة التقييم
// ============================================================================
export async function PUT(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // تحديث حالة التقييم
        await query(
            `UPDATE review_requests 
             SET reviewed = true 
             WHERE user_id = $1 
             AND reviewed = false`,
            [decoded.userId]
        );

        return NextResponse.json({
            success: true,
            message: 'شكراً لتقييمك! جزاك الله خيراً'
        });

    } catch (error) {
        console.error('Update review error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ' },
            { status: 500 }
        );
    }
}