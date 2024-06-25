<script setup lang="ts">
import { useHotkeyStore } from '@/stores/hotkey';
import { useMagicKeys, whenever } from '@vueuse/core';
import iconReset from '~icons/material-symbols/refresh-rounded';
import iconCheck from '~icons/material-symbols/check-rounded';

const visible = defineModel<boolean>();
whenever(visible, () => {
  newKeys.value = [];
});

const keys = useMagicKeys();
const current = computed(() => Array.from(keys.current));
const newKeys = ref<string[]>([]);
watch(current, (val) => {
  if (val.length <= newKeys.value.length) return;
  newKeys.value = val;
});

const options = ['A', 'B', 'C', 'D', '上一题', '下一题'];
const option = ref('A');

const hotkey = useHotkeyStore();
const getHotkey = computed(() => {
  if (option.value === 'A') return hotkey.a;
  if (option.value === 'B') return hotkey.b;
  if (option.value === 'C') return hotkey.c;
  if (option.value === 'D') return hotkey.d;
  if (option.value === '上一题') return hotkey.prev;
  if (option.value === '下一题') return hotkey.next;
});

function saveHotkey() {
  if (option.value === 'A') hotkey.a = newKeys.value.join('+');
  else if (option.value === 'B') hotkey.b = newKeys.value.join('+');
  else if (option.value === 'C') hotkey.c = newKeys.value.join('+');
  else if (option.value === 'D') hotkey.d = newKeys.value.join('+');
  else if (option.value === '上一题') hotkey.prev = newKeys.value.join('+');
  else if (option.value === '下一题') hotkey.next = newKeys.value.join('+');
  newKeys.value = [];
}
</script>

<template>
  <el-dialog v-model="visible" title="键盘热键" class="max-w-lg">
    <div class="flex flex-col gap-2">
      <el-segmented v-model="option" :options="options" />

      <div class="flex flex-col bg-gray-100 rounded p-5 gap-3">
        <el-text>当前热键</el-text>
        <el-text class="key">{{ getHotkey }}</el-text>
      </div>

      <div v-if="newKeys.length > 0" class="flex items-center gap-1 self-center">
        <el-button :icon="iconReset" @click="newKeys = []" text />
        <div v-for="key of newKeys" :key="key" class="key">{{ key }}</div>
        <el-button :icon="iconCheck" @click="saveHotkey" text />
      </div>
    </div>

    <template #footer></template>
  </el-dialog>
</template>

<style scoped>
.key {
  @apply p-2 bg-gray-200 rounded;
}
</style>
