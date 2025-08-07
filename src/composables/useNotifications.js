import { ref } from 'vue'
import { useSettingsStore } from '../stores/settings'

const notifications = ref([])
let notificationId = 0

export function useNotifications() {
  const settingsStore = useSettingsStore()
  
  function showNotification(message, type = 'info', duration = 3000, options = {}) {
    const notification = {
      id: ++notificationId,
      message,
      type, // info, success, warning, error
      duration,
      timestamp: Date.now(),
      ...options
    }
    
    notifications.value.push(notification)
    
    // 自动移除通知
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, duration)
    }
    
    // 浏览器通知
    if (settingsStore.enableNotifications && type === 'info' && options.browser) {
      showBrowserNotification(message, options)
    }
    
    return notification.id
  }
  
  function removeNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  function clearAllNotifications() {
    notifications.value = []
  }
  
  function showBrowserNotification(message, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(options.title || 'iOS备忘录', {
        body: message,
        icon: options.icon || '/note-icon.svg',
        tag: options.tag || 'ios-notes',
        ...options.browserOptions
      })
      
      // 自动关闭
      if (options.autoClose !== false) {
        setTimeout(() => {
          notification.close()
        }, options.duration || 5000)
      }
      
      return notification
    }
  }
  
  function requestNotificationPermission() {
    if ('Notification' in window) {
      return Notification.requestPermission()
    }
    return Promise.resolve('denied')
  }
  
  // 预定义通知类型
  function success(message, options = {}) {
    return showNotification(message, 'success', 3000, options)
  }
  
  function error(message, options = {}) {
    return showNotification(message, 'error', 5000, options)
  }
  
  function warning(message, options = {}) {
    return showNotification(message, 'warning', 4000, options)
  }
  
  function info(message, options = {}) {
    return showNotification(message, 'info', 3000, options)
  }
  
  // 操作通知
  function showActionNotification(message, actions = [], options = {}) {
    const notification = {
      id: ++notificationId,
      message,
      type: options.type || 'info',
      actions,
      persistent: true, // 需要手动关闭
      timestamp: Date.now(),
      ...options
    }
    
    notifications.value.push(notification)
    return notification.id
  }
  
  // 进度通知
  function showProgressNotification(message, options = {}) {
    const notification = {
      id: ++notificationId,
      message,
      type: 'progress',
      progress: options.progress || 0,
      persistent: true,
      timestamp: Date.now(),
      ...options
    }
    
    notifications.value.push(notification)
    return notification.id
  }
  
  function updateProgressNotification(id, progress, message) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.progress = progress
      if (message) {
        notification.message = message
      }
      
      // 完成时自动移除
      if (progress >= 100) {
        setTimeout(() => {
          removeNotification(id)
        }, 1000)
      }
    }
  }
  
  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    showBrowserNotification,
    requestNotificationPermission,
    success,
    error,
    warning,
    info,
    showActionNotification,
    showProgressNotification,
    updateProgressNotification
  }
}