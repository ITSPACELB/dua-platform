// GET /api/admin/stats - Dashboard statistics
// Headers: Authorization (admin)

// Queries:
// 1. Total users: SELECT COUNT(*) FROM users WHERE status='active'
// 2. New users today: WHERE created_at > CURRENT_DATE
// 3. Total prayers: SELECT COUNT(*) FROM prayers
// 4. Prayers today: WHERE created_at > CURRENT_DATE
// 5. Average interaction rate: SELECT AVG(interaction_rate) FROM user_stats
// 6. Verified users: SELECT COUNT(*) WHERE interaction_rate >= 80
// 7. Active users (7 days): WHERE last_login > NOW() - INTERVAL '7 days'

// Return: {
//   totalUsers,
//   newUsersToday,
//   totalPrayers,
//   prayersToday,
//   avgInteractionRate,
//   verifiedUsers: {blue, green, gold},
//   activeUsers
// }