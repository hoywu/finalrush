import { ref } from 'vue';
import { defineStore } from 'pinia';
import _ from 'lodash';

export const useAnswerStore = defineStore(
  'answer',
  () => {
    const answerSheet = ref([]); // Array<number | Array<number>>

    function reset() {
      answerSheet.value = [];
    }

    function recover(data: any) {
      answerSheet.value = _.cloneDeep(data);
    }

    function get(index: number) {
      return answerSheet.value[index];
    }

    return { answerSheet, reset, recover, get };
  },
  {
    persist: true,
  }
);
