// POST endpoint - Deceased prayer request
// Body: {deceasedName, deceasedMotherName, relation}

// Same logic as create but:
// 1. Check 7 days (168 hours) instead of 24
// 2. type='deceased'
// 3. Store deceased info in separate JSON field

// Response: same structure