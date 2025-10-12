import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ============================================================================
// 🔐 التحقق من الـ Token
// ============================================================================
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
// 📥 GET - جلب طلبات الدعاء النشطة
// ============================================================================
export async function GET(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all';
        const limit = parseInt(searchParams.get('limit') || '20');

        // بناء شرط WHERE حسب النوع المطلوب
        let whereClause = "pr.status = 'active' AND pr.expires_at > NOW()";
        
        if (type === 'general') {
            whereClause += " AND pr.type = 'general'";
        } else if (type === 'deceased') {
            whereClause += " AND pr.type = 'deceased'";
        } else if (type === 'sick') {
            whereClause += " AND pr.type = 'sick'";
        }

        // جلب الطلبات مع بيانات المستخدم
        const result = await query(
            `SELECT 
                pr.id,
                pr.user_id,
                pr.type,
                pr.deceased_name,
                pr.deceased_mother_name,
                pr.relation,
                pr.is_name_private,
                pr.sick_name,
                pr.sick_mother_name,
                pr.created_at,
                pr.total_prayers_received,
                u.full_name,
                u.nickname,
                u.city,
                u.show_full_name,
                us.interaction_rate,
                -- فحص إذا كان المستخدم الحالي قد دعا لهذا الطلب
                EXISTS(
                    SELECT 1 FROM prayers p 
                    WHERE p.request_id = pr.id AND p.user_id = $1
                ) as has_prayed
             FROM prayer_requests pr
             JOIN users u ON pr.user_id = u.id
             LEFT JOIN user_stats us ON u.id = us.user_id
             WHERE ${whereClause}
             ORDER BY 
                -- الأولوية حسب مستوى التوثيق
                CASE 
                    WHEN us.interaction_rate >= 98 THEN 1
                    WHEN us.interaction_rate >= 90 THEN 2
                    WHEN us.interaction_rate >= 80 THEN 3
                    ELSE 4
                END,
                pr.created_at DESC
             LIMIT $2`,
            [decoded.userId, limit]
        );

        // تنسيق البيانات للإرسال
        const requests = result.rows.map(row => {
            // تحديد اسم العرض
            let displayName;
            if (row.type === 'deceased') {
                displayName = `${row.deceased_name}${row.relation ? ` (${row.relation})` : ''}`;
            } else if (row.type === 'sick' && row.is_name_private) {
                displayName = 'مريض (اسم خاص)';
            } else if (row.type === 'sick') {
                displayName = row.sick_name;
            } else {
                displayName = row.nickname 
                    ? row.nickname
                    : row.show_full_name
                        ? `${row.full_name}${row.city ? ` (${row.city})` : ''}`
                        : `${row.full_name.split(' ')[0]}...`;
            }

            // حساب مستوى التوثيق
            const interactionRate = row.interaction_rate || 0;
            let verificationLevel = null;
            
            if (row.type !== 'deceased') {
                if (interactionRate >= 98) {
                    verificationLevel = { name: 'GOLD', color: 'amber', icon: '👑', threshold: 98 };
                } else if (interactionRate >= 90) {
                    verificationLevel = { name: 'GREEN', color: 'emerald', icon: '✓✓', threshold: 90 };
                } else if (interactionRate >= 80) {
                    verificationLevel = { name: 'BLUE', color: 'blue', icon: '✓', threshold: 80 };
                }
            }

            return {
                id: row.id,
                userId: row.user_id,
                type: row.type,
                displayName,
                timestamp: row.created_at,
                prayerCount: row.total_prayers_received,
                hasPrayed: row.has_prayed,
                verificationLevel
            };
        });

        return NextResponse.json({
            success: true,
            requests
        });

    } catch (error) {
        console.error('Get requests error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء جلب الطلبات' },
            { status: 500 }
        );
    }
}

// ============================================================================
// 📤 POST - إنشاء طلب دعاء جديد
// ============================================================================
export async function POST(request) {
    try {
        const decoded = verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const body = await request.json();
        const { 
            prayerType = 'general',
            deceasedName,
            deceasedMotherName,
            relation,
            sickPersonName,
            sickPersonMotherName,
            isNamePrivate = false
        } = body;

        // التحقق من نوع الطلب
        if (!['general', 'deceased', 'sick'].includes(prayerType)) {
            return NextResponse.json(
                { error: 'نوع الطلب غير صحيح' },
                { status: 400 }
            );
        }

        // التحقق من البيانات المطلوبة حسب النوع
        if (prayerType === 'deceased' && (!deceasedName || !deceasedMotherName)) {
            return NextResponse.json(
                { error: 'يجب إدخال اسم المتوفى واسم والدته' },
                { status: 400 }
            );
        }

        if (prayerType === 'sick' && !isNamePrivate && (!sickPersonName || !sickPersonMotherName)) {
            return NextResponse.json(
                { error: 'يجب إدخال اسم المريض واسم والدته' },
                { status: 400 }
            );
        }

        // فحص الحدود الزمنية
        const limitCheck = await query(
            `SELECT value FROM platform_settings WHERE key = 'request_limits'`
        );
        
        const limits = limitCheck.rows[0]?.value || {
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

        // فحص آخر طلب من نفس النوع
        const lastRequest = await query(
            `SELECT created_at 
             FROM prayer_requests 
             WHERE user_id = $1 AND type = $2
             ORDER BY created_at DESC 
             LIMIT 1`,
            [decoded.userId, prayerType]
        );

        if (lastRequest.rows.length > 0) {
            const lastRequestTime = new Date(lastRequest.rows[0].created_at);
            const now = new Date();
            const hoursPassed = (now - lastRequestTime) / (1000 * 60 * 60);

            if (hoursPassed < hoursLimit) {
                const hoursRemaining = Math.ceil(hoursLimit - hoursPassed);
                const nextAllowedAt = new Date(lastRequestTime.getTime() + (hoursLimit * 60 * 60 * 1000));
                
                return NextResponse.json({
                    error: 'يجب الانتظار قبل طلب دعاء جديد',
                    canRequest: false,
                    hoursRemaining,
                    nextAllowedAt
                }, { status: 429 });
            }
        }

        // إنشاء الطلب الجديد
        const result = await query(
            `INSERT INTO prayer_requests (
                user_id,
                type,
                deceased_name,
                deceased_mother_name,
                relation,
                is_name_private,
                sick_name,
                sick_mother_name,
                status,
                created_at,
                expires_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW(), NOW() + INTERVAL '24 hours')
            RETURNING id, created_at, expires_at`,
            [
                decoded.userId,
                prayerType,
                deceasedName || null,
                deceasedMotherName || null,
                relation || null,
                isNamePrivate,
                sickPersonName || null,
                sickPersonMotherName || null
            ]
        );

        const newRequest = result.rows[0];

        // TODO: جدولة إرسال الإشعارات بعد 30 دقيقة
        // سيتم تطبيقه في المرحلة 5

        return NextResponse.json({
            success: true,
            message: 'تم إرسال طلبك بنجاح',
            request: {
                id: newRequest.id,
                createdAt: newRequest.created_at,
                expiresAt: newRequest.expires_at
            }
        });

    } catch (error) {
        console.error('Create request error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ أثناء إنشاء الطلب' },
            { status: 500 }
        );
    }
}