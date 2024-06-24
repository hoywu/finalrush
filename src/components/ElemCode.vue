<script setup lang="ts">
import { useMouseInElement } from '@vueuse/core';
import { useConfigStore } from '@/stores/config';

const config = useConfigStore();

const props = defineProps<{
  code: string | Array<string>;
}>();

const code = computed(() => {
  if (props.code instanceof Array) return props.code.join('\n');
  else return props.code;
});

const boxRef = ref<HTMLElement | null>(null);
const { isOutside } = useMouseInElement(boxRef);
</script>

<template>
  <div class="relative" ref="boxRef">
    <div v-if="!isOutside" class="absolute top-1 right-1">
      <el-input-number
        size="small"
        v-model="config.codeBlockFontSize"
        :min="6"
        :max="24"
        :step="1"
      />
    </div>
    <highlightjs class="code_block max-w-full" autodetect :code="code" />
  </div>
</template>

<style scoped>
.code_block :deep(*) {
  font-size: v-bind('config.codeBlockFontSize + "px"');
}
</style>
