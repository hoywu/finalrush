import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useHotkeyStore = defineStore(
  'hotkey',
  () => {
    const a = ref('h');
    const b = ref('j');
    const c = ref('k');
    const d = ref('l');
    const e = ref('');
    const f = ref('');
    const g = ref('');
    const h = ref('');
    const prev = ref('[');
    const next = ref(']');
    const showAns = ref('a');

    return { a, b, c, d, e, f, g, h, prev, next, showAns };
  },
  {
    persist: true,
  }
);
