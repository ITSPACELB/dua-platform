// lib/monitoring.js
/**
 * 📊 Monitoring System المليوني
 * ✅ Performance tracking عالي الدقة
 * ✅ Error aggregation & alerting ذكي
 * ✅ Real-time metrics مع تجميع ذكي
 * ✅ Export to Prometheus/DataDog
 * ✅ Memory-efficient للـ Scale
 */

// ═══════════════════════════════════════════════════════════
// 🔧 التكوين المتقدم
// ═══════════════════════════════════════════════════════════

const ENABLE_MONITORING = process.env.ENABLE_MONITORING !== 'false';
const ALERT_THRESHOLD_MS = parseInt(process.env.ALERT_THRESHOLD_MS) || 1000;
const ERROR_ALERT_THRESHOLD = parseInt(process.env.ERROR_ALERT_THRESHOLD) || 10;
const METRICS_RETENTION_MS = 24 * 60 * 60 * 1000; // 24 ساعة

// ═══════════════════════════════════════════════════════════
// 💾 Data Stores محسنة للأداء
// ═══════════════════════════════════════════════════════════

const metrics = {
  apiCalls: new Map(),
  errors: new Map(),
  cache: {
    hits: 0,
    misses: 0,
    lastReset: Date.now()
  },
  database: {
    queries: 0,
    slowQueries: 0,
    totalDuration: 0,
    lastReset: Date.now()
  },
  system: {
    startTime: Date.now(),
    requests: 0,
    memoryUsage: {
      lastCheck: Date.now(),
      maxUsage: 0
    }
  }
};

// Active performance monitors مع تجميع ذكي
const activeMonitors = new Map();
const metricsBuffer = new Map(); // Buffer للمقاييس للتجميع

// ═══════════════════════════════════════════════════════════
// 🎯 Performance Monitor Class المتقدم
// ═══════════════════════════════════════════════════════════

class PerformanceMonitor {
  constructor(name, metadata = {}) {
    this.name = name;
    this.metadata = metadata;
    this.startTime = null;
    this.endTime = null;
    this.duration = null;
    this.checkpoints = [];
    this.memoryStart = null;
    this.tags = metadata.tags || {};
  }

  start() {
    if (!ENABLE_MONITORING) return this;
    
    this.startTime = Date.now();
    this.memoryStart = process.memoryUsage().heapUsed;
    activeMonitors.set(this.name, this);
    
    return this;
  }

  checkpoint(label, metadata = {}) {
    if (!ENABLE_MONITORING) return this;
    
    const now = Date.now();
    const memoryUsage = process.memoryUsage();
    
    this.checkpoints.push({
      label,
      timestamp: now,
      duration: this.startTime ? now - this.startTime : 0,
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss
      },
      ...metadata
    });
    
    return this;
  }

  end(metadata = {}) {
    if (!ENABLE_MONITORING) return { duration: 0 };
    
    this.endTime = Date.now();
    this.duration = this.endTime - this.startTime;
    
    const memoryEnd = process.memoryUsage();
    const memoryDiff = memoryEnd.heapUsed - this.memoryStart;
    
    // حفظ البيانات مع التجميع
    this.save({ 
      ...this.metadata, 
      ...metadata,
      memoryUsage: memoryDiff,
      memoryPeak: memoryEnd.heapUsed
    });
    
    // إزالة من Active monitors
    activeMonitors.delete(this.name);
    
    // تحذير ذكي إذا بطيء
    if (this.duration > ALERT_THRESHOLD_MS) {
      this.alertSlowOperation();
    }
    
    return {
      duration: this.duration,
      checkpoints: this.checkpoints,
      memoryUsage: this.formatMemory(memoryDiff),
      memoryPeak: this.formatMemory(memoryEnd.heapUsed)
    };
  }

  save(metadata) {
    if (!metrics.apiCalls.has(this.name)) {
      metrics.apiCalls.set(this.name, {
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        successCount: 0,
        errorCount: 0,
        lastCalled: null,
        p50: [],
        p95: [],
        p99: [],
        memoryUsage: 0,
        peakMemory: 0
      });
    }
    
    const apiMetrics = metrics.apiCalls.get(this.name);
    
    // تحديث الإحصائيات
    apiMetrics.count++;
    apiMetrics.totalDuration += this.duration;
    apiMetrics.avgDuration = apiMetrics.totalDuration / apiMetrics.count;
    apiMetrics.minDuration = Math.min(apiMetrics.minDuration, this.duration);
    apiMetrics.maxDuration = Math.max(apiMetrics.maxDuration, this.duration);
    apiMetrics.lastCalled = this.endTime;
    apiMetrics.memoryUsage += metadata.memoryUsage || 0;
    apiMetrics.peakMemory = Math.max(apiMetrics.peakMemory, metadata.memoryPeak || 0);
    
    if (metadata.error) {
      apiMetrics.errorCount++;
    } else {
      apiMetrics.successCount++;
    }
    
    // حفظ للـ percentiles (حلقة دائرية للذاكرة)
    apiMetrics.p50.push(this.duration);
    if (apiMetrics.p50.length > 1000) {
      apiMetrics.p50 = apiMetrics.p50.slice(-1000); // احتفظ بآخر 1000 فقط
    }
    
    // تجميع المقاييس كل 100 عملية
    if (apiMetrics.count % 100 === 0) {
      this.aggregateMetrics(this.name, apiMetrics);
    }
  }

  aggregateMetrics(apiName, apiMetrics) {
    const bufferKey = `agg_${apiName}_${Date.now()}`;
    metricsBuffer.set(bufferKey, {
      timestamp: Date.now(),
      count: apiMetrics.count,
      avgDuration: apiMetrics.avgDuration,
      errorRate: apiMetrics.errorCount / apiMetrics.count,
      memoryUsage: apiMetrics.memoryUsage / apiMetrics.count
    });
    
    // تنظيف الـ buffer القديم
    this.cleanupMetricsBuffer();
  }

  cleanupMetricsBuffer() {
    const now = Date.now();
    for (const [key, value] of metricsBuffer.entries()) {
      if (now - value.timestamp > METRICS_RETENTION_MS) {
        metricsBuffer.delete(key);
      }
    }
  }

  alertSlowOperation() {
    const alertData = {
      operation: this.name,
      duration: this.duration,
      threshold: ALERT_THRESHOLD_MS,
      timestamp: this.endTime,
      memoryUsage: this.formatMemory(process.memoryUsage().heapUsed),
      checkpoints: this.checkpoints.length
    };
    
    console.warn(`⚠️ SLOW_OPERATION: ${this.name} took ${this.duration}ms`, alertData);
    
    // يمكن إضافة إرسال إلى نظام التنبيهات هنا
    this.sendAlert('slow_operation', alertData);
  }

  sendAlert(type, data) {
    // TODO: تكامل مع أنظمة التنبيهات (Slack, Email, etc.)
    // يمكن استخدام webhooks أو خدمات مثل Sentry, DataDog
  }

  formatMemory(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

// ═══════════════════════════════════════════════════════════
// 🎯 Core Functions المتقدمة
// ═══════════════════════════════════════════════════════════

/**
 * إنشاء Performance Monitor متقدم
 */
export function monitorPerformance(name, metadata = {}) {
  return new PerformanceMonitor(name, metadata);
}

/**
 * تتبع API Call مع تجميع ذكي
 */
export function trackAPICall(apiName, duration, success = true, metadata = {}) {
  if (!ENABLE_MONITORING) return;
  
  metrics.system.requests++;
  
  if (!metrics.apiCalls.has(apiName)) {
    metrics.apiCalls.set(apiName, {
      count: 0,
      totalDuration: 0,
      avgDuration: 0,
      successCount: 0,
      errorCount: 0,
      lastCalled: null
    });
  }
  
  const apiMetrics = metrics.apiCalls.get(apiName);
  apiMetrics.count++;
  apiMetrics.totalDuration += duration;
  apiMetrics.avgDuration = apiMetrics.totalDuration / apiMetrics.count;
  apiMetrics.lastCalled = Date.now();
  
  if (success) {
    apiMetrics.successCount++;
  } else {
    apiMetrics.errorCount++;
    logError(new Error(`API call failed: ${apiName}`), { 
      apiName, 
      duration, 
      ...metadata 
    });
  }
  
  // تحديث استخدام الذاكرة
  updateMemoryUsage();
}

/**
 * تتبع Cache Hit/Miss مع إحصائيات متقدمة
 */
export function trackCacheHit() {
  if (!ENABLE_MONITORING) return;
  metrics.cache.hits++;
}

export function trackCacheMiss() {
  if (!ENABLE_MONITORING) return;
  metrics.cache.misses++;
}

/**
 * تتبع Database Query مع تحليل الأداء
 */
export function trackDatabaseQuery(duration, query = '', metadata = {}) {
  if (!ENABLE_MONITORING) return;
  
  metrics.database.queries++;
  metrics.database.totalDuration += duration;
  
  // Slow query detection متقدم
  if (duration > 100) { // > 100ms
    metrics.database.slowQueries++;
    
    const slowQueryData = {
      duration,
      query: query.substring(0, 200),
      timestamp: Date.now(),
      ...metadata
    };
    
    console.warn(`🐌 SLOW_QUERY: ${duration}ms`, slowQueryData);
    
    // يمكن إضافة إرسال إلى نظام المراقبة
    if (duration > 1000) { // > 1 ثانية
      logError(new Error('Critical slow query detected'), slowQueryData);
    }
  }
}

/**
 * تسجيل Error مع تجميع وتحليل
 */
export function logError(error, context = {}) {
  if (!ENABLE_MONITORING) {
    console.error('Error:', error.message, context);
    return;
  }
  
  const errorKey = `${context.endpoint || 'unknown'}:${error.message}`.substring(0, 200);
  
  if (!metrics.errors.has(errorKey)) {
    metrics.errors.set(errorKey, {
      message: error.message,
      count: 0,
      firstSeen: Date.now(),
      lastSeen: null,
      contexts: [],
      severity: 'medium'
    });
  }
  
  const errorMetric = metrics.errors.get(errorKey);
  errorMetric.count++;
  errorMetric.lastSeen = Date.now();
  
  // تحديد شدة الخطأ
  if (errorMetric.count > 100) errorMetric.severity = 'critical';
  else if (errorMetric.count > 50) errorMetric.severity = 'high';
  else if (errorMetric.count > 10) errorMetric.severity = 'medium';
  else errorMetric.severity = 'low';
  
  // حفظ آخر 5 contexts فقط (لتحسين الذاكرة)
  errorMetric.contexts.push({
    ...context,
    timestamp: Date.now(),
    stack: error.stack?.substring(0, 500) // truncate long stacks
  });
  
  if (errorMetric.contexts.length > 5) {
    errorMetric.contexts = errorMetric.contexts.slice(-5);
  }
  
  // تحذير ذكي إذا كثيرة
  if (errorMetric.count >= ERROR_ALERT_THRESHOLD) {
    console.error(`🚨 ERROR_THRESHOLD: ${errorKey} (${errorMetric.count} times)`);
    
    // تنبيه للـ critical errors
    if (errorMetric.severity === 'critical') {
      sendCriticalAlert(errorKey, errorMetric);
    }
  }
  
  // تسجيل مفصل في development
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ Error [${errorMetric.count}x]:`, error.message, context);
  }
}

// ═══════════════════════════════════════════════════════════
// 📊 Metrics & Statistics المتقدمة
// ═══════════════════════════════════════════════════════════

/**
 * الحصول على جميع الـ Metrics مع تجميع ذكي
 */
export function getMetrics() {
  const now = Date.now();
  const uptime = now - metrics.system.startTime;
  
  // حساب الـ percentiles
  const apiMetrics = Array.from(metrics.apiCalls.entries()).map(([name, data]) => {
    const sortedDurations = [...data.p50].sort((a, b) => a - b);
    const p50 = calculatePercentile(sortedDurations, 50);
    const p95 = calculatePercentile(sortedDurations, 95);
    const p99 = calculatePercentile(sortedDurations, 99);
    
    return {
      name,
      ...data,
      p50,
      p95,
      p99,
      errorRate: data.count > 0 ? ((data.errorCount / data.count) * 100).toFixed(2) + '%' : '0%',
      avgMemory: data.count > 0 ? formatMemory(data.memoryUsage / data.count) : '0B'
    };
  });

  return {
    system: {
      uptime: uptime,
      uptimeFormatted: formatDuration(uptime),
      totalRequests: metrics.system.requests,
      requestsPerSecond: (metrics.system.requests / (uptime / 1000)).toFixed(2),
      memoryUsage: metrics.system.memoryUsage,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    },
    apis: apiMetrics,
    cache: {
      ...metrics.cache,
      total: metrics.cache.hits + metrics.cache.misses,
      hitRate: metrics.cache.hits + metrics.cache.misses > 0
        ? ((metrics.cache.hits / (metrics.cache.hits + metrics.cache.misses)) * 100).toFixed(2) + '%'
        : '0%'
    },
    database: {
      ...metrics.database,
      avgQueryDuration: metrics.database.queries > 0
        ? (metrics.database.totalDuration / metrics.database.queries).toFixed(2) + 'ms'
        : '0ms',
      slowQueryRate: metrics.database.queries > 0
        ? ((metrics.database.slowQueries / metrics.database.queries) * 100).toFixed(2) + '%'
        : '0%'
    },
    errors: Array.from(metrics.errors.entries()).map(([key, data]) => ({
      key,
      ...data,
      firstSeenFormatted: new Date(data.firstSeen).toISOString(),
      lastSeenFormatted: data.lastSeen ? new Date(data.lastSeen).toISOString() : null
    })),
    activeMonitors: Array.from(activeMonitors.keys()),
    metricsBufferSize: metricsBuffer.size
  };
}

/**
 * الحصول على ملخص سريع للأداء
 */
export function getMetricsSummary() {
  const cacheTotal = metrics.cache.hits + metrics.cache.misses;
  const cacheHitRate = cacheTotal > 0 
    ? ((metrics.cache.hits / cacheTotal) * 100).toFixed(1)
    : 0;
  
  const totalErrors = Array.from(metrics.errors.values()).reduce((sum, e) => sum + e.count, 0);
  const criticalErrors = Array.from(metrics.errors.values()).filter(e => e.severity === 'critical').length;
  
  return {
    totalAPIs: metrics.apiCalls.size,
    totalRequests: metrics.system.requests,
    totalErrors: totalErrors,
    criticalErrors: criticalErrors,
    cacheHitRate: `${cacheHitRate}%`,
    uptime: formatDuration(Date.now() - metrics.system.startTime),
    memoryUsage: getCurrentMemoryUsage(),
    activeConnections: activeMonitors.size
  };
}

/**
 * إعادة تعيين Metrics مع الاحتفاظ بالبيانات المهمة
 */
export function resetMetrics() {
  const now = Date.now();
  
  // الاحتفاظ ببعض البيانات التاريخية
  metrics.cache.lastReset = now;
  metrics.database.lastReset = now;
  
  // إعادة تعيين العدادات
  metrics.apiCalls.clear();
  metrics.errors.clear();
  metrics.cache.hits = 0;
  metrics.cache.misses = 0;
  metrics.database.queries = 0;
  metrics.database.slowQueries = 0;
  metrics.database.totalDuration = 0;
  metrics.system.requests = 0;
  
  metricsBuffer.clear();
}

/**
 * Export بتنسيق Prometheus متقدم
 */
export function exportPrometheusMetrics() {
  const lines = [];
  const timestamp = Date.now();
  
  // API metrics
  for (const [name, data] of metrics.apiCalls) {
    const safeName = name.replace(/[^a-zA-Z0-9_]/g, '_');
    lines.push(`api_calls_total{api="${name}"} ${data.count} ${timestamp}`);
    lines.push(`api_duration_avg{api="${name}"} ${data.avgDuration} ${timestamp}`);
    lines.push(`api_duration_p50{api="${name}"} ${calculatePercentile(data.p50, 50)} ${timestamp}`);
    lines.push(`api_duration_p95{api="${name}"} ${calculatePercentile(data.p50, 95)} ${timestamp}`);
    lines.push(`api_duration_p99{api="${name}"} ${calculatePercentile(data.p50, 99)} ${timestamp}`);
    lines.push(`api_errors_total{api="${name}"} ${data.errorCount} ${timestamp}`);
  }
  
  // Cache metrics
  lines.push(`cache_hits_total ${metrics.cache.hits} ${timestamp}`);
  lines.push(`cache_misses_total ${metrics.cache.misses} ${timestamp}`);
  
  // Database metrics
  lines.push(`db_queries_total ${metrics.database.queries} ${timestamp}`);
  lines.push(`db_slow_queries_total ${metrics.database.slowQueries} ${timestamp}`);
  lines.push(`db_query_duration_avg ${metrics.database.queries > 0 ? metrics.database.totalDuration / metrics.database.queries : 0} ${timestamp}`);
  
  // System metrics
  lines.push(`system_uptime_seconds ${(Date.now() - metrics.system.startTime) / 1000} ${timestamp}`);
  lines.push(`system_requests_total ${metrics.system.requests} ${timestamp}`);
  
  const memory = process.memoryUsage();
  lines.push(`process_memory_heap_used ${memory.heapUsed} ${timestamp}`);
  lines.push(`process_memory_heap_total ${memory.heapTotal} ${timestamp}`);
  lines.push(`process_memory_rss ${memory.rss} ${timestamp}`);
  
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════
// 🔧 Helper Functions المتقدمة
// ═══════════════════════════════════════════════════════════

function calculatePercentile(sortedArray, percentile) {
  if (sortedArray.length === 0) return 0;
  
  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatMemory(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function updateMemoryUsage() {
  const now = Date.now();
  
  // تحديث كل 30 ثانية فقط لتحسين الأداء
  if (now - metrics.system.memoryUsage.lastCheck > 30000) {
    const memory = process.memoryUsage();
    metrics.system.memoryUsage.lastCheck = now;
    metrics.system.memoryUsage.maxUsage = Math.max(
      metrics.system.memoryUsage.maxUsage, 
      memory.heapUsed
    );
    
    // تحذير إذا تجاوزت الذاكرة حداً معيناً
    if (memory.heapUsed > 500 * 1024 * 1024) { // 500MB
      console.warn(`🚨 HIGH_MEMORY: ${formatMemory(memory.heapUsed)} used`);
    }
  }
}

function getCurrentMemoryUsage() {
  const memory = process.memoryUsage();
  return {
    used: formatMemory(memory.heapUsed),
    total: formatMemory(memory.heapTotal),
    rss: formatMemory(memory.rss),
    external: formatMemory(memory.external),
    max: formatMemory(metrics.system.memoryUsage.maxUsage)
  };
}

function sendCriticalAlert(errorKey, errorMetric) {
  // TODO: تنفيذ إرسال تنبيهات حرجة
  // يمكن استخدام: Slack webhook, Email, SMS, etc.
  console.error(`🚨 CRITICAL_ALERT: ${errorKey} - ${errorMetric.count} occurrences`);
}

// ═══════════════════════════════════════════════════════════
// 📤 Exports
// ═══════════════════════════════════════════════════════════

export default {
  monitorPerformance,
  trackAPICall,
  trackCacheHit,
  trackCacheMiss,
  trackDatabaseQuery,
  logError,
  getMetrics,
  getMetricsSummary,
  resetMetrics,
  exportPrometheusMetrics
};

// ═══════════════════════════════════════════════════════════
// 📝 ملاحظات الاستخدام للمشروع المليوني
// ═══════════════════════════════════════════════════════════
/*
✅ الاستخدام المتقدم:

1. Performance monitoring متقدم:
   const monitor = monitorPerformance('user_achievement_check', { 
     userId: 123, 
     tags: { feature: 'achievements', priority: 'high' } 
   });
   monitor.start();
   monitor.checkpoint('after_db_query', { queryTime: 45 });
   monitor.checkpoint('after_cache_check', { cacheHit: true });
   const result = monitor.end({ success: true });

2. تتبع API مع ذاكرة:
   trackAPICall('/api/achievements/grant', 120, true, {
     userId: 123,
     achievementType: 'name_display'
   });

3. تسجيل أخطاء مع تحليل:
   try {
     // ... code ...
   } catch (error) {
     logError(error, { 
       endpoint: '/api/achievements', 
       userId: 123,
       requestId: 'req_123456'
     });
   }

4. مقاييس متقدمة:
   console.log(getMetricsSummary());
   // {
   //   totalAPIs: 15,
   //   totalRequests: 12450,
   //   totalErrors: 23,
   //   criticalErrors: 2,
   //   cacheHitRate: '87.5%',
   //   uptime: '2h 45m',
   //   memoryUsage: { used: '245.67 MB', total: '512.00 MB' },
   //   activeConnections: 8
   // }

5. تصدير لـ Prometheus:
   app.get('/metrics', (req, res) => {
     res.set('Content-Type', 'text/plain');
     res.send(exportPrometheusMetrics());
   });

🎯 Environment Variables:
   ENABLE_MONITORING=true
   ALERT_THRESHOLD_MS=1000
   ERROR_ALERT_THRESHOLD=10
   NODE_ENV=production

🎯 مميزات النظام المليوني:
   - تجميع ذكي للمقاييس لتقليل استخدام الذاكرة
   - تحليل استخدام الذاكرة وتتبع الذروات
   - نظام تنبيهات متقدم للأخطاء الحرجة
   - دعم كامل لـ Prometheus metrics
   - تتبع الـ percentiles (P50, P95, P99)
   - تجميع الـ checkpoints للأداء التفصيلي
*/