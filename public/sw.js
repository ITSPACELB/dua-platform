// ============================================================================
// 🔧 Service Worker - منصة يُجيب
// ============================================================================

const CACHE_NAME = 'yojeeb-v1.0.0';
const RUNTIME_CACHE = 'yojeeb-runtime';

// ============================================================================
// 📦 الملفات المطلوب تخزينها مسبقاً
// ============================================================================
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// ============================================================================
// 📥 التثبيت - تخزين الملفات الأساسية
// ============================================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ============================================================================
// 🔄 التفعيل - حذف الملفات القديمة
// ============================================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
          .map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// ============================================================================
// 🌐 استراتيجية Fetch - Network First مع Fallback للـ Cache
// ============================================================================
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات non-GET
  if (event.request.method !== 'GET') return;

  // تجاهل طلبات chrome-extension
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.open(RUNTIME_CACHE).then(cache => {
      return fetch(event.request)
        .then(response => {
          // حفظ النسخة الجديدة في الـ cache
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // في حالة عدم توفر الإنترنت، استخدم الـ cache
          return cache.match(event.request);
        });
    })
  );
});

// ============================================================================
// 🔔 معالجة الإشعارات
// ============================================================================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'لديك طلبات دعاء جديدة',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    tag: data.tag || 'default',
    data: {
      url: data.url || '/'
    },
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'منصة الدعاء الجماعي',
      options
    )
  );
});

// ============================================================================
// 👆 معالجة النقر على الإشعار
// ============================================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // إذا كان التطبيق مفتوحاً، انتقل إليه
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // وإلا افتح نافذة جديدة
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ============================================================================
// 📨 معالجة رسائل من التطبيق
// ============================================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});