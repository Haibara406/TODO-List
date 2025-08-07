<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'max-w-sm w-full rounded-lg shadow-lg border p-4 transition-all duration-300',
            getNotificationClasses(notification.type)
          ]"
        >
          <div class="flex items-start space-x-3">
            <!-- 图标 -->
            <div class="flex-shrink-0">
              <component 
                :is="getNotificationIcon(notification.type)"
                :class="getIconClasses(notification.type)"
              />
            </div>
            
            <!-- 内容 -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium">
                {{ notification.message }}
              </p>
              <p 
                v-if="notification.description"
                class="mt-1 text-sm opacity-75"
              >
                {{ notification.description }}
              </p>
              
              <!-- 进度条 -->
              <div 
                v-if="notification.type === 'progress'"
                class="mt-2"
              >
                <div class="flex items-center justify-between text-xs mb-1">
                  <span>进度</span>
                  <span>{{ notification.progress }}%</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    :style="{ width: notification.progress + '%' }"
                    class="bg-current h-2 rounded-full transition-all duration-300"
                  ></div>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div 
                v-if="notification.actions && notification.actions.length > 0"
                class="mt-3 flex items-center space-x-2"
              >
                <button
                  v-for="action in notification.actions"
                  :key="action.label"
                  @click="handleAction(notification, action)"
                  class="px-3 py-1 text-xs rounded border border-current hover:bg-current hover:text-white transition-colors"
                >
                  {{ action.label }}
                </button>
              </div>
            </div>
            
            <!-- 关闭按钮 -->
            <button
              v-if="!notification.persistent"
              @click="removeNotification(notification.id)"
              class="flex-shrink-0 p-1 rounded hover:bg-black hover:bg-opacity-10 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script>
import { computed } from 'vue'
import { useNotifications } from '../composables/useNotifications'

export default {
  name: 'NotificationSystem',
  setup() {
    const { notifications, removeNotification } = useNotifications()
    
    // 只显示最近的5个通知
    const visibleNotifications = computed(() => 
      notifications.value.slice(-5)
    )
    
    function getNotificationClasses(type) {
      const baseClasses = 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
      
      switch (type) {
        case 'success':
          return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
        case 'error':
          return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        case 'warning':
          return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
        case 'progress':
          return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
        default:
          return baseClasses
      }
    }
    
    function getIconClasses(type) {
      const baseClasses = 'w-5 h-5'
      
      switch (type) {
        case 'success':
          return `${baseClasses} text-green-500`
        case 'error':
          return `${baseClasses} text-red-500`
        case 'warning':
          return `${baseClasses} text-yellow-500`
        case 'progress':
          return `${baseClasses} text-blue-500`
        default:
          return `${baseClasses} text-gray-500`
      }
    }
    
    function getNotificationIcon(type) {
      switch (type) {
        case 'success':
          return 'CheckIcon'
        case 'error':
          return 'XCircleIcon'
        case 'warning':
          return 'ExclamationIcon'
        case 'progress':
          return 'ClockIcon'
        default:
          return 'InformationIcon'
      }
    }
    
    function handleAction(notification, action) {
      if (action.handler) {
        action.handler(notification)
      }
      
      if (action.close !== false) {
        removeNotification(notification.id)
      }
    }
    
    return {
      notifications: visibleNotifications,
      removeNotification,
      getNotificationClasses,
      getIconClasses,
      getNotificationIcon,
      handleAction
    }
  },
  components: {
    // 图标组件
    CheckIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      `
    },
    XCircleIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      `
    },
    ExclamationIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
      `
    },
    ClockIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      `
    },
    InformationIcon: {
      template: `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      `
    }
  }
}
</script>

<style scoped>
/* 通知动画 */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>