<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'

const scrolled = ref(false)
const route = useRoute()

function onScroll() {
  scrolled.value = window.scrollY > 20
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <a class="skip-link" href="#main-content">跳转到主内容</a>

  <div class="app-shell">
    <header class="site-header" :class="{ scrolled }">
      <nav class="nav" aria-label="主导航">
        <RouterLink to="/" class="brand" translate="no" aria-label="AIGC Guard 首页">
          <span class="brand-dot" aria-hidden="true"></span>
          AIGC Guard
        </RouterLink>

        <div class="nav-links" role="list">
          <RouterLink
            to="/detect"
            class="nav-link-item"
            :class="{ active: route.path === '/detect' }"
            aria-label="风险检测"
            role="listitem"
          >
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            检测
          </RouterLink>
          <RouterLink
            to="/reduce"
            class="nav-cta"
            :class="{ active: route.path === '/reduce' }"
            aria-label="降低 AIGC 风险"
          >
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            降低风险
          </RouterLink>
        </div>
      </nav>
    </header>

    <main id="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>

    <footer class="site-footer" role="contentinfo">
      <p>© 2026 AIGC Guard · 首版默认不保存原文 · 仅供参考</p>
    </footer>
  </div>
</template>

<style scoped>
.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 700;
  padding: 0.45rem 0.9rem;
  min-height: 36px;
  transition:
    background var(--duration-normal) var(--ease-out),
    color var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out);
}

.nav-link-item:hover,
.nav-link-item.active {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border-color: var(--border-default);
}

/* Page transition */
.page-enter-active {
  transition: opacity 220ms var(--ease-out), transform 240ms var(--ease-out);
}
.page-leave-active {
  transition: opacity 160ms var(--ease-in), transform 160ms var(--ease-in);
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
