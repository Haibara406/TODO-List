<template>
  <div id="app" :class="{ 'dark': isDarkMode }" class="h-screen overflow-hidden">
    <div class="flex h-full bg-ios-bg dark:bg-ios-bg-dark">
      <!-- 侧边栏 -->
      <NoteSidebar 
        :class="{ 'hidden': !showSidebar }"
        class="w-80 flex-shrink-0 transition-all duration-300"
        @select-folder="handleSelectFolder"
        @select-note="handleSelectNote"
        @new-note="handleNewNote"
        @new-folder="handleNewFolder"
      />
      
      <!-- 笔记列表 -->
      <NoteList
        :class="{ 'hidden': !showNoteList }"
        class="w-96 flex-shrink-0 border-r border-ios-border dark:border-ios-border-dark transition-all duration-300"
        :current-folder="currentFolder"
        :search-query="searchQuery"
        @select-note="handleSelectNote"
        @new-note="handleNewNote"
        @delete-note="handleDeleteNote"
      />
      
      <!-- 笔记编辑器 -->
      <div class="flex-1 flex flex-col">
        <!-- 顶部工具栏 -->
        <NoteToolbar
          v-if="currentNote"
          :note="currentNote"
          :is-dark-mode="isDarkMode"
          @toggle-dark-mode="toggleDarkMode"
          @toggle-sidebar="toggleSidebar"
          @toggle-note-list="toggleNoteList"
          @pin-note="handlePinNote"
          @encrypt-note="handleEncryptNote"
          @set-reminder="handleSetReminder"
          @export-note="handleExportNote"
          @delete-note="handleDeleteNote"
        />
        
        <!-- 编辑器区域 -->
        <div class="flex-1 relative">
          <NoteEditor
            v-if="currentNote"
            :note="currentNote"
            @update-note="handleUpdateNote"
            @update-title="handleUpdateTitle"
          />
          
          <!-- 欢迎界面 -->
          <WelcomeScreen 
            v-else
            :is-dark-mode="isDarkMode"
            @toggle-dark-mode="toggleDarkMode"
            @new-note="handleNewNote"
            @import-data="handleImportData"
          />
        </div>
      </div>
    </div>
    
    <!-- 模态框和弹窗 -->
    <FolderModal
      v-if="showFolderModal"
      :folder="editingFolder"
      @close="showFolderModal = false"
      @save="handleSaveFolder"
    />
    
    <EncryptModal
      v-if="showEncryptModal"
      :note="encryptingNote"
      @close="showEncryptModal = false"
      @encrypt="handleEncryptConfirm"
    />
    
    <ReminderModal
      v-if="showReminderModal"
      :note="reminderNote"
      @close="showReminderModal = false"
      @set-reminder="handleSetReminderConfirm"
    />
    
    <ExportModal
      v-if="showExportModal"
      :note="exportingNote"
      @close="showExportModal = false"
      @export="handleExportConfirm"
    />
    
    <!-- 通知组件 -->
    <NotificationSystem ref="notificationSystem" />
    
    <!-- 搜索组件 -->
    <GlobalSearch
      v-if="showSearch"
      @close="showSearch = false"
      @search="handleSearch"
      @select-note="handleSelectNote"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotesStore } from './stores/notes'
import { useSettingsStore } from './stores/settings'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import { useNotifications } from './composables/useNotifications'

// 组件导入
import NoteSidebar from './components/NoteSidebar.vue'
import NoteList from './components/NoteList.vue'
import NoteEditor from './components/NoteEditor.vue'
import NoteToolbar from './components/NoteToolbar.vue'
import WelcomeScreen from './components/WelcomeScreen.vue'
import FolderModal from './components/modals/FolderModal.vue'
import EncryptModal from './components/modals/EncryptModal.vue'
import ReminderModal from './components/modals/ReminderModal.vue'
import ExportModal from './components/modals/ExportModal.vue'
import NotificationSystem from './components/NotificationSystem.vue'
import GlobalSearch from './components/GlobalSearch.vue'

export default {
  name: 'App',
  components: {
    NoteSidebar,
    NoteList,
    NoteEditor,
    NoteToolbar,
    WelcomeScreen,
    FolderModal,
    EncryptModal,
    ReminderModal,
    ExportModal,
    NotificationSystem,
    GlobalSearch
  },
  setup() {
    const notesStore = useNotesStore()
    const settingsStore = useSettingsStore()
    const { showNotification } = useNotifications()
    
    // 响应式状态
    const showSidebar = ref(true)
    const showNoteList = ref(true)
    const showSearch = ref(false)
    const searchQuery = ref('')
    
    // 模态框状态
    const showFolderModal = ref(false)
    const showEncryptModal = ref(false)
    const showReminderModal = ref(false)
    const showExportModal = ref(false)
    
    const editingFolder = ref(null)
    const encryptingNote = ref(null)
    const reminderNote = ref(null)
    const exportingNote = ref(null)
    
    // 计算属性
    const isDarkMode = computed(() => settingsStore.isDarkMode)
    const currentNote = computed(() => notesStore.currentNote)
    const currentFolder = computed(() => notesStore.currentFolder)
    
    // 键盘快捷键
    const shortcuts = useKeyboardShortcuts({
      'cmd+n': handleNewNote,
      'cmd+shift+n': handleNewFolder,
      'cmd+f': () => showSearch.value = true,
      'cmd+shift+d': toggleDarkMode,
      'cmd+b': toggleSidebar,
      'cmd+shift+b': toggleNoteList,
      'escape': handleEscape
    })
    
    // 方法
    function toggleDarkMode() {
      settingsStore.toggleDarkMode()
    }
    
    function toggleSidebar() {
      showSidebar.value = !showSidebar.value
    }
    
    function toggleNoteList() {
      showNoteList.value = !showNoteList.value
    }
    
    function handleSelectFolder(folder) {
      notesStore.setCurrentFolder(folder)
    }
    
    function handleSelectNote(note) {
      notesStore.setCurrentNote(note)
    }
    
    function handleNewNote() {
      const note = notesStore.createNote(currentFolder.value?.id)
      notesStore.setCurrentNote(note)
      showNotification('已创建新笔记', 'success')
    }
    
    function handleNewFolder() {
      editingFolder.value = null
      showFolderModal.value = true
    }
    
    function handleUpdateNote(content) {
      if (currentNote.value) {
        notesStore.updateNote(currentNote.value.id, { content })
      }
    }
    
    function handleUpdateTitle(title) {
      if (currentNote.value) {
        notesStore.updateNote(currentNote.value.id, { title })
      }
    }
    
    function handleDeleteNote(noteId) {
      const note = noteId ? notesStore.getNoteById(noteId) : currentNote.value
      if (note) {
        notesStore.deleteNote(note.id)
        if (currentNote.value?.id === note.id) {
          notesStore.setCurrentNote(null)
        }
        showNotification('笔记已删除', 'success')
      }
    }
    
    function handlePinNote() {
      if (currentNote.value) {
        notesStore.togglePin(currentNote.value.id)
        const isPinned = notesStore.getNoteById(currentNote.value.id).isPinned
        showNotification(isPinned ? '笔记已置顶' : '取消置顶', 'success')
      }
    }
    
    function handleEncryptNote() {
      if (currentNote.value) {
        encryptingNote.value = currentNote.value
        showEncryptModal.value = true
      }
    }
    
    function handleSetReminder() {
      if (currentNote.value) {
        reminderNote.value = currentNote.value
        showReminderModal.value = true
      }
    }
    
    function handleExportNote() {
      if (currentNote.value) {
        exportingNote.value = currentNote.value
        showExportModal.value = true
      }
    }
    
    function handleSaveFolder(folderData) {
      if (editingFolder.value) {
        notesStore.updateFolder(editingFolder.value.id, folderData)
        showNotification('文件夹已更新', 'success')
      } else {
        notesStore.createFolder(folderData)
        showNotification('文件夹已创建', 'success')
      }
      showFolderModal.value = false
    }
    
    function handleEncryptConfirm(password) {
      if (encryptingNote.value) {
        notesStore.encryptNote(encryptingNote.value.id, password)
        showNotification('笔记已加密', 'success')
      }
      showEncryptModal.value = false
    }
    
    function handleSetReminderConfirm(reminderData) {
      if (reminderNote.value) {
        notesStore.setReminder(reminderNote.value.id, reminderData)
        showNotification('提醒已设置', 'success')
      }
      showReminderModal.value = false
    }
    
    function handleExportConfirm(exportData) {
      if (exportingNote.value) {
        notesStore.exportNote(exportingNote.value.id, exportData.format, exportData.options)
        showNotification(`笔记已导出为${exportData.format.toUpperCase()}`, 'success')
      }
      showExportModal.value = false
    }
    
    function handleSearch(query) {
      searchQuery.value = query
      showSearch.value = false
    }
    
    function handleImportData(data) {
      try {
        notesStore.importData(data)
        showNotification('数据导入成功', 'success')
      } catch (error) {
        showNotification('数据导入失败: ' + error.message, 'error')
      }
    }
    
    function handleEscape() {
      showSearch.value = false
      showFolderModal.value = false
      showEncryptModal.value = false
      showReminderModal.value = false
      showExportModal.value = false
    }
    
    // 生命周期
    onMounted(() => {
      // 初始化应用
      notesStore.loadData()
      settingsStore.loadSettings()
      
      // 隐藏加载动画
      setTimeout(() => {
        const loading = document.querySelector('.loading')
        if (loading) {
          loading.style.display = 'none'
        }
      }, 1000)
    })
    
    return {
      // 状态
      showSidebar,
      showNoteList,
      showSearch,
      searchQuery,
      isDarkMode,
      currentNote,
      currentFolder,
      
      // 模态框状态
      showFolderModal,
      showEncryptModal,
      showReminderModal,
      showExportModal,
      editingFolder,
      encryptingNote,
      reminderNote,
      exportingNote,
      
      // 方法
      toggleDarkMode,
      toggleSidebar,
      toggleNoteList,
      handleSelectFolder,
      handleSelectNote,
      handleNewNote,
      handleNewFolder,
      handleUpdateNote,
      handleUpdateTitle,
      handleDeleteNote,
      handlePinNote,
      handleEncryptNote,
      handleSetReminder,
      handleExportNote,
      handleSaveFolder,
      handleEncryptConfirm,
      handleSetReminderConfirm,
      handleExportConfirm,
      handleSearch,
      handleImportData
    }
  }
}
</script>