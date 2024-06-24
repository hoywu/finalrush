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

    <!-- 选择题 -->
    <div v-if="question.type === 'single' || question.type === 'multiple'" class="answer_tags">
      <el-tag v-for="(option, index) in question.options" :key="index" :type="getOptionType(index)">
        {{ option }}
      </el-tag>
    </div>

    <!-- 填空题 -->
    <div v-if="question.type === 'blank'" class="answer_tags flex-col items-start">
      <el-tag v-for="(answer, index) in question.answer" :key="index" type="success">
        {{ answer }}
      </el-tag>
    </div>

    <!-- 简答题 -->
    <div v-if="question.type === 'short_answer'" class="my-3">
      <el-text>参考答案：</el-text>
      <el-text class="whitespace-pre-wrap">{{ question.answer }}</el-text>
    </div>

    <div v-if="question.explain">
      <el-text>解析：</el-text>
      <el-text class="whitespace-pre-wrap">{{ question.explain }}</el-text>
    </div>
  </el-alert>
</template>

<style scoped>
.answer_tags {
  display: flex;
  flex-wrap: wrap;
  margin: 5px 0;
  gap: 5px;
}

.answer_tags > * {
  line-height: 1.4;
  white-space: normal;
  height: fit-content;
  min-height: 24px;
  padding-top: 6px;
  padding-bottom: 6px;
}
</style>
