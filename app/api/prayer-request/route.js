import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ============================================================================
// 📥 GET - جلب طلبات الدعاء النشطة
// ============================================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    // بناء الاستعلام
    let whereClause = "status = 'active'";
    
    if (type !== 'all') {
      whereClause += ` AND type = '${type}'`;
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
        us.level,
        us.total_stars
       FROM prayer_requests pr
       LEFT JOIN user_stats us ON pr.user_id = us.user_id
       WHERE ${whereClause}
       ORDER BY 
         CASE 
           WHEN us.level = 2 THEN 1  -- المميزون (دعاء مرتين) في الأعلى
           WHEN us.level = 1 THEN 2
           WHEN us.level = 3 THEN 3
           ELSE 4
         END,
         pr.created_at DESC
       LIMIT $1`,
      [limit]
    );

    const requests = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      name: row.type === 'sick' ? 'مريض يطلب دعاءكم' : row.name, // إخفاء اسم المريض
      purpose: row.purpose,
      prayer_count: row.prayer_count || 0,
      created_at: row.created_at,
      level: row.level || 0,
      stars: row.total_stars || 0,
      isSpecial: row.level === 2 // المميزون
    }));

    return NextResponse.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error('Get prayer requests error:', error);
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
    const body = await request.json();
    const { 
      type,           // personal, friend, deceased, sick
      name,
      motherOrFatherName,
      purpose,
      userId,         // اختياري - للمسجلين
      fingerprint     // اختياري - للزوار
    } = body;

    // ============================================================================
    // ✅ التحقق من البيانات الأساسية
    // ============================================================================
    if (!type || !['personal', 'friend', 'deceased', 'sick'].includes(type)) {
      return NextResponse.json(
        { error: 'نوع الدعاء غير صحيح' },
        { status: 400 }
      );
    }

    if (!name && type !== 'sick') {
      return NextResponse.json(
        { error: 'الاسم مطلوب - "مَن دَعَا بِاسمٍ عُرِفَ فَاستُجِيبَ لَهُ"' },
        { status: 400 }
      );
    }

    // ============================================================================
    // 👤 تحديد المستخدم (مسجل أو زائر)
    // ============================================================================
    let userIdToUse = userId;
    
    if (!userId && fingerprint) {
      // البحث عن مستخدم بالبصمة
      const userResult = await query(
        `SELECT id FROM users WHERE device_fingerprint = $1`,
        [fingerprint]
      );
      
      if (userResult.rows.length === 0) {
        // إنشاء مستخدم مؤقت
        const newUserResult = await query(
          `INSERT INTO users (device_fingerprint, created_at) 
           VALUES ($1, NOW()) 
           RETURNING id`,
          [fingerprint]
        );
        userIdToUse = newUserResult.rows[0].id;
        
        // إنشاء سجل إحصائيات
        await query(
          `INSERT INTO user_stats (user_id, total_prayers, prayers_today, prayers_week, prayers_month, prayers_year, total_stars, level) 
           VALUES ($1, 0, 0, 0, 0, 0, 0, 0)`,
          [userIdToUse]
        );
      } else {
        userIdToUse = userResult.rows[0].id;
      }
    }

    if (!userIdToUse) {
      return NextResponse.json(
        { error: 'يجب التسجيل أو السماح بالبصمة' },
        { status: 400 }
      );
    }

    // ============================================================================
    // ⏰ التحقق من المدة المسموحة (من إعدادات الأدمن)
    // ============================================================================
    
    // 1️⃣ جلب إعدادات المدة من الأدمن
    const durationSettingsResult = await query(
      `SELECT setting_value 
       FROM admin_settings 
       WHERE setting_key = 'prayerRequestDuration'`
    );
    
    let allowedHours = 24; // افتراضي: مرة يومياً
    
    if (durationSettingsResult.rows.length > 0) {
      const settings = durationSettingsResult.rows[0].setting_value;
      allowedHours = settings.customHours || 24;
    }

    // 2️⃣ التحقق من مستوى المستخدم (المميزون = مستوى 2)
    const userStatsResult = await query(
      `SELECT level, last_achievement_date 
       FROM user_stats 
       WHERE user_id = $1`,
      [userIdToUse]
    );
    
    let isSpecialUser = false;
    let canRequestTwice = false;
    
    if (userStatsResult.rows.length > 0) {
      const userLevel = userStatsResult.rows[0].level;
      
      // المميزون (مستوى 2): يمكنهم الطلب مرتين يومياً
      if (userLevel === 2) {
        isSpecialUser = true;
        allowedHours = 12; // نصف المدة = مرتين يومياً
      }
    }

    // 3️⃣ التحقق من آخر طلب
    const lastRequestResult = await query(
      `SELECT created_at, type 
       FROM prayer_requests 
       WHERE user_id = $1 AND type = $2
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userIdToUse, type]
    );

    if (lastRequestResult.rows.length > 0) {
      const lastRequestTime = new Date(lastRequestResult.rows[0].created_at);
      const now = new Date();
      const hoursPassed = (now - lastRequestTime) / (1000 * 60 * 60);

      if (hoursPassed < allowedHours) {
        const hoursRemaining = Math.ceil(allowedHours - hoursPassed);
        
        return NextResponse.json({
          error: `⏰ يجب الانتظار ${hoursRemaining} ساعة قبل طلب دعاء جديد من نفس النوع\n\n"وَاصْبِرْ لِحُكْمِ رَبِّكَ"`,
          canRequest: false,
          hoursRemaining,
          isSpecialUser
        }, { status: 429 });
      }
    }

    // ============================================================================
    // 💾 حفظ الطلب في قاعدة البيانات
    // ============================================================================
    const insertResult = await query(
      `INSERT INTO prayer_requests (
        user_id,
        type,
        name,
        mother_or_father_name,
        purpose,
        status,
        prayer_count,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, 'active', 0, NOW())
      RETURNING id, created_at`,
      [
        userIdToUse,
        type,
        name || 'مريض', // للمرضى بدون اسم
        motherOrFatherName || null,
        purpose || null
      ]
    );

    const newRequest = insertResult.rows[0];

    // ============================================================================
    // 📊 رسالة ذكية بعد الإرسال
    // ============================================================================
    let smartMessage = `✅ تم إرسال طلبك بنجاح!\n\n"وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ"\n\n`;
    
    if (type === 'deceased') {
      smartMessage += `🕊️ سيدعو المؤمنون للمتوفى بالرحمة والمغفرة\n\n`;
    } else if (type === 'sick') {
      smartMessage += `💊 سيدعو المؤمنون للمريض بالشفاء العاجل\n\n`;
    } else {
      smartMessage += `🤲 سيستجيب المؤمنون لدعوتك قريباً إن شاء الله\n\n`;
    }
    
    smartMessage += `💡 افتح التطبيق بين الحين والآخر لترى من استجاب لدعوتك`;
    
    if (isSpecialUser) {
      smartMessage += `\n\n⭐⭐ أنت من المميزين! يمكنك الطلب مرة أخرى بعد ${allowedHours} ساعة`;
    }

    return NextResponse.json({
      success: true,
      message: smartMessage,
      request: {
        id: newRequest.id,
        createdAt: newRequest.created_at,
        type,
        isSpecialUser
      }
    });

  } catch (error) {
    console.error('Create prayer request error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الطلب' },
      { status: 500 }
    );
  }
}

// ============================================================================
// 🗑️ DELETE - حذف طلب (للمستخدم نفسه أو الأدمن)
// ============================================================================
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'معرف الطلب مطلوب' },
        { status: 400 }
      );
    }

    // حذف الطلب (التحقق من الملكية)
    const deleteResult = await query(
      `DELETE FROM prayer_requests 
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [requestId, userId]
    );

    if (deleteResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'الطلب غير موجود أو ليس لديك صلاحية' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الطلب بنجاح'
    });

  } catch (error) {
    console.error('Delete prayer request error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الطلب' },
      { status: 500 }
    );
  }
}