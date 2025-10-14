'use client'
import { useState, useEffect } from 'react';

export default function AdsTab() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAd, setNewAd] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    position: 'top',
    is_active: true
  });

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = () => {
    const token = localStorage.getItem('token');
    
    fetch('/api/admin/ads', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAds(data.ads);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Load ads error:', err);
        setLoading(false);
      });
  };

  const handleAddAd = () => {
    if (!newAd.title.trim() || !newAd.description.trim()) {
      alert('⚠️ يجب إدخال العنوان والوصف');
      return;
    }

    const token = localStorage.getItem('token');

    fetch('/api/admin/ads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newAd)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('✅ تم إضافة الإعلان بنجاح');
          setNewAd({
            title: '',
            description: '',
            image_url: '',
            link_url: '',
            position: 'top',
            is_active: true
          });
          setShowAddForm(false);
          loadAds();
        } else {
          alert('❌ ' + (data.error || 'فشل الإضافة'));
        }
      })
      .catch(err => {
        console.error('Add ad error:', err);
        alert('❌ حدث خطأ أثناء الإضافة');
      });
  };

  const handleToggleAd = (adId, currentStatus) => {
    const token = localStorage.getItem('token');

    fetch('/api/admin/ads', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: adId,
        is_active: !currentStatus
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          loadAds();
        } else {
          alert('❌ ' + (data.error || 'فشل التحديث'));
        }
      })
      .catch(err => {
        console.error('Toggle ad error:', err);
        alert('❌ حدث خطأ');
      });
  };

  const handleDeleteAd = (adId) => {
    if (!confirm('⚠️ هل تريد حذف هذا الإعلان؟')) {
      return;
    }

    const token = localStorage.getItem('token');

    fetch('/api/admin/ads', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: adId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('✅ تم حذف الإعلان');
          loadAds();
        } else {
          alert('❌ ' + (data.error || 'فشل الحذف'));
        }
      })
      .catch(err => {
        console.error('Delete ad error:', err);
        alert('❌ حدث خطأ');
      });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 animate-pulse">📢</div>
        <p className="text-stone-600">جاري تحميل الإعلانات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          📢 إدارة الإعلانات
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg flex items-center gap-2"
        >
          <span>{showAddForm ? '✗' : '+'}</span>
          {showAddForm ? 'إلغاء' : 'إضافة إعلان جديد'}
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">📣</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">نظام الإعلانات</h3>
            <p className="text-red-100 text-sm mb-3">
              أضف إعلانات ترويجية في مواقع مختلفة من المنصة
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-sm">
              <p className="mb-2">💡 <strong>مواقع الإعلانات:</strong></p>
              <ul className="space-y-1 text-red-100">
                <li>• <strong>أعلى الصفحة:</strong> فوق المحتوى الرئيسي</li>
                <li>• <strong>الشريط الجانبي:</strong> على يمين الصفحة</li>
                <li>• <strong>أسفل الصفحة:</strong> قبل الفوتر</li>
                <li>• <strong>منبثق:</strong> نافذة منبثقة عند الدخول</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add Ad Form */}
      {showAddForm && (
        <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
          <h3 className="font-bold text-stone-800 mb-6 flex items-center gap-2 text-xl">
            ➕ إضافة إعلان جديد
          </h3>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                📌 عنوان الإعلان:
              </label>
              <input
                type="text"
                value={newAd.title}
                onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                placeholder="مثال: خصم 50% على جميع المنتجات"
                maxLength={100}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              />
              <p className="text-xs text-stone-500 mt-1">{newAd.title.length}/100 حرف</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                📝 الوصف:
              </label>
              <textarea
                value={newAd.description}
                onChange={(e) => setNewAd({...newAd, description: e.target.value})}
                placeholder="وصف تفصيلي للإعلان..."
                rows="3"
                maxLength={300}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none resize-none"
              />
              <p className="text-xs text-stone-500 mt-1">{newAd.description.length}/300 حرف</p>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                🖼️ رابط الصورة (اختياري):
              </label>
              <input
                type="url"
                value={newAd.image_url}
                onChange={(e) => setNewAd({...newAd, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              />
            </div>

            {/* Link URL */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                🔗 رابط الانتقال (اختياري):
              </label>
              <input
                type="url"
                value={newAd.link_url}
                onChange={(e) => setNewAd({...newAd, link_url: e.target.value})}
                placeholder="https://example.com/product"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                📍 موقع الإعلان:
              </label>
              <select
                value={newAd.position}
                onChange={(e) => setNewAd({...newAd, position: e.target.value})}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              >
                <option value="top">أعلى الصفحة</option>
                <option value="sidebar">الشريط الجانبي</option>
                <option value="bottom">أسفل الصفحة</option>
                <option value="popup">نافذة منبثقة</option>
              </select>
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAd.is_active}
                  onChange={(e) => setNewAd({...newAd, is_active: e.target.checked})}
                  className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                />
                <span className="text-sm font-semibold text-stone-700">
                  تفعيل الإعلان فوراً
                </span>
              </label>
            </div>

            {/* Preview */}
            {(newAd.title || newAd.description) && (
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
                <p className="text-xs font-semibold text-stone-600 mb-3">👁️ معاينة:</p>
                <div className="bg-white border-2 border-red-300 rounded-lg p-6">
                  {newAd.image_url && (
                    <div className="mb-4">
                      <img 
                        src={newAd.image_url} 
                        alt="Ad preview" 
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                  <h4 className="font-bold text-stone-800 text-lg mb-2">
                    {newAd.title || 'عنوان الإعلان'}
                  </h4>
                  <p className="text-stone-600 text-sm">
                    {newAd.description || 'وصف الإعلان'}
                  </p>
                  {newAd.link_url && (
                    <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                      اعرف المزيد →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Add Button */}
            <button
              onClick={handleAddAd}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <span>➕</span>
              إضافة الإعلان
            </button>
          </div>
        </div>
      )}

      {/* Ads List */}
      <div className="space-y-4">
        <h3 className="font-bold text-stone-800 flex items-center gap-2">
          📋 الإعلانات الحالية ({ads.length})
        </h3>

        {ads.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-stone-600 text-lg mb-2">لا توجد إعلانات حالياً</p>
            <p className="text-sm text-stone-500">اضغط على "إضافة إعلان جديد" لإنشاء إعلان</p>
          </div>
        ) : (
          ads.map((ad) => (
            <div key={ad.id} className="bg-white border border-stone-200 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Ad Preview */}
                  <div className="flex-1">
                    {ad.image_url && (
                      <img 
                        src={ad.image_url} 
                        alt={ad.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <h4 className="font-bold text-stone-800 text-lg mb-2">
                      {ad.title}
                    </h4>
                    <p className="text-stone-600 text-sm mb-3">
                      {ad.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={`px-3 py-1 rounded-full font-semibold ${
                        ad.position === 'top' ? 'bg-blue-100 text-blue-700' :
                        ad.position === 'sidebar' ? 'bg-purple-100 text-purple-700' :
                        ad.position === 'bottom' ? 'bg-green-100 text-green-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        📍 {
                          ad.position === 'top' ? 'أعلى الصفحة' :
                          ad.position === 'sidebar' ? 'شريط جانبي' :
                          ad.position === 'bottom' ? 'أسفل الصفحة' :
                          'منبثق'
                        }
                      </span>
                      {ad.link_url && (
                        <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full font-semibold">
                          🔗 يحتوي على رابط
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 min-w-[150px]">
                    {/* Status Toggle */}
                    <button
                      onClick={() => handleToggleAd(ad.id, ad.is_active)}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        ad.is_active
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-stone-300 text-stone-700 hover:bg-stone-400'
                      }`}
                    >
                      <span>{ad.is_active ? '✓' : '✗'}</span>
                      {ad.is_active ? 'مفعّل' : 'معطّل'}
                    </button>

                    {/* Stats */}
                    <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {ad.views || 0}
                      </div>
                      <div className="text-xs text-stone-600">مشاهدة</div>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-emerald-600">
                        {ad.clicks || 0}
                      </div>
                      <div className="text-xs text-stone-600">نقرة</div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteAd(ad.id)}
                      className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <span>🗑️</span>
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-r from-stone-50 to-stone-100 border border-stone-200 rounded-xl shadow-md p-6">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
          📊 إحصائيات الإعلانات
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-blue-600">{ads.length}</div>
            <div className="text-sm text-stone-600 mt-1">إجمالي الإعلانات</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-green-600">
              {ads.filter(ad => ad.is_active).length}
            </div>
            <div className="text-sm text-stone-600 mt-1">إعلان نشط</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-purple-600">
              {ads.reduce((sum, ad) => sum + (ad.views || 0), 0)}
            </div>
            <div className="text-sm text-stone-600 mt-1">إجمالي المشاهدات</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-stone-200">
            <div className="text-3xl font-bold text-amber-600">
              {ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0)}
            </div>
            <div className="text-sm text-stone-600 mt-1">إجمالي النقرات</div>
          </div>
        </div>
      </div>
    </div>
  );
}