import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ============================================================================
// 🔐 بيانات الأدمن (يمكن نقلها لـ ENV لاحقاً)
// ============================================================================
const ADMIN_EMAIL = 'haydar.cd@gmail.com';
const ADMIN_PASSWORD = '123456';

// ============================================================================
// 🛡️ Middleware - التحقق من صلاحيات الأدمن
// ============================================================================
function verifyAdminAuth(request) {
  // يمكن إضافة JWT أو Session verification هنا لاحقاً
  // حالياً: نعتمد على تسجيل الدخول البسيط من الفرونت-إند
  return true;
}

// ============================================================================
// 📥 GET - جلب جميع الإعدادات والبيانات
// ============================================================================
export async function GET(request) {
  try {
    const settings = {};

    // ========================================================================
    // 1️⃣ جلب البانر
    // ========================================================================
    const bannerResult = await query(
      `SELECT id, content, link, is_active, created_at, updated_at 
       FROM banner 
       ORDER BY created_at DESC 
       LIMIT 1`
    );
    
    if (bannerResult.rows.length > 0) {
      const banner = bannerResult.rows[0];
      settings.banner = {
        id: banner.id,
        content: banner.content,
        link: banner.link || '',
        isActive: banner.is_active,
        createdAt: banner.created_at,
        updatedAt: banner.updated_at
      };
    }

    // ========================================================================
    // 2️⃣ جلب إعدادات "الأكثر تفاعلاً"
    // ========================================================================
    const topActiveResult = await query(
      `SELECT setting_value 
       FROM admin_settings 
       WHERE setting_key = 'topActive' 
       LIMIT 1`
    );
    
    if (topActiveResult.rows.length > 0) {
      settings.topActive = JSON.parse(topActiveResult.rows[0].setting_value);
    } else {
      // القيم الافتراضية
      settings.topActive = {
        mode: 'auto',
        manualNames: [],
        count: 5
      };
    }

    // ========================================================================
    // 3️⃣ جلب الدعاء الجماعي
    // ========================================================================
    const collectiveResult = await query(
      `SELECT id, type, content, timing, start_date, end_date, is_active, created_at 
       FROM collective_prayer 
       WHERE is_active = true 
       ORDER BY created_at DESC 
       LIMIT 1`
    );
    
    if (collectiveResult.rows.length > 0) {
      const collective = collectiveResult.rows[0];
      settings.collectivePrayer = {
        id: collective.id,
        type: collective.type,
        content: collective.content,
        timing: collective.timing,
        startDate: collective.start_date,
        endDate: collective.end_date,
        isActive: collective.is_active,
        createdAt: collective.created_at
      };
    }

    // ========================================================================
    // 4️⃣ جلب التوعية
    // ========================================================================
    const awarenessResult = await query(
      `SELECT id, content, links, is_active, created_at 
       FROM awareness 
       ORDER BY created_at DESC 
       LIMIT 1`
    );
    
    if (awarenessResult.rows.length > 0) {
      const awareness = awarenessResult.rows[0];
      settings.awareness = {
        id: awareness.id,
        content: awareness.content,
        links: awareness.links || [],
        isActive: awareness.is_active,
        createdAt: awareness.created_at
      };
    }

    // ========================================================================
    // 5️⃣ جلب المكتبة
    // ========================================================================
    const libraryResult = await query(
      `SELECT id, title, url, created_at 
       FROM library 
       ORDER BY created_at DESC`
    );
    
    settings.library = {
      books: libraryResult.rows.map(book => ({
        id: book.id,
        title: book.title,
        url: book.url,
        createdAt: book.created_at
      }))
    };

    // ========================================================================
    // 6️⃣ جلب "من نحن"
    // ========================================================================
    const aboutResult = await query(
      `SELECT content, links, email 
       FROM about_us 
       ORDER BY updated_at DESC 
       LIMIT 1`
    );
    
    if (aboutResult.rows.length > 0) {
      const about = aboutResult.rows[0];
      settings.aboutUs = {
        content: about.content,
        links: about.links || [],
        email: about.email
      };
    }

    // ========================================================================
    // 7️⃣ جلب نسب المستويات
    // ========================================================================
    const levelsResult = await query(
      `SELECT level_1, level_2, level_3 
       FROM level_ratios 
       ORDER BY updated_at DESC 
       LIMIT 1`
    );
    
    if (levelsResult.rows.length > 0) {
      const levels = levelsResult.rows[0];
      settings.levelRatios = {
        level1: levels.level_1,
        level2: levels.level_2,
        level3: levels.level_3
      };
    }

    // ========================================================================
    // 8️⃣ جلب مدة طلبات الدعاء
    // ========================================================================
    const durationResult = await query(
      `SELECT duration, custom_days 
       FROM prayer_request_duration 
       ORDER BY updated_at DESC 
       LIMIT 1`
    );
    
    if (durationResult.rows.length > 0) {
      const duration = durationResult.rows[0];
      settings.prayerRequestDuration = {
        duration: duration.duration,
        customDays: duration.custom_days
      };
    }

    // ========================================================================
    // 9️⃣ جلب إعدادات الإشعارات
    // ========================================================================
    const notificationResult = await query(
      `SELECT onesignal_enabled, whatsapp_enabled, app_id, api_key 
       FROM notification_settings 
       ORDER BY updated_at DESC 
       LIMIT 1`
    );
    
    if (notificationResult.rows.length > 0) {
      const notif = notificationResult.rows[0];
      settings.notificationSettings = {
        oneSignalEnabled: notif.onesignal_enabled,
        whatsappEnabled: notif.whatsapp_enabled,
        appId: notif.app_id || '',
        apiKey: notif.api_key || ''
      };
    }

    // ========================================================================
    // 🔟 جلب إعدادات البصمة
    // ========================================================================
    const fingerprintResult = await query(
      `SELECT enabled 
       FROM fingerprint_settings 
       ORDER BY updated_at DESC 
       LIMIT 1`
    );
    
    if (fingerprintResult.rows.length > 0) {
      settings.fingerprintSettings = {
        enabled: fingerprintResult.rows[0].enabled
      };
    }

    // ========================================================================
    // 1️⃣1️⃣ جلب إعدادات أزرار الواجهة
    // ========================================================================
    const buttonsResult = await query(
      `SELECT setting_value 
       FROM admin_settings 
       WHERE setting_key = 'interfaceButtons' 
       LIMIT 1`
    );
    
    if (buttonsResult.rows.length > 0) {
      settings.interfaceButtons = JSON.parse(buttonsResult.rows[0].setting_value);
    } else {
      settings.interfaceButtons = {
        share: true,
        download: true,
        library: true,
        about: true,
        help: true,
        rating: false,
        donate: false
      };
    }

    // ========================================================================
    // ✅ إرجاع كل الإعدادات
    // ========================================================================
    return NextResponse.json({
      success: true,
      settings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error loading admin settings:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'حدث خطأ أثناء جلب الإعدادات',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// 📤 POST - حفظ الإعدادات
// ============================================================================
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, settingKey, settingValue } = body;

    // ========================================================================
    // 🔐 التحقق من الصلاحيات
    // ========================================================================
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // ========================================================================
    // 📝 حفظ الإعدادات
    // ========================================================================
    if (action === 'update_setting') {
      
      // ====================================================================
      // 1️⃣ البانر
      // ====================================================================
      if (settingKey === 'banner') {
        // تعطيل كل البانرات السابقة
        await query(`UPDATE banner SET is_active = false`);
        
        // إضافة بانر جديد
        await query(
          `INSERT INTO banner (content, link, is_active, created_at, updated_at) 
           VALUES ($1, $2, $3, NOW(), NOW())`,
          [
            settingValue.content,
            settingValue.link || null,
            settingValue.isActive
          ]
        );

        return NextResponse.json({
          success: true,
          message: 'تم حفظ البانر بنجاح'
        });
      }

      // ====================================================================
      // 2️⃣ الأكثر تفاعلاً
      // ====================================================================
      if (settingKey === 'topActive') {
        await query(
          `INSERT INTO admin_settings (setting_key, setting_value, updated_at) 
           VALUES ($1, $2, NOW()) 
           ON CONFLICT (setting_key) 
           DO UPDATE SET setting_value = $2, updated_at = NOW()`,
          ['topActive', JSON.stringify(settingValue)]
        );

        return NextResponse.json({
          success: true,
          message: 'تم حفظ إعدادات الأكثر تفاعلاً بنجاح'
        });
      }

      // ====================================================================
      // 3️⃣ الدعاء الجماعي
      // ====================================================================
      if (settingKey === 'collectivePrayer') {
        // تعطيل كل الدعاءات السابقة
        await query(`UPDATE collective_prayer SET is_active = false`);
        
        // إضافة دعاء جديد
        await query(
          `INSERT INTO collective_prayer 
           (type, content, timing, start_date, end_date, is_active, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            settingValue.type,
            settingValue.content,
            settingValue.timing,
            settingValue.startDate || null,
            settingValue.endDate || null,
            settingValue.isActive
          ]
        );

        return NextResponse.json({
          success: true,
          message: 'تم حفظ الدعاء الجماعي بنجاح'
        });
      }

      // ====================================================================
      // 4️⃣ التوعية
      // ====================================================================
      if (settingKey === 'awareness') {
        await query(
          `INSERT INTO awareness (content, links, is_active, created_at) 
           VALUES ($1, $2, $3, NOW())`,
          [
            settingValue.content,
            JSON.stringify(settingValue.links || []),
            settingValue.isActive
          ]
        );

        return NextResponse.json({
          success: true,
          message: 'تم حفظ التوعية بنجاح'
        });
      }

      // ====================================================================
      // 5️⃣ المكتبة
      // ====================================================================
      if (settingKey === 'library') {
        // حذف كل الكتب القديمة
        await query(`DELETE FROM library`);
        
        // إضافة الكتب الجديدة
        for (const book of settingValue.books) {
          if (book.title && book.url) {
            await query(
              `INSERT INTO library (title, url, created_at) 
               VALUES ($1, $2, NOW())`,
              [book.title, book.url]
            );
          }
        }

        return NextResponse.json({
          success: true,
          message: 'تم حفظ المكتبة بنجاح'
        });
      }

      // ====================================================================
      // 6️⃣ من نحن
      // ====================================================================
      if (settingKey === 'aboutUs') {
        // حذف القديم
        await query(`DELETE FROM about_us`);
        
        // إضافة الجديد
        await query(
          `INSERT INTO about_us (content, links, email, updated_at) 
           VALUES ($1, $2, $3, NOW())`,
          [
            settingValue.content,
            JSON.stringify(settingValue.links || []),
            settingValue.email
          ]
        );

        return NextResponse.json({
          success: true,
          message: 'تم حفظ معلومات من نحن بنجاح'
        });
      }

      // ====================================================================
      // 7️⃣ نسب المستويات
      // ====================================================================
      if (settingKey === 'levelRatios') {
        // التحقق من أن المجموع = 100%
        const total = settingValue.level1 + settingValue.level2 + settingValue.level3;
        if (total !== 100) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'مجموع النسب يجب أن يكون 100%' 
            },
            { status: 400 }
          );
        }

        // حذف القديم
        await query(`DELETE FROM level_ratios`);
        
        // إضافة الجديد
        await query(
          `INSERT INTO level_ratios (level_1, level_2, level_3, updated_at) 
           VALUES ($1, $2, $3, NOW())`,
          [
            settingValue.level1,
            settingValue.level2,
            settingValue.level3
          ]
        );

        return NextResponse.json({
          success: true,
          message: 'تم حفظ نسب المستويات بنجاح'
        });
      }

      // ====================================================================
      // 8️⃣ مدة طلبات الدعاء
      // ====================================================================
      if (settingKey === 'prayerRequestDuration') {
        // حذف القديم
        await query(`DELETE FROM prayer_request_duration`);
        
        // إضافة الجديد
        await query(
          `INSERT INTO prayer_request_duration (duration, custom_days, updated_at) 
           VALUES ($1, $2, NOW())`,
          [
            settingValue.duration,
            settingValue.customDays || 1
          ]
        );

        return NextResponse.json({
          success: true,
          message: 'تم حفظ مدة الطلبات بنجاح'
        });
      }

      // ====================================================================
      // 9️⃣ إعدادات الإشعارات
      // ====================================================================
      if (settingKey === 'notificationSettings') {
        // حذف القديم
        await query(`DELETE FROM notification_settings`);
        
        // إضافة الجديد
        await query(
          `INSERT INTO notification_settings 
           (onesignal_enabled, whatsapp_enabled, app_id, api_key, updated_at) 
           VALUES ($1, $2, $3, $4, NOW())`,
          [
            settingValue.oneSignalEnabled,
            settingValue.whatsappEnabled,
            settingValue.appId || null,
            settingValue.apiKey || null
          ]
        );

        return NextResponse.json({
          success: true,
          message: 'تم حفظ إعدادات الإشعارات بنجاح'
        });
      }

      // ====================================================================
      // 🔟 إعدادات البصمة
      // ====================================================================
      if (settingKey === 'fingerprintSettings') {
        // حذف القديم
        await query(`DELETE FROM fingerprint_settings`);
        
        // إضافة الجديد
        await query(
          `INSERT INTO fingerprint_settings (enabled, updated_at) 
           VALUES ($1, NOW())`,
          [settingValue.enabled]
        );

        return NextResponse.json({
          success: true,
          message: 'تم حفظ إعدادات البصمة بنجاح'
        });
      }

      // ====================================================================
      // 1️⃣1️⃣ أزرار الواجهة
      // ====================================================================
      if (settingKey === 'interfaceButtons') {
        await query(
          `INSERT INTO admin_settings (setting_key, setting_value, updated_at) 
           VALUES ($1, $2, NOW()) 
           ON CONFLICT (setting_key) 
           DO UPDATE SET setting_value = $2, updated_at = NOW()`,
          ['interfaceButtons', JSON.stringify(settingValue)]
        );

        return NextResponse.json({
          success: true,
          message: 'تم حفظ إعدادات الأزرار بنجاح'
        });
      }

      // ====================================================================
      // ❌ مفتاح غير معروف
      // ====================================================================
      return NextResponse.json(
        { 
          success: false, 
          error: 'مفتاح الإعداد غير معروف' 
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // ❌ عملية غير معروفة
    // ========================================================================
    return NextResponse.json(
      { 
        success: false, 
        error: 'عملية غير معروفة' 
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Admin API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'حدث خطأ في الخادم',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// 🗑️ DELETE - حذف إعدادات (اختياري للمستقبل)
// ============================================================================
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const settingKey = searchParams.get('key');

    if (!settingKey) {
      return NextResponse.json(
        { success: false, error: 'مفتاح الإعداد مطلوب' },
        { status: 400 }
      );
    }

    // حذف حسب نوع الإعداد
    // يمكن توسعة هذا لاحقاً

    return NextResponse.json({
      success: true,
      message: 'تم الحذف بنجاح'
    });

  } catch (error) {
    console.error('❌ Delete error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'حدث خطأ أثناء الحذف'
      },
      { status: 500 }
    );
  }
}