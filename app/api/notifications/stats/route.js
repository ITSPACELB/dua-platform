import { NextResponse } from 'next/server';

// ============================================================================
// 📊 GET - جلب إحصائيات الإشعارات من OneSignal
// ============================================================================
export async function GET(request) {
  try {
    const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const API_KEY = process.env.ONESIGNAL_REST_API_KEY;

    if (!APP_ID || !API_KEY) {
      return NextResponse.json({
        success: true,
        stats: {
          totalSubscribers: 0,
          sentToday: 0,
          clickRate: 0
        }
      });
    }

    // جلب بيانات التطبيق من OneSignal
    const appResponse = await fetch(
      `https://onesignal.com/api/v1/apps/${APP_ID}`,
      {
        headers: {
          'Authorization': `Basic ${API_KEY}`
        }
      }
    );

    if (!appResponse.ok) {
      throw new Error('Failed to fetch OneSignal app data');
    }

    const appData = await appResponse.json();

    // جلب الإشعارات المرسلة اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Math.floor(today.getTime() / 1000);

    const notificationsResponse = await fetch(
      `https://onesignal.com/api/v1/notifications?app_id=${APP_ID}&limit=50&offset=0`,
      {
        headers: {
          'Authorization': `Basic ${API_KEY}`
        }
      }
    );

    let sentToday = 0;
    let totalClicks = 0;
    let totalSent = 0;

    if (notificationsResponse.ok) {
      const notificationsData = await notificationsResponse.json();
      
      if (notificationsData.notifications) {
        notificationsData.notifications.forEach(notification => {
          const notifTime = notification.queued_at || notification.send_after;
          
          if (notifTime >= todayTimestamp) {
            sentToday++;
          }
          
          if (notification.successful) {
            totalSent += notification.successful;
          }
          
          if (notification.clicked) {
            totalClicks += notification.clicked;
          }
        });
      }
    }

    // حساب معدل النقر
    const clickRate = totalSent > 0 
      ? Math.round((totalClicks / totalSent) * 100) 
      : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalSubscribers: appData.players || 0,
        sentToday: sentToday,
        clickRate: clickRate
      }
    });

  } catch (error) {
    console.error('Error fetching notification stats:', error);
    
    // في حالة الخطأ، نرجع قيم افتراضية
    return NextResponse.json({
      success: true,
      stats: {
        totalSubscribers: 0,
        sentToday: 0,
        clickRate: 0
      }
    });
  }
}