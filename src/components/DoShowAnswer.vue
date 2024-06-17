<script setup lang="ts">
import type { Question } from '@/stores/question';

const props = defineProps<{
  question: Question;
  isWrong: boolean;
}>();

const elAlertType = computed(() => {
  return props.isWrong ? 'error' : 'warning';
});
const elAlertTitle = computed(() => {
  return props.isWrong ? '回答错误' : '查看答案';
});

function getOptionType(index: number) {
  if (props.question.type === 'single') {
    return props.question.answer === index ? 'success' : 'danger';
  }
  if (props.question.type === 'multiple') {
    let answers = props.question.answer as Array<number>;
    return answers.includes(index) ? 'success' : 'danger';
  }
  return 'warning';
}
</script>

<template>
  <el-alert :title="elAlertTitle" :type="elAlertType">
    <el-text>{{ question.title }}</el-text>

    <div id="current-answer-tag">
      <el-tag v-for="(option, index) in question.options" :key="index" :type="getOptionType(index)">
        {{ option }}
      </el-tag>
    </div>

    <div v-if="question.explain">
      <el-text>解析：</el-text>
      <el-text>{{ question.explain }}</el-text>
    </div>
  </el-alert>
</template>

<style scoped>
#current-answer-tag {
  display: flex;
  flex-wrap: wrap;
  margin: 5px 0;
  gap: 5px;
}

#current-answer-tag > * {
  white-space: normal;
  height: fit-content;
  min-height: 24px;
  padding-top: 6px;
  padding-bottom: 6px;
}
</style>
