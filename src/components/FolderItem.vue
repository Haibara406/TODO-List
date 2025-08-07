<template>
  <div
    :class="[
      'group flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200',
      isActive 
        ? 'bg-ios-accent text-white' 
        : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-ios-text dark:text-ios-text-dark'
    ]"
    @click="$emit('click')"
    @contextmenu="handleContextMenu"
  >
    <span 
      class="text-lg"
      :style="{ color: isActive ? 'white' : folder.color }"
    >
      {{ folder.icon }}
    </span>
    
    <div class="flex-1 min-w-0">
      <div class="font-medium truncate">{{ folder.name }}</div>
      <div 
        v-if="noteCount > 0" 
        :class="[
          'text-xs',
          isActive ? 'text-white opacity-80' : 'text-gray-500 dark:text-gray-400'
        ]"
      >
        {{ noteCount }} 个笔记
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        @click.stop="$emit('edit')"
        class="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        title="编辑文件夹"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
      </button>
      <button
        @click.stop="$emit('delete')"
        class="p-1 rounded hover:bg-red-500 hover:text-white transition-colors"
        title="删除文件夹"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FolderItem',
  props: {
    folder: {
      type: Object,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    noteCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['click', 'edit', 'delete'],
  methods: {
    handleContextMenu(event) {
      event.preventDefault()
      // 这里可以显示右键菜单
      console.log('右键菜单', this.folder)
    }
  }
}
</script>