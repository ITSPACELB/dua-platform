// ════════════════════════════════════════════════════════════
// 🔔 نظام الإشعارات المحدود - منصة يُجيب
// ════════════════════════════════════════════════════════════
// القاعدة الذهبية:
// ❌ لا إشعارات للطلبات العادية
// ❌ لا إشعارات للردود العادية
// ✅ إشعارات فقط للدعاء الجماعي
// ✅ إشعارات فقط من الإدارة
// ════════════════════════════════════════════════════════════

import webpush from 'web-push';
import { query } from './db';

// ═══════════════════════════════════════════════════════════
// 🔧 إعداد Web Push
// ═══════════════════════════════════════════════════════════
webpush.setVapidDetails(
  'mailto:' + (process.env.ADMIN_EMAIL || 'admin@yujib.com'),
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ═══════════════════════════════════════════════════════════
// 📨 دالة مساعدة: إرسال إشعار لمستخدم واحد
// ═══════════════════════════════════════════════════════════
async function sendToUser(userId, payload) {
  try {
    // جلب اشتراكات المستخدم
    const subscriptions = await query(
      'SELECT endpoint, keys FROM subscriptions WHERE user_id = $1 AND is_active = true',
      [userId]
    );

    if (subscriptions.rows.length === 0) {
      return { success: false, reason: 'no_subscription' };
    }

    const results = [];

    for (const sub of subscriptions.rows) {
      try {
        const subscription = {
          endpoint: sub.endpoint,
          keys: typeof sub.keys === 'string' ? JSON.parse(sub.keys) : sub.keys
        };

        await webpush.sendNotification(subscription, JSON.stringify(payload));
        results.push({ success: true, endpoint: sub.endpoint });

        // تحديث آخر استخدام
        await query(
          'UPDATE subscriptions SET last_used = NOW() WHERE endpoint = $1',
          [sub.endpoint]
        );

      } catch (error) {
        // حذف الاشتراكات المنتهية
        if (error.statusCode === 410) {
          await query('DELETE FROM subscriptions WHERE endpoint = $1', [sub.endpoint]);
        }
        results.push({ success: false, error: error.message });
      }
    }

    // حفظ في سجل الإشعارات
    await query(
      `INSERT INTO notifications (user_id, type, title, body, url, data, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        userId,
        payload.type || 'general',
        payload.title,
        payload.body,
        payload.data?.url || '/',
        JSON.stringify(payload.data || {})
      ]
    );

    return { success: true, results };

  } catch (error) {
    console.error('Send to user error:', error);
    return { success: false, error: error.message };
  }
}

// ═══════════════════════════════════════════════════════════
// 🌍 دالة مساعدة: إرسال لجميع المستخدمين النشطين
// ═══════════════════════════════════════════════════════════
async function sendToAllActive(payload, excludeUserId = null) {
  try {
    let queryText = `
      SELECT DISTINCT u.id 
      FROM users u
      JOIN subscriptions s ON u.id = s.user_id
      WHERE s.is_active = true
    `;

    const params = [];
    
    if (excludeUserId) {
      queryText += ' AND u.id != $1';
      params.push(excludeUserId);
    }

    const activeUsers = await query(queryText, params);
    const userIds = activeUsers.rows.map(row => row.id);

    console.log(`📢 Sending notification to ${userIds.length} users`);

    const results = [];
    for (const userId of userIds) {
      const result = await sendToUser(userId, payload);
      results.push({ userId, ...result });
    }

    return results;

  } catch (error) {
    console.error('Send to all active error:', error);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════════════════════
// ⭐ الدالة الوحيدة المسموحة: إشعار دعاء جماعي
// ════════════════════════════════════════════════════════════
/**
 * إرسال إشعار دعاء جماعي لجميع المستخدمين
 * @param {Object} params - معلومات الدعاء الجماعي
 * @param {string} params.userName - اسم المستخدم
 * @param {string} params.userBadge - شارة التوثيق
 * @param {string} params.date - تاريخ الدعاء
 * @param {string} params.time - وقت الدعاء
 * @param {number} params.collectivePrayerId - معرّف الدعاء الجماعي
 * @param {number} params.userId - معرّف صاحب الدعاء (للاستثناء)
 */
export async function sendCollectivePrayerNotification({
  userName,
  userBadge = '',
  date,
  time,
  collectivePrayerId,
  userId
}) {
  try {
    // ═══════════════════════════════════════════════════════
    // 🎨 تصميم الإشعار الفاخر
    // ═══════════════════════════════════════════════════════
    const payload = {
      type: 'collective_prayer',
      title: '✨ دعوة خاصة لدعاء جماعي ✨',
      body: `يدعوكم ${userName} ${userBadge} للانضمام في ${date} الساعة ${time}`,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      image: '/notification-banner.png', // يمكن إضافة صورة مخصصة
      vibrate: [200, 100, 200], // نمط اهتزاز مميز
      requireInteraction: true, // الإشعار لا يختفي تلقائياً
      tag: `collective-${collectivePrayerId}`, // لمنع التكرار
      renotify: false,
      data: {
        url: `/collective-prayer/${collectivePrayerId}`,
        collectivePrayerId,
        date,
        time,
        type: 'collective_prayer'
      },
      actions: [
        {
          action: 'confirm',
          title: '✅ سأشارك',
          icon: '/icons/confirm.png'
        },
        {
          action: 'remind',
          title: '🔔 ذكرني قبل 30 دقيقة',
          icon: '/icons/remind.png'
        }
      ]
    };

    // ═══════════════════════════════════════════════════════
    // 📤 إرسال لجميع المستخدمين (ما عدا صاحب الدعاء)
    // ═══════════════════════════════════════════════════════
    const results = await sendToAllActive(payload, userId);

    // ═══════════════════════════════════════════════════════
    // 📊 تسجيل في قاعدة البيانات
    // ═══════════════════════════════════════════════════════
    await query(
      `INSERT INTO collective_prayer_notifications 
       (collective_prayer_id, sent_to_count, sent_at)
       VALUES ($1, $2, NOW())`,
      [
        collectivePrayerId,
        results.filter(r => r.success).length
      ]
    );

    console.log(`✅ Collective prayer notification sent: ${results.length} users`);

    return {
      success: true,
      sentCount: results.filter(r => r.success).length,
      totalCount: results.length,
      results
    };

  } catch (error) {
    console.error('❌ Send collective prayer notification error:', error);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════════════════════
// 👨‍💼 الدالة الثانية المسموحة: إشعارات الإدارة
// ════════════════════════════════════════════════════════════
/**
 * إرسال إشعار من الإدارة (Admin فقط)
 * @param {Object} params - معلومات الإشعار
 * @param {string} params.title - عنوان الإشعار
 * @param {string} params.message - نص الإشعار
 * @param {string} params.targetUsers - 'all' | 'verified' | [userIds]
 * @param {number} params.adminId - معرّف الآدمن (للتحقق)
 */
export async function sendAdminNotification({
  title,
  message,
  targetUsers = 'all',
  adminId
}) {
  try {
    // ═══════════════════════════════════════════════════════
    // 🔐 التحقق من صلاحيات الآدمن
    // ═══════════════════════════════════════════════════════
    const adminCheck = await query(
      'SELECT role FROM users WHERE id = $1',
      [adminId]
    );

    if (adminCheck.rows.length === 0 || adminCheck.rows[0].role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // ═══════════════════════════════════════════════════════
    // 🎯 تحديد المستخدمين المستهدفين
    // ═══════════════════════════════════════════════════════
    let userIds = [];

    if (targetUsers === 'all') {
      // كل المستخدمين النشطين
      const users = await query(
        `SELECT DISTINCT u.id 
         FROM users u
         JOIN subscriptions s ON u.id = s.user_id
         WHERE s.is_active = true`
      );
      userIds = users.rows.map(row => row.id);

    } else if (targetUsers === 'verified') {
      // المستخدمين الموثقين فقط (80%+)
      const users = await query(
        `SELECT DISTINCT u.id 
         FROM users u
         JOIN subscriptions s ON u.id = s.user_id
         JOIN user_stats us ON u.id = us.user_id
         WHERE s.is_active = true AND us.interaction_rate >= 80`
      );
      userIds = users.rows.map(row => row.id);

    } else if (Array.isArray(targetUsers)) {
      // قائمة محددة من المستخدمين
      userIds = targetUsers;
    }

    // ═══════════════════════════════════════════════════════
    // 🎨 تصميم الإشعار
    // ═══════════════════════════════════════════════════════
    const payload = {
      type: 'admin_announcement',
      title: `📢 ${title}`,
      body: message,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      tag: `admin-${Date.now()}`,
      data: {
        url: '/',
        type: 'admin_announcement',
        timestamp: new Date().toISOString()
      }
    };

    // ═══════════════════════════════════════════════════════
    // 📤 إرسال الإشعارات
    // ═══════════════════════════════════════════════════════
    const results = [];
    for (const userId of userIds) {
      const result = await sendToUser(userId, payload);
      results.push({ userId, ...result });
    }

    // ═══════════════════════════════════════════════════════
    // 📊 تسجيل في قاعدة البيانات
    // ═══════════════════════════════════════════════════════
    await query(
      `INSERT INTO admin_notifications 
       (admin_id, title, message, target_users, sent_count, sent_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        adminId,
        title,
        message,
        typeof targetUsers === 'string' ? targetUsers : 'specific',
        results.filter(r => r.success).length
      ]
    );

    console.log(`✅ Admin notification sent: ${results.length} users`);

    return {
      success: true,
      sentCount: results.filter(r => r.success).length,
      totalCount: results.length,
      results
    };

  } catch (error) {
    console.error('❌ Send admin notification error:', error);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════════════════════
// 🔔 دالة مساعدة: تذكير قبل الدعاء الجماعي (30 دقيقة)
// ════════════════════════════════════════════════════════════
/**
 * إرسال تذكير للمشاركين قبل 30 دقيقة من الدعاء الجماعي
 * @param {number} collectivePrayerId - معرّف الدعاء الجماعي
 */
export async function sendCollectivePrayerReminder(collectivePrayerId) {
  try {
    // جلب معلومات الدعاء والمشاركين
    const prayerData = await query(
      `SELECT 
        cp.id,
        cp.scheduled_date,
        cp.user_id,
        u.full_name,
        u.nickname
       FROM collective_prayers cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.id = $1`,
      [collectivePrayerId]
    );

    if (prayerData.rows.length === 0) {
      return { success: false, reason: 'prayer_not_found' };
    }

    const prayer = prayerData.rows[0];
    const userName = prayer.nickname || prayer.full_name.split(' ')[0];

    // جلب المشاركين الذين أكدوا المشاركة
    const participants = await query(
      `SELECT user_id 
       FROM collective_prayer_participants 
       WHERE collective_prayer_id = $1 AND confirmed = true`,
      [collectivePrayerId]
    );

    if (participants.rows.length === 0) {
      return { success: false, reason: 'no_participants' };
    }

    const payload = {
      type: 'collective_prayer_reminder',
      title: '⏰ تذكير: الدعاء الجماعي بعد 30 دقيقة',
      body: `الدعاء الجماعي الذي دعاكم له ${userName} سيبدأ قريباً`,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      vibrate: [300, 200, 300],
      requireInteraction: true,
      tag: `reminder-${collectivePrayerId}`,
      data: {
        url: `/collective-prayer/${collectivePrayerId}`,
        collectivePrayerId,
        type: 'collective_prayer_reminder'
      }
    };

    const results = [];
    for (const participant of participants.rows) {
      const result = await sendToUser(participant.user_id, payload);
      results.push({ userId: participant.user_id, ...result });
    }

    console.log(`✅ Reminder sent: ${results.length} participants`);

    return {
      success: true,
      sentCount: results.filter(r => r.success).length,
      totalCount: results.length
    };

  } catch (error) {
    console.error('❌ Send reminder error:', error);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════════════════════
// 🚫 ملاحظة مهمة جداً
// ════════════════════════════════════════════════════════════
// هذا الملف يحتوي فقط على 3 دوال مسموحة:
// 1. sendCollectivePrayerNotification() - للدعاء الجماعي
// 2. sendAdminNotification() - للإدارة فقط
// 3. sendCollectivePrayerReminder() - تذكير قبل 30 دقيقة
//
// ❌ لا توجد دوال لإشعارات الطلبات العادية
// ❌ لا توجد دوال لإشعارات الردود
// ❌ لا توجد دوال لأي نوع آخر من الإشعارات
//
// هذا التصميم متعمد لتقليل الضوضاء وتحسين تجربة المستخدم
// ════════════════════════════════════════════════════════════