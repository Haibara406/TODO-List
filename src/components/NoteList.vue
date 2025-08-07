<template>
  <div class="h-full bg-white dark:bg-gray-900 flex flex-col">
    <!-- 头部 -->
    <div class="p-4 border-b border-ios-border dark:border-ios-border-dark">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-ios-text dark:text-ios-text-dark">
          {{ currentFolderName }}
        </h2>
        <div class="flex items-center space-x-2">
          <!-- 排序选项 -->
          <div class="relative">
            <button
              @click="showSortMenu = !showSortMenu"
              class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="排序选项"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
              </svg>
            </button>
            
            <!-- 排序菜单 -->
            <div
              v-if="showSortMenu"
              class="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
            >
              <div class="p-2">
                <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  排序方式
                </div>
                <div class="space-y-1">
                  <button
                    v-for="option in sortOptions"
                    :key="option.value"
                    @click="setSortBy(option.value)"
                    :class="[
                      'w-full text-left px-3 py-2 rounded text-sm transition-colors',
                      sortBy === option.value 
                        ? 'bg-ios-accent text-white' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    ]"
                  >
                    {{ option.label }}
                  </button>
                </div>
                <div class="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                  <button
                    @click="toggleSortOrder"
                    class="w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {{ sortOrder === 'desc' ? '↓ 降序' : '↑ 升序' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 新建笔记 -->
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
      
      <!-- 统计信息 -->
      <div class="text-sm text-gray-500 dark:text-gray-400">
        共 {{ filteredNotes.length }} 个笔记
        <span v-if="searchQuery">（搜索结果）</span>
      </div>
    </div>
    
    <!-- 笔记列表 -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="filteredNotes.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p class="text-lg mb-2">{{ emptyStateMessage }}</p>
        <button
          @click="$emit('new-note')"
          class="ios-button ios-button-primary"
        >
          创建第一个笔记
        </button>
      </div>
      
      <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
        <NoteListItem
          v-for="note in filteredNotes"
          :key="note.id"
          :note="note"
          :is-active="selectedNoteId === note.id"
          @click="selectNote(note)"
          @delete="deleteNote"
          @duplicate="duplicateNote"
          @toggle-pin="togglePin"
          @set-reminder="setReminder"
        />
      </div>
    </div>
  </div>
  
  <!-- 点击外部关闭排序菜单 -->
  <div 
    v-if="showSortMenu"
    class="fixed inset-0 z-5"
    @click="showSortMenu = false"
  ></div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useNotesStore } from '../stores/notes'
import { useSettingsStore } from '../stores/settings'
import { useNotifications } from '../composables/useNotifications'
import NoteListItem from './NoteListItem.vue'

export default {
  name: 'NoteList',
  components: {
    NoteListItem
  },
  props: {
    currentFolder: {
      type: Object,
      default: null
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  emits: ['select-note', 'new-note', 'delete-note'],
  setup(props, { emit }) {
    const notesStore = useNotesStore()
    const settingsStore = useSettingsStore()
    const { showNotification } = useNotifications()
    
    const showSortMenu = ref(false)
    const selectedNoteId = ref(null)
    
    const sortOptions = [
      { value: 'updatedAt', label: '更新时间' },
      { value: 'createdAt', label: '创建时间' },
      { value: 'title', label: '标题' }
    ]
    
    const sortBy = ref(settingsStore.sortBy)
    const sortOrder = ref(settingsStore.sortOrder)
    
    // 计算属性
    const currentFolderName = computed(() => {
      if (!props.currentFolder) return '所有笔记'
      if (props.currentFolder.special) return props.currentFolder.name
      return props.currentFolder.name
    })
    
    const filteredNotes = computed(() => {
      let notes = notesStore.notes
      
      // 按文件夹过滤
      if (props.currentFolder && !props.currentFolder.special) {
        notes = notes.filter(note => note.folderId === props.currentFolder.id)
      } else if (props.currentFolder?.id === 'pinned') {
        notes = notes.filter(note => note.isPinned)
      } else if (props.currentFolder?.id === 'recent') {
        notes = notes.slice().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 20)
      }
      
      // 按搜索关键词过滤
      if (props.searchQuery) {
        const query = props.searchQuery.toLowerCase()
        notes = notes.filter(note => 
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
        )
      }
      
      // 排序
      return notes.slice().sort((a, b) => {
        // 置顶的笔记始终在前
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        
        let aValue, bValue
        
        switch (sortBy.value) {
          case 'title':
            aValue = a.title.toLowerCase()
            bValue = b.title.toLowerCase()
            break
          case 'createdAt':
            aValue = new Date(a.createdAt)
            bValue = new Date(b.createdAt)
            break
          default: // updatedAt
            aValue = new Date(a.updatedAt)
            bValue = new Date(b.updatedAt)
        }
        
        if (sortOrder.value === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    })
    
    const emptyStateMessage = computed(() => {
      if (props.searchQuery) return '没有找到匹配的笔记'
      if (props.currentFolder?.id === 'pinned') return '没有置顶的笔记'
      if (props.currentFolder?.id === 'recent') return '没有最近编辑的笔记'
      if (props.currentFolder) return `文件夹"${props.currentFolder.name}"中暂无笔记`
      return '暂无笔记'
    })
    
    // 监听器
    watch(() => notesStore.currentNote, (newNote) => {
      selectedNoteId.value = newNote?.id || null
    }, { immediate: true })
    
    // 方法
    function selectNote(note) {
      selectedNoteId.value = note.id
      emit('select-note', note)
    }
    
    function deleteNote(noteId) {
      emit('delete-note', noteId)
    }
    
    function duplicateNote(note) {
      const duplicated = notesStore.duplicateNote(note.id)
      if (duplicated) {
        showNotification('笔记已复制', 'success')
        selectNote(duplicated)
      }
    }
    
    function togglePin(noteId) {
      notesStore.togglePin(noteId)
      const note = notesStore.getNoteById(noteId)
      showNotification(note.isPinned ? '笔记已置顶' : '取消置顶', 'success')
    }
    
    function setReminder(note) {
      // 这里可以打开提醒设置模态框
      console.log('设置提醒', note)
    }
    
    function setSortBy(value) {
      sortBy.value = value
      settingsStore.updateSetting('sortBy', value)
      showSortMenu.value = false
    }
    
    function toggleSortOrder() {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      settingsStore.updateSetting('sortOrder', sortOrder.value)
      showSortMenu.value = false
    }
    
    return {
      showSortMenu,
      selectedNoteId,
      sortOptions,
      sortBy,
      sortOrder,
      currentFolderName,
      filteredNotes,
      emptyStateMessage,
      selectNote,
      deleteNote,
      duplicateNote,
      togglePin,
      setReminder,
      setSortBy,
      toggleSortOrder
    }
  }
}
</script>