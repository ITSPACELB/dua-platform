// ============================================================================
// 🛠️ دوال مساعدة لقاعدة البيانات - منصة يُجيب
// ============================================================================

import { query } from './db';

/**
 * 🔍 البحث عن مستخدم بالاسم واسم الأم
 * @param {string} fullName - الاسم الكامل
 * @param {string} motherName - اسم الأم
 * @returns {Promise<Array>} - قائمة المستخدمين المطابقين
 */
export async function findUsersByName(fullName, motherName) {
    const result = await query(
        `SELECT 
            id, 
            full_name, 
            mother_name, 
            unique_question,
            question_answer_hash,
            city,
            show_full_name,
            nickname,
            phone_number,
            phone_verified,
            created_at
         FROM users 
         WHERE full_name = $1 AND mother_name = $2`,
        [fullName, motherName]
    );
    
    return result.rows;
}

/**
 * 📊 الحصول على إحصائيات مستخدم
 * @param {number} userId - معرّف المستخدم
 * @returns {Promise<Object>} - إحصائيات المستخدم
 */
export async function getUserStats(userId) {
    const result = await query(
        `SELECT 
            total_prayers_given,
            total_notifications_received,
            interaction_rate,
            last_prayer_date
         FROM user_stats 
         WHERE user_id = $1`,
        [userId]
    );
    
    return result.rows[0] || null;
}

/**
 * ⏰ فحص إذا كان المستخدم يستطيع طلب دعاء
 * @param {number} userId - معرّف المستخدم
 * @param {string} prayerType - نوع الدعاء: 'general' | 'deceased' | 'sick'
 * @returns {Promise<Object>} - {canRequest: boolean, lastRequest: Date, hoursRemaining: number}
 */
export async function canUserRequestPrayer(userId, prayerType = 'general') {
    const settingsResult = await query(
        `SELECT value FROM platform_settings WHERE key = 'request_limits'`
    );
    
    const limits = settingsResult.rows[0]?.value || {
        prayer_hours: 3,
        deceased_hours: 24,
        sick_hours: 6
    };
    
    let hoursLimit;
    if (prayerType === 'deceased') {
        hoursLimit = limits.deceased_hours;
    } else if (prayerType === 'sick') {
        hoursLimit = limits.sick_hours;
    } else {
        hoursLimit = limits.prayer_hours;
    }
    
    const lastRequestResult = await query(
        `SELECT created_at 
         FROM prayer_requests 
         WHERE requester_id = $1 AND prayer_type = $2
         ORDER BY created_at DESC 
         LIMIT 1`,
        [userId, prayerType]
    );
    
    if (lastRequestResult.rows.length === 0) {
        return { canRequest: true, lastRequest: null, hoursRemaining: 0 };
    }
    
    const lastRequest = new Date(lastRequestResult.rows[0].created_at);
    const now = new Date();
    const hoursPassed = (now - lastRequest) / (1000 * 60 * 60);
    
    if (hoursPassed >= hoursLimit) {
        return { canRequest: true, lastRequest, hoursRemaining: 0 };
    }
    
    return {
        canRequest: false,
        lastRequest,
        hoursRemaining: Math.ceil(hoursLimit - hoursPassed),
        nextAllowedAt: new Date(lastRequest.getTime() + (hoursLimit * 60 * 60 * 1000))
    };
}

/**
 * 🎯 الحصول على الطلبات النشطة
 * @param {number} limit - عدد الطلبات
 * @param {string} type - نوع الطلبات: 'all' | 'general' | 'deceased' | 'sick'
 * @returns {Promise<Array>} - قائمة الطلبات
 */
export async function getActiveRequests(limit = 20, type = 'all') {
    let whereClause = "pr.status = 'active' AND pr.expires_at > NOW()";
    
    if (type !== 'all') {
        whereClause += ` AND pr.prayer_type = '${type}'`;
    }
    
    const result = await query(
        `SELECT 
            pr.id,
            pr.requester_id,
            pr.prayer_type,
            pr.deceased_name,
            pr.deceased_mother_name,
            pr.relation,
            pr.is_name_private,
            pr.sick_person_name,
            pr.sick_person_mother_name,
            pr.created_at,
            pr.total_prayers_received,
            u.full_name,
            u.nickname,
            u.city,
            u.show_full_name,
            us.interaction_rate
         FROM prayer_requests pr
         JOIN users u ON pr.requester_id = u.id
         LEFT JOIN user_stats us ON u.id = us.user_id
         WHERE ${whereClause}
         ORDER BY 
            CASE 
                WHEN us.interaction_rate >= 98 THEN 1
                WHEN us.interaction_rate >= 90 THEN 2
                WHEN us.interaction_rate >= 80 THEN 3
                ELSE 4
            END,
            pr.created_at DESC
         LIMIT $1`,
        [limit]
    );
    
    return result.rows;
}

/**
 * 🤲 فحص إذا كان المستخدم قد دعا لطلب معين
 * @param {number} userId - معرّف المستخدم
 * @param {number} requestId - معرّف الطلب
 * @returns {Promise<boolean>} - true إذا كان قد دعا
 */
export async function hasUserPrayed(userId, requestId) {
    const result = await query(
        `SELECT id FROM prayers 
         WHERE user_id = $1 AND request_id = $2`,
        [userId, requestId]
    );
    
    return result.rows.length > 0;
}

/**
 * 🌟 حساب مستوى التوثيق
 * @param {number} interactionRate - معدل التفاعل (0-100)
 * @returns {Object} - بيانات مستوى التوثيق
 */
export function getVerificationLevel(interactionRate) {
    if (interactionRate >= 98) {
        return {
            name: 'GOLD',
            nameAr: 'التوثيق الذهبي',
            color: 'amber',
            icon: '👑',
            threshold: 98
        };
    } else if (interactionRate >= 90) {
        return {
            name: 'GREEN',
            nameAr: 'التوثيق الأخضر',
            color: 'emerald',
            icon: '✓✓',
            threshold: 90
        };
    } else if (interactionRate >= 80) {
        return {
            name: 'BLUE',
            nameAr: 'التوثيق الأزرق',
            color: 'blue',
            icon: '✓',
            threshold: 80
        };
    } else {
        return {
            name: 'NONE',
            nameAr: 'بدون توثيق',
            color: 'stone',
            icon: '',
            threshold: 0
        };
    }
}

/**
 * 📈 تحديث عداد الإشعارات المستلمة
 * @param {number} userId - معرّف المستخدم
 */
export async function incrementNotificationsReceived(userId) {
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

/**
 * 🔔 فحص إذا كان المستخدم لديه اشتراك إشعارات
 * @param {number} userId - معرّف المستخدم
 * @returns {Promise<Array>} - قائمة الاشتراكات
 */
export async function getUserSubscriptions(userId) {
    const result = await query(
        `SELECT endpoint, keys FROM subscriptions 
         WHERE user_id = $1`,
        [userId]
    );
    
    return result.rows;
}

/**
 * 🏆 الحصول على أفضل مستخدم أسبوعياً
 * @returns {Promise<Object>} - بيانات أفضل مستخدم
 */
export async function getTopWeeklyUser() {
    const result = await query(
        `SELECT 
            u.id,
            u.full_name,
            u.nickname,
            u.city,
            u.show_full_name,
            COUNT(p.id) as prayer_count,
            us.interaction_rate
         FROM prayers p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN user_stats us ON u.id = us.user_id
         WHERE p.prayed_at > NOW() - INTERVAL '7 days'
         GROUP BY u.id, u.full_name, u.nickname, u.city, u.show_full_name, us.interaction_rate
         ORDER BY prayer_count DESC
         LIMIT 1`
    );
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    const displayName = user.nickname 
        ? user.nickname
        : user.show_full_name
            ? `${user.full_name}${user.city ? ` (${user.city})` : ''}`
            : `${user.full_name.split(' ')[0]}...`;
    
    return {
        id: user.id,
        displayName,
        prayerCount: parseInt(user.prayer_count),
        verificationLevel: getVerificationLevel(user.interaction_rate || 0)
    };
}

/**
 * ⚙️ الحصول على إعداد من المنصة
 * @param {string} key - مفتاح الإعداد
 * @returns {Promise<any>} - قيمة الإعداد
 */
export async function getPlatformSetting(key) {
    const result = await query(
        `SELECT value FROM platform_settings WHERE key = $1`,
        [key]
    );
    
    return result.rows[0]?.value || null;
}

/**
 * ⚙️ تحديث إعداد في المنصة
 * @param {string} key - مفتاح الإعداد
 * @param {Object} value - القيمة الجديدة
 */
export async function updatePlatformSetting(key, value) {
    await query(
        `INSERT INTO platform_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) 
         DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
    );
}