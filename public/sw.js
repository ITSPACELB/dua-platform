// ============================================================================
// 🚀 Service Worker - منصة يُجيب
// ============================================================================
// الإصدار: 2.0.0
// التاريخ: 2026-01-05
// إنتاج: الغافقي
// ============================================================================

const CACHE_NAME = 'yojeeb-v2.0.0';
const OFFLINE_URL = '/offline.html';

// ============================================================================
// 📦 الملفات المراد تخزينها مسبقاً
// ============================================================================
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico'
];

// ============================================================================
// 📥 حدث التثبيت - Install Event
// ============================================================================
self.addEventListener('install', (event) => {
  console.log('🚀 [SW] Installing يُجيب Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 [SW] Pre-caching assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('✅ [SW] Installed successfully!');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ [SW] Install failed:', error);
      })
  );
});

// ============================================================================
// 🔄 حدث التفعيل - Activate Event
// ============================================================================
self.addEventListener('activate', (event) => {
  console.log('🔄 [SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('🗑️ [SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ [SW] Activated successfully!');
        return self.clients.claim();
      })
  );
});

// ============================================================================
// 🌐 حدث الجلب - Fetch Event (Network First Strategy)
// ============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل الطلبات غير HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // تجاهل طلبات API (نريدها دائماً من الشبكة)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // استراتيجية: الشبكة أولاً، ثم الـ Cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // تخزين نسخة في الـ Cache للملفات الثابتة فقط
        if (response.status === 200 && request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // إذا فشلت الشبكة، جرب الـ Cache
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // إذا كان طلب صفحة، أرجع صفحة Offline
            if (request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// ============================================================================
// 📬 حدث الإشعارات - Push Event
// ============================================================================
self.addEventListener('push', (event) => {
  console.log('📬 [SW] Push received');
  
  let data = { title: 'يُجيب', body: 'لديك إشعار جديد' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: '🤲 فتح المنصة' },
      { action: 'close', title: '❌ إغلاق' }
    ],
    dir: 'rtl',
    lang: 'ar',
    tag: 'yojeeb-notification',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ============================================================================
// 🔔 حدث النقر على الإشعار
// ============================================================================
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 [SW] Notification clicked');
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes('yojeeb.com') && 'focus' in client) {
              return client.focus();
            }
          }
          return clients.openWindow(urlToOpen);
        })
    );
  }
});

// ============================================================================
// 🔄 حدث المزامنة في الخلفية
// ============================================================================
self.addEventListener('sync', (event) => {
  console.log('🔄 [SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-prayers') {
    event.waitUntil(syncPrayers());
  }
});

async function syncPrayers() {
  console.log('🔄 [SW] Syncing offline prayers...');
}

// ============================================================================
console.log('✅ [SW] يُجيب Service Worker v2.0.0 - Loaded');
console.log('🤲 [SW] إنتاج الغافقي');
