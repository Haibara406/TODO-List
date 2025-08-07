<template>
  <div class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
    <div class="flex items-center justify-between p-4">
      <!-- 左侧按钮 -->
      <div class="flex items-center space-x-3">
        <button
          @click="$emit('toggle-sidebar')"
          class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors md:hidden"
          title="切换侧边栏"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        
        <button
          @click="$emit('toggle-note-list')"
          class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="切换笔记列表"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </button>
      </div>
      
      <!-- 中间标题区域 -->
      <div class="flex-1 text-center">
        <h1 class="text-lg font-semibold text-ios-text dark:text-ios-text-dark truncate max-w-md mx-auto">
          {{ note.title || '无标题笔记' }}
        </h1>
      </div>
      
      <!-- 右侧操作按钮 -->
      <div class="flex items-center space-x-2">
        <!-- 置顶按钮 -->
        <button
          @click="$emit('pin-note')"
          :class="[
            'p-2 rounded-lg transition-colors',
            note.isPinned 
              ? 'text-ios-yellow bg-yellow-50 dark:bg-yellow-900/20' 
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          ]"
          :title="note.isPinned ? '取消置顶' : '置顶笔记'"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </button>
        
        <!-- 加密按钮 -->
        <button
          @click="$emit('encrypt-note')"
          :class="[
            'p-2 rounded-lg transition-colors',
            note.isEncrypted 
              ? 'text-ios-red bg-red-50 dark:bg-red-900/20' 
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          ]"
          :title="note.isEncrypted ? '已加密' : '加密笔记'"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
          </svg>
        </button>
        
        <!-- 提醒按钮 -->
        <button
          @click="$emit('set-reminder')"
          :class="[
            'p-2 rounded-lg transition-colors',
            note.reminder 
              ? 'text-ios-orange bg-orange-50 dark:bg-orange-900/20' 
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          ]"
          :title="note.reminder ? '已设置提醒' : '设置提醒'"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
          </svg>
        </button>
        
        <!-- 更多操作 -->
        <div class="relative">
          <button
            @click="showMoreMenu = !showMoreMenu"
            class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="更多操作"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
          </button>
          
          <!-- 更多操作菜单 -->
          <div
            v-if="showMoreMenu"
            class="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20"
          >
            <div class="py-1">
              <button
                @click="duplicateNote"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                复制笔记
              </button>
              
              <button
                @click="$emit('export-note')"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
                导出笔记
              </button>
              
              <button
                @click="showNoteInfo = true"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                笔记信息
              </button>
              
              <button
                @click="showVersionHistory = true"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                版本历史
              </button>
              
              <div class="border-t border-gray-200 dark:border-gray-700"></div>
              
              <button
                @click="$emit('delete-note')"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                删除笔记
              </button>
            </div>
          </div>
        </div>
        
        <!-- 深色模式切换 -->
        <button
          @click="$emit('toggle-dark-mode')"
          class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          :title="isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
        >
          <svg v-if="isDarkMode" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 笔记信息模态框 -->
    <NoteInfoModal
      v-if="showNoteInfo"
      :note="note"
      @close="showNoteInfo = false"
    />
    
    <!-- 版本历史模态框 -->
    <VersionHistoryModal
      v-if="showVersionHistory"
      :note="note"
      @close="showVersionHistory = false"
      @restore-version="restoreVersion"
    />
  </div>
  
  <!-- 点击外部关闭菜单 -->
  <div 
    v-if="showMoreMenu"
    class="fixed inset-0 z-10"
    @click="showMoreMenu = false"
  ></div>
</template>

<script>
import { ref } from 'vue'
import { useNotesStore } from '../stores/notes'
import { useNotifications } from '../composables/useNotifications'
import NoteInfoModal from './modals/NoteInfoModal.vue'
import VersionHistoryModal from './modals/VersionHistoryModal.vue'

export default {
  name: 'NoteToolbar',
  components: {
    NoteInfoModal,
    VersionHistoryModal
  },
  props: {
    note: {
      type: Object,
      required: true
    },
    isDarkMode: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'toggle-dark-mode',
    'toggle-sidebar', 
    'toggle-note-list',
    'pin-note',
    'encrypt-note',
    'set-reminder',
    'export-note',
    'delete-note'
  ],
  setup(props, { emit }) {
    const notesStore = useNotesStore()
    const { showNotification } = useNotifications()
    
    const showMoreMenu = ref(false)
    const showNoteInfo = ref(false)
    const showVersionHistory = ref(false)
    
    function duplicateNote() {
      const duplicated = notesStore.duplicateNote(props.note.id)
      if (duplicated) {
        showNotification('笔记已复制', 'success')
        notesStore.setCurrentNote(duplicated)
      }
      showMoreMenu.value = false
    }
    
    function restoreVersion(versionData) {
      notesStore.updateNote(props.note.id, {
        content: versionData.content,
        title: versionData.title || props.note.title
      })
      showNotification('版本已恢复', 'success')
      showVersionHistory.value = false
    }
    
    return {
      showMoreMenu,
      showNoteInfo,
      showVersionHistory,
      duplicateNote,
      restoreVersion
    }
  }
}
</script>