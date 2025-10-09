// POST /api/tracking/share - Track shares
// Headers: Authorization

// Logic:
// 1. Verify JWT → get userId
// 2. Check if already shared today (prevent spam)
//    SELECT COUNT(*) FROM shares WHERE user_id=$1 AND created_at > CURRENT_DATE
// 3. If > 5 today → return (ignore duplicate shares)
// 4. INSERT INTO shares (user_id, created_at)
// 5. Update user stats (shares count for gold verification)
// 6. Return {success: true}

// Table: shares
// CREATE TABLE shares (
//   id SERIAL PRIMARY KEY,
//   user_id INTEGER REFERENCES users(id),
//   created_at TIMESTAMP DEFAULT NOW()
// )