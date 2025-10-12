import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { notifyNewPrayerRequest } from '@/lib/notification-service';

// ============================================================================
// 📅 Cron Job - إرسال إشعارات الطلبات الجديدة (كل 30 دقيقة)
// ============================================================================
export async function GET(request) {
    try {
        // التحقق من مفتاح الأمان (Cron Secret)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET || 'your-cron-secret-key';

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // جلب الفترة الزمنية من الإعدادات
        const settingsResult = await query(
            `SELECT value FROM platform_settings WHERE key = 'notification_interval'`
        );

        const intervalMinutes = settingsResult.rows[0]?.value?.minutes || 30;

        // البحث عن الطلبات التي لم يُرسل لها إشعار بعد
        const pendingRequests = await query(
            `SELECT id, created_at
             FROM prayer_requests
             WHERE status = 'active'
             AND expires_at > NOW()
             AND (
                last_notification_sent IS NULL 
                OR last_notification_sent < NOW() - INTERVAL '${intervalMinutes} minutes'
             )
             ORDER BY created_at ASC
             LIMIT 50`
        );

        if (pendingRequests.rows.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No pending notifications',
                count: 0
            });
        }

        const results = [];

        // إرسال إشعار لكل طلب
        for (const request of pendingRequests.rows) {
            try {
                const notificationResult = await notifyNewPrayerRequest(request.id);
                
                // تحديث وقت آخر إشعار
                await query(
                    'UPDATE prayer_requests SET last_notification_sent = NOW() WHERE id = $1',
                    [request.id]
                );

                results.push({
                    requestId: request.id,
                    success: true,
                    sentTo: notificationResult.filter(r => r.success).length
                });

            } catch (error) {
                console.error(`Failed to notify request ${request.id}:`, error);
                results.push({
                    requestId: request.id,
                    success: false,
                    error: error.message
                });
            }
        }

        const successCount = results.filter(r => r.success).length;

        return NextResponse.json({
            success: true,
            message: `Sent ${successCount} notifications`,
            count: successCount,
            total: pendingRequests.rows.length,
            results
        });

    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { error: 'Cron job failed', message: error.message },
            { status: 500 }
        );
    }
}

// ============================================================================
// 📤 POST - تشغيل يدوي (للاختبار)
// ============================================================================
export async function POST(request) {
    return GET(request);
}