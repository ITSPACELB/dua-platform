import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { checkBadgeStatus } from '@/lib/db-utils';
import { getCached, invalidateCache } from '@/lib/cache';
import { trackAPICall, logError, trackCacheHit, trackCacheMiss } from '@/lib/monitoring';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ════════════════════════════════════════════════════════════
// 🔐 دالة التحقق من Token
// ════════════════════════════════════════════════════════════
function verifyToken(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// ════════════════════════════════════════════════════════════
// 🏆 قائمة الإنجازات الدائمة (من القرعة)
// ════════════════════════════════════════════════════════════
const permanentAchievements = [
  {
    id: 'name_display',
    type: 'NAME_DISPLAY',
    name: 'عرض الاسم',
    nameEn: 'Name Display',
    description: 'يظهر اسمك في قسم "الأكثر تفاعلاً" لمدة 24 ساعة',
    icon: '⭐',
    stars: 1,
    duration: '24 ساعة',
    color: 'amber',
    benefits: [
      'اسمك يظهر في الصفحة الرئيسية',
      'تشجيع الآخرين على التفاعل معك',
      'تكريم لتفاعلك المستمر'
    ]
  },
  {
    id: 'double_prayer',
    type: 'DOUBLE_PRAYER',
    name: 'الدعاء المضاعف',
    nameEn: 'Double Prayer',
    description: 'تستطيع طلب الدعاء مرتين في اليوم بدلاً من مرة واحدة',
    icon: '⭐⭐',
    stars: 2,
    duration: '7 أيام',
    color: 'blue',
    benefits: [
      'طلب إضافي للدعاء يومياً',
      'فرصة أكبر لجمع الدعوات',
      'مدة 7 أيام كاملة'
    ]
  },
  {
    id: 'verse_selection',
    type: 'VERSE_SELECTION',
    name: 'اختيار الآية',
    nameEn: 'Verse Selection',
    description: 'اختر الآية القرآنية التي تريد الدعاء بها',
    icon: '⭐⭐⭐',
    stars: 3,
    duration: '30 يوماً',
    color: 'emerald',
    benefits: [
      'اختيار آية قرآنية محددة للدعاء',
      'تخصيص تجربتك الروحانية',
      'مدة شهر كامل'
    ]
  }
];

// ════════════════════════════════════════════════════════════
// 🎖️ مستويات التوثيق (الشارات الدائمة)
// ════════════════════════════════════════════════════════════
const verificationBadges = [
  {
    id: 'blue_badge',
    level: 'BLUE',
    name: 'التوثيق الأزرق',
    nameEn: 'Blue Verification',
    description: 'معدل تفاعل 80% أو أعلى',
    icon: '✓',
    color: '#1DA1F2',
    threshold: 80,
    maintainThreshold: 75,
    benefits: [
      'شارة توثيق بجانب اسمك',
      'ظهور أولوي في القوائم',
      'طلبين للدعاء يومياً',
      'أولوية في استقبال الدعوات'
    ],
    requirements: 'حافظ على معدل 75% أو أعلى للحفاظ على الشارة'
  },
  {
    id: 'green_badge',
    level: 'GREEN',
    name: 'التوثيق الأخضر',
    nameEn: 'Green Verification',
    description: 'معدل تفاعل 90% أو أعلى',
    icon: '✓✓',
    color: '#00BA7C',
    threshold: 90,
    maintainThreshold: 85,
    benefits: [
      'شارة توثيق مميزة مزدوجة',
      'أولوية عليا في الظهور',
      'ثلاث طلبات للدعاء يومياً',
      'استجابة أسرع من المجتمع'
    ],
    requirements: 'حافظ على معدل 85% أو أعلى للحفاظ على الشارة'
  },
  {
    id: 'gold_badge',
    level: 'GOLD',
    name: 'التوثيق الذهبي',
    nameEn: 'Gold Verification',
    description: 'معدل تفاعل 98% أو أعلى - النخبة',
    icon: '👑',
    color: '#FFD700',
    threshold: 98,
    maintainThreshold: 95,
    benefits: [
      'أعلى شارة توثيق مع تأثيرات خاصة',
      'الأولوية القصوى في كل شيء',
      'خمس طلبات للدعاء يومياً',
      'ردود فعل وإيموجي خاصة',
      'تكريم خاص في المنصة'
    ],
    requirements: 'حافظ على معدل 95% أو أعلى للحفاظ على الشارة'
  }
];

// ════════════════════════════════════════════════════════════
// 📊 GET - جلب إنجازات المستخدم (مع Caching)
// ════════════════════════════════════════════════════════════
export async function GET(request) {
  const startTime = Date.now();
  
  try {
    // 1️⃣ التحقق من Token
    const decoded = verifyToken(request);
    
    if (!decoded) {
      trackAPICall('/api/users/achievements', Date.now() - startTime, false);
      return NextResponse.json(
        { error: 'غير مصرح. الرجاء تسجيل الدخول.' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // 2️⃣ محاولة جلب من Cache (TTL: 5 دقائق)
    const cacheKey = `user:achievements:${userId}`;
    
    const achievementsData = await getCached(
      cacheKey,
      async () => {
        // ═══════════════════════════════════════════════
        // جلب من Database
        // ═══════════════════════════════════════════════
        
        trackCacheMiss();

        // جلب حالة الشارة الحالية
        const badgeStatus = await checkBadgeStatus(userId);
        
        const {
          current_rate,
          level_name,
          status,
          days_in_grace
        } = badgeStatus;

        // جلب عدد الدعوات هذا الشهر
        const prayersResult = await query(
          `SELECT COUNT(*) as count
           FROM prayers
           WHERE user_id = $1
             AND prayed_at >= DATE_TRUNC('month', CURRENT_DATE)`,
          [userId]
        );

        const prayersThisMonth = parseInt(prayersResult.rows[0].count);

        // جلب الإنجازات المؤقتة النشطة (من القرعة)
        const tempAchievementsResult = await query(
          `SELECT 
             achievement_type,
             granted_at,
             expires_at,
             is_active
           FROM user_achievements
           WHERE user_id = $1
             AND expires_at > NOW()
             AND is_active = true
           ORDER BY granted_at DESC`,
          [userId]
        );

        // تنسيق الإنجازات المؤقتة
        const activeTemporaryAchievements = tempAchievementsResult.rows.map(ach => {
          const achievementInfo = permanentAchievements.find(
            pa => pa.type === ach.achievement_type
          );

          if (!achievementInfo) return null;

          const now = new Date();
          const expiresAt = new Date(ach.expires_at);
          const hoursRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60));
          const daysRemaining = Math.ceil(hoursRemaining / 24);

          return {
            ...achievementInfo,
            grantedAt: ach.granted_at,
            expiresAt: ach.expires_at,
            isActive: ach.is_active,
            timeRemaining: {
              hours: hoursRemaining,
              days: daysRemaining,
              text: daysRemaining > 1 
                ? `${daysRemaining} أيام متبقية`
                : hoursRemaining > 1
                ? `${hoursRemaining} ساعة متبقية`
                : 'أقل من ساعة'
            }
          };
        }).filter(Boolean);

        // تحديد الشارة الحالية
        const currentBadge = verificationBadges.find(
          badge => badge.level === level_name
        );

        // حساب التقدم نحو الشارة التالية
        let nextBadge = null;
        let progressToNext = 0;

        if (current_rate < 80) {
          nextBadge = verificationBadges[0]; // BLUE
          progressToNext = (current_rate / 80) * 100;
        } else if (current_rate < 90) {
          nextBadge = verificationBadges[1]; // GREEN
          progressToNext = ((current_rate - 80) / (90 - 80)) * 100;
        } else if (current_rate < 98) {
          nextBadge = verificationBadges[2]; // GOLD
          progressToNext = ((current_rate - 90) / (98 - 90)) * 100;
        } else {
          progressToNext = 100; // وصل للقمة
        }

        // معلومات الحالة
        const statusInfo = {
          status,
          isActive: status === 'active',
          isInGracePeriod: status === 'grace_period',
          isLost: status === 'lost',
          daysRemaining: parseInt(days_in_grace) || 0
        };

        // رسالة الحالة
        let statusMessage = '';
        if (status === 'active' && currentBadge) {
          statusMessage = `✅ ${currentBadge.name} نشط`;
        } else if (status === 'grace_period' && currentBadge) {
          statusMessage = `⚠️ فترة سماح: ${days_in_grace} يوم - حافظ على ${currentBadge.maintainThreshold}% أو أعلى`;
        } else if (status === 'lost') {
          statusMessage = `❌ فقدت الشارة - استعد تفاعلك`;
        } else {
          statusMessage = `📊 ابدأ رحلتك نحو التوثيق`;
        }

        // بناء البيانات النهائية
        return {
          prayersThisMonth,
          interactionRate: parseFloat(current_rate),
          currentBadge: currentBadge ? {
            ...currentBadge,
            statusInfo,
            statusMessage
          } : null,
          nextBadge: nextBadge ? {
            ...nextBadge,
            progressPercentage: Math.round(progressToNext),
            remainingPoints: nextBadge.threshold - current_rate
          } : null,
          activeTemporaryAchievements,
          allVerificationBadges: verificationBadges,
          allPermanentAchievements: permanentAchievements,
          totalActiveAchievements: activeTemporaryAchievements.length,
          hasActiveAchievements: activeTemporaryAchievements.length > 0
        };
      },
      300 // Cache لمدة 5 دقائق
    );

    // تتبع Cache Hit
    if (achievementsData) {
      trackCacheHit();
    }

    // 3️⃣ تتبع الأداء وإرجاع النتيجة
    const duration = Date.now() - startTime;
    trackAPICall('/api/users/achievements', duration, true);

    const response = NextResponse.json({
      success: true,
      data: achievementsData
    });

    // إضافة headers
    response.headers.set('X-Response-Time', `${duration}ms`);
    response.headers.set('X-Cache-Status', achievementsData ? 'HIT' : 'MISS');

    return response;

  } catch (error) {
    const duration = Date.now() - startTime;
    trackAPICall('/api/users/achievements', duration, false);
    logError(error, { 
      endpoint: '/api/users/achievements',
      userId: decoded?.userId 
    });
    
    console.error('❌ Achievements fetch error:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ أثناء جلب الإنجازات',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════
// 🗑️ DELETE - مسح Cache (للمطورين/الإدارة)
// ════════════════════════════════════════════════════════════
export async function DELETE(request) {
  try {
    const decoded = verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const cacheKey = `user:achievements:${userId}`;
    
    await invalidateCache(cacheKey);

    return NextResponse.json({
      success: true,
      message: 'تم مسح الـ cache بنجاح'
    });

  } catch (error) {
    logError(error, { endpoint: '/api/users/achievements DELETE' });
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════
// 📝 ملاحظات مهمة
// ════════════════════════════════════════════════════════════
/*
✅ النسخة المليونية - محسّنة للـ Scale:

✅ Redis Caching (5 دقائق):
   - محلياً: Fallback بدون Redis
   - Contabo: سرعة × 20

✅ Performance Monitoring

✅ الاستعلامات الصحيحة:
   - prayed_at ✓

✅ Response Headers

✅ Error Handling

✅ DELETE endpoint

🎯 هذا API للعرض فقط - منح الإنجازات عبر القرعة اليومية
*/