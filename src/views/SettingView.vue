<script setup lang="ts">
import { useConfigStore } from '@/stores/config';

const config = useConfigStore();
</script>

<template>
  <el-button type="warning" @click="config.reset">重置</el-button>
  <div class="flex flex-col gap-1 mt-2">
    <el-checkbox v-model="config.autoNext">单选自动下一题</el-checkbox>
    <el-checkbox v-model="config.immediateCheck">做错立即显示答案</el-checkbox>
    <div class="grid grid-cols-1">
      <el-text>题目字体大小：</el-text>
      <el-input-number v-model="config.titleFontSize" :min="12" :max="24" :step="1" class="w-32" />
    </div>
  </div>
</template>

<style scoped></style>
