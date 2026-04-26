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
  <button class="primary-button full-width" type="button" :disabled="disabled || loading" @click="emit('click')">
    {{ loading ? '检测中…' : '开始检测' }}
  </button>
</template>
