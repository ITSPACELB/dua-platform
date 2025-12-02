'use client'
import React, { useState, useEffect } from 'react';
import { Trophy, Star, Clock, Gift, Sparkles, Crown, Award, Target, TrendingUp, Zap, CheckCircle, Lock } from 'lucide-react';
import VerificationBadge, { createVerificationLevel, getBadgeLevelName } from '@/components/shared/VerificationBadge';

// ════════════════════════════════════════════════════════════
// 🏆 صفحة الإنجازات والشارات - النسخة النهائية المحسّنة
// ════════════════════════════════════════════════════════════
// ✅ تكامل كامل مع نظام الشارات (VerificationBadge)
// ✅ بيانات حقيقية من API
// ✅ محتوى تفصيلي للزوار والمستخدمين
// ✅ تصميم احترافي بأعلى المعايير
// ✅ لا تعارض مع الملفات السابقة
// ════════════════════════════════════════════════════════════

export default function AchievementsPage({ onNavigate, userId }) {
  const [activeTab, setActiveTab] = useState('active');
  const [achievementsData, setAchievementsData] = useState(null);
  const [topActiveUsers, setTopActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGuest, setIsGuest] = useState(true);

  // ════════════════════════════════════════════════════════════
  // 📊 جلب البيانات عند تحميل الصفحة
  // ════════════════════════════════════════════════════════════
  useEffect(() => {
    loadAchievementsData();
  }, [userId]);

  // ════════════════════════════════════════════════════════════
  // 🔄 دالة جلب البيانات الرئيسية
  // ════════════════════════════════════════════════════════════
  const loadAchievementsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // ═══════════════════════════════════════════════════════
      // 1️⃣ جلب "الأكثر تفاعلاً" من API stats (للجميع)
      // ═══════════════════════════════════════════════════════
      const statsResponse = await fetch('/api/stats');
      
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setTopActiveUsers(data.stats?.todayActiveUsers || []);
      } else {
        setTopActiveUsers([]);
      }

      // ═══════════════════════════════════════════════════════
      // 2️⃣ جلب إنجازات وشارات المستخدم (مع Token)
      // ═══════════════════════════════════════════════════════
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        setIsGuest(false);
        await loadUserAchievements(token);
      } else {
        setIsGuest(true);
        setAchievementsData(null);
      }

    } catch (err) {
      console.error('خطأ في تحميل البيانات:', err);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // 👤 جلب إنجازات وشارات المستخدم
  // ════════════════════════════════════════════════════════════
  const loadUserAchievements = async (token) => {
    try {
      const response = await fetch('/api/users/achievements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAchievementsData(data.data);
      } else if (response.status === 401) {
        setIsGuest(true);
        setAchievementsData(null);
        localStorage.removeItem('auth_token');
      } else {
        setAchievementsData(null);
      }
    } catch (err) {
      console.error('خطأ في جلب البيانات الشخصية:', err);
      setAchievementsData(null);
    }
  };

  // ════════════════════════════════════════════════════════════
  // 🎨 رسم واجهة الإنجازات النشطة
  // ════════════════════════════════════════════════════════════
  const renderActiveAchievements = () => {
    // للزوار: شرح تفصيلي
    if (isGuest) {
      return (
        <div className="space-y-6">
          {/* شرح نظام الإنجازات */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-2xl">
                🎯
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  نظام الإنجازات المؤقتة
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  احصل على إنجازات مميزة من خلال المشاركة في القرعة اليومية والتفاعل المستمر
                </p>
              </div>
            </div>

            {/* الإنجازات المتاحة */}
            <div className="space-y-4 mt-6">
              {/* القرعة اليومية */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">⭐</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                      القرعة اليومية (24 ساعة)
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      يُظهر اسمك في الصفحة الرئيسية لمدة 24 ساعة
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>ادعُ لـ3 طلبات على الأقل</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Gift className="w-4 h-4 text-amber-500" />
                      <span>فائزان يومياً</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* الإنجاز الذهبي */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg p-4 border-2 border-amber-300 dark:border-amber-700">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">👑</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                      الإنجاز الذهبي (30 يوماً)
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      أعلى إنجاز مؤقت - مكافآت حصرية
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span>اختيار آية قرآنية مخصصة</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span>ظهور اسمك لمدة 30 يوم</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>شارة ذهبية خاصة</span>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-xs text-amber-800 dark:text-amber-300">
                      <strong>المتطلبات:</strong> تفاعل يومي لمدة 30 يوم متتالية
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* رسالة تحفيزية */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700">
              <p className="text-center text-gray-800 dark:text-gray-200 font-medium">
                💡 <strong>سجّل دخولك</strong> لتتبع إنجازاتك والمشاركة في القرعة اليومية!
              </p>
            </div>
          </div>
        </div>
      );
    }

    // للمستخدمين المسجلين
    const hasTemporaryAchievements = 
      achievementsData?.activeTemporaryAchievements?.length > 0;

    return (
      <div className="space-y-4">
        {/* عرض التقدم الحالي */}
        {achievementsData && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              تقدمك الحالي
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {achievementsData.prayersThisMonth || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  دعاء هذا الشهر
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {achievementsData.interactionRate?.toFixed(1) || 0}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  نسبة التفاعل
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center col-span-2 md:col-span-1">
                <div className="text-2xl font-bold text-green-600">
                  {achievementsData.totalActiveAchievements || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  إنجازات نشطة
                </div>
              </div>
            </div>
          </div>
        )}

        {/* الإنجازات النشطة */}
        {!hasTemporaryAchievements && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <Trophy className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 dark:text-white font-semibold mb-2">
              لا توجد إنجازات نشطة حالياً
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              شارك في القرعة اليومية للحصول على إنجازات مميزة!
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <Zap className="w-4 h-4" />
              <span>ابدأ الدعاء الآن</span>
            </div>
          </div>
        )}

        {/* عرض الإنجازات المؤقتة النشطة */}
        {hasTemporaryAchievements && (
          <div className="grid gap-4">
            {achievementsData.activeTemporaryAchievements.map((achievement, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br rounded-xl p-6 border-2 ${
                  achievement.color === 'amber' 
                    ? 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700'
                    : achievement.color === 'emerald'
                    ? 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-300 dark:border-emerald-700'
                    : 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300 dark:border-blue-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {achievement.name}
                      </h3>
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        نشط
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        {achievement.stars} نجمة
                      </span>
                      <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {achievement.timeRemaining?.text || achievement.duration}
                      </span>
                    </div>
                    {achievement.benefits && (
                      <div className="space-y-1">
                        {achievement.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // 🎨 رسم واجهة الشارات
  // ════════════════════════════════════════════════════════════
  const renderBadges = () => {
    // للزوار: شرح النظام الثلاثي
    if (isGuest) {
      return (
        <div className="space-y-6">
          {/* شرح نظام الشارات */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                نظام الشارات الدائمة
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                احصل على شارات توثيق دائمة بناءً على نسبة تفاعلك المستمر
              </p>
            </div>

            {/* النظام الثلاثي */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💎</span>
                </div>
                <TrendingUp className="w-6 h-6 text-gray-400" />
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <TrendingUp className="w-6 h-6 text-gray-400" />
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👑</span>
                </div>
              </div>
            </div>

            {/* تفاصيل الشارات */}
            <div className="space-y-4">
              {/* الماسة الزرقاء */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-4">
                  <VerificationBadge 
                    level={createVerificationLevel(85, 'active', 0)} 
                    size="xl"
                    showTooltip={false}
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                      💎 الماسة الزرقاء
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      نسبة تفاعل 80%+ • الحد الأدنى للحفاظ: 75%
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                        <span>شارة توثيق زرقاء</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                        <span>مستخدم موثق</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                        <span>أولوية في القرعة</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* الكأس الذهبي */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-amber-200 dark:border-amber-700">
                <div className="flex items-start gap-4">
                  <VerificationBadge 
                    level={createVerificationLevel(92, 'active', 0)} 
                    size="xl"
                    showTooltip={false}
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                      🏆 الكأس الذهبي
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      نسبة تفاعل 90%+ • الحد الأدنى للحفاظ: 85%
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-3 h-3 text-amber-500" />
                        <span>شارة كأس ذهبية متوهجة</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-3 h-3 text-amber-500" />
                        <span>مستخدم ممتاز</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-3 h-3 text-amber-500" />
                        <span>أولوية عالية جداً</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* التاج الملكي */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-5 border-2 border-yellow-400 dark:border-yellow-700">
                <div className="flex items-start gap-4">
                  <VerificationBadge 
                    level={createVerificationLevel(98, 'active', 0)} 
                    size="xl"
                    showTooltip={false}
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                      👑 التاج الملكي
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      نسبة تفاعل 98%+ • الحد الأدنى للحفاظ: 95%
                    </p>
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <Crown className="w-3 h-3 text-amber-500" />
                        <span>تاج ملكي ذهبي متألق</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <Crown className="w-3 h-3 text-amber-500" />
                        <span>النخبة المطلقة</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <Crown className="w-3 h-3 text-amber-500" />
                        <span>أولوية قصوى في كل شيء</span>
                      </div>
                    </div>
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-xs text-amber-800 dark:text-amber-300">
                      <strong>مميز:</strong> أعلى مستوى توثيق - للمتفاعلين بشكل استثنائي
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* رسالة تحفيزية */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg border-2 border-dashed border-purple-300 dark:border-purple-700">
              <p className="text-center text-gray-800 dark:text-gray-200 font-medium">
                💡 <strong>سجّل دخولك</strong> لتتبع تقدمك نحو الشارات!
              </p>
            </div>
          </div>
        </div>
      );
    }

    // للمستخدمين المسجلين
    const currentBadge = achievementsData?.currentBadge;
    const nextBadge = achievementsData?.nextBadge;
    const interactionRate = achievementsData?.interactionRate || 0;

    return (
      <div className="space-y-6">
        {/* الشارة الحالية */}
        {currentBadge ? (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-4 mb-4">
              <VerificationBadge 
                level={createVerificationLevel(interactionRate, currentBadge.statusInfo?.status || 'active', currentBadge.statusInfo?.daysRemaining || 0)} 
                size="xl"
                showTooltip={false}
              />
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                  {currentBadge.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentBadge.description}
                </p>
              </div>
            </div>

            {/* حالة الشارة */}
            <div className={`p-3 rounded-lg mb-4 ${
              currentBadge.statusInfo?.isActive 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : currentBadge.statusInfo?.isInGracePeriod
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}>
              <div className="flex items-center gap-2 font-medium">
                {currentBadge.statusInfo?.isActive && <CheckCircle className="w-5 h-5" />}
                {currentBadge.statusInfo?.isInGracePeriod && <Clock className="w-5 h-5" />}
                {currentBadge.statusMessage}
              </div>
            </div>

            {/* نسبة التفاعل */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 dark:text-gray-300">نسبة التفاعل</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {interactionRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${Math.min(interactionRate, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                الحد الأدنى للحفاظ: {currentBadge.maintainThreshold}%
              </p>
            </div>

            {/* المزايا */}
            <div className="space-y-2">
              <p className="font-semibold text-sm text-gray-900 dark:text-white mb-2">مزاياك الحالية:</p>
              {currentBadge.benefits?.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Award className="w-4 h-4 text-green-600" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        ) : (
          // بدون شارة
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              ابدأ رحلتك نحو التوثيق
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              نسبة تفاعلك الحالية: <strong>{interactionRate.toFixed(1)}%</strong>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              تحتاج إلى 80% للحصول على الماسة الزرقاء
            </p>
          </div>
        )}

        {/* التقدم نحو الشارة التالية */}
        {nextBadge && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900 dark:text-white">الشارة التالية</h4>
              <span className="text-2xl">{nextBadge.icon}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <strong>{nextBadge.name}</strong> - {nextBadge.description}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">التقدم</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {nextBadge.progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                  style={{ width: `${nextBadge.progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                تحتاج <strong>+{nextBadge.remainingPoints?.toFixed(1)}%</strong> للوصول إلى {nextBadge.name}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // 🎨 رسم واجهة الأكثر تفاعلاً
  // ════════════════════════════════════════════════════════════
  const renderTopActive = () => {
    if (topActiveUsers.length === 0) {
      return (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <Gift className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            لا يوجد مستخدمون نشطون اليوم
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {topActiveUsers.slice(0, 10).map((user, index) => {
          const badge = createVerificationLevel(
            user.level === 3 ? 98 : user.level === 2 ? 85 : 75,
            'active',
            0
          );

          return (
            <div
              key={user.id || index}
              className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-5 border-2 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* الترتيب */}
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                    'bg-gradient-to-br from-blue-500 to-purple-500'
                  }`}
                >
                  {index + 1}
                </div>
                
                {/* المعلومات */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {user.name || 'مستخدم'}
                    </h3>
                    {badge && (
                      <VerificationBadge 
                        level={badge} 
                        size="md"
                        showTooltip={true}
                      />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.prayerCount || 0} دعاء اليوم
                  </p>
                </div>
                
                {/* أيقونة */}
                <div className="text-3xl">
                  {index === 0 ? '👑' : index === 1 || index === 2 ? '🏆' : '⭐'}
                </div>
              </div>
            </div>
          );
        })}

        {/* رسالة تحفيزية */}
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-700">
          <p className="text-center text-gray-800 dark:text-gray-200">
            💫 <strong>ادعُ للآخرين بإخلاص</strong> لتصبح من المتصدرين!
          </p>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // 🎨 واجهة التحميل
  // ════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // 🎨 الواجهة الرئيسية
  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => onNavigate('home')}
            className="mb-4 flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span>←</span>
            <span>رجوع</span>
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8" />
            الإنجازات والشارات
          </h1>
          <p className="text-blue-100 mt-2">
            تابع إنجازاتك وشاراتك المميزة
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex overflow-x-auto">
            {[
              { id: 'active', label: 'الإنجازات النشطة', icon: Sparkles },
              { id: 'badges', label: 'الشارات', icon: Crown },
              { id: 'top', label: 'الأكثر تفاعلاً', icon: Star }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'active' && renderActiveAchievements()}
        {activeTab === 'badges' && renderBadges()}
        {activeTab === 'top' && renderTopActive()}
      </div>
    </div>
  );
}