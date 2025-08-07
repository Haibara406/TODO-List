import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import CryptoJS from 'crypto-js'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const useNotesStore = defineStore('notes', () => {
  // 状态
  const notes = ref([])
  const folders = ref([])
  const currentNote = ref(null)
  const currentFolder = ref(null)
  const searchQuery = ref('')
  
  // 计算属性
  const filteredNotes = computed(() => {
    let result = notes.value
    
    // 按文件夹过滤
    if (currentFolder.value) {
      result = result.filter(note => note.folderId === currentFolder.value.id)
    }
    
    // 按搜索关键词过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      )
    }
    
    // 排序：置顶的在前，然后按更新时间排序
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
  })
  
  const pinnedNotes = computed(() => 
    notes.value.filter(note => note.isPinned)
  )
  
  const recentNotes = computed(() => 
    notes.value
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 10)
  )
  
  // 生成唯一ID
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
  
  // 笔记操作
  function createNote(folderId = null, noteData = {}) {
    const now = dayjs().format()
    const note = {
      id: generateId(),
      title: noteData.title || '新笔记',
      content: noteData.content || '',
      folderId: folderId,
      isPinned: false,
      isEncrypted: false,
      password: null,
      reminder: null,
      attachments: [],
      tags: [],
      type: noteData.type || 'text', // text, checklist
      checklist: [],
      createdAt: now,
      updatedAt: now,
      version: 1,
      history: []
    }
    
    notes.value.push(note)
    saveData()
    return note
  }
  
  function updateNote(noteId, updates) {
    const noteIndex = notes.value.findIndex(note => note.id === noteId)
    if (noteIndex === -1) return
    
    const note = notes.value[noteIndex]
    
    // 保存历史版本
    if (updates.content && updates.content !== note.content) {
      note.history.push({
        id: generateId(),
        content: note.content,
        timestamp: dayjs().format(),
        version: note.version
      })
      
      // 限制历史记录数量
      if (note.history.length > 50) {
        note.history = note.history.slice(-50)
      }
      
      note.version += 1
    }
    
    // 更新笔记
    Object.assign(note, updates, {
      updatedAt: dayjs().format()
    })
    
    saveData()
  }
  
  function deleteNote(noteId) {
    const index = notes.value.findIndex(note => note.id === noteId)
    if (index !== -1) {
      notes.value.splice(index, 1)
      saveData()
    }
  }
  
  function duplicateNote(noteId) {
    const note = getNoteById(noteId)
    if (note) {
      const duplicatedNote = {
        ...note,
        id: generateId(),
        title: note.title + ' 副本',
        createdAt: dayjs().format(),
        updatedAt: dayjs().format(),
        isPinned: false,
        history: []
      }
      notes.value.push(duplicatedNote)
      saveData()
      return duplicatedNote
    }
  }
  
  function togglePin(noteId) {
    const note = getNoteById(noteId)
    if (note) {
      note.isPinned = !note.isPinned
      note.updatedAt = dayjs().format()
      saveData()
    }
  }
  
  // 加密功能
  function encryptNote(noteId, password) {
    const note = getNoteById(noteId)
    if (note && !note.isEncrypted) {
      const encrypted = CryptoJS.AES.encrypt(note.content, password).toString()
      note.content = encrypted
      note.isEncrypted = true
      note.password = CryptoJS.SHA256(password).toString()
      note.updatedAt = dayjs().format()
      saveData()
    }
  }
  
  function decryptNote(noteId, password) {
    const note = getNoteById(noteId)
    if (note && note.isEncrypted) {
      const hashedPassword = CryptoJS.SHA256(password).toString()
      if (hashedPassword === note.password) {
        try {
          const decrypted = CryptoJS.AES.decrypt(note.content, password).toString(CryptoJS.enc.Utf8)
          note.content = decrypted
          note.isEncrypted = false
          note.password = null
          note.updatedAt = dayjs().format()
          saveData()
          return true
        } catch (error) {
          return false
        }
      }
    }
    return false
  }
  
  // 提醒功能
  function setReminder(noteId, reminderData) {
    const note = getNoteById(noteId)
    if (note) {
      note.reminder = reminderData
      note.updatedAt = dayjs().format()
      saveData()
      
      // 设置浏览器通知
      if (reminderData && reminderData.datetime) {
        scheduleNotification(note, reminderData)
      }
    }
  }
  
  function scheduleNotification(note, reminder) {
    const now = new Date()
    const reminderTime = new Date(reminder.datetime)
    const delay = reminderTime.getTime() - now.getTime()
    
    if (delay > 0) {
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification(`提醒：${note.title}`, {
            body: reminder.message || note.content.substring(0, 100),
            icon: '/note-icon.svg',
            tag: note.id
          })
        }
      }, delay)
    }
  }
  
  // 文件夹操作
  function createFolder(folderData) {
    const folder = {
      id: generateId(),
      name: folderData.name,
      color: folderData.color || '#007aff',
      icon: folderData.icon || '📁',
      createdAt: dayjs().format(),
      updatedAt: dayjs().format()
    }
    
    folders.value.push(folder)
    saveData()
    return folder
  }
  
  function updateFolder(folderId, updates) {
    const folder = getFolderById(folderId)
    if (folder) {
      Object.assign(folder, updates, {
        updatedAt: dayjs().format()
      })
      saveData()
    }
  }
  
  function deleteFolder(folderId) {
    // 移动文件夹中的笔记到根目录
    notes.value.forEach(note => {
      if (note.folderId === folderId) {
        note.folderId = null
      }
    })
    
    const index = folders.value.findIndex(folder => folder.id === folderId)
    if (index !== -1) {
      folders.value.splice(index, 1)
      saveData()
    }
  }
  
  // 清单功能
  function updateChecklist(noteId, checklist) {
    const note = getNoteById(noteId)
    if (note) {
      note.checklist = checklist
      note.type = 'checklist'
      note.updatedAt = dayjs().format()
      saveData()
    }
  }
  
  function addChecklistItem(noteId, item) {
    const note = getNoteById(noteId)
    if (note) {
      if (!note.checklist) note.checklist = []
      note.checklist.push({
        id: generateId(),
        text: item.text,
        completed: false,
        createdAt: dayjs().format()
      })
      note.type = 'checklist'
      note.updatedAt = dayjs().format()
      saveData()
    }
  }
  
  function toggleChecklistItem(noteId, itemId) {
    const note = getNoteById(noteId)
    if (note && note.checklist) {
      const item = note.checklist.find(item => item.id === itemId)
      if (item) {
        item.completed = !item.completed
        note.updatedAt = dayjs().format()
        saveData()
      }
    }
  }
  
  // 导出功能
  async function exportNote(noteId, format, options = {}) {
    const note = getNoteById(noteId)
    if (!note) return
    
    const filename = `${note.title}_${dayjs().format('YYYY-MM-DD')}`
    
    switch (format) {
      case 'html':
        exportAsHTML(note, filename, options)
        break
      case 'pdf':
        await exportAsPDF(note, filename, options)
        break
      case 'docx':
        exportAsDocx(note, filename, options)
        break
      case 'markdown':
        exportAsMarkdown(note, filename, options)
        break
      case 'txt':
        exportAsText(note, filename, options)
        break
    }
  }
  
  function exportAsHTML(note, filename, options) {
    const html = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${note.title}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            line-height: 1.6;
          }
          .note-header {
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .note-title { 
            font-size: 28px; 
            font-weight: bold; 
            margin: 0;
          }
          .note-meta {
            color: #666;
            font-size: 14px;
            margin-top: 10px;
          }
          .note-content {
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="note-header">
          <h1 class="note-title">${note.title}</h1>
          <div class="note-meta">
            创建时间: ${dayjs(note.createdAt).format('YYYY年MM月DD日 HH:mm')}
            ${note.updatedAt !== note.createdAt ? `<br>更新时间: ${dayjs(note.updatedAt).format('YYYY年MM月DD日 HH:mm')}` : ''}
          </div>
        </div>
        <div class="note-content">
          ${note.content}
        </div>
      </body>
      </html>
    `
    
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    saveAs(blob, `${filename}.html`)
  }
  
  async function exportAsPDF(note, filename, options) {
    const pdf = new jsPDF()
    
    // 设置中文字体支持
    pdf.setFont('helvetica')
    pdf.setFontSize(16)
    
    // 标题
    pdf.text(note.title, 20, 30)
    
    // 元信息
    pdf.setFontSize(10)
    pdf.text(`创建时间: ${dayjs(note.createdAt).format('YYYY-MM-DD HH:mm')}`, 20, 45)
    if (note.updatedAt !== note.createdAt) {
      pdf.text(`更新时间: ${dayjs(note.updatedAt).format('YYYY-MM-DD HH:mm')}`, 20, 55)
    }
    
    // 内容
    pdf.setFontSize(12)
    const content = note.content.replace(/<[^>]*>/g, '') // 移除HTML标签
    const lines = pdf.splitTextToSize(content, 170)
    pdf.text(lines, 20, 70)
    
    pdf.save(`${filename}.pdf`)
  }
  
  function exportAsMarkdown(note, filename, options) {
    let markdown = `# ${note.title}\n\n`
    markdown += `*创建时间: ${dayjs(note.createdAt).format('YYYY年MM月DD日 HH:mm')}*\n\n`
    if (note.updatedAt !== note.createdAt) {
      markdown += `*更新时间: ${dayjs(note.updatedAt).format('YYYY年MM月DD日 HH:mm')}*\n\n`
    }
    markdown += note.content.replace(/<[^>]*>/g, '') // 移除HTML标签
    
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    saveAs(blob, `${filename}.md`)
  }
  
  function exportAsText(note, filename, options) {
    let text = `${note.title}\n\n`
    text += `创建时间: ${dayjs(note.createdAt).format('YYYY年MM月DD日 HH:mm')}\n`
    if (note.updatedAt !== note.createdAt) {
      text += `更新时间: ${dayjs(note.updatedAt).format('YYYY年MM月DD日 HH:mm')}\n`
    }
    text += `\n${note.content.replace(/<[^>]*>/g, '')}`
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, `${filename}.txt`)
  }
  
  // 数据管理
  function exportData() {
    const data = {
      notes: notes.value,
      folders: folders.value,
      exportDate: dayjs().format(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json;charset=utf-8' 
    })
    saveAs(blob, `ios-notes-backup-${dayjs().format('YYYY-MM-DD')}.json`)
  }
  
  function importData(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
      
      if (data.notes && Array.isArray(data.notes)) {
        // 合并笔记，避免ID冲突
        data.notes.forEach(note => {
          if (!getNoteById(note.id)) {
            notes.value.push(note)
          }
        })
      }
      
      if (data.folders && Array.isArray(data.folders)) {
        // 合并文件夹，避免ID冲突
        data.folders.forEach(folder => {
          if (!getFolderById(folder.id)) {
            folders.value.push(folder)
          }
        })
      }
      
      saveData()
    } catch (error) {
      throw new Error('导入数据格式错误')
    }
  }
  
  // 辅助函数
  function getNoteById(id) {
    return notes.value.find(note => note.id === id)
  }
  
  function getFolderById(id) {
    return folders.value.find(folder => folder.id === id)
  }
  
  function setCurrentNote(note) {
    currentNote.value = note
  }
  
  function setCurrentFolder(folder) {
    currentFolder.value = folder
  }
  
  function setSearchQuery(query) {
    searchQuery.value = query
  }
  
  // 数据持久化
  function saveData() {
    const data = {
      notes: notes.value,
      folders: folders.value,
      lastSaved: dayjs().format()
    }
    localStorage.setItem('ios-notes-data', JSON.stringify(data))
  }
  
  function loadData() {
    try {
      const savedData = localStorage.getItem('ios-notes-data')
      if (savedData) {
        const data = JSON.parse(savedData)
        notes.value = data.notes || []
        folders.value = data.folders || []
        
        // 检查并设置提醒
        notes.value.forEach(note => {
          if (note.reminder && note.reminder.datetime) {
            scheduleNotification(note, note.reminder)
          }
        })
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }
  
  // 清理过期提醒
  function cleanupExpiredReminders() {
    const now = dayjs()
    notes.value.forEach(note => {
      if (note.reminder && note.reminder.datetime) {
        const reminderTime = dayjs(note.reminder.datetime)
        if (reminderTime.isBefore(now)) {
          note.reminder = null
          note.updatedAt = dayjs().format()
        }
      }
    })
    saveData()
  }
  
  return {
    // 状态
    notes,
    folders,
    currentNote,
    currentFolder,
    searchQuery,
    
    // 计算属性
    filteredNotes,
    pinnedNotes,
    recentNotes,
    
    // 笔记操作
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
    togglePin,
    
    // 加密操作
    encryptNote,
    decryptNote,
    
    // 提醒操作
    setReminder,
    
    // 文件夹操作
    createFolder,
    updateFolder,
    deleteFolder,
    
    // 清单操作
    updateChecklist,
    addChecklistItem,
    toggleChecklistItem,
    
    // 导出操作
    exportNote,
    exportData,
    importData,
    
    // 辅助函数
    getNoteById,
    getFolderById,
    setCurrentNote,
    setCurrentFolder,
    setSearchQuery,
    
    // 数据管理
    saveData,
    loadData,
    cleanupExpiredReminders
  }
})