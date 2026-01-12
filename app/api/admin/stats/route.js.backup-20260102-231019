export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================================================
// 🔐 التحقق من صلاحيات المسؤول
// ============================================================================
async function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const adminCheck = await query(
      'SELECT role FROM admin_users WHERE id = $1',
      [decoded.adminId]
    );

    if (adminCheck.rows.length === 0) {
      return null;
    }

    return { ...decoded, role: adminCheck.rows[0].role };
  } catch (error) {
    console.error('Admin verification error:', error);
    return null;
  }
}

// ============================================================================
// 📊 GET - جلب إحصائيات المنصة (للمدير)
// ============================================================================
export async function GET(request) {
    try {
        // ✅ التحقق من صلاحية المدير
        const admin = await verifyAdmin(request);
        
        if (!admin) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const fingerprint = searchParams.get('fingerprint');

        // 1️⃣ عداد المؤمنين (من دعا + من طلب الدعاء = المتفاعلين)
        const believersCountResult = await query(
            `SELECT COUNT(DISTINCT user_id) as count 
             FROM (
                 SELECT user_id FROM prayers WHERE prayed_at IS NOT NULL
                 UNION
                 SELECT user_id FROM prayer_requests
             ) as believers`
        );
        const believersCount = parseInt(believersCountResult.rows[0].count) || 0;

        // 2️⃣ إجمالي الدعوات على المنصة
        const totalPrayersResult = await query(
            'SELECT COUNT(*) as count FROM prayers'
        );
        const totalPrayers = parseInt(totalPrayersResult.rows[0].count) || 0;

        // 3️⃣ الدعوات النشطة اليوم
        const todayPrayersResult = await query(
            `SELECT COUNT(*) as count FROM prayers 
             WHERE DATE(prayed_at) = CURRENT_DATE`
        );
        const todayPrayers = parseInt(todayPrayersResult.rows[0].count) || 0;

        // 4️⃣ طلبات الدعاء النشطة
        const activeRequestsResult = await query(
            `SELECT COUNT(*) as count FROM prayer_requests 
             WHERE status = 'active'`
        );
        const activeRequests = parseInt(activeRequestsResult.rows[0].count) || 0;

        // 5️⃣ توزيع أنواع الطلبات
        const requestTypesResult = await query(
            `SELECT type, COUNT(*) as count 
             FROM prayer_requests 
             WHERE status = 'active'
             GROUP BY type`
        );
        const requestTypes = {
            personal: 0,
            friend: 0,
            deceased: 0,
            sick: 0
        };
        requestTypesResult.rows.forEach(row => {
            requestTypes[row.type] = parseInt(row.count);
        });

        // 6️⃣ الأكثر تفاعلاً (من إعدادات الأدمن)
        const topActiveResult = await query(
            `SELECT setting_value 
             FROM admin_settings 
             WHERE setting_key = 'top_active_users'`
        );
        let topActiveUsers = [];
        if (topActiveResult.rows.length > 0) {
            topActiveUsers = topActiveResult.rows[0].setting_value || [];
        }

        // 7️⃣ الدعاء الجماعي الفعّال
        const collectivePrayerResult = await query(
            `SELECT content, type, timing, start_date, end_date 
             FROM collective_prayer 
             WHERE is_active = true 
             AND (start_date IS NULL OR start_date <= NOW())
             AND (end_date IS NULL OR end_date >= NOW())
             ORDER BY created_at DESC 
             LIMIT 1`
        );
        const collectivePrayer = collectivePrayerResult.rows[0] || null;

        // 8️⃣ البانر الفعّال
        const bannerResult = await query(
            `SELECT content, link 
             FROM banner 
             WHERE is_active = true 
             ORDER BY updated_at DESC 
             LIMIT 1`
        );
        const banner = bannerResult.rows[0] || null;

        // 9️⃣ إحصائيات المستخدم (إن كان مسجلاً)
        let userStats = null;
        if (userId) {
            const userStatsResult = await query(
                `SELECT 
                    total_prayers,
                    prayers_today,
                    prayers_week,
                    prayers_month,
                    prayers_year,
                    total_stars,
                    current_level,
                    last_prayer_date
                 FROM user_stats 
                 WHERE user_id = $1`,
                [userId]
            );
            
            if (userStatsResult.rows.length > 0) {
                userStats = userStatsResult.rows[0];
                
                // 🔟 من دعا لي اليوم
                const prayedForMeResult = await query(
                    `SELECT COUNT(DISTINCT p.user_id) as count 
                     FROM prayers p
                     INNER JOIN prayer_requests pr ON p.request_id = pr.id
                     WHERE pr.user_id = $1 
                     AND DATE(p.prayed_at) = CURRENT_DATE`,
                    [userId]
                );
                userStats.prayed_for_me_today = parseInt(prayedForMeResult.rows[0].count) || 0;

                // 1️⃣1️⃣ إنجازاتي
                const achievementsResult = await query(
                    `SELECT 
                        achievement_type,
                        stars_earned,
                        achieved_at
                     FROM achievements 
                     WHERE user_id = $1 
                     ORDER BY achieved_at DESC 
                     LIMIT 10`,
                    [userId]
                );
                userStats.achievements = achievementsResult.rows;
            }
        } else if (fingerprint) {
            // للزوار: جلب بيانات محدودة بناءً على البصمة
            const userByFingerprintResult = await query(
                `SELECT id FROM users WHERE device_fingerprint = $1`,
                [fingerprint]
            );
            
            if (userByFingerprintResult.rows.length > 0) {
                const tempUserId = userByFingerprintResult.rows[0].id;
                
                const userStatsResult = await query(
                    `SELECT 
                        total_prayers,
                        prayers_today,
                        prayers_week
                     FROM user_stats 
                     WHERE user_id = $1`,
                    [tempUserId]
                );
                
                if (userStatsResult.rows.length > 0) {
                    userStats = {
                        total_prayers: userStatsResult.rows[0].total_prayers,
                        prayers_today: userStatsResult.rows[0].prayers_today,
                        prayers_week: userStatsResult.rows[0].prayers_week,
                        limited: true // زائر
                    };
                }
            }
        }

        return NextResponse.json({
            success: true,
            stats: {
                believersCount, // عداد المؤمنين المتفاعلين
                totalPrayers,
                todayPrayers,
                activeRequests,
                requestTypes,
                topActiveUsers,
                collectivePrayer,
                banner,
                userStats
            }
        });

    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب الإحصائيات', details: error.message },
            { status: 500 }
        );
    }
}

// ============================================================================
// 📊 POST - تحديث إحصائيات المستخدم بعد الدعاء
// ============================================================================
export async function POST(request) {
    try {
        // ✅ التحقق من صلاحية المدير
        const admin = await verifyAdmin(request);
        
        if (!admin) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, fingerprint, action } = body;

        if (!userId && !fingerprint) {
            return NextResponse.json(
                { error: 'معرف المستخدم أو البصمة مطلوبة' },
                { status: 400 }
            );
        }

        let userIdToUpdate = userId;

        // إذا كان زائر (بالبصمة فقط)
        if (!userId && fingerprint) {
            const userResult = await query(
                `SELECT id FROM users WHERE device_fingerprint = $1`,
                [fingerprint]
            );
            
            if (userResult.rows.length === 0) {
                // إنشاء مستخدم مؤقت
                const newUserResult = await query(
                    `INSERT INTO users (device_fingerprint, is_anonymous, created_at) 
                     VALUES ($1, true, NOW()) 
                     RETURNING id`,
                    [fingerprint]
                );
                userIdToUpdate = newUserResult.rows[0].id;
                
                // إنشاء سجل إحصائيات
                await query(
                    `INSERT INTO user_stats (user_id, total_prayers, prayers_today, prayers_week, prayers_month, prayers_year, total_stars, current_level) 
                     VALUES ($1, 0, 0, 0, 0, 0, 0, 0)`,
                    [userIdToUpdate]
                );
            } else {
                userIdToUpdate = userResult.rows[0].id;
            }
        }

        // تحديث الإحصائيات
        if (action === 'prayed') {
            await query(
                `UPDATE user_stats 
                 SET 
                    total_prayers = total_prayers + 1,
                    prayers_today = prayers_today + 1,
                    prayers_week = prayers_week + 1,
                    prayers_month = prayers_month + 1,
                    prayers_year = prayers_year + 1,
                    updated_at = NOW()
                 WHERE user_id = $1`,
                [userIdToUpdate]
            );

            // 🎲 التحقق من القرعة وتوزيع المستويات
            await checkAndAssignLevels(userIdToUpdate);
        }

        return NextResponse.json({
            success: true,
            message: 'تم تحديث الإحصائيات بنجاح'
        });

    } catch (error) {
        console.error('Update stats error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء تحديث الإحصائيات', details: error.message },
            { status: 500 }
        );
    }
}

// ============================================================================
// 🎲 دالة القرعة وتوزيع المستويات
// ============================================================================
async function checkAndAssignLevels(userId) {
    try {
        // جلب نسب التفاعل من جدول level_ratios
        const ratiosResult = await query(
            `SELECT level_1, level_2, level_3 
             FROM level_ratios 
             ORDER BY id DESC 
             LIMIT 1`
        );
        
        let ratios = {
            level1: 70,  // المستوى الأول (3 نجوم + ظهور اسمين)
            level2: 20, // المستوى الثاني (نجمتين + دعاء مرتين)
            level3: 10  // المستوى الثالث (نجمة + اختيار آية)
        };
        
        if (ratiosResult.rows.length > 0) {
            ratios = {
                level1: ratiosResult.rows[0].level_1,
                level2: ratiosResult.rows[0].level_2,
                level3: ratiosResult.rows[0].level_3
            };
        }

        // التحقق من آخر إنجاز (72 ساعة)
        const lastAchievementResult = await query(
            `SELECT achieved_at 
             FROM achievements 
             WHERE user_id = $1 
             ORDER BY achieved_at DESC 
             LIMIT 1`,
            [userId]
        );

        if (lastAchievementResult.rows.length > 0) {
            const lastAchievement = lastAchievementResult.rows[0].achieved_at;
            const hoursSinceLastAchievement = (Date.now() - new Date(lastAchievement).getTime()) / (1000 * 60 * 60);
            
            if (hoursSinceLastAchievement < 72) {
                return; // لم تمر 72 ساعة بعد
            }
        }

        // القرعة العشوائية
        const randomNumber = Math.random() * 100;
        
        let achievementType = null;
        let starsEarned = 0;

        if (randomNumber < ratios.level1) {
            // المستوى الأول
            achievementType = 'name_display';
            starsEarned = 3;
        } else if (randomNumber < ratios.level1 + ratios.level2) {
            // المستوى الثاني
            achievementType = 'double_prayer';
            starsEarned = 2;
        } else if (randomNumber < ratios.level1 + ratios.level2 + ratios.level3) {
            // المستوى الثالث
            achievementType = 'verse_selection';
            starsEarned = 1;
        }

        // إذا فاز المستخدم
        if (achievementType) {
            // إضافة الإنجاز
            await query(
                `INSERT INTO achievements (user_id, achievement_type, stars_earned, achieved_at) 
                 VALUES ($1, $2, $3, NOW())`,
                [userId, achievementType, starsEarned]
            );

            // تحديث النجوم والمستوى
            await query(
                `UPDATE user_stats 
                 SET 
                    total_stars = total_stars + $1,
                    current_level = CASE 
                        WHEN $2 = 'name_display' THEN 1
                        WHEN $2 = 'double_prayer' THEN 2
                        WHEN $2 = 'verse_selection' THEN 3
                        ELSE current_level
                    END,
                    last_prayer_date = NOW()
                 WHERE user_id = $3`,
                [starsEarned, achievementType, userId]
            );
        }

    } catch (error) {
        console.error('Assign levels error:', error);
    }
}