import { createRouter, createWebHistory } from 'vue-router';
import DoView from '@/views/DoView.vue';
const DataView = () => import('@/views/DataView.vue');
const ImportView = () => import('@/views/ImportView.vue');
const SettingView = () => import('@/views/SettingView.vue');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'do',
      component: DoView,
    },
    {
      path: '/data',
      name: 'data',
      component: DataView,
    },
    {
      path: '/import',
      name: 'import',
      component: ImportView,
    },
    {
      path: '/setting',
      name: 'setting',
      component: SettingView,
    },
  ],
});

export default router;
