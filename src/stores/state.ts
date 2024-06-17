import { ref } from 'vue';
import { defineStore } from 'pinia';
import _ from 'lodash';

export interface State {
  qIndex: number;
  correctCount: number;
  wrongCount: number;
}

export const useStateStore = defineStore(
  'state',
  () => {
    const state = ref<State>({
      qIndex: 0,
      correctCount: 0,
      wrongCount: 0,
    });

    function correct() {
      state.value.correctCount++;
    }

    function wrong() {
      state.value.wrongCount++;
    }

    function reset() {
      state.value.qIndex = 0;
      state.value.correctCount = 0;
      state.value.wrongCount = 0;
    }

    function recover(newState: State) {
      state.value = _.cloneDeep(newState);
    }

    return { state, correct, wrong, reset, recover };
  },
  {
    persist: true,
  }
);
