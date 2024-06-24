import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useConfigStore = defineStore(
  'config',
  () => {
    const autoNext = ref(true); // 单选自动下一题
    const immediateCheck = ref(true); // 做错立即显示答案
    const skipSAQ = ref(false); // 不做简答
    const titleFontSize = ref(16); // 题目字体大小
    const optionFontSize = ref(14); // 选项字体大小

    const codeBlockFontSize = ref(14); // 代码块字体大小
    const cardLineBreak = ref(false); // 简答添加空行
    const cardIndent = ref(false); // 简答缩进

    function reset() {
      autoNext.value = true;
      immediateCheck.value = true;
      skipSAQ.value = false;
      titleFontSize.value = 16;
      optionFontSize.value = 14;
    }

    return {
      autoNext,
      immediateCheck,
      skipSAQ,
      titleFontSize,
      optionFontSize,
      codeBlockFontSize,
      cardLineBreak,
      cardIndent,
      reset,
    };
  },
  {
    persist: true,
  }
);
