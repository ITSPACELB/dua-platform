'use client'
import VerificationBadge from './VerificationBadge';

export default function PrayerRequestCard({ 
  request, 
  onPray, 
  onReact, 
  currentUserId 
}) {
  // ============================================================================
  // 🕐 حساب الوقت منذ النشر
  // ============================================================================
  const getTimeAgo = (timestamp) => {
    const mins = Math.floor((Date.now() - new Date(timestamp)) / 60000);
    if (mins < 1) return 'الآن';
    if (mins === 1) return 'منذ دقيقة';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours === 1) return 'منذ ساعة';
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  // ============================================================================
  // 🎨 تحديد الأيقونة حسب النوع
  // ============================================================================
  const getIcon = () => {
    if (request.type === 'deceased') return '🕊️';
    if (request.type === 'sick') return '🏥';
    return '🤲';
  };

  // ============================================================================
  // 🎨 تحديد اللون حسب النوع
  // ============================================================================
  const getButtonColor = () => {
    if (request.type === 'deceased') {
      return 'bg-stone-600 hover:bg-stone-700';
    }
    if (request.type === 'sick') {
      return 'bg-blue-600 hover:bg-blue-700';
    }
    return 'bg-emerald-600 hover:bg-emerald-700';
  };

  // ============================================================================
  // 📝 نص زر الدعاء
  // ============================================================================
  const getPrayerButtonText = () => {
    const firstName = request.displayName.split(' ')[0];
    if (request.type === 'deceased') return 'خذ لحظة وادعُ له 🤲';
    if (request.type === 'sick') return 'خذ لحظة وادعُ له 🤲';
    return `خذ لحظة وادعُ لـ ${firstName} 🤲`;
  };

  // ============================================================================
  // 🎨 واجهة المستخدم
  // ============================================================================
  return (
    <div className="p-5 border-b border-stone-100 last:border-b-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{getIcon()}</span>
            <h4 className="font-semibold text-stone-800">
              {request.displayName}
            </h4>
            {request.verificationLevel && (
              <VerificationBadge level={request.verificationLevel} size="sm" />
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-stone-600 mb-2">
            <span>{getTimeAgo(request.timestamp)}</span>
            <span>•</span>
            <span>دعا له {request.prayerCount}</span>
          </div>
        </div>
      </div>

      {/* ✅ عرض الغرض */}
      {request.purpose && (
        <div className="mb-3 p-3 bg-amber-50 border-r-4 border-amber-400 rounded-lg">
          <span className="text-amber-600 font-bold text-sm">🎯 الغرض: </span>
          <span className="text-amber-800 font-medium">{request.purpose}</span>
        </div>
      )}

      {/* ✅ عرض الآية القرآنية */}
      {request.quranicVerse && (
        <div className="mb-4 p-4 bg-green-50 border-r-4 border-green-500 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600 font-bold text-sm">📖 آية قرآنية</span>
          </div>
          <p className="text-green-800 leading-loose text-lg" style={{ fontFamily: 'Markazi Text, serif' }} dir="rtl">
            {request.quranicVerse}
          </p>
        </div>
      )}
      
      {!request.hasPrayed ? (
        <button
          onClick={() => onPray(request.id)}
          className={`w-full py-2.5 rounded-lg font-medium transition-colors text-white ${getButtonColor()}`}
        >
          {getPrayerButtonText()}
        </button>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
          <p className="text-emerald-700 font-medium">✓ دعوت له - جزاك الله خيراً</p>
        </div>
      )}

      {/* ردود الفعل إذا كان صاحب الطلب */}
      {request.userId === currentUserId && onReact && (
        <div className="mt-4 pt-4 border-t border-stone-200">
          <p className="text-sm text-stone-600 mb-2">
            {request.prayerCount} شخص دعا لك
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => onReact(request.id, 'heart')}
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-stone-100 hover:bg-red-50 transition-colors"
            >
              ❤️ <span className="text-sm">0</span>
            </button>
            <button
              onClick={() => onReact(request.id, 'angel')}
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-stone-100 hover:bg-amber-50 transition-colors"
            >
              😇 <span className="text-sm">0</span>
            </button>
            <button
              onClick={() => onReact(request.id, 'like')}
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-stone-100 hover:bg-emerald-50 transition-colors"
            >
              👍 <span className="text-sm">0</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}