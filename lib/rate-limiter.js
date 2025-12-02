// ════════════════════════════════════════════════════════════
// 🎯 Rate Limiting - حماية من الاستخدام المفرط
// ════════════════════════════════════════════════════════════
// يمنع المستخدمين من إرسال طلبات كثيرة جداً
// ════════════════════════════════════════════════════════════

import { incrementCounter, isRedisConnected } from './cache';

// ════════════════════════════════════════════════════════════
// 💾 تخزين مؤقت في الذاكرة (Fallback)
// ════════════════════════════════════════════════════════════
const memoryStore = new Map();

// تنظيف الذاكرة كل 10 دقائق
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of memoryStore.entries()) {
    if (now > data.resetTime) {
      memoryStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

// ════════════════════════════════════════════════════════════
// 🛡️ Rate Limiter الرئيسي
// ════════════════════════════════════════════════════════════
/**
 * التحقق من حد الطلبات للمستخدم/IP
 * 
 * @param {string} identifier - معرف المستخدم (userId أو IP)
 * @param {string} action - نوع العملية (مثل: 'api-call', 'prayer-request')
 * @param {number} limit - الحد الأقصى للطلبات
 * @param {number} windowSeconds - النافذة الزمنية بالثواني
 * @returns {object} - { allowed, remaining, resetTime }
 */
export async function checkRateLimit(identifier, action, limit = 100, windowSeconds = 60) {
  const key = `ratelimit:${action}:${identifier}`;
  
  // إذا Redis متاح → استخدمه
  if (isRedisConnected()) {
    try {
      const count = await incrementCounter(key, windowSeconds);
      
      if (count === null) {
        // فشل Redis → استخدم Memory
        return checkMemoryRateLimit(key, limit, windowSeconds);
      }
      
      const allowed = count <= limit;
      const remaining = Math.max(0, limit - count);
      
      return {
        allowed,
        remaining,
        limit,
        resetTime: Date.now() + (windowSeconds * 1000),
        count,
      };
    } catch (error) {
      console.error('Rate limit Redis error:', error.message);
      // Fallback للذاكرة
      return checkMemoryRateLimit(key, limit, windowSeconds);
    }
  }
  
  // Redis غير متاح → استخدم الذاكرة
  return checkMemoryRateLimit(key, limit, windowSeconds);
}

// ════════════════════════════════════════════════════════════
// 💾 Rate Limiting في الذاكرة (Fallback)
// ════════════════════════════════════════════════════════════
function checkMemoryRateLimit(key, limit, windowSeconds) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  
  if (!memoryStore.has(key)) {
    memoryStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    
    return {
      allowed: true,
      remaining: limit - 1,
      limit,
      resetTime: now + windowMs,
      count: 1,
      source: 'memory',
    };
  }
  
  const data = memoryStore.get(key);
  
  // إذا انتهت النافذة → أعد التعيين
  if (now > data.resetTime) {
    memoryStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    
    return {
      allowed: true,
      remaining: limit - 1,
      limit,
      resetTime: now + windowMs,
      count: 1,
      source: 'memory',
    };
  }
  
  // زيادة العداد
  data.count++;
  const allowed = data.count <= limit;
  const remaining = Math.max(0, limit - data.count);
  
  return {
    allowed,
    remaining,
    limit,
    resetTime: data.resetTime,
    count: data.count,
    source: 'memory',
  };
}

// ════════════════════════════════════════════════════════════
// 🎯 Middleware للـ Rate Limiting
// ════════════════════════════════════════════════════════════
/**
 * Middleware لتطبيق rate limiting على API routes
 */
export function rateLimitMiddleware(options = {}) {
  const {
    limit = 100,
    windowSeconds = 60,
    action = 'api-call',
    getIdentifier = (req) => {
      // محاولة جلب userId من JWT
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        try {
          const token = authHeader.replace('Bearer ', '');
          const decoded = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString()
          );
          return `user:${decoded.userId}`;
        } catch (error) {
          // فشل JWT → استخدم IP
        }
      }
      
      // استخدم IP address
      return req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
    },
  } = options;
  
  return async (handler) => {
    return async (req, ...args) => {
      const identifier = getIdentifier(req);
      const result = await checkRateLimit(identifier, action, limit, windowSeconds);
      
      // إذا تجاوز الحد
      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
        
        return new Response(
          JSON.stringify({
            error: 'Too many requests',
            message: 'لقد تجاوزت الحد المسموح من الطلبات. الرجاء المحاولة لاحقاً.',
            retryAfter,
            limit: result.limit,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': result.limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
              'Retry-After': retryAfter.toString(),
            },
          }
        );
      }
      
      // السماح بالطلب
      const response = await handler(req, ...args);
      
      // إضافة headers للـ rate limit
      if (response && response.headers) {
        response.headers.set('X-RateLimit-Limit', result.limit.toString());
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
        response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
      }
      
      return response;
    };
  };
}

// ════════════════════════════════════════════════════════════
// 🎯 Rate Limits محددة مسبقاً
// ════════════════════════════════════════════════════════════

// API عام: 100 طلب/دقيقة
export const generalAPILimit = {
  limit: 100,
  windowSeconds: 60,
  action: 'api-general',
};

// طلبات الدعاء: 10 طلب/ساعة
export const prayerRequestLimit = {
  limit: 10,
  windowSeconds: 3600,
  action: 'prayer-request',
};

// التسجيل/تسجيل الدخول: 5 محاولات/15 دقيقة
export const authLimit = {
  limit: 5,
  windowSeconds: 900,
  action: 'auth',
};

// الدعاء للآخرين: 100 دعوة/ساعة
export const prayForOthersLimit = {
  limit: 100,
  windowSeconds: 3600,
  action: 'pray-for-others',
};

// ════════════════════════════════════════════════════════════
// 📝 ملاحظات مهمة
// ════════════════════════════════════════════════════════════
/*
✅ يعمل مع Redis (أفضل)
✅ يعمل بدون Redis (Memory fallback)
✅ حماية من Abuse
✅ Headers للـ rate limit
✅ Retry-After header
✅ مرن (limits قابلة للتخصيص)

🎯 الاستخدام:

// في API Route:
import { rateLimitMiddleware, prayerRequestLimit } from '@/lib/rate-limiter';

export const POST = rateLimitMiddleware(prayerRequestLimit)(
  async (request) => {
    // API logic هنا
    return Response.json({ success: true });
  }
);

// استخدام مخصص:
import { checkRateLimit } from '@/lib/rate-limiter';

const result = await checkRateLimit(userId, 'custom-action', 50, 300);

if (!result.allowed) {
  return Response.json({ error: 'Too many requests' }, { status: 429 });
}

🔧 Limits المقترحة:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- API عام: 100/دقيقة
- طلبات دعاء: 10/ساعة
- Auth: 5/15 دقيقة
- دعاء للآخرين: 100/ساعة
*/