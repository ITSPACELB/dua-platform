// GET /api/admin/users - List all users with filters
// Query params: ?page=1&limit=50&search=&sort=interaction_rate&order=desc
// Headers: Authorization (admin JWT)

// Logic:
// 1. Verify admin JWT
// 2. Build query with filters
// 3. SELECT users with stats JOIN
// 4. Calculate verification levels
// 5. Return paginated results

// Response: {
//   users: [{id, fullName, nickname, interactionRate, verificationLevel, lastLogin, status}],
//   total, 
//   page, 
//   totalPages
// }

// POST /api/admin/users/block
// Body: {userId, reason}
// Logic: UPDATE users SET status='blocked', blocked_reason=$2 WHERE id=$1

// POST /api/admin/users/unblock
// Body: {userId}
// Logic: UPDATE users SET status='active', blocked_reason=NULL WHERE id=$1

// DELETE /api/admin/users/:id
// Logic: Soft delete (status='deleted') or hard delete