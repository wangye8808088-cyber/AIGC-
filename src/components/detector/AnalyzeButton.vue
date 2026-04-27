<script setup lang="ts">
defineProps<{
  loading: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    class="primary-button full-width analyze-btn"
    type="button"
    :disabled="disabled || loading"
    :aria-label="loading ? '检测中，请等候…' : '开始检测 AIGC 风险'"
    @click="emit('click')"
  >
    <span v-if="loading" class="btn-spinner" aria-hidden="true"></span>
    <svg v-else aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    {{ loading ? '检测中…' : '开始检测' }}
  </button>
</template>

<style scoped>
.analyze-btn {
  margin-top: 0.75rem;
  gap: 0.5rem;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
