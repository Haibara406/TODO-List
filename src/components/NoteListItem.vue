<template>
  <div
    :class="[
      'group p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800',
      isActive ? 'bg-ios-accent bg-opacity-10 border-r-4 border-ios-accent' : ''
    ]"
    @click="$emit('click')"
    @contextmenu="handleContextMenu"
  >
    <div class="flex items-start space-x-3">
      <!-- 笔记图标 -->
      <div class="flex-shrink-0 mt-1">
        <div
          :class="[
            'w-2 h-2 rounded-full',
            note.isEncrypted ? 'bg-ios-red' : 
            note.isPinned ? 'bg-ios-yellow' :
            note.type === 'checklist' ? 'bg-ios-green' :
            'bg-ios-accent'
          ]"
        ></div>
      </div>
      
      <!-- 笔记内容 -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2 mb-1">
          <h3 
            :class="[
              'font-medium truncate',
              isActive ? 'text-ios-accent dark:text-ios-accent-dark' : 'text-ios-text dark:text-ios-text-dark'
            ]"
          >
            {{ note.title || '无标题' }}
          </h3>
          
          <!-- 状态图标 -->
          <div class="flex items-center space-x-1 flex-shrink-0">
            <svg v-if="note.isPinned" class="w-3 h-3 text-ios-yellow" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <svg v-if="note.isEncrypted" class="w-3 h-3 text-ios-red" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
            </svg>
            <svg v-if="note.reminder" class="w-3 h-3 text-ios-orange" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            <svg v-if="note.attachments && note.attachments.length > 0" class="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>
        
        <!-- 笔记预览 -->
        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
          {{ getNotePreview(note) }}
        </p>
        
        <!-- 底部信息 -->
        <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{{ formatDate(note.updatedAt) }}</span>
          <div class="flex items-center space-x-2">
            <span v-if="note.type === 'checklist'">
              {{ getChecklistProgress(note) }}
            </span>
            <span>{{ getWordCount(note.content) }} 字</span>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="flex items-center space-x-1">
          <button
            v-if="!note.isPinned"
            @click.stop="$emit('toggle-pin', note.id)"
            class="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="置顶"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
          </button>
          
          <button
            @click.stop="showMoreMenu = !showMoreMenu"
            class="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors relative"
            title="更多操作"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
            
            <!-- 更多操作菜单 -->
            <div
              v-if="showMoreMenu"
              class="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20"
            >
              <div class="py-1">
                <button
                  @click.stop="$emit('duplicate', note)"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  复制笔记
                </button>
                <button
                  @click.stop="$emit('set-reminder', note)"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  设置提醒
                </button>
                <button
                  v-if="note.isPinned"
                  @click.stop="$emit('toggle-pin', note.id)"
                  class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  取消置顶
                </button>
                <div class="border-t border-gray-200 dark:border-gray-700"></div>
                <button
                  @click.stop="handleDelete"
                  class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  删除笔记
                </button>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export default {
  name: 'NoteListItem',
  props: {
    note: {
      type: Object,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click', 'delete', 'duplicate', 'toggle-pin', 'set-reminder'],
  setup(props, { emit }) {
    const showMoreMenu = ref(false)
    
    function getNotePreview(note) {
      if (note.isEncrypted) return '此笔记已加密'
      if (note.type === 'checklist') {
        const completed = note.checklist?.filter(item => item.completed).length || 0
        const total = note.checklist?.length || 0
        return `清单: ${completed}/${total} 项已完成`
      }
      
      // 移除HTML标签，获取纯文本预览
      const text = note.content.replace(/<[^>]*>/g, '').trim()
      return text || '无内容'
    }
    
    function formatDate(dateString) {
      const date = dayjs(dateString)
      const now = dayjs()
      
      if (date.isSame(now, 'day')) {
        return date.format('HH:mm')
      } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
        return '昨天'
      } else if (date.isSame(now, 'year')) {
        return date.format('MM/DD')
      } else {
        return date.format('YYYY/MM/DD')
      }
    }
    
    function getChecklistProgress(note) {
      if (note.type !== 'checklist' || !note.checklist) return ''
      const completed = note.checklist.filter(item => item.completed).length
      const total = note.checklist.length
      return `${completed}/${total}`
    }
    
    function getWordCount(content) {
      if (!content) return 0
      const text = content.replace(/<[^>]*>/g, '').trim()
      return text.length
    }
    
    function handleContextMenu(event) {
      event.preventDefault()
      showMoreMenu.value = true
    }
    
    function handleDelete() {
      if (confirm(`确定要删除笔记"${props.note.title || '无标题'}"吗？`)) {
        emit('delete', props.note.id)
      }
      showMoreMenu.value = false
    }
    
    return {
      showMoreMenu,
      getNotePreview,
      formatDate,
      getChecklistProgress,
      getWordCount,
      handleContextMenu,
      handleDelete
    }
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>