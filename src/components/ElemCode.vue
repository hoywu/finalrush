<script setup lang="ts">
import { useConfigStore } from '@/stores/config';

const config = useConfigStore();

const props = defineProps<{
  code: any;
}>();

const code = computed(() => {
  if (props.code instanceof Array) return props.code.join('\n');
  else return props.code;
});
</script>

<template>
  <div class="flex flex-col gap-1">
    <el-input-number size="small" v-model="config.codeBlockFontSize" :min="6" :max="24" :step="1" />
    <highlightjs class="code_block" autodetect :code="code" />
  </div>
</template>

<style scoped>
.code_block :deep(*) {
  font-size: v-bind('config.codeBlockFontSize + "px"');
}
</style>
