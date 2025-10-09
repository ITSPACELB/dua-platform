// POST endpoint - Private prayer (98%+ only)
// Body: {targetUserId, message}
// Headers: Authorization

// Logic:
// 1. Verify JWT → get user
// 2. Check interactionRate >= 98% → else return 403
// 3. Check daily limit (5 private prayers per day)
// 4. INSERT INTO private_prayers (sender_id, receiver_id, message, created_at)
// 5. Send notification to target user
// 6. Return {success: true}

// Notification:
// {
//   title: "دعاء خاص من [userName] 🟡",
//   body: "[message]",
//   url: "/prayers/private"
// }