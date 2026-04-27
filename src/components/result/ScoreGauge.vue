<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AnalysisLevel } from '@/types/analysis'

const props = defineProps<{
  score: number
  level: AnalysisLevel
}>()

const displayScore = ref(0)
let animFrame: number | null = null

function animateCount(target: number) {
  if (animFrame !== null) cancelAnimationFrame(animFrame)
  const start = displayScore.value
  const delta = target - start
  const duration = 600
  const startTime = performance.now()

  function step(now: number) {
    const elapsed = Math.min((now - startTime) / duration, 1)
    const eased = 1 - Math.pow(1 - elapsed, 3)
    displayScore.value = Math.round(start + delta * eased)
    if (elapsed < 1) {
      animFrame = requestAnimationFrame(step)
    } else {
      displayScore.value = target
      animFrame = null
    }
  }
  animFrame = requestAnimationFrame(step)
}

watch(() => props.score, (val) => animateCount(val), { immediate: true })

const levelLabel = computed(() => {
  const map: Record<AnalysisLevel, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
    uncertain: '证据不足',
  }
  return map[props.level]
})

const levelColor = computed(() => {
  const map: Record<AnalysisLevel, string> = {
    low: 'var(--color-success)',
    medium: 'var(--color-warning)',
    high: 'var(--color-danger)',
    uncertain: 'var(--text-muted)',
  }
  return map[props.level]
})
</script>

<template>
  <div class="score-card" :data-level="level">
    <p class="score-label">AIGC 风险率</p>

    <div class="score-gauge-row">
      <div class="score-value" :style="{ color: levelColor }" aria-live="polite" :aria-label="`AIGC 风险率 ${displayScore}%`">
        {{ displayScore }}<span>%</span>
      </div>
      <div class="score-bar-wrap" aria-hidden="true">
        <div class="score-bar-track">
          <div
            class="score-bar-fill"
            :style="{ width: `${displayScore}%`, background: levelColor }"
          ></div>
        </div>
      </div>
    </div>

    <p class="level-pill" :style="{ color: levelColor }">
      {{ levelLabel }}
    </p>
  </div>
</template>

<style scoped>
.score-gauge-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.score-bar-wrap {
  flex: 1;
  min-width: 80px;
  padding-bottom: 0.6rem;
}

.score-bar-track {
  height: 6px;
  background: var(--bg-overlay);
  border-radius: 999px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 600ms cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 8px currentColor;
}
</style>
