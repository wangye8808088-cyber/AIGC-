<template>
  <section id="top" class="hero-section" aria-labelledby="hero-title">
    <div class="hero-copy">
      <p class="eyebrow">AIGC 风险检测 MVP</p>
      <h1 id="hero-title">检测文本的 AIGC 风险，而不是替你下最终判决</h1>
      <p class="hero-description">
        支持粘贴文本或上传 DOCX 文档，快速获得风险率、证据片段和人工复核建议。
      </p>
      <div class="hero-actions">
        <a class="primary-button" href="#detector">开始检测</a>
        <a class="secondary-button" href="#privacy-note">查看隐私说明</a>
      </div>
    </div>

    <aside class="hero-card" aria-label="产品能力摘要">
      <dl>
        <div>
          <dt>输入方式</dt>
          <dd>文本 / DOCX</dd>
        </div>
        <div>
          <dt>输出结果</dt>
          <dd>AIGC 风险率 + 证据</dd>
        </div>
        <div>
          <dt>数据策略</dt>
          <dd>首版默认不保存原文</dd>
        </div>
      </dl>
    </aside>
  </section>
</template>
