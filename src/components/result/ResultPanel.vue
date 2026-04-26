<script setup lang="ts">
import EvidenceList from './EvidenceList.vue'
import ScoreGauge from './ScoreGauge.vue'
import type { AnalysisStatus } from '@/composables/useAigcAnalysis'
import type { AnalysisResult } from '@/types/analysis'

defineProps<{
  status: AnalysisStatus
  result: AnalysisResult | null
  errorMessage: string
}>()
</script>

<template>
  <aside class="result-panel" aria-labelledby="result-title">
    <div class="result-header">
      <p class="eyebrow">检测结果</p>
      <h2 id="result-title">AIGC 风险报告</h2>
    </div>

    <div v-if="status === 'idle'" class="state-card">
      <p>粘贴文本或上传 DOCX 后，点击「开始检测」查看风险率与证据片段。</p>
    </div>

    <div v-else-if="status === 'loading'" class="state-card" aria-live="polite">
      <p>检测中…正在提取文本特征并生成风险证据。</p>
    </div>

    <div v-else-if="status === 'error'" class="state-card error" role="alert">
      <p>{{ errorMessage }}</p>
    </div>

    <div v-else-if="result" class="result-content">
      <ScoreGauge :score="result.score" :level="result.level" />
      <p class="summary">{{ result.summary }}</p>
      <EvidenceList :items="result.evidences" />

      <section class="suggestion-section" aria-labelledby="suggestion-title">
        <h3 id="suggestion-title">复核建议</h3>
        <ul>
          <li v-for="suggestion in result.suggestions" :key="suggestion">{{ suggestion }}</li>
        </ul>
      </section>
    </div>
  </aside>
</template>
