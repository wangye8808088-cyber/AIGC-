<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { downloadRewrite } from '@/api/rewrite'
import type { RewriteStatus } from '@/composables/useAigcRewrite'
import type { RewriteResult } from '@/types/rewrite'
import { getScoreComparison } from '@/utils/scoreComparison'

const props = defineProps<{
  status: RewriteStatus
  result: RewriteResult | null
  errorMessage: string
  originalScore: number | null
  rewrittenScore: number | null
  analysisStatus: 'idle' | 'loading' | 'success' | 'error'
  analysisErrorMessage: string
}>()

const emit = defineEmits<{
  recheck: [text: string]
}>()

const editableText = ref('')
const copyMessage = ref('')
const canUseText = computed(() => editableText.value.trim().length > 0)
const scoreComparison = computed(() => {
  if (props.originalScore === null || props.rewrittenScore === null) return null
  return getScoreComparison(props.originalScore, props.rewrittenScore)
})

watch(
  () => props.result?.rewrittenText,
  (nextText) => {
    editableText.value = nextText ?? ''
  },
)

async function copyText() {
  if (!canUseText.value) return
  await navigator.clipboard.writeText(editableText.value)
  copyMessage.value = '已复制改写文本。'
  window.setTimeout(() => {
    copyMessage.value = ''
  }, 3000)
}

function download(format: 'txt' | 'docx' | 'doc') {
  if (!canUseText.value) return
  void downloadRewrite(editableText.value, format)
}
</script>

<template>
  <section class="rewrite-panel" aria-labelledby="rewrite-title">
    <div class="result-header">
      <p class="eyebrow">降低 AIGC 风险</p>
      <h2 id="rewrite-title">改写结果</h2>
    </div>

    <Transition name="panel-fade" mode="out-in">
      <div v-if="status === 'idle'" key="idle" class="state-card">
        <p>检测后点击「降低 AIGC 风险」，这里会返回一版可编辑的完整改写文本。</p>
      </div>

      <div v-else-if="status === 'loading'" key="loading" class="state-card" aria-live="polite">
        <div class="loading-dots" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <p style="margin-top:0.75rem">正在保留原意并减少模板化表达…</p>
      </div>

      <div v-else-if="status === 'error'" key="error" class="state-card error" role="alert">
        <p>{{ errorMessage }}</p>
      </div>

      <div v-else-if="result" key="result" class="rewrite-content">
        <p class="summary">{{ result.summary }}</p>

        <!-- Score comparison card -->
        <Transition name="comp-slide">
          <div v-if="analysisStatus === 'loading'" class="comparison-card" aria-live="polite">
            <p class="comparison-label">自动复检中…</p>
            <p>正在检测改写后的文本，计算降低幅度。</p>
          </div>
          <div v-else-if="analysisStatus === 'error'" class="comparison-card error" role="alert">
            <p class="comparison-label">自动复检失败</p>
            <p>{{ analysisErrorMessage }}</p>
          </div>
          <div v-else-if="scoreComparison" class="comparison-card success" aria-live="polite">
            <div class="comparison-score-row">
              <span class="comparison-from">{{ props.originalScore }}%</span>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              <span class="comparison-to">{{ props.rewrittenScore }}%</span>
            </div>
            <p class="comparison-label">降低结果</p>
            <p>{{ scoreComparison.message }}</p>
          </div>
        </Transition>

        <label class="field-label" for="rewritten-text">可编辑改写文本</label>
        <textarea
          id="rewritten-text"
          v-model="editableText"
          class="text-area rewrite-textarea"
          name="rewritten-text"
          autocomplete="off"
          spellcheck="false"
          :aria-label="`改写后的文本，共 ${editableText.length} 字`"
        />

        <div class="rewrite-actions">
          <button class="secondary-button" type="button" :disabled="!canUseText" @click="copyText">
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:5px">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            复制文本
          </button>
          <button class="secondary-button" type="button" :disabled="!canUseText" @click="emit('recheck', editableText)"
            :aria-label="'重新检测改写后的文本'">
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:5px">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            重新检测
          </button>
        </div>

        <div class="download-actions" aria-label="下载改写结果">
          <button class="ghost-button" type="button" :disabled="!canUseText" @click="download('txt')">下载 TXT</button>
          <button class="ghost-button" type="button" :disabled="!canUseText" @click="download('docx')">下载 DOCX</button>
          <button class="ghost-button" type="button" :disabled="!canUseText" @click="download('doc')">下载 DOC</button>
        </div>

        <p v-if="copyMessage" class="helper-text" aria-live="polite">{{ copyMessage }}</p>

        <section class="suggestion-section" aria-labelledby="changed-title">
          <h3 id="changed-title">修改点</h3>
          <ul>
            <li v-for="point in result.changedPoints" :key="point">{{ point }}</li>
          </ul>
        </section>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.rewrite-actions,
.download-actions {
  margin-top: 0.25rem;
}

.rewrite-actions button,
.download-actions button {
  align-items: center;
  display: inline-flex;
}

.comparison-score-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.comparison-from {
  font-size: 1.35rem;
  font-weight: 900;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}

.comparison-to {
  font-size: 1.5rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

/* Panel fade transition */
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

/* Comparison card slide */
.comp-slide-enter-active {
  transition: opacity 250ms var(--ease-out), transform 280ms var(--ease-spring);
}
.comp-slide-leave-active {
  transition: opacity 150ms var(--ease-in);
}
.comp-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.97);
}
.comp-slide-leave-to {
  opacity: 0;
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
</style>
