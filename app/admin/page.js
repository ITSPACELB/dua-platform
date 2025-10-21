'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatsTab from './components/StatsTab';
import UsersTab from './components/UsersTab';
import RequestsTab from './components/RequestsTab';
import NotificationsTab from './components/NotificationsTab';
import WhatsAppTab from './components/WhatsAppTab';
import SettingsTab from './components/SettingsTab';
import TimeLimitsTab from './components/TimeLimitsTab';
import IconsTab from './components/IconsTab';
import AboutTab from './components/AboutTab';
import AdsTab from './components/AdsTab';
import LibraryTab from './components/LibraryTab';
import HomeControlTab from './components/HomeControlTab';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [adminRole, setAdminRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 403) {
          alert('⛔ ليس لديك صلاحيات للوصول إلى لوحة الإدارة');
          router.push('/');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.success) {
          setAdminRole(data.role || 'admin');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Admin verification error:', err);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    if (confirm('هل تريد تسجيل الخروج من لوحة الإدارة؟')) {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-stone-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'stats', label: 'الإحصائيات', icon: '📊', color: 'emerald' },
    { id: 'users', label: 'المستخدمين', icon: '👥', color: 'blue' },
    { id: 'requests', label: 'طلبات الدعاء', icon: '🙏', color: 'purple' },
    { id: 'notifications', label: 'الإشعارات', icon: '🔔', color: 'amber' },
    { id: 'whatsapp', label: 'واتساب', icon: '📱', color: 'green' },
    { id: 'timelimits', label: 'أوقات الدعاء', icon: '⏰', color: 'orange' },
    { id: 'homecontrol', label: 'الصفحة الرئيسية', icon: '🏠', color: 'indigo' },
    { id: 'ads', label: 'الإعلانات', icon: '📢', color: 'red' },
    { id: 'library', label: 'المكتبة', icon: '📚', color: 'teal' },
    { id: 'icons', label: 'الأيقونات', icon: '🎨', color: 'pink', superAdminOnly: true },
    { id: 'about', label: 'من نحن', icon: '📄', color: 'cyan', superAdminOnly: true },
    { id: 'settings', label: 'الإعدادات', icon: '⚙️', color: 'stone', superAdminOnly: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-right">
              <h1 className="text-3xl font-bold flex items-center gap-3 justify-center sm:justify-start">
                👑 لوحة الإدارة المتقدمة
              </h1>
              <p className="text-emerald-100 text-sm mt-2">
                منصة الدعاء الجماعي - يُجيب | التحكم الكامل بالمنصة
              </p>
              {adminRole === 'super_admin' && (
                <span className="inline-block mt-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  ✨ Super Admin - صلاحيات كاملة
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.open('/', '_blank')}
                className="bg-white text-emerald-600 px-5 py-2.5 rounded-lg hover:bg-emerald-50 transition-all font-semibold shadow-md hover:shadow-xl flex items-center gap-2"
              >
                🏠 الرئيسية
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-5 py-2.5 rounded-lg hover:bg-red-600 transition-all font-semibold shadow-md hover:shadow-xl flex items-center gap-2"
              >
                🚪 خروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b-2 border-stone-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              if (tab.superAdminOnly && adminRole !== 'super_admin') return null;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-5 border-b-4 transition-all whitespace-nowrap font-semibold text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? `border-${tab.color}-600 text-${tab.color}-600 bg-${tab.color}-50`
                      : 'border-transparent text-stone-600 hover:text-emerald-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[600px]">
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'users' && <UsersTab adminRole={adminRole} />}
          {activeTab === 'requests' && <RequestsTab adminRole={adminRole} />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'whatsapp' && <WhatsAppTab />}
          {activeTab === 'timelimits' && <TimeLimitsTab />}
          {activeTab === 'homecontrol' && <HomeControlTab />}
          {activeTab === 'ads' && <AdsTab />}
          {activeTab === 'library' && <LibraryTab />}
          {activeTab === 'icons' && adminRole === 'super_admin' && <IconsTab />}
          {activeTab === 'about' && adminRole === 'super_admin' && <AboutTab />}
          {activeTab === 'settings' && adminRole === 'super_admin' && <SettingsTab />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-stone-800 to-stone-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">© 2025 منصة الدعاء الجماعي - يُجيب</p>
            <p className="text-stone-400 text-sm mb-4">جميع الحقوق محفوظة</p>
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <span>تطوير:</span>
              <span className="font-bold">حيدر الغافقي 🌿</span>
            </div>
            <p className="text-xs text-stone-500 mt-4">
              لوحة إدارة متقدمة | النسخة 2.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}