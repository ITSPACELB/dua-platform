-- ============================================================================
-- 🗄️ منصة يُجيب - Schema محدّث ومتوافق
-- ============================================================================

-- ============================================================================
-- 📋 جدول: طلبات الدعاء (prayer_requests)
-- ============================================================================
CREATE TABLE IF NOT EXISTS prayer_requests (
    id SERIAL PRIMARY KEY,
    
    -- المستخدم الذي طلب الدعاء
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- نوع الدعاء
    type VARCHAR(20) NOT NULL DEFAULT 'general',
    
    -- معلومات المتوفى
    deceased_name VARCHAR(255),
    deceased_mother_name VARCHAR(255),
    relation VARCHAR(50),
    
    -- معلومات المريض
    is_name_private BOOLEAN DEFAULT false,
    sick_name VARCHAR(255),
    sick_mother_name VARCHAR(255),
    
    -- حالة الطلب
    status VARCHAR(20) DEFAULT 'active',
    
    -- التواريخ
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours',
    answered_at TIMESTAMP,
    
    -- إحصائيات
    total_prayers_received INTEGER DEFAULT 0,
    last_notification_sent TIMESTAMP,
    
    -- قيود
    CONSTRAINT valid_prayer_type CHECK (type IN ('general', 'deceased', 'sick')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'answered', 'expired'))
);

-- فهارس
CREATE INDEX IF NOT EXISTS idx_prayer_requests_active ON prayer_requests(status, created_at) 
    WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user ON prayer_requests(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_type ON prayer_requests(type);

-- ============================================================================
-- 🤲 جدول: الدعوات (prayers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS prayers (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prayed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(request_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_prayers_request ON prayers(request_id);
CREATE INDEX IF NOT EXISTS idx_prayers_user ON prayers(user_id, prayed_at);

-- ============================================================================
-- 🌍 جدول: الدعاء الجماعي (collective_prayers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS collective_prayers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    notifications_sent INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_collective_prayers_user ON collective_prayers(user_id, created_at);

-- ============================================================================
-- ⭐ جدول: الدعاء الخاص (private_prayers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS private_prayers (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_private_prayers_receiver ON private_prayers(receiver_id, read_at);
CREATE INDEX IF NOT EXISTS idx_private_prayers_sender ON private_prayers(sender_id, created_at);

-- ============================================================================
-- 💬 جدول: ردود الفعل (reactions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reactions (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reactor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(request_id, reactor_id),
    CONSTRAINT valid_reaction CHECK (reaction_type IN ('heart', 'angel', 'like'))
);

CREATE INDEX IF NOT EXISTS idx_reactions_request ON reactions(request_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions(user_id);

-- ============================================================================
-- 🔔 جدول: اشتراكات الإشعارات (subscriptions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    keys JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

-- ============================================================================
-- 📨 جدول: سجل الإشعارات (notifications)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    url VARCHAR(255),
    data JSONB,
    sent_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP,
    CONSTRAINT valid_notification_type CHECK (
        type IN ('prayer_request', 'prayer_answered', 'collective', 'private', 'reaction')
    )
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at) 
    WHERE read_at IS NULL;

-- ============================================================================
-- 📤 جدول: المشاركات (shares)
-- ============================================================================
CREATE TABLE IF NOT EXISTS shares (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    shared_at TIMESTAMP DEFAULT NOW(),
    platform VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_shares_user ON shares(user_id, shared_at);
CREATE INDEX IF NOT EXISTS idx_shares_date ON shares(shared_at);

-- ============================================================================
-- ⭐ جدول: طلبات التقييم (review_requests)
-- ============================================================================
CREATE TABLE IF NOT EXISTS review_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_at TIMESTAMP DEFAULT NOW(),
    reviewed BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_review_requests_user ON review_requests(user_id);

-- ============================================================================
-- 👑 جدول: مستخدمي الإدارة (admin_users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================================================
-- ⚙️ جدول: إعدادات المنصة (platform_settings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS platform_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO platform_settings (key, value) VALUES
    ('banner', '{"active": false, "text": "", "link": ""}'),
    ('notification_interval', '{"minutes": 30}'),
    ('request_limits', '{"prayer_hours": 3, "deceased_hours": 24, "sick_hours": 6}'),
    ('verification_thresholds', '{"blue": 80, "green": 90, "gold": 98}'),
    ('phone_bonus_points', '{"value": 5}')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 🔧 تعديل جداول users و user_stats
-- ============================================================================
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
    ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS phone_bonus_applied BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS question_answer_hash VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number) 
    WHERE phone_number IS NOT NULL;

-- ============================================================================
-- ⚡ الدوال التلقائية
-- ============================================================================

-- دالة: إنهاء الطلبات القديمة
CREATE OR REPLACE FUNCTION expire_old_requests()
RETURNS void AS $$
BEGIN
    UPDATE prayer_requests 
    SET status = 'expired'
    WHERE status = 'active' 
      AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- دالة: تحديث إحصائيات المستخدم
CREATE OR REPLACE FUNCTION update_user_stats_on_prayer()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_stats 
    SET 
        total_prayers_given = total_prayers_given + 1,
        last_prayer_date = NEW.prayed_at,
        interaction_rate = CASE 
            WHEN total_notifications_received > 0 
            THEN ((total_prayers_given + 1)::float / total_notifications_received * 100)
            ELSE 0
        END
    WHERE user_id = NEW.user_id;
    
    UPDATE prayer_requests
    SET total_prayers_received = total_prayers_received + 1
    WHERE id = NEW.request_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_stats_on_prayer ON prayers;
CREATE TRIGGER trigger_update_stats_on_prayer
    AFTER INSERT ON prayers
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_on_prayer();