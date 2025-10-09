// Props: {level, size='md', showTooltip=true}

// Sizes: sm (16px), md (20px), lg (24px)

// UI:
<div className="relative inline-flex items-center">
  {level.icon && (
    <span className={`text-${size}`} title={showTooltip ? level.name : ''}>
      {level.icon}
    </span>
  )}
  {showTooltip && (
    <div className="tooltip">معدل التفاعل {level.threshold}%+</div>
  )}
</div>

// CSS: Tailwind with dynamic colors
// blue → bg-blue-500, green → bg-emerald-500, gold → bg-amber-500