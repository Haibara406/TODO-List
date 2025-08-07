<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-900">
    <!-- 标题栏 -->
    <div class="border-b border-gray-200 dark:border-gray-700 p-4">
      <input
        v-model="localTitle"
        @blur="updateTitle"
        @keydown.enter="$event.target.blur()"
        type="text"
        placeholder="笔记标题"
        class="w-full text-xl font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 text-ios-text dark:text-ios-text-dark placeholder-gray-400"
      >
      
      <!-- 笔记信息 -->
      <div class="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">
        <div class="flex items-center space-x-4">
          <span>{{ formatDate(note.updatedAt) }}</span>
          <span>{{ getWordCount() }} 字</span>
          <span v-if="note.type === 'checklist'">
            清单 ({{ getChecklistProgress() }})
          </span>
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- 编辑器类型切换 -->
          <div class="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              @click="setEditorType('text')"
              :class="[
                'px-3 py-1 text-xs transition-colors',
                note.type === 'text' 
                  ? 'bg-ios-accent text-white' 
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              富文本
            </button>
            <button
              @click="setEditorType('checklist')"
              :class="[
                'px-3 py-1 text-xs transition-colors border-l border-gray-300 dark:border-gray-600',
                note.type === 'checklist' 
                  ? 'bg-ios-accent text-white' 
                  : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              清单
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 编辑器区域 -->
    <div class="flex-1 relative">
      <!-- 富文本编辑器 -->
      <div 
        v-if="note.type === 'text'"
        class="h-full"
      >
        <div ref="quillEditor" class="h-full"></div>
      </div>
      
      <!-- 清单编辑器 -->
      <ChecklistEditor
        v-else-if="note.type === 'checklist'"
        :checklist="note.checklist || []"
        @update="updateChecklist"
        class="h-full"
      />
    </div>
    
    <!-- 附件预览 -->
    <div 
      v-if="note.attachments && note.attachments.length > 0"
      class="border-t border-gray-200 dark:border-gray-700 p-4"
    >
      <AttachmentPreview
        :attachments="note.attachments"
        @remove="removeAttachment"
      />
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useSettingsStore } from '../stores/settings'
import dayjs from 'dayjs'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import ChecklistEditor from './ChecklistEditor.vue'
import AttachmentPreview from './AttachmentPreview.vue'

export default {
  name: 'NoteEditor',
  components: {
    ChecklistEditor,
    AttachmentPreview
  },
  props: {
    note: {
      type: Object,
      required: true
    }
  },
  emits: ['update-note', 'update-title'],
  setup(props, { emit }) {
    const settingsStore = useSettingsStore()
    const quillEditor = ref(null)
    const localTitle = ref('')
    
    let quill = null
    let saveTimeout = null
    
    // 初始化Quill编辑器
    function initQuillEditor() {
      if (!quillEditor.value) return
      
      const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        
        ['clean'],
        ['link', 'image', 'video']
      ]
      
      quill = new Quill(quillEditor.value, {
        theme: 'snow',
        placeholder: '开始写作...',
        modules: {
          toolbar: toolbarOptions
        }
      })
      
      // 设置初始内容
      if (props.note.content) {
        quill.root.innerHTML = props.note.content
      }
      
      // 监听内容变化
      quill.on('text-change', () => {
        const content = quill.root.innerHTML
        debouncedSave(content)
      })
      
      // 应用设置
      applyEditorSettings()
    }
    
    function applyEditorSettings() {
      if (!quill) return
      
      const config = settingsStore.getEditorConfig()
      
      // 应用字体大小
      const editor = quill.root
      switch (settingsStore.fontSize) {
        case 'small':
          editor.style.fontSize = '14px'
          break
        case 'large':
          editor.style.fontSize = '18px'
          break
        default:
          editor.style.fontSize = '16px'
      }
      
      // 应用自动换行
      if (config.enableWordWrap) {
        editor.style.whiteSpace = 'pre-wrap'
      } else {
        editor.style.whiteSpace = 'pre'
      }
      
      // 应用拼写检查
      editor.spellcheck = config.enableSpellCheck
    }
    
    function debouncedSave(content) {
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
      
      if (settingsStore.autoSave) {
        saveTimeout = setTimeout(() => {
          emit('update-note', content)
        }, 1000) // 1秒后自动保存
      }
    }
    
    function updateTitle() {
      if (localTitle.value !== props.note.title) {
        emit('update-title', localTitle.value)
      }
    }
    
    function setEditorType(type) {
      if (type === props.note.type) return
      
      // 如果从富文本切换到清单，保存当前内容
      if (type === 'checklist' && quill) {
        const content = quill.root.innerHTML
        if (content && content !== '<p><br></p>') {
          emit('update-note', content)
        }
      }
      
      emit('update-note', props.note.content, { type })
    }
    
    function updateChecklist(checklist) {
      emit('update-note', props.note.content, { checklist, type: 'checklist' })
    }
    
    function removeAttachment(attachmentId) {
      const attachments = props.note.attachments.filter(att => att.id !== attachmentId)
      emit('update-note', props.note.content, { attachments })
    }
    
    function formatDate(dateString) {
      return dayjs(dateString).format('YYYY年MM月DD日 HH:mm')
    }
    
    function getWordCount() {
      if (props.note.type === 'checklist') {
        return props.note.checklist?.length || 0
      }
      
      const text = props.note.content.replace(/<[^>]*>/g, '').trim()
      return text.length
    }
    
    function getChecklistProgress() {
      if (!props.note.checklist) return '0/0'
      const completed = props.note.checklist.filter(item => item.completed).length
      const total = props.note.checklist.length
      return `${completed}/${total}`
    }
    
    // 监听器
    watch(() => props.note.title, (newTitle) => {
      localTitle.value = newTitle
    }, { immediate: true })
    
    watch(() => props.note.content, (newContent) => {
      if (quill && props.note.type === 'text') {
        const currentContent = quill.root.innerHTML
        if (currentContent !== newContent) {
          quill.root.innerHTML = newContent || ''
        }
      }
    })
    
    watch(() => props.note.type, async () => {
      if (props.note.type === 'text') {
        await nextTick()
        initQuillEditor()
      }
    })
    
    watch(() => settingsStore.fontSize, () => {
      applyEditorSettings()
    })
    
    watch(() => settingsStore.enableWordWrap, () => {
      applyEditorSettings()
    })
    
    watch(() => settingsStore.enableSpellCheck, () => {
      applyEditorSettings()
    })
    
    // 生命周期
    onMounted(() => {
      if (props.note.type === 'text') {
        nextTick(() => {
          initQuillEditor()
        })
      }
    })
    
    onUnmounted(() => {
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
      if (quill) {
        quill.off('text-change')
        quill = null
      }
    })
    
    return {
      quillEditor,
      localTitle,
      updateTitle,
      setEditorType,
      updateChecklist,
      removeAttachment,
      formatDate,
      getWordCount,
      getChecklistProgress
    }
  }
}
</script>

<style>
/* Quill编辑器样式自定义 */
.ql-editor {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif !important;
  font-size: 16px !important;
  line-height: 1.6 !important;
  padding: 20px !important;
  min-height: 200px !important;
}

.ql-toolbar {
  border: none !important;
  border-bottom: 1px solid #e5e5ea !important;
  padding: 12px 16px !important;
}

.dark .ql-toolbar {
  border-bottom-color: #38383a !important;
  background-color: #1c1c1e !important;
}

.ql-container {
  border: none !important;
  font-family: inherit !important;
}

.dark .ql-editor {
  background-color: #1c1c1e !important;
  color: #ffffff !important;
}

.dark .ql-editor::before {
  color: #8e8e93 !important;
}

/* Quill工具栏按钮样式 */
.ql-toolbar .ql-picker-label,
.ql-toolbar .ql-picker-options {
  color: inherit !important;
}

.dark .ql-toolbar .ql-stroke {
  stroke: #ffffff !important;
}

.dark .ql-toolbar .ql-fill {
  fill: #ffffff !important;
}

.dark .ql-toolbar .ql-picker-label {
  color: #ffffff !important;
}

.dark .ql-toolbar .ql-picker-options {
  background-color: #2c2c2e !important;
  border-color: #38383a !important;
}
</style>