<script setup lang="ts">
import HomeView from '@/views/HomeView.vue'
import DetectorView from '@/views/DetectorView.vue'
</script>

<template>
  <a class="skip-link" href="#main-content">跳转到主内容</a>

  <div class="app-shell">
    <header class="site-header">
      <nav class="nav" aria-label="主导航">
        <a class="brand" href="#top" translate="no">AIGC Guard</a>
        <a class="nav-link" href="#detector">开始检测</a>
      </nav>
    </header>

    <main id="main-content">
      <HomeView />
      <DetectorView />
    </main>
  </div>
</template>
