-- ════════════════════════════════════════════════════════════
-- 🔄 Migration: إضافة حقول الملف الشخصي
-- ════════════════════════════════════════════════════════════
-- الهدف: إضافة الحقول الجديدة لجدول users
-- التاريخ: 2025-10-15
-- المرحلة: 5 - Menu & Profile Page
-- ════════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════
-- 📝 إضافة الحقول الجديدة لجدول users
-- ═══════════════════════════════════════════════════════════

ALTER TABLE users 
  -- الاسم الكامل (موجود مسبقاً غالباً، لكن نتأكد)
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
  
  -- اسم الأم (مطلوب)
  ADD COLUMN IF NOT EXISTS mother_name VARCHAR(255),
  
  -- اسم الأب (اختياري)
  ADD COLUMN IF NOT EXISTS father_name VARCHAR(255),
  
  -- البريد الإلكتروني (اختياري)
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  
  -- العمر (اختياري)
  ADD COLUMN IF NOT EXISTS age INTEGER,
  
  -- الدولة (كود الدولة، اختياري)
  ADD COLUMN IF NOT EXISTS country VARCHAR(10),
  
  -- رقم الهاتف (اختياري، بصيغة E.164)
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  
  -- تاريخ آخر تحديث للملف الشخصي
  ADD COLUMN IF NOT EXISTS profile_updated_at TIMESTAMP;

-- ═══════════════════════════════════════════════════════════
-- 📊 إضافة قيود (Constraints)
-- ═══════════════════════════════════════════════════════════

-- التأكد من أن البريد الإلكتروني فريد (إذا تم إدخاله)
ALTER TABLE users
  ADD CONSTRAINT unique_email 
  UNIQUE (email);

-- التأكد من أن رقم الهاتف فريد (إذا تم إدخاله)
ALTER TABLE users
  ADD CONSTRAINT unique_phone 
  UNIQUE (phone);

-- التأكد من أن العمر منطقي
ALTER TABLE users
  ADD CONSTRAINT valid_age 
  CHECK (age IS NULL OR (age >= 1 AND age <= 120));

-- ═══════════════════════════════════════════════════════════
-- 🔍 إضافة فهارس (Indexes) لتحسين الأداء
-- ═══════════════════════════════════════════════════════════

-- فهرس للبريد الإلكتروني (للبحث السريع)
CREATE INDEX IF NOT EXISTS idx_users_email 
  ON users(email) 
  WHERE email IS NOT NULL;

-- فهرس لرقم الهاتف (للبحث السريع)
CREATE INDEX IF NOT EXISTS idx_users_phone 
  ON users(phone) 
  WHERE phone IS NOT NULL;

-- فهرس للدولة (للإحصائيات)
CREATE INDEX IF NOT EXISTS idx_users_country 
  ON users(country) 
  WHERE country IS NOT NULL;

-- ═══════════════════════════════════════════════════════════
-- 📝 تعليقات على الأعمدة (للتوثيق)
-- ═══════════════════════════════════════════════════════════

COMMENT ON COLUMN users.full_name IS 'الاسم الكامل للمستخدم';
COMMENT ON COLUMN users.mother_name IS 'اسم الأم (مطلوب للتعريف الشرعي)';
COMMENT ON COLUMN users.father_name IS 'اسم الأب (اختياري)';
COMMENT ON COLUMN users.email IS 'البريد الإلكتروني (اختياري، فريد)';
COMMENT ON COLUMN users.age IS 'عمر المستخدم (اختياري، بين 1-120)';
COMMENT ON COLUMN users.country IS 'كود الدولة حسب ISO (مثل: SA, IQ, EG)';
COMMENT ON COLUMN users.phone IS 'رقم الهاتف بصيغة E.164 (مثل: +9647XXXXXXXXX)';
COMMENT ON COLUMN users.profile_updated_at IS 'تاريخ آخر تحديث للملف الشخصي';

-- ═══════════════════════════════════════════════════════════
-- 🔄 دالة: تحديث profile_updated_at تلقائياً
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- تحديث الوقت فقط إذا تغيرت الحقول الشخصية
  IF (
    NEW.full_name IS DISTINCT FROM OLD.full_name OR
    NEW.mother_name IS DISTINCT FROM OLD.mother_name OR
    NEW.father_name IS DISTINCT FROM OLD.father_name OR
    NEW.email IS DISTINCT FROM OLD.email OR
    NEW.age IS DISTINCT FROM OLD.age OR
    NEW.country IS DISTINCT FROM OLD.country OR
    NEW.phone IS DISTINCT FROM OLD.phone
  ) THEN
    NEW.profile_updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════
-- ⚡ Trigger: تفعيل الدالة
-- ═══════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS trigger_update_profile_timestamp ON users;

CREATE TRIGGER trigger_update_profile_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_timestamp();

-- ═══════════════════════════════════════════════════════════
-- ✅ التحقق من نجاح العملية
-- ═══════════════════════════════════════════════════════════

DO $$
BEGIN
  -- التحقق من وجود الأعمدة الجديدة
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
      AND column_name IN ('mother_name', 'father_name', 'email', 'age', 'country', 'phone')
  ) THEN
    RAISE NOTICE '✅ Migration 003: تمت إضافة حقول الملف الشخصي بنجاح';
  ELSE
    RAISE EXCEPTION '❌ Migration 003: فشل في إضافة بعض الحقول';
  END IF;
END $$;

COMMIT;

-- ════════════════════════════════════════════════════════════
-- 📝 ملاحظات للمطورين
-- ════════════════════════════════════════════════════════════
-- 1. البريد الإلكتروني ورقم الهاتف: فريدان (UNIQUE)
-- 2. العمر: يجب أن يكون بين 1-120 سنة
-- 3. الدولة: يُخزن ككود (SA, IQ, EG, إلخ)
-- 4. الهاتف: يجب أن يكون بصيغة E.164 (+countrycode...)
-- 5. profile_updated_at: يتم تحديثه تلقائياً عند أي تغيير
-- 6. جميع الحقول اختيارية ما عدا mother_name
-- ════════════════════════════════════════════════════════════