<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { analyzeText as analyzeRewrittenText } from '@/api/analyze'
import { downloadRewrite } from '@/api/rewrite'
import { useAigcAnalysis } from '@/composables/useAigcAnalysis'
import { useAigcRewrite } from '@/composables/useAigcRewrite'
import { useSharedInput } from '@/composables/useSharedInput'
import { getScoreComparison } from '@/utils/scoreComparison'
import type { AnalysisResult } from '@/types/analysis'
import type { InputMode } from '@/types/inputMode'

/* ── State ────────────────────────────────────────────── */
const mode = ref<InputMode>('text')
const text = ref('')
const file = ref<File | null>(null)
const editableText = ref('')
const copyMessage = ref('')
const isEditorExpanded = ref(false)

/* drag state */
const isDragging = ref(false)
let dragCounter = 0

/* ── Composables ──────────────────────────────────────── */
const {
  status: analyzeStatus,
  result: analyzeResult,
} = useAigcAnalysis()

const {
  status: rewriteStatus,
  result: rewriteResult,
  errorMessage: rewriteErrorMessage,
  submitText: rewriteText,
  submitFile: rewriteFile,
} = useAigcRewrite()

const originalScore = ref<number | null>(null)
const rewrittenAnalysis = ref<AnalysisResult | null>(null)
const recheckStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const recheckError = ref('')

const { popSharedInput } = useSharedInput()

/* ── Lifecycle ────────────────────────────────────────── */
onMounted(() => {
  const shared = popSharedInput()
  if (!shared) return

  if (shared.mode === 'text') {
    text.value = shared.text
    mode.value = 'text'
  } else {
    file.value = shared.file
    mode.value = 'file'
  }
})

/* ── Computed ─────────────────────────────────────────── */
const canReduce = computed(() => {
  if (rewriteStatus.value === 'loading') return false
  return mode.value === 'text' ? text.value.trim().length > 0 : Boolean(file.value)
})

const scoreComparison = computed(() => {
  if (originalScore.value === null || rewrittenAnalysis.value === null) return null
  return getScoreComparison(originalScore.value, rewrittenAnalysis.value.score)
})

const tabs: Array<{ value: InputMode; label: string }> = [
  { value: 'text', label: '粘贴文本' },
  { value: 'file', label: '上传 DOCX' },
]

/* ── File handling ────────────────────────────────────── */
function pickFile(f: File) {
  if (!f.name.match(/\.(doc|docx)$/i)) return
  file.value = f
}

function onFileInput(event: Event) {
  const input = event.target as HTMLInputElement
  const picked = input.files?.[0]
  if (picked) pickFile(picked)
}

function clearFile() { file.value = null }

function formatSize(f: File) {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 }).format(f.size / 1024)
}

/* ── Drag & Drop ──────────────────────────────────────── */
function onDragEnter(e: DragEvent) {
  e.preventDefault()
  dragCounter++
  isDragging.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  dragCounter--
  if (dragCounter <= 0) { isDragging.value = false; dragCounter = 0 }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  dragCounter = 0
  const dropped = e.dataTransfer?.files?.[0]
  if (dropped) pickFile(dropped)
}

/* ── Core actions ─────────────────────────────────────── */
async function autoRecheck(rewrittenContent: string) {
  recheckStatus.value = 'loading'
  rewrittenAnalysis.value = null
  recheckError.value = ''
  try {
    rewrittenAnalysis.value = await analyzeRewrittenText(rewrittenContent)
    recheckStatus.value = 'success'
  } catch (err) {
    recheckStatus.value = 'error'
    recheckError.value = err instanceof Error ? err.message : '自动复检失败，请手动重新检测。'
  }
}

async function handleReduce() {
  if (!canReduce.value) return
  rewrittenAnalysis.value = null
  recheckStatus.value = 'idle'
  recheckError.value = ''

  /* capture original detection score before rewrite */
  if (analyzeStatus.value === 'success' && analyzeResult.value) {
    originalScore.value = analyzeResult.value.score
  } else {
    originalScore.value = null
  }

  let response = null
  if (mode.value === 'text') {
    response = await rewriteText(text.value)
  } else if (file.value) {
    response = await rewriteFile(file.value)
  }

  if (response?.rewrittenText) {
    editableText.value = response.rewrittenText
    /* if we don't already have an original score, set it now if available */
    if (originalScore.value === null && analyzeResult.value) {
      originalScore.value = analyzeResult.value.score
    }
    await autoRecheck(response.rewrittenText)
  }
}

async function copyText() {
  if (!editableText.value.trim()) return
  await navigator.clipboard.writeText(editableText.value)
  copyMessage.value = '已复制'
  setTimeout(() => { copyMessage.value = '' }, 2800)
}

function download(format: 'txt' | 'docx' | 'doc') {
  if (!editableText.value.trim()) return
  void downloadRewrite(editableText.value, format)
}
</script>

<template>
  <div class="reduce-page">

    <!-- ─── Hero ──────────────────────────────────────── -->
    <section class="reduce-hero" aria-labelledby="reduce-hero-title">
      <div class="reduce-hero-inner">
        <p class="eyebrow">AIGC 风险降低</p>
        <h1 id="reduce-hero-title" class="reduce-hero-title">
          让 AI 内容回归<span class="hero-title-accent">自然的表达</span>
        </h1>
        <p class="reduce-hero-desc">
          输入文本或上传 DOCX，AI 自动改写降低 AIGC 特征，目标评分 &lt; 30%，自动复检并展示改善幅度。
        </p>
      </div>
    </section>

    <!-- ─── Workspace ─────────────────────────────────── -->
    <div class="reduce-workspace">

      <!-- ── Step 1: Input ──────────────────────────── -->
      <section class="rw-card" aria-labelledby="rw-input-title">
        <div class="rw-card-head">
          <span class="rw-step-badge" aria-hidden="true">01</span>
          <h2 id="rw-input-title" class="rw-card-title">输入内容</h2>
        </div>

        <!-- Tabs -->
        <div class="tabs" role="tablist" aria-label="输入方式">
          <button
            v-for="tab in tabs"
            :id="`rtab-${tab.value}`"
            :key="tab.value"
            class="tab-button"
            :class="{ active: mode === tab.value }"
            type="button"
            role="tab"
            :aria-selected="mode === tab.value"
            :aria-controls="`rpanel-${tab.value}`"
            @click="mode = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Text panel -->
        <section
          v-if="mode === 'text'"
          id="rpanel-text"
          role="tabpanel"
          aria-labelledby="rtab-text"
          class="rw-text-panel"
        >
          <label class="field-label" for="reduce-text-input">待改写文本</label>
          <textarea
            id="reduce-text-input"
            v-model="text"
            class="text-area rw-textarea"
            name="reduce-text-input"
            autocomplete="off"
            spellcheck="false"
            :maxlength="12000"
            placeholder="粘贴需要降低 AIGC 特征的中文文本…"
          />
          <div class="field-footer">
            <p class="helper-text">建议 200 字以上；支持 Ctrl/⌘ + Enter 快速提交</p>
            <p class="counter" aria-live="polite">{{ text.length }} / 12000</p>
          </div>
        </section>

        <!-- File / Drag-and-drop panel -->
        <section
          v-else
          id="rpanel-file"
          role="tabpanel"
          aria-labelledby="rtab-file"
          class="rw-file-panel"
        >
          <div
            class="drop-zone"
            :class="{ 'drop-zone--over': isDragging, 'drop-zone--filled': Boolean(file) }"
            role="region"
            aria-label="文件拖拽上传区域"
            tabindex="0"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
            @dragover="onDragOver"
            @drop="onDrop"
            @keydown.enter.prevent="($refs.fileInput as HTMLInputElement).click()"
            @keydown.space.prevent="($refs.fileInput as HTMLInputElement).click()"
          >
            <input
              ref="fileInput"
              id="reduce-file-input"
              class="drop-zone__input"
              name="reduce-file-input"
              type="file"
              accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              tabindex="-1"
              aria-label="选择 DOCX 文件"
              @change="onFileInput"
            />

            <!-- Filled state -->
            <div v-if="file" class="drop-zone__filled">
              <div class="drop-file-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div class="drop-file-info">
                <p class="drop-file-name">{{ file.name }}</p>
                <p class="helper-text">{{ formatSize(file) }} KB</p>
              </div>
              <button class="ghost-button drop-file-remove" type="button" @click.stop="clearFile" aria-label="移除已选文件">
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- Empty / dragging state -->
            <div v-else class="drop-zone__empty" @click="($refs.fileInput as HTMLInputElement).click()">
              <div class="drop-icon-wrap" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p class="drop-title">{{ isDragging ? '松开以上传文件' : '拖拽文件到此处' }}</p>
              <p class="drop-sub">或 <span class="drop-link">点击选择文件</span></p>
              <p class="helper-text" style="margin-top:0.4rem">支持 .docx 格式 · 最大 10 MB</p>
            </div>
          </div>
        </section>
      </section>

      <!-- ── Step 2: Action row ──────────────────────── -->
      <div class="rw-action-row">
        <button
          class="primary-button rw-submit-btn"
          type="button"
          :disabled="!canReduce"
          :aria-label="rewriteStatus === 'loading' ? '改写中，请等候' : '开始降低 AIGC 风险'"
          @click="handleReduce"
        >
          <span v-if="rewriteStatus === 'loading'" class="btn-spinner" aria-hidden="true"></span>
          <svg v-else aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          {{ rewriteStatus === 'loading' ? '改写中…' : '降低 AIGC 风险' }}
        </button>

        <p class="privacy-note">首版默认不保存原文，仅用于本次改写。</p>
      </div>

      <!-- ── Step 3: Result ─────────────────────────── -->
      <Transition name="result-enter">
        <section
          v-if="rewriteStatus !== 'idle'"
          class="rw-card rw-result-card"
          aria-labelledby="rw-result-title"
          aria-live="polite"
        >
          <div class="rw-card-head">
            <span class="rw-step-badge" aria-hidden="true">02</span>
            <h2 id="rw-result-title" class="rw-card-title">改写结果</h2>
          </div>

          <Transition name="panel-fade" mode="out-in">
            <!-- Loading -->
            <div v-if="rewriteStatus === 'loading'" key="loading" class="rw-state-center">
              <div class="loading-ring-lg" aria-hidden="true">
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border-subtle)" stroke-width="4"/>
                  <circle cx="32" cy="32" r="28" fill="none" stroke="var(--brand)" stroke-width="4"
                    stroke-linecap="round" stroke-dasharray="52 124" stroke-dashoffset="10"/>
                </svg>
              </div>
              <p class="rw-state-title">正在改写中…</p>
              <p class="helper-text">保留原意，降低 AIGC 模板化表达</p>
            </div>

            <!-- Error -->
            <div v-else-if="rewriteStatus === 'error'" key="error" class="state-card error" role="alert">
              <p>{{ rewriteErrorMessage }}</p>
            </div>

            <!-- Success -->
            <div v-else-if="rewriteResult" key="result" class="rw-result-body">

              <!-- Score comparison banner -->
              <Transition name="comp-slide">
                <div v-if="recheckStatus === 'loading'" class="comparison-card" aria-live="polite">
                  <div class="loading-dots" aria-hidden="true">
                    <span></span><span></span><span></span>
                  </div>
                  <p class="comparison-label" style="margin-top:0.6rem">自动复检中…</p>
                </div>

                <div v-else-if="recheckStatus === 'error'" class="comparison-card error" role="alert">
                  <p class="comparison-label">复检失败</p>
                  <p>{{ recheckError }}</p>
                </div>

                <div v-else-if="scoreComparison" class="comparison-card success score-banner" aria-live="polite">
                  <div class="score-banner-nums">
                    <div class="score-banner-item old">
                      <span class="score-banner-num">{{ originalScore }}</span>
                      <span class="score-banner-pct">%</span>
                      <span class="score-banner-lbl">原始评分</span>
                    </div>
                    <div class="score-banner-arrow" aria-hidden="true">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                    <div class="score-banner-item new">
                      <span class="score-banner-num">{{ rewrittenAnalysis?.score }}</span>
                      <span class="score-banner-pct">%</span>
                      <span class="score-banner-lbl">改写后</span>
                    </div>
                  </div>
                  <p class="score-banner-msg">{{ scoreComparison.message }}</p>
                </div>
              </Transition>

              <!-- Summary -->
              <p class="rw-summary">{{ rewriteResult.summary }}</p>

              <!-- Editable output -->
              <div class="rw-output-wrap" :class="{ 'rw-output-wrap--expanded': isEditorExpanded }">
                <div class="rw-output-head">
                  <label class="field-label" for="reduce-output-text" style="margin:0">可编辑改写文本</label>
                  <div class="rw-output-actions">
                    <button
                      class="ghost-button rw-action-btn"
                      type="button"
                      :disabled="!editableText.trim()"
                      :aria-pressed="isEditorExpanded"
                      @click="isEditorExpanded = !isEditorExpanded"
                    >
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path v-if="!isEditorExpanded" d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3"/>
                        <path v-else d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3m8 0v-3a2 2 0 0 1 2-2h3"/>
                      </svg>
                      {{ isEditorExpanded ? '收起' : '展开编辑' }}
                    </button>
                    <button class="ghost-button rw-action-btn" type="button" :disabled="!editableText.trim()" @click="copyText">
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                      {{ copyMessage || '复制' }}
                    </button>
                  </div>
                </div>
                <textarea
                  id="reduce-output-text"
                  v-model="editableText"
                  class="text-area rw-output-textarea"
                  name="reduce-output-text"
                  autocomplete="off"
                  spellcheck="false"
                  :aria-label="`改写后的文本，共 ${editableText.length} 字`"
                />
              </div>

              <!-- Download row -->
              <div class="rw-download-row" aria-label="下载改写结果">
                <span class="rw-download-label">下载为：</span>
                <button class="ghost-button" type="button" :disabled="!editableText.trim()" @click="download('txt')">TXT</button>
                <button class="ghost-button" type="button" :disabled="!editableText.trim()" @click="download('docx')">DOCX</button>
                <button class="ghost-button" type="button" :disabled="!editableText.trim()" @click="download('doc')">DOC</button>
              </div>

              <!-- Changed points -->
              <section v-if="rewriteResult.changedPoints.length" class="suggestion-section" aria-labelledby="reduce-changes-title">
                <h3 id="reduce-changes-title">改写要点</h3>
                <ul>
                  <li v-for="point in rewriteResult.changedPoints" :key="point">{{ point }}</li>
                </ul>
              </section>

            </div>
          </Transition>
        </section>
      </Transition>

    </div>
  </div>
</template>

<style scoped>
/* ─── Page ───────────────────────────────────────────── */
.reduce-page {
  min-height: 100dvh;
}

/* ─── Hero ───────────────────────────────────────────── */
.reduce-hero {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--border-subtle);
  background: linear-gradient(160deg, rgba(124, 108, 244, 0.06) 0%, transparent 55%);
}

.reduce-hero::before {
  content: '';
  position: absolute;
  top: -70%;
  left: -8%;
  width: 50%;
  height: 220%;
  background: radial-gradient(ellipse, rgba(124, 108, 244, 0.12), transparent 60%);
  pointer-events: none;
}

.reduce-hero-inner {
  max-width: 64rem;
  margin: 0 auto;
  padding: 4rem 1.5rem 3.5rem;
  position: relative;
  animation: slideUp var(--duration-slow) var(--ease-out) both;
}

.reduce-hero-title {
  font-size: clamp(2rem, 5.5vw, 3.8rem);
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 0.35em;
}

.reduce-hero-desc {
  color: var(--text-secondary);
  font-size: 1.05rem;
  max-width: 48rem;
  line-height: 1.8;
}

/* ─── Workspace ──────────────────────────────────────── */
.reduce-workspace {
  max-width: 64rem;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 6rem;
  display: grid;
  gap: 1.25rem;
}

/* ─── Card ───────────────────────────────────────────── */
.rw-card {
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  background: var(--bg-surface);
  padding: 1.75rem;
  box-shadow: var(--shadow-card);
  animation: slideUp var(--duration-slow) var(--ease-out) both;
}

.rw-result-card { animation-delay: 60ms; }

.rw-card-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.rw-step-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--brand-muted);
  border: 1px solid rgba(124, 108, 244, 0.3);
  color: var(--brand);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rw-card-title {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

/* ─── Text panel ─────────────────────────────────────── */
.rw-text-panel { display: grid; gap: 0.5rem; }

.rw-textarea { min-height: 16rem; }

/* ─── Drop Zone ──────────────────────────────────────── */
.drop-zone {
  border: 2px dashed var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--bg-base);
  cursor: pointer;
  position: relative;
  transition:
    border-color var(--duration-normal) var(--ease-out),
    background var(--duration-normal) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring);
  outline: none;
}

.drop-zone:focus-visible {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--brand-muted);
}

.drop-zone--over {
  border-color: var(--brand);
  background: var(--brand-muted);
  transform: scale(1.01);
}

.drop-zone--filled {
  border-style: solid;
  border-color: var(--border-default);
  cursor: default;
}

.drop-zone__input {
  display: none;
}

/* Empty state */
.drop-zone__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  gap: 0.4rem;
  cursor: pointer;
}

.drop-icon-wrap {
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  transition: color var(--duration-normal) var(--ease-out), transform var(--duration-normal) var(--ease-spring);
}

.drop-zone--over .drop-icon-wrap {
  color: var(--brand);
  transform: translateY(-4px) scale(1.1);
}

.drop-title {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}

.drop-sub {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.drop-link {
  color: var(--brand);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Filled state */
.drop-zone__filled {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
}

.drop-file-icon {
  color: var(--brand);
  flex-shrink: 0;
}

.drop-file-info {
  flex: 1;
  min-width: 0;
}

.drop-file-name {
  color: var(--text-primary);
  font-weight: 700;
  margin: 0 0 0.2rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drop-file-remove {
  flex-shrink: 0;
  padding: 0.45rem;
  min-height: 36px;
  min-width: 36px;
}

/* ─── Action row ─────────────────────────────────────── */
.rw-action-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.rw-submit-btn {
  gap: 0.5rem;
  font-size: 1rem;
  min-height: 52px;
  padding: 0 2rem;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

/* ─── Result body ────────────────────────────────────── */
.rw-result-body {
  display: grid;
  gap: 1.25rem;
}

/* Score banner */
.score-banner {
  padding: 1.25rem 1.5rem;
}

.score-banner-nums {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.score-banner-item {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-direction: column;
}

.score-banner-item.old { opacity: 0.5; }

.score-banner-num {
  font-size: 2.8rem;
  font-weight: 900;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.score-banner-pct {
  font-size: 1.3rem;
  font-weight: 700;
  margin-left: 1px;
}

.score-banner-lbl {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.7;
  margin-top: 3px;
}

.score-banner-arrow {
  opacity: 0.7;
  flex-shrink: 0;
}

.score-banner-msg {
  font-weight: 700;
  margin: 0;
  font-size: 0.92rem;
}

/* Summary */
.rw-summary {
  color: var(--text-secondary);
  font-size: 0.93rem;
  line-height: 1.7;
  margin: 0;
}

/* Output area */
.rw-output-wrap { display: grid; gap: 0.5rem; }

.rw-output-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.rw-output-actions { display: flex; gap: 0.5rem; }

.rw-action-btn {
  gap: 0.35rem;
  display: inline-flex;
  align-items: center;
  font-size: 0.85rem;
  min-height: 36px;
  padding: 0.4rem 0.75rem;
}

.rw-output-textarea {
  min-height: 26rem;
  transition:
    min-height var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out);
}

.rw-output-wrap--expanded .rw-output-textarea {
  min-height: min(68vh, 46rem);
  box-shadow: 0 0 0 1px var(--brand-muted), 0 18px 60px rgba(0, 0, 0, 0.32);
}

/* Download row */
.rw-download-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.rw-download-label {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 700;
}

/* Loading state */
.rw-state-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.5rem;
  text-align: center;
  gap: 0.75rem;
}

.loading-ring-lg {
  animation: spin 1.5s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.rw-state-title {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

/* ─── Transitions ────────────────────────────────────── */
.result-enter-enter-active {
  transition: opacity 300ms var(--ease-out), transform 320ms var(--ease-out);
}
.result-enter-leave-active {
  transition: opacity 180ms var(--ease-in);
}
.result-enter-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.result-enter-leave-to {
  opacity: 0;
}

.panel-fade-enter-active {
  transition: opacity 200ms var(--ease-out), transform 220ms var(--ease-out);
}
.panel-fade-leave-active {
  transition: opacity 140ms var(--ease-in), transform 140ms var(--ease-in);
}
.panel-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.comp-slide-enter-active {
  transition: opacity 280ms var(--ease-out), transform 300ms var(--ease-spring);
}
.comp-slide-leave-active {
  transition: opacity 150ms var(--ease-in);
}
.comp-slide-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.96);
}
.comp-slide-leave-to {
  opacity: 0;
}

/* ─── Loading dots ───────────────────────────────────── */
.loading-dots {
  display: flex;
  gap: 5px;
}

.loading-dots span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--brand);
  animation: dot-bounce 1.2s ease-in-out infinite;
}

.loading-dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-dots span:nth-child(3) { animation-delay: 0.3s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
  40% { transform: scale(1); opacity: 1; }
}

/* ─── Spinner ────────────────────────────────────────── */
.btn-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

/* ─── File panel ─────────────────────────────────────── */
.rw-file-panel { display: grid; gap: 0.75rem; }
</style>
