import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ⚡ جعل الـ API dynamic (ليس cached)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ════════════════════════════════════════════════════════════
// 📥 GET - جلب جميع إعدادات المنصة
// ════════════════════════════════════════════════════════════
export async function GET() {
  try {
    // ════════════════════════════════════════════════════════
    // 📦 جلب كل الإعدادات من platform_settings
    // ════════════════════════════════════════════════════════
    const platformSettingsResult = await query(
      `SELECT key, value FROM platform_settings`
    );

    const platformSettings = {};
    platformSettingsResult.rows.forEach(row => {
      try {
        platformSettings[row.key] = JSON.parse(row.value);
      } catch {
        platformSettings[row.key] = row.value;
      }
    });

    // ════════════════════════════════════════════════════════
    // 🎨 البانر - النص والحالة من جدول banner، الألوان من platform_settings
    // ════════════════════════════════════════════════════════
    let banner = {
      active: false,
      text: '',
      link: '',
      backgroundColor: '#10b981',
      textColor: '#ffffff'
    };

    // جلب البانر من الجدول (النص والحالة)
    const bannerResult = await query(
      `SELECT content, link, is_active
       FROM banner
       ORDER BY updated_at DESC
       LIMIT 1`
    );

    if (bannerResult.rows.length > 0) {
      const dbBanner = bannerResult.rows[0];
      banner.active = dbBanner.is_active || false;
      banner.text = dbBanner.content || '';
      banner.link = dbBanner.link || '';
    }

    // جلب الألوان من platform_settings
    if (platformSettings.banner) {
      banner.backgroundColor = platformSettings.banner.backgroundColor || '#10b981';
      banner.textColor = platformSettings.banner.textColor || '#ffffff';
    }

    // ════════════════════════════════════════════════════════
    // 💡 التوعية - من جدول awareness
    // ════════════════════════════════════════════════════════
    let awareness = {
      active: false,
      text: '',
      link: [],
      links: []
    };

    const awarenessResult = await query(
      `SELECT content, link, is_active
       FROM awareness
       ORDER BY updated_at DESC
       LIMIT 1`
    );

    if (awarenessResult.rows.length > 0) {
      const dbAwareness = awarenessResult.rows[0];
      awareness.active = dbAwareness.is_active || false;
      awareness.text = dbAwareness.content || '';
      awareness.link = dbAwareness.link || [];
      awareness.links = dbAwareness.link || [];
    }

    // ════════════════════════════════════════════════════════
    // 🤲 الدعاء الجماعي - بدون أي تغيير (يعمل بنجاح)
    // ════════════════════════════════════════════════════════
    const collectivePrayerResult = await query(
      `SELECT
        id,
        type,
        content,
        timing,
        is_active,
        scheduled_datetime,
        duration_minutes
       FROM collective_prayer
       WHERE is_active = true
       ORDER BY created_at DESC
       LIMIT 1`
    );

    let collectivePrayer = null;

    if (collectivePrayerResult.rows.length > 0) {
      const prayer = collectivePrayerResult.rows[0];

      const now = new Date();
      const scheduledTime = prayer.scheduled_datetime ? new Date(prayer.scheduled_datetime) : null;
      const endTime = scheduledTime
        ? new Date(scheduledTime.getTime() + (prayer.duration_minutes || 30) * 60000)
        : null;

      let status = 'active';
      if (scheduledTime) {
        if (now < scheduledTime) {
          status = 'waiting';
        } else if (now > endTime) {
          status = 'ended';
        }
      }

      const participantsResult = await query(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM collective_prayer_participants
         WHERE prayer_id = $1`,
        [prayer.id]
      );

      collectivePrayer = {
        id: prayer.id,
        isActive: prayer.is_active,
        status: status,
        verseText: prayer.content,
        verseReference: prayer.type === 'verse' ? 'verse' : null,
        customPrayer: prayer.type === 'custom' ? prayer.content : null,
        scheduledDatetime: prayer.scheduled_datetime,
        durationMinutes: prayer.duration_minutes || 30,
        participantCount: parseInt(participantsResult.rows[0]?.count) || 0
      };
    }

    // ════════════════════════════════════════════════════════
    // 📱 التبويبات - من platform_settings
    // ════════════════════════════════════════════════════════
    let tabsVisibility = {
      home: true,
      requests: true,
      stats: true,
      profile: true,
      prayers: true,
      achievements: true,
      notifications: true
    };

    if (platformSettings.tabs_visibility) {
      tabsVisibility = {
        ...tabsVisibility,
        ...platformSettings.tabs_visibility
      };
    }

    // ════════════════════════════════════════════════════════
    // 🔔 الإشعارات - من platform_settings
    // ════════════════════════════════════════════════════════
    let notifications = {
      pushEnabled: false,
      emailEnabled: false,
      smsEnabled: false
    };

    if (platformSettings.notifications) {
      notifications = {
        ...notifications,
        ...platformSettings.notifications
      };
    }

    // ════════════════════════════════════════════════════════
    // ✅ إرجاع جميع الإعدادات
    // ════════════════════════════════════════════════════════
    return NextResponse.json({
      success: true,
      banner,
      awareness,
      collectivePrayer,
      tabsVisibility,
      notifications
    });

  } catch (error) {
    console.error('GET /api/settings error:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      banner: { active: false, text: '', link: '', backgroundColor: '#10b981', textColor: '#ffffff' },
      awareness: { active: false, text: '', link: [], links: [] },
      collectivePrayer: null,
      tabsVisibility: { home: true, requests: true, stats: true, profile: true },
      notifications: { pushEnabled: false, emailEnabled: false, smsEnabled: false }
    }, { status: 500 });
  }
}
