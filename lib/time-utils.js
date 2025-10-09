// Helper functions for time calculations

export function calculateRemainingTime(lastRequestTimestamp, limitHours) {
  // Return seconds remaining
  const elapsed = Date.now() - new Date(lastRequestTimestamp).getTime()
  const limit = limitHours * 60 * 60 * 1000
  const remaining = limit - elapsed
  return Math.max(0, Math.floor(remaining / 1000))
}

export function formatTimeRemaining(seconds) {
  // Return {hours, minutes, seconds}
}

export function canRequest(lastRequestTimestamp, limitHours) {
  // Return boolean
}