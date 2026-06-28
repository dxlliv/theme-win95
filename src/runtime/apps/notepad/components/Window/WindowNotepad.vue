<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfirm } from 'primevue/useconfirm'
import type { IWindowController } from '@owdproject/core'

const props = defineProps<{
  window: IWindowController
}>()

const { t } = useI18n()
const confirm = useConfirm()

const mounted = ref(false)
const wordWrap = ref(true)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

interface NotepadTab {
  id: string
  title: string
  text: string
  savedText: string
  filePath: string | null
  fileHandle: any | null
  isDirty: boolean
  history: string[]
  historyIndex: number
}

const tabs = ref<NotepadTab[]>([])
const activeTabId = ref('')

const activeTab = computed(() => {
  return tabs.value.find(t => t.id === activeTabId.value) || tabs.value[0]
})

const text = computed({
  get() {
    return activeTab.value?.text ?? ''
  },
  set(val) {
    if (activeTab.value) {
      activeTab.value.text = val
      activeTab.value.isDirty = val !== activeTab.value.savedText
    }
  }
})

const filePath = computed({
  get() { return activeTab.value?.filePath ?? null },
  set(val) { if (activeTab.value) activeTab.value.filePath = val }
})

const fileHandle = computed({
  get() { return activeTab.value?.fileHandle ?? null },
  set(val) { if (activeTab.value) activeTab.value.fileHandle = val }
})

const savedText = computed({
  get() { return activeTab.value?.savedText ?? '' },
  set(val) { if (activeTab.value) activeTab.value.savedText = val }
})

const isDirty = computed({
  get() { return activeTab.value?.isDirty ?? false },
  set(val) { if (activeTab.value) activeTab.value.isDirty = val }
})

const fileName = computed(() => {
  if (!filePath.value) return ''
  const parts = filePath.value.split('/')
  return parts.pop() || ''
})

const activeTheme = computed(() => {
  const theme = props.window.application.config.theme || 'win95'
  return theme.includes('win95') ? 'win95' : 'nova'
})

function createTab(title?: string, content = '', path: string | null = null, handle: any = null) {
  const defaultTitle = title || `${t('apps.notepad.untitled', 'Untitled')} ${tabs.value.length + 1}`
  const newTabId = `tab-${Math.random().toString(36).substring(2, 9)}`
  
  const newTab: NotepadTab = {
    id: newTabId,
    title: defaultTitle,
    text: content,
    savedText: content,
    filePath: path,
    fileHandle: handle,
    isDirty: false,
    history: [content],
    historyIndex: 0
  }
  
  tabs.value.push(newTab)
  activeTabId.value = newTabId
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

// History tracking
function saveHistory(val: string) {
  const tab = activeTab.value
  if (!tab) return
  if (tab.historyIndex >= 0 && tab.history[tab.historyIndex] === val) return

  tab.history = tab.history.slice(0, tab.historyIndex + 1)
  tab.history.push(val)
  if (tab.history.length > 50) {
    tab.history.shift()
  }
  tab.historyIndex = tab.history.length - 1
}

let historyDebounceTimer: any = null
function onTextareaInput() {
  clearTimeout(historyDebounceTimer)
  historyDebounceTimer = setTimeout(() => {
    saveHistory(text.value)
  }, 500)
}

// Unsaved changes dialog state
type PendingAction = 'new' | 'open' | 'close-tab' | 'close-tab-sequential' | 'exit' | null
const pendingAction = ref<PendingAction>(null)
const pendingTabId = ref<string | null>(null)
const showUnsavedDialog = ref(false)

const dirtyTabsToClose = ref<string[]>([])
const pendingCloseWindow = ref(false)

function updateWindowTitle() {
  const name = filePath.value ? fileName.value : (activeTab.value?.title || t('apps.notepad.untitled', 'Untitled'))
  props.window.override.windowTitle = `${name} - Notepad`
}

watch([activeTabId, filePath, fileName], () => {
  updateWindowTitle()
})

// Check for unsaved changes before destructive actions
function checkUnsavedChanges(action: PendingAction): boolean {
  if (isDirty.value) {
    pendingAction.value = action
    showUnsavedDialog.value = true
    return true
  }
  return false
}

// Close individual tab
function closeTab(tabId: string) {
  const tabIndex = tabs.value.findIndex(x => x.id === tabId)
  if (tabIndex === -1) return

  const tab = tabs.value[tabIndex]
  if (tab.isDirty) {
    activeTabId.value = tabId
    pendingTabId.value = tabId
    pendingAction.value = 'close-tab'
    showUnsavedDialog.value = true
  } else {
    performCloseTab(tabId)
  }
}

function performCloseTab(tabId: string) {
  const tabIndex = tabs.value.findIndex(x => x.id === tabId)
  if (tabIndex === -1) return

  tabs.value.splice(tabIndex, 1)

  if (tabs.value.length === 0) {
    // If no tabs left, destroy window
    props.window.destroy()
    return
  }

  if (activeTabId.value === tabId) {
    const nextActiveIndex = Math.min(tabIndex, tabs.value.length - 1)
    activeTabId.value = tabs.value[nextActiveIndex].id
  }
}

// Menu actions
function triggerNew() {
  if (checkUnsavedChanges('new')) return
  resetEditor()
}

function resetEditor() {
  if (activeTab.value) {
    activeTab.value.text = ''
    activeTab.value.savedText = ''
    activeTab.value.filePath = null
    activeTab.value.fileHandle = null
    activeTab.value.isDirty = false
    activeTab.value.history = ['']
    activeTab.value.historyIndex = 0
    updateWindowTitle()
  }
}

async function loadVfs() {
  try {
    const { fs } = await import('@zenfs/core')
    return fs
  } catch {
    return null
  }
}

async function loadFile(path: string) {
  try {
    const fs = await loadVfs()
    if (fs && fs.existsSync(path)) {
      const content = fs.readFileSync(path, 'utf8') as string
      
      // Look for a tab already showing this path
      const existingTab = tabs.value.find(t => t.filePath === path)
      if (existingTab) {
        activeTabId.value = existingTab.id
        return
      }
      
      // If active tab is pristine, overwrite it. Otherwise open new tab.
      if (tabs.value.length === 1 && !isDirty.value && !filePath.value && text.value === '') {
        text.value = content
        savedText.value = content
        filePath.value = path
        isDirty.value = false
        activeTab.value.history = [content]
        activeTab.value.historyIndex = 0
        activeTab.value.title = path.split('/').pop() || path
        updateWindowTitle()
      } else {
        createTab(path.split('/').pop(), content, path)
      }
    }
  } catch (e) {
    console.error('Failed to load file from VFS', e)
  }
}

async function triggerOpen() {
  if (checkUnsavedChanges('open')) return

  if (typeof window.showOpenFilePicker === 'function') {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{
          description: 'Text Files (*.txt)',
          accept: { 'text/plain': ['.txt'] }
        }]
      })
      const file = await handle.getFile()
      const content = await file.text()
      
      createTab(file.name, content, file.name, handle)
    } catch (e) {
      console.warn('Native open picker canceled/failed', e)
    }
  } else {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.txt,text/plain'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const content = await file.text()
        createTab(file.name, content, file.name)
      }
    }
    input.click()
  }
}

async function triggerSave() {
  if (!filePath.value && !fileHandle.value) {
    await triggerSaveAs()
    return
  }

  if (filePath.value && filePath.value.startsWith('/')) {
    try {
      const fs = await loadVfs()
      if (fs) {
        fs.writeFileSync(filePath.value, text.value, 'utf8')
        savedText.value = text.value
        isDirty.value = false
      }
    } catch (e) {
      console.error('Failed to save to VFS', e)
    }
  } else if (fileHandle.value) {
    try {
      const writable = await fileHandle.value.createWritable()
      await writable.write(text.value)
      await writable.close()
      savedText.value = text.value
      isDirty.value = false
    } catch (e) {
      console.error('Failed to save to Native handle', e)
    }
  } else {
    downloadFile(filePath.value || 'Untitled.txt', text.value)
    savedText.value = text.value
    isDirty.value = false
  }
}

async function triggerSaveAs() {
  const fs = await loadVfs()
  if (fs) {
    const defaultPath = filePath.value && filePath.value.startsWith('/') ? filePath.value : '/Documents/Untitled.txt'
    const vpath = prompt(t('apps.notepad.saveToVfs', 'Save to virtual filesystem path:'), defaultPath)
    if (vpath) {
      try {
        fs.writeFileSync(vpath, text.value, 'utf8')
        filePath.value = vpath
        activeTab.value.title = vpath.split('/').pop() || vpath
        savedText.value = text.value
        isDirty.value = false
        updateWindowTitle()
        return
      } catch (e) {
        alert('Failed to save to virtual path: ' + e)
      }
    } else if (vpath === null) {
      return
    }
  }

  if (typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filePath.value ? fileName.value : 'Untitled.txt',
        types: [{
          description: 'Text Files (*.txt)',
          accept: { 'text/plain': ['.txt'] }
        }]
      })
      const writable = await handle.createWritable()
      await writable.write(text.value)
      await writable.close()
      fileHandle.value = handle
      filePath.value = (await handle.getFile()).name
      activeTab.value.title = filePath.value
      savedText.value = text.value
      isDirty.value = false
      updateWindowTitle()
    } catch (e) {
      console.warn('Native save picker canceled/failed', e)
    }
  } else {
    const name = prompt(t('apps.notepad.enterFilename', 'Save As (filename):'), filePath.value ? fileName.value : 'Untitled.txt')
    if (name) {
      downloadFile(name, text.value)
      filePath.value = name
      activeTab.value.title = name
      savedText.value = text.value
      isDirty.value = false
      updateWindowTitle()
    }
  }
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function triggerPrint() {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`<pre style="font-family: monospace; white-space: pre-wrap;">${text.value}</pre>`)
    printWindow.document.close()
    printWindow.print()
  }
}

function triggerExit() {
  props.window.destroy()
}

// Edit operations
function triggerUndo() {
  const tab = activeTab.value
  if (tab && tab.historyIndex > 0) {
    tab.historyIndex--
    text.value = tab.history[tab.historyIndex]
  }
}

function triggerCut() {
  const ta = textareaRef.value
  if (!ta) return
  const start = ta.selectionStart
  const end = ta.selectionEnd
  const selectedText = ta.value.substring(start, end)
  if (selectedText) {
    navigator.clipboard.writeText(selectedText)
    const val = ta.value
    text.value = val.substring(0, start) + val.substring(end)
    saveHistory(text.value)
    nextTick(() => {
      ta.selectionStart = ta.selectionEnd = start
      ta.focus()
    })
  }
}

function triggerCopy() {
  const ta = textareaRef.value
  if (!ta) return
  const selectedText = ta.value.substring(ta.selectionStart, ta.selectionEnd)
  if (selectedText) {
    navigator.clipboard.writeText(selectedText)
  }
}

function triggerPaste() {
  const ta = textareaRef.value
  if (!ta) return
  const start = ta.selectionStart
  const end = ta.selectionEnd
  navigator.clipboard.readText().then((clipText) => {
    const val = ta.value
    text.value = val.substring(0, start) + clipText + val.substring(end)
    saveHistory(text.value)
    nextTick(() => {
      ta.selectionStart = ta.selectionEnd = start + clipText.length
      ta.focus()
    })
  })
}

function triggerDelete() {
  const ta = textareaRef.value
  if (!ta) return
  const start = ta.selectionStart
  const end = ta.selectionEnd
  if (start !== end) {
    const val = ta.value
    text.value = val.substring(0, start) + val.substring(end)
    saveHistory(text.value)
    nextTick(() => {
      ta.selectionStart = ta.selectionEnd = start
      ta.focus()
    })
  }
}

function triggerSelectAll() {
  const ta = textareaRef.value
  if (!ta) return
  ta.select()
  ta.focus()
}

function triggerTimeDate() {
  const ta = textareaRef.value
  if (!ta) return
  const start = ta.selectionStart
  const end = ta.selectionEnd
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const timeDateStr = `${hours}:${minutes} ${day}/${month}/${year}`

  const val = ta.value
  text.value = val.substring(0, start) + timeDateStr + val.substring(end)
  saveHistory(text.value)
  nextTick(() => {
    ta.selectionStart = ta.selectionEnd = start + timeDateStr.length
    ta.focus()
  })
}

function triggerHelp() {
  alert(t('apps.notepad.helpText', 'Notepad is a simple text editor for creating and editing plain text documents.'))
}

function triggerAbout() {
  confirm.require({
    header: t('apps.notepad.aboutTitle', 'About Notepad'),
    message: t('apps.notepad.aboutText', 'Notepad for Open Web Desktop\nVersion 1.0\n\nCopyright (C) 2026 OWD Project.'),
    acceptProps: {
      label: 'OK',
      class: 'win95-btn',
    },
    rejectProps: {
      class: 'hidden',
    },
  })
}

// Build standard window menu items
function updateMenu() {
  const menuItems = [
    {
      label: t('apps.explorer.menu.file', 'File'),
      items: [
        { label: t('apps.explorer.action.new', 'New'), command: triggerNew },
        { label: t('apps.explorer.action.open', 'Open...'), command: triggerOpen },
        { label: t('apps.explorer.action.save', 'Save'), command: triggerSave },
        { label: t('apps.explorer.action.saveAs', 'Save As...'), command: triggerSaveAs },
        { separator: true },
        { label: t('fs.contextMenu.print', 'Print'), command: triggerPrint },
        { separator: true },
        { label: t('apps.explorer.action.close', 'Exit'), command: triggerExit }
      ]
    },
    {
      label: t('apps.explorer.menu.edit', 'Edit'),
      items: [
        { label: t('apps.explorer.action.undo', 'Undo'), command: triggerUndo },
        { separator: true },
        { label: t('fs.contextMenu.cut', 'Cut'), command: triggerCut },
        { label: t('fs.contextMenu.copy', 'Copy'), command: triggerCopy },
        { label: t('apps.explorer.action.paste', 'Paste'), command: triggerPaste },
        { label: t('fs.contextMenu.delete', 'Delete'), command: triggerDelete },
        { separator: true },
        { label: t('apps.explorer.action.selectAll', 'Select All'), command: triggerSelectAll },
        { label: t('apps.notepad.timeDate', 'Time/Date'), command: triggerTimeDate },
        { separator: true },
        {
          label: (wordWrap.value ? '✓ ' : '   ') + t('apps.notepad.wordWrap', 'Word Wrap'),
          command: () => { wordWrap.value = !wordWrap.value }
        }
      ]
    },
    {
      label: t('apps.explorer.menu.help', 'Help'),
      items: [
        { label: t('apps.notepad.helpTopics', 'Help Topics'), command: triggerHelp },
        { separator: true },
        { label: t('apps.explorer.action.about', 'About Notepad'), command: triggerAbout }
      ]
    }
  ]
  props.window.setMenu(menuItems)
}

// Watchers to update menus dynamically
watch(wordWrap, () => {
  updateMenu()
})

// Process closing of multiple tabs sequentially
function processNextDirtyTab() {
  if (dirtyTabsToClose.value.length > 0) {
    const nextId = dirtyTabsToClose.value[0]
    activeTabId.value = nextId
    pendingAction.value = 'close-tab-sequential'
    showUnsavedDialog.value = true
  } else {
    pendingCloseWindow.value = false
    props.window.destroy()
  }
}

// Initialize
onMounted(() => {
  updateMenu()
  mounted.value = true

  // Intercept window destruction to verify unsaved changes across all tabs
  const originalDestroy = props.window.destroy.bind(props.window)
  props.window.destroy = () => {
    const dirty = tabs.value.filter(t => t.isDirty).map(t => t.id)
    if (dirty.length > 0) {
      dirtyTabsToClose.value = dirty
      pendingCloseWindow.value = true
      processNextDirtyTab()
      return false
    }
    return originalDestroy()
  }

  // Load VFS path or open new blank tab
  if (props.window.meta.path) {
    createTab(props.window.meta.path.split('/').pop(), '', props.window.meta.path)
    loadFile(props.window.meta.path)
  } else {
    createTab()
    updateWindowTitle()
  }
})

// Unsaved changes dialog handlers
function handleUnsavedYes() {
  showUnsavedDialog.value = false
  triggerSave().then(() => {
    if (!activeTab.value.isDirty) {
      executePendingTabAction()
    }
  })
}

function handleUnsavedNo() {
  showUnsavedDialog.value = false
  if (activeTab.value) {
    activeTab.value.isDirty = false
    activeTab.value.savedText = activeTab.value.text
  }
  executePendingTabAction()
}

function cancelUnsavedAction() {
  showUnsavedDialog.value = false
  pendingAction.value = null
  pendingTabId.value = null
  dirtyTabsToClose.value = []
  pendingCloseWindow.value = false
}

function executePendingTabAction() {
  const action = pendingAction.value
  pendingAction.value = null
  if (action === 'new') {
    resetEditor()
  } else if (action === 'open') {
    triggerOpen()
  } else if (action === 'close-tab') {
    const id = pendingTabId.value
    pendingTabId.value = null
    if (id) performCloseTab(id)
  } else if (action === 'close-tab-sequential') {
    const id = dirtyTabsToClose.value.shift()
    if (id) {
      const index = tabs.value.findIndex(x => x.id === id)
      if (index !== -1) tabs.value.splice(index, 1)
      processNextDirtyTab()
    }
  }
}
</script>

<template>
  <DesktopWindow :window="window" class="owd-window--notepad">
    <div class="notepad-editor-container">
      
      <!-- Teleport tabs to the standardized header extension slot -->
      <Teleport :to="'#owd-window-header-extension-' + window.state.id" v-if="mounted">
        <div class="notepad-tabs-container" :class="'notepad-tabs-container--' + activeTheme">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            class="notepad-tab"
            :class="{ 'notepad-tab--active': tab.id === activeTabId }"
            @click="activeTabId = tab.id"
          >
            <span class="notepad-tab__title">
              {{ tab.title }}
              <span v-if="tab.isDirty" class="notepad-tab__dirty">*</span>
            </span>
            <button type="button" class="notepad-tab__close" @click.stop="closeTab(tab.id)">✕</button>
          </div>
          <button type="button" class="notepad-tab-add" @click="createTab()">+</button>
        </div>
      </Teleport>

      <div class="notepad-textarea-wrapper">
        <textarea
          ref="textareaRef"
          v-model="text"
          class="notepad-textarea"
          :wrap="wordWrap ? 'soft' : 'off'"
          @input="onTextareaInput"
        />
      </div>

      <!-- Unsaved Changes Prompt (Win95 style modal dialog) -->
      <div v-if="showUnsavedDialog" class="unsaved-dialog-mask" @mousedown.stop>
        <div class="win95-dialog">
          <div class="win95-dialog-header">
            <span>Notepad</span>
            <button class="win95-dialog-close" @click="cancelUnsavedAction">✕</button>
          </div>
          <div class="win95-dialog-body">
            <div class="win95-dialog-content">
              <span class="win95-warning-icon">
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="14" fill="#F8C000" stroke="#000000" stroke-width="2" />
                  <rect x="14" y="7" width="4" height="10" fill="#000000" />
                  <rect x="14" y="20" width="4" height="4" fill="#000000" />
                </svg>
              </span>
              <p class="win95-dialog-text">
                {{ $t('apps.notepad.unsavedChanges', { file: fileName || activeTab?.title }) }}
              </p>
            </div>
            <div class="win95-dialog-buttons">
              <Button class="win95-btn" @click="handleUnsavedYes">Yes</Button>
              <Button class="win95-btn" @click="handleUnsavedNo">No</Button>
              <Button class="win95-btn" @click="cancelUnsavedAction">Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DesktopWindow>
</template>

<style scoped lang="scss">
.notepad-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1px;
  position: relative;
}

.notepad-textarea-wrapper {
  flex: 1;
  min-height: 0;
  background: white;
  border: 2px solid;
  border-color: rgb(var(--owd-theme-color-dark)) rgb(var(--owd-theme-color-white)) rgb(var(--owd-theme-color-white)) rgb(var(--owd-theme-color-dark));
  box-shadow:
    inset 0 2px 0 0 rgb(var(--owd-theme-color-black)),
    inset -2px 0 0 0 rgb(var(--owd-theme-color-super-light)),
    inset 0 -2px 0 0 rgb(var(--owd-theme-color-super-light)),
    inset 2px 0 0 0 rgb(var(--owd-theme-color-black));
  position: relative;
  display: flex;
}

.notepad-textarea {
  flex: 1;
  width: 100%;
  height: 100%;
  border: 0;
  margin: 0;
  padding: 4px;
  resize: none;
  outline: none;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  background: white;
  color: black;
  box-sizing: border-box;
}

// Tab Container Common
.notepad-tabs-container {
  display: flex;
  align-items: flex-end;
  padding: 2px 4px 0;
  gap: 2px;
  user-select: none;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

/* --- Win95 Theme Tabs --- */
.notepad-tabs-container--win95 {
  background: rgb(var(--owd-theme-color-light));
  border-bottom: 2px solid rgb(var(--owd-theme-color-white));
  font-family: var(--owd-font-family);
  font-size: 12px;
  gap: 2px;
  padding-bottom: 0;

  .notepad-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px 2px;
    background: rgb(var(--owd-theme-color-light));
    border-style: solid;
    border-width: 2px 2px 0 2px;
    border-color: rgb(var(--owd-theme-color-white)) rgb(var(--owd-theme-color-dark)) transparent rgb(var(--owd-theme-color-white));
    margin-bottom: -2px;
    cursor: default;
    color: black;
    height: 22px;

    &--active {
      padding-top: 4px;
      padding-bottom: 4px;
      margin-top: -2px;
      background: rgb(var(--owd-theme-color-light));
      border-color: rgb(var(--owd-theme-color-white)) rgb(var(--owd-theme-color-dark)) transparent rgb(var(--owd-theme-color-white));
      font-weight: bold;
      height: 24px;
      z-index: 2;
    }

    &__close {
      background: transparent;
      border: 0;
      font-size: 9px;
      cursor: default;
      color: rgb(var(--owd-theme-color-dark));
      padding: 0 2px;
      line-height: 1;

      &:hover {
        color: black;
        font-weight: bold;
      }
    }
  }

  .notepad-tab-add {
    background: rgb(var(--owd-theme-color-light));
    border: 2px solid;
    border-color: rgb(var(--owd-theme-color-white)) rgb(var(--owd-theme-color-dark)) rgb(var(--owd-theme-color-dark)) rgb(var(--owd-theme-color-white));
    font-size: 12px;
    line-height: 10px;
    width: 18px;
    height: 18px;
    margin-bottom: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    color: black;

    &:active {
      border-color: rgb(var(--owd-theme-color-dark)) rgb(var(--owd-theme-color-white)) rgb(var(--owd-theme-color-white)) rgb(var(--owd-theme-color-dark));
    }
  }
}

/* --- Nova Theme Tabs --- */
.notepad-tabs-container--nova {
  background: var(--nova-window-header-focused-bg, rgba(0, 0, 0, 0.2));
  border-bottom: 1px solid var(--nova-window-nav-divider, rgba(255, 255, 255, 0.08));
  font-family: var(--owd-font-family);
  font-size: 13px;
  padding: 4px 8px 0;
  gap: 4px;

  .notepad-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: transparent;
    border-radius: 6px 6px 0 0;
    color: rgba(255, 255, 255, 0.6);
    cursor: default;
    transition: all 0.15s ease;
    border: 1px solid transparent;
    margin-bottom: -1px;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.8);
    }

    &--active {
      background: var(--nova-window-body-bg, #1a1e24);
      color: var(--nova-window-text, #fff);
      border-color: var(--nova-window-nav-divider, rgba(255, 255, 255, 0.08)) var(--nova-window-nav-divider, rgba(255, 255, 255, 0.08)) transparent var(--nova-window-nav-divider, rgba(255, 255, 255, 0.08));
      z-index: 2;
    }

    &__close {
      background: transparent;
      border: 0;
      font-size: 10px;
      cursor: default;
      color: rgba(255, 255, 255, 0.4);
      padding: 2px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      transition: all 0.12s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
      }
    }
  }

  .notepad-tab-add {
    background: transparent;
    border: 0;
    border-radius: 4px;
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 16px;
    cursor: default;
    margin-bottom: 3px;
    transition: all 0.15s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
    }
  }
}

// Unsaved changes dialog styles
.unsaved-dialog-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.win95-dialog {
  background: rgb(var(--owd-theme-color-light));
  border: var(--owd-border-width) solid;
  border-color: var(--p-card-border-color);
  box-shadow: var(--p-card-box-shadow);
  padding: var(--owd-border-width);
  width: 320px;
  display: flex;
  flex-direction: column;
}

.win95-dialog-header {
  background: rgb(var(--owd-elevation-active-background));
  color: rgb(var(--owd-elevation-active-color));
  font-weight: bold;
  height: 18px;
  font-size: 12px;
  line-height: 18px;
  padding: 0 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.win95-dialog-close {
  background: rgb(var(--owd-theme-color-light));
  border: 1px solid;
  border-color: var(--p-card-border-color);
  box-shadow: var(--p-card-box-shadow);
  width: 14px;
  height: 14px;
  font-size: 9px;
  line-height: 12px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  outline: none;
  font-weight: bold;
  color: black;
}

.win95-dialog-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.win95-dialog-content {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-family: var(--owd-font-family);
  font-size: var(--p-font-size);
  color: black;
}

.win95-warning-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
}

.win95-dialog-text {
  flex: 1;
  margin: 0;
  line-height: 1.3;
  white-space: pre-wrap;
}

.win95-dialog-buttons {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.win95-btn {
  min-width: 75px !important;
  height: 23px !important;
  font-family: var(--owd-font-family) !important;
  font-size: 12px !important;
  padding: 0 4px !important;
  justify-content: center !important;
  align-items: center !important;
  border-style: solid !important;
  border-width: var(--owd-border-width) !important;
  border-color: var(--p-card-border-color) !important;
  box-shadow: var(--p-card-box-shadow) !important;
  background: var(--p-surface-900) !important;
  color: black !important;
  cursor: default !important;
  border-radius: 0 !important;

  &:active {
    box-shadow:
      rgb(10, 10, 10) 1px 1px 0px 0px inset,
      rgb(132, 133, 132) 2px 2px 0px 0px inset !important;
  }
}
</style>

<style lang="scss">
.owd-window.owd-window--notepad {
  > .p-card > .p-card-body {
    height: 100% !important;

    > .p-card-content {
      height: 100% !important;
    }
  }
}
</style>
