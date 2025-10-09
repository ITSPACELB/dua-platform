// Integration with Google Reviews

// GET /api/reviews/stats
// Return current aggregate rating from DB or Google My Business API

// POST /api/reviews/request
// Body: {userId}
// Logic:
// 1. Check if user has 20+ prayers
// 2. Check if not requested review in last 30 days
// 3. Return {shouldAskReview: true, reviewUrl: 'https://g.page/r/...'}

// Table: review_requests
// CREATE TABLE review_requests (
//   id SERIAL PRIMARY KEY,
//   user_id INTEGER REFERENCES users(id),
//   requested_at TIMESTAMP DEFAULT NOW()
// )