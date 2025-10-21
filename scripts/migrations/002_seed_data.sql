-- ============================================================================
-- 🌱 بيانات تجريبية لمنصة يُجيب
-- ============================================================================
-- ملاحظة: هذه البيانات للتطوير فقط - لا تُستخدم في الإنتاج
-- ============================================================================

-- 👥 إنشاء مستخدمين تجريبيين بأسماء فريدة
INSERT INTO users (full_name, mother_name, city, show_full_name, unique_question, question_answer_hash)
VALUES 
    ('مستخدم تجريبي أول', 'أم تجريبية أولى', 'القاهرة', true, 'ما اسم والدك؟', '$2b$10$testhash1'),
    ('مستخدم تجريبي ثاني', 'أم تجريبية ثانية', 'الرياض', true, 'ما اسم مدينتك؟', '$2b$10$testhash2'),
    ('مستخدم تجريبي ثالث', 'أم تجريبية ثالثة', 'بغداد', false, 'ما اسم جدك؟', '$2b$10$testhash3'),
    ('مستخدم تجريبي رابع', 'أم تجريبية رابعة', 'دمشق', true, 'ما هو عملك؟', '$2b$10$testhash4'),
    ('مستخدم تجريبي خامس', 'أم تجريبية خامسة', 'عمّان', true, 'كم أخ لديك؟', '$2b$10$testhash5')
ON CONFLICT DO NOTHING;

-- 📊 إنشاء إحصائيات للمستخدمين التجريبيين
INSERT INTO user_stats (user_id, total_prayers_given, total_notifications_received, interaction_rate)
SELECT 
    id, 
    0,
    0,
    0
FROM users
WHERE full_name LIKE 'مستخدم تجريبي%'
ON CONFLICT (user_id) DO NOTHING;

-- 🤲 إنشاء طلب دعاء عام تجريبي
INSERT INTO prayer_requests (
    user_id, 
    type, 
    status, 
    created_at,
    prayer_count
)
SELECT 
    u.id,
    'need',
    'active',
    NOW() - INTERVAL '1 hour',
    3
FROM users u
WHERE u.full_name = 'مستخدم تجريبي أول'
LIMIT 1;

-- 🕊️ طلب دعاء لمتوفى تجريبي
INSERT INTO prayer_requests (
    user_id, 
    type, 
    deceased_name,
    deceased_mother,
    relation,
    status, 
    created_at,
    prayer_count
)
SELECT 
    u.id,
    'deceased',
    'عبدالله تجريبي',
    'زينب تجريبية',
    'أب',
    'active',
    NOW() - INTERVAL '30 minutes',
    5
FROM users u
WHERE u.full_name = 'مستخدم تجريبي ثاني'
LIMIT 1;

-- 👑 إضافة مستخدم إداري تجريبي
INSERT INTO admin_users (email, password_hash)
VALUES ('admin@yojeeb.com', '$2b$10$YXVkZWFkbWluaGFzaGVkcGFzc3dvcmQxMjM')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- ✅ انتهى إدخال البيانات التجريبية
-- ============================================================================ 
