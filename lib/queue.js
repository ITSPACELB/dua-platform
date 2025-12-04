// ════════════════════════════════════════════════════════════
// 🎯 Background Jobs Queue - Smart Fallback Strategy
// ════════════════════════════════════════════════════════════
// يعمل مع BullMQ (Contabo) ← معالجة خلفية احترافية
// يعمل بدون BullMQ (محلياً) ← تنفيذ مباشر
// ════════════════════════════════════════════════════════════

let Queue, Worker;
let queues = {};
let workers = {};
let isQueueAvailable = false;

// ════════════════════════════════════════════════════════════
// 🔧 محاولة تهيئة BullMQ
// ════════════════════════════════════════════════════════════
async function initializeQueue() {
  // إذا لا يوجد REDIS_URL → نعمل بدون Queue
  if (!process.env.REDIS_URL) {
    console.log('⚠️  REDIS_URL not found - working without background jobs');
    return;
  }

  try {
    // محاولة استيراد BullMQ
    const bullmq = require('bullmq');
    Queue = bullmq.Queue;
    Worker = bullmq.Worker;
    
    isQueueAvailable = true;
    console.log('✅ BullMQ initialized');
  } catch (error) {
    isQueueAvailable = false;
    console.log('⚠️  BullMQ not available:', error.message);
    console.log('→ Jobs will execute immediately (no background processing)');
  }
}

// تهيئة عند بدء التشغيل
initializeQueue();

// ════════════════════════════════════════════════════════════
// 📦 إنشاء أو جلب Queue
// ════════════════════════════════════════════════════════════
function getQueue(name) {
  if (!isQueueAvailable) return null;
  
  if (!queues[name]) {
    queues[name] = new Queue(name, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          age: 24 * 3600, // احفظ 24 ساعة
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // احفظ 7 أيام
        },
      },
    });
    
    console.log(`✅ Queue created: ${name}`);
  }
  
  return queues[name];
}

// ════════════════════════════════════════════════════════════
// ⚙️ إضافة Job للـ Queue
// ════════════════════════════════════════════════════════════
/**
 * إضافة مهمة للمعالجة الخلفية
 * 
 * @param {string} queueName - اسم الـ queue
 * @param {string} jobName - اسم المهمة
 * @param {object} data - البيانات
 * @param {function} immediateHandler - دالة تنفيذ فورية (إذا Queue غير متاح)
 * @param {object} options - خيارات إضافية
 */
export async function addJob(queueName, jobName, data, immediateHandler, options = {}) {
  // إذا Queue متاح → أضف للـ queue
  if (isQueueAvailable) {
    try {
      const queue = getQueue(queueName);
      if (queue) {
        const job = await queue.add(jobName, data, {
          priority: options.priority || 1,
          delay: options.delay || 0,
          ...options,
        });
        
        console.log(`✅ Job added to queue: ${queueName}/${jobName} (ID: ${job.id})`);
        return { success: true, jobId: job.id, queued: true };
      }
    } catch (error) {
      console.error(`❌ Error adding job to queue: ${error.message}`);
      console.log('→ Falling back to immediate execution');
    }
  }

  // Fallback: تنفيذ فوري
  if (immediateHandler && typeof immediateHandler === 'function') {
    console.log(`⚠️  Executing immediately: ${queueName}/${jobName}`);
    try {
      const result = await immediateHandler(data);
      return { success: true, result, queued: false, immediate: true };
    } catch (error) {
      console.error(`❌ Immediate execution error: ${error.message}`);
      return { success: false, error: error.message, queued: false };
    }
  }

  return { success: false, error: 'No handler available', queued: false };
}

// ════════════════════════════════════════════════════════════
// 🔄 تسجيل Worker (معالج المهام)
// ════════════════════════════════════════════════════════════
/**
 * تسجيل worker لمعالجة مهام Queue معينة
 * 
 * @param {string} queueName - اسم الـ queue
 * @param {function} processor - دالة معالجة المهام
 */
export function registerWorker(queueName, processor) {
  if (!isQueueAvailable) {
    console.log(`⚠️  Worker not registered (Queue unavailable): ${queueName}`);
    return null;
  }

  if (workers[queueName]) {
    console.log(`⚠️  Worker already registered: ${queueName}`);
    return workers[queueName];
  }

  try {
    const worker = new Worker(queueName, processor, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      concurrency: 5, // معالجة 5 مهام متزامنة
    });

    // Listeners
    worker.on('completed', (job) => {
      console.log(`✅ Job completed: ${queueName}/${job.name} (ID: ${job.id})`);
    });

    worker.on('failed', (job, err) => {
      console.error(`❌ Job failed: ${queueName}/${job.name} (ID: ${job.id})`, err.message);
    });

    worker.on('error', (err) => {
      console.error(`❌ Worker error (${queueName}):`, err.message);
    });

    workers[queueName] = worker;
    console.log(`✅ Worker registered: ${queueName}`);
    
    return worker;
  } catch (error) {
    console.error(`❌ Error registering worker: ${error.message}`);
    return null;
  }
}

// ════════════════════════════════════════════════════════════
// 📊 إحصائيات Queue
// ════════════════════════════════════════════════════════════
export async function getQueueStats(queueName) {
  if (!isQueueAvailable) {
    return {
      available: false,
      message: 'Queue system not available'
    };
  }

  try {
    const queue = getQueue(queueName);
    if (!queue) {
      return { available: false, message: 'Queue not found' };
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      available: true,
      queueName,
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  } catch (error) {
    return {
      available: false,
      error: error.message
    };
  }
}

// ════════════════════════════════════════════════════════════
// 🗑️ تنظيف المهام القديمة
// ════════════════════════════════════════════════════════════
export async function cleanQueue(queueName, grace = 24 * 3600 * 1000) {
  if (!isQueueAvailable) return { success: false };

  try {
    const queue = getQueue(queueName);
    if (!queue) return { success: false };

    await queue.clean(grace, 1000, 'completed');
    await queue.clean(7 * 24 * 3600 * 1000, 1000, 'failed');
    
    console.log(`🗑️  Queue cleaned: ${queueName}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Queue clean error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ════════════════════════════════════════════════════════════
// 🔍 التحقق من توفر Queue
// ════════════════════════════════════════════════════════════
export function isQueueSystemAvailable() {
  return isQueueAvailable;
}

// ════════════════════════════════════════════════════════════
// 🔌 إغلاق كل الـ Queues والـ Workers
// ════════════════════════════════════════════════════════════
export async function closeAllQueues() {
  console.log('🔌 Closing queues and workers...');

  // إغلاق Workers
  for (const [name, worker] of Object.entries(workers)) {
    try {
      await worker.close();
      console.log(`✅ Worker closed: ${name}`);
    } catch (error) {
      console.error(`❌ Error closing worker ${name}:`, error.message);
    }
  }

  // إغلاق Queues
  for (const [name, queue] of Object.entries(queues)) {
    try {
      await queue.close();
      console.log(`✅ Queue closed: ${name}`);
    } catch (error) {
      console.error(`❌ Error closing queue ${name}:`, error.message);
    }
  }

  queues = {};
  workers = {};
  console.log('👋 All queues and workers closed');
}

// ════════════════════════════════════════════════════════════
// 📝 ملاحظات مهمة
// ════════════════════════════════════════════════════════════
/*
✅ يعمل مع BullMQ (production)
✅ يعمل بدون BullMQ (development)
✅ Smart Fallback Strategy
✅ Error handling شامل
✅ Auto-retry (3 محاولات)
✅ Concurrency (5 متزامنة)
✅ Job cleanup تلقائي

🎯 الاستخدام:

// إضافة job:
import { addJob } from '@/lib/queue';

await addJob(
  'badge-updates',           // اسم الـ queue
  'update-user-badge',       // اسم المهمة
  { userId: 123 },           // البيانات
  async (data) => {          // Fallback handler (تنفيذ فوري)
    return await updateBadge(data.userId);
  },
  { priority: 1 }            // خيارات
);

// تسجيل worker:
import { registerWorker } from '@/lib/queue';

registerWorker('badge-updates', async (job) => {
  const { userId } = job.data;
  await updateBadge(userId);
  return { success: true };
});

🔧 على Contabo:
.env:
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

→ معالجة خلفية احترافية

💻 محلياً:
لا REDIS_URL
→ تنفيذ فوري مباشر
*/
// ════════════════════════════════════════════════════════════
// 📊 الحصول على عدد المهام (لـ Cron APIs)
// ════════════════════════════════════════════════════════════
export async function getJobCounts(queueName) {
  if (!isQueueAvailable) {
    return {
      available: false,
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      total: 0
    };
  }

  try {
    const queue = getQueue(queueName);
    if (!queue) {
      return {
        available: false,
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        total: 0
      };
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      available: true,
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  } catch (error) {
    console.error('Error getting job counts:', error);
    return {
      available: false,
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      total: 0
    };
  }
}
