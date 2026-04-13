self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  const options = {
    body: data.body || 'New update from GradeOrNot',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'view', title: 'View', icon: '/icon-192.png' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'GradeOrNot', options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  if (event.action === 'dismiss') return
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  )
})

self.addEventListener('install', e => e.waitUntil(self.skipWaiting()))
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))
