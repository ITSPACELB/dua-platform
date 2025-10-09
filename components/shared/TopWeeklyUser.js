// Props: {topUser}

// UI: Badge/Card showing top user of the week
<div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg border-2 border-amber-300">
  <div className="text-center">
    <div className="text-4xl mb-2">👑</div>
    <h3 className="text-lg font-bold text-stone-800 mb-1">
      أكثر متفاعل هذا الأسبوع
    </h3>
    
    {topUser.showName ? (
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="text-xl font-bold text-amber-600">
          {topUser.displayName}
        </span>
        <VerificationBadge level={topUser.verificationLevel} />
      </div>
    ) : (
      <p className="text-stone-600 text-sm mt-2">
        شخص موثق يفضل عدم إظهار اسمه
      </p>
    )}
    
    <p className="text-sm text-stone-600 mt-2">
      {topUser.prayersThisWeek} دعاء هذا الأسبوع
    </p>
  </div>
</div>

// Display this at top of HomePage or in StatsPage