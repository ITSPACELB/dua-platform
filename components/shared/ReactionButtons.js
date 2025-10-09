// Props: {requestId, currentUserReaction, onReact}

// State: reactions {heart: 0, angel: 0, like: 0}

// UI: 3 buttons with icons
<div className="flex gap-3 justify-center">
  <button 
    onClick={() => onReact('heart')}
    className={`flex items-center gap-1 px-4 py-2 rounded-full ${
      currentUserReaction === 'heart' ? 'bg-red-100' : 'bg-stone-100'
    }`}
  >
    ❤️ <span className="text-sm">{reactions.heart}</span>
  </button>
  
  <button onClick={() => onReact('angel')} {...}>
    😇 <span>{reactions.angel}</span>
  </button>
  
  <button onClick={() => onReact('like')} {...}>
    👍 <span>{reactions.like}</span>
  </button>
</div>

// Animation on click: scale + bounce