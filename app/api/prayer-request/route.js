import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { sanitizeVerseData } from '@/lib/utils';

// ============================================================================
// 📥 GET - جلب طلبات الدعاء النشطة (محسّن للملايين + شارات)
// ============================================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit')) || 50;
    const fingerprint = searchParams.get('fingerprint');

    // ════════════════════════════════════════════════════════════
    // ✅ Query محسّن مع معلومات المستخدم
    // ════════════════════════════════════════════════════════════
    
    let sql = `
      SELECT 
        pr.id,
        pr.user_id,
        pr.type,
        pr.name,
        pr.mother_or_father_name,
        pr.purpose,
        pr.status,
        pr.custom_verse,
        pr.quranic_verse,
        pr.created_at, pr.expires_at,
        pr.expires_at,
        COUNT(p.id) as prayer_count,
        -- ✅ إضافة معلومات المستخدم للشارات
        u.level,
        u.full_name as user_full_name,
        u.phone_number as user_phone
      FROM prayer_requests pr
      LEFT JOIN prayers p ON p.request_id = pr.id
      LEFT JOIN users u ON u.id = pr.user_id
      WHERE pr.status = 'active' AND (pr.expires_at IS NULL OR pr.expires_at > NOW())
        AND (
          pr.created_at > NOW() - INTERVAL '30 days'
          OR pr.id IN (
            SELECT DISTINCT request_id 
            FROM prayers 
            WHERE prayed_at > NOW() - INTERVAL '30 days'
          )
        )
    `;

    const params = [];
    let paramIndex = 1;

    if (type !== 'all') {
      sql += ` AND pr.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    sql += ` 
      GROUP BY pr.id, pr.user_id, pr.type, pr.name, pr.mother_or_father_name, 
               pr.purpose, pr.status, pr.custom_verse, pr.quranic_verse, pr.created_at, pr.expires_at,
        pr.expires_at,
               u.level, u.full_name, u.phone_number
      ORDER BY COUNT(p.id) ASC, pr.created_at DESC 
      LIMIT $${paramIndex}
    `;
    params.push(limit);

    const result = await query(sql, params);

    // ════════════════════════════════════════════════════════════
    // ✅ معالجة النتائج مع الشارات
    // ════════════════════════════════════════════════════════════
    const requests = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      name: row.name || 'مريض يطلب دعاءكم',
      parent_name: row.mother_or_father_name,
      purpose: row.purpose,
      custom_verse: row.custom_verse,
      quranic_verse: row.quranic_verse,
      created_at: row.created_at,
      prayerCount: parseInt(row.prayer_count) || 0,
      hasPrayed: false,
      // ✅ إضافة معلومات المستخدم
      userLevel: row.level || 1,
      userFullName: row.user_full_name,
      userPhone: row.user_phone
    }));

    // ════════════════════════════════════════════════════════════
    // ✅ إضافة hasPrayed بـ query واحد فقط
    // ════════════════════════════════════════════════════════════
    if (fingerprint && requests.length > 0) {
      try {
        const userResult = await query(
          'SELECT id FROM users WHERE device_fingerprint = $1',
          [fingerprint]
        );

        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;
          const requestIds = requests.map(r => r.id);

          const prayedResult = await query(
            `SELECT DISTINCT request_id 
             FROM prayers 
             WHERE user_id = $1 AND request_id = ANY($2)`,
            [userId, requestIds]
          );

          const prayedRequestIds = new Set(prayedResult.rows.map(r => r.request_id));
          
          requests.forEach(req => {
            req.hasPrayed = prayedRequestIds.has(req.id);
          });
        }
      } catch (err) {
        console.error('Error checking hasPrayed:', err);
      }
    }

    return NextResponse.json({
      success: true,
      requests: sanitizeVerseData(requests),
      meta: {
        total: requests.length,
        limit: limit,
        hasMore: requests.length === limit
      }
    });

  } catch (error) {
    console.error('GET prayer-request error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    
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
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    let userIdFromToken = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userIdFromToken = decoded.userId;
      } catch (err) {
        console.log('Invalid token, proceeding as guest');
      }
    }

    const body = await request.json();
    const { 
      name,
      parent_name,
      purpose,
      prayer_type,
      custom_verse,
      details,
      fingerprint
    } = body;

    const validTypes = ['personal', 'friend', 'deceased', 'sick'];
    if (!prayer_type || !validTypes.includes(prayer_type)) {
      return NextResponse.json(
        { error: 'نوع الدعاء غير صحيح. القيم المسموحة: personal, friend, deceased, sick' },
        { status: 400 }
      );
    }

    if (!name && prayer_type === 'deceased') {
      return NextResponse.json(
        { error: 'اسم المتوفى مطلوب' },
        { status: 400 }
      );
    }

    if (!parent_name && prayer_type === 'deceased') {
      return NextResponse.json(
        { error: 'اسم الأب أو الأم مطلوب للدعاء للمتوفى' },
        { status: 400 }
      );
    }

    if (!purpose) {
      return NextResponse.json(
        { error: 'غرض الدعاء مطلوب' },
        { status: 400 }
      );
    }

    let userId = userIdFromToken;
    
    if (!userId && fingerprint) {
      const userResult = await query(
        `SELECT id FROM users WHERE device_fingerprint = $1`,
        [fingerprint]
      );
      
      if (userResult.rows.length === 0) {
        const newUserResult = await query(
          `INSERT INTO users (device_fingerprint, created_at) 
           VALUES ($1, NOW()) 
           RETURNING id`,
          [fingerprint]
        );
        userId = newUserResult.rows[0].id;
        
        await query(
          `INSERT INTO user_stats (user_id, total_prayers, prayers_today, prayers_week, prayers_month, prayers_year, total_stars) 
           VALUES ($1, 0, 0, 0, 0, 0, 0)`,
          [userId]
        );
      } else {
        userId = userResult.rows[0].id;
      }
    }

    if (!userId) {
      const tempFingerprint = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const anonymousUserResult = await query(
        `INSERT INTO users (device_fingerprint, created_at) 
         VALUES ($1, NOW()) 
         RETURNING id`,
        [tempFingerprint]
      );
      userId = anonymousUserResult.rows[0].id;
      
      await query(
        `INSERT INTO user_stats (user_id, total_prayers, prayers_today, prayers_week, prayers_month, prayers_year, total_stars) 
         VALUES ($1, 0, 0, 0, 0, 0, 0)`,
        [userId]
      );
    }

    const durationSettingsResult = await query(
      `SELECT setting_value 
       FROM admin_settings 
       WHERE setting_key = 'prayerRequestDuration'`
    );
    
    let allowedHours = 24;
    
    if (durationSettingsResult.rows.length > 0) {
      const settings = durationSettingsResult.rows[0].setting_value;
      allowedHours = settings.customHours || 24;
    }

    const userDataResult = await query(
      `SELECT u.device_fingerprint, u.full_name, u.mother_or_father_name, u.phone_number
       FROM users u
       WHERE u.id = $1`,
      [userId]
    );
    
    let isSpecialUser = false;
    
    if (userDataResult.rows.length > 0) {
      const userData = userDataResult.rows[0];
      
      const hasFingerprint = !!userData.device_fingerprint;
      const hasName = !!userData.full_name;
      const hasParentName = !!userData.mother_or_father_name;
      const hasPhone = !!userData.phone_number;
      
      let userLevel = 1;
      
      if (hasFingerprint && hasName && hasParentName && hasPhone) {
        userLevel = 3;
      }
      else if (hasFingerprint && hasName && hasParentName) {
        userLevel = 2;
      }
      
      if (userLevel >= 2) {
        isSpecialUser = true;
        allowedHours = 12;
      }
    }

    const lastRequestResult = await query(
      `SELECT created_at 
       FROM prayer_requests 
       WHERE user_id = $1 AND type = $2
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId, prayer_type]
    );

    if (lastRequestResult.rows.length > 0) {
      const lastRequestTime = new Date(lastRequestResult.rows[0].created_at);
      const now = new Date();
      const hoursPassed = (now - lastRequestTime) / (1000 * 60 * 60);

      if (hoursPassed < allowedHours) {
        const hoursRemaining = Math.ceil(allowedHours - hoursPassed);
        
        return NextResponse.json(
          {
            error: `يمكنك إرسال طلب جديد بعد ${hoursRemaining} ساعة`,
            hoursRemaining,
            nextRequestTime: new Date(lastRequestTime.getTime() + allowedHours * 60 * 60 * 1000)
          },
          { status: 429 }
        );
      }
    }

    const insertResult = await query(
      `INSERT INTO prayer_requests (
        user_id,
        type,
        name,
        mother_or_father_name,
        purpose,
        custom_verse,
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW())
      RETURNING *`,
      [
        userId,
        prayer_type,
        name || 'مريض',
        parent_name || null,
        purpose,
        custom_verse || null
      ]
    );

    const newRequest = insertResult.rows[0];

    if (prayer_type === 'personal' && name && parent_name) {
      await query(
        `UPDATE users 
         SET full_name = $1, 
             mother_or_father_name = $2
         WHERE id = $3 
         AND (full_name IS NULL OR full_name = '')`,
        [name, parent_name, userId]
      );
    }

    let smartMessage = `✅ تم إرسال طلبك بنجاح!\n\n"وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ"\n\n`;
    
    if (prayer_type === 'deceased') {
      smartMessage += `🕊️ سيدعو المؤمنون للمتوفى بالرحمة والمغفرة\n\n`;
    } else if (prayer_type === 'sick') {
      smartMessage += `💊 سيدعو المؤمنون للمريض بالشفاء العاجل\n\n`;
    } else {
      smartMessage += `🤲 سيستجيب المؤمنون لدعوتك قريباً إن شاء الله\n\n`;
    }
    
    smartMessage += `💡 تم نشر طلبك مباشرة - يمكن للجميع الدعاء الآن`;
    
    if (isSpecialUser) {
      smartMessage += `\n\n⭐⭐ أنت من المميزين! يمكنك الطلب مرة أخرى بعد ${allowedHours} ساعة`;
    }

    return NextResponse.json({
      success: true,
      message: smartMessage,
      request: sanitizeVerseData({
        id: newRequest.id,
        createdAt: newRequest.created_at,
        type: prayer_type,
        status: 'active',
        isSpecialUser,
        quranic_verse: newRequest.quranic_verse,
        custom_verse: newRequest.custom_verse
      })
    });

  } catch (error) {
    console.error('POST prayer-request error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'حدث خطأ في إرسال الطلب' 
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// 🗑️ DELETE - حذف طلب
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
    console.error('DELETE prayer-request error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الطلب' },
      { status: 500 }
    );
  }
}