'use client'
import { useState, useEffect } from 'react';

/**
 * مكون جدولة الإشعارات التلقائية
 * يستخدم في لوحة تحكم الأدمن
 * يسمح بإنشاء وإدارة الإشعارات المجدولة
 */
export default function ScheduledNotifications() {
  // ============================================================================
  // 📊 حالة الإشعارات المجدولة
  // ============================================================================
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ============================================================================
  // 📝 حالة النموذج
  // ============================================================================
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    scheduleType: 'once',
    sendTime: '',
    sendDate: '',
    dayOfWeek: '',
    dayOfMonth: '',
    deliveryMethods: {
      browser: true,
      whatsapp: false
    },
    isActive: true
  });

  // ============================================================================
  // 🔄 useEffect: جلب الإشعارات المجدولة عند التحميل
  // ============================================================================
  useEffect(() => {
    fetchScheduledNotifications();
  }, []);

  // ============================================================================
  // 🌐 جلب قائمة الإشعارات المجدولة
  // ============================================================================
  const fetchScheduledNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/admin/notifications/scheduled', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching scheduled notifications:', error);
      setLoading(false);
    }
  };

  // ============================================================================
  // ✏️ معالجة تغيير الحقول
  // ============================================================================
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ============================================================================
  // 📦 معالجة تغيير طرق الإرسال
  // ============================================================================
  const handleDeliveryMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      deliveryMethods: {
        ...prev.deliveryMethods,
        [method]: !prev.deliveryMethods[method]
      }
    }));
  };

  // ============================================================================
  // 💾 حفظ الإشعار المجدول
  // ============================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.message || !formData.sendTime) {
      alert('الرجاء إدخال العنوان والرسالة ووقت الإرسال');
      return;
    }

    // التحقق من اختيار طريقة إرسال واحدة على الأقل
    if (!formData.deliveryMethods.browser && !formData.deliveryMethods.whatsapp) {
      alert('الرجاء اختيار طريقة إرسال واحدة على الأقل');
      return;
    }

    // التحقق من الحقول المطلوبة حسب نوع الجدولة
    if (formData.scheduleType === 'once' && !formData.sendDate) {
      alert('الرجاء اختيار تاريخ الإرسال');
      return;
    }
    if (formData.scheduleType === 'weekly' && !formData.dayOfWeek) {
      alert('الرجاء اختيار يوم الأسبوع');
      return;
    }
    if (formData.scheduleType === 'monthly' && !formData.dayOfMonth) {
      alert('الرجاء اختيار يوم الشهر');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const url = editingId
        ? `/api/admin/notifications/scheduled/${editingId}`
        : '/api/admin/notifications/scheduled';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          deliveryMethods: Object.keys(formData.deliveryMethods).filter(
            key => formData.deliveryMethods[key]
          )
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(editingId ? 'تم تحديث الإشعار المجدول بنجاح' : 'تم إضافة الإشعار المجدول بنجاح');
        resetForm();
        fetchScheduledNotifications();
      } else {
        alert(data.error || 'حدث خطأ');
      }
    } catch (error) {
      console.error('Error saving scheduled notification:', error);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  // ============================================================================
  // ✏️ تعديل إشعار مجدول
  // ============================================================================
  const handleEdit = (notification) => {
    setEditingId(notification.id);
    setFormData({
      title: notification.title,
      message: notification.message,
      scheduleType: notification.scheduleType,
      sendTime: notification.sendTime,
      sendDate: notification.sendDate || '',
      dayOfWeek: notification.dayOfWeek || '',
      dayOfMonth: notification.dayOfMonth || '',
      deliveryMethods: {
        browser: notification.deliveryMethods.includes('browser'),
        whatsapp: notification.deliveryMethods.includes('whatsapp')
      },
      isActive: notification.isActive
    });
    setShowForm(true);
  };

  // ============================================================================
  // 🗑️ حذف إشعار مجدول
  // ============================================================================
  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإشعار المجدول؟')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/notifications/scheduled/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('تم حذف الإشعار المجدول بنجاح');
        fetchScheduledNotifications();
      } else {
        alert('حدث خطأ أثناء الحذف');
      }
    } catch (error) {
      console.error('Error deleting scheduled notification:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  // ============================================================================
  // 🔄 تفعيل/إيقاف إشعار مجدول
  // ============================================================================
  const toggleActive = async (id, currentStatus) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/notifications/scheduled/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        fetchScheduledNotifications();
      }
    } catch (error) {
      console.error('Error toggling notification status:', error);
    }
  };

  // ============================================================================
  // 🔄 إعادة تعيين النموذج
  // ============================================================================
  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      scheduleType: 'once',
      sendTime: '',
      sendDate: '',
      dayOfWeek: '',
      dayOfMonth: '',
      deliveryMethods: {
        browser: true,
        whatsapp: false
      },
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ============================================================================
  // 📅 تنسيق التاريخ والوقت
  // ============================================================================
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ============================================================================
  // 🎨 الحصول على نص نوع الجدولة
  // ============================================================================
  const getScheduleTypeText = (type) => {
    const types = {
      once: 'مرة واحدة',
      daily: 'يومياً',
      weekly: 'أسبوعياً',
      monthly: 'شهرياً'
    };
    return types[type] || type;
  };

  // ============================================================================
  // 🎨 حالة التحميل
  // ============================================================================
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">⏳</div>
        <p className="text-xl text-stone-600">جاري التحميل...</p>
      </div>
    );
  }

  // ============================================================================
  // 🎨 واجهة المستخدم
  // ============================================================================
  return (
    <div className="space-y-6">
      
      {/* Header مع زر إضافة */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-800">
          📅 الإشعارات المجدولة التلقائية
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-colors"
        >
          ➕ إضافة إشعار مجدول
        </button>
      </div>

      {/* النموذج */}
      {showForm && (
        <div className="bg-white p-8 rounded-xl border-2 border-stone-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-stone-800">
              {editingId ? '✏️ تعديل إشعار مجدول' : '➕ إضافة إشعار مجدول جديد'}
            </h3>
            <button
              onClick={resetForm}
              className="text-stone-500 hover:text-stone-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* العنوان */}
            <div>
              <label className="block text-stone-700 font-bold mb-2 text-lg">
                العنوان *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="مثال: تذكير صلاة الفجر"
                className="w-full px-5 py-4 text-lg border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                required
              />
            </div>

            {/* الرسالة */}
            <div>
              <label className="block text-stone-700 font-bold mb-2 text-lg">
                الرسالة *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="اكتب نص الإشعار هنا..."
                rows="4"
                className="w-full px-5 py-4 text-lg border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none resize-none"
                required
              />
            </div>

            {/* نوع الجدولة */}
            <div>
              <label className="block text-stone-700 font-bold mb-2 text-lg">
                نوع الجدولة *
              </label>
              <select
                value={formData.scheduleType}
                onChange={(e) => handleChange('scheduleType', e.target.value)}
                className="w-full px-5 py-4 text-lg border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
              >
                <option value="once">مرة واحدة</option>
                <option value="daily">يومياً</option>
                <option value="weekly">أسبوعياً</option>
                <option value="monthly">شهرياً</option>
              </select>
            </div>

            {/* وقت الإرسال */}
            <div>
              <label className="block text-stone-700 font-bold mb-2 text-lg">
                وقت الإرسال *
              </label>
              <input
                type="time"
                value={formData.sendTime}
                onChange={(e) => handleChange('sendTime', e.target.value)}
                className="w-full px-5 py-4 text-lg border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                required
              />
            </div>

            {/* تاريخ الإرسال (للمرة الواحدة فقط) */}
            {formData.scheduleType === 'once' && (
              <div>
                <label className="block text-stone-700 font-bold mb-2 text-lg">
                  تاريخ الإرسال *
                </label>
                <input
                  type="date"
                  value={formData.sendDate}
                  onChange={(e) => handleChange('sendDate', e.target.value)}
                  className="w-full px-5 py-4 text-lg border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                  required
                />
              </div>
            )}

            {/* يوم الأسبوع (للأسبوعي فقط) */}
            {formData.scheduleType === 'weekly' && (
              <div>
                <label className="block text-stone-700 font-bold mb-2 text-lg">
                  يوم الأسبوع *
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => handleChange('dayOfWeek', e.target.value)}
                  className="w-full px-5 py-4 text-lg border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                  required
                >
                  <option value="">اختر اليوم</option>
                  <option value="0">الأحد</option>
                  <option value="1">الإثنين</option>
                  <option value="2">الثلاثاء</option>
                  <option value="3">الأربعاء</option>
                  <option value="4">الخميس</option>
                  <option value="5">الجمعة</option>
                  <option value="6">السبت</option>
                </select>
              </div>
            )}

            {/* يوم الشهر (للشهري فقط) */}
            {formData.scheduleType === 'monthly' && (
              <div>
                <label className="block text-stone-700 font-bold mb-2 text-lg">
                  يوم الشهر *
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dayOfMonth}
                  onChange={(e) => handleChange('dayOfMonth', e.target.value)}
                  placeholder="مثال: 15"
                  className="w-full px-5 py-4 text-lg border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                  required
                />
              </div>
            )}

            {/* طرق الإرسال */}
            <div>
              <label className="block text-stone-700 font-bold mb-3 text-lg">
                طرق الإرسال *
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-stone-50 border-2 border-stone-200 rounded-lg cursor-pointer hover:bg-stone-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.deliveryMethods.browser}
                    onChange={() => handleDeliveryMethodChange('browser')}
                    className="w-5 h-5"
                  />
                  <span className="text-lg text-stone-700 font-semibold">
                    🔔 إشعارات المتصفح
                  </span>
                </label>
                <label className="flex items-center gap-3 p-4 bg-stone-50 border-2 border-stone-200 rounded-lg cursor-pointer hover:bg-stone-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.deliveryMethods.whatsapp}
                    onChange={() => handleDeliveryMethodChange('whatsapp')}
                    className="w-5 h-5"
                  />
                  <span className="text-lg text-stone-700 font-semibold">
                    💬 واتساب
                  </span>
                </label>
              </div>
            </div>

            {/* الحالة */}
            <div>
              <label className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-5 h-5"
                />
                <span className="text-lg text-stone-700 font-semibold">
                  ✅ نشط (سيتم إرسال الإشعارات تلقائياً)
                </span>
              </label>
            </div>

            {/* الأزرار */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xl font-bold transition-colors shadow-md"
              >
                💾 {editingId ? 'تحديث' : 'حفظ'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-8 h-14 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xl font-bold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* قائمة الإشعارات المجدولة */}
      <div className="bg-white rounded-xl border-2 border-stone-200 overflow-hidden shadow-md">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-xl text-stone-500 font-bold">
              لا توجد إشعارات مجدولة
            </p>
            <p className="text-lg text-stone-400 mt-2">
              اضغط على "إضافة إشعار مجدول" للبدء
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-100 border-b-2 border-stone-200">
                <tr>
                  <th className="px-6 py-4 text-right text-lg font-bold text-stone-700">العنوان</th>
                  <th className="px-6 py-4 text-right text-lg font-bold text-stone-700">النوع</th>
                  <th className="px-6 py-4 text-right text-lg font-bold text-stone-700">الوقت</th>
                  <th className="px-6 py-4 text-right text-lg font-bold text-stone-700">الإرسال القادم</th>
                  <th className="px-6 py-4 text-right text-lg font-bold text-stone-700">آخر إرسال</th>
                  <th className="px-6 py-4 text-right text-lg font-bold text-stone-700">الطرق</th>
                  <th className="px-6 py-4 text-right text-lg font-bold text-stone-700">الحالة</th>
                  <th className="px-6 py-4 text-right text-lg font-bold text-stone-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-stone-100">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-stone-800 text-base">
                        {notification.title}
                      </div>
                      <div className="text-stone-600 text-sm mt-1">
                        {notification.message.substring(0, 50)}
                        {notification.message.length > 50 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-base text-stone-600">
                      {getScheduleTypeText(notification.scheduleType)}
                    </td>
                    <td className="px-6 py-4 text-base text-stone-600 font-mono">
                      {notification.sendTime}
                    </td>
                    <td className="px-6 py-4 text-base text-stone-600">
                      {formatDateTime(notification.nextSendAt)}
                    </td>
                    <td className="px-6 py-4 text-base text-stone-600">
                      {formatDateTime(notification.lastSentAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {notification.deliveryMethods.includes('browser') && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                            🔔
                          </span>
                        )}
                        {notification.deliveryMethods.includes('whatsapp') && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                            💬
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(notification.id, notification.isActive)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                          notification.isActive
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {notification.isActive ? '✅ نشط' : '⏸️ متوقف'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(notification)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ملاحظة */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <p className="text-blue-800 text-lg leading-relaxed">
          💡 <strong>ملاحظة:</strong> سيتم إرسال الإشعارات تلقائياً حسب الجدول المحدد. تأكد من تفعيل الإشعارات لضمان الإرسال.
        </p>
      </div>
    </div>
  );
}