// GET endpoint - Check if user can request
// Headers: Authorization

// Query:
// SELECT created_at, type FROM prayer_requests 
// WHERE user_id=$1 AND type IN ('need', 'deceased')
// ORDER BY created_at DESC

// Calculate:
// - lastNeedRequest → remainingTime for 24h
// - lastDeceasedRequest → remainingTime for 7d

// Return: {
//   canRequestPrayer: boolean,
//   canRequestDeceased: boolean,
//   nextPrayerAllowedAt: timestamp,
//   nextDeceasedAllowedAt: timestamp,
//   remainingSeconds: {prayer: X, deceased: Y}
// }