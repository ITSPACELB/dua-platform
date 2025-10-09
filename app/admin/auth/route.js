// POST /api/admin/auth/login
// Body: {email, password, twoFactorCode?}

// Logic:
// 1. Query admin_users table
// 2. Verify password with bcrypt
// 3. If 2FA enabled → verify code
// 4. Generate JWT with {userId, role: 'admin'}
// 5. Return {token, adminData}

// Admin table structure:
// CREATE TABLE admin_users (
//   id SERIAL PRIMARY KEY,
//   email VARCHAR(255) UNIQUE,
//   password_hash TEXT,
//   two_factor_secret TEXT,
//   created_at TIMESTAMP DEFAULT NOW()
// )