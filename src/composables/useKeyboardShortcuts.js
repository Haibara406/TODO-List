import { onMounted, onUnmounted } from 'vue'

export function useKeyboardShortcuts(shortcuts) {
  function handleKeydown(event) {
    // 检查是否在输入框中
    const isInputActive = ['INPUT', 'TEXTAREA'].includes(event.target.tagName) ||
                         event.target.contentEditable === 'true'
    
    // 构建快捷键字符串
    const keys = []
    
    if (event.ctrlKey || event.metaKey) keys.push('cmd')
    if (event.shiftKey) keys.push('shift')
    if (event.altKey) keys.push('alt')
    
    // 获取按键名称
    let keyName = event.key.toLowerCase()
    
    // 特殊按键映射
    const keyMap = {
      ' ': 'space',
      'enter': 'enter',
      'escape': 'escape',
      'backspace': 'backspace',
      'delete': 'delete',
      'tab': 'tab',
      'arrowup': 'up',
      'arrowdown': 'down',
      'arrowleft': 'left',
      'arrowright': 'right'
    }
    
    if (keyMap[keyName]) {
      keyName = keyMap[keyName]
    }
    
    keys.push(keyName)
    const shortcut = keys.join('+')
    
    // 检查是否有匹配的快捷键
    if (shortcuts[shortcut]) {
      // 某些快捷键在输入框中不应该触发
      const inputBlacklist = ['cmd+a', 'cmd+c', 'cmd+v', 'cmd+x', 'cmd+z', 'cmd+y']
      
      if (isInputActive && inputBlacklist.includes(shortcut)) {
        return
      }
      
      event.preventDefault()
      shortcuts[shortcut](event)
    }
  }
  
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
  
  return {
    handleKeydown
  }
}