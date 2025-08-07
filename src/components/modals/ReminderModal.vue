<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
      <!-- 头部 -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-ios-text dark:text-ios-text-dark">
          {{ note?.reminder ? '编辑提醒' : '设置提醒' }}
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          为笔记"{{ note?.title || '无标题' }}"设置提醒
        </p>
      </div>
      
      <!-- 内容 -->
      <div class="p-6 space-y-4">
        <!-- 提醒时间 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            提醒时间
          </label>
          <input
            v-model="reminderData.datetime"
            type="datetime-local"
            :min="minDateTime"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ios-accent dark:focus:ring-ios-accent-dark focus:border-transparent bg-white dark:bg-gray-700 text-ios-text dark:text-ios-text-dark"
          >
        </div>
        
        <!-- 快速选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            快速选择
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="preset in timePresets"
              :key="preset.label"
              @click="setPresetTime(preset)"
              class="p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:border-ios-accent dark:hover:border-ios-accent-dark hover:bg-ios-accent hover:bg-opacity-5 transition-colors"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>
        
        <!-- 提醒消息 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            提醒消息 (可选)
          </label>
          <textarea
            v-model="reminderData.message"
            placeholder="自定义提醒消息..."
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ios-accent dark:focus:ring-ios-accent-dark focus:border-transparent bg-white dark:bg-gray-700 text-ios-text dark:text-ios-text-dark resize-none"
          ></textarea>
        </div>
        
        <!-- 提醒方式 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            提醒方式
          </label>
          <div class="space-y-2">
            <label class="flex items-center space-x-3">
              <input
                v-model="reminderData.methods.browser"
                type="checkbox"
                class="w-4 h-4 text-ios-accent border-gray-300 rounded focus:ring-ios-accent"
              >
              <div>
                <div class="text-sm font-medium text-ios-text dark:text-ios-text-dark">
                  浏览器通知
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  显示系统通知
                </div>
              </div>
            </label>
            
            <label class="flex items-center space-x-3">
              <input
                v-model="reminderData.methods.sound"
                type="checkbox"
                class="w-4 h-4 text-ios-accent border-gray-300 rounded focus:ring-ios-accent"
              >
              <div>
                <div class="text-sm font-medium text-ios-text dark:text-ios-text-dark">
                  声音提醒
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  播放提醒音
                </div>
              </div>
            </label>
            
            <label class="flex items-center space-x-3">
              <input
                v-model="reminderData.repeat"
                type="checkbox"
                class="w-4 h-4 text-ios-accent border-gray-300 rounded focus:ring-ios-accent"
              >
              <div>
                <div class="text-sm font-medium text-ios-text dark:text-ios-text-dark">
                  重复提醒
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  每5分钟提醒一次，直到查看
                </div>
              </div>
            </label>
          </div>
        </div>
        
        <!-- 权限提示 -->
        <div 
          v-if="reminderData.methods.browser && !hasNotificationPermission"
          class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <div class="flex items-start space-x-2">
            <svg class="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <div class="text-sm text-yellow-700 dark:text-yellow-300">
              <p class="font-medium">需要通知权限</p>
              <p class="mt-1">
                浏览器通知需要获得权限。
                <button 
                  @click="requestNotificationPermission"
                  class="underline hover:no-underline"
                >
                  点击授权
                </button>
              </p>
            </div>
          </div>
        </div>
        
        <!-- 预览 -->
        <div v-if="reminderData.datetime" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex items-center space-x-2 text-sm">
            <svg class="w-4 h-4 text-ios-orange" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            <span class="text-gray-600 dark:text-gray-400">
              将在 {{ formatReminderTime() }} 提醒您
            </span>
          </div>
        </div>
      </div>
      
      <!-- 底部按钮 -->
      <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <button
            v-if="note?.reminder"
            @click="removeReminder"
            class="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            移除提醒
          </button>
        </div>
        
        <div class="flex items-center space-x-3">
          <button
            @click="$emit('close')"
            class="ios-button ios-button-secondary"
          >
            取消
          </button>
          <button
            @click="handleSetReminder"
            :disabled="!reminderData.datetime"
            class="ios-button ios-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ note?.reminder ? '更新' : '设置' }}提醒
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'

export default {
  name: 'ReminderModal',
  props: {
    note: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'set-reminder', 'remove-reminder'],
  setup(props, { emit }) {
    const reminderData = ref({
      datetime: '',
      message: '',
      methods: {
        browser: true,
        sound: false
      },
      repeat: false
    })
    
    const hasNotificationPermission = ref(false)
    
    // 最小时间（当前时间）
    const minDateTime = computed(() => {
      return dayjs().format('YYYY-MM-DDTHH:mm')
    })
    
    // 快速选择时间预设
    const timePresets = [
      {
        label: '10分钟后',
        minutes: 10
      },
      {
        label: '30分钟后',
        minutes: 30
      },
      {
        label: '1小时后',
        minutes: 60
      },
      {
        label: '今天晚上8点',
        time: () => {
          const today = dayjs()
          let target = today.hour(20).minute(0).second(0)
          if (target.isBefore(today)) {
            target = target.add(1, 'day')
          }
          return target
        }
      },
      {
        label: '明天上午9点',
        time: () => dayjs().add(1, 'day').hour(9).minute(0).second(0)
      },
      {
        label: '下周一上午9点',
        time: () => {
          const today = dayjs()
          const nextMonday = today.add(1, 'week').startOf('week').add(1, 'day')
          return nextMonday.hour(9).minute(0).second(0)
        }
      }
    ]
    
    function setPresetTime(preset) {
      let target
      
      if (preset.minutes) {
        target = dayjs().add(preset.minutes, 'minute')
      } else if (preset.time) {
        target = preset.time()
      }
      
      if (target) {
        reminderData.value.datetime = target.format('YYYY-MM-DDTHH:mm')
      }
    }
    
    function formatReminderTime() {
      if (!reminderData.value.datetime) return ''
      
      const reminderTime = dayjs(reminderData.value.datetime)
      const now = dayjs()
      
      if (reminderTime.isSame(now, 'day')) {
        return `今天 ${reminderTime.format('HH:mm')}`
      } else if (reminderTime.isSame(now.add(1, 'day'), 'day')) {
        return `明天 ${reminderTime.format('HH:mm')}`
      } else if (reminderTime.isSame(now, 'year')) {
        return reminderTime.format('MM月DD日 HH:mm')
      } else {
        return reminderTime.format('YYYY年MM月DD日 HH:mm')
      }
    }
    
    function checkNotificationPermission() {
      if ('Notification' in window) {
        hasNotificationPermission.value = Notification.permission === 'granted'
      }
    }
    
    function requestNotificationPermission() {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          hasNotificationPermission.value = permission === 'granted'
        })
      }
    }
    
    function handleSetReminder() {
      if (!reminderData.value.datetime) return
      
      const reminderTime = dayjs(reminderData.value.datetime)
      if (reminderTime.isBefore(dayjs())) {
        alert('提醒时间不能早于当前时间')
        return
      }
      
      emit('set-reminder', reminderData.value)
    }
    
    function removeReminder() {
      if (confirm('确定要移除这个提醒吗？')) {
        emit('remove-reminder')
        emit('close')
      }
    }
    
    // 初始化
    function initReminderData() {
      if (props.note.reminder) {
        reminderData.value = {
          datetime: props.note.reminder.datetime || '',
          message: props.note.reminder.message || '',
          methods: {
            browser: props.note.reminder.methods?.browser ?? true,
            sound: props.note.reminder.methods?.sound ?? false
          },
          repeat: props.note.reminder.repeat || false
        }
      }
    }
    
    onMounted(() => {
      checkNotificationPermission()
      initReminderData()
    })
    
    return {
      reminderData,
      hasNotificationPermission,
      minDateTime,
      timePresets,
      setPresetTime,
      formatReminderTime,
      requestNotificationPermission,
      handleSetReminder,
      removeReminder
    }
  }
}
</script>