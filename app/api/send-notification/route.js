import { NextResponse } from 'next/server'
import webpush from 'web-push'

// إعداد Web Push
webpush.setVapidDetails(
  'mailto:haydar.cd@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export async function POST(request) {
  try {
    const { subscription, title, body } = await request.json()

    const payload = JSON.stringify({
      title: title || 'منصة الدعاء الجماعي',
      body: body || 'لديك طلبات دعاء جديدة',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      url: '/'
    })

    await webpush.sendNotification(subscription, payload)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}