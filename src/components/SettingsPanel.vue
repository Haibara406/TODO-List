<template>
  <div class="h-full flex flex-col">
    <!-- 头部 -->
    <div class="p-4 border-b border-ios-border dark:border-ios-border-dark">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">设置</h2>
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
    <div class="flex-1 overflow-y-auto p-4 space-y-6">
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
          
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">编辑器主题</label>
            <select 
              :value="settingsStore.editorTheme"
              @change="settingsStore.updateSetting('editorTheme', $event.target.value)"
              class="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded border-0 text-sm"
            >
              <option value="default">默认</option>
              <option value="minimal">简约</option>
              <option value="focus">专注</option>
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
            <label class="text-sm font-medium">自动换行</label>
            <ToggleSwitch 
              :value="settingsStore.enableWordWrap"
              @update:value="settingsStore.updateSetting('enableWordWrap', $event)"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">拼写检查</label>
            <ToggleSwitch 
              :value="settingsStore.enableSpellCheck"
              @update:value="settingsStore.updateSetting('enableSpellCheck', $event)"
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
      
      <!-- 通知设置 -->
      <div>
        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
          通知
        </h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">启用通知</label>
            <ToggleSwitch 
              :value="settingsStore.enableNotifications"
              @update:value="handleNotificationToggle"
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
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">自动备份</label>
            <ToggleSwitch 
              :value="settingsStore.autoBackup"
              @update:value="settingsStore.updateSetting('autoBackup', $event)"
            />
          </div>
          
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
          
          <button
            @click="resetAllSettings"
            class="w-full ios-button text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
          >
            重置所有设置
          </button>
        </div>
      </div>
      
      <!-- 关于 -->
      <div>
        <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">
          关于
        </h3>
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>iOS备忘录</strong> v1.0.0</p>
          <p>一个完全模拟iOS备忘录功能的网页应用</p>
          <p class="mt-4">
            <strong>功能特性:</strong>
          </p>
          <ul class="list-disc list-inside space-y-1 text-xs">
            <li>富文本编辑器</li>
            <li>文件夹管理</li>
            <li>全文搜索</li>
            <li>笔记置顶</li>
            <li>清单功能</li>
            <li>笔记加密</li>
            <li>提醒功能</li>
            <li>多格式导出</li>
            <li>数据备份与恢复</li>
            <li>深色模式</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useNotifications } from '../composables/useNotifications'
import ToggleSwitch from './ToggleSwitch.vue'

export default {
  name: 'SettingsPanel',
  components: {
    ToggleSwitch
  },
  emits: ['close', 'export-data', 'import-data'],
  setup(props, { emit }) {
    const settingsStore = useSettingsStore()
    const { showNotification } = useNotifications()
    
    function handleNotificationToggle(value) {
      if (value) {
        settingsStore.requestNotificationPermission().then(permission => {
          if (permission === 'granted') {
            settingsStore.updateSetting('enableNotifications', true)
            showNotification('通知已启用', 'success')
          } else {
            showNotification('通知权限被拒绝', 'warning')
          }
        })
      } else {
        settingsStore.updateSetting('enableNotifications', false)
      }
    }
    
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
    
    function resetAllSettings() {
      if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
        settingsStore.resetSettings()
        showNotification('设置已重置', 'success')
      }
    }
    
    return {
      settingsStore,
      handleNotificationToggle,
      handleImport,
      resetAllSettings
    }
  }
}
</script>