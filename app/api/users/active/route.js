// GET endpoint - Get active users for private prayer
// Headers: Authorization

// Logic:
// 1. SELECT id, full_name, nickname, verification_level 
//    FROM users 
//    WHERE last_login > NOW() - INTERVAL '7 days'
//    AND id != $currentUserId
//    ORDER BY interaction_rate DESC
//    LIMIT 50

// Return: [{id, displayName, verificationLevel}]