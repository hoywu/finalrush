import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useConfigStore = defineStore(
  'config',
  () => {
    const autoNext = ref(true);
    const immediateCheck = ref(true);
    const titleFontSize = ref(16);

    function reset() {
      autoNext.value = true;
      immediateCheck.value = true;
      titleFontSize.value = 16;
    }

    return { autoNext, immediateCheck, titleFontSize, reset };
  },
  {
    persist: true,
  }
);
