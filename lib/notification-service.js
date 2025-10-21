// ============================================================================
// 🔔 خدمة الإشعارات - منصة يُجيب
// ============================================================================

import webpush from 'web-push';
import { query } from './db';

// إعداد Web Push
webpush.setVapidDetails(
  'mailto:' + (process.env.ADMIN_EMAIL || 'haydar.cd@gmail.com'),
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * 📨 إرسال إشعار لمستخدم واحد
 * @param {number} userId - معرّف المستخدم
 * @param {Object} payload - محتوى الإشعار
 */
export async function sendNotificationToUser(userId, payload) {
    try {
        // جلب اشتراكات المستخدم
        const subscriptions = await query(
            'SELECT endpoint, keys FROM subscriptions WHERE user_id = $1',
            [userId]
        );

        if (subscriptions.rows.length === 0) {
            console.log(`No subscriptions found for user ${userId}`);
            return { success: false, reason: 'no_subscription' };
        }

        const results = [];

        // إرسال لكل اشتراك (قد يكون لديه أجهزة متعددة)
        for (const sub of subscriptions.rows) {
            try {
                const subscription = {
                    endpoint: sub.endpoint,
                    keys: typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys
                };

                await webpush.sendNotification(
                    subscription,
                    JSON.stringify(payload)
                );

                results.push({ success: true, endpoint: sub.endpoint });

                // تحديث آخر استخدام
                await query(
                    'UPDATE subscriptions SET last_used = NOW() WHERE endpoint = $1',
                    [sub.endpoint]
                );

            } catch (error) {
                console.error(`Failed to send to ${sub.endpoint}:`, error);
                
                // حذف الاشتراكات المنتهية
                if (error.statusCode === 410) {
                    await query(
                        'DELETE FROM subscriptions WHERE endpoint = $1',
                        [sub.endpoint]
                    );
                }

                results.push({ success: false, endpoint: sub.endpoint, error: error.message });
            }
        }

        // حفظ في سجل الإشعارات
        await query(
            `INSERT INTO notifications (user_id, type, title, body, url, data, sent_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [
                userId,
                payload.type || 'general',
                payload.title,
                payload.body,
                payload.url || '/',
                JSON.stringify(payload.data || {})
            ]
        );

        return { success: true, results };

    } catch (error) {
        console.error('Send notification error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 📢 إرسال إشعار لعدة مستخدمين
 * @param {Array<number>} userIds - قائمة معرّفات المستخدمين
 * @param {Object} payload - محتوى الإشعار
 */
export async function sendNotificationToUsers(userIds, payload) {
    const results = [];

    for (const userId of userIds) {
        const result = await sendNotificationToUser(userId, payload);
        results.push({ userId, ...result });
    }

    return results;
}

/**
 * 🌍 إرسال إشعار لكل المستخدمين النشطين
 * @param {Object} payload - محتوى الإشعار
 * @param {number} excludeUserId - معرّف المستخدم المستثنى (اختياري)
 */
export async function sendNotificationToAllActive(payload, excludeUserId = null) {
    try {
        // جلب المستخدمين النشطين (آخر 7 أيام)
        let queryText = `
            SELECT DISTINCT u.id 
            FROM users u
            JOIN subscriptions s ON u.id = s.user_id
            WHERE u.last_login > NOW() - INTERVAL '7 days'
        `;

        const params = [];
        
        if (excludeUserId) {
            queryText += ' AND u.id != $1';
            params.push(excludeUserId);
        }

        const activeUsers = await query(queryText, params);
        const userIds = activeUsers.rows.map(row => row.id);

        console.log(`Sending notification to ${userIds.length} active users`);

        return await sendNotificationToUsers(userIds, payload);

    } catch (error) {
        console.error('Send to all active error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 🤲 إشعار طلب دعاء جديد
 * @param {number} requestId - معرّف الطلب
 */
export async function notifyNewPrayerRequest(requestId) {
    try {
        // جلب بيانات الطلب
        const requestData = await query(
            `SELECT 
                pr.requester_id,
                pr.prayer_type,
                u.full_name,
                u.nickname,
                u.show_full_name,
                u.city
             FROM prayer_requests pr
             JOIN users u ON pr.requester_id = u.id
             WHERE pr.id = $1`,
            [requestId]
        );

        if (requestData.rows.length === 0) return;

        const req = requestData.rows[0];
        
        // تحديد اسم العرض
        let displayName;
        if (req.prayer_type === 'deceased') {
            displayName = 'متوفى';
        } else if (req.prayer_type === 'sick') {
            displayName = 'مريض';
        } else {
            displayName = req.nickname || (req.show_full_name 
                ? `${req.full_name}${req.city ? ` (${req.city})` : ''}`
                : `${req.full_name.split(' ')[0]}...`);
        }

        const payload = {
            type: 'prayer_request',
            title: '🤲 طلب دعاء جديد',
            body: `${displayName} يطلب دعاءكم`,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            url: '/',
            data: { requestId }
        };

        // إرسال لكل المستخدمين النشطين ما عدا صاحب الطلب
        const results = await sendNotificationToAllActive(payload, req.requester_id);

        // تحديث عدد الإشعارات المستلمة لكل مستخدم
        const successfulUsers = results.filter(r => r.success).map(r => r.userId);
        
        for (const userId of successfulUsers) {
            await query(
                `UPDATE user_stats 
                 SET 
                    total_notifications_received = total_notifications_received + 1,
                    interaction_rate = CASE 
                        WHEN total_prayers_given > 0 
                        THEN (total_prayers_given::float / (total_notifications_received + 1) * 100)
                        ELSE 0
                    END
                 WHERE user_id = $1`,
                [userId]
            );
        }

        return results;

    } catch (error) {
        console.error('Notify new prayer request error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * ✅ إشعار باستجابة دعاء
 * @param {number} requestId - معرّف الطلب المستجاب
 */
export async function notifyPrayerAnswered(requestId) {
    try {
        // جلب كل من دعا لهذا الطلب
        const prayers = await query(
            `SELECT DISTINCT p.user_id, u.full_name
             FROM prayers p
             JOIN users u ON p.user_id = u.id
             WHERE p.request_id = $1`,
            [requestId]
        );

        if (prayers.rows.length === 0) return;

        // جلب بيانات الطلب
        const requestData = await query(
            `SELECT 
                u.full_name,
                u.nickname,
                pr.prayer_type
             FROM prayer_requests pr
             JOIN users u ON pr.requester_id = u.id
             WHERE pr.id = $1`,
            [requestId]
        );

        const req = requestData.rows[0];
        const requesterName = req.nickname || req.full_name.split(' ')[0];

        const payload = {
            type: 'prayer_answered',
            title: '✅ بشرى سارة',
            body: `تحققت حاجة ${requesterName} بفضل الله! دعاؤك كان له أثر إن شاء الله`,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            url: '/',
            data: { requestId }
        };

        const userIds = prayers.rows.map(row => row.user_id);
        return await sendNotificationToUsers(userIds, payload);

    } catch (error) {
        console.error('Notify prayer answered error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 🌍 إشعار دعاء جماعي
 * @param {number} collectivePrayerId - معرّف الدعاء الجماعي
 */
export async function notifyCollectivePrayer(collectivePrayerId) {
    try {
        const prayerData = await query(
            `SELECT 
                cp.user_id,
                cp.message,
                u.full_name,
                u.nickname,
                us.interaction_rate
             FROM collective_prayers cp
             JOIN users u ON cp.user_id = u.id
             LEFT JOIN user_stats us ON u.id = us.user_id
             WHERE cp.id = $1`,
            [collectivePrayerId]
        );

        if (prayerData.rows.length === 0) return;

        const prayer = prayerData.rows[0];
        const userName = prayer.nickname || prayer.full_name.split(' ')[0];

        // إضافة أيقونة التوثيق
        let badge = '';
        if (prayer.interaction_rate >= 98) badge = '👑';
        else if (prayer.interaction_rate >= 90) badge = '✓✓';

        const payload = {
            type: 'collective',
            title: `🌍 دعاء جماعي من ${userName} ${badge}`,
            body: prayer.message || 'مؤمن موثق يدعو لكل المؤمنين',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            url: '/',
            data: { collectivePrayerId }
        };

        return await sendNotificationToAllActive(payload, prayer.user_id);

    } catch (error) {
        console.error('Notify collective prayer error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * ⭐ إشعار دعاء خاص
 * @param {number} privatePrayerId - معرّف الدعاء الخاص
 */
export async function notifyPrivatePrayer(privatePrayerId) {
    try {
        const prayerData = await query(
            `SELECT 
                pp.receiver_id,
                pp.message,
                u.full_name,
                u.nickname
             FROM private_prayers pp
             JOIN users u ON pp.sender_id = u.id
             WHERE pp.id = $1`,
            [privatePrayerId]
        );

        if (prayerData.rows.length === 0) return;

        const prayer = prayerData.rows[0];
        const senderName = prayer.nickname || prayer.full_name.split(' ')[0];

        const payload = {
            type: 'private',
            title: `⭐ دعاء خاص من ${senderName} 👑`,
            body: prayer.message,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            url: '/prayers/private',
            data: { privatePrayerId }
        };

        return await sendNotificationToUser(prayer.receiver_id, payload);

    } catch (error) {
        console.error('Notify private prayer error:', error);
        return { success: false, error: error.message };
    }
}