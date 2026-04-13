export async function registerServiceWorker() {
  if (typeof window === 'undefined') return null
  if (!('serviceWorker' in navigator)) return null

  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    return reg
  } catch {
    return null
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export async function subscribeToNotifications() {
  const reg = await registerServiceWorker()
  if (!reg) return null

  const granted = await requestNotificationPermission()
  if (!granted) return null

  return true
}

export function sendLocalNotification(title: string, body: string, url = '/') {
  if (typeof window === 'undefined') return
  if (Notification.permission !== 'granted') return

  const notification = new Notification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  })

  notification.onclick = () => {
    window.focus()
    window.location.href = url
    notification.close()
  }
}
