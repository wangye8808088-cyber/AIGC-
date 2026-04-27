<script setup lang="ts">
import ScoreGauge from './ScoreGauge.vue'
import type { AnalysisStatus } from '@/composables/useAigcAnalysis'
import type { AnalysisResult } from '@/types/analysis'

defineProps<{
  status: AnalysisStatus
  result: AnalysisResult | null
  errorMessage: string
  canRewrite: boolean
  rewriteLoading: boolean
}>()

const emit = defineEmits<{
  rewrite: []
}>()
</script>

<template>
  <aside class="result-panel" aria-labelledby="result-title">
    <div class="result-header">
      <p class="eyebrow">检测结果</p>
      <h2 id="result-title">AIGC 风险报告</h2>
    </div>

    <Transition name="panel-fade" mode="out-in">
      <div v-if="status === 'idle'" key="idle" class="state-card">
        <p>粘贴文本或上传 DOCX 后，点击「开始检测」查看风险率与证据片段。</p>
      </div>

      <div v-else-if="status === 'loading'" key="loading" class="state-card" aria-live="polite">
        <div class="loading-dots" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <p style="margin-top:0.75rem">正在提取文本特征并生成风险证据…</p>
      </div>

      <div v-else-if="status === 'error'" key="error" class="state-card error" role="alert">
        <p>{{ errorMessage }}</p>
      </div>

      <div v-else-if="result" key="result" class="result-content">
        <ScoreGauge :score="result.score" :level="result.level" />
        <p class="summary">{{ result.summary }}</p>
      </div>
    </Transition>
  </aside>
</template>

<style scoped>
.rewrite-cta {
  margin-top: 0.5rem;
  gap: 0.5rem;
}

.btn-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Loading dots */
.loading-dots {
  display: flex;
  gap: 6px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--brand);
  animation: dot-bounce 1.2s ease-in-out infinite;
}

.loading-dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-dots span:nth-child(3) { animation-delay: 0.3s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* Transition */
.panel-fade-enter-active {
  transition: opacity 200ms var(--ease-out), transform 220ms var(--ease-out);
}
.panel-fade-leave-active {
  transition: opacity 150ms var(--ease-in), transform 150ms var(--ease-in);
}
.panel-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
