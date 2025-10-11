'use client'

export default function VerificationBadge({ level, size = 'md', showTooltip = true }) {
  if (!level) return null;

  const sizeClasses = {
    sm: 'text-base',
    md: 'text-lg', 
    lg: 'text-2xl'
  };

  return (
    <span className={sizeClasses[size]} title={showTooltip ? level.name : ''}>
      {level.icon}
    </span>
  );
}
