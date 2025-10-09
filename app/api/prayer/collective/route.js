// POST endpoint - Collective prayer (95%+ only)
// Body: {message: optional}
// Headers: Authorization

// Logic:
// 1. Verify JWT → get user
// 2. Check interactionRate >= 95% → else return 403
// 3. Check last collective prayer (1 per week)
//    SELECT created_at FROM collective_prayers WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1
// 4. If < 7 days → return {error: 'wait', remainingTime}
// 5. INSERT INTO collective_prayers (user_id, message, created_at)
// 6. Send notification to ALL active users
// 7. Return {success: true, notificationsSent}

// Notification payload:
// {
//   title: "دعاء جماعي من [userName] 🟢",
//   body: "مؤمن موثق يدعو لكل المؤمنين",
//   url: "/"
// }