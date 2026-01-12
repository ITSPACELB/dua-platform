import React from 'react';
// Admin dashboard component

// Sections:
// 1. Stats cards (4 cards: users, prayers, verified, active)
// 2. Chart: prayers per day (last 30 days)
// 3. Recent users table
// 4. Top interactors list

// State: stats, loading

// useEffect: fetch /api/admin/stats

// UI: Grid layout with cards
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  <StatsCard title="إجمالي المستخدمين" value={stats.totalUsers} icon="👥" />
  <StatsCard title="دعوات اليوم" value={stats.prayersToday} icon="🤲" />
  <StatsCard title="موثقون" value={stats.verifiedUsers.total} icon="✓" />
  <StatsCard title="نشطون" value={stats.activeUsers} icon="⚡" />
</div>