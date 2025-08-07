<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
      <!-- 头部 -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-ios-text dark:text-ios-text-dark">
          笔记信息
        </h2>
      </div>
      
      <!-- 内容 -->
      <div class="p-6 space-y-4">
        <!-- 基本信息 -->
        <div class="space-y-3">
          <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">标题</span>
            <span class="text-sm text-ios-text dark:text-ios-text-dark">
              {{ note.title || '无标题' }}
            </span>
          </div>
          
          <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">类型</span>
            <span class="text-sm text-ios-text dark:text-ios-text-dark">
              {{ getNoteTypeText() }}
            </span>
          </div>
          
          <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">创建时间</span>
            <span class="text-sm text-ios-text dark:text-ios-text-dark">
              {{ formatDate(note.createdAt) }}
            </span>
          </div>
          
          <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">更新时间</span>
            <span class="text-sm text-ios-text dark:text-ios-text-dark">
              {{ formatDate(note.updatedAt) }}
            </span>
          </div>
          
          <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">字数统计</span>
            <span class="text-sm text-ios-text dark:text-ios-text-dark">
              {{ getWordCount() }} 字
            </span>
          </div>
          
          <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">版本</span>
            <span class="text-sm text-ios-text dark:text-ios-text-dark">
              v{{ note.version || 1 }}
            </span>
          </div>
        </div>
        
        <!-- 状态标签 -->
        <div>
          <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">状态</div>
          <div class="flex flex-wrap gap-2">
            <span 
              v-if="note.isPinned"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"
            >
              📌 已置顶
            </span>
            <span 
              v-if="note.isEncrypted"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
            >
              🔒 已加密
            </span>
            <span 
              v-if="note.reminder"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200"
            >
              ⏰ 有提醒
            </span>
            <span 
              v-if="note.attachments && note.attachments.length > 0"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
            >
              📎 有附件 ({{ note.attachments.length }})
            </span>
          </div>
        </div>
        
        <!-- 清单统计 (仅清单类型) -->
        <div v-if="note.type === 'checklist' && note.checklist">
          <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">清单统计</div>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="text-lg font-semibold text-ios-text dark:text-ios-text-dark">
                {{ note.checklist.length }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">总项目</div>
            </div>
            <div class="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="text-lg font-semibold text-green-600 dark:text-green-400">
                {{ getCompletedCount() }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">已完成</div>
            </div>
          </div>
          
          <!-- 进度条 -->
          <div class="mt-3">
            <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>完成进度</span>
              <span>{{ getProgressPercentage() }}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                :style="{ width: getProgressPercentage() + '%' }"
                class="bg-green-500 h-2 rounded-full transition-all duration-300"
              ></div>
            </div>
          </div>
        </div>
        
        <!-- 文件夹信息 -->
        <div v-if="folderInfo">
          <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">所属文件夹</span>
            <div class="flex items-center space-x-2">
              <span 
                class="text-lg"
                :style="{ color: folderInfo.color }"
              >
                {{ folderInfo.icon }}
              </span>
              <span class="text-sm text-ios-text dark:text-ios-text-dark">
                {{ folderInfo.name }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 提醒信息 -->
        <div v-if="note.reminder">
          <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">提醒设置</div>
          <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div class="flex items-center space-x-2 text-sm">
              <svg class="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              <span class="text-orange-800 dark:text-orange-200">
                {{ formatReminderTime(note.reminder.datetime) }}
              </span>
            </div>
            <div v-if="note.reminder.message" class="mt-2 text-sm text-orange-700 dark:text-orange-300">
              {{ note.reminder.message }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 底部按钮 -->
      <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        <button
          @click="$emit('close')"
          class="ios-button ios-button-primary"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useNotesStore } from '../../stores/notes'
import dayjs from 'dayjs'

export default {
  name: 'NoteInfoModal',
  props: {
    note: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props) {
    const notesStore = useNotesStore()
    
    const folderInfo = computed(() => {
      if (!props.note.folderId) return null
      return notesStore.getFolderById(props.note.folderId)
    })
    
    function getNoteTypeText() {
      switch (props.note.type) {
        case 'checklist':
          return '清单'
        case 'text':
        default:
          return '富文本笔记'
      }
    }
    
    function formatDate(dateString) {
      return dayjs(dateString).format('YYYY年MM月DD日 HH:mm:ss')
    }
    
    function formatReminderTime(dateString) {
      const reminderTime = dayjs(dateString)
      const now = dayjs()
      
      if (reminderTime.isBefore(now)) {
        return `已过期 (${reminderTime.format('YYYY年MM月DD日 HH:mm')})`
      }
      
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
    
    function getWordCount() {
      if (props.note.type === 'checklist') {
        return props.note.checklist?.length || 0
      }
      
      const text = props.note.content.replace(/<[^>]*>/g, '').trim()
      return text.length
    }
    
    function getCompletedCount() {
      if (!props.note.checklist) return 0
      return props.note.checklist.filter(item => item.completed).length
    }
    
    function getProgressPercentage() {
      if (!props.note.checklist || props.note.checklist.length === 0) return 0
      const completed = getCompletedCount()
      return Math.round((completed / props.note.checklist.length) * 100)
    }
    
    return {
      folderInfo,
      getNoteTypeText,
      formatDate,
      formatReminderTime,
      getWordCount,
      getCompletedCount,
      getProgressPercentage
    }
  }
}
</script>