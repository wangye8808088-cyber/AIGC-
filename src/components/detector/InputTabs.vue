<script setup lang="ts">
import type { InputMode } from '@/types/inputMode'

defineProps<{
  modelValue: InputMode
}>()

const emit = defineEmits<{
  'update:modelValue': [value: InputMode]
}>()

const tabs: Array<{ value: InputMode; label: string }> = [
  { value: 'text', label: '粘贴文本' },
  { value: 'file', label: '上传 DOCX' },
]
</script>

<template>
  <div class="tabs" role="tablist" aria-label="检测输入方式">
    <button
      v-for="tab in tabs"
      :id="`tab-${tab.value}`"
      :key="tab.value"
      class="tab-button"
      :class="{ active: modelValue === tab.value }"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.value"
      :aria-controls="`panel-${tab.value}`"
      @click="emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
