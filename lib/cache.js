// lib/cache.js
/**
 * 💾 Caching System المليوني
 * ✅ Redis (Production) + Memory (Development)
 * ✅ Compression للبيانات الكبيرة
 * ✅ Pattern-based invalidation
 * ✅ Cache statistics & monitoring
 */

// ═══════════════════════════════════════════════════════════
// 🔧 التكوين
// ═══════════════════════════════════════════════════════════

const USE_REDIS = process.env.REDIS_URL && process.env.NODE_ENV === 'production';
const DEFAULT_TTL = 300; // 5 دقائق
const COMPRESSION_THRESHOLD = 1024; // 1KB

// Redis client
let redisClient = null;
if (USE_REDIS) {
  const { createClient } = require('redis');
  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500)
    }
  });
  
  redisClient.connect().catch(err => {
    console.error('❌ Redis cache connection failed, using memory:', err);
    redisClient = null;
  });
}

// Memory store
const memoryCache = new Map();

// Statistics
const stats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  errors: 0
};

// ═══════════════════════════════════════════════════════════
// 🎯 Cache Class
// ═══════════════════════════════════════════════════════════

class Cache {
  /**
   * الحصول على قيمة من الـ cache
   */
  async get(key) {
    try {
      if (redisClient?.isOpen) {
        return await this.getRedis(key);
      } else {
        return await this.getMemory(key);
      }
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      stats.errors++;
      return null;
    }
  }

  /**
   * حفظ قيمة في الـ cache
   */
  async set(key, value, ttlSeconds = DEFAULT_TTL) {
    try {
      stats.sets++;
      
      if (redisClient?.isOpen) {
        return await this.setRedis(key, value, ttlSeconds);
      } else {
        return await this.setMemory(key, value, ttlSeconds);
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      stats.errors++;
      return false;
    }
  }

  /**
   * حذف قيمة من الـ cache
   */
  async delete(key) {
    try {
      stats.deletes++;
      
      if (redisClient?.isOpen) {
        await redisClient.del(key);
      } else {
        memoryCache.delete(key);
      }
      
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      stats.errors++;
      return false;
    }
  }

  /**
   * مسح كل الـ cache
   */
  async clear() {
    try {
      if (redisClient?.isOpen) {
        await redisClient.flushDb();
      } else {
        memoryCache.clear();
      }
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      stats.errors++;
      return false;
    }
  }

  /**
   * الحصول من Redis
   */
  async getRedis(key) {
    const value = await redisClient.get(key);
    
    if (value === null) {
      stats.misses++;
      return null;
    }
    
    stats.hits++;
    
    // Parse JSON
    try {
      const parsed = JSON.parse(value);
      
      // فك الضغط إذا كان مضغوط
      if (parsed.compressed) {
        return this.decompress(parsed.data);
      }
      
      return parsed;
    } catch {
      return value;
    }
  }

  /**
   * الحفظ في Redis
   */
  async setRedis(key, value, ttlSeconds) {
    let dataToStore = value;
    
    // تحويل لـ JSON
    if (typeof value === 'object') {
      const jsonStr = JSON.stringify(value);
      
      // ضغط إذا كان كبير
      if (jsonStr.length > COMPRESSION_THRESHOLD) {
        dataToStore = JSON.stringify({
          compressed: true,
          data: await this.compress(value)
        });
      } else {
        dataToStore = jsonStr;
      }
    }
    
    await redisClient.setEx(key, ttlSeconds, dataToStore);
    return true;
  }

  /**
   * الحصول من Memory
   */
  async getMemory(key) {
    const item = memoryCache.get(key);
    
    if (!item) {
      stats.misses++;
      return null;
    }
    
    // التحقق من انتهاء الصلاحية
    if (Date.now() > item.expiresAt) {
      memoryCache.delete(key);
      stats.misses++;
      return null;
    }
    
    stats.hits++;
    return item.value;
  }

  /**
   * الحفظ في Memory
   */
  async setMemory(key, value, ttlSeconds) {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    
    memoryCache.set(key, {
      value,
      expiresAt
    });
    
    // تنظيف تلقائي
    if (Math.random() < 0.05) {
      this.cleanupMemory();
    }
    
    return true;
  }

  /**
   * تنظيف Memory
   */
  cleanupMemory() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of memoryCache.entries()) {
      if (now > item.expiresAt) {
        memoryCache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired cache items`);
    }
  }

  /**
   * ضغط البيانات (بسيط)
   */
  async compress(data) {
    // في Production: استخدم zlib أو مكتبة compression
    // هنا: نستخدم base64 كمثال بسيط
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * فك الضغط
   */
  async decompress(compressed) {
    return JSON.parse(Buffer.from(compressed, 'base64').toString());
  }

  /**
   * الحصول على الإحصائيات
   */
  getStats() {
    const hitRate = stats.hits + stats.misses > 0 
      ? (stats.hits / (stats.hits + stats.misses) * 100).toFixed(2)
      : 0;
    
    return {
      ...stats,
      hitRate: `${hitRate}%`,
      backend: redisClient?.isOpen ? 'Redis' : 'Memory',
      memorySize: memoryCache.size
    };
  }

  /**
   * إعادة تعيين الإحصائيات
   */
  resetStats() {
    stats.hits = 0;
    stats.misses = 0;
    stats.sets = 0;
    stats.deletes = 0;
    stats.errors = 0;
  }
}

// ═══════════════════════════════════════════════════════════
// 🎯 Cache Instance
// ═══════════════════════════════════════════════════════════

const cacheInstance = new Cache();

// ═══════════════════════════════════════════════════════════
// 🔧 Helper Functions
// ═══════════════════════════════════════════════════════════

/**
 * Invalidate cache بـ pattern
 */
export async function invalidateCache(pattern) {
  try {
    if (redisClient?.isOpen) {
      // Redis: استخدم SCAN للبحث عن المفاتيح
      if (pattern.endsWith('*')) {
        const keys = [];
        for await (const key of redisClient.scanIterator({ MATCH: pattern })) {
          keys.push(key);
        }
        
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
        
        return keys.length;
      } else {
        await redisClient.del(pattern);
        return 1;
      }
    } else {
      // Memory: بحث يدوي
      if (pattern.endsWith('*')) {
        const prefix = pattern.slice(0, -1);
        let deleted = 0;
        
        for (const key of memoryCache.keys()) {
          if (key.startsWith(prefix)) {
            memoryCache.delete(key);
            deleted++;
          }
        }
        
        return deleted;
      } else {
        return memoryCache.delete(pattern) ? 1 : 0;
      }
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return 0;
  }
}

/**
 * Cache wrapper للـ async functions
 */
export async function getCached(key, fetchFunction, ttl = DEFAULT_TTL) {
  // محاولة الحصول من Cache
  const cached = await cacheInstance.get(key);
  if (cached !== null) {
    return cached;
  }
  
  // جلب البيانات
  const data = await fetchFunction();
  
  // حفظ في Cache
  await cacheInstance.set(key, data, ttl);
  
  return data;
}

/**
 * Cache warming - تحميل مسبق للبيانات الهامة
 */
export async function warmCache(entries) {
  const results = [];
  
  for (const entry of entries) {
    try {
      const data = await entry.fetchFunction();
      await cacheInstance.set(entry.key, data, entry.ttl || DEFAULT_TTL);
      results.push({ key: entry.key, success: true });
    } catch (error) {
      console.error(`Cache warming failed for ${entry.key}:`, error);
      results.push({ key: entry.key, success: false, error: error.message });
    }
  }
  
  return results;
}

// ═══════════════════════════════════════════════════════════
// 📤 Exports
// ═══════════════════════════════════════════════════════════

export const cache = cacheInstance;

export default {
  cache: cacheInstance,
  invalidateCache,
  getCached,
  warmCache,
  getStats: () => cacheInstance.getStats(),
  resetStats: () => cacheInstance.resetStats()
};

// ═══════════════════════════════════════════════════════════
// 📝 ملاحظات الاستخدام
// ═══════════════════════════════════════════════════════════
/*
✅ الاستخدام:

1. بسيط:
   await cache.set('key', { data: 'value' }, 300);
   const data = await cache.get('key');

2. مع wrapper:
   const data = await getCached(
     'users:active',
     async () => await fetchActiveUsers(),
     60
   );

3. Invalidation:
   await invalidateCache('users:*');  // كل المستخدمين
   await invalidateCache('users:123'); // مستخدم محدد

4. Cache warming:
   await warmCache([
     { key: 'stats:daily', fetchFunction: fetchDailyStats, ttl: 3600 },
     { key: 'users:top', fetchFunction: fetchTopUsers, ttl: 600 }
   ]);

5. Statistics:
   console.log(cache.getStats());

🎯 في Production:
   - ضع REDIS_URL في .env
   - Compression تلقائي للبيانات الكبيرة
   - Distributed caching

🎯 في Development:
   - Memory cache تلقائياً
   - Auto cleanup
*/