'use client'
import { useState, useEffect } from 'react';
import { Users, FileText, Settings, BarChart3, Shield, Trash2, Search } from 'lucide-react';
import IslamicBanner from '../shared/IslamicBanner';

export default function AdminPage({ user, onNavigate, onLogout }) {
  // ============================================================================
  // 📊 حالة الإحصائيات
  // ============================================================================
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats'); // stats, users, requests, settings

  // ============================================================================
  // 👥 حالة المستخدمين
  // ============================================================================
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersFilter, setUsersFilter] = useState('all');

  // ============================================================================
  // 📋 حالة الطلبات
  // ============================================================================
  const [requests, setRequests] = useState([]);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsStatus, setRequestsStatus] = useState('all');
  const [requestsType, setRequestsType] = useState('all');

  // ============================================================================
  // ⚙️ حالة الإعدادات
  // ============================================================================
  const [settings, setSettings] = useState({});
  const [editingSetting, setEditingSetting] = useState(null);

  // ============================================================================
  // 🔄 جلب الإحصائيات
  // ============================================================================
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (!token) return;

      fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStats(data.stats);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error:', err);
          setLoading(false);
        });
    }
  }, [user]);

  // ============================================================================
  // 🔄 جلب المستخدمين
  // ============================================================================
  useEffect(() => {
    if (activeTab === 'users' && user) {
      const token = localStorage.getItem('token');
      if (!token) return;

      fetch(`/api/admin/users?page=${usersPage}&search=${usersSearch}&filter=${usersFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUsers(data.users);
          }
        })
        .catch(err => console.error('Error:', err));
    }
  }, [activeTab, user, usersPage, usersSearch, usersFilter]);

  // ============================================================================
  // 🔄 جلب الطلبات
  // ============================================================================
  useEffect(() => {
    if (activeTab === 'requests' && user) {
      const token = localStorage.getItem('token');
      if (!token) return;

      fetch(`/api/admin/requests?page=${requestsPage}&status=${requestsStatus}&type=${requestsType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setRequests(data.requests);
          }
        })
        .catch(err => console.error('Error:', err));
    }
  }, [activeTab, user, requestsPage, requestsStatus, requestsType]);

  // ============================================================================
  // 🔄 جلب الإعدادات
  // ============================================================================
  useEffect(() => {
    if (activeTab === 'settings' && user) {
      const token = localStorage.getItem('token');
      if (!token) return;

      fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSettings(data.settings);
          }
        })
        .catch(err => console.error('Error:', err));
    }
  }, [activeTab, user]);

  // ============================================================================
  // 🗑️ حذف مستخدم
  // ============================================================================
  const handleDeleteUser = async (userId) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ');
    }
  };

  // ============================================================================
  // 💾 حفظ الإعدادات
  // ============================================================================
  const handleSaveSetting = async (key, value) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key, value })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setEditingSetting(null);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-600">جاري التحميل...</p>
      </div>
    );
  }

  // ============================================================================
  // 🎨 واجهة المستخدم
  // ============================================================================
  return (
    <div className="min-h-screen bg-stone-50">
      <IslamicBanner />
      
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-2xl font-bold text-stone-800">لوحة الإدارة</h1>
                <p className="text-sm text-stone-600">مرحباً {user?.displayName}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                الإحصائيات
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                المستخدمين
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                الطلبات
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-stone-600 hover:text-stone-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                الإعدادات
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* تبويب الإحصائيات */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-stone-600 text-sm">إجمالي المستخدمين</h3>
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-stone-800">{stats.users.total}</p>
                <p className="text-sm text-emerald-600 mt-1">+{stats.users.new} جديد هذا الشهر</p>
              </div>

              <div className="bg-white rounded-lg border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-stone-600 text-sm">المستخدمين النشطين</h3>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-stone-800">{stats.users.active}</p>
                <p className="text-sm text-stone-500 mt-1">آخر 7 أيام</p>
              </div>

              <div className="bg-white rounded-lg border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-stone-600 text-sm">إجمالي الطلبات</h3>
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-3xl font-bold text-stone-800">{stats.requests.total}</p>
                <p className="text-sm text-emerald-600 mt-1">{stats.requests.active} نشط</p>
              </div>

              <div className="bg-white rounded-lg border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-stone-600 text-sm">إجمالي الدعوات</h3>
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-stone-800">{stats.prayers.total}</p>
                <p className="text-sm text-emerald-600 mt-1">+{stats.prayers.today} اليوم</p>
              </div>
            </div>

            {/* التوثيق */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-4">المستخدمين الموثقين</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                  <div>
                    <p className="text-sm text-stone-600">التوثيق الذهبي 👑</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.verification.gold}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                  <div>
                    <p className="text-sm text-stone-600">التوثيق الأخضر ✓✓</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.verification.green}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-stone-600">التوثيق الأزرق ✓</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.verification.blue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* أنواع الطلبات */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-4">توزيع أنواع الطلبات</h3>
              <div className="space-y-3">
                {stats.requests.types.map(type => (
                  <div key={type.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {type.type === 'deceased' ? '🕊️' : type.type === 'sick' ? '🏥' : '🤲'}
                      </span>
                      <span className="text-stone-700">
                        {type.type === 'deceased' ? 'دعاء للمتوفى' : type.type === 'sick' ? 'دعاء للمريض' : 'دعاء عام'}
                      </span>
                    </div>
                    <span className="font-bold text-stone-800">{type.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* معدل التفاعل */}
            <div className="bg-white rounded-lg border border-stone-200 p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-4">التفاعل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 rounded-lg">
                  <p className="text-sm text-stone-600 mb-1">معدل التفاعل العام</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.engagement.avgInteraction}%</p>
                </div>
                <div className="p-4 bg-stone-50 rounded-lg">
                  <p className="text-sm text-stone-600 mb-1">إجمالي المشاركات</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.engagement.totalShares}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* تبويب المستخدمين */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* فلاتر */}
            <div className="bg-white rounded-lg border border-stone-200 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="text"
                      value={usersSearch}
                      onChange={(e) => setUsersSearch(e.target.value)}
                      placeholder="بحث بالاسم..."
                      className="w-full pr-10 pl-4 py-2 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <select
                  value={usersFilter}
                  onChange={(e) => setUsersFilter(e.target.value)}
                  className="px-4 py-2 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="all">الكل</option>
                  <option value="active">النشطين</option>
                  <option value="verified">الموثقين</option>
                </select>
              </div>
            </div>

            {/* جدول المستخدمين */}
            <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase">الاسم</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase">المدينة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase">التوثيق</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase">الدعوات</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase">معدل التفاعل</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase">آخر دخول</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-stone-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="font-medium text-stone-800">{user.fullName}</p>
                            <p className="text-sm text-stone-500">{user.motherName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                          {user.city || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.verificationLevel === 'GOLD' ? 'bg-amber-100 text-amber-700' :
                            user.verificationLevel === 'GREEN' ? 'bg-emerald-100 text-emerald-700' :
                            user.verificationLevel === 'BLUE' ? 'bg-blue-100 text-blue-700' :
                            'bg-stone-100 text-stone-600'
                          }`}>
                            {user.verificationLevel === 'GOLD' ? '👑 ذهبي' :
                             user.verificationLevel === 'GREEN' ? '✓✓ أخضر' :
                             user.verificationLevel === 'BLUE' ? '✓ أزرق' :
                             'بدون'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                          {user.stats.prayersGiven}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                          {user.stats.interactionRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ar') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* تبويب الطلبات */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {/* فلاتر */}
            <div className="bg-white rounded-lg border border-stone-200 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <select
                  value={requestsStatus}
                  onChange={(e) => setRequestsStatus(e.target.value)}
                  className="px-4 py-2 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="all">كل الحالات</option>
                  <option value="active">نشط</option>
                  <option value="answered">مستجاب</option>
                  <option value="expired">منتهي</option>
                </select>
                
                <select
                  value={requestsType}
                  onChange={(e) => setRequestsType(e.target.value)}
                  className="px-4 py-2 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="all">كل الأنواع</option>
                  <option value="general">دعاء عام</option>
                  <option value="deceased">للمتوفى</option>
                  <option value="sick">للمريض</option>
                </select>
              </div>
            </div>

            {/* قائمة الطلبات */}
            <div className="bg-white rounded-lg border border-stone-200 divide-y divide-stone-200">
              {requests.map(req => (
                <div key={req.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {req.type === 'deceased' ? '🕊️' : req.type === 'sick' ? '🏥' : '🤲'}
                      </span>
                      <div>
                        <p className="font-medium text-stone-800">
                          {req.type === 'deceased' ? req.deceasedName :
                           req.type === 'sick' && req.isNamePrivate ? 'مريض (اسم خاص)' :
                           req.type === 'sick' ? req.sickPersonName :
                           req.requesterName}
                        </p>
                        <p className="text-sm text-stone-500">
                          {new Date(req.createdAt).toLocaleDateString('ar')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        req.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'answered' ? 'bg-blue-100 text-blue-700' :
                        'bg-stone-100 text-stone-600'
                      }`}>
                        {req.status === 'active' ? 'نشط' :
                         req.status === 'answered' ? 'مستجاب' :
                         'منتهي'}
                      </span>
                      <p className="text-sm text-stone-600">{req.totalPrayers} دعاء</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* تبويب الإعدادات */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {Object.entries(settings).map(([key, data]) => (
              <div key={key} className="bg-white rounded-lg border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-stone-800">{key}</h3>
                  <button
                    onClick={() => setEditingSetting(editingSetting === key ? null : key)}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    {editingSetting === key ? 'إلغاء' : 'تعديل'}
                  </button>
                </div>
                
                {editingSetting === key ? (
                  <div className="space-y-3">
                    <textarea
                      defaultValue={JSON.stringify(data.value, null, 2)}
                      rows="5"
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono text-sm"
                      id={`setting-${key}`}
                    />
                    <button
                      onClick={() => {
                        const textarea = document.getElementById(`setting-${key}`);
                        try {
                          const newValue = JSON.parse(textarea.value);
                          handleSaveSetting(key, newValue);
                        } catch (e) {
                          alert('JSON غير صالح');
                        }
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      حفظ
                    </button>
                  </div>
                ) : (
                  <pre className="text-sm text-stone-600 bg-stone-50 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(data.value, null, 2)}
                  </pre>
                )}
                
                <p className="text-xs text-stone-500 mt-2">
                  آخر تحديث: {new Date(data.updatedAt).toLocaleString('ar')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}