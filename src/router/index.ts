import { createRouter, createWebHistory } from 'vue-router'
import HomePageView from '@/views/HomePageView.vue'
import DetectorView from '@/views/DetectorView.vue'
import ReduceView from '@/views/ReduceView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePageView,
    },
    {
      path: '/detect',
      name: 'detect',
      component: DetectorView,
    },
    {
      path: '/reduce',
      name: 'reduce',
      component: ReduceView,
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
