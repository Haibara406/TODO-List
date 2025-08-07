<template>
  <div class="h-full flex items-center justify-center bg-ios-bg dark:bg-ios-bg-dark">
    <div class="text-center max-w-md mx-auto p-8">
      <!-- Logo/图标 -->
      <div class="mb-8">
        <div class="w-24 h-24 mx-auto bg-gradient-to-br from-ios-accent to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </div>
      </div>
      
      <!-- 标题和描述 -->
      <h1 class="text-3xl font-bold text-ios-text dark:text-ios-text-dark mb-4">
        iOS 备忘录
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
        一个功能完整的备忘录应用，支持富文本编辑、文件夹管理、笔记加密、提醒功能等
      </p>
      
      <!-- 功能特性 -->
      <div class="grid grid-cols-2 gap-4 mb-8 text-sm">
        <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <span class="text-lg">📝</span>
          <span>富文本编辑</span>
        </div>
        <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <span class="text-lg">📁</span>
          <span>文件夹管理</span>
        </div>
        <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <span class="text-lg">🔍</span>
          <span>全文搜索</span>
        </div>
        <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <span class="text-lg">📌</span>
          <span>笔记置顶</span>
        </div>
        <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <span class="text-lg">✅</span>
          <span>清单功能</span>
        </div>
        <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <span class="text-lg">🔐</span>
          <span>笔记加密</span>
        </div>
        <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <span class="text-lg">⏰</span>
          <span>提醒功能</span>
        </div>
        <div class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <span class="text-lg">🌙</span>
          <span>深色模式</span>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="space-y-4">
        <button
          @click="$emit('new-note')"
          class="w-full ios-button ios-button-primary text-lg py-3"
        >
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          创建第一个笔记
        </button>
        
        <div class="flex items-center space-x-3">
          <input
            ref="importInput"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleImport"
          >
          <button
            @click="$refs.importInput.click()"
            class="flex-1 ios-button ios-button-secondary"
          >
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
            </svg>
            导入数据
          </button>
          
          <button
            @click="$emit('toggle-dark-mode')"
            class="flex-1 ios-button ios-button-secondary"
          >
            <svg v-if="isDarkMode" class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
            </svg>
            <svg v-else class="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
            {{ isDarkMode ? '浅色' : '深色' }}模式
          </button>
        </div>
      </div>
      
      <!-- 版本信息 -->
      <div class="mt-8 text-xs text-gray-500 dark:text-gray-400">
        <p>版本 1.0.0</p>
        <p class="mt-1">
          支持数据导入导出，本地存储，无需联网使用
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { useNotifications } from '../composables/useNotifications'

export default {
  name: 'WelcomeScreen',
  props: {
    isDarkMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['new-note', 'toggle-dark-mode', 'import-data'],
  setup(props, { emit }) {
    const { showNotification } = useNotifications()
    
    function handleImport(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          emit('import-data', data)
        } catch (error) {
          showNotification('导入文件格式错误', 'error')
        }
      }
      reader.readAsText(file)
      
      // 清空文件输入
      event.target.value = ''
    }
    
    return {
      handleImport
    }
  }
}
</script>