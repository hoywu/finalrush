import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useConfigStore = defineStore(
  'config',
  () => {
    const autoNext = ref(true);
    const immediateCheck = ref(true);
    const titleFontSize = ref(16);
    const optionFontSize = ref(14);

    function reset() {
      autoNext.value = true;
      immediateCheck.value = true;
      titleFontSize.value = 16;
      optionFontSize.value = 14;
    }

    return { autoNext, immediateCheck, titleFontSize, optionFontSize, reset };
  },
  {
    persist: true,
  }
);
