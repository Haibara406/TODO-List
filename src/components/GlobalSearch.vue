<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden">
      <!-- 搜索输入框 -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="relative">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="搜索笔记内容..."
            class="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-700 rounded-lg border-0 focus:ring-2 focus:ring-ios-accent dark:focus:ring-ios-accent-dark text-ios-text dark:text-ios-text-dark placeholder-gray-400"
            @keydown.escape="$emit('close')"
            @keydown.enter="selectFirstResult"
            @keydown.down="navigateDown"
            @keydown.up="navigateUp"
          >
          <svg class="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          
          <!-- 清除按钮 -->
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 搜索结果 -->
      <div class="max-h-80 overflow-y-auto">
        <div v-if="searchQuery && searchResults.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <p>没有找到匹配的笔记</p>
        </div>
        
        <div v-else-if="searchQuery" class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="(result, index) in searchResults"
            :key="result.item.id"
            :class="[
              'p-4 cursor-pointer transition-colors',
              selectedIndex === index 
                ? 'bg-ios-accent bg-opacity-10' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
            @click="selectNote(result.item)"
          >
            <div class="flex items-start space-x-3">
              <!-- 笔记类型图标 -->
              <div class="flex-shrink-0 mt-1">
                <div
                  :class="[
                    'w-2 h-2 rounded-full',
                    result.item.isPinned ? 'bg-ios-yellow' :
                    result.item.type === 'checklist' ? 'bg-ios-green' :
                    'bg-ios-accent'
                  ]"
                ></div>
              </div>
              
              <!-- 笔记信息 -->
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-ios-text dark:text-ios-text-dark truncate">
                  <span v-html="highlightText(result.item.title || '无标题', searchQuery)"></span>
                </h3>
                
                <!-- 匹配的内容片段 -->
                <div 
                  v-if="result.matches && result.matches.length > 0"
                  class="mt-1 space-y-1"
                >
                  <p 
                    v-for="match in result.matches.slice(0, 2)"
                    :key="match.indices[0][0]"
                    class="text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span v-html="getMatchSnippet(result.item.content, match, searchQuery)"></span>
                  </p>
                </div>
                
                <!-- 笔记元信息 -->
                <div class="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{{ formatDate(result.item.updatedAt) }}</span>
                  <div class="flex items-center space-x-2">
                    <span v-if="result.item.isPinned" title="已置顶">📌</span>
                    <span v-if="result.item.isEncrypted" title="已加密">🔒</span>
                    <span v-if="result.item.type === 'checklist'" title="清单">✅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 搜索提示 -->
        <div v-else class="p-8 text-center text-gray-500 dark:text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <p class="text-lg font-medium mb-2">搜索笔记</p>
          <p class="text-sm">输入关键词搜索笔记标题和内容</p>
          <div class="mt-4 text-xs space-y-1">
            <p><kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">↑↓</kbd> 导航</p>
            <p><kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> 选择</p>
            <p><kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> 关闭</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useNotesStore } from '../stores/notes'
import Fuse from 'fuse.js'
import dayjs from 'dayjs'

export default {
  name: 'GlobalSearch',
  emits: ['close', 'search', 'select-note'],
  setup(props, { emit }) {
    const notesStore = useNotesStore()
    const searchInput = ref(null)
    const searchQuery = ref('')
    const selectedIndex = ref(0)
    
    // 创建Fuse搜索实例
    const fuse = computed(() => {
      const options = {
        keys: [
          { name: 'title', weight: 0.6 },
          { name: 'content', weight: 0.4 }
        ],
        threshold: 0.3,
        includeMatches: true,
        minMatchCharLength: 2,
        ignoreLocation: true
      }
      
      // 过滤掉加密的笔记
      const searchableNotes = notesStore.notes.filter(note => !note.isEncrypted)
      
      return new Fuse(searchableNotes, options)
    })
    
    // 搜索结果
    const searchResults = computed(() => {
      if (!searchQuery.value.trim()) return []
      
      const results = fuse.value.search(searchQuery.value)
      return results.slice(0, 20) // 限制结果数量
    })
    
    // 监听搜索结果变化，重置选中索引
    watch(searchResults, () => {
      selectedIndex.value = 0
    })
    
    // 方法
    function clearSearch() {
      searchQuery.value = ''
      selectedIndex.value = 0
    }
    
    function selectFirstResult() {
      if (searchResults.value.length > 0) {
        selectNote(searchResults.value[selectedIndex.value].item)
      }
    }
    
    function selectNote(note) {
      emit('select-note', note)
      emit('close')
    }
    
    function navigateDown() {
      if (selectedIndex.value < searchResults.value.length - 1) {
        selectedIndex.value++
      }
    }
    
    function navigateUp() {
      if (selectedIndex.value > 0) {
        selectedIndex.value--
      }
    }
    
    function highlightText(text, query) {
      if (!query) return text
      
      const regex = new RegExp(`(${query})`, 'gi')
      return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
    }
    
    function getMatchSnippet(content, match, query) {
      const text = content.replace(/<[^>]*>/g, '') // 移除HTML标签
      const index = match.indices[0][0]
      const start = Math.max(0, index - 30)
      const end = Math.min(text.length, index + query.length + 30)
      
      let snippet = text.substring(start, end)
      if (start > 0) snippet = '...' + snippet
      if (end < text.length) snippet = snippet + '...'
      
      return highlightText(snippet, query)
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
    
    // 生命周期
    onMounted(() => {
      nextTick(() => {
        if (searchInput.value) {
          searchInput.value.focus()
        }
      })
    })
    
    return {
      searchInput,
      searchQuery,
      selectedIndex,
      searchResults,
      clearSearch,
      selectFirstResult,
      selectNote,
      navigateDown,
      navigateUp,
      highlightText,
      getMatchSnippet,
      formatDate
    }
  }
}
</script>

<style scoped>
kbd {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

mark {
  border-radius: 2px;
  padding: 0 2px;
}
</style>