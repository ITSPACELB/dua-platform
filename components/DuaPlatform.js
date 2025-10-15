// ===============================================
// 🎯 DuaPlatform.js - الملف المدير الرئيسي المحدث
// يربط جميع المكونات المقسمة ويدير حالة التطبيق
// ===============================================

'use client'
import { useState, useEffect } from 'react';

// 📄 استيراد الصفحات
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import StatsPage from './pages/StatsPage';
import AchievementsPage from './pages/AchievementsPage';
import FAQPage from './pages/FAQPage';

// 📊 استيراد الثوابت
import { achievements } from './constants/messages';

// ===============================================
// 🎯 المكون الرئيسي
// ===============================================
export default function DuaPlatform() {
  // ===============================================
  // 📊 إدارة الحالة (State Management)
  // ===============================================

  // التنقل بين الصفحات
  const [currentPage, setCurrentPage] = useState('home');


  // بيانات المستخدم
  const [user, setUser] = useState(null);

  // نموذج التسجيل
  const [formData, setFormData] = useState({
    fullName: '',
    motherName: '',
    showFullName: true,
    city: ''
  });

  // ===============================================
  // 🔄 التحقق من الجلسة عند التحميل
  // ===============================================
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setCurrentPage('home');
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentPage('landing');
      }
    } else {
      setCurrentPage('landing');
    }
  }, []);

  // ===============================================
  // 🎯 الدوال المساعدة (Helper Functions)
  // ===============================================

  /**
   * حساب الوقت المنقضي
   */
  const getTimeAgo = (timestamp) => {
    const mins = Math.floor((Date.now() - timestamp) / 60000);
    if (mins < 1) return 'الآن';
    if (mins === 1) return 'منذ دقيقة';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours === 1) return 'منذ ساعة';
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  /**
   * الحصول على الإنجاز القادم
   */
  const getNextAchievement = (userPrayerCount = 47) => {
    return achievements.find(a => a.count > userPrayerCount) || achievements[achievements.length - 1];
  };

  // ===============================================
  // 🔧 معالجات الأحداث (Event Handlers)
  // ===============================================

  /**
   * معالجة التسجيل
   */
  const handleRegister = async (data) => {
    if (!data.fullName || !data.motherName) {
      alert('الرجاء إدخال الاسم الكامل واسم الأم');
      return;
    }

    // TODO: ربط بـ API التسجيل
    const newUser = {
      ...data,
      id: Date.now(),
      displayName: data.showFullName
        ? `${data.fullName}${data.city ? ` (${data.city})` : ''}`
        : `${data.fullName.split(' ')[0]}...`
    };

    setUser(newUser);
    setCurrentPage('home');
  };

  /**
   * معالجة تسجيل الدخول
   */
  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('home');
  };

  /**
   * معالجة تسجيل الخروج
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('landing');
  };

  /**
   * معالجة التنقل بين الصفحات
   */
  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  /**
   * معالجة تعديل الملف الشخصي
   */
  const handleEditProfile = () => {
    setCurrentPage('register');
  };

  /**
   * معالجة طلب الدعاء
   */
  const handleRequestPrayer = () => {
    // TODO: ربط بـ API
    alert('تم إرسال طلبك! سيصل إشعار للمؤمنين خلال 30 دقيقة إن شاء الله');
  };

  /**
   * معالجة الدعاء للمتوفى
   */
  const handleDeceasedPrayer = (deceasedData) => {
    if (!deceasedData.fullName || !deceasedData.motherName) {
      alert('الرجاء إدخال الاسم الكامل واسم الأم للمتوفى');
      return;
    }

    // TODO: ربط بـ API
    alert('تم إرسال طلب الدعاء للمتوفى إن شاء الله');
  };

  /**
   * معالجة بدء الدعاء
   */
  const handleStartPraying = (request) => {
    // TODO: تنفيذ منطق بدء الدعاء
    console.log('بدء الدعاء لـ:', request);
  };

  /**
   * معالجة إكمال الدعاء
   */
  const handleCompletePrayer = (requestId) => {
    // TODO: تحديث حالة الطلب
    console.log('تم إكمال الدعاء للطلب:', requestId);
  };

  /**
   * معالجة إرسال رسالة التواصل
   */
  const handleSendMessage = (message) => {
    if (!message.trim()) {
      alert('الرجاء كتابة رسالة');
      return;
    }
    // TODO: ربط بـ API إرسال البريد
    alert('تم إرسال رسالتك بنجاح! سنرد عليك قريباً إن شاء الله');
  };

  // ===============================================
  // 🎨 عرض الصفحة المناسبة (Page Rendering)
  // ===============================================

  
    // صفحة تسجيل الدخول
  if (currentPage === 'login') {
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToRegister={() => setCurrentPage('register')}
      />
    );
  }

  // صفحة التسجيل
  if (currentPage === 'register') {
    return (
      <RegisterPage
        onRegister={handleRegister}
        onSwitchToLogin={() => setCurrentPage('login')}
      />
    );
  }

  // صفحة من نحن
  if (currentPage === 'about') {
    return (
      <AboutPage
        user={user}
        onNavigate={handleNavigate}
        onEditProfile={handleEditProfile}
        onLogout={handleLogout}
      />
    );
  }

  // صفحة الإحصائيات
  if (currentPage === 'stats') {
    return (
      <StatsPage
        user={user}
        onNavigate={handleNavigate}
        onEditProfile={handleEditProfile}
        onLogout={handleLogout}
      />
    );
  }

  // صفحة الإنجازات
  if (currentPage === 'achievements') {
    return (
      <AchievementsPage
        user={user}
        onNavigate={handleNavigate}
        onEditProfile={handleEditProfile}
        onLogout={handleLogout}
      />
    );
  }

  // صفحة الأسئلة الشائعة
  if (currentPage === 'faq') {
    return (
      <FAQPage
        user={user}
        onNavigate={handleNavigate}
        onEditProfile={handleEditProfile}
        onLogout={handleLogout}
      />
    );
  }

  // الصفحة الرئيسية (Home) - الافتراضية
  return (
    <HomePage
      user={user}
      onNavigate={handleNavigate}
      onEditProfile={handleEditProfile}
      onRequestPrayer={handleRequestPrayer}
      onDeceasedPrayer={handleDeceasedPrayer}
      onStartPraying={handleStartPraying}
      onCompletePrayer={handleCompletePrayer}
      onLogout={handleLogout}
    />
  );
}