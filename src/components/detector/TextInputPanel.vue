<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()

const maxLength = 12_000
</script>

<template>
  <section id="panel-text" role="tabpanel" aria-labelledby="tab-text" class="input-panel">
    <label class="field-label" for="text-content">待检测文本</label>
    <textarea
      id="text-content"
      class="text-area"
      name="text-content"
      autocomplete="off"
      :maxlength="maxLength"
      :value="modelValue"
      :disabled="disabled"
      placeholder="粘贴一段需要检测的中文文本…"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @keydown.ctrl.enter.prevent="emit('submit')"
      @keydown.meta.enter.prevent="emit('submit')"
    />
    <div class="field-footer">
      <p class="helper-text">建议至少输入 100 字；支持 Ctrl/⌘ + Enter 快速检测。</p>
      <p class="counter" aria-live="polite">{{ props.modelValue.length }} / {{ maxLength }}</p>
    </div>
  </section>
</template>
