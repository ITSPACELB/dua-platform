// ============================================================================
// 🔔 API: الإشعارات - منصة يُجيب
// ============================================================================
// المرحلة 8: نظام إشعارات محدود (أدمن فقط)
// المسار: app/api/notifications/route.js
// ============================================================================

import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// ============================================================================
// 🔐 دالة للتحقق من الـ token
// ============================================================================
function verifyToken(request) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// ============================================================================
// 🔐 التحقق من صلاحيات الأدمن
// ============================================================================
async function isAdmin(userId) {
  try {
    const result = await query(
      'SELECT is_admin FROM users WHERE id = $1',
      [userId]
    )
    
    return result.rows.length > 0 && result.rows[0].is_admin === true
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// ============================================================================
// GET - جلب إشعارات المستخدم
// ============================================================================
export async function GET(request) {
  try {
    // التحقق من الـ token
    const decoded = verifyToken(request)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'غير مصرح. الرجاء تسجيل الدخول.' },
        { status: 401 }
      )
    }

    const userId = decoded.userId

    // جلب إشعارات المستخدم (آخر 30 يوم)
    const result = await query(
      `SELECT 
        id,
        type,
        title,
        body,
        url,
        data,
        is_read,
        created_at
       FROM notifications
       WHERE user_id = $1
       AND created_at > NOW() - INTERVAL '30 days'
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    )

    return NextResponse.json({
      success: true,
      notifications: result.rows
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الإشعارات' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - إرسال إشعار (للأدمن فقط)
// ============================================================================
export async function POST(request) {
  try {
    // التحقق من الـ token
    const decoded = verifyToken(request)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'غير مصرح. الرجاء تسجيل الدخول.' },
        { status: 401 }
      )
    }

    // التحقق من صلاحيات الأدمن
    const adminStatus = await isAdmin(decoded.userId)
    
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'غير مصرح. هذه الصلاحية للإدارة فقط.' },
        { status: 403 }
      )
    }

    // قراءة البيانات
    const body = await request.json()
    const { 
      title, 
      message, 
      type = 'admin',
      targetUsers = 'all' // all, level_3, winners
    } = body

    // التحقق من البيانات
    if (!title || !message) {
      return NextResponse.json(
        { error: 'العنوان والرسالة مطلوبان' },
        { status: 400 }
      )
    }

    // تحديد المستخدمين المستهدفين
    let targetQuery = 'SELECT id FROM users WHERE 1=1'
    const params = []

    if (targetUsers === 'level_3') {
      // المستوى 3 فقط (لديهم رقم هاتف)
      targetQuery += ' AND phone_number IS NOT NULL'
    } else if (targetUsers === 'winners') {
      // الفائزون الحاليون في القرعة
      targetQuery = `
        SELECT DISTINCT u.id 
        FROM users u
        JOIN achievements a ON u.id = a.user_id
        WHERE a.achievement_type = 'name_display'
        AND a.expires_at > NOW()
      `
    }

    const targetUsersResult = await query(targetQuery, params)
    const userIds = targetUsersResult.rows.map(row => row.id)

    if (userIds.length === 0) {
      return NextResponse.json(
        { error: 'لا يوجد مستخدمون مستهدفون' },
        { status: 400 }
      )
    }

    // إدراج الإشعارات
    const insertPromises = userIds.map(userId => 
      query(
        `INSERT INTO notifications 
         (user_id, type, title, body, url, data, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, false, NOW())`,
        [
          userId,
          type,
          title,
          message,
          '/',
          JSON.stringify({ sentBy: 'admin' })
        ]
      )
    )

    await Promise.all(insertPromises)

    // إرسال الإشعار عبر Web Push
    const { sendCollectivePrayerNotification } = require('@/lib/notifications')
    
    await sendCollectivePrayerNotification({
      senderId: decoded.userId,
      senderName: 'الإدارة',
      message,
      type: 'admin',
      title
    })

    return NextResponse.json({
      success: true,
      message: 'تم إرسال الإشعار بنجاح',
      sentTo: userIds.length
    })

  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الإشعار' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PUT - تعليم كمقروء
// ============================================================================
export async function PUT(request) {
  try {
    // التحقق من الـ token
    const decoded = verifyToken(request)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'غير مصرح. الرجاء تسجيل الدخول.' },
        { status: 401 }
      )
    }

    const userId = decoded.userId
    const body = await request.json()
    const { notificationId } = body

    if (!notificationId) {
      return NextResponse.json(
        { error: 'معرّف الإشعار مطلوب' },
        { status: 400 }
      )
    }

    // تعليم كمقروء
    await query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    )

    return NextResponse.json({
      success: true,
      message: 'تم التعليم كمقروء'
    })

  } catch (error) {
    console.error('Mark as read error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التعليم' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - حذف إشعار
// ============================================================================
export async function DELETE(request) {
  try {
    // التحقق من الـ token
    const decoded = verifyToken(request)
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'غير مصرح. الرجاء تسجيل الدخول.' },
        { status: 401 }
      )
    }

    const userId = decoded.userId
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('id')

    if (!notificationId) {
      return NextResponse.json(
        { error: 'معرّف الإشعار مطلوب' },
        { status: 400 }
      )
    }

    // حذف الإشعار
    await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    )

    return NextResponse.json({
      success: true,
      message: 'تم حذف الإشعار'
    })

  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء الحذف' },
      { status: 500 }
    )
  }
}