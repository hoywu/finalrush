import { createRouter, createWebHistory } from 'vue-router';
import DoView from '@/views/DoView.vue';
const DataView = () => import(/* webpackPrefetch: true */ '@/views/DataView.vue');
const ImportView = () => import(/* webpackPrefetch: true */ '@/views/ImportView.vue');
const SettingView = () => import(/* webpackPrefetch: true */ '@/views/SettingView.vue');

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
