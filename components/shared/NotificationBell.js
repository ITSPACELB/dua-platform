'use client'

// ============================================================================
// 🔔 جرس الإشعارات - منصة يُجيب
// ============================================================================
// المرحلة 8: نظام إشعارات محدود (أدمن فقط)
// ============================================================================

import { useState, useEffect } from 'react'
import { Bell, X, Check, Trash2 } from 'lucide-react'

export default function NotificationBell({ userId, token }) {
  // ============================================================================
  // 🎨 الحالات
  // ============================================================================
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // ============================================================================
  // 📡 جلب الإشعارات
  // ============================================================================
  useEffect(() => {
    if (userId && token) {
      fetchNotifications()
      
      // تحديث كل دقيقة
      const interval = setInterval(fetchNotifications, 60000)
      return () => clearInterval(interval)
    }
  }, [userId, token])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        
        // حساب غير المقروءة
        const unread = data.notifications.filter(n => !n.is_read).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // ============================================================================
  // ✅ تعليم كمقروء
  // ============================================================================
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'mark_read' })
      })

      if (response.ok) {
        // تحديث محلياً
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, is_read: true } 
              : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  // ============================================================================
  // 🗑️ حذف إشعار
  // ============================================================================
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        
        // إذا كان غير مقروء، اطرحه من العداد
        const notification = notifications.find(n => n.id === notificationId)
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  // ============================================================================
  // ✅ تعليم الكل كمقروء
  // ============================================================================
  const markAllAsRead = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // 🎨 أيقونة الإشعار
  // ============================================================================
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'admin':
        return '👑'
      case 'collective':
        return '🌍'
      case 'reminder':
        return '⏰'
      case 'achievement':
        return '🏆'
      case 'announcement':
        return '📢'
      default:
        return '🔔'
    }
  }

  // ============================================================================
  // 📅 تنسيق الوقت
  // ============================================================================
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays < 7) return `منذ ${diffDays} يوم`
    
    return date.toLocaleDateString('ar-IQ', {
      month: 'long',
      day: 'numeric'
    })
  }

  // ============================================================================
  // 🎨 العرض
  // ============================================================================
  return (
    <>
      {/* زر الجرس */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 hover:bg-stone-100 rounded-full transition-colors"
        aria-label="الإشعارات"
      >
        <Bell size={24} className="text-stone-700" />
        
        {/* عداد غير المقروءة */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <>
          {/* خلفية شفافة */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* القائمة */}
          <div className="absolute left-0 top-16 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border-2 border-stone-200">
            {/* العنوان */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Bell size={24} />
                <div>
                  <h3 className="text-xl font-bold">الإشعارات</h3>
                  {unreadCount > 0 && (
                    <p className="text-sm text-emerald-100">
                      {unreadCount} غير مقروءة
                    </p>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-emerald-800 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* أزرار الإجراءات */}
            {notifications.length > 0 && unreadCount > 0 && (
              <div className="p-3 border-b border-stone-200 bg-stone-50">
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-sm text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-2"
                >
                  <Check size={16} />
                  تعليم الكل كمقروء
                </button>
              </div>
            )}

            {/* قائمة الإشعارات */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Bell size={48} className="mx-auto text-stone-300 mb-4" />
                  <p className="text-stone-500 text-lg">لا توجد إشعارات</p>
                  <p className="text-stone-400 text-sm mt-2">
                    ستصلك الإشعارات المهمة هنا
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-all hover:bg-stone-50 ${
                        !notification.is_read 
                          ? 'bg-emerald-50 border-l-4 border-emerald-500' 
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* الأيقونة */}
                        <div className="text-3xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* المحتوى */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-800 text-base mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-stone-600 text-sm leading-relaxed mb-2">
                            {notification.body}
                          </p>
                          <p className="text-stone-400 text-xs">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>

                        {/* الإجراءات */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-emerald-600 hover:text-emerald-700 p-1"
                              title="تعليم كمقروء"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* الذيل */}
            {notifications.length > 0 && (
              <div className="p-3 bg-stone-50 border-t border-stone-200 text-center">
                <p className="text-xs text-stone-500">
                  يتم حذف الإشعارات القديمة تلقائياً بعد 30 يوم
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}