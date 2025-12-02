'use client'
import { useState, useEffect } from 'react';

export default function CollectivePrayerManager() {
  // ============================================================================
  // 🔄 الحالات (States)
  // ============================================================================
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // بيانات الفورم
  const [formData, setFormData] = useState({
    content: '',
    verseReference: '',
    scheduledDate: '',
    scheduledTime: '',
    durationMinutes: 30,
    notifyUsers: false
  });

  // ============================================================================
  // 🔄 جلب جميع الأدعية عند التحميل
  // ============================================================================
  useEffect(() => {
    loadPrayers();
  }, []);

  const loadPrayers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('يجب تسجيل الدخول أولاً');
        return;
      }

      const response = await fetch('/api/admin/collective-prayer?all=true', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setPrayers(data.prayers || []);
      } else {
        console.error('Failed to load prayers:', data.error);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading prayers:', error);
      alert('حدث خطأ في جلب الأدعية');
      setLoading(false);
    }
  };

  // ============================================================================
  // 📝 حفظ دعاء جديد أو تعديل موجود
  // ============================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // التحقق من الحقول المطلوبة
    if (!formData.content.trim()) {
      alert('الرجاء إدخال نص الدعاء');
      return;
    }

    if (!formData.scheduledDate || !formData.scheduledTime) {
      alert('الرجاء تحديد التاريخ والوقت');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('يجب تسجيل الدخول أولاً');
        return;
      }
      
      // ════════════════════════════════════════════════════════
      // ✅ إصلاح: إنشاء التاريخ بدون timezone conversion
      // ════════════════════════════════════════════════════════
      const scheduledDatetime = `${formData.scheduledDate}T${formData.scheduledTime}:00`;
      
      const payload = {
        type: formData.verseReference ? 'verse' : 'custom',
        content: formData.content.trim(),
        timing: 'scheduled',
        start_date: scheduledDatetime,
        end_date: null,
        is_active: true
      };

      let response;
      if (editingId) {
        // تعديل دعاء موجود
        response = await fetch(`/api/admin/collective-prayer?id=${editingId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } else {
        // إضافة دعاء جديد
        response = await fetch('/api/admin/collective-prayer', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      
      if (data.success) {
        alert(editingId ? '✅ تم التحديث بنجاح' : '✅ تم الإضافة بنجاح');
        setShowForm(false);
        setEditingId(null);
        resetForm();
        await loadPrayers(); // إعادة تحميل القائمة
      } else {
        alert(`خطأ: ${data.error || 'حدث خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('Error saving prayer:', error);
      alert('حدث خطأ في الحفظ. الرجاء المحاولة مرة أخرى.');
    }
  };

  // ============================================================================
  // ✏️ تعديل دعاء
  // ============================================================================
  const handleEdit = (prayer) => {
    // استخراج التاريخ والوقت من start_date أو scheduled_datetime
    const dateSource = prayer.start_date || prayer.scheduled_datetime;
    const startDate = dateSource ? new Date(dateSource) : new Date();
    
    // تنسيق التاريخ والوقت للـ input
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const hours = String(startDate.getHours()).padStart(2, '0');
    const minutes = String(startDate.getMinutes()).padStart(2, '0');
    
    setFormData({
      content: prayer.content || '',
      verseReference: prayer.type === 'verse' ? 'verse' : '',
      scheduledDate: `${year}-${month}-${day}`,
      scheduledTime: `${hours}:${minutes}`,
      durationMinutes: prayer.duration_minutes || 30,
      notifyUsers: false
    });
    
    setEditingId(prayer.id);
    setShowForm(true);
    
    // التمرير للأعلى لرؤية الفورم
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================================================
  // 🗑️ حذف دعاء
  // ============================================================================
  const handleDelete = async (id, content) => {
    const truncatedContent = content.length > 50 ? content.substring(0, 50) + '...' : content;
    if (!confirm(`هل أنت متأكد من حذف هذا الدعاء؟\n\n"${truncatedContent}"`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('يجب تسجيل الدخول أولاً');
        return;
      }

      const response = await fetch(`/api/admin/collective-prayer?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ تم الحذف بنجاح');
        await loadPrayers();
      } else {
        alert(`خطأ: ${data.error || 'فشل الحذف'}`);
      }
    } catch (error) {
      console.error('Error deleting prayer:', error);
      alert('حدث خطأ في الحذف');
    }
  };

  // ============================================================================
  // 🔄 تفعيل/إلغاء تفعيل دعاء
  // ============================================================================
  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('يجب تسجيل الدخول أولاً');
        return;
      }

      const response = await fetch(`/api/admin/collective-prayer?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        await loadPrayers();
      } else {
        alert(`خطأ: ${data.error || 'فشل التحديث'}`);
      }
    } catch (error) {
      console.error('Error toggling active:', error);
      alert('حدث خطأ في التحديث');
    }
  };

  // ============================================================================
  // 🔄 إعادة تعيين الفورم
  // ============================================================================
  const resetForm = () => {
    setFormData({
      content: '',
      verseReference: '',
      scheduledDate: '',
      scheduledTime: '',
      durationMinutes: 30,
      notifyUsers: false
    });
  };

  // ============================================================================
  // 📅 تنسيق التاريخ للعرض
  // ============================================================================
  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      
      // التحقق من صحة التاريخ
      if (isNaN(date.getTime())) {
        return 'تاريخ غير صالح';
      }
      
      return date.toLocaleDateString('ar-IQ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'خطأ في التنسيق';
    }
  };

  // ============================================================================
  // ⏰ حساب حالة الدعاء (قادم/نشط/منتهي)
  // ============================================================================
  const getPrayerStatus = (prayer) => {
    if (!prayer.is_active) {
      return { text: '⛔ معطل', color: 'gray' };
    }

    const startDate = prayer.start_date || prayer.scheduled_datetime;
    if (!startDate) {
      return { text: '✅ نشط', color: 'green' };
    }

    const now = new Date();
    const start = new Date(startDate);
    const duration = prayer.duration_minutes || 30;
    const end = new Date(start.getTime() + duration * 60000);

    if (now < start) {
      return { text: '⏳ قادم', color: 'blue' };
    } else if (now >= start && now <= end) {
      return { text: '🔴 نشط الآن', color: 'green', pulse: true };
    } else {
      return { text: '✅ منتهي', color: 'stone' };
    }
  };

  // ============================================================================
  // 🎨 الواجهة
  // ============================================================================
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-stone-600 text-lg">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* العنوان والزر */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-stone-800">🤲 إدارة الدعاء الجماعي</h2>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingId(null);
              resetForm();
            } else {
              setShowForm(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors shadow-lg"
        >
          {showForm ? '✖ إلغاء' : '➕ إضافة دعاء جديد'}
        </button>
      </div>

      {/* فورم الإضافة/التعديل */}
      {showForm && (
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-6 shadow-xl mb-6 border-2 border-emerald-300">
          <h3 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            {editingId ? '✏️ تعديل الدعاء' : '➕ دعاء جماعي جديد'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* نص الدعاء */}
            <div>
              <label className="block font-bold text-stone-800 mb-2 text-lg">
                📝 نص الدعاء: <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all text-lg"
                rows="4"
                placeholder="مثال: رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ"
                required
              />
              <p className="text-sm text-stone-500 mt-1">
                {formData.content.length} حرف
              </p>
            </div>

            {/* المرجع */}
            <div>
              <label className="block font-bold text-stone-800 mb-2 text-lg">
                📖 المرجع: <span className="text-stone-400">(اختياري)</span>
              </label>
              <input
                type="text"
                value={formData.verseReference}
                onChange={(e) => setFormData({ ...formData, verseReference: e.target.value })}
                className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                placeholder="مثال: البقرة: 201"
              />
            </div>

            {/* التاريخ والوقت */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-800 mb-2 text-lg">
                  📅 التاريخ: <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-2 text-lg">
                  ⏰ الساعة: <span className="text-red-600">*</span>
                </label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* المدة */}
            <div>
              <label className="block font-bold text-stone-800 mb-2 text-lg">
                ⏱️ المدة (بالدقائق):
              </label>
              <input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 30 })}
                className="w-full px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                min="5"
                max="180"
              />
              <p className="text-sm text-stone-500 mt-1">
                المدة الافتراضية: 30 دقيقة (من 5 إلى 180 دقيقة)
              </p>
            </div>

            {/* أزرار الحفظ */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-lg transition-all shadow-lg"
              >
                {editingId ? '💾 حفظ التعديلات' : '➕ إضافة الدعاء'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-8 py-4 bg-stone-400 hover:bg-stone-500 text-white rounded-lg font-bold text-lg transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-sm text-blue-800 font-semibold">إجمالي الأدعية</div>
          <div className="text-3xl font-bold text-blue-600">{prayers.length}</div>
        </div>
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="text-2xl mb-1">✅</div>
          <div className="text-sm text-green-800 font-semibold">النشطة</div>
          <div className="text-3xl font-bold text-green-600">
            {prayers.filter(p => p.is_active).length}
          </div>
        </div>
        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
          <div className="text-2xl mb-1">⏳</div>
          <div className="text-sm text-amber-800 font-semibold">القادمة</div>
          <div className="text-3xl font-bold text-amber-600">
            {prayers.filter(p => {
              const status = getPrayerStatus(p);
              return status.text === '⏳ قادم';
            }).length}
          </div>
        </div>
      </div>

      {/* جدول الأدعية */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-stone-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
              <tr>
                <th className="px-4 py-4 text-right font-bold text-sm">ID</th>
                <th className="px-4 py-4 text-right font-bold text-sm">نص الدعاء</th>
                <th className="px-4 py-4 text-right font-bold text-sm">التاريخ والوقت</th>
                <th className="px-4 py-4 text-center font-bold text-sm">الحالة</th>
                <th className="px-4 py-4 text-center font-bold text-sm">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {prayers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <div className="text-6xl mb-4">🤲</div>
                    <p className="text-stone-500 text-lg">لا توجد أدعية جماعية</p>
                    <p className="text-stone-400 text-sm mt-2">اضغط "إضافة دعاء جديد" للبدء</p>
                  </td>
                </tr>
              ) : (
                prayers.map((prayer, index) => {
                  const status = getPrayerStatus(prayer);
                  return (
                    <tr 
                      key={prayer.id} 
                      className={`border-b border-stone-200 hover:bg-stone-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-stone-50'
                      }`}
                    >
                      <td className="px-4 py-4 text-stone-600 font-semibold">{prayer.id}</td>
                      <td className="px-4 py-4">
                        <p className="text-stone-800 font-semibold line-clamp-2 leading-relaxed">
                          {prayer.content}
                        </p>
                        {prayer.type === 'verse' && (
                          <p className="text-xs text-stone-500 mt-1">📖 آية قرآنية</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-stone-600 text-sm">
                        {formatDate(prayer.start_date || prayer.scheduled_datetime)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(prayer.id, prayer.is_active)}
                          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                            status.color === 'green'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : status.color === 'blue'
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : status.color === 'gray'
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          } ${status.pulse ? 'animate-pulse' : ''}`}
                        >
                          {status.text}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(prayer)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-all shadow-sm"
                            title="تعديل الدعاء"
                          >
                            ✏️ تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(prayer.id, prayer.content)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-all shadow-sm"
                            title="حذف الدعاء"
                          >
                            🗑️ حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* تعليمات */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h4 className="font-bold text-blue-900 mb-2">💡 ملاحظات هامة:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• سيتم تفعيل دعاء واحد فقط في نفس الوقت تلقائياً</li>
          <li>• الأدعية المنتهية تبقى في السجل للرجوع إليها</li>
          <li>• يمكن تعديل الدعاء قبل بدئه أو أثناءه</li>
          <li>• المدة الافتراضية للدعاء الجماعي: 30 دقيقة</li>
        </ul>
      </div>
    </div>
  );
}