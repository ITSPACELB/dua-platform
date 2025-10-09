// GET endpoint - Get top interactor of the week

// Logic:
// 1. SELECT user_id, COUNT(*) as prayer_count
//    FROM prayers
//    WHERE created_at > NOW() - INTERVAL '7 days'
//    GROUP BY user_id
//    ORDER BY prayer_count DESC
//    LIMIT 1

// 2. JOIN with users to get name + verification

// Return: {
//   id, 
//   displayName, 
//   verificationLevel, 
//   prayersThisWeek,
//   showName (if user opted in)
// }