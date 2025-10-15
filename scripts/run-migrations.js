const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  // معلومات الاتصال من DATABASE_URL
  const databaseUrl = 'postgresql://dua_user:t8qK6pvzeOl1Il7C8lb2nzdepmat@173.249.63.194:5432/dua_platform';
  
  // إنشاء connection pool
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: false // غيّر إلى true إذا كان السيرفر يتطلب SSL
  });

  console.log('🔗 جاري الاتصال بقاعدة البيانات...\n');

  // قائمة الـ migrations
  const migrations = [
    { file: '003_add_profile_fields.sql', name: 'إضافة حقول الملف الشخصي' },
    { file: '004_add_collective_prayer.sql', name: 'إضافة جداول الدعاء الجماعي' }
  ];

  try {
    // اختبار الاتصال
    await pool.query('SELECT NOW()');
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!\n');

    for (const migration of migrations) {
      const filePath = path.join(__dirname, 'migrations', migration.file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  تخطي ${migration.file} - الملف غير موجود في: ${filePath}`);
        continue;
      }

      console.log(`📄 تشغيل: ${migration.name} (${migration.file})`);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      await pool.query(sql);
      console.log(`✅ نجح: ${migration.name}\n`);
    }

    console.log('🎉 تم تطبيق جميع الـ migrations بنجاح!');
    
  } catch (error) {
    console.error('\n❌ خطأ في تطبيق migration:');
    console.error('الرسالة:', error.message);
    if (error.code) {
      console.error('الكود:', error.code);
    }
    if (error.detail) {
      console.error('التفاصيل:', error.detail);
    }
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔌 تم إغلاق الاتصال');
  }
}

runMigrations();