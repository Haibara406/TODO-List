<template>
  <div class="space-y-3">
    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
      附件 ({{ attachments.length }})
    </h4>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="attachment in attachments"
        :key="attachment.id"
        class="group relative bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
      >
        <!-- 图片预览 -->
        <div 
          v-if="attachment.type === 'image'"
          class="aspect-video bg-gray-100 dark:bg-gray-700 rounded overflow-hidden mb-2"
        >
          <img
            :src="attachment.url"
            :alt="attachment.name"
            class="w-full h-full object-cover"
            @error="handleImageError"
          >
        </div>
        
        <!-- 文件图标 -->
        <div 
          v-else
          class="aspect-video bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mb-2"
        >
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        
        <!-- 附件信息 -->
        <div class="space-y-1">
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {{ attachment.name }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ formatFileSize(attachment.size) }}
          </p>
        </div>
        
        <!-- 操作按钮 -->
        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="flex items-center space-x-1">
            <button
              @click="downloadAttachment(attachment)"
              class="p-1 bg-white dark:bg-gray-800 rounded shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="下载"
            >
              <svg class="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              </svg>
            </button>
            <button
              @click="$emit('remove', attachment.id)"
              class="p-1 bg-white dark:bg-gray-800 rounded shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
              title="移除"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 链接指示器 -->
        <div 
          v-if="attachment.type === 'link'"
          class="absolute bottom-2 left-2"
        >
          <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AttachmentPreview',
  props: {
    attachments: {
      type: Array,
      default: () => []
    }
  },
  emits: ['remove'],
  methods: {
    formatFileSize(bytes) {
      if (!bytes) return '0 B'
      
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    },
    
    downloadAttachment(attachment) {
      if (attachment.type === 'link') {
        window.open(attachment.url, '_blank')
      } else {
        // 创建下载链接
        const link = document.createElement('a')
        link.href = attachment.url
        link.download = attachment.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    },
    
    handleImageError(event) {
      // 图片加载失败时显示默认图标
      event.target.style.display = 'none'
      const parent = event.target.parentNode
      parent.innerHTML = `
        <div class="w-full h-full flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
      `
    }
  }
}
</script>