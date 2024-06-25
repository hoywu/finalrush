import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useHotkeyStore = defineStore(
  'hotkey',
  () => {
    const a = ref('h');
    const b = ref('j');
    const c = ref('k');
    const d = ref('l');
    const prev = ref('[');
    const next = ref(']');

    return { a, b, c, d, prev, next };
  },
  {
    persist: true,
  }
);
