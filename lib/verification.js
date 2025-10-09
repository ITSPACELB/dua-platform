// Verification system logic

export const VERIFICATION_LEVELS = {
  NONE: {threshold: 0, color: 'gray', icon: null, name: 'عادي'},
  BLUE: {threshold: 80, color: 'blue', icon: '🔵', name: 'موثق'},
  GREEN: {threshold: 90, color: 'green', icon: '🟢', name: 'موثق متقدم'},
  GOLD: {threshold: 98, color: 'amber', icon: '🟡', name: 'موثق ذهبي'}
}

export function calculateInteractionRate(prayersGiven, notificationsReceived) {
  if (notificationsReceived === 0) return 0
  return (prayersGiven / notificationsReceived) * 100
}

export function getVerificationLevel(interactionRate) {
  if (interactionRate >= 98) return VERIFICATION_LEVELS.GOLD
  if (interactionRate >= 90) return VERIFICATION_LEVELS.GREEN
  if (interactionRate >= 80) return VERIFICATION_LEVELS.BLUE
  return VERIFICATION_LEVELS.NONE
}

export function getUnlockedFeatures(interactionRate) {
  const features = []
  if (interactionRate >= 80) features.push('extra_daily_prayer')
  if (interactionRate >= 90) features.push('extra_weekly_deceased')
  if (interactionRate >= 95) features.push('collective_prayer')
  if (interactionRate >= 98) features.push('private_prayer')
  return features
}