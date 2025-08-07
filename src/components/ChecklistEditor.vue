<template>
  <div class="h-full overflow-y-auto p-6">
    <div class="max-w-2xl mx-auto space-y-3">
      <!-- 清单项列表 -->
      <TransitionGroup name="checklist" tag="div" class="space-y-2">
        <div
          v-for="(item, index) in localChecklist"
          :key="item.id"
          class="flex items-start space-x-3 group"
        >
          <!-- 复选框 -->
          <button
            @click="toggleItem(index)"
            :class="[
              'flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 mt-0.5',
              item.completed 
                ? 'bg-ios-green border-ios-green text-white' 
                : 'border-gray-300 dark:border-gray-600 hover:border-ios-green'
            ]"
          >
            <svg 
              v-if="item.completed" 
              class="w-3 h-3 m-auto" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>
          
          <!-- 文本输入框 -->
          <div class="flex-1">
            <input
              v-model="item.text"
              @blur="updateItem(index)"
              @keydown.enter="addNewItem(index + 1)"
              @keydown.backspace="handleBackspace(index, $event)"
              @keydown.delete="handleDelete(index, $event)"
              :class="[
                'w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-ios-text dark:text-ios-text-dark placeholder-gray-400',
                item.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
              ]"
              :placeholder="index === 0 ? '添加新项目...' : ''"
              :ref="el => { if (el) inputRefs[index] = el }"
            >
          </div>
          
          <!-- 删除按钮 -->
          <button
            v-if="localChecklist.length > 1"
            @click="removeItem(index)"
            class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
            title="删除项目"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
      
      <!-- 添加新项目按钮 -->
      <button
        @click="addNewItem()"
        class="flex items-center space-x-2 text-ios-accent dark:text-ios-accent-dark hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors w-full text-left"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        <span>添加项目</span>
      </button>
      
      <!-- 统计信息 -->
      <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>总计: {{ localChecklist.length }} 项</span>
          <span>已完成: {{ completedCount }} 项</span>
          <span>进度: {{ progressPercentage }}%</span>
        </div>
        
        <!-- 进度条 -->
        <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            :style="{ width: progressPercentage + '%' }"
            class="bg-ios-green h-2 rounded-full transition-all duration-300"
          ></div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="mt-6 flex items-center space-x-3">
        <button
          @click="markAllCompleted"
          :disabled="completedCount === localChecklist.length"
          class="ios-button ios-button-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          全部完成
        </button>
        
        <button
          @click="clearCompleted"
          :disabled="completedCount === 0"
          class="ios-button ios-button-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          清除已完成
        </button>
        
        <button
          @click="sortItems"
          class="ios-button ios-button-secondary text-sm"
        >
          {{ sortByCompleted ? '恢复排序' : '已完成置底' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'

export default {
  name: 'ChecklistEditor',
  props: {
    checklist: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const localChecklist = ref([])
    const inputRefs = ref({})
    const sortByCompleted = ref(false)
    
    // 计算属性
    const completedCount = computed(() => 
      localChecklist.value.filter(item => item.completed).length
    )
    
    const progressPercentage = computed(() => {
      if (localChecklist.value.length === 0) return 0
      return Math.round((completedCount.value / localChecklist.value.length) * 100)
    })
    
    // 初始化清单
    function initChecklist() {
      if (props.checklist && props.checklist.length > 0) {
        localChecklist.value = [...props.checklist]
      } else {
        localChecklist.value = [createNewItem('')]
      }
    }
    
    function createNewItem(text = '') {
      return {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        text,
        completed: false,
        createdAt: new Date().toISOString()
      }
    }
    
    function toggleItem(index) {
      localChecklist.value[index].completed = !localChecklist.value[index].completed
      emitUpdate()
    }
    
    function updateItem(index) {
      emitUpdate()
    }
    
    function addNewItem(index = null) {
      const newItem = createNewItem('')
      
      if (index !== null) {
        localChecklist.value.splice(index, 0, newItem)
      } else {
        localChecklist.value.push(newItem)
      }
      
      // 聚焦到新项目的输入框
      nextTick(() => {
        const targetIndex = index !== null ? index : localChecklist.value.length - 1
        const input = inputRefs.value[targetIndex]
        if (input) {
          input.focus()
        }
      })
      
      emitUpdate()
    }
    
    function removeItem(index) {
      if (localChecklist.value.length > 1) {
        localChecklist.value.splice(index, 1)
        emitUpdate()
      }
    }
    
    function handleBackspace(index, event) {
      const item = localChecklist.value[index]
      if (item.text === '' && localChecklist.value.length > 1) {
        event.preventDefault()
        removeItem(index)
        
        // 聚焦到上一个项目
        const prevIndex = Math.max(0, index - 1)
        nextTick(() => {
          const input = inputRefs.value[prevIndex]
          if (input) {
            input.focus()
          }
        })
      }
    }
    
    function handleDelete(index, event) {
      const item = localChecklist.value[index]
      if (item.text === '' && localChecklist.value.length > 1) {
        event.preventDefault()
        removeItem(index)
      }
    }
    
    function markAllCompleted() {
      localChecklist.value.forEach(item => {
        item.completed = true
      })
      emitUpdate()
    }
    
    function clearCompleted() {
      const incomplete = localChecklist.value.filter(item => !item.completed)
      if (incomplete.length === 0) {
        localChecklist.value = [createNewItem('')]
      } else {
        localChecklist.value = incomplete
      }
      emitUpdate()
    }
    
    function sortItems() {
      if (sortByCompleted.value) {
        // 恢复原始排序（按创建时间）
        localChecklist.value.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        )
        sortByCompleted.value = false
      } else {
        // 已完成的项目移到底部
        localChecklist.value.sort((a, b) => {
          if (a.completed && !b.completed) return 1
          if (!a.completed && b.completed) return -1
          return new Date(a.createdAt) - new Date(b.createdAt)
        })
        sortByCompleted.value = true
      }
      emitUpdate()
    }
    
    function emitUpdate() {
      // 过滤掉空的项目（除了最后一个）
      const filtered = localChecklist.value.filter((item, index) => 
        item.text.trim() !== '' || index === localChecklist.value.length - 1
      )
      
      emit('update', filtered)
    }
    
    // 监听器
    watch(() => props.checklist, () => {
      initChecklist()
    }, { immediate: true, deep: true })
    
    return {
      localChecklist,
      inputRefs,
      sortByCompleted,
      completedCount,
      progressPercentage,
      toggleItem,
      updateItem,
      addNewItem,
      removeItem,
      handleBackspace,
      handleDelete,
      markAllCompleted,
      clearCompleted,
      sortItems
    }
  }
}
</script>

<style scoped>
/* 动画效果 */
.checklist-enter-active,
.checklist-leave-active {
  transition: all 0.3s ease;
}

.checklist-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.checklist-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.checklist-move {
  transition: transform 0.3s ease;
}
</style>