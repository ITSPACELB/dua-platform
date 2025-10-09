// POST endpoint - Create prayer request
// Headers: Authorization: Bearer <token>

// Logic:
// 1. Verify JWT → get userId
// 2. Query last request: SELECT created_at FROM prayer_requests WHERE user_id=$1 AND type='need' ORDER BY created_at DESC LIMIT 1
// 3. Check if < 24 hours → return {error: 'wait', remainingTime: X}
// 4. If OK → INSERT INTO prayer_requests (user_id, type, status, created_at)
// 5. Trigger notifications to active users (separate async)
// 6. Return {success: true, requestId, nextAllowedAt}

// Response: {success: boolean, requestId?: number, nextAllowedAt?: timestamp, error?: string, remainingTime?: seconds}