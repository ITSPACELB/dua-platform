// ============================================================================
// 🛠️ دوال مساعدة لقاعدة البيانات - منصة يُجيب
// ============================================================================
// ✅ محدّث ليطابق Schema الصحيح تماماً
// ============================================================================

import { query } from './db.js';

/**
 * 🔍 البحث عن مستخدم بالاسم واسم الأم/الأب
 * @param {string} fullName - الاسم الكامل
 * @param {string} motherOrFatherName - اسم الأم أو الأب
 * @returns {Promise<Array>} - قائمة المستخدمين المطابقين
 */
export async function findUsersByName(fullName, motherOrFatherName) {
    const result = await query(
        `SELECT 
            id, 
            full_name, 
            mother_or_father_name,
            phone_number,
            email,
            country,
            device_fingerprint,
            is_anonymous,
            created_at
         FROM users 
         WHERE full_name = $1 AND mother_or_father_name = $2`,
        [fullName, motherOrFatherName]
    );
    
    return result.rows;
}

/**
 * 📊 الحصول على إحصائيات مستخدم
 * @param {string} userId - معرّف المستخدم (UUID)
 * @returns {Promise<Object>} - إحصائيات المستخدم
 */
export async function getUserStats(userId) {
    const result = await query(
        `SELECT 
            total_prayers,
            prayers_today,
            prayers_week,
            prayers_month,
            prayers_year,
            total_stars,
            current_level,
            interaction_rate,
            last_prayer_date,
            updated_at
         FROM user_stats 
         WHERE user_id = $1`,
        [userId]
    );
    
    return result.rows[0] || null;
}

/**
 * ⏰ فحص إذا كان المستخدم يستطيع طلب دعاء
 * @param {string} userId - معرّف المستخدم
 * @param {string} prayerType - نوع الدعاء: 'personal' | 'friend' | 'deceased' | 'sick'
 * @returns {Promise<Object>} - {canRequest: boolean, lastRequest: Date, hoursRemaining: number}
 */
export async function canUserRequestPrayer(userId, prayerType = 'personal') {
    // 1️⃣ جلب إعدادات المدة من الأدمن
    const settingsResult = await query(
        `SELECT setting_value 
         FROM admin_settings 
         WHERE setting_key = 'prayerRequestDuration'`
    );
    
    let allowedHours = 24; // افتراضي: مرة يومياً
    
    if (settingsResult.rows.length > 0) {
        try {
            const settings = JSON.parse(settingsResult.rows[0].setting_value);
            allowedHours = settings.customHours || 24;
        } catch (e) {
            console.error('Error parsing settings:', e);
        }
    }
    
    // 2️⃣ التحقق من مستوى المستخدم (المميزون = مستوى 2)
    const userStatsResult = await query(
        `SELECT current_level 
         FROM user_stats 
         WHERE user_id = $1`,
        [userId]
    );
    
    if (userStatsResult.rows.length > 0) {
        const userLevel = userStatsResult.rows[0].current_level;
        
        // المميزون (مستوى 2): يمكنهم الطلب مرتين يومياً
        if (userLevel === 2) {
            allowedHours = 12; // نصف المدة = مرتين يومياً
        }
    }
    
    // 3️⃣ فحص آخر طلب
    const lastRequestResult = await query(
        `SELECT created_at 
         FROM prayer_requests 
         WHERE user_id = $1 AND type = $2
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
    
    if (hoursPassed >= allowedHours) {
        return { canRequest: true, lastRequest, hoursRemaining: 0 };
    }
    
    return {
        canRequest: false,
        lastRequest,
        hoursRemaining: Math.ceil(allowedHours - hoursPassed),
        nextAllowedAt: new Date(lastRequest.getTime() + (allowedHours * 60 * 60 * 1000))
    };
}

/**
 * 🎯 الحصول على الطلبات النشطة
 * @param {number} limit - عدد الطلبات
 * @param {string} type - نوع الطلبات: 'all' | 'personal' | 'friend' | 'deceased' | 'sick'
 * @returns {Promise<Array>} - قائمة الطلبات
 */
export async function getActiveRequests(limit = 20, type = 'all') {
    let whereClause = "pr.status = 'active' AND (pr.expires_at IS NULL OR pr.expires_at > NOW())";
    
    if (type !== 'all') {
        whereClause += ` AND pr.type = '${type}'`;
    }
    
    const result = await query(
        `SELECT 
            pr.id,
            pr.user_id,
            pr.type,
            pr.name,
            pr.mother_or_father_name,
            pr.purpose,
            pr.prayer_count,
            pr.created_at,
            u.full_name,
            u.is_anonymous,
            us.current_level,
            us.total_stars,
            us.interaction_rate
         FROM prayer_requests pr
         LEFT JOIN users u ON pr.user_id = u.id
         LEFT JOIN user_stats us ON u.id = us.user_id
         WHERE ${whereClause}
         ORDER BY 
            CASE 
                WHEN us.current_level = 2 THEN 1  -- المميزون في الأعلى
                WHEN us.current_level = 1 THEN 2
                WHEN us.current_level = 3 THEN 3
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
 * @param {string} userId - معرّف المستخدم
 * @param {string} requestId - معرّف الطلب
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
 * 🌟 حساب مستوى التوثيق حسب معدل التفاعل
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
 * 📈 تحديث إحصائيات المستخدم (يُستدعى بعد كل دعاء)
 * @param {string} userId - معرّف المستخدم
 */
export async function updateUserStatsAfterPrayer(userId) {
    // تحديث العدادات
    await query(
        `UPDATE user_stats 
         SET 
            total_prayers = total_prayers + 1,
            prayers_today = prayers_today + 1,
            prayers_week = prayers_week + 1,
            prayers_month = prayers_month + 1,
            prayers_year = prayers_year + 1,
            last_prayer_date = NOW(),
            updated_at = NOW()
         WHERE user_id = $1`,
        [userId]
    );
    
    // حساب معدل التفاعل (يمكن تحسينه لاحقاً)
    await calculateInteractionRate(userId);
}

/**
 * 📊 حساب معدل التفاعل
 * @param {string} userId - معرّف المستخدم
 */
export async function calculateInteractionRate(userId) {
    const result = await query(
        `SELECT 
            COUNT(DISTINCT pr.id) as requests_received,
            COUNT(DISTINCT p.id) as prayers_given
         FROM prayer_requests pr
         LEFT JOIN prayers p ON p.user_id = $1
         WHERE pr.user_id = $1`,
        [userId]
    );
    
    if (result.rows.length > 0) {
        const { requests_received, prayers_given } = result.rows[0];
        
        let rate = 0;
        if (parseInt(requests_received) > 0) {
            rate = (parseInt(prayers_given) / parseInt(requests_received)) * 100;
        }
        
        await query(
            `UPDATE user_stats 
             SET interaction_rate = $1
             WHERE user_id = $2`,
            [Math.min(rate, 100), userId]
        );
    }
}

/**
 * 🏆 الحصول على أفضل مستخدمين (للعرض في الصفحة الرئيسية)
 * @param {number} limit - عدد المستخدمين
 * @returns {Promise<Array>} - قائمة أفضل المستخدمين
 */
export async function getTopUsers(limit = 2) {
    const result = await query(
        `SELECT 
            u.id,
            u.full_name,
            u.mother_or_father_name,
            u.is_anonymous,
            us.total_prayers,
            us.interaction_rate,
            us.total_stars,
            us.current_level
         FROM user_stats us
         JOIN users u ON us.user_id = u.id
         WHERE u.full_name IS NOT NULL 
           AND u.mother_or_father_name IS NOT NULL
           AND u.is_anonymous = false
         ORDER BY us.interaction_rate DESC, us.total_prayers DESC
         LIMIT $1`,
        [limit]
    );
    
    return result.rows.map(user => {
        const displayName = user.full_name;
        
        return {
            id: user.id,
            displayName,
            prayerCount: parseInt(user.total_prayers),
            stars: parseInt(user.total_stars),
            level: parseInt(user.current_level),
            verificationLevel: getVerificationLevel(parseFloat(user.interaction_rate) || 0)
        };
    });
}

/**
 * ⚙️ الحصول على إعداد من المنصة
 * @param {string} key - مفتاح الإعداد
 * @returns {Promise<any>} - قيمة الإعداد
 */
export async function getPlatformSetting(key) {
    const result = await query(
        `SELECT setting_value FROM admin_settings WHERE setting_key = $1`,
        [key]
    );
    
    if (result.rows.length === 0) return null;
    
    try {
        return JSON.parse(result.rows[0].setting_value);
    } catch (e) {
        return result.rows[0].setting_value;
    }
}

/**
 * ⚙️ تحديث إعداد في المنصة
 * @param {string} key - مفتاح الإعداد
 * @param {any} value - القيمة الجديدة
 */
export async function updatePlatformSetting(key, value) {
    const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    await query(
        `INSERT INTO admin_settings (setting_key, setting_value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (setting_key) 
         DO UPDATE SET setting_value = $2, updated_at = NOW()`,
        [key, valueStr]
    );
}

/**
 * 📊 الحصول على إحصائيات المنصة العامة
 * @returns {Promise<Object>} - إحصائيات عامة
 */
export async function getPlatformStats() {
    // عدد المؤمنين (المتفاعلين فقط)
    const believersResult = await query(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM (
           SELECT user_id FROM prayers
           UNION
           SELECT user_id FROM prayer_requests WHERE user_id IS NOT NULL
         ) as active_users`
    );
    
    // دعوات اليوم
    const todayPrayersResult = await query(
        `SELECT COUNT(*) as count
         FROM prayers
         WHERE prayed_at > CURRENT_DATE`
    );
    
    // الطلبات النشطة
    const activeRequestsResult = await query(
        `SELECT COUNT(*) as count
         FROM prayer_requests
         WHERE status = 'active' 
           AND (expires_at IS NULL OR expires_at > NOW())`
    );
    
    return {
        believersCount: parseInt(believersResult.rows[0].count) || 0,
        todayPrayers: parseInt(todayPrayersResult.rows[0].count) || 0,
        activeRequests: parseInt(activeRequestsResult.rows[0].count) || 0
    };
}
// ════════════════════════════════════════════════════════════
// 🆕 دوال جديدة لنظام الشارات - النسخة المليونية
// ════════════════════════════════════════════════════════════

/**
 * 📊 جلب المستخدمين النشطين اليوم
 * @param {number} limit - عدد المستخدمين (افتراضي: 10)
 * @returns {Promise<Array>} - قائمة المستخدمين مع بياناتهم
 */
export async function getTodayActiveUsers(limit = 10) {
    const result = await query(
        `SELECT 
            u.id,
            u.full_name,
            u.nickname,
            u.city,
            u.show_full_name,
            COALESCE(us.interaction_rate, 0) as interaction_rate,
            COUNT(p.id) as prayers_today
         FROM users u
         LEFT JOIN user_stats us ON u.id = us.user_id
         LEFT JOIN prayers p ON u.id = p.user_id 
           AND p.created_at >= CURRENT_DATE
         WHERE u.full_name IS NOT NULL
         GROUP BY u.id, u.full_name, u.nickname, u.city, u.show_full_name, us.interaction_rate
         HAVING COUNT(p.id) > 0
         ORDER BY prayers_today DESC, us.interaction_rate DESC
         LIMIT $1`,
        [limit]
    );

    return result.rows.map(user => {
        // تحديد اسم العرض
        const displayName = user.show_full_name 
            ? `${user.full_name}${user.city ? ` (${user.city})` : ''}`
            : user.nickname || user.full_name.split(' ')[0];

        // تحديد مستوى التوثيق
        const verificationLevel = getVerificationLevel(user.interaction_rate || 0);

        return {
            id: user.id,
            displayName,
            prayersToday: parseInt(user.prayers_today),
            verificationLevel
        };
    });
}

/**
 * 🎯 حساب عدد الطلبات المسموحة للمستخدم يومياً
 * @param {Object} verificationLevel - مستوى التوثيق
 * @param {Array} activeAchievements - الإنجازات النشطة
 * @returns {number} - عدد الطلبات المسموح بها
 */
export function getMaxPrayersPerDay(verificationLevel, activeAchievements = []) {
    let base = 1; // القيمة الافتراضية للجميع

    // الحد الأساسي حسب الشارة
    if (verificationLevel?.name === 'GOLD') {
        base = 5; // الذهبي: 5 طلبات يومياً
    } else if (verificationLevel?.name === 'GREEN') {
        base = 3; // الأخضر: 3 طلبات يومياً
    } else if (verificationLevel?.name === 'BLUE') {
        base = 2; // الأزرق: 2 طلبات يومياً
    }

    // إضافة من الإنجازات المؤقتة
    const hasDoublePrayer = activeAchievements.some(
        a => a.achievement_type === 'double_prayer' && a.is_active
    );
    
    if (hasDoublePrayer) {
        base += 1; // إنجاز الدعاء المضاعف يضيف طلب واحد
    }

    return base;
}

/**
 * ⏰ التحقق من حالة الشارة للمستخدم
 * @param {string} userId - معرّف المستخدم (UUID)
 * @returns {Promise<Object>} - حالة الشارة الكاملة
 */
export async function checkBadgeStatus(userId) {
    const result = await query(
        `SELECT * FROM check_badge_status($1)`,
        [userId]
    );

    if (result.rows.length === 0) {
        return {
            current_rate: 0,
            level_name: 'NONE',
            status: 'active',
            days_in_grace: 0,
            maintain_threshold: 0
        };
    }

    return result.rows[0];
}