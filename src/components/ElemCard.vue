<script setup lang="ts">
import { useMouseInElement } from '@vueuse/core';
import { useConfigStore } from '@/stores/config';

const c = useConfigStore();

const props = defineProps<{
  content: string;
}>();

const text = computed(() => {
  const lb = c.cardLineBreak ? '\n\n' : '\n';
  const indent = c.cardIndent ? '　' : '';
  return indent + props.content.replaceAll('\n', lb + indent);
});

const boxRef = ref<HTMLElement | null>(null);
const { isOutside } = useMouseInElement(boxRef);
</script>

<template>
  <div class="relative" ref="boxRef">
    <div v-if="!isOutside" class="cbox absolute right-2 flex gap-3 bg-white">
      <el-checkbox v-model="c.cardLineBreak">换行</el-checkbox>
      <el-checkbox v-model="c.cardIndent">缩进</el-checkbox>
    </div>

    <el-card v-if="c.skipSAQ" class="whitespace-pre-wrap">
      {{ text }}
    </el-card>
  </div>
</template>

<style scoped>
.cbox {
  top: -1rem;
}

.cbox > :deep(.el-checkbox) {
  margin-right: 0;
}
</style>
