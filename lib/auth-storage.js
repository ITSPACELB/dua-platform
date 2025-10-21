// LocalStorage wrapper for auth
export const AUTH_KEYS = {
  USER: 'dua_user',
  TOKEN: 'dua_token',
  LAST_ACTIVITY: 'dua_last_activity'
}

export function saveAuth(user, token) {
  // Save user object + JWT token
  // Update last_activity timestamp
}

export function getAuth() {
  // Return {user, token, isValid}
  // Check token expiry (30 days)
}

export function clearAuth() {
  // Remove all auth keys
}

export function updateUser(userData) {
  // Merge new data with existing user
}