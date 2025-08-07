<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 h-5/6">
      <!-- 头部 -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-ios-text dark:text-ios-text-dark">
              版本历史
            </h2>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              笔记"{{ note.title || '无标题' }}"的修改历史
            </p>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 内容 -->
      <div class="flex h-full">
        <!-- 版本列表 -->
        <div class="w-80 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div class="p-4">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              版本列表 ({{ allVersions.length }})
            </h3>
            
            <div class="space-y-2">
              <!-- 当前版本 -->
              <div
                @click="selectVersion(currentVersion)"
                :class="[
                  'p-3 rounded-lg cursor-pointer transition-colors border-2',
                  selectedVersion?.version === currentVersion.version
                    ? 'border-ios-accent bg-ios-accent bg-opacity-5'
                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-ios-text dark:text-ios-text-dark">
                    当前版本 v{{ currentVersion.version }}
                  </span>
                  <span class="text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded">
                    最新
                  </span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(currentVersion.timestamp) }}
                </p>
              </div>
              
              <!-- 历史版本 -->
              <div
                v-for="version in note.history || []"
                :key="version.id"
                @click="selectVersion(version)"
                :class="[
                  'p-3 rounded-lg cursor-pointer transition-colors border-2',
                  selectedVersion?.id === version.id
                    ? 'border-ios-accent bg-ios-accent bg-opacity-5'
                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium text-ios-text dark:text-ios-text-dark">
                    v{{ version.version }}
                  </span>
                  <button
                    @click.stop="restoreVersion(version)"
                    class="text-xs text-ios-accent hover:text-ios-accent-dark"
                  >
                    恢复
                  </button>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(version.timestamp) }}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {{ getVersionPreview(version.content) }}
                </p>
              </div>
            </div>
            
            <!-- 空状态 -->
            <div v-if="!note.history || note.history.length === 0" class="text-center py-8">
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-gray-500 dark:text-gray-400">暂无历史版本</p>
            </div>
          </div>
        </div>
        
        <!-- 版本内容预览 -->
        <div class="flex-1 flex flex-col">
          <div v-if="selectedVersion" class="h-full flex flex-col">
            <!-- 版本信息栏 -->
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-ios-text dark:text-ios-text-dark">
                    版本 v{{ selectedVersion.version }}
                    <span v-if="selectedVersion.version === currentVersion.version" class="text-green-600 dark:text-green-400">
                      (当前版本)
                    </span>
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ formatDate(selectedVersion.timestamp) }}
                  </p>
                </div>
                
                <div v-if="selectedVersion.version !== currentVersion.version" class="flex items-center space-x-2">
                  <button
                    @click="compareWithCurrent"
                    class="ios-button ios-button-secondary text-sm"
                  >
                    与当前版本对比
                  </button>
                  <button
                    @click="restoreVersion(selectedVersion)"
                    class="ios-button ios-button-primary text-sm"
                  >
                    恢复此版本
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 内容预览 -->
            <div class="flex-1 overflow-auto p-6">
              <div 
                v-if="showComparison"
                class="grid grid-cols-2 gap-6 h-full"
              >
                <!-- 历史版本 -->
                <div>
                  <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    历史版本 v{{ selectedVersion.version }}
                  </h5>
                  <div class="prose dark:prose-invert max-w-none h-full overflow-auto bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div v-html="selectedVersion.content"></div>
                  </div>
                </div>
                
                <!-- 当前版本 -->
                <div>
                  <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    当前版本 v{{ currentVersion.version }}
                  </h5>
                  <div class="prose dark:prose-invert max-w-none h-full overflow-auto bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div v-html="currentVersion.content"></div>
                  </div>
                </div>
              </div>
              
              <!-- 单个版本预览 -->
              <div v-else class="prose dark:prose-invert max-w-none">
                <div v-html="selectedVersion.content"></div>
              </div>
            </div>
          </div>
          
          <!-- 未选择版本时的提示 -->
          <div v-else class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                选择一个版本查看内容
              </p>
              <p class="text-sm text-gray-400 dark:text-gray-500">
                从左侧版本列表中选择要查看的版本
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

export default {
  name: 'VersionHistoryModal',
  props: {
    note: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'restore-version'],
  setup(props, { emit }) {
    const selectedVersion = ref(null)
    const showComparison = ref(false)
    
    const currentVersion = computed(() => ({
      id: 'current',
      version: props.note.version || 1,
      content: props.note.content,
      timestamp: props.note.updatedAt
    }))
    
    const allVersions = computed(() => {
      const versions = [currentVersion.value]
      if (props.note.history) {
        versions.push(...props.note.history)
      }
      return versions.sort((a, b) => b.version - a.version)
    })
    
    function selectVersion(version) {
      selectedVersion.value = version
      showComparison.value = false
    }
    
    function compareWithCurrent() {
      showComparison.value = true
    }
    
    function restoreVersion(version) {
      if (version.version === currentVersion.value.version) {
        return
      }
      
      if (confirm(`确定要恢复到版本 v${version.version} 吗？当前内容将被覆盖。`)) {
        emit('restore-version', {
          content: version.content,
          version: version.version
        })
      }
    }
    
    function formatDate(dateString) {
      const date = dayjs(dateString)
      const now = dayjs()
      
      if (date.isSame(now, 'day')) {
        return `今天 ${date.format('HH:mm')}`
      } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
        return `昨天 ${date.format('HH:mm')}`
      } else if (date.isSame(now, 'year')) {
        return date.format('MM月DD日 HH:mm')
      } else {
        return date.format('YYYY年MM月DD日 HH:mm')
      }
    }
    
    function getVersionPreview(content) {
      if (!content) return '空内容'
      
      // 移除HTML标签，获取纯文本预览
      const text = content.replace(/<[^>]*>/g, '').trim()
      return text.length > 100 ? text.substring(0, 100) + '...' : text
    }
    
    // 默认选择当前版本
    selectVersion(currentVersion.value)
    
    return {
      selectedVersion,
      showComparison,
      currentVersion,
      allVersions,
      selectVersion,
      compareWithCurrent,
      restoreVersion,
      formatDate,
      getVersionPreview
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

.prose {
  max-width: none;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.prose p {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
</style>