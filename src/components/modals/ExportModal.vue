<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
      <!-- 头部 -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-ios-text dark:text-ios-text-dark">
          导出笔记
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          选择导出格式和选项
        </p>
      </div>
      
      <!-- 内容 -->
      <div class="p-6 space-y-6">
        <!-- 导出格式 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            导出格式
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="format in exportFormats"
              :key="format.value"
              @click="selectedFormat = format.value"
              :class="[
                'p-4 border-2 rounded-lg transition-all text-left',
                selectedFormat === format.value
                  ? 'border-ios-accent bg-ios-accent bg-opacity-5'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              ]"
            >
              <div class="flex items-center space-x-3">
                <span class="text-2xl">{{ format.icon }}</span>
                <div>
                  <div class="font-medium text-ios-text dark:text-ios-text-dark">
                    {{ format.label }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ format.description }}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        <!-- 导出选项 -->
        <div v-if="selectedFormat">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            导出选项
          </label>
          <div class="space-y-3">
            <!-- 包含元数据 -->
            <label class="flex items-center space-x-3">
              <input
                v-model="exportOptions.includeMetadata"
                type="checkbox"
                class="w-4 h-4 text-ios-accent border-gray-300 rounded focus:ring-ios-accent"
              >
              <div>
                <div class="text-sm font-medium text-ios-text dark:text-ios-text-dark">
                  包含元数据
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  包含创建时间、更新时间等信息
                </div>
              </div>
            </label>
            
            <!-- 包含附件 (仅支持HTML格式) -->
            <label 
              v-if="selectedFormat === 'html' && note.attachments?.length > 0"
              class="flex items-center space-x-3"
            >
              <input
                v-model="exportOptions.includeAttachments"
                type="checkbox"
                class="w-4 h-4 text-ios-accent border-gray-300 rounded focus:ring-ios-accent"
              >
              <div>
                <div class="text-sm font-medium text-ios-text dark:text-ios-text-dark">
                  包含附件
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  在导出的HTML中包含附件链接
                </div>
              </div>
            </label>
            
            <!-- 样式选项 (仅支持HTML/PDF) -->
            <div v-if="['html', 'pdf'].includes(selectedFormat)">
              <div class="text-sm font-medium text-ios-text dark:text-ios-text-dark mb-2">
                样式主题
              </div>
              <select 
                v-model="exportOptions.theme"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ios-accent dark:focus:ring-ios-accent-dark bg-white dark:bg-gray-700 text-ios-text dark:text-ios-text-dark"
              >
                <option value="default">默认</option>
                <option value="minimal">简约</option>
                <option value="elegant">优雅</option>
                <option value="dark">深色</option>
              </select>
            </div>
            
            <!-- 页面大小 (仅PDF) -->
            <div v-if="selectedFormat === 'pdf'">
              <div class="text-sm font-medium text-ios-text dark:text-ios-text-dark mb-2">
                页面大小
              </div>
              <select 
                v-model="exportOptions.pageSize"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ios-accent dark:focus:ring-ios-accent-dark bg-white dark:bg-gray-700 text-ios-text dark:text-ios-text-dark"
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- 预览信息 -->
        <div v-if="selectedFormat" class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">文件名</span>
            <span class="font-medium text-ios-text dark:text-ios-text-dark">
              {{ getFileName() }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm mt-2">
            <span class="text-gray-600 dark:text-gray-400">预计大小</span>
            <span class="font-medium text-ios-text dark:text-ios-text-dark">
              {{ getEstimatedSize() }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 底部按钮 -->
      <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="ios-button ios-button-secondary"
        >
          取消
        </button>
        <button
          @click="handleExport"
          :disabled="!selectedFormat"
          class="ios-button ios-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          导出
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

export default {
  name: 'ExportModal',
  props: {
    note: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'export'],
  setup(props, { emit }) {
    const selectedFormat = ref('html')
    
    const exportOptions = ref({
      includeMetadata: true,
      includeAttachments: false,
      theme: 'default',
      pageSize: 'A4'
    })
    
    const exportFormats = [
      {
        value: 'html',
        label: 'HTML',
        icon: '🌐',
        description: '网页格式，保留所有格式'
      },
      {
        value: 'pdf',
        label: 'PDF',
        icon: '📄',
        description: '便携文档格式'
      },
      {
        value: 'markdown',
        label: 'Markdown',
        icon: '📝',
        description: '纯文本标记语言'
      },
      {
        value: 'docx',
        label: 'Word',
        icon: '📋',
        description: 'Microsoft Word文档'
      },
      {
        value: 'txt',
        label: '纯文本',
        icon: '📄',
        description: '不包含格式的文本'
      },
      {
        value: 'json',
        label: 'JSON',
        icon: '🔧',
        description: '结构化数据格式'
      }
    ]
    
    function getFileName() {
      const title = props.note.title || '无标题笔记'
      const date = dayjs().format('YYYY-MM-DD')
      const extension = getFileExtension(selectedFormat.value)
      
      return `${title}_${date}.${extension}`
    }
    
    function getFileExtension(format) {
      const extensions = {
        html: 'html',
        pdf: 'pdf',
        markdown: 'md',
        docx: 'docx',
        txt: 'txt',
        json: 'json'
      }
      return extensions[format] || 'txt'
    }
    
    function getEstimatedSize() {
      const contentLength = props.note.content?.length || 0
      let size = contentLength
      
      // 根据格式调整大小估算
      switch (selectedFormat.value) {
        case 'html':
          size *= 1.5 // HTML标签开销
          break
        case 'pdf':
          size *= 2 // PDF格式开销
          break
        case 'docx':
          size *= 3 // Word格式开销
          break
        case 'json':
          size *= 1.2 // JSON结构开销
          break
      }
      
      if (size < 1024) return `${Math.round(size)} B`
      if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
      return `${Math.round(size / (1024 * 1024))} MB`
    }
    
    function handleExport() {
      emit('export', {
        format: selectedFormat.value,
        options: exportOptions.value
      })
    }
    
    return {
      selectedFormat,
      exportOptions,
      exportFormats,
      getFileName,
      getEstimatedSize,
      handleExport
    }
  }
}
</script>