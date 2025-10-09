// ===============================================
// 💬 أزرار التفاعل (Reaction Buttons)
// تظهر على طلبات الدعاء لصاحب الطلب
// ===============================================

export default function ReactionButtons({ requestId, currentUserReaction, onReact }) {
  const reactions = {
    heart: 12,
    angel: 8,
    like: 15
  };

  return (
    <div className="flex gap-3 justify-center">
      <button
        onClick={() => onReact('heart')}
        className={`flex items-center gap-1 px-4 py-2 rounded-full transition-all ${
          currentUserReaction === 'heart' 
            ? 'bg-red-100 scale-110' 
            : 'bg-stone-100 hover:bg-red-50'
        }`}
      >
        ❤️ <span className="text-sm">{reactions.heart}</span>
      </button>

      <button
        onClick={() => onReact('angel')}
        className={`flex items-center gap-1 px-4 py-2 rounded-full transition-all ${
          currentUserReaction === 'angel'
            ? 'bg-amber-100 scale-110'
            : 'bg-stone-100 hover:bg-amber-50'
        }`}
      >
        😇 <span className="text-sm">{reactions.angel}</span>
      </button>

      <button
        onClick={() => onReact('like')}
        className={`flex items-center gap-1 px-4 py-2 rounded-full transition-all ${
          currentUserReaction === 'like'
            ? 'bg-emerald-100 scale-110'
            : 'bg-stone-100 hover:bg-emerald-50'
        }`}
      >
        👍 <span className="text-sm">{reactions.like}</span>
      </button>
    </div>
  );
}