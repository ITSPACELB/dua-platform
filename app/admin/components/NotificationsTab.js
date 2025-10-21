'use client'
import { useState, useEffect } from 'react';

export default function NotificationsTab() {
  const [notificationType, setNotificationType] = useState('single'); // single, all, scheduled
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [notification, setNotification] = useState({
    title: '',
    body: '',
    url: ''
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (notificationType === 'single') {
      loadUsers();
    }
  }, [notificationType]);

  const loadUsers = () => {
    const token = localStorage.getItem('token');
    
    fetch('/api/admin/users?limit=100', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAllUsers(data.users);
        }
      })
      .catch(err => console.error('Load users error:', err));
  };

  const handleSendNotification = () => {
    if (!notification.title.trim() || !notification.body.trim()) {
      alert('⚠️ يجب إدخال العنوان والمحتوى');
      return;
    }

    if (notificationType === 'single' && selectedUsers.length === 0) {
      alert('⚠️ يجب اختيار مستخدم واحد على الأقل');
      return;
    }

    if (!confirm(`هل تريد إرسال هذا الإشعار؟\n\n${notificationType === 'all' ? '✅ سيتم إرساله لجميع المستخدمين' : `✅ سيتم إرساله لـ ${selectedUsers.length} مستخدم`}`)) {
      return;
    }

    const token = localStorage.getItem('token');
    setLoading(true);

    const endpoint = notificationType === 'all' 
      ? '/api/admin/notifications/broadcast'
      : '/api/admin/notifications/send';

    const body = notificationType === 'all'
      ? notification
      : { ...notification, userIds: selectedUsers };

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(`✅ ${data.message || 'تم إرسال الإشعار بنجاح'}\n\n📊 تم الإرسال لـ ${data.sentCount || 0} مستخدم`);
          setNotification({ title: '', body: '', url: '' });
          setSelectedUsers([]);
        } else {
          alert('❌ ' + (data.error || 'فشل الإرسال'));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Send notification error:', err);
        alert('❌ حدث خطأ أثناء الإرسال');
        setLoading(false);
      });
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = allUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.motherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          🔔 إدارة الإشعارات
        </h2>
      </div>

      {/* Notification Type Selector */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <label className="block text-sm font-semibold text-stone-700 mb-3">📨 نوع الإشعار:</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setNotificationType('single')}
            className={`p-6 rounded-xl border-2 transition-all ${
              notificationType === 'single'
                ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                : 'border-stone-200 bg-white hover:border-emerald-300'
            }`}
          >
            <div className="text-4xl mb-3">👤</div>
            <h3 className="font-bold text-stone-800 mb-1">إشعار لمستخدم محدد</h3>
            <p className="text-sm text-stone-600">اختر المستخدمين المطلوبين</p>
          </button>

          <button
            onClick={() => setNotificationType('all')}
            className={`p-6 rounded-xl border-2 transition-all ${
              notificationType === 'all'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-stone-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-bold text-stone-800 mb-1">إشعار جماعي</h3>
            <p className="text-sm text-stone-600">لجميع المستخدمين</p>
          </button>

          <button
            onClick={() => setNotificationType('scheduled')}
            className={`p-6 rounded-xl border-2 transition-all ${
              notificationType === 'scheduled'
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-stone-200 bg-white hover:border-purple-300'
            }`}
          >
            <div className="text-4xl mb-3">⏰</div>
            <h3 className="font-bold text-stone-800 mb-1">إشعار مجدول</h3>
            <p className="text-sm text-stone-600">جدولة الإرسال لاحقاً</p>
            <span className="inline-block mt-2 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-bold">
              قريباً
            </span>
          </button>
        </div>
      </div>

      {/* User Selection (for single notification) */}
      {notificationType === 'single' && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            👥 اختيار المستخدمين ({selectedUsers.length} محدد)
          </h3>
          
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 ابحث عن مستخدم..."
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>

          {/* Select/Deselect All */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setSelectedUsers(filteredUsers.map(u => u.id))}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold"
            >
              ✓ تحديد الكل
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="px-4 py-2 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors text-sm font-semibold"
            >
              ✗ إلغاء التحديد
            </button>
          </div>

          {/* Users List */}
          <div className="max-h-96 overflow-y-auto border border-stone-200 rounded-lg">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-stone-600">
                <div className="text-4xl mb-2">🔍</div>
                <p>لا توجد نتائج</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-200">
                {filteredUsers.map(user => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-4 hover:bg-stone-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-stone-800">{user.fullName}</p>
                      <p className="text-sm text-stone-600">أم: {user.motherName}</p>
                    </div>
                    {user.phoneNumber && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-mono">
                        {user.phoneNumber}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Form */}
      {notificationType !== 'scheduled' && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            ✍️ محتوى الإشعار
          </h3>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                📌 العنوان:
              </label>
              <input
                type="text"
                value={notification.title}
                onChange={(e) => setNotification({...notification, title: e.target.value})}
                placeholder="مثال: طلب دعاء جديد"
                maxLength={50}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
              <p className="text-xs text-stone-500 mt-1">{notification.title.length}/50 حرف</p>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                📝 المحتوى:
              </label>
              <textarea
                value={notification.body}
                onChange={(e) => setNotification({...notification, body: e.target.value})}
                placeholder="مثال: محمد يطلب دعاءكم، خذ لحظة وادعُ له 🤲"
                rows="4"
                maxLength={200}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none"
              />
              <p className="text-xs text-stone-500 mt-1">{notification.body.length}/200 حرف</p>
            </div>

            {/* URL (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                🔗 الرابط (اختياري):
              </label>
              <input
                type="text"
                value={notification.url}
                onChange={(e) => setNotification({...notification, url: e.target.value})}
                placeholder="مثال: /prayer-request/123"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
              <p className="text-xs text-stone-500 mt-1">سيتم فتح هذا الرابط عند الضغط على الإشعار</p>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-stone-50 border border-stone-200 rounded-lg">
            <p className="text-xs font-semibold text-stone-600 mb-3">👁️ معاينة الإشعار:</p>
            <div className="bg-white border border-stone-300 rounded-lg p-4 shadow-md">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">🤲</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-stone-800 text-sm mb-1">
                    {notification.title || 'عنوان الإشعار'}
                  </p>
                  <p className="text-stone-600 text-sm">
                    {notification.body || 'محتوى الإشعار سيظهر هنا...'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendNotification}
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                جاري الإرسال...
              </>
            ) : (
              <>
                <span>📤</span>
                إرسال الإشعار
                {notificationType === 'all' && ' لجميع المستخدمين'}
                {notificationType === 'single' && ` لـ ${selectedUsers.length} مستخدم`}
              </>
            )}
          </button>
        </div>
      )}

      {/* Scheduled Notification (Coming Soon) */}
      {notificationType === 'scheduled' && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">الإشعارات المجدولة</h3>
          <p className="text-stone-600 mb-4">هذه الميزة قيد التطوير وستكون متاحة قريباً</p>
          <div className="inline-block bg-amber-100 text-amber-700 px-4 py-2 rounded-lg font-semibold">
            🚧 قريباً
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
          💡 نصائح لإشعارات فعالة:
        </h4>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>اجعل العنوان قصيراً ومباشراً (أقل من 50 حرف)</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>استخدم الرموز التعبيرية لجذب الانتباه 🤲 ✨</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>كن واضحاً في المحتوى وحدد الإجراء المطلوب</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✓</span>
            <span>أضف رابطاً مباشراً للصفحة المطلوبة</span>
          </li>
          <li className="flex items-start gap-2">
            <span>⚠️</span>
            <span>لا ترسل إشعارات متكررة لتجنب إزعاج المستخدمين</span>
          </li>
        </ul>
      </div>
    </div>
  );
}