<script setup lang="ts">
defineProps<{
  file: File | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  'file-selected': [file: File]
  clear: []
}>()

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) emit('file-selected', file)
}

function formatSize(file: File) {
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 1,
  }).format(file.size / 1024)
}
</script>

<template>
  <section id="panel-file" role="tabpanel" aria-labelledby="tab-file" class="input-panel">
    <label class="field-label" for="doc-upload">上传 DOCX 文档</label>
    <div class="upload-card">
      <input
        id="doc-upload"
        class="file-input"
        name="doc-upload"
        type="file"
        accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        :disabled="disabled"
        @change="onFileChange"
      />
      <p class="upload-title">选择一个 DOCX 文档</p>
      <p class="helper-text">首版完整支持 DOCX；旧版 DOC 会提示另存为 DOCX 后上传。</p>
    </div>

    <div v-if="file" class="selected-file">
      <div class="min-w-0">
        <p class="file-name">{{ file.name }}</p>
        <p class="helper-text">{{ formatSize(file) }} KB</p>
      </div>
      <button class="ghost-button" type="button" :disabled="disabled" @click="emit('clear')">
        移除文件
      </button>
    </div>
  </section>
</template>
