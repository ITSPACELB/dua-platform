-- ============================================================================
-- 📋 قاعدة بيانات كاملة - منصة يُجيب للدعاء الجماعي
-- ============================================================================
-- تاريخ الإنشاء: 2025-10-23
-- الإصدار: 2.1 (محدّث - نظام النقاط والإنجازات)
-- يحتوي على: الجداول الأساسية + جداول لوحة الأدمن + نظام النقاط
-- ============================================================================

-- ============================================================================
-- 🗑️ حذف الجداول القديمة (إن وجدت)
-- ============================================================================
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
DROP TABLE IF EXISTS about_us CASCADE;
DROP TABLE IF EXISTS level_ratios CASCADE;
DROP TABLE IF EXISTS prayer_request_duration CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS selected_verses CASCADE;
DROP TABLE IF EXISTS user_points CASCADE;
DROP TABLE IF EXISTS fingerprint_settings CASCADE;

-- ============================================================================
-- 📊 الجداول الأساسية
-- ============================================================================

-- ============================================================================
-- 1️⃣ جدول المستخدمين
-- ============================================================================
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

-- ============================================================================
-- 2️⃣ جدول طلبات الدعاء
-- ============================================================================
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

-- ============================================================================
-- 3️⃣ جدول الدعوات (محدّث)
-- ============================================================================
CREATE TABLE prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES prayer_requests(id) ON DELETE CASCADE,
    prayer_type VARCHAR(20) DEFAULT 'standard' CHECK (prayer_type IN ('standard', 'collective', 'double')),
    points_earned INTEGER DEFAULT 0,
    prayed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prayers_user ON prayers(user_id);
CREATE INDEX idx_prayers_request ON prayers(request_id);
CREATE INDEX idx_prayers_date ON prayers(prayed_at DESC);

-- ============================================================================
-- 4️⃣ جدول الإحصائيات (محدّث)
-- ============================================================================
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_prayers INTEGER DEFAULT 0,
    prayers_today INTEGER DEFAULT 0,
    prayers_week INTEGER DEFAULT 0,
    prayers_month INTEGER DEFAULT 0,
    prayers_year INTEGER DEFAULT 0,
    total_stars INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1 CHECK (level IN (1, 2, 3)),
    interaction_rate DECIMAL(5,2) DEFAULT 0.00,
    daily_streak INTEGER DEFAULT 0,
    last_achievement_date TIMESTAMP,
    cooldown_level INTEGER DEFAULT 1 CHECK (cooldown_level BETWEEN 1 AND 4),
    last_prayer_date TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stats_user ON user_stats(user_id);
CREATE INDEX idx_stats_rate ON user_stats(interaction_rate DESC);
CREATE INDEX idx_stats_level ON user_stats(level DESC);
CREATE INDEX idx_stats_cooldown ON user_stats(cooldown_level);
CREATE INDEX idx_stats_streak ON user_stats(daily_streak DESC);

-- ============================================================================
-- 5️⃣ جدول الإنجازات (محدّث)
-- ============================================================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL CHECK (achievement_type IN ('name_display', 'double_prayer', 'verse_selection')),
    stars_earned INTEGER NOT NULL,
    achieved_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_achievements_type ON achievements(achievement_type);
CREATE INDEX idx_achievements_date ON achievements(achieved_at DESC);

-- ============================================================================
-- 5️⃣A جدول الآيات المختارة (جديد)
-- ============================================================================
CREATE TABLE selected_verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    verse_text TEXT NOT NULL,
    verse_reference TEXT NOT NULL,
    verse_category VARCHAR(50) DEFAULT 'dua',
    selected_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    prayers_count INTEGER DEFAULT 0
);

CREATE INDEX idx_selected_verses_active ON selected_verses(is_active, expires_at DESC);
CREATE INDEX idx_selected_verses_user ON selected_verses(user_id);
CREATE INDEX idx_selected_verses_date ON selected_verses(selected_at DESC);

-- ============================================================================
-- 5️⃣B جدول نقاط المستخدمين (جديد)
-- ============================================================================
CREATE TABLE user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_points INTEGER DEFAULT 0,
    points_today INTEGER DEFAULT 0,
    points_week INTEGER DEFAULT 0,
    points_month INTEGER DEFAULT 0,
    rank INTEGER,
    last_points_date TIMESTAMP,
    bonus_multiplier DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_points_user ON user_points(user_id);
CREATE INDEX idx_user_points_total ON user_points(total_points DESC);
CREATE INDEX idx_user_points_rank ON user_points(rank);
CREATE INDEX idx_user_points_week ON user_points(points_week DESC);

-- ============================================================================
-- 6️⃣ جدول رسائل التواصل
-- ============================================================================
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

-- ============================================================================
-- 📋 جداول لوحة الأدمن
-- ============================================================================

-- ============================================================================
-- 7️⃣ جدول البانر
-- ============================================================================
CREATE TABLE banner (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    link VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_banner_active ON banner(is_active, created_at DESC);

-- ============================================================================
-- 8️⃣ جدول الدعاء الجماعي
-- ============================================================================
CREATE TABLE collective_prayer (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('verse', 'purpose', 'custom')),
    content TEXT NOT NULL,
    timing VARCHAR(20) NOT NULL CHECK (timing IN ('always', 'scheduled')),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_collective_active ON collective_prayer(is_active, created_at DESC);

-- ============================================================================
-- 9️⃣ جدول التوعية
-- ============================================================================
CREATE TABLE awareness (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    links JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_awareness_active ON awareness(is_active, created_at DESC);

-- ============================================================================
-- 🔟 جدول المكتبة
-- ============================================================================
CREATE TABLE library (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_library_created ON library(created_at DESC);

-- ============================================================================
-- 1️⃣1️⃣ جدول "من نحن"
-- ============================================================================
CREATE TABLE about_us (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_about_us_active ON about_us(is_active, created_at DESC);

-- ============================================================================
-- 1️⃣2️⃣ جدول نسب المستويات
-- ============================================================================
CREATE TABLE level_ratios (
    id SERIAL PRIMARY KEY,
    level_1_ratio INTEGER DEFAULT 90,
    level_2_ratio INTEGER DEFAULT 75,
    level_3_ratio INTEGER DEFAULT 60,
    level_1_stars INTEGER DEFAULT 1,
    level_2_stars INTEGER DEFAULT 2,
    level_3_stars INTEGER DEFAULT 3,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 1️⃣3️⃣ جدول مدة طلبات الدعاء
-- ============================================================================
CREATE TABLE prayer_request_duration (
    id SERIAL PRIMARY KEY,
    request_type VARCHAR(50) NOT NULL UNIQUE,
    duration_hours INTEGER NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 1️⃣4️⃣ جدول إعدادات الإشعارات
-- ============================================================================
CREATE TABLE notification_settings (
    id SERIAL PRIMARY KEY,
    push_enabled BOOLEAN DEFAULT false,
    email_enabled BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 1️⃣5️⃣ جدول إعدادات البصمة
-- ============================================================================
CREATE TABLE fingerprint_settings (
    id SERIAL PRIMARY KEY,
    fingerprint_enabled BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 1️⃣6️⃣ جدول الإعدادات العامة
-- ============================================================================
CREATE TABLE admin_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_settings_key ON admin_settings(setting_key);

-- ============================================================================
-- 💾 البيانات الافتراضية
-- ============================================================================

-- نسب المستويات الافتراضية
INSERT INTO level_ratios (level_1_ratio, level_2_ratio, level_3_ratio, level_1_stars, level_2_stars, level_3_stars)
VALUES (90, 75, 60, 1, 2, 3);

-- مدة الطلبات الافتراضية
INSERT INTO prayer_request_duration (request_type, duration_hours) VALUES
('personal', 168),   -- أسبوع
('friend', 168),     -- أسبوع
('deceased', 336),   -- أسبوعان
('sick', 336)        -- أسبوعان
ON CONFLICT (request_type) DO NOTHING;

-- إعدادات الإشعارات الافتراضية
INSERT INTO notification_settings (push_enabled, email_enabled)
VALUES (false, false);

-- إعدادات البصمة الافتراضية
INSERT INTO fingerprint_settings (fingerprint_enabled)
VALUES (false);

-- الإعدادات العامة الافتراضية
INSERT INTO admin_settings (setting_key, setting_value) VALUES
('request_frequency', '{"hours": 24, "premium_multiplier": 2}'),
('level_thresholds', '{"level_1": 90, "level_2": 75, "level_3": 60}'),
('stars_distribution', '{"level_1": 3, "level_2": 2, "level_3": 1}'),
('fingerprint_enabled', 'true'),
('buttons_visibility', '{"stats": true, "achievements": true, "library": true, "faq": true}'),
('lottery_interaction_ratios', '{"level2": 40, "level3": 60}'),
('manual_winners', '{"enabled": false, "users": []}'),
('current_top_active', '[]')
ON CONFLICT (setting_key) DO NOTHING;

-- إعدادات رؤية عناصر القائمة
INSERT INTO admin_settings (setting_key, setting_value) VALUES
(
    'menu_visibility',
    '{"share":true,"download":true,"library":true,"about":true,"help":true,"rating":false,"donate":false}'
)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- 🔧 دوال مساعدة (Functions)
-- ============================================================================

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
    SELECT COUNT(*) INTO total_available
    FROM prayer_requests
    WHERE created_at >= (SELECT created_at FROM users WHERE id = usr_id)
    AND status = 'active';
    
    SELECT COUNT(*) INTO total_prayed
    FROM prayers
    WHERE user_id = usr_id;
    
    IF total_available > 0 THEN
        rate := (total_prayed::DECIMAL / total_available::DECIMAL) * 100;
    ELSE
        rate := 0;
    END IF;
    
    UPDATE user_stats 
    SET interaction_rate = rate, updated_at = NOW()
    WHERE user_id = usr_id;
    
    RETURN rate;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 🆕 دالة لحساب مستوى المستخدم
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_user_level(usr_id UUID)
RETURNS INTEGER AS $$
DECLARE
    user_data RECORD;
    calculated_level INTEGER;
BEGIN
    SELECT 
        full_name,
        mother_or_father_name,
        phone_number,
        device_fingerprint
    INTO user_data
    FROM users
    WHERE id = usr_id;
    
    -- مسجل كامل (Level 3)
    IF user_data.device_fingerprint IS NOT NULL 
       AND user_data.full_name IS NOT NULL 
       AND user_data.mother_or_father_name IS NOT NULL 
       AND user_data.phone_number IS NOT NULL THEN
        calculated_level := 3;
    
    -- جزئي (Level 2)
    ELSIF user_data.device_fingerprint IS NOT NULL 
          AND user_data.full_name IS NOT NULL 
          AND user_data.mother_or_father_name IS NOT NULL THEN
        calculated_level := 2;
    
    -- زائر (Level 1)
    ELSE
        calculated_level := 1;
    END IF;
    
    -- تحديث المستوى في user_stats
    UPDATE user_stats 
    SET level = calculated_level, updated_at = NOW()
    WHERE user_id = usr_id;
    
    RETURN calculated_level;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 🆕 دالة لتحديث النقاط
-- ============================================================================
CREATE OR REPLACE FUNCTION update_user_points(
    usr_id UUID, 
    points INTEGER,
    prayer_type VARCHAR(20) DEFAULT 'standard'
)
RETURNS void AS $$
DECLARE
    today_start TIMESTAMP := date_trunc('day', NOW());
    week_start TIMESTAMP := date_trunc('week', NOW());
    month_start TIMESTAMP := date_trunc('month', NOW());
BEGIN
    -- إنشاء أو تحديث نقاط المستخدم
    INSERT INTO user_points (
        user_id, 
        total_points, 
        points_today, 
        points_week, 
        points_month,
        last_points_date
    )
    VALUES (
        usr_id,
        points,
        points,
        points,
        points,
        NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        total_points = user_points.total_points + points,
        points_today = CASE 
            WHEN user_points.last_points_date >= today_start 
            THEN user_points.points_today + points
            ELSE points
        END,
        points_week = CASE 
            WHEN user_points.last_points_date >= week_start 
            THEN user_points.points_week + points
            ELSE points
        END,
        points_month = CASE 
            WHEN user_points.last_points_date >= month_start 
            THEN user_points.points_month + points
            ELSE points
        END,
        last_points_date = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 🆕 دالة لحساب الترتيب (Rank)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_all_ranks()
RETURNS void AS $$
BEGIN
    WITH ranked_users AS (
        SELECT 
            user_id,
            ROW_NUMBER() OVER (ORDER BY total_points DESC) as new_rank
        FROM user_points
        WHERE total_points > 0
    )
    UPDATE user_points
    SET rank = ranked_users.new_rank
    FROM ranked_users
    WHERE user_points.user_id = ranked_users.user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 🆕 دالة لتحديث السلسلة اليومية (Daily Streak)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_daily_streak(usr_id UUID)
RETURNS INTEGER AS $$
DECLARE
    last_prayer TIMESTAMP;
    current_streak INTEGER;
    yesterday_start TIMESTAMP := date_trunc('day', NOW() - INTERVAL '1 day');
    yesterday_end TIMESTAMP := date_trunc('day', NOW());
BEGIN
    -- جلب آخر دعاء
    SELECT last_prayer_date INTO last_prayer
    FROM user_stats
    WHERE user_id = usr_id;
    
    -- جلب السلسلة الحالية
    SELECT daily_streak INTO current_streak
    FROM user_stats
    WHERE user_id = usr_id;
    
    -- إذا كان آخر دعاء أمس، زيادة السلسلة
    IF last_prayer >= yesterday_start AND last_prayer < yesterday_end THEN
        current_streak := current_streak + 1;
    
    -- إذا لم يكن أمس، إعادة التعيين إلى 1
    ELSIF last_prayer < yesterday_start OR last_prayer IS NULL THEN
        current_streak := 1;
    END IF;
    
    -- تحديث السلسلة
    UPDATE user_stats 
    SET daily_streak = current_streak, updated_at = NOW()
    WHERE user_id = usr_id;
    
    RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 🔄 المحفزات التلقائية (Triggers)
-- ============================================================================

-- دالة لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers للجداول الأساسية
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers لجداول الأدمن
DROP TRIGGER IF EXISTS update_banner_updated_at ON banner;
CREATE TRIGGER update_banner_updated_at
    BEFORE UPDATE ON banner
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collective_prayer_updated_at ON collective_prayer;
CREATE TRIGGER update_collective_prayer_updated_at
    BEFORE UPDATE ON collective_prayer
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_awareness_updated_at ON awareness;
CREATE TRIGGER update_awareness_updated_at
    BEFORE UPDATE ON awareness
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_library_updated_at ON library;
CREATE TRIGGER update_library_updated_at
    BEFORE UPDATE ON library
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_about_us_updated_at ON about_us;
CREATE TRIGGER update_about_us_updated_at
    BEFORE UPDATE ON about_us
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_level_ratios_updated_at ON level_ratios;
CREATE TRIGGER update_level_ratios_updated_at
    BEFORE UPDATE ON level_ratios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prayer_duration_updated_at ON prayer_request_duration;
CREATE TRIGGER update_prayer_duration_updated_at
    BEFORE UPDATE ON prayer_request_duration
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON notification_settings;
CREATE TRIGGER update_notification_settings_updated_at
    BEFORE UPDATE ON notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fingerprint_settings_updated_at ON fingerprint_settings;
CREATE TRIGGER update_fingerprint_settings_updated_at
    BEFORE UPDATE ON fingerprint_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ✅ ملخص القاعدة
-- ============================================================================

DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '✅ تم إنشاء قاعدة البيانات الكاملة بنجاح!';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📊 الجداول الأساسية: 8 جداول';
    RAISE NOTICE '   - users (المستخدمون)';
    RAISE NOTICE '   - prayer_requests (طلبات الدعاء)';
    RAISE NOTICE '   - prayers (الدعوات)';
    RAISE NOTICE '   - user_stats (الإحصائيات)';
    RAISE NOTICE '   - achievements (الإنجازات)';
    RAISE NOTICE '   - selected_verses (الآيات المختارة) ✨ جديد';
    RAISE NOTICE '   - user_points (نقاط المستخدمين) ✨ جديد';
    RAISE NOTICE '   - contact_messages (رسائل التواصل)';
    RAISE NOTICE '';
    RAISE NOTICE '📋 جداول لوحة الأدمن: 10 جداول';
    RAISE NOTICE '   - banner (البانر)';
    RAISE NOTICE '   - collective_prayer (الدعاء الجماعي)';
    RAISE NOTICE '   - awareness (التوعية)';
    RAISE NOTICE '   - library (المكتبة)';
    RAISE NOTICE '   - about_us (من نحن)';
    RAISE NOTICE '   - level_ratios (نسب المستويات)';
    RAISE NOTICE '   - prayer_request_duration (مدة الطلبات)';
    RAISE NOTICE '   - notification_settings (إعدادات الإشعارات)';
    RAISE NOTICE '   - fingerprint_settings (إعدادات البصمة)';
    RAISE NOTICE '   - admin_settings (إعدادات عامة)';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 الدوال: 7 دوال';
    RAISE NOTICE '   - increment_prayer_count';
    RAISE NOTICE '   - update_user_stats';
    RAISE NOTICE '   - calculate_interaction_rate';
    RAISE NOTICE '   - calculate_user_level ✨ جديد';
    RAISE NOTICE '   - update_user_points ✨ جديد';
    RAISE NOTICE '   - update_all_ranks ✨ جديد';
    RAISE NOTICE '   - update_daily_streak ✨ جديد';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 المحفزات: 11 محفز';
    RAISE NOTICE '💾 البيانات الافتراضية: محملة';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '🚀 جاهز للاستخدام - نظام النقاط والإنجازات مفعّل!';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- عرض جميع الجداول
SELECT 
    tablename AS "اسم الجدول",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS "الحجم"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;