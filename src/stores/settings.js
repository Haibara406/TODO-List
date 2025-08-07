import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const isDarkMode = ref(false)
  const language = ref('zh-CN')
  const fontSize = ref('medium') // small, medium, large
  const autoSave = ref(true)
  const autoBackup = ref(true)
  const backupInterval = ref(24) // 小时
  const showLineNumbers = ref(false)
  const enableMarkdown = ref(true)
  const enableSpellCheck = ref(true)
  const enableNotifications = ref(true)
  const sidebarWidth = ref(320)
  const noteListWidth = ref(384)
  const editorTheme = ref('default') // default, minimal, focus
  const sortBy = ref('updatedAt') // createdAt, updatedAt, title
  const sortOrder = ref('desc') // asc, desc
  const defaultNoteType = ref('text') // text, checklist
  const enableWordWrap = ref(true)
  const enableAutoCorrect = ref(true)
  const enableRichText = ref(true)
  
  // 监听深色模式变化，自动应用到DOM
  watch(isDarkMode, (newValue) => {
    if (newValue) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, { immediate: true })
  
  // 监听字体大小变化
  watch(fontSize, (newValue) => {
    const root = document.documentElement
    switch (newValue) {
      case 'small':
        root.style.setProperty('--editor-font-size', '14px')
        break
      case 'large':
        root.style.setProperty('--editor-font-size', '18px')
        break
      default:
        root.style.setProperty('--editor-font-size', '16px')
    }
  }, { immediate: true })
  
  // 方法
  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    saveSettings()
  }
  
  function setLanguage(lang) {
    language.value = lang
    saveSettings()
  }
  
  function setFontSize(size) {
    fontSize.value = size
    saveSettings()
  }
  
  function updateSetting(key, value) {
    switch (key) {
      case 'autoSave':
        autoSave.value = value
        break
      case 'autoBackup':
        autoBackup.value = value
        break
      case 'backupInterval':
        backupInterval.value = value
        break
      case 'showLineNumbers':
        showLineNumbers.value = value
        break
      case 'enableMarkdown':
        enableMarkdown.value = value
        break
      case 'enableSpellCheck':
        enableSpellCheck.value = value
        break
      case 'enableNotifications':
        enableNotifications.value = value
        break
      case 'sidebarWidth':
        sidebarWidth.value = value
        break
      case 'noteListWidth':
        noteListWidth.value = value
        break
      case 'editorTheme':
        editorTheme.value = value
        break
      case 'sortBy':
        sortBy.value = value
        break
      case 'sortOrder':
        sortOrder.value = value
        break
      case 'defaultNoteType':
        defaultNoteType.value = value
        break
      case 'enableWordWrap':
        enableWordWrap.value = value
        break
      case 'enableAutoCorrect':
        enableAutoCorrect.value = value
        break
      case 'enableRichText':
        enableRichText.value = value
        break
    }
    saveSettings()
  }
  
  function resetSettings() {
    isDarkMode.value = false
    language.value = 'zh-CN'
    fontSize.value = 'medium'
    autoSave.value = true
    autoBackup.value = true
    backupInterval.value = 24
    showLineNumbers.value = false
    enableMarkdown.value = true
    enableSpellCheck.value = true
    enableNotifications.value = true
    sidebarWidth.value = 320
    noteListWidth.value = 384
    editorTheme.value = 'default'
    sortBy.value = 'updatedAt'
    sortOrder.value = 'desc'
    defaultNoteType.value = 'text'
    enableWordWrap.value = true
    enableAutoCorrect.value = true
    enableRichText.value = true
    saveSettings()
  }
  
  function getThemeConfig() {
    return {
      isDark: isDarkMode.value,
      fontSize: fontSize.value,
      theme: editorTheme.value
    }
  }
  
  function getEditorConfig() {
    return {
      showLineNumbers: showLineNumbers.value,
      enableMarkdown: enableMarkdown.value,
      enableSpellCheck: enableSpellCheck.value,
      enableWordWrap: enableWordWrap.value,
      enableAutoCorrect: enableAutoCorrect.value,
      enableRichText: enableRichText.value,
      theme: editorTheme.value
    }
  }
  
  function getSortConfig() {
    return {
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    }
  }
  
  // 数据持久化
  function saveSettings() {
    const settings = {
      isDarkMode: isDarkMode.value,
      language: language.value,
      fontSize: fontSize.value,
      autoSave: autoSave.value,
      autoBackup: autoBackup.value,
      backupInterval: backupInterval.value,
      showLineNumbers: showLineNumbers.value,
      enableMarkdown: enableMarkdown.value,
      enableSpellCheck: enableSpellCheck.value,
      enableNotifications: enableNotifications.value,
      sidebarWidth: sidebarWidth.value,
      noteListWidth: noteListWidth.value,
      editorTheme: editorTheme.value,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      defaultNoteType: defaultNoteType.value,
      enableWordWrap: enableWordWrap.value,
      enableAutoCorrect: enableAutoCorrect.value,
      enableRichText: enableRichText.value
    }
    
    localStorage.setItem('ios-notes-settings', JSON.stringify(settings))
  }
  
  function loadSettings() {
    try {
      const savedSettings = localStorage.getItem('ios-notes-settings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        
        isDarkMode.value = settings.isDarkMode ?? false
        language.value = settings.language ?? 'zh-CN'
        fontSize.value = settings.fontSize ?? 'medium'
        autoSave.value = settings.autoSave ?? true
        autoBackup.value = settings.autoBackup ?? true
        backupInterval.value = settings.backupInterval ?? 24
        showLineNumbers.value = settings.showLineNumbers ?? false
        enableMarkdown.value = settings.enableMarkdown ?? true
        enableSpellCheck.value = settings.enableSpellCheck ?? true
        enableNotifications.value = settings.enableNotifications ?? true
        sidebarWidth.value = settings.sidebarWidth ?? 320
        noteListWidth.value = settings.noteListWidth ?? 384
        editorTheme.value = settings.editorTheme ?? 'default'
        sortBy.value = settings.sortBy ?? 'updatedAt'
        sortOrder.value = settings.sortOrder ?? 'desc'
        defaultNoteType.value = settings.defaultNoteType ?? 'text'
        enableWordWrap.value = settings.enableWordWrap ?? true
        enableAutoCorrect.value = settings.enableAutoCorrect ?? true
        enableRichText.value = settings.enableRichText ?? true
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }
  
  // 检测系统主题
  function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      isDarkMode.value = true
    }
  }
  
  // 监听系统主题变化
  function watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addListener((e) => {
        if (e.matches) {
          isDarkMode.value = true
        } else {
          isDarkMode.value = false
        }
        saveSettings()
      })
    }
  }
  
  // 请求通知权限
  function requestNotificationPermission() {
    if ('Notification' in window && enableNotifications.value) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission !== 'granted') {
            enableNotifications.value = false
            saveSettings()
          }
        })
      }
    }
  }
  
  return {
    // 状态
    isDarkMode,
    language,
    fontSize,
    autoSave,
    autoBackup,
    backupInterval,
    showLineNumbers,
    enableMarkdown,
    enableSpellCheck,
    enableNotifications,
    sidebarWidth,
    noteListWidth,
    editorTheme,
    sortBy,
    sortOrder,
    defaultNoteType,
    enableWordWrap,
    enableAutoCorrect,
    enableRichText,
    
    // 方法
    toggleDarkMode,
    setLanguage,
    setFontSize,
    updateSetting,
    resetSettings,
    getThemeConfig,
    getEditorConfig,
    getSortConfig,
    
    // 数据管理
    saveSettings,
    loadSettings,
    detectSystemTheme,
    watchSystemTheme,
    requestNotificationPermission
  }
})