<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
      <!-- 头部 -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-ios-text dark:text-ios-text-dark">
          {{ isEditing ? '编辑文件夹' : '新建文件夹' }}
        </h2>
      </div>
      
      <!-- 内容 -->
      <div class="p-6 space-y-4">
        <!-- 文件夹名称 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            文件夹名称
          </label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="输入文件夹名称"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ios-accent dark:focus:ring-ios-accent-dark focus:border-transparent bg-white dark:bg-gray-700 text-ios-text dark:text-ios-text-dark"
            @keydown.enter="save"
            ref="nameInput"
          >
        </div>
        
        <!-- 图标选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            选择图标
          </label>
          <div class="grid grid-cols-8 gap-2">
            <button
              v-for="icon in availableIcons"
              :key="icon"
              @click="formData.icon = icon"
              :class="[
                'w-10 h-10 rounded-lg border-2 transition-colors flex items-center justify-center text-lg',
                formData.icon === icon 
                  ? 'border-ios-accent bg-ios-accent bg-opacity-10' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              ]"
            >
              {{ icon }}
            </button>
          </div>
        </div>
        
        <!-- 颜色选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            选择颜色
          </label>
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="color in availableColors"
              :key="color.value"
              @click="formData.color = color.value"
              :class="[
                'w-10 h-10 rounded-lg border-2 transition-all',
                formData.color === color.value 
                  ? 'border-gray-800 dark:border-white scale-110' 
                  : 'border-transparent hover:scale-105'
              ]"
              :style="{ backgroundColor: color.value }"
              :title="color.name"
            >
              <svg 
                v-if="formData.color === color.value" 
                class="w-5 h-5 mx-auto text-white" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 预览 -->
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div class="flex items-center space-x-3">
            <span 
              class="text-2xl"
              :style="{ color: formData.color }"
            >
              {{ formData.icon }}
            </span>
            <div>
              <div class="font-medium text-ios-text dark:text-ios-text-dark">
                {{ formData.name || '文件夹名称' }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ isEditing ? '编辑预览' : '新建预览' }}
              </div>
            </div>
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
          @click="save"
          :disabled="!formData.name.trim()"
          class="ios-button ios-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isEditing ? '保存' : '创建' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'

export default {
  name: 'FolderModal',
  props: {
    folder: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const nameInput = ref(null)
    
    const isEditing = computed(() => !!props.folder)
    
    const formData = ref({
      name: '',
      icon: '📁',
      color: '#007aff'
    })
    
    const availableIcons = [
      '📁', '📂', '📋', '📊', '📈', '📉', '📌', '📍',
      '📝', '📄', '📃', '📑', '📜', '📰', '📓', '📔',
      '📕', '📗', '📘', '📙', '📚', '📖', '📒', '📉',
      '🏠', '🏢', '🏫', '🏥', '🏦', '🏪', '🏭', '🏯',
      '💼', '👔', '👕', '👖', '👗', '👠', '👡', '👢',
      '🎯', '🎨', '🎭', '🎪', '🎫', '🎬', '🎮', '🎲',
      '🔧', '🔨', '🔩', '🔪', '🔫', '🔬', '🔭', '🔮',
      '💡', '💰', '💳', '💎', '💍', '💊', '💉', '💈'
    ]
    
    const availableColors = [
      { name: '蓝色', value: '#007aff' },
      { name: '绿色', value: '#34c759' },
      { name: '红色', value: '#ff3b30' },
      { name: '橙色', value: '#ff9500' },
      { name: '黄色', value: '#ffcc02' },
      { name: '紫色', value: '#af52de' },
      { name: '粉色', value: '#ff2d92' },
      { name: '青色', value: '#5ac8fa' },
      { name: '靛青', value: '#5856d6' },
      { name: '棕色', value: '#a2845e' },
      { name: '灰色', value: '#8e8e93' },
      { name: '深灰', value: '#636366' }
    ]
    
    function save() {
      if (!formData.value.name.trim()) return
      
      emit('save', {
        name: formData.value.name.trim(),
        icon: formData.value.icon,
        color: formData.value.color
      })
    }
    
    // 初始化表单数据
    function initFormData() {
      if (props.folder) {
        formData.value = {
          name: props.folder.name || '',
          icon: props.folder.icon || '📁',
          color: props.folder.color || '#007aff'
        }
      }
    }
    
    onMounted(() => {
      initFormData()
      nextTick(() => {
        if (nameInput.value) {
          nameInput.value.focus()
          nameInput.value.select()
        }
      })
    })
    
    return {
      nameInput,
      isEditing,
      formData,
      availableIcons,
      availableColors,
      save
    }
  }
}
</script>