// POST endpoint
// Body: {fullName, motherName, uniqueQuestion?, questionAnswer?}

// Logic:
// 1. Query DB: SELECT * FROM users WHERE full_name=$1 AND mother_name=$2
// 2. If count === 0 → return {unique: true}
// 3. If count === 1 && no question → return {unique: true, userId}
// 4. If count > 1 && no question → return {unique: false, suggestedQuestion: 'father'}
// 5. If question provided → verify answer → return {unique: true/false, userId}

// Response: {unique: boolean, userId?: number, suggestedQuestion?: string}