-- ===================================
-- قاعدة بيانات منصة الدعاء الجماعي
-- ===================================

-- حذف الجداول القديمة إن وجدت
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS library CASCADE;
DROP TABLE IF EXISTS awareness CASCADE;
DROP TABLE IF EXISTS collective_prayer CASCADE;
DROP TABLE IF EXISTS banner CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS prayers CASCADE;
DROP TABLE IF EXISTS prayer_requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ===================================
-- 1. جدول المستخدمين
-- ===================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT,
    mother_or_father_name TEXT,
    phone_number TEXT,
    country_code TEXT,
    email TEXT,
    country TEXT,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    device_fingerprint TEXT UNIQUE,
    is_anonymous BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_fingerprint ON users(device_fingerprint);
CREATE INDEX idx_users_created ON users(created_at DESC);

-- ===================================
-- 2. جدول طلبات الدعاء
-- ===================================
CREATE TABLE prayer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('personal', 'friend', 'deceased', 'sick')),
    name TEXT,
    mother_or_father_name TEXT,
    purpose TEXT,
    custom_verse TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
    prayer_count INTEGER DEFAULT 0,
    is_second_request BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

CREATE INDEX idx_requests_status ON prayer_requests(status);
CREATE INDEX idx_requests_type ON prayer_requests(type);
CREATE INDEX idx_requests_created ON prayer_requests(created_at DESC);
CREATE INDEX idx_requests_user ON prayer_requests(user_id);

-- ===================================
-- 3. جدول الدعوات
-- ===================================
CREATE TABLE prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES prayer_requests(id) ON DELETE CASCADE,
    prayed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prayers_user ON prayers(user_id);
CREATE INDEX idx_prayers_request ON prayers(request_id);
CREATE INDEX idx_prayers_date ON prayers(prayed_at DESC);

-- ===================================
-- 4. جدول الإحصائيات
-- ===================================
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_prayers INTEGER DEFAULT 0,
    prayers_today INTEGER DEFAULT 0,
    prayers_week INTEGER DEFAULT 0,
    prayers_month INTEGER DEFAULT 0,
    prayers_year INTEGER DEFAULT 0,
    total_stars INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 0,
    interaction_rate DECIMAL(5,2) DEFAULT 0.00,
    last_prayer_date TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stats_user ON user_stats(user_id);
CREATE INDEX idx_stats_rate ON user_stats(interaction_rate DESC);
CREATE INDEX idx_stats_level ON user_stats(current_level DESC);

-- ===================================
-- 5. جدول الإنجازات
-- ===================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL CHECK (achievement_type IN ('name_display', 'double_prayer', 'verse_selection')),
    stars_earned INTEGER NOT NULL,
    achieved_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_achievements_type ON achievements(achievement_type);
CREATE INDEX idx_achievements_date ON achievements(achieved_at DESC);

-- ===================================
-- 6. جدول إعدادات الأدمن
-- ===================================
CREATE TABLE admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_settings_key ON admin_settings(setting_key);

-- ===================================
-- 7. جدول البانر
-- ===================================
CREATE TABLE banner (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    link TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================
-- 8. جدول الدعاء الجماعي
-- ===================================
CREATE TABLE collective_prayer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verse TEXT,
    purpose TEXT,
    custom_text TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================
-- 9. جدول التوعية
-- ===================================
CREATE TABLE awareness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    content TEXT NOT NULL,
    links JSONB,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===================================
-- 10. جدول المكتبة
-- ===================================
CREATE TABLE library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    description TEXT,
    cover_image TEXT,
    download_link TEXT,
    external_link TEXT,
    category TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_library_category ON library(category);
CREATE INDEX idx_library_created ON library(created_at DESC);

-- ===================================
-- 11. جدول رسائل التواصل
-- ===================================
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_read ON contact_messages(is_read);
CREATE INDEX idx_messages_date ON contact_messages(created_at DESC);

-- ===================================
-- البيانات الأولية
-- ===================================

-- إعدادات افتراضية
INSERT INTO admin_settings (setting_key, setting_value) VALUES
('request_frequency', '{"hours": 24, "premium_multiplier": 2}'::jsonb),
('level_thresholds', '{"level_1": 90, "level_2": 75, "level_3": 60}'::jsonb),
('stars_distribution', '{"level_1": 3, "level_2": 2, "level_3": 1}'::jsonb),
('fingerprint_enabled', 'true'::jsonb),
('buttons_visibility', '{"stats": true, "achievements": true, "library": true, "faq": true}'::jsonb);

-- بانر افتراضي
INSERT INTO banner (content, link, is_active) VALUES
('يُجيب ✦ ✦ ✦ منصة الدعاء الجماعي', NULL, TRUE);

-- ===================================
-- Functions مساعدة
-- ===================================

-- دالة لزيادة عداد الدعاء
CREATE OR REPLACE FUNCTION increment_prayer_count(req_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE prayer_requests 
    SET prayer_count = prayer_count + 1 
    WHERE id = req_id;
END;
$$ LANGUAGE plpgsql;

-- دالة لتحديث الإحصائيات
CREATE OR REPLACE FUNCTION update_user_stats(usr_id UUID)
RETURNS void AS $$
DECLARE
    today_start TIMESTAMP := date_trunc('day', NOW());
    week_start TIMESTAMP := date_trunc('week', NOW());
    month_start TIMESTAMP := date_trunc('month', NOW());
    year_start TIMESTAMP := date_trunc('year', NOW());
BEGIN
    INSERT INTO user_stats (user_id, total_prayers, prayers_today, prayers_week, prayers_month, prayers_year)
    SELECT 
        usr_id,
        COUNT(*),
        COUNT(*) FILTER (WHERE prayed_at >= today_start),
        COUNT(*) FILTER (WHERE prayed_at >= week_start),
        COUNT(*) FILTER (WHERE prayed_at >= month_start),
        COUNT(*) FILTER (WHERE prayed_at >= year_start)
    FROM prayers
    WHERE user_id = usr_id
    ON CONFLICT (user_id) 
    DO UPDATE SET
        total_prayers = EXCLUDED.total_prayers,
        prayers_today = EXCLUDED.prayers_today,
        prayers_week = EXCLUDED.prayers_week,
        prayers_month = EXCLUDED.prayers_month,
        prayers_year = EXCLUDED.prayers_year,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- دالة لحساب نسبة التفاعل
CREATE OR REPLACE FUNCTION calculate_interaction_rate(usr_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_available INTEGER;
    total_prayed INTEGER;
    rate DECIMAL;
BEGIN
    -- عدد الطلبات المتاحة (كل الطلبات النشطة التي ظهرت للمستخدم)
    SELECT COUNT(*) INTO total_available
    FROM prayer_requests
    WHERE created_at >= (SELECT created_at FROM users WHERE id = usr_id)
    AND status = 'active';
    
    -- عدد الدعوات التي قام بها
    SELECT COUNT(*) INTO total_prayed
    FROM prayers
    WHERE user_id = usr_id;
    
    -- حساب النسبة
    IF total_available > 0 THEN
        rate := (total_prayed::DECIMAL / total_available::DECIMAL) * 100;
    ELSE
        rate := 0;
    END IF;
    
    -- تحديث في الجدول
    UPDATE user_stats 
    SET interaction_rate = rate, updated_at = NOW()
    WHERE user_id = usr_id;
    
    RETURN rate;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- Triggers تلقائية
-- ===================================

-- تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collective_prayer_updated_at BEFORE UPDATE ON collective_prayer
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_awareness_updated_at BEFORE UPDATE ON awareness
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_library_updated_at BEFORE UPDATE ON library
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- انتهى الملف
-- ===================================

-- عرض ملخص الجداول
SELECT 
    tablename AS "اسم الجدول",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS "الحجم"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;