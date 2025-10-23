-- ============================================================================
-- 📋 قاعدة بيانات كاملة - منصة يُجيب للدعاء الجماعي
-- ============================================================================
-- تاريخ الإنشاء: 2025-10-23
-- الإصدار: 2.0 (مدمج)
-- يحتوي على: الجداول الأساسية + جداول لوحة الأدمن
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
-- 3️⃣ جدول الدعوات
-- ============================================================================
CREATE TABLE prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES prayer_requests(id) ON DELETE CASCADE,
    prayed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prayers_user ON prayers(user_id);
CREATE INDEX idx_prayers_request ON prayers(request_id);
CREATE INDEX idx_prayers_date ON prayers(prayed_at DESC);

-- ============================================================================
-- 4️⃣ جدول الإحصائيات
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
    current_level INTEGER DEFAULT 0,
    interaction_rate DECIMAL(5,2) DEFAULT 0.00,
    last_prayer_date TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stats_user ON user_stats(user_id);
CREATE INDEX idx_stats_rate ON user_stats(interaction_rate DESC);
CREATE INDEX idx_stats_level ON user_stats(current_level DESC);

-- ============================================================================
-- 5️⃣ جدول الإنجازات
-- ============================================================================
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
-- 1️⃣1️⃣ جدول من نحن
-- ============================================================================
CREATE TABLE about_us (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    links JSONB DEFAULT '[]',
    email VARCHAR(255),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 1️⃣2️⃣ جدول نسب المستويات
-- ============================================================================
CREATE TABLE level_ratios (
    id SERIAL PRIMARY KEY,
    level_1 INTEGER NOT NULL CHECK (level_1 >= 0 AND level_1 <= 100),
    level_2 INTEGER NOT NULL CHECK (level_2 >= 0 AND level_2 <= 100),
    level_3 INTEGER NOT NULL CHECK (level_3 >= 0 AND level_3 <= 100),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT check_total_100 CHECK (level_1 + level_2 + level_3 = 100)
);

-- ============================================================================
-- 1️⃣3️⃣ جدول مدة طلبات الدعاء
-- ============================================================================
CREATE TABLE prayer_request_duration (
    id SERIAL PRIMARY KEY,
    duration VARCHAR(20) NOT NULL CHECK (duration IN ('daily', 'weekly', 'monthly', 'custom')),
    custom_days INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 1️⃣4️⃣ جدول إعدادات الإشعارات
-- ============================================================================
CREATE TABLE notification_settings (
    id SERIAL PRIMARY KEY,
    onesignal_enabled BOOLEAN DEFAULT false,
    whatsapp_enabled BOOLEAN DEFAULT false,
    app_id VARCHAR(255),
    api_key VARCHAR(500),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 1️⃣5️⃣ جدول إعدادات البصمة
-- ============================================================================
CREATE TABLE fingerprint_settings (
    id SERIAL PRIMARY KEY,
    enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 1️⃣6️⃣ جدول الإعدادات العامة
-- ============================================================================
CREATE TABLE admin_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 💾 البيانات الافتراضية
-- ============================================================================

-- إعدادات النظام الأساسية
INSERT INTO admin_settings (setting_key, setting_value) VALUES
('request_frequency', '{"hours": 24, "premium_multiplier": 2}'),
('level_thresholds', '{"level_1": 90, "level_2": 75, "level_3": 60}'),
('stars_distribution', '{"level_1": 3, "level_2": 2, "level_3": 1}'),
('fingerprint_enabled', 'true'),
('buttons_visibility', '{"stats": true, "achievements": true, "library": true, "faq": true}')
ON CONFLICT (setting_key) DO NOTHING;

-- البانر الافتراضي
INSERT INTO banner (content, link, is_active) 
VALUES ('✦ ✦ ✦

يُجيب

منصة الدعاء الجماعي', '', true)
ON CONFLICT DO NOTHING;

-- الدعاء الجماعي الافتراضي
INSERT INTO collective_prayer (type, content, timing, is_active) 
VALUES (
    'verse', 
    'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    'always',
    true
)
ON CONFLICT DO NOTHING;

-- نسب المستويات الافتراضية
INSERT INTO level_ratios (level_1, level_2, level_3) 
VALUES (70, 20, 10)
ON CONFLICT DO NOTHING;

-- مدة الطلبات الافتراضية
INSERT INTO prayer_request_duration (duration, custom_days) 
VALUES ('daily', 1)
ON CONFLICT DO NOTHING;

-- إعدادات الإشعارات الافتراضية
INSERT INTO notification_settings (onesignal_enabled, whatsapp_enabled) 
VALUES (false, false)
ON CONFLICT DO NOTHING;

-- إعدادات البصمة الافتراضية
INSERT INTO fingerprint_settings (enabled) 
VALUES (true)
ON CONFLICT DO NOTHING;

-- إعدادات الأكثر تفاعلاً الافتراضية
INSERT INTO admin_settings (setting_key, setting_value) 
VALUES (
    'topActive',
    '{"mode":"auto","manualNames":[],"count":5}'
)
ON CONFLICT (setting_key) DO NOTHING;

-- إعدادات أزرار الواجهة الافتراضية
INSERT INTO admin_settings (setting_key, setting_value) 
VALUES (
    'interfaceButtons',
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
    RAISE NOTICE '📊 الجداول الأساسية: 6 جداول';
    RAISE NOTICE '   - users (المستخدمون)';
    RAISE NOTICE '   - prayer_requests (طلبات الدعاء)';
    RAISE NOTICE '   - prayers (الدعوات)';
    RAISE NOTICE '   - user_stats (الإحصائيات)';
    RAISE NOTICE '   - achievements (الإنجازات)';
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
    RAISE NOTICE '🔧 الدوال: 3 دوال';
    RAISE NOTICE '🔄 المحفزات: 11 محفز';
    RAISE NOTICE '💾 البيانات الافتراضية: محملة';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '🚀 جاهز للاستخدام!';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- عرض جميع الجداول
SELECT 
    tablename AS "اسم الجدول",
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS "الحجم"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;