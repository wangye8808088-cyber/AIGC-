<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  file: File | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  'file-selected': [file: File]
  clear: []
}>()

const isDragging = ref(false)
let dragCounter = 0

function pickFile(f: File) {
  if (!f.name.match(/\.(doc|docx)$/i)) return
  emit('file-selected', f)
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const picked = input.files?.[0]
  if (picked) pickFile(picked)
}

function onDragEnter(e: DragEvent) {
  e.preventDefault()
  dragCounter++
  isDragging.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  dragCounter--
  if (dragCounter <= 0) { isDragging.value = false; dragCounter = 0 }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  dragCounter = 0
  const dropped = e.dataTransfer?.files?.[0]
  if (dropped) pickFile(dropped)
}

function formatSize(f: File) {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 }).format(f.size / 1024)
}
</script>

<template>
  <section id="panel-file" role="tabpanel" aria-labelledby="tab-file" class="input-panel">
    <label class="field-label" for="doc-upload">上传 DOCX 文档</label>

    <div
      class="drop-zone"
      :class="{ 'drop-zone--over': isDragging, 'drop-zone--filled': Boolean(file), 'drop-zone--disabled': disabled }"
      role="region"
      aria-label="文件拖拽上传区域"
      :tabindex="disabled ? -1 : 0"
      @dragenter="!disabled && onDragEnter($event)"
      @dragleave="!disabled && onDragLeave($event)"
      @dragover="!disabled && onDragOver($event)"
      @drop="!disabled && onDrop($event)"
      @keydown.enter.prevent="!disabled && ($refs.fileInput as HTMLInputElement).click()"
      @keydown.space.prevent="!disabled && ($refs.fileInput as HTMLInputElement).click()"
    >
      <input
        ref="fileInput"
        id="doc-upload"
        class="drop-zone__input"
        name="doc-upload"
        type="file"
        accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        :disabled="disabled"
        tabindex="-1"
        aria-label="选择 DOCX 文件"
        @change="onFileChange"
      />

      <!-- Filled -->
      <div v-if="file" class="drop-zone__filled">
        <div class="drop-file-icon" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="drop-file-info">
          <p class="drop-file-name">{{ file.name }}</p>
          <p class="helper-text">{{ formatSize(file) }} KB</p>
        </div>
        <button
          class="ghost-button drop-file-remove"
          type="button"
          :disabled="disabled"
          aria-label="移除已选文件"
          @click.stop="emit('clear')"
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Empty -->
      <div v-else class="drop-zone__empty" @click="!disabled && ($refs.fileInput as HTMLInputElement).click()">
        <div class="drop-icon-wrap" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <p class="drop-title">{{ isDragging ? '松开以上传文件' : '拖拽文件到此处' }}</p>
        <p class="drop-sub">或 <span class="drop-link">点击选择文件</span></p>
        <p class="helper-text" style="margin-top:0.3rem">支持 .docx 格式 · 最大 10 MB</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.drop-zone {
  border: 2px dashed var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-base);
  cursor: pointer;
  position: relative;
  outline: none;
  transition:
    border-color var(--duration-normal) var(--ease-out),
    background var(--duration-normal) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring);
}

.drop-zone:focus-visible {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--brand-muted);
}

.drop-zone--over {
  border-color: var(--brand);
  background: var(--brand-muted);
  transform: scale(1.01);
}

.drop-zone--filled {
  border-style: solid;
  border-color: var(--border-default);
  cursor: default;
}

.drop-zone--disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

.drop-zone__input { display: none; }

/* Empty */
.drop-zone__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  text-align: center;
  gap: 0.35rem;
  cursor: pointer;
}

.drop-icon-wrap {
  color: var(--text-muted);
  margin-bottom: 0.4rem;
  transition:
    color var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-spring);
}

.drop-zone--over .drop-icon-wrap {
  color: var(--brand);
  transform: translateY(-4px) scale(1.1);
}

.drop-title {
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
}

.drop-sub {
  color: var(--text-muted);
  font-size: 0.88rem;
  margin: 0;
}

.drop-link {
  color: var(--brand);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Filled */
.drop-zone__filled {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
}

.drop-file-icon { color: var(--brand); flex-shrink: 0; }

.drop-file-info {
  flex: 1;
  min-width: 0;
}

.drop-file-name {
  color: var(--text-primary);
  font-weight: 700;
  margin: 0 0 0.15rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drop-file-remove {
  flex-shrink: 0;
  padding: 0.4rem;
  min-height: 34px;
  min-width: 34px;
}
</style>
