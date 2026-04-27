<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const visible = ref(false)
onMounted(() => { requestAnimationFrame(() => { visible.value = true }) })
</script>

<template>
  <div class="home-page">
    <!-- Hero -->
    <section id="top" class="hero-section" aria-labelledby="hero-title">
      <div class="hero-bg-glow" aria-hidden="true"></div>

      <div class="hero-copy" :class="{ 'animate-slide-up': visible }">
        <p class="eyebrow">AIGC 风险检测平台</p>
        <h1 id="hero-title" class="hero-title">
          让文字回归<br>
          <span class="hero-title-accent">真实的声音</span>
        </h1>
        <p class="hero-description">
          粘贴文本或上传 DOCX，智能检测 AI 生成率；一键改写降低 AIGC 特征并自动复检——让你的内容保持独特的人文温度。
        </p>
        <div class="hero-actions">
          <RouterLink to="/detect" class="primary-button" aria-label="前往检测 AIGC 风险">
            <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            开始检测
          </RouterLink>
          <RouterLink to="/reduce" class="secondary-button" aria-label="前往降低 AIGC 风险">
            <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            降低 AIGC 风险
          </RouterLink>
        </div>
      </div>

      <aside
        class="hero-card"
        aria-label="产品能力摘要"
        :class="{ 'animate-slide-up': visible }"
        style="animation-delay: 80ms"
      >
        <p class="eyebrow" style="margin-bottom:1.25rem">产品能力</p>
        <dl>
          <div>
            <dt>输入方式</dt>
            <dd>纯文本 · DOCX 文档</dd>
          </div>
          <div>
            <dt>检测结果</dt>
            <dd>AIGC 风险率 + 证据片段</dd>
          </div>
          <div>
            <dt>降低能力</dt>
            <dd>AI 改写，目标率 &lt; 30%</dd>
          </div>
          <div>
            <dt>导出格式</dt>
            <dd>TXT · DOCX · DOC</dd>
          </div>
        </dl>
      </aside>
    </section>

    <!-- Feature Cards -->
    <section class="how-section" aria-labelledby="features-title">
      <p class="eyebrow">核心功能</p>
      <h2 id="features-title">两大核心模块</h2>

      <div class="features-row" role="list">
        <article class="feature-card" role="listitem">
          <div class="feature-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <p class="feature-title">AIGC 风险检测</p>
          <p class="feature-desc">基于 DeepSeek 大模型，精准评估文本 AI 生成风险率，给出可解释证据和复核建议。</p>
          <RouterLink to="/detect" class="feature-link" aria-label="前往 AIGC 检测">
            前往检测
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </RouterLink>
        </article>

        <article class="feature-card" role="listitem">
          <div class="feature-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <p class="feature-title">AIGC 风险降低</p>
          <p class="feature-desc">AI 辅助改写，保留原意同时降低 AIGC 特征，目标评分 &lt; 30%，支持导出为多种格式。</p>
          <RouterLink to="/reduce" class="feature-link" aria-label="前往 AIGC 降低">
            前往降低
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </RouterLink>
        </article>

        <article class="feature-card" role="listitem">
          <div class="feature-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <p class="feature-title">多格式支持</p>
          <p class="feature-desc">支持直接粘贴文本和上传 DOCX 文档，结果可导出为 TXT、DOCX、DOC 三种格式。</p>
        </article>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="how-section" aria-labelledby="how-title">
      <p class="eyebrow">使用流程</p>
      <h2 id="how-title">三步完成检测与优化</h2>

      <ol class="how-steps" aria-label="使用步骤">
        <li class="how-step">
          <span class="step-number" aria-hidden="true">1</span>
          <div class="step-content">
            <p class="step-title">输入内容</p>
            <p>粘贴文章段落，或拖拽上传 .docx 文档。字数建议 200 字以上以提高准确率。</p>
          </div>
        </li>
        <li class="how-step">
          <span class="step-number" aria-hidden="true">2</span>
          <div class="step-content">
            <p class="step-title">查看检测报告</p>
            <p>系统返回 AIGC 风险评分、关键证据片段及修改建议，评估 AI 生成可能性。</p>
          </div>
        </li>
        <li class="how-step">
          <span class="step-number" aria-hidden="true">3</span>
          <div class="step-content">
            <p class="step-title">降低风险并导出</p>
            <p>前往降低页，AI 自动改写并重新评分，展示改善幅度，可导出为多种格式。</p>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--brand);
  font-size: 0.85rem;
  font-weight: 700;
  margin-top: 0.75rem;
  transition: gap var(--duration-fast) var(--ease-out), opacity var(--duration-fast) var(--ease-out);
}

.feature-link:hover {
  opacity: 0.8;
  gap: 8px;
}
</style>
