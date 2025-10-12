-- ============================================================================
-- 🌱 بيانات تجريبية لمنصة يُجيب
-- ============================================================================
-- ملاحظة: هذه البيانات للتطوير فقط - لا تُستخدم في الإنتاج
-- ============================================================================

-- 👥 إنشاء مستخدمين تجريبيين
INSERT INTO users (full_name, mother_name, city, show_full_name, unique_question, question_answer_hash)
VALUES 
    -- مستخدم 1: بدون سؤال سري (أول شخص بهذا الاسم)
    ('أحمد محمد العلي', 'فاطمة', 'القاهرة', true, NULL, NULL),
    
    -- مستخدم 2: بدون سؤال سري
    ('محمد علي حسن', 'خديجة', 'الرياض', true, NULL, NULL),
    
    -- مستخدم 3: مع سؤال سري (لأن هناك شخص آخر بنفس الاسم)
    ('علي حسن محمد', 'مريم', 'بغداد', false, 'ما اسم والدك؟', '$2b$10$examplehash123'),
    
    -- مستخدم 4: مع رقم هاتف (للاختبار)
    ('سارة أحمد', 'نور', 'دمشق', true, NULL, NULL),
    
    -- مستخدم 5: مستخدم عادي
    ('خالد يوسف', 'ليلى', 'عمّان', true, NULL, NULL)
ON CONFLICT DO NOTHING; -- إذا كان موجود، تجاهل

-- 📊 إنشاء إحصائيات للمستخدمين التجريبيين
INSERT INTO user_stats (user_id, total_prayers_given, total_notifications_received, interaction_rate)
SELECT 
    id, 
    0, -- لم يدعُ أحد بعد
    0, -- لم يستلم إشعارات بعد
    0  -- معدل التفاعل صفر
FROM users
WHERE id IN (
    SELECT id FROM users WHERE full_name IN (
        'أحمد محمد العلي', 
        'محمد علي حسن', 
        'علي حسن محمد',
        'سارة أحمد',
        'خالد يوسف'
    )
)
ON CONFLICT (user_id) DO NOTHING;

-- 🤲 إنشاء طلبات دعاء تجريبية
INSERT INTO prayer_requests (
    requester_id, 
    prayer_type, 
    status, 
    created_at,
    expires_at,
    total_prayers_received
)
SELECT 
    u.id,
    'general',
    'active',
    NOW() - INTERVAL '1 hour', -- قبل ساعة
    NOW() + INTERVAL '23 hours', -- ينتهي بعد 23 ساعة
    3 -- 3 أشخاص دعوا له
FROM users u
WHERE u.full_name = 'أحمد محمد العلي'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 🕊️ طلب دعاء لمتوفى
INSERT INTO prayer_requests (
    requester_id, 
    prayer_type, 
    deceased_name,
    deceased_mother_name,
    relation,
    status, 
    created_at,
    total_prayers_received
)
SELECT 
    u.id,
    'deceased',
    'عبدالله محمد',
    'زينب',
    'أب',
    'active',
    NOW() - INTERVAL '30 minutes',
    5
FROM users u
WHERE u.full_name = 'محمد علي حسن'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 👑 إضافة مستخدم إداري (للاختبار)
-- ملاحظة: في الإنتاج، استخدم بريد إلكتروني حقيقي
INSERT INTO admin_users (user_id, role)
SELECT id, 'super_admin'
FROM users
WHERE full_name = 'أحمد محمد العلي'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ✅ انتهى إدخال البيانات التجريبية
-- ============================================================================