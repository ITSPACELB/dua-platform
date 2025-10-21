'use client'
import { useState, useEffect } from 'react';

export default function UsersTab({ adminRole }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, active, verified
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [currentPage, filterType]);

  const loadUsers = () => {
    const token = localStorage.getItem('token');
    setLoading(true);

    fetch(`/api/admin/users?page=${currentPage}&limit=20&filter=${filterType}&search=${searchTerm}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
          setTotalPages(data.pagination.totalPages);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Users load error:', err);
        setLoading(false);
      });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadUsers();
  };

  const handleDeleteUser = (userId) => {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع بياناته!')) {
      return;
    }

    const token = localStorage.getItem('token');
    
    fetch('/api/admin/users', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('✅ تم حذف المستخدم بنجاح');
          loadUsers();
        } else {
          alert('❌ ' + (data.error || 'فشل الحذف'));
        }
      })
      .catch(err => {
        console.error('Delete error:', err);
        alert('❌ حدث خطأ أثناء الحذف');
      });
  };

  const getVerificationBadge = (level) => {
    const badges = {
      GOLD: { icon: '👑', color: 'amber', label: 'ذهبي' },
      GREEN: { icon: '✓✓', color: 'emerald', label: 'أخضر' },
      BLUE: { icon: '✓', color: 'blue', label: 'أزرق' },
      NONE: { icon: '', color: 'stone', label: 'عادي' }
    };
    
    const badge = badges[level] || badges.NONE;
    
    if (level === 'NONE') return null;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-${badge.color}-100 text-${badge.color}-700 border border-${badge.color}-300`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4 animate-pulse">👥</div>
        <p className="text-stone-600">جاري تحميل المستخدمين...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
          👥 إدارة المستخدمين
        </h2>
        <div className="text-sm text-stone-600 bg-stone-100 px-4 py-2 rounded-lg">
          إجمالي: <span className="font-bold text-emerald-600">{users.length > 0 ? users[0]?.totalCount || users.length : 0}</span> مستخدم
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="🔍 ابحث بالاسم أو اسم الأم..."
              className="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
            <button
              onClick={handleSearch}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
            >
              بحث
            </button>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'الكل', icon: '👥' },
              { value: 'active', label: 'نشط', icon: '🟢' },
              { value: 'verified', label: 'موثق', icon: '✓' }
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => {
                  setFilterType(filter.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  filterType === filter.value
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{filter.icon}</span>
                <span className="hidden sm:inline">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-bold">المستخدم</th>
                <th className="px-6 py-4 text-right text-sm font-bold">المدينة</th>
                <th className="px-6 py-4 text-right text-sm font-bold">الهاتف</th>
                <th className="px-6 py-4 text-center text-sm font-bold">الإحصائيات</th>
                <th className="px-6 py-4 text-center text-sm font-bold">التوثيق</th>
                <th className="px-6 py-4 text-center text-sm font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {users.map((user, idx) => (
                <tr key={user.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-stone-800">{user.fullName}</p>
                      <p className="text-sm text-stone-600">أم: {user.motherName}</p>
                      {user.nickname && (
                        <p className="text-xs text-emerald-600 mt-1">الكنية: {user.nickname}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-stone-700">{user.city || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-stone-700 font-mono">
                      {user.phoneNumber || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm space-y-1">
                      <div className="text-emerald-600 font-semibold">
                        🤲 {user.stats.prayersGiven}
                      </div>
                      <div className="text-stone-600 text-xs">
                        📊 {user.stats.interactionRate.toFixed(0)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getVerificationBadge(user.verificationLevel)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        👁️ عرض
                      </button>
                      {adminRole === 'super_admin' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          🗑️ حذف
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-stone-50 px-6 py-4 flex justify-between items-center border-t border-stone-200">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-stone-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-100 transition-colors font-medium"
            >
              ← السابق
            </button>
            <span className="text-sm text-stone-600">
              صفحة <span className="font-bold text-emerald-600">{currentPage}</span> من {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-stone-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-100 transition-colors font-medium"
            >
              التالي →
            </button>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold">👤 تفاصيل المستخدم</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-stone-600 mb-1">الاسم الكامل</p>
                  <p className="font-semibold text-stone-800">{selectedUser.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-600 mb-1">اسم الأم</p>
                  <p className="font-semibold text-stone-800">{selectedUser.motherName}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-600 mb-1">الكنية</p>
                  <p className="font-semibold text-stone-800">{selectedUser.nickname || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-600 mb-1">المدينة</p>
                  <p className="font-semibold text-stone-800">{selectedUser.city || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-600 mb-1">رقم الهاتف</p>
                  <p className="font-semibold text-stone-800 font-mono">{selectedUser.phoneNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-600 mb-1">البريد الإلكتروني</p>
                  <p className="font-semibold text-stone-800">{selectedUser.email || '-'}</p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-bold text-stone-800 mb-3">📊 الإحصائيات</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{selectedUser.stats.prayersGiven}</p>
                    <p className="text-xs text-stone-600">دعوات قدمها</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{selectedUser.stats.notificationsReceived}</p>
                    <p className="text-xs text-stone-600">إشعارات تلقاها</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{selectedUser.stats.interactionRate.toFixed(0)}%</p>
                    <p className="text-xs text-stone-600">معدل التفاعل</p>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                <h4 className="font-bold text-stone-800 mb-2">⏰ التواريخ</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">تاريخ التسجيل:</span>
                    <span className="font-semibold">{new Date(selectedUser.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">آخر تسجيل دخول:</span>
                    <span className="font-semibold">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString('ar-EG') : '-'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-full bg-stone-600 text-white py-3 rounded-lg hover:bg-stone-700 transition-colors font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}