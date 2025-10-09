// Props: {targetTimestamp, onComplete, label}

// State: timeRemaining (seconds)

// useEffect: setInterval every 1s
// Calculate: hours, minutes, seconds from timeRemaining

// UI:
// <div className="text-center">
//   <p className="text-lg font-semibold text-stone-700">{label}</p>
//   <div className="text-3xl font-bold text-emerald-600">
//     {hours}:{minutes}:{seconds}
//   </div>
// </div>

// When reaches 0 → call onComplete()