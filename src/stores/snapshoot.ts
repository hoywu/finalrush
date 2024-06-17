import { ref } from 'vue';
import { defineStore, type StateTree } from 'pinia';
import type { State } from './state';
import type { Question } from './question';

export interface Snapshoot {
  state: State;
  questions: Array<Question>;
  answerSheet: Array<number | Array<number>>;
}

export const useSnapshootStore = defineStore(
  'snapshoot',
  () => {
    const map = new Map<string, Snapshoot>();
    const snapshoot = ref(map);

    return { snapshoot };
  },
  {
    persist: {
      serializer: {
        serialize(value: StateTree) {
          return JSON.stringify(Array.from(value.snapshoot));
        },
        deserialize(value: string) {
          const map = new Map(JSON.parse(value));
          return { snapshoot: map };
        },
      },
    },
  }
);
