<template>
  <div class="h-full ios-sidebar flex flex-col">
    <!-- 顶部工具栏 -->
    <div class="p-4 border-b border-ios-border dark:border-ios-border-dark">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold text-ios-text dark:text-ios-text-dark">
          备忘录
        </h1>
        <div class="flex items-center space-x-2">
          <button
            @click="$emit('new-folder')"
            class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="新建文件夹"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
          </button>
          <button
            @click="$emit('new-note')"
            class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="新建笔记"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 搜索框 -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索笔记..."
          class="w-full px-3 py-2 pl-9 bg-gray-100 dark:bg-gray-800 rounded-lg border-0 focus:ring-2 focus:ring-ios-accent dark:focus:ring-ios-accent-dark"
          @input="handleSearch"
        >
        <svg class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" 
             fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>
    </div>
    
    <!-- 快速访问 -->
    <div class="px-4 py-2">
      <div class="space-y-1">
        <SidebarItem
          :icon="'📄'"
          :label="`所有笔记 (${notesStore.notes.length})`"
          :is-active="!notesStore.currentFolder"
          @click="selectAllNotes"
        />
        <SidebarItem
          v-if="pinnedNotes.length > 0"
          :icon="'📌'"
          :label="`置顶笔记 (${pinnedNotes.length})`"
          :is-active="false"
          @click="selectPinnedNotes"
        />
        <SidebarItem
          :icon="'🕒'"
          :label="'最近笔记'"
          :is-active="false"
          @click="selectRecentNotes"
        />
      </div>
    </div>
    
    <!-- 文件夹列表 -->
    <div class="flex-1 overflow-y-auto">
      <div class="px-4 py-2">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            文件夹
          </h3>
          <span class="text-xs text-gray-500">{{ notesStore.folders.length }}</span>
        </div>
        
        <div class="space-y-1">
          <FolderItem
            v-for="folder in notesStore.folders"
            :key="folder.id"
            :folder="folder"
            :is-active="notesStore.currentFolder?.id === folder.id"
            :note-count="getFolderNoteCount(folder.id)"
            @click="selectFolder(folder)"
            @edit="editFolder(folder)"
            @delete="deleteFolder(folder)"
          />
        </div>
        
        <div 
          v-if="notesStore.folders.length === 0"
          class="text-center py-8 text-gray-500 dark:text-gray-400"
        >
          <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
          <p class="text-sm">暂无文件夹</p>
          <button
            @click="$emit('new-folder')"
            class="text-ios-accent dark:text-ios-accent-dark text-sm mt-1 hover:underline"
          >
            创建第一个文件夹
          </button>
        </div>
      </div>
    </div>
    
    <!-- 底部设置 -->
    <div class="p-4 border-t border-ios-border dark:border-ios-border-dark">
      <div class="flex items-center justify-between">
        <button
          @click="showSettings = !showSettings"
          class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </button>
          
          <button
            @click="exportAllData"
            class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="导出所有数据"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
          </button>
          
          <input
            ref="importInput"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleImport"
          >
          <button
            @click="$refs.importInput.click()"
            class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="导入数据"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
            </svg>
          </button>
      </div>
    </div>
    
    <!-- 设置面板 -->
    <div
      v-if="showSettings"
      class="absolute inset-0 bg-ios-sidebar dark:bg-ios-sidebar-dark z-10"
    >
      <SettingsPanel
        @close="showSettings = false"
        @export-data="exportAllData"
        @import-data="handleImportData"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useNotesStore } from '../stores/notes'
import { useNotifications } from '../composables/useNotifications'
import SidebarItem from './SidebarItem.vue'
import FolderItem from './FolderItem.vue'
import SettingsPanel from './SettingsPanel.vue'

export default {
  name: 'NoteSidebar',
  components: {
    SidebarItem,
    FolderItem,
    SettingsPanel
  },
  emits: ['select-folder', 'select-note', 'new-note', 'new-folder'],
  setup(props, { emit }) {
    const notesStore = useNotesStore()
    const { showNotification } = useNotifications()
    
    const searchQuery = ref('')
    const showSettings = ref(false)
    
    const pinnedNotes = computed(() => notesStore.pinnedNotes)
    
    function getFolderNoteCount(folderId) {
      return notesStore.notes.filter(note => note.folderId === folderId).length
    }
    
    function selectAllNotes() {
      emit('select-folder', null)
    }
    
    function selectPinnedNotes() {
      // 这里可以设置一个特殊的过滤状态
      notesStore.setSearchQuery('pinned:true')
      emit('select-folder', { id: 'pinned', name: '置顶笔记', special: true })
    }
    
    function selectRecentNotes() {
      notesStore.setSearchQuery('recent:true')
      emit('select-folder', { id: 'recent', name: '最近笔记', special: true })
    }
    
    function selectFolder(folder) {
      emit('select-folder', folder)
    }
    
    function editFolder(folder) {
      // 触发编辑文件夹模态框
      console.log('编辑文件夹:', folder)
    }
    
    function deleteFolder(folder) {
      if (confirm(`确定要删除文件夹"${folder.name}"吗？文件夹中的笔记将移动到根目录。`)) {
        notesStore.deleteFolder(folder.id)
        showNotification('文件夹已删除', 'success')
      }
    }
    
    function handleSearch() {
      notesStore.setSearchQuery(searchQuery.value)
    }
    
    function exportAllData() {
      try {
        notesStore.exportData()
        showNotification('数据导出成功', 'success')
      } catch (error) {
        showNotification('数据导出失败: ' + error.message, 'error')
      }
    }
    
    function handleImport(event) {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          notesStore.importData(data)
          showNotification('数据导入成功', 'success')
        } catch (error) {
          showNotification('数据导入失败: ' + error.message, 'error')
        }
      }
      reader.readAsText(file)
      
      // 清空文件输入
      event.target.value = ''
    }
    
    function handleImportData(data) {
      try {
        notesStore.importData(data)
        showNotification('数据导入成功', 'success')
      } catch (error) {
        showNotification('数据导入失败: ' + error.message, 'error')
      }
    }
    
    return {
      notesStore,
      searchQuery,
      showSettings,
      pinnedNotes,
      getFolderNoteCount,
      selectAllNotes,
      selectPinnedNotes,
      selectRecentNotes,
      selectFolder,
      editFolder,
      deleteFolder,
      handleSearch,
      exportAllData,
      handleImport,
      handleImportData
    }
  }
}
</script>