import { Pool } from 'pg'

// إنشاء اتصال قاعدة البيانات
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // عدد الاتصالات المتزامنة
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// التعامل مع أخطاء الاتصال
pool.on('error', (err) => {
  console.error('خطأ غير متوقع في قاعدة البيانات:', err)
})

// دالة مساعدة لتنفيذ الاستعلامات
export async function query(text, params) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('استعلام نُفذ:', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('خطأ في الاستعلام:', { text, error: error.message })
    throw error
  }
}

// دالة للحصول على client للمعاملات
export async function getClient() {
  const client = await pool.connect()
  const query = client.query
  const release = client.release

  // تتبع آخر استعلام للتصحيح
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!')
  }, 5000)

  // تعديل release لتنظيف التتبع
  client.release = () => {
    clearTimeout(timeout)
    client.query = query
    client.release = release
    return release.apply(client)
  }

  return client
}

export default pool