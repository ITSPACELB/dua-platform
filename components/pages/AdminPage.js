'use client'
import { useState, useEffect } from 'react';
import { Users, FileText, Settings, BarChart3, Shield, Trash2, Search, BookOpen } from 'lucide-react';
import IslamicBanner from '../shared/IslamicBanner';
import CollectivePrayerManager from './CollectivePrayerManager';
import AdminAchievementsPanel from './AdminAchievementsPanel';
import AdminSettingsPanel from './AdminSettingsPanel';
import AdminLibraryPanel from './AdminLibraryPanel';

export default function AdminPage({ user, onNavigate, onLogout }) {
  // ============================================================================
  // 🔐 التحقق من صلاحيات الأدمن
  // ============================================================================
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      alert('ليس لديك صلاحيات للوصول لهذه الصفحة');
      onNavigate('home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================================
  // 🎨 دالة لتحويل المفاتيح لعناوين جميلة
  // ============================================================================
  const getSettingTitle = (key, data) => {
    // إذا كانت البيانات array، نحاول التعرف على النوع من المحتوى
    if (typeof key === 'number' || !isNaN(key)) {
      // التعرف على النوع من محتوى البيانات
      if (data?.links) return '💡 التوعية';
      if (data?.text && data?.backgroundColor) return '🎨 البانر العلوي';
      if (data?.verseText || data?.type === 'verse') return '🤲 الدعاء الجماعي';
      if (data?.pushEnabled !== undefined) return '🔔 الإشعارات';
      if (data?.home !== undefined) return '📱 إظهار التبويبات';
      if (data?.mode && data?.displayCount) return '🏆 الأكثر تفاعلاً';
      return `إعداد ${key}`;
    }
    
    // إذا كان key نصي
    const titles = {
      awareness: '💡 التوعية',
      banner: '🎨 البانر العلوي',
      collective_prayer: '🤲 الدعاء الجماعي',
      notifications: '🔔 الإشعارات',
      tabs_visibility: '📱 إظهار التبويبات',
      top_active: '🏆 الأكثر تفاعلاً'
    };
    return titles[key] || key;
  };

  // ============================================================================
  // 🎨 دالة لعرض الإعدادات بشكل جميل
  // ============================================================================
  const renderSettingValue = (data) => {
    const value = data.value || data;
    
    // التوعية
    if (value?.links && value?.content) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold">الحالة:</span>
            <span className={`px-3 py-1 rounded-full text-sm ${value.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {value.isActive ? '✅ مفعّل' : '⛔ معطّل'}
            </span>
          </div>
          <div>
            <span className="font-semibold">المحتوى:</span>
            <p className="mt-1 text-stone-700 bg-stone-50 p-3 rounded-lg whitespace-pre-wrap">{value.content}</p>
          </div>
          <div>
            <span className="font-semibold">الروابط ({value.links?.length || 0}):</span>
            <ul className="mt-2 space-y-2">
              {value.links?.map((link, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-600">🔗</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    
    // البانر
    if (value?.text && value?.backgroundColor) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold">الحالة:</span>
            <span className={`px-3 py-1 rounded-full text-sm ${value.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {value.isActive ? '✅ مفعّل' : '⛔ معطّل'}
            </span>
          </div>
          <div>
            <span className="font-semibold">معاينة:</span>
            <div 
              className="mt-2 p-4 rounded-lg text-center font-bold"
              style={{ 
                backgroundColor: value.backgroundColor, 
                color: value.textColor 
              }}
            >
              {value.text}
            </div>
          </div>
        </div>
      );
    }
    
    // الدعاء الجماعي
    if (value?.verseText || value?.type === 'verse') {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold">الحالة:</span>
            <span className={`px-3 py-1 rounded-full text-sm ${value.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {value.isActive ? '✅ مفعّل' : '⛔ معطّل'}
            </span>
          </div>
          <div>
            <span className="font-semibold">الآية:</span>
            <p className="mt-2 text-lg text-stone-800 bg-emerald-50 p-4 rounded-lg border-r-4 border-emerald-500">
              {value.verseText}
            </p>
            <p className="text-sm text-stone-600 mt-1">— {value.verseReference}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-semibold">الوقت المجدول:</span>
              <p className="text-stone-700">{value.scheduledTime || 'غير محدد'}</p>
            </div>
            <div>
              <span className="font-semibold">إشعار المستخدمين:</span>
              <p className="text-stone-700">{value.notifyUsers ? '✅ نعم' : '❌ لا'}</p>
            </div>
          </div>
        </div>
      );
    }
    
    // الإشعارات
    if (value?.pushEnabled !== undefined) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
            <span>📱 إشعارات الدفع (Push)</span>
            <span className={value.pushEnabled ? 'text-green-600 font-bold' : 'text-gray-500'}>
              {value.pushEnabled ? '✅ مفعّل' : '⛔ معطّل'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
            <span>📧 إشعارات البريد</span>
            <span className={value.emailEnabled ? 'text-green-600 font-bold' : 'text-gray-500'}>
              {value.emailEnabled ? '✅ مفعّل' : '⛔ معطّل'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
            <span>📲 إشعارات SMS</span>
            <span className={value.smsEnabled ? 'text-green-600 font-bold' : 'text-gray-500'}>
              {value.smsEnabled ? '✅ مفعّل' : '⛔ معطّل'}
            </span>
          </div>
        </div>
      );
    }
    
    // التبويبات
    if (value?.home !== undefined) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(value).map(([tab, enabled]) => (
            <div key={tab} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
              <span className="capitalize">{tab === 'home' ? '🏠 الرئيسية' : 
                                            tab === 'prayers' ? '🤲 الدعوات' :
                                            tab === 'profile' ? '👤 الملف' :
                                            tab === 'achievements' ? '🏆 الإنجازات' :
                                            tab === 'notifications' ? '🔔 الإشعارات' : tab}</span>
              <span className={enabled ? 'text-green-600 font-bold' : 'text-gray-500'}>
                {enabled ? '✅' : '⛔'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    // الأكثر تفاعلاً
    if (value?.mode && value?.displayCount) {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="font-semibold">الوضع:</span>
              <p className="text-stone-700 mt-1">
                {value.mode === 'auto' ? '🤖 تلقائي' : '✋ يدوي'}
              </p>
            </div>
            <div>
              <span className="font-semibold">عدد العرض:</span>
              <p className="text-stone-700 mt-1">{value.displayCount} مستخدم</p>
            </div>
          </div>
          <div>
            <span className="font-semibold">التحديث:</span>
            <p className="text-stone-700 mt-1">{value.autoRefreshInterval === 'daily' ? '📅 يومي' : value.autoRefreshInterval}</p>
          </div>
        </div>
      );
    }
    
    // افتراضي - عرض JSON
    return (
      <pre className="text-sm text-stone-600 bg-stone-50 p-4 rounded-lg overflow-x-auto">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  };

  // ============================================================================
  // ✏️ دالة لعرض نموذج التعديل
  // ============================================================================
  const renderEditForm = (key, data) => {
    const value = data.value || data;
    const formId = `form-${key}`;
    
    // التوعية
    if (value?.links && value?.content) {
      return (
        <div className="space-y-4" id={formId}>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={tempSettings[key]?.isActive ?? value.isActive}
                onChange={(e) => {
                  setTempSettings({
                    ...tempSettings,
                    [key]: {
                      ...tempSettings[key],
                      isActive: e.target.checked
                    }
                  });
                }}
                className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
                data-field="isActive"
              />
              <span className="font-semibold">تفعيل التوعية</span>
            </label>
          </div>
          <div>
            <label className="block font-semibold mb-2">المحتوى:</label>
            <textarea
              defaultValue={value.content}
              rows="4"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              data-field="content"
            />
          </div>
          <button
            onClick={() => {
              const form = document.getElementById(formId);
              const content = form.querySelector('[data-field="content"]').value;
              const isActive = tempSettings[key]?.isActive ?? value.isActive;
              handleSaveSetting(key, { ...value, isActive, content });
            }}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold"
          >
            حفظ التعديلات
          </button>
        </div>
      );
    }
    
    // البانر
    if (value?.text && value?.backgroundColor) {
      return (
        <div className="space-y-4" id={formId}>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={tempSettings[key]?.isActive ?? value.isActive}
                onChange={(e) => {
                  setTempSettings({
                    ...tempSettings,
                    [key]: {
                      ...tempSettings[key],
                      isActive: e.target.checked
                    }
                  });
                }}
                className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
                data-field="isActive"
              />
              <span className="font-semibold">تفعيل البانر</span>
            </label>
          </div>
          <div>
            <label className="block font-semibold mb-2">النص:</label>
            <input
              type="text"
              defaultValue={value.text}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              data-field="text"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">لون الخلفية:</label>
              <input
                type="color"
                defaultValue={value.backgroundColor}
                className="w-full h-10 border border-stone-300 rounded-lg cursor-pointer"
                data-field="backgroundColor"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">لون النص:</label>
              <input
                type="color"
                defaultValue={value.textColor}
                className="w-full h-10 border border-stone-300 rounded-lg cursor-pointer"
                data-field="textColor"
              />
            </div>
          </div>
          <button
            onClick={() => {
              const form = document.getElementById(formId);
              const text = form.querySelector('[data-field="text"]').value;
              const backgroundColor = form.querySelector('[data-field="backgroundColor"]').value;
              const textColor = form.querySelector('[data-field="textColor"]').value;
              const isActive = tempSettings[key]?.isActive ?? value.isActive;
              handleSaveSetting(key, { isActive, text, backgroundColor, textColor });
            }}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold"
          >
            حفظ التعديلات
          </button>
        </div>
      );
    }
    
    // الدعاء الجماعي
    if (value?.verseText || value?.type === 'verse') {
      return (
        <div className="space-y-4" id={formId}>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={tempSettings[key]?.isActive ?? value.isActive}
                onChange={(e) => {
                  setTempSettings({
                    ...tempSettings,
                    [key]: {
                      ...tempSettings[key],
                      isActive: e.target.checked
                    }
                  });
                }}
                className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
                data-field="isActive"
              />
              <span className="font-semibold">تفعيل الدعاء الجماعي</span>
            </label>
          </div>
          <div>
            <label className="block font-semibold mb-2">نص الآية:</label>
            <textarea
              defaultValue={value.verseText}
              rows="3"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              data-field="verseText"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">المرجع:</label>
            <input
              type="text"
              defaultValue={value.verseReference}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              data-field="verseReference"
              placeholder="مثال: البقرة: 201"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">الوقت المجدول:</label>
              <input
                type="time"
                defaultValue={value.scheduledTime}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                data-field="scheduledTime"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer pt-8">
                <input 
                  type="checkbox" 
                  checked={tempSettings[key]?.notifyUsers ?? value.notifyUsers}
                  onChange={(e) => {
                    setTempSettings({
                      ...tempSettings,
                      [key]: {
                        ...tempSettings[key],
                        notifyUsers: e.target.checked
                      }
                    });
                  }}
                  className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
                  data-field="notifyUsers"
                />
                <span>إشعار المستخدمين</span>
              </label>
            </div>
          </div>
          <button
            onClick={() => {
              const form = document.getElementById(formId);
              const verseText = form.querySelector('[data-field="verseText"]').value;
              const verseReference = form.querySelector('[data-field="verseReference"]').value;
              const scheduledTime = form.querySelector('[data-field="scheduledTime"]').value;
              const isActive = tempSettings[key]?.isActive ?? value.isActive;
              const notifyUsers = tempSettings[key]?.notifyUsers ?? value.notifyUsers;
              handleSaveSetting(key, { 
                ...value, 
                isActive, 
                verseText, 
                verseReference, 
                scheduledTime, 
                notifyUsers 
              });
            }}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold"
          >
            حفظ التعديلات
          </button>
        </div>
      );
    }
    
    // الإشعارات
    if (value?.pushEnabled !== undefined) {
      return (
        <div className="space-y-3" id={formId}>
          <label className="flex items-center justify-between p-3 bg-stone-50 rounded-lg cursor-pointer">
            <span>📱 إشعارات الدفع (Push)</span>
            <input 
              type="checkbox" 
              checked={tempSettings[key]?.pushEnabled ?? value.pushEnabled}
              onChange={(e) => {
                setTempSettings({
                  ...tempSettings,
                  [key]: {
                    ...tempSettings[key],
                    pushEnabled: e.target.checked
                  }
                });
              }}
              className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
              data-field="pushEnabled"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-stone-50 rounded-lg cursor-pointer">
            <span>📧 إشعارات البريد</span>
            <input 
              type="checkbox" 
              checked={tempSettings[key]?.emailEnabled ?? value.emailEnabled}
              onChange={(e) => {
                setTempSettings({
                  ...tempSettings,
                  [key]: {
                    ...tempSettings[key],
                    emailEnabled: e.target.checked
                  }
                });
              }}
              className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
              data-field="emailEnabled"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-stone-50 rounded-lg cursor-pointer">
            <span>📲 إشعارات SMS</span>
            <input 
              type="checkbox" 
              checked={tempSettings[key]?.smsEnabled ?? value.smsEnabled}
              onChange={(e) => {
                setTempSettings({
                  ...tempSettings,
                  [key]: {
                    ...tempSettings[key],
                    smsEnabled: e.target.checked
                  }
                });
              }}
              className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
              data-field="smsEnabled"
            />
          </label>
          <button
            onClick={() => {
              const pushEnabled = tempSettings[key]?.pushEnabled ?? value.pushEnabled;
              const emailEnabled = tempSettings[key]?.emailEnabled ?? value.emailEnabled;
              const smsEnabled = tempSettings[key]?.smsEnabled ?? value.smsEnabled;
              handleSaveSetting(key, { pushEnabled, emailEnabled, smsEnabled });
            }}
            className="w-full px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold"
          >
            حفظ التعديلات
          </button>
        </div>
      );
    }
    
    // التبويبات
    if (value?.home !== undefined) {
      return (
        <div className="space-y-3" id={formId}>
          {Object.keys(value).map((tab) => (
            <label key={tab} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg cursor-pointer">
              <span className="capitalize">{tab === 'home' ? '🏠 الرئيسية' : 
                                            tab === 'prayers' ? '🤲 الدعوات' :
                                            tab === 'profile' ? '👤 الملف' :
                                            tab === 'achievements' ? '🏆 الإنجازات' :
                                            tab === 'notifications' ? '🔔 الإشعارات' : tab}</span>
              <input 
                type="checkbox" 
                checked={tempSettings[key]?.[tab] ?? value[tab]}
                onChange={(e) => {
                  setTempSettings({
                    ...tempSettings,
                    [key]: {
                      ...tempSettings[key],
                      [tab]: e.target.checked
                    }
                  });
                }}
                className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
                data-field={tab}
              />
            </label>
          ))}
          <button
            onClick={() => {
              const newValue = {};
              Object.keys(value).forEach(tab => {
                newValue[tab] = tempSettings[key]?.[tab] ?? value[tab];
              });
              handleSaveSetting(key, newValue);
            }}
            className="w-full px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold"
          >
            حفظ التعديلات
          </button>
        </div>
      );
    }
    
    // الأكثر تفاعلاً
    if (value?.mode && value?.displayCount) {
      return (
        <div className="space-y-4" id={formId}>
          <div>
            <label className="block font-semibold mb-2">الوضع:</label>
            <select
              defaultValue={value.mode}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              data-field="mode"
            >
              <option value="auto">🤖 تلقائي</option>
              <option value="manual">✋ يدوي</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">عدد العرض:</label>
            <input
              type="number"
              defaultValue={value.displayCount}
              min="1"
              max="20"
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              data-field="displayCount"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">التحديث:</label>
            <select
              defaultValue={value.autoRefreshInterval}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              data-field="autoRefreshInterval"
            >
              <option value="hourly">⏰ كل ساعة</option>
              <option value="daily">📅 يومي</option>
              <option value="weekly">📆 أسبوعي</option>
            </select>
          </div>
          <button
            onClick={() => {
              const form = document.getElementById(formId);
              const mode = form.querySelector('[data-field="mode"]').value;
              const displayCount = parseInt(form.querySelector('[data-field="displayCount"]').value);
              const autoRefreshInterval = form.querySelector('[data-field="autoRefreshInterval"]').value;
              handleSaveSetting(key, { 
                ...value, 
                mode, 
                displayCount, 
                autoRefreshInterval,
                manualList: value.manualList || []
              });
            }}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold"
          >
            حفظ التعديلات
          </button>
        </div>
      );
    }
    
    // افتراضي - JSON editor
    return (
      <div className="space-y-3">
        <textarea
          defaultValue={JSON.stringify(value, null, 2)}
          rows="8"
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
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-semibold"
        >
          حفظ
        </button>
      </div>
    );
  };

  // ============================================================================
  // 🚪 تسجيل الخروج (FIXED!)
  // ============================================================================
  const handleLogout = () => {
    // مسح كل البيانات من localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminToken');
    
    // استدعاء onLogout prop
    if (onLogout) {
      onLogout();
    }
    
    // إعادة التوجيه للصفحة الرئيسية
    onNavigate('home');
  };

  // ============================================================================
  // 📊 حالة الإحصائيات
  // ============================================================================
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats'); // stats, users, requests, collective, achievements, settings, library

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
  const [tempSettings, setTempSettings] = useState({}); // للتحكم بالـ checkboxes

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
            // ✅ تحويل array إلى object بـ key صحيح
            const settingsObj = {};
            data.settings.forEach(setting => {
              settingsObj[setting.key] = setting;
            });
            setSettings(settingsObj);
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
        alert('تم الحفظ بنجاح! ✅');
        setEditingSetting(null);
        setTempSettings({}); // مسح التعديلات المؤقتة
        
        // إعادة تحميل الإعدادات
        fetch('/api/admin/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              // ✅ تحويل array إلى object بـ key صحيح
              const settingsObj = {};
              data.settings.forEach(setting => {
                settingsObj[setting.key] = setting;
              });
              setSettings(settingsObj);
            }
          })
          .catch(err => console.error('Error reloading settings:', err));
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('حدث خطأ في حفظ الإعداد');
    }
  };
  
  // ============================================================================
  // 🎨 الواجهة
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl text-stone-600 font-bold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200" style={{ fontFamily: 'Markazi Text, serif' }}>
      <IslamicBanner />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* الهيدر */}
        <div className="bg-white rounded-lg border-2 border-stone-200 p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-emerald-800 mb-2">لوحة إدارة المنصة</h1>
              <p className="text-xl text-stone-600">مرحباً {user?.displayName || 'المسؤول'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-lg transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>

        {/* التبويبات */}
        <div className="bg-white rounded-lg border-2 border-stone-200 mb-6 shadow-lg overflow-x-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-6 py-4 text-lg font-bold transition-colors ${
                activeTab === 'stats'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <BarChart3 className="inline-block ml-2" />
              الإحصائيات
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 text-lg font-bold transition-colors ${
                activeTab === 'users'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Users className="inline-block ml-2" />
              المستخدمون
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-6 py-4 text-lg font-bold transition-colors ${
                activeTab === 'requests'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <FileText className="inline-block ml-2" />
              الطلبات
            </button>
            <button
              onClick={() => setActiveTab('collective')}
              className={`flex-1 px-6 py-4 text-lg font-bold transition-colors ${
                activeTab === 'collective'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span className="inline-block ml-2">🤲</span>
              الدعاء الجماعي
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 px-6 py-4 text-lg font-bold transition-colors ${
                activeTab === 'achievements'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span className="inline-block ml-2">🏆</span>
              الإنجازات والقرعة
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-6 py-4 text-lg font-bold transition-colors ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Settings className="inline-block ml-2" />
              الإعدادات
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`flex-1 px-6 py-4 text-lg font-bold transition-colors ${
                activeTab === 'library'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <BookOpen className="inline-block ml-2" />
              المكتبة
            </button>
          </div>
        </div>

        {/* المحتوى */}
        <div className="bg-white rounded-lg border-2 border-stone-200 p-6 shadow-lg">
          {/* تبويب الإحصائيات */}
          {activeTab === 'stats' && stats && (
            <div>
              <h2 className="text-3xl font-bold text-stone-800 mb-6">📊 إحصائيات المنصة</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6">
                  <div className="text-4xl mb-3">👥</div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">إجمالي المستخدمين</h3>
                  <p className="text-3xl font-bold text-blue-700">{stats.totalUsers || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg p-6">
                  <div className="text-4xl mb-3">🤲</div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-2">دعوات اليوم</h3>
                  <p className="text-3xl font-bold text-emerald-700">{stats.prayersToday || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-6">
                  <div className="text-4xl mb-3">✓</div>
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">موثقون</h3>
                  <p className="text-3xl font-bold text-amber-700">{stats.verifiedUsers?.total || 0}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-6">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">نشطون</h3>
                  <p className="text-3xl font-bold text-purple-700">{stats.activeUsers || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* تبويب المستخدمين */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-stone-800">👥 إدارة المستخدمين</h2>
              
              {/* فلاتر البحث */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={usersSearch}
                      onChange={(e) => setUsersSearch(e.target.value)}
                      placeholder="البحث عن مستخدم..."
                      className="w-full pr-10 px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:outline-none text-lg"
                    />
                  </div>
                </div>
                
                <select
                  value={usersFilter}
                  onChange={(e) => setUsersFilter(e.target.value)}
                  className="px-4 py-3 border-2 border-stone-300 rounded-lg focus:border-emerald-500 focus:outline-none text-lg"
                >
                  <option value="all">الكل</option>
                  <option value="active">نشطون</option>
                  <option value="verified">موثقون</option>
                </select>
              </div>

              {/* جدول المستخدمين */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b-2 border-stone-200">
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
          )}

          {/* تبويب الطلبات */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-stone-800 mb-6">📋 إدارة الطلبات</h2>
              
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

          {/* تبويب الدعاء الجماعي */}
          {activeTab === 'collective' && (
            <CollectivePrayerManager />
          )}

          {/* تبويب الإنجازات والقرعة */}
          {activeTab === 'achievements' && (
            <div>
              <h2 className="text-3xl font-bold text-stone-800 mb-6 flex items-center gap-3">
                <span className="text-4xl">🏆</span>
                الإنجازات والقرعة اليومية
              </h2>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
                <p className="text-stone-700 text-lg leading-relaxed">
                  📊 <strong>نظام الإنجازات:</strong> تحكم كامل في القرعة اليومية، نسب المستويات، الفائزين اليدويين، ونظام النقاط
                </p>
              </div>

              <AdminAchievementsPanel />
            </div>
          )}


          {/* تبويب الإعدادات */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-3xl font-bold text-stone-800 mb-6 flex items-center gap-3">
                <Settings className="w-8 h-8 text-emerald-600" />
                الإعدادات العامة
              </h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-stone-700 text-lg leading-relaxed">
                  ⚙️ <strong>إعدادات المنصة:</strong> تحكم في البانر، التوعية، الإشعارات، وإظهار التبويبات
                </p>
              </div>

              <AdminSettingsPanel />
            </div>
          )}

          {/* تبويب المكتبة */}
          {activeTab === 'library' && (
            <AdminLibraryPanel />
          )}
        </div>
      </div>
    </div>
  );
}