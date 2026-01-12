import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ════════════════════════════════════════════════════════════
// 📥 GET - جلب جميع إعدادات المنصة
// ════════════════════════════════════════════════════════════
export async function GET() {
  try {
    // ════════════════════════════════════════════════════════
    // 🎨 جلب البانر
    // ════════════════════════════════════════════════════════
    const bannerResult = await query(
      `SELECT content, link, is_active 
       FROM banner 
       WHERE is_active = true 
       ORDER BY created_at DESC 
       LIMIT 1`
    );

    const banner = bannerResult.rows.length > 0 
      ? {
          active: bannerResult.rows[0].is_active,
          text: bannerResult.rows[0].content,
          link: bannerResult.rows[0].link
        }
      : { active: false, text: '', link: '' };

    // ════════════════════════════════════════════════════════
    // 💡 جلب التوعية
    // ════════════════════════════════════════════════════════
    const awarenessResult = await query(
      `SELECT content, link, is_active 
       FROM awareness 
       WHERE is_active = true 
       ORDER BY created_at DESC 
       LIMIT 1`
    );

    const awareness = awarenessResult.rows.length > 0
      ? {
          active: awarenessResult.rows[0].is_active,
          text: awarenessResult.rows[0].content,
          link: awarenessResult.rows[0].link
        }
      : { active: false, text: '', link: '' };

    // ════════════════════════════════════════════════════════
    // 🤲 جلب الدعاء الجماعي
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
      
      // تحديد حالة الدعاء (waiting/active/ended)
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

      // جلب عدد المشاركين
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
    // 📱 إعدادات إضافية (يمكن إضافتها لاحقاً)
    // ════════════════════════════════════════════════════════
    const tabsVisibility = {
      home: true,
      requests: true,
      stats: true,
      profile: true
    };

    // ════════════════════════════════════════════════════════
    // ✅ إرجاع جميع الإعدادات
    // ════════════════════════════════════════════════════════
    return NextResponse.json({
      success: true,
      banner,
      awareness,
      collectivePrayer,
      tabsVisibility
    });

  } catch (error) {
    console.error('GET /api/settings error:', error);
    
    // إرجاع إعدادات افتراضية في حالة الخطأ
    return NextResponse.json({
      success: false,
      error: error.message,
      banner: { active: false, text: '', link: '' },
      awareness: { active: false, text: '', link: '' },
      collectivePrayer: null,
      tabsVisibility: { home: true, requests: true, stats: true, profile: true }
    }, { status: 500 });
  }
}