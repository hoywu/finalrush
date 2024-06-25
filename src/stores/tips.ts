import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useTipsStore = defineStore(
  'tips',
  () => {
    const tipped = ref<string[]>([]);

    function isTipped(key: string) {
      return tipped.value.includes(key);
    }

    function setTip(key: string) {
      if (isTipped(key)) return;
      tipped.value.push(key);
    }

    return { tipped, isTipped, setTip };
  },
  {
    persist: true,
  }
);
