<script setup lang="ts">
import { useConfigStore } from '@/stores/config';

const config = useConfigStore();

const hotkey = ref(false);
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <div><el-button type="warning" @click="config.reset">重置</el-button></div>
    <div><el-button type="primary" @click="hotkey = true">修改键盘热键</el-button></div>
    <SetHotKeyDialog v-model="hotkey" />
  </div>

  <div class="flex flex-col gap-1 mt-2">
    <el-checkbox v-model="config.autoNext">单选自动下一题</el-checkbox>
    <el-checkbox v-model="config.immediateCheck">做错立即显示答案</el-checkbox>
    <el-checkbox v-model="config.skipSAQ">不做简答 (直接显示答案)</el-checkbox>

    <div class="grid grid-cols-1">
      <el-text>题目字体大小：</el-text>
      <el-input-number v-model="config.titleFontSize" :min="12" :max="24" :step="1" />
    </div>
    <div class="grid grid-cols-1 mt-1">
      <el-text>选项字体大小：</el-text>
      <el-input-number v-model="config.optionFontSize" :min="12" :max="24" :step="1" />
    </div>
  </div>
</template>

<style scoped></style>
