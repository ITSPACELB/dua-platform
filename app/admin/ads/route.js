// GET /api/admin/ads - Get current ads
// Return: {banner: {text, link, active}, image: {url, link, active}}

// POST /api/admin/ads/banner
// Body: {text, link, active}
// Logic: UPDATE site_settings SET banner_text=$1, banner_link=$2, banner_active=$3

// POST /api/admin/ads/image
// Body: FormData with image file
// Logic:
// 1. Upload to /public/ads/
// 2. UPDATE site_settings SET ad_image_url=$1
// 3. Return new URL

// Table: site_settings
// CREATE TABLE site_settings (
//   id INT PRIMARY KEY DEFAULT 1,
//   banner_text TEXT,
//   banner_link TEXT,
//   banner_active BOOLEAN DEFAULT true,
//   ad_image_url TEXT,
//   updated_at TIMESTAMP
// )