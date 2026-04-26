<script setup lang="ts">
import type { Evidence } from '@/types/analysis'

defineProps<{
  items: Evidence[]
}>()
</script>

<template>
  <section class="evidence-section" aria-labelledby="evidence-title">
    <h3 id="evidence-title">风险证据</h3>

    <p v-if="items.length === 0" class="empty-copy">
      暂未找到足够明确的风险片段，请补充更长文本或结合人工判断。
    </p>

    <ul v-else class="evidence-list">
      <li v-for="item in items" :key="`${item.type}-${item.text}`" class="evidence-item">
        <div class="evidence-header">
          <span class="tag">{{ item.type }}</span>
          <span class="confidence">置信度 {{ item.confidence }}%</span>
        </div>
        <blockquote>{{ item.text }}</blockquote>
        <p>{{ item.reason }}</p>
      </li>
    </ul>
  </section>
</template>
