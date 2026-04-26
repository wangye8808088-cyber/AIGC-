<script setup lang="ts">
import { computed } from 'vue'
import type { AnalysisLevel } from '@/types/analysis'

const props = defineProps<{
  score: number
  level: AnalysisLevel
}>()

const levelLabel = computed(() => {
  const map: Record<AnalysisLevel, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
    uncertain: '证据不足',
  }

  return map[props.level]
})
</script>

<template>
  <div class="score-card" :data-level="level">
    <p class="score-label">AIGC 风险率</p>
    <div class="score-value">{{ score }}<span>%</span></div>
    <p class="level-pill">{{ levelLabel }}</p>
  </div>
</template>
