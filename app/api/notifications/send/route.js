import { NextResponse } from 'next/server';

// ============================================================================
// 📤 POST - إرسال إشعار عبر OneSignal
// ============================================================================
export async function POST(request) {
  try {
    const body = await request.json();
    const { notification, settings } = body;

    // التحقق من البيانات
    if (!notification || !notification.title || !notification.message) {
      return NextResponse.json(
        { error: 'العنوان والرسالة مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من تفعيل OneSignal
    if (!settings?.oneSignalEnabled) {
      return NextResponse.json(
        { error: 'OneSignal غير مفعّل' },
        { status: 400 }
      );
    }

    // التحقق من المفاتيح
    const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const API_KEY = process.env.ONESIGNAL_REST_API_KEY;

    if (!APP_ID || !API_KEY) {
      return NextResponse.json(
        { error: 'مفاتيح OneSignal غير موجودة في ENV' },
        { status: 500 }
      );
    }

    // تحديد المستلمين حسب الهدف
    let filters = [];
    let included_segments = [];

    switch (notification.target) {
      case 'all':
        included_segments = ['All'];
        break;
      
      case 'level_1':
        filters = [{ field: 'tag', key: 'level', relation: '=', value: '1' }];
        break;
      
      case 'level_2':
        filters = [{ field: 'tag', key: 'level', relation: '=', value: '2' }];
        break;
      
      case 'level_3':
        filters = [{ field: 'tag', key: 'level', relation: '=', value: '3' }];
        break;
      
      case 'registered':
        filters = [{ field: 'tag', key: 'registered', relation: '=', value: 'true' }];
        break;
      
      default:
        included_segments = ['All'];
    }

    // إعداد محتوى الإشعار
    const notificationData = {
      app_id: APP_ID,
      headings: { ar: notification.title },
      contents: { ar: notification.message },
      url: notification.url || undefined,
      web_url: notification.url || undefined,
      data: {
        type: notification.type,
        url: notification.url || undefined
      },
      chrome_web_icon: '/icon-192.png',
      firefox_icon: '/icon-192.png',
      chrome_web_badge: '/icon-192.png'
    };

    // إضافة الفلاتر أو الـ Segments
    if (filters.length > 0) {
      notificationData.filters = filters;
    } else {
      notificationData.included_segments = included_segments;
    }

    // إرسال الإشعار عبر OneSignal API
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
      },
      body: JSON.stringify(notificationData)
    });

    const result = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'تم إرسال الإشعار بنجاح',
        sentCount: result.recipients || 0,
        id: result.id
      });
    } else {
      console.error('OneSignal API Error:', result);
      return NextResponse.json(
        { 
          error: 'فشل إرسال الإشعار',
          details: result.errors || result
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الإشعار' },
      { status: 500 }
    );
  }
}