// lib/rate-limit.js
/**
 * 🛡️ Rate Limiting المليوني
 * ✅ يدعم Redis (Production) + Memory (Development)
 * ✅ Sliding window algorithm للدقة العالية
 * ✅ Distributed rate limiting للـ scale
 */

// ═══════════════════════════════════════════════════════════
// 🔧 التكوين
// ═══════════════════════════════════════════════════════════

const USE_REDIS = process.env.REDIS_URL && process.env.NODE_ENV === 'production';

// Redis client (في Production)
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
    console.error('❌ Redis connection failed, falling back to memory:', err);
    redisClient = null;
  });
}

// Memory store (Fallback + Development)
const memoryStore = new Map();

// ═══════════════════════════════════════════════════════════
// 🎯 Rate Limiter Class
// ═══════════════════════════════════════════════════════════

class RateLimiter {
  constructor(options = {}) {
    this.interval = options.interval || 60000; // 1 دقيقة
    this.uniqueTokenPerInterval = options.uniqueTokenPerInterval || 500;
    this.maxRequests = options.maxRequests || 10;
  }

  /**
   * التحقق من Rate Limit
   */
  async check(request, limit = this.maxRequests, token = 'default') {
    const identifier = this.getIdentifier(request, token);
    const now = Date.now();
    
    if (redisClient?.isOpen) {
      return await this.checkRedis(identifier, limit, now);
    } else {
      return await this.checkMemory(identifier, limit, now);
    }
  }

  /**
   * استخراج معرّف فريد (IP + Token)
   */
  getIdentifier(request, token) {
    const ip = this.getIP(request);
    return `ratelimit:${token}:${ip}`;
  }

  /**
   * استخراج IP من Request
   */
  getIP(request) {
    // Try multiple headers
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    const realIP = request.headers.get('x-real-ip');
    if (realIP) return realIP;
    
    const cfConnecting = request.headers.get('cf-connecting-ip');
    if (cfConnecting) return cfConnecting;
    
    return 'unknown';
  }

  /**
   * التحقق باستخدام Redis (Production)
   */
  async checkRedis(identifier, limit, now) {
    try {
      const key = identifier;
      const windowStart = now - this.interval;
      
      // Sliding window: نحذف الطلبات القديمة
      await redisClient.zRemRangeByScore(key, 0, windowStart);
      
      // نجلب عدد الطلبات الحالية
      const currentCount = await redisClient.zCard(key);
      
      if (currentCount >= limit) {
        const oldestRequest = await redisClient.zRange(key, 0, 0, { REV: false });
        const resetTime = oldestRequest[0] ? parseInt(oldestRequest[0]) + this.interval : now + this.interval;
        
        throw new RateLimitError(
          `Rate limit exceeded for ${identifier}`,
          limit,
          resetTime
        );
      }
      
      // نضيف الطلب الحالي
      await redisClient.zAdd(key, { score: now, value: now.toString() });
      
      // نضع expiry للـ key
      await redisClient.expire(key, Math.ceil(this.interval / 1000));
      
      return {
        success: true,
        remaining: limit - currentCount - 1,
        resetTime: now + this.interval
      };
      
    } catch (error) {
      if (error instanceof RateLimitError) throw error;
      
      // Fallback to memory on Redis error
      console.error('Redis rate limit error, falling back to memory:', error);
      return await this.checkMemory(identifier, limit, now);
    }
  }

  /**
   * التحقق باستخدام Memory (Development/Fallback)
   */
  async checkMemory(identifier, limit, now) {
    let data = memoryStore.get(identifier);
    
    if (!data) {
      data = {
        requests: [],
        resetTime: now + this.interval
      };
      memoryStore.set(identifier, data);
    }
    
    // نحذف الطلبات القديمة (sliding window)
    const windowStart = now - this.interval;
    data.requests = data.requests.filter(timestamp => timestamp > windowStart);
    
    // نتحقق من الحد
    if (data.requests.length >= limit) {
      throw new RateLimitError(
        `Rate limit exceeded for ${identifier}`,
        limit,
        data.requests[0] + this.interval
      );
    }
    
    // نضيف الطلب الحالي
    data.requests.push(now);
    data.resetTime = now + this.interval;
    
    // تنظيف تلقائي (كل 100 طلب)
    if (Math.random() < 0.01) {
      this.cleanupMemory();
    }
    
    return {
      success: true,
      remaining: limit - data.requests.length,
      resetTime: data.resetTime
    };
  }

  /**
   * تنظيف Memory Store
   */
  cleanupMemory() {
    const now = Date.now();
    for (const [key, data] of memoryStore.entries()) {
      if (data.resetTime < now) {
        memoryStore.delete(key);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// 🚨 Rate Limit Error Class
// ═══════════════════════════════════════════════════════════

class RateLimitError extends Error {
  constructor(message, limit, resetTime) {
    super(message);
    this.name = 'RateLimitError';
    this.limit = limit;
    this.resetTime = resetTime;
    this.retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  }
}

// ═══════════════════════════════════════════════════════════
// 📤 Exports
// ═══════════════════════════════════════════════════════════

/**
 * إنشاء Rate Limiter جديد
 */
export function rateLimit(options = {}) {
  return new RateLimiter(options);
}

/**
 * Middleware للـ Next.js API Routes
 */
export async function rateLimitMiddleware(request, options = {}) {
  const limiter = new RateLimiter(options);
  
  try {
    const result = await limiter.check(
      request, 
      options.limit || 10, 
      options.token || 'api'
    );
    
    return {
      success: true,
      headers: {
        'X-RateLimit-Limit': options.limit || 10,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      }
    };
    
  } catch (error) {
    if (error instanceof RateLimitError) {
      return {
        success: false,
        status: 429,
        headers: {
          'X-RateLimit-Limit': error.limit,
          'X-RateLimit-Remaining': 0,
          'X-RateLimit-Reset': new Date(error.resetTime).toISOString(),
          'Retry-After': error.retryAfter
        },
        error: {
          message: 'تم تجاوز الحد المسموح من الطلبات',
          retryAfter: error.retryAfter
        }
      };
    }
    
    throw error;
  }
}

/**
 * معلومات الاتصال
 */
export function getRateLimitInfo() {
  return {
    backend: redisClient?.isOpen ? 'Redis' : 'Memory',
    redisConnected: redisClient?.isOpen || false,
    memoryStoreSize: memoryStore.size
  };
}

export default rateLimit;

// ═══════════════════════════════════════════════════════════
// 📝 ملاحظات الاستخدام
// ═══════════════════════════════════════════════════════════
/*
✅ الاستخدام:

1. بسيط:
   const limiter = rateLimit({ interval: 60000, maxRequests: 10 });
   await limiter.check(request, 10, 'api_name');

2. مع Middleware:
   const result = await rateLimitMiddleware(request, {
     limit: 20,
     interval: 60000,
     token: 'achievements_api'
   });
   
   if (!result.success) {
     return NextResponse.json(result.error, { 
       status: 429,
       headers: result.headers 
     });
   }

3. معلومات النظام:
   console.log(getRateLimitInfo());

🎯 في Production:
   - ضع REDIS_URL في .env
   - سيتحول تلقائياً لـ Redis
   - Distributed rate limiting

🎯 في Development:
   - يستخدم Memory تلقائياً
   - سريع وبسيط
*/