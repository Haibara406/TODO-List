<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
      <!-- 头部 -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-ios-text dark:text-ios-text-dark">
          {{ note?.isEncrypted ? '解密笔记' : '加密笔记' }}
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ note?.isEncrypted 
            ? '请输入密码来解密这个笔记' 
            : '设置密码来保护您的笔记'
          }}
        </p>
      </div>
      
      <!-- 内容 -->
      <div class="p-6 space-y-4">
        <!-- 密码输入 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ note?.isEncrypted ? '当前密码' : '设置密码' }}
          </label>
          <input
            v-model="password"
            type="password"
            placeholder="输入密码"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ios-accent dark:focus:ring-ios-accent-dark focus:border-transparent bg-white dark:bg-gray-700 text-ios-text dark:text-ios-text-dark"
            @keydown.enter="handleSubmit"
            ref="passwordInput"
          >
        </div>
        
        <!-- 确认密码 (仅在加密时显示) -->
        <div v-if="!note?.isEncrypted">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            确认密码
          </label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="再次输入密码"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ios-accent dark:focus:ring-ios-accent-dark focus:border-transparent bg-white dark:bg-gray-700 text-ios-text dark:text-ios-text-dark"
            @keydown.enter="handleSubmit"
          >
        </div>
        
        <!-- 密码强度指示器 (仅在设置密码时显示) -->
        <div v-if="!note?.isEncrypted && password" class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">密码强度</span>
            <span :class="strengthColor">{{ strengthText }}</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              :class="strengthColor.replace('text-', 'bg-')"
              :style="{ width: strengthPercentage + '%' }"
              class="h-2 rounded-full transition-all duration-300"
            ></div>
          </div>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        </div>
        
        <!-- 安全提示 -->
        <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div class="flex items-start space-x-2">
            <svg class="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <div class="text-sm text-yellow-700 dark:text-yellow-300">
              <p class="font-medium">重要提示</p>
              <p class="mt-1">
                {{ note?.isEncrypted 
                  ? '如果忘记密码，将无法恢复笔记内容。' 
                  : '请记住您的密码，忘记密码将无法恢复笔记内容。'
                }}
              </p>
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
          @click="handleSubmit"
          :disabled="!canSubmit"
          class="ios-button ios-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ note?.isEncrypted ? '解密' : '加密' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'

export default {
  name: 'EncryptModal',
  props: {
    note: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'encrypt', 'decrypt'],
  setup(props, { emit }) {
    const passwordInput = ref(null)
    const password = ref('')
    const confirmPassword = ref('')
    const error = ref('')
    
    // 密码强度计算
    const passwordStrength = computed(() => {
      const pwd = password.value
      if (!pwd) return 0
      
      let score = 0
      
      // 长度
      if (pwd.length >= 8) score += 1
      if (pwd.length >= 12) score += 1
      
      // 包含数字
      if (/\d/.test(pwd)) score += 1
      
      // 包含小写字母
      if (/[a-z]/.test(pwd)) score += 1
      
      // 包含大写字母
      if (/[A-Z]/.test(pwd)) score += 1
      
      // 包含特殊字符
      if (/[^A-Za-z0-9]/.test(pwd)) score += 1
      
      return score
    })
    
    const strengthPercentage = computed(() => {
      return (passwordStrength.value / 6) * 100
    })
    
    const strengthText = computed(() => {
      const strength = passwordStrength.value
      if (strength <= 2) return '弱'
      if (strength <= 4) return '中等'
      return '强'
    })
    
    const strengthColor = computed(() => {
      const strength = passwordStrength.value
      if (strength <= 2) return 'text-red-500'
      if (strength <= 4) return 'text-yellow-500'
      return 'text-green-500'
    })
    
    const canSubmit = computed(() => {
      if (props.note.isEncrypted) {
        return password.value.length > 0
      } else {
        return password.value.length >= 6 && 
               password.value === confirmPassword.value
      }
    })
    
    function handleSubmit() {
      if (!canSubmit.value) return
      
      error.value = ''
      
      if (props.note.isEncrypted) {
        // 解密
        emit('decrypt', password.value)
      } else {
        // 加密
        if (password.value.length < 6) {
          error.value = '密码至少需要6个字符'
          return
        }
        
        if (password.value !== confirmPassword.value) {
          error.value = '两次输入的密码不一致'
          return
        }
        
        emit('encrypt', password.value)
      }
    }
    
    onMounted(() => {
      nextTick(() => {
        if (passwordInput.value) {
          passwordInput.value.focus()
        }
      })
    })
    
    return {
      passwordInput,
      password,
      confirmPassword,
      error,
      passwordStrength,
      strengthPercentage,
      strengthText,
      strengthColor,
      canSubmit,
      handleSubmit
    }
  }
}
</script>