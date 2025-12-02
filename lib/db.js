import { Pool } from 'pg'
import dotenv from 'dotenv'

// قراءة .env.local
dotenv.config({ path: '.env.local' })

// تحويل DATABASE_URL إلى مكونات منفصلة
const databaseUrl = process.env.DATABASE_URL
let config = {}

if (databaseUrl) {
  // استخراج المعلومات من URL
  const url = new URL(databaseUrl)
  config = {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1), // إزالة /
    user: url.username,
    password: url.password, // ✅ هذا string تلقائياً
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
} else {
  // Fallback: استخدام متغيرات منفصلة
  config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD), // ✅ تحويل صريح
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
}

// إنشاء Pool
const pool = new Pool(config)

// التعامل مع أخطاء الاتصال
pool.on('error', (err) => {
  console.error('خطأ غير متوقع في قاعدة البيانات:', err)
})

// ✅ إصلاح: تعيين encoding عند كل اتصال
pool.on('connect', (client) => {
  client.query('SET client_encoding TO UTF8')
})

// دالة مساعدة لتنفيذ الاستعلامات
export async function query(text, params) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    // console.log('استعلام نُفذ:', { text: text.substring(0, 100), duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('خطأ في الاستعلام:', { text: text.substring(0, 100), error: error.message })
    throw error
  }
}

// دالة للحصول على client للمعاملات
export async function getClient() {
  const client = await pool.connect()
  
  // ✅ تعيين encoding للـ client
  await client.query('SET client_encoding TO UTF8')
  
  const query = client.query
  const release = client.release

  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!')
  }, 5000)

  client.release = () => {
    clearTimeout(timeout)
    client.query = query
    client.release = release
    return release.apply(client)
  }

  return client
}

export default pool