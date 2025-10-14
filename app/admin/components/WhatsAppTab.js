'use client'
import { useState, useEffect } from 'react';

export default function WhatsAppTab() {
  const [usersWithPhone, setUsersWithPhone] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingType, setSendingType] = useState('selected'); // selected, all

  useEffect(() => {
    loadUsersWithPhone();
  }, []);

  const loadUsersWithPhone = () => {
    const token = localStorage.getItem('token');
    setLoading(true);

    fetch('/api/admin/users/with-phone', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsersWithPhone(data.users);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Load users error:', err);
        setLoading(false);
      });
  };

  const handleSendWhatsApp = () => {
    if (!message.trim()) {
      alert('⚠️ يجب كتابة رسالة');
      return;
    }

    if (sendingType === 'selected' && selectedUsers.length === 0) {
      alert('⚠️ يجب اختيار مستخدم واحد على الأقل');
      return;
    }

    const count = sendingType === 'all' ? usersWithPhone.length : selectedUsers.length;
    
    if (!confirm(`📱 هل تريد إرسال هذه الرسالة عبر واتساب؟\n\n✅ سيتم الإرسال لـ ${count} رقم\n\n⚠️ ملاحظة: سيتم فتح واتساب ويب، قد تحتاج للإرسال يدوياً`)) {
      return;
    }

    const token = localStorage.getItem('token');
    const endpoint = '/api/admin/whatsapp/send';

    const body = {
      message,
      userIds: sendingType === 'all' ? usersWithPhone.map(u => u.id) : selectedUsers
    };

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
          alert(`✅ ${data.message}\n\n📊 تم تجهيز ${data.count} رسالة`);
          
          // فتح واتساب ويب للأرقام
          if (data.numbers && data.numbers.length > 0) {
            data.numbers.forEach((number, idx) => {
              setTimeout(() => {
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/${number}?text=${encodedMessage}`, '_blank');
              }, idx * 2000); // تأخير 2 ثانية بين كل رسالة
            });
          }
          
          setMessage('');
          setSelectedUsers([]);
        } else {
          alert('❌ ' + (data.error || 'فشل الإرسال'));
        }
      })
      .catch(err => {
        console.error('WhatsApp send error:', err);
        alert('❌ حدث خطأ أثناء الإرسال');
      });
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = usersWithPhone.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 animate-pulse">📱</div>
        <p className="text-stone-600">جاري تحميل المستخدمين...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          📱 إرسال رسائل واتساب
        </h2>
        <div className="text-sm text-stone-600 bg-green-100 border border-green-300 px-4 py-2 rounded-lg font-semibold">
          👥 {usersWithPhone.length} مستخدم لديه رقم هاتف
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">💬</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">إرسال رسائل واتساب مباشرة</h3>
            <p className="text-green-100 text-sm mb-3">
              يمكنك إرسال رسائل واتساب للمستخدمين الذين قاموا بإدخال أرقام هواتفهم في المنصة
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-sm">
              <p className="mb-2">⚠️ <strong>ملاحظة مهمة:</strong></p>
              <ul className="space-y-1 text-green-100">
                <li>• سيتم فتح واتساب ويب لكل رقم تلقائياً</li>
                <li>• قد تحتاج للضغط على "إرسال" يدوياً لكل رسالة</li>
                <li>• تأكد من تسجيل دخولك في واتساب ويب</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sending Type Selector */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <label className="block text-sm font-semibold text-stone-700 mb-3">📨 نوع الإرسال:</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setSendingType('selected')}
            className={`p-6 rounded-xl border-2 transition-all ${
              sendingType === 'selected'
                ? 'border-green-500 bg-green-50 shadow-lg'
                : 'border-stone-200 bg-white hover:border-green-300'
            }`}
          >
            <div className="text-4xl mb-3">👤</div>
            <h3 className="font-bold text-stone-800 mb-1">إرسال لمستخدمين محددين</h3>
            <p className="text-sm text-stone-600">اختر المستخدمين المطلوبين</p>
          </button>

          <button
            onClick={() => setSendingType('all')}
            className={`p-6 rounded-xl border-2 transition-all ${
              sendingType === 'all'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-stone-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-bold text-stone-800 mb-1">إرسال للجميع</h3>
            <p className="text-sm text-stone-600">لجميع من لديهم أرقام ({usersWithPhone.length})</p>
          </button>
        </div>
      </div>

      {/* User Selection */}
      {sendingType === 'selected' && (
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
              placeholder="🔍 ابحث بالاسم أو رقم الهاتف..."
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </div>

          {/* Select/Deselect All */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setSelectedUsers(filteredUsers.map(u => u.id))}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
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
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-stone-800">{user.fullName}</p>
                      <p className="text-sm text-stone-600">أم: {user.motherName}</p>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-lg font-mono font-semibold">
                        <span>📱</span>
                        <span>{user.phoneNumber}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Composer */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          ✍️ نص الرسالة
        </h3>

        <div className="space-y-4">
          {/* Message Input */}
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا...\n\nمثال:\nالسلام عليكم 🌿\nنذكركم بالدعاء لإخوانكم المسلمين\nمنصة الدعاء الجماعي - يُجيب 🤲"
              rows="6"
              maxLength={1000}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none resize-none font-arabic"
            />
            <p className="text-xs text-stone-500 mt-1">{message.length}/1000 حرف</p>
          </div>

          {/* Quick Templates */}
          <div>
            <p className="text-sm font-semibold text-stone-700 mb-2">📝 قوالب سريعة:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                {
                  label: 'تذكير بالدعاء',
                  text: 'السلام عليكم 🌿\n\nنذكركم بالدعاء لإخوانكم المسلمين في منصة الدعاء الجماعي\n\nمنصة يُجيب 🤲'
                },
                {
                  label: 'طلب دعاء جديد',
                  text: 'السلام عليكم 🌿\n\nهناك طلب دعاء جديد يحتاج دعاءكم\n\nادخل للمنصة وادعُ لإخوانك 🤲\n\nhttps://yojeeb.com'
                },
                {
                  label: 'شكر وتقدير',
                  text: 'جزاكم الله خيراً 🌟\n\nنشكركم على مشاركتكم في منصة الدعاء الجماعي\n\nدعاؤكم يصنع الفرق 🤲'
                },
                {
                  label: 'تحديث مهم',
                  text: 'السلام عليكم 🌿\n\nتم إضافة ميزات جديدة للمنصة\n\nتفقد التحديثات في:\nhttps://yojeeb.com'
                }
              ].map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => setMessage(template.text)}
                  className="text-right p-3 bg-stone-50 hover:bg-green-50 border border-stone-200 hover:border-green-300 rounded-lg transition-all text-sm"
                >
                  <span className="font-semibold text-stone-800">{template.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
            <p className="text-xs font-semibold text-stone-600 mb-3">👁️ معاينة الرسالة:</p>
            <div className="bg-white rounded-2xl shadow-md p-4 max-w-md">
              <div className="bg-green-500 text-white rounded-xl p-3 text-sm whitespace-pre-wrap">
                {message || 'رسالتك ستظهر هنا...'}
              </div>
            </div>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendWhatsApp}
          disabled={!message.trim()}
          className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>📱</span>
          إرسال عبر واتساب
          {sendingType === 'all' && ` (${usersWithPhone.length} رقم)`}
          {sendingType === 'selected' && selectedUsers.length > 0 && ` (${selectedUsers.length} رقم)`}
        </button>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-r from-stone-50 to-stone-100 border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          📊 إحصائيات الأرقام
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-green-600">{usersWithPhone.length}</div>
            <div className="text-sm text-stone-600 mt-1">إجمالي الأرقام</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-blue-600">{selectedUsers.length}</div>
            <div className="text-sm text-stone-600 mt-1">محدد حالياً</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-amber-600">
              {usersWithPhone.filter(u => u.phoneVerified).length}
            </div>
            <div className="text-sm text-stone-600 mt-1">رقم موثق</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-purple-600">0</div>
            <div className="text-sm text-stone-600 mt-1">رسائل اليوم</div>
          </div>
        </div>
      </div>
    </div>
  );
}