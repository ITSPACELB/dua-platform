// POST endpoint - React to prayer (heart/angel/like)
// Body: {requestId, reactionType: 'heart'|'angel'|'like'}
// Headers: Authorization

// Logic:
// 1. Verify JWT → get userId
// 2. Get prayer request owner
// 3. Check if already reacted (prevent duplicates)
// 4. INSERT INTO reactions (request_id, user_id, reactor_id, type, created_at)
// 5. Update reactor's stats (add points for gold calculation)
// 6. Notify request owner
// 7. Return {success: true, totalReactions}

// GET endpoint - Get reactions for request
// Query: ?requestId=X
// Return: {heart: 5, angel: 3, like: 10, topReactors: [{name, verificationLevel}]}