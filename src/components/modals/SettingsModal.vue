<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto max-h-screen overflow-y-auto">
      <!-- 头部 -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-ios-text dark:text-ios-text-dark">设置</h2>
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
      
      <!-- 设置内容 -->
      <div class="p-6 space-y-6">
        <!-- 外观设置 -->
        <div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
            外观
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">深色模式</label>
              <ToggleSwitch 
                :value="settingsStore.isDarkMode"
                @update:value="settingsStore.toggleDarkMode"
              />
            </div>
            
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">字体大小</label>
              <select 
                :value="settingsStore.fontSize"
                @change="settingsStore.setFontSize($event.target.value)"
                class="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded border-0 text-sm"
              >
                <option value="small">小</option>
                <option value="medium">中</option>
                <option value="large">大</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- 编辑设置 -->
        <div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
            编辑
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">自动保存</label>
              <ToggleSwitch 
                :value="settingsStore.autoSave"
                @update:value="settingsStore.updateSetting('autoSave', $event)"
              />
            </div>
            
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">富文本编辑</label>
              <ToggleSwitch 
                :value="settingsStore.enableRichText"
                @update:value="settingsStore.updateSetting('enableRichText', $event)"
              />
            </div>
          </div>
        </div>
        
        <!-- 数据管理 -->
        <div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
            数据管理
          </h3>
          <div class="space-y-3">
            <button
              @click="$emit('export-data')"
              class="w-full ios-button ios-button-secondary text-left"
            >
              <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              </svg>
              导出所有数据
            </button>
            
            <div class="space-y-2">
              <input
                ref="importInput"
                type="file"
                accept=".json"
                class="hidden"
                @change="handleImport"
              >
              <button
                @click="$refs.importInput.click()"
                class="w-full ios-button ios-button-secondary text-left"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
                </svg>
                导入数据
              </button>
            </div>
          </div>
        </div>
        
        <!-- 关于 -->
        <div>
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
            关于
          </h3>
          <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>iOS备忘录</strong> v1.0.0</p>
            <p>功能完整的iOS风格备忘录应用</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import { useNotifications } from '../../composables/useNotifications'
import ToggleSwitch from '../ToggleSwitch.vue'

export default {
  name: 'SettingsModal',
  components: {
    ToggleSwitch
  },
  emits: ['close', 'export-data', 'import-data'],
  setup(props, { emit }) {
    const settingsStore = useSettingsStore()
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
      settingsStore,
      handleImport
    }
  }
}
</script>