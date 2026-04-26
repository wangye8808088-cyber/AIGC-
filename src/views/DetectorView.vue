<script setup lang="ts">
import { computed, ref } from 'vue'
import AnalyzeButton from '@/components/detector/AnalyzeButton.vue'
import FileUploadPanel from '@/components/detector/FileUploadPanel.vue'
import InputTabs from '@/components/detector/InputTabs.vue'
import TextInputPanel from '@/components/detector/TextInputPanel.vue'
import ResultPanel from '@/components/result/ResultPanel.vue'
import { disclaimer } from '@/content/disclaimer'
import { useAigcAnalysis } from '@/composables/useAigcAnalysis'
import type { InputMode } from '@/types/inputMode'

const mode = ref<InputMode>('text')
const text = ref('')
const file = ref<File | null>(null)
const { status, result, errorMessage, submitText, submitFile } = useAigcAnalysis()

const isLoading = computed(() => status.value === 'loading')
const canSubmit = computed(() => {
  if (isLoading.value) return false
  return mode.value === 'text' ? text.value.trim().length > 0 : Boolean(file.value)
})

function setFile(nextFile: File) {
  file.value = nextFile
}

function clearFile() {
  file.value = null
}

function submit() {
  if (!canSubmit.value) return
  if (mode.value === 'text') {
    void submitText(text.value)
    return
  }

  if (file.value) void submitFile(file.value)
}
</script>

<template>
  <section id="detector" class="detector-section" aria-labelledby="detector-title">
    <div class="section-heading">
      <p class="eyebrow">MVP 工作台</p>
      <h2 id="detector-title">上传 DOCX 或粘贴文本检测 AIGC 风险</h2>
      <p>当前版本使用 Mock 检测器跑通完整流程，后续可替换为真实模型接口。</p>
    </div>

    <div class="detector-grid">
      <section class="input-card" aria-labelledby="input-title">
        <h2 id="input-title">输入内容</h2>
        <InputTabs v-model="mode" />

        <TextInputPanel
          v-if="mode === 'text'"
          v-model="text"
          :disabled="isLoading"
          @submit="submit"
        />
        <FileUploadPanel
          v-else
          :file="file"
          :disabled="isLoading"
          @file-selected="setFile"
          @clear="clearFile"
        />

        <AnalyzeButton :loading="isLoading" :disabled="!canSubmit" @click="submit" />
        <p id="privacy-note" class="privacy-note">{{ disclaimer }}</p>
      </section>

      <ResultPanel :status="status" :result="result" :error-message="errorMessage" />
    </div>
  </section>
</template>
