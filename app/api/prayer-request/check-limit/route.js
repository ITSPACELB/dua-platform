export const dynamic = 'force-dynamic';
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
// 📥 GET - فحص إذا كان المستخدم يستطيع طلب دعاء
// ============================================================================
export async function GET(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        // جلب حدود الطلبات
        const settingsResult = await query(
            `SELECT value FROM platform_settings WHERE key = 'request_limits'`
        );
        
        const limits = settingsResult.rows[0]?.value || {
            prayer_hours: 3,
            deceased_hours: 24,
            sick_hours: 6
        };

        // فحص كل نوع من أنواع الطلبات
        const prayerTypes = [
            { key: 'prayer', type: 'general', hours: limits.prayer_hours },
            { key: 'deceased', type: 'deceased', hours: limits.deceased_hours },
            { key: 'sick', type: 'sick', hours: limits.sick_hours }
        ];

        const result = {
            canRequestPrayer: true,
            canRequestDeceased: true,
            canRequestSick: true,
            nextPrayerAllowedAt: null,
            nextDeceasedAllowedAt: null,
            nextSickAllowedAt: null,
            remainingSeconds: {}
        };

        for (const pt of prayerTypes) {
            const lastRequestResult = await query(
                `SELECT created_at 
                 FROM prayer_requests 
                 WHERE user_id = $1 AND type = $2
                 ORDER BY created_at DESC 
                 LIMIT 1`,
                [decoded.userId, pt.type]
            );

            if (lastRequestResult.rows.length > 0) {
                const lastRequestTime = new Date(lastRequestResult.rows[0].created_at);
                const now = new Date();
                const hoursPassed = (now - lastRequestTime) / (1000 * 60 * 60);

                if (hoursPassed < pt.hours) {
                    const nextAllowedAt = new Date(lastRequestTime.getTime() + (pt.hours * 60 * 60 * 1000));
                    const secondsRemaining = Math.ceil((nextAllowedAt - now) / 1000);

                    if (pt.key === 'prayer') {
                        result.canRequestPrayer = false;
                        result.nextPrayerAllowedAt = nextAllowedAt;
                        result.remainingSeconds.prayer = secondsRemaining;
                    } else if (pt.key === 'deceased') {
                        result.canRequestDeceased = false;
                        result.nextDeceasedAllowedAt = nextAllowedAt;
                        result.remainingSeconds.deceased = secondsRemaining;
                    } else if (pt.key === 'sick') {
                        result.canRequestSick = false;
                        result.nextSickAllowedAt = nextAllowedAt;
                        result.remainingSeconds.sick = secondsRemaining;
                    }
                }
            }
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Check limit error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء فحص الحدود' },
            { status: 500 }
        );
    }
}
