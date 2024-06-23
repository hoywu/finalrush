<script setup lang="ts">
import { ElNotification } from 'element-plus';
import { useStateStore } from '@/stores/state';
import { useQuestionStore, type Question } from '@/stores/question';
import { useAnswerStore } from '@/stores/answerSheet';
import IconLoad from '~icons/uil/import';
import IconSave from '~icons/uil/export';
import IconAction from '~icons/codicon/github-action';
import IconRemove from '~icons/material-symbols/delete-rounded';

const s = useStateStore();
const q = useQuestionStore();
const a = useAnswerStore();

const loading = ref(false);
const showAnswer = ref(true);
const showExplan = ref(false);

const importDialogVisible = ref(false);
const saveDialogVisible = ref(false);

// 表格分页
const page = ref(1);
const pageSize = ref(10);
const search = ref('');
const tableData = computed(() => q.questions.filter(filterFn));
function filterFn(data: Question, index: number) {
  if (search.value !== '') {
    const s = search.value.toLowerCase();
    return (
      data.title.toLowerCase().includes(s) ||
      data.explain.toLowerCase().includes(s) ||
      data.options.some((option) => option.toLowerCase().includes(s))
    );
  }
  return index >= (page.value - 1) * pageSize.value && index < page.value * pageSize.value;
}
watch(page, () => {
  // 滚动到顶部
  window.scrollTo(0, 0);
});

function shuffle() {
  // 打乱题目
  loading.value = true;
  setTimeout(() => {
    q.questions.sort(() => Math.random() - 0.5);
    loading.value = false;
  }, 1);
}

function shuffleSelect() {
  // 打乱选项
  loading.value = true;
  setTimeout(() => {
    q.questions.forEach((question) => {
      if (question.type === 'single') {
        // 单选打乱选项
        const answer = question.options[question.answer as number];
        question.options.sort(() => Math.random() - 0.5);
        question.answer = question.options.indexOf(answer);
      }

      if (question.type === 'multiple' && Array.isArray(question.answer)) {
        // 多选打乱选项
        const answer = [] as Array<string>;
        question.answer.forEach((answerIndex) => {
          if (typeof answerIndex === 'number') {
            answer.push(question.options[answerIndex]);
          }
        });
        question.options.sort(() => Math.random() - 0.5);
        const newAnswer = [] as Array<number>;
        answer.forEach((answerText) => {
          newAnswer.push(question.options.indexOf(answerText));
        });
        question.answer = newAnswer;
      }
    });
    loading.value = false;
  }, 1);
}

function clearNum() {
  // 清除题号
  loading.value = true;
  setTimeout(() => {
    // eslint-disable-next-line no-useless-escape
    const qNumRegex = /^\d+[\.．)）、]/;
    q.questions.forEach((question) => {
      question.title = question.title.replace(qNumRegex, '');
    });
    loading.value = false;
  }, 1);
}

function rmDuplicate() {
  // 去重
  loading.value = true;
  setTimeout(() => {
    const before = q.questions.length;

    const newQuestions = [] as Array<Question>;
    const map = new Map();
    for (const item of q.questions) {
      const title = item.title.replace(/\s/g, '');
      if (!map.has(title)) {
        map.set(title, true);
        newQuestions.push(item);
      }
    }
    q.questions = newQuestions;

    const after = q.questions.length;
    loading.value = false;
    ElNotification({
      title: '去重完成',
      message: `共去除 ${before - after} 题`,
      type: 'success',
      duration: 2000,
    });
  }, 1);
}

function clear() {
  // 清空
  loading.value = true;
  setTimeout(() => {
    s.reset();
    q.reset();
    a.reset();
    loading.value = false;
  }, 1);
}
</script>

<template>
  <div id="data-button-group">
    <el-button
      id="data_load_btn"
      type="primary"
      :icon="IconLoad"
      @click="importDialogVisible = true"
    />
    <el-button
      id="data_save_btn"
      type="success"
      :icon="IconSave"
      @click="saveDialogVisible = true"
    />

    <ElemPopover>
      <template #reference>
        <el-button id="data_action_btn" type="primary" :icon="IconAction">操作</el-button>
      </template>
      <el-button text @click="showAnswer = !showAnswer">显示/隐藏答案</el-button>
      <el-button text @click="showExplan = !showExplan">显示/隐藏解析</el-button>
      <el-button text @click="shuffle">打乱题目</el-button>
      <el-button text @click="shuffleSelect">打乱选项</el-button>
      <el-button text @click="clearNum">清除题号</el-button>
      <el-button text @click="rmDuplicate">去重</el-button>
    </ElemPopover>

    <el-button type="danger" :icon="IconRemove" @click="clear">清空</el-button>
  </div>

  <div class="mb-2">
    <el-input v-model="search" placeholder="搜索..." clearable />
  </div>

  <el-table v-loading="loading" :data="tableData" stripe :border="true">
    <el-table-column prop="title" label="题目" resizable />
    <el-table-column prop="options" label="选项" resizable>
      <template #default="scope">
        <div class="data-option-group">
          <el-tag v-for="(option, index) in scope.row.options" :key="index">
            {{ option }}
          </el-tag>
        </div>
      </template>
    </el-table-column>
    <el-table-column v-if="showAnswer" prop="answer" label="答案" resizable>
      <template #default="scope">
        <div class="data-option-group" v-if="scope.row.type === 'single'">
          <el-tag type="success">
            {{ scope.row.options[scope.row.answer] }}
          </el-tag>
        </div>
        <div class="data-option-group" v-if="scope.row.type === 'multiple'">
          <el-tag type="success" v-for="(option, index) in scope.row.answer" :key="index">
            {{ scope.row.options[option] }}
          </el-tag>
        </div>
      </template>
    </el-table-column>
    <el-table-column v-if="showExplan" prop="explain" label="解析" resizable />
  </el-table>

  <!-- 分页器 -->
  <div class="flex items-center gap-2 mt-3">
    <el-pagination
      background
      layout="prev, pager, next"
      :total="q.qCount"
      :pager-count="5"
      v-model:page-size="pageSize"
      v-model:current-page="page"
    />
    <el-select v-model="pageSize" placeholder="页数" style="width: 80px">
      <el-option v-for="item in [10, 20, 50, 100]" :key="item" :label="item" :value="item" />
    </el-select>
  </div>

  <DataImportDialog v-model="importDialogVisible" />
  <DataSaveDialog v-model="saveDialogVisible" />
</template>

<style scoped>
#data-button-group {
  @apply flex flex-wrap gap-2 mb-2;
}

#data-button-group > * {
  @apply ml-0;
}

.data-option-group {
  @apply flex flex-wrap gap-1;
}

.data-option-group > :deep(*) {
  white-space: normal;
  height: fit-content;
  line-height: 1.4;
  padding-top: 2px;
  padding-bottom: 2px;
}
</style>
