-- ============================================================================
-- 🗄️ منصة يُجيب - إعداد قاعدة البيانات الكاملة
-- ============================================================================
-- ملاحظة مهمة: الجداول الموجودة مسبقاً (users, user_stats) لن يتم المساس بها
-- فقط سنضيف أعمدة جديدة لها، والجداول الجديدة سيتم إنشاؤها
-- ============================================================================

-- ============================================================================
-- ✅ الجداول الموجودة مسبقاً - لا نحذفها أبداً
-- ============================================================================
-- users: يحتوي على بيانات المستخدمين الأساسية ✓
-- user_stats: يحتوي على إحصائيات المستخدمين ✓

-- ============================================================================
-- 📋 الجدول الأول: طلبات الدعاء (prayer_requests)
-- ============================================================================
-- الوصف: يحفظ كل طلب دعاء يقوم به المستخدمون
-- الأنواع المدعومة: عام، للمتوفى، للمريض

CREATE TABLE IF NOT EXISTS prayer_requests (
    -- 🔑 المفتاح الأساسي
    id SERIAL PRIMARY KEY,
    
    -- 👤 من الذي طلب الدعاء (مرتبط بجدول users)
    requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 🎯 نوع الدعاء: 
    -- 'general' = دعاء عام للشخص نفسه
    -- 'deceased' = دعاء لمتوفى
    -- 'sick' = دعاء لمريض (اسم خاص)
    prayer_type VARCHAR(20) NOT NULL DEFAULT 'general',
    
    -- 🕊️ معلومات المتوفى (تُملأ فقط إذا كان النوع 'deceased')
    deceased_name VARCHAR(255),
    deceased_mother_name VARCHAR(255),
    relation VARCHAR(50), -- صلة القرابة: أب، أم، أخ، إلخ
    
    -- 🏥 معلومات المريض (تُملأ فقط إذا كان النوع 'sick')
    is_name_private BOOLEAN DEFAULT false, -- هل نخفي الاسم؟
    sick_person_name VARCHAR(255),
    sick_person_mother_name VARCHAR(255),
    
    -- 📊 حالة الطلب:
    -- 'active' = نشط (يمكن الدعاء له)
    -- 'answered' = مستجاب (تحققت الحاجة)
    -- 'expired' = منتهي (مضى 24 ساعة)
    status VARCHAR(20) DEFAULT 'active',
    
    -- ⏰ التواريخ المهمة
    created_at TIMESTAMP DEFAULT NOW(), -- وقت إنشاء الطلب
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours', -- ينتهي بعد 24 ساعة
    answered_at TIMESTAMP, -- وقت الاستجابة (إن حصلت)
    
    -- 📈 إحصائيات الطلب
    total_prayers_received INTEGER DEFAULT 0, -- كم شخص دعا له
    last_notification_sent TIMESTAMP, -- آخر مرة أُرسل إشعار
    
    -- ✅ قيود للتأكد من صحة البيانات
    CONSTRAINT valid_prayer_type CHECK (prayer_type IN ('general', 'deceased', 'sick')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'answered', 'expired'))
);

-- 🔍 فهارس لتسريع البحث
CREATE INDEX idx_prayer_requests_active ON prayer_requests(status, created_at) 
    WHERE status = 'active'; -- للبحث عن الطلبات النشطة فقط

CREATE INDEX idx_prayer_requests_user ON prayer_requests(requester_id, created_at);
CREATE INDEX idx_prayer_requests_type ON prayer_requests(prayer_type);

-- ============================================================================
-- 🤲 الجدول الثاني: الدعوات (prayers)
-- ============================================================================
-- الوصف: يحفظ كل دعاء يقوم به مستخدم لطلب معين
-- مثال: أحمد دعا لطلب محمد → يُسجل هنا

CREATE TABLE IF NOT EXISTS prayers (
    id SERIAL PRIMARY KEY,
    
    -- 🎯 الطلب الذي تم الدعاء له
    request_id INTEGER NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
    
    -- 👤 من الذي دعا
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- ⏰ متى دعا
    prayed_at TIMESTAMP DEFAULT NOW(),
    
    -- 🚫 منع الشخص من الدعاء لنفس الطلب مرتين
    UNIQUE(request_id, user_id)
);

-- 🔍 فهارس
CREATE INDEX idx_prayers_request ON prayers(request_id);
CREATE INDEX idx_prayers_user ON prayers(user_id, prayed_at);

-- ============================================================================
-- 🌍 الجدول الثالث: الدعاء الجماعي (collective_prayers)
-- ============================================================================
-- الوصف: دعاء يرسله مستخدم موثّق (95%+) لكل المؤمنين
-- يُسمح بدعاء جماعي واحد كل 7 أيام لكل مستخدم

CREATE TABLE IF NOT EXISTS collective_prayers (
    id SERIAL PRIMARY KEY,
    
    -- 👤 من أرسل الدعاء الجماعي
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 💬 رسالة الدعاء (اختياري)
    message TEXT,
    
    -- ⏰ متى أُرسل
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- 📊 كم إشعار أُرسل
    notifications_sent INTEGER DEFAULT 0
);

CREATE INDEX idx_collective_prayers_user ON collective_prayers(user_id, created_at);

-- ============================================================================
-- ⭐ الجدول الرابع: الدعاء الخاص (private_prayers)
-- ============================================================================
-- الوصف: دعاء خاص من مستخدم موثّق (98%+) لمستخدم آخر
-- حد أقصى 5 دعوات خاصة يومياً

CREATE TABLE IF NOT EXISTS private_prayers (
    id SERIAL PRIMARY KEY,
    
    -- 👤 المُرسل
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 👥 المُستقبل
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 💬 رسالة الدعاء
    message TEXT NOT NULL,
    
    -- ⏰ التواريخ
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP -- متى قرأه المستقبل
);

CREATE INDEX idx_private_prayers_receiver ON private_prayers(receiver_id, read_at);
CREATE INDEX idx_private_prayers_sender ON private_prayers(sender_id, created_at);

-- ============================================================================
-- 💬 الجدول الخامس: ردود الفعل (reactions)
-- ============================================================================
-- الوصف: القلوب والملائكة واللايكات على طلبات الدعاء
-- يظهر لصاحب الطلب فقط

CREATE TABLE IF NOT EXISTS reactions (
    id SERIAL PRIMARY KEY,
    
    -- 🎯 الطلب الذي تم التفاعل معه
    request_id INTEGER NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
    
    -- 👤 صاحب الطلب
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 👥 من أرسل رد الفعل
    reactor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 😊 نوع رد الفعل: heart (قلب)، angel (ملاك)، like (إعجاب)
    reaction_type VARCHAR(20) NOT NULL,
    
    -- ⏰ متى
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- 🚫 كل شخص يتفاعل مرة واحدة فقط مع كل طلب
    UNIQUE(request_id, reactor_id),
    
    CONSTRAINT valid_reaction CHECK (reaction_type IN ('heart', 'angel', 'like'))
);

CREATE INDEX idx_reactions_request ON reactions(request_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);

-- ============================================================================
-- 🔔 الجدول السادس: اشتراكات الإشعارات (subscriptions)
-- ============================================================================
-- الوصف: يحفظ اشتراك Web Push لكل مستخدم
-- يُستخدم لإرسال الإشعارات

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    
    -- 👤 المستخدم
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 🌐 معلومات اشتراك Web Push
    endpoint TEXT NOT NULL, -- رابط الإشعار الفريد
    keys JSONB NOT NULL, -- مفاتيح التشفير {p256dh: "...", auth: "..."}
    
    -- ⏰ التواريخ
    created_at TIMESTAMP DEFAULT NOW(),
    last_used TIMESTAMP DEFAULT NOW(), -- آخر مرة استُخدم
    
    -- 🚫 كل مستخدم له اشتراك واحد لكل جهاز
    UNIQUE(user_id, endpoint)
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);

-- ============================================================================
-- 📨 الجدول السابع: سجل الإشعارات (notifications)
-- ============================================================================
-- الوصف: كل إشعار يُرسل للمستخدمين يُسجل هنا

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    
    -- 👤 المستقبل
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 🎯 نوع الإشعار:
    -- 'prayer_request' = طلب دعاء جديد
    -- 'prayer_answered' = تحققت حاجة شخص دعوت له
    -- 'collective' = دعاء جماعي
    -- 'private' = دعاء خاص لك
    -- 'reaction' = أحدهم تفاعل مع طلبك
    type VARCHAR(50) NOT NULL,
    
    -- 📝 محتوى الإشعار
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    url VARCHAR(255), -- الرابط عند الضغط على الإشعار
    
    -- 📦 بيانات إضافية (JSON)
    data JSONB,
    
    -- ⏰ التواريخ
    sent_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP, -- متى قرأه المستخدم
    
    CONSTRAINT valid_notification_type CHECK (
        type IN ('prayer_request', 'prayer_answered', 'collective', 'private', 'reaction')
    )
);

CREATE INDEX idx_notifications_user ON notifications(user_id, sent_at);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at) 
    WHERE read_at IS NULL; -- للإشعارات غير المقروءة فقط

-- ============================================================================
-- 📤 الجدول الثامن: المشاركات (shares)
-- ============================================================================
-- الوصف: تتبع كل مرة يشارك فيها مستخدم المنصة

CREATE TABLE IF NOT EXISTS shares (
    id SERIAL PRIMARY KEY,
    
    -- 👤 من شارك (يمكن أن يكون null لزائر غير مسجل)
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- ⏰ متى
    shared_at TIMESTAMP DEFAULT NOW(),
    
    -- 📱 من أين شارك: whatsapp، facebook، twitter، copy_link
    platform VARCHAR(50)
);

CREATE INDEX idx_shares_user ON shares(user_id, shared_at);
CREATE INDEX idx_shares_date ON shares(shared_at);

-- ============================================================================
-- ⭐ الجدول التاسع: طلبات تقييم Google (review_requests)
-- ============================================================================
-- الوصف: تتبع من طُلب منه تقييم المنصة على Google
-- نطلب التقييم مرة واحدة فقط بعد 20 دعاء

CREATE TABLE IF NOT EXISTS review_requests (
    id SERIAL PRIMARY KEY,
    
    -- 👤 المستخدم
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- ⏰ متى طُلب منه
    requested_at TIMESTAMP DEFAULT NOW(),
    
    -- ✅ هل قيّم فعلاً؟
    reviewed BOOLEAN DEFAULT false
);

CREATE INDEX idx_review_requests_user ON review_requests(user_id);

-- ============================================================================
-- 👑 الجدول العاشر: مستخدمي الإدارة (admin_users)
-- ============================================================================
-- الوصف: قائمة المسؤولين عن المنصة

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    
    -- 👤 المستخدم المسؤول
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- 🎯 الدور: admin (مسؤول عادي) أو super_admin (مسؤول أعلى)
    role VARCHAR(20) DEFAULT 'admin',
    
    -- ⏰ متى أُضيف
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- 🚫 كل مستخدم يمكن أن يكون مسؤول مرة واحدة فقط
    UNIQUE(user_id)
);

-- ============================================================================
-- ⚙️ الجدول الحادي عشر: إعدادات المنصة (platform_settings)
-- ============================================================================
-- الوصف: إعدادات عامة للمنصة (البانر، الحدود، إلخ)

CREATE TABLE IF NOT EXISTS platform_settings (
    -- 🔑 اسم الإعداد (فريد)
    key VARCHAR(100) PRIMARY KEY,
    
    -- 📦 القيمة (JSON لمرونة التخزين)
    value JSONB NOT NULL,
    
    -- ⏰ آخر تحديث
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 🎨 إدخال الإعدادات الافتراضية
INSERT INTO platform_settings (key, value) VALUES
    -- البانر الإعلاني العلوي
    ('banner', '{"active": false, "text": "", "link": ""}'),
    
    -- كل كم دقيقة ترسل إشعارات؟
    ('notification_interval', '{"minutes": 30}'),
    
    -- حدود طلبات الدعاء (بالساعات)
    ('request_limits', '{"prayer_hours": 3, "deceased_hours": 24, "sick_hours": 6}'),
    
    -- حدود التوثيق (نسب مئوية)
    ('verification_thresholds', '{"blue": 80, "green": 90, "gold": 98}'),
    
    -- نقاط المكافأة عند إدخال رقم الهاتف
    ('phone_bonus_points', '{"value": 5}')
ON CONFLICT (key) DO NOTHING; -- إذا كان موجود، لا تعيد الإدخال

-- ============================================================================
-- 🔧 تعديل الجداول الموجودة (إضافة أعمدة فقط - لا حذف)
-- ============================================================================

-- ✅ إضافة أعمدة جديدة لجدول users
ALTER TABLE users 
    -- 📱 رقم الهاتف (اختياري - للحصول على مكافأة)
    ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
    
    -- ✅ هل تم التحقق من رقم الهاتف؟
    ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
    
    -- 🎁 هل حصل على مكافأة الهاتف؟
    ADD COLUMN IF NOT EXISTS phone_bonus_applied BOOLEAN DEFAULT false,
    
    -- 🔒 تشفير إجابة السؤال السري (bcrypt hash)
    ADD COLUMN IF NOT EXISTS question_answer_hash VARCHAR(255);

-- 🔍 فهرس للبحث عن رقم الهاتف
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number) 
    WHERE phone_number IS NOT NULL;

-- ============================================================================
-- ⚡ الدوال التلقائية (Functions & Triggers)
-- ============================================================================

-- 📅 دالة: إنهاء الطلبات القديمة تلقائياً
-- الوصف: كل طلب دعاء ينتهي بعد 24 ساعة
CREATE OR REPLACE FUNCTION expire_old_requests()
RETURNS void AS $$
BEGIN
    -- تحديث حالة الطلبات المنتهية
    UPDATE prayer_requests 
    SET status = 'expired'
    WHERE status = 'active' 
      AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 📊 دالة: تحديث إحصائيات المستخدم عند الدعاء
-- الوصف: عندما يدعو مستخدم، تُحدّث إحصائياته تلقائياً
CREATE OR REPLACE FUNCTION update_user_stats_on_prayer()
RETURNS TRIGGER AS $$
BEGIN
    -- 1️⃣ زيادة عدد الدعوات التي قام بها المستخدم
    UPDATE user_stats 
    SET 
        total_prayers_given = total_prayers_given + 1,
        last_prayer_date = NEW.prayed_at,
        
        -- 2️⃣ إعادة حساب معدل التفاعل
        interaction_rate = CASE 
            WHEN total_notifications_received > 0 
            THEN ((total_prayers_given + 1)::float / total_notifications_received * 100)
            ELSE 0
        END
    WHERE user_id = NEW.user_id;
    
    -- 3️⃣ زيادة عدد الدعوات المستقبلة على الطلب
    UPDATE prayer_requests
    SET total_prayers_received = total_prayers_received + 1
    WHERE id = NEW.request_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 🔗 ربط الدالة بجدول prayers
-- عند إدخال دعاء جديد → تُنفذ الدالة أعلاه تلقائياً
CREATE TRIGGER trigger_update_stats_on_prayer
    AFTER INSERT ON prayers
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_on_prayer();

-- ============================================================================
-- 🛡️ دالة: التحقق من الهوية الفريدة
-- ============================================================================
-- الوصف: إذا كان هناك شخص آخر بنفس الاسم واسم الأم،
-- يجب على المستخدم الجديد إدخال سؤال سري

CREATE OR REPLACE FUNCTION validate_unique_identity()
RETURNS TRIGGER AS $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    -- عد الأشخاص بنفس الاسم واسم الأم
    SELECT COUNT(*) INTO duplicate_count
    FROM users
    WHERE full_name = NEW.full_name 
      AND mother_name = NEW.mother_name
      AND id != COALESCE(NEW.id, 0);
    
    -- إذا وُجد تطابق ولم يُدخل سؤال سري → رفض
    IF duplicate_count > 0 AND NEW.unique_question IS NULL THEN
        RAISE EXCEPTION 'Unique question required for duplicate names';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 🔗 ربط الدالة بجدول users
CREATE TRIGGER trigger_validate_unique_identity
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION validate_unique_identity();

-- ============================================================================
-- ✅ انتهى إنشاء جميع الجداول والدوال
-- ============================================================================