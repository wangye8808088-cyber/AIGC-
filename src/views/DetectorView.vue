<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AnalyzeButton from '@/components/detector/AnalyzeButton.vue'
import FileUploadPanel from '@/components/detector/FileUploadPanel.vue'
import InputTabs from '@/components/detector/InputTabs.vue'
import TextInputPanel from '@/components/detector/TextInputPanel.vue'
import EvidenceList from '@/components/result/EvidenceList.vue'
import ResultPanel from '@/components/result/ResultPanel.vue'
import { disclaimer } from '@/content/disclaimer'
import { useAigcAnalysis } from '@/composables/useAigcAnalysis'
import { useSharedInput } from '@/composables/useSharedInput'
import type { InputMode } from '@/types/inputMode'

const router = useRouter()
const { setSharedText, setSharedFile } = useSharedInput()

const mode = ref<InputMode>('text')
const text = ref('')
const file = ref<File | null>(null)

const { status, result, errorMessage, submitText, submitFile } = useAigcAnalysis()

const isLoading = computed(() => status.value === 'loading')
const canSubmit = computed(() => {
  if (isLoading.value) return false
  return mode.value === 'text' ? text.value.trim().length > 0 : Boolean(file.value)
})
const canReduce = computed(() => status.value === 'success' && result.value !== null)
const showBottomRow = computed(() => status.value === 'success' && result.value !== null)

function setFile(nextFile: File) { file.value = nextFile }
function clearFile() { file.value = null }

function submit() {
  if (!canSubmit.value) return
  if (mode.value === 'text') { void submitText(text.value); return }
  if (file.value) void submitFile(file.value)
}

function goToReduce() {
  if (!canReduce.value) return
  if (mode.value === 'text' && text.value.trim()) {
    setSharedText(text.value)
  } else if (mode.value === 'file' && file.value) {
    setSharedFile(file.value)
  }
  void router.push('/reduce')
}
</script>

<template>
  <section class="detect-page" aria-labelledby="detector-title">

    <!-- Hero -->
    <div class="detect-hero">
      <div class="detect-hero-inner">
        <p class="eyebrow">检测工作台</p>
        <h1 id="detector-title">AIGC 风险检测</h1>
        <p class="detect-hero-desc">粘贴文本或上传 DOCX，获得风险评分、关键证据和复核建议。</p>
      </div>
    </div>

    <div class="detector-section">
      <div class="detector-grid">

        <!-- ── Col 1: Input ─────────────────────────── -->
        <section class="input-card" aria-labelledby="input-title">
          <h2 id="input-title" class="sr-only">输入内容</h2>
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

        <!-- ── Col 2: Score + Evidence ──────────────── -->
        <div class="result-stack">
          <ResultPanel
            :status="status"
            :result="result"
            :error-message="errorMessage"
            :can-rewrite="canReduce"
            :rewrite-loading="false"
            @rewrite="goToReduce"
          />
        </div>

        <!-- ── Row 2: Evidence + Suggestions + CTA (full width) ── -->
        <Transition name="bottom-row">
          <div v-if="showBottomRow" class="detector-bottom-row" aria-live="polite">

            <!-- Evidence + Suggestions col -->
            <div class="bottom-left">

              <!-- Evidence card -->
              <section
                v-if="result?.evidences?.length"
                class="evidence-card"
                aria-labelledby="evidence-title-det"
              >
                <div class="bottom-card-head">
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                  <h3 id="evidence-title-det">风险证据</h3>
                </div>
                <EvidenceList :items="result.evidences" />
              </section>

              <!-- Suggestions card -->
              <section
                v-if="result?.suggestions?.length"
                class="suggestion-card"
                aria-labelledby="suggestion-title"
              >
                <div class="bottom-card-head">
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <h3 id="suggestion-title">复核建议</h3>
                </div>
                <ul class="suggestion-list">
                  <li
                    v-for="(suggestion, i) in result.suggestions"
                    :key="suggestion"
                    class="suggestion-item"
                    :style="{ animationDelay: `${i * 55}ms` }"
                  >
                    <span class="suggestion-bullet" aria-hidden="true">{{ i + 1 }}</span>
                    <span>{{ suggestion }}</span>
                  </li>
                </ul>
              </section>

            </div>

            <!-- Reduce CTA col -->
            <div class="reduce-cta-card" aria-label="前往降低 AIGC 风险">
              <div class="reduce-cta-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div class="reduce-cta-text">
                <p class="reduce-cta-title">一键降低 AIGC 风险</p>
                <p class="helper-text">
                  {{ mode === 'file' ? '文档将自动携带至改写页' : '文本将自动填入改写页' }}，直接点击「降低 AIGC 风险」即可。
                </p>
              </div>
              <button
                class="primary-button reduce-cta-btn"
                type="button"
                aria-label="前往降低 AIGC 风险页面，内容已自动填入"
                @click="goToReduce"
              >
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                前往改写
              </button>
            </div>

          </div>
        </Transition>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── Hero ──────────────────────────────────────────────── */
.detect-hero {
  border-bottom: 1px solid var(--border-subtle);
  background: linear-gradient(160deg, rgba(124, 108, 244, 0.05) 0%, transparent 50%);
  position: relative;
  overflow: hidden;
}

.detect-hero::before {
  content: '';
  position: absolute;
  top: -80%;
  right: -5%;
  width: 50%;
  height: 200%;
  background: radial-gradient(ellipse at center, rgba(96, 165, 250, 0.08), transparent 60%);
  pointer-events: none;
}

.detect-hero-inner {
  max-width: 74rem;
  margin: 0 auto;
  padding: 3.5rem 1.5rem 3rem;
  position: relative;
  animation: slideUp var(--duration-slow) var(--ease-out) both;
}

.detect-hero-inner h1 {
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  margin-bottom: 0.75rem;
}

.detect-hero-desc {
  color: var(--text-secondary);
  font-size: 1rem;
  max-width: 42rem;
}

/* ── Grid ──────────────────────────────────────────────── */
.detector-section {
  max-width: 74rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 5rem;
}

.detector-grid {
  display: grid;
  gap: 1rem;
  /* stretch (default): both columns share the same row height */
}

@media (min-width: 768px) {
  .detector-grid {
    grid-template-columns: minmax(0, 1fr) minmax(22rem, 0.9fr);
  }

  /* Bottom row spans both columns */
  .detector-bottom-row {
    grid-column: 1 / -1;
  }
}

/* ── Bottom Row ────────────────────────────────────────── */
.detector-bottom-row {
  display: grid;
  gap: 1rem;
}

@media (min-width: 860px) {
  .detector-bottom-row {
    grid-template-columns: 1fr 220px;
    align-items: start;
  }
}

/* Left col: evidence + suggestions stacked */
.bottom-left {
  display: grid;
  gap: 1rem;
}

/* ── Shared card head ──────────────────────────────────── */
.bottom-card-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
  color: var(--brand);
}

.bottom-card-head h3 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-primary);
}

/* ── Evidence Card ─────────────────────────────────────── */
.evidence-card {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow-card);
}

/* ── Suggestions Card ──────────────────────────────────── */
.suggestion-card {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow-card);
}

.suggestion-list {
  display: grid;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.65;
  animation: slideUp var(--duration-normal) var(--ease-out) both;
}

.suggestion-bullet {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--brand-muted);
  color: var(--brand);
  font-size: 0.72rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

/* ── Reduce CTA ────────────────────────────────────────── */
.reduce-cta-card {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-elevated);
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (min-width: 860px) {
  .reduce-cta-card {
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    min-width: 220px;
  }
}

.reduce-cta-icon {
  color: var(--brand);
  flex-shrink: 0;
  padding: 0.5rem;
  background: var(--brand-muted);
  border-radius: var(--radius-md);
}

.reduce-cta-text { flex: 1; min-width: 0; }

.reduce-cta-title {
  color: var(--text-primary);
  font-size: 0.92rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
}

.reduce-cta-btn {
  gap: 0.4rem;
  white-space: nowrap;
  flex-shrink: 0;
  align-items: center;
  display: inline-flex;
}

@media (min-width: 860px) {
  .reduce-cta-btn {
    width: 100%;
    justify-content: center;
  }
}

/* ── Screen-reader only ────────────────────────────────── */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ── Bottom row transition ─────────────────────────────── */
.bottom-row-enter-active {
  transition: opacity 320ms var(--ease-out), transform 340ms var(--ease-out);
}
.bottom-row-leave-active {
  transition: opacity 180ms var(--ease-in), transform 180ms var(--ease-in);
}
.bottom-row-enter-from {
  opacity: 0;
  transform: translateY(18px);
}
.bottom-row-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
