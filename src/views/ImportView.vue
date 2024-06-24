<script setup lang="ts">
import { ElNotification } from 'element-plus';
import {
  useQuestionStore,
  parseSelectQuestion,
  parseBlankQuestion,
  parseSAQ,
} from '@/stores/question';
import { useAnswerStore } from '@/stores/answerSheet';
import { useStateStore } from '@/stores/state';

const router = useRouter();

const nameInput = ref('');
const importQuestionInput = ref('');
const customFilter = ref('');
const showImportResult = ref(false);
const autoGoDo = ref(true);

const q = useQuestionStore();
const a = useAnswerStore();
const s = useStateStore();

const qtype = ref(0);
const tips = [
  // 选择题提示
  `- 题面以序号开头 (可后跟多行)
- 选项与题面换行分隔，选项行以字母开头 (可单/多行)
- 答案单独成行、或以字母形式填在题面括号中
- 解析行以 “答案解析:” 或 “解析:” 开头 (可选)"`,
  // 填空题提示
  `- 题面以序号开头 (可后跟多行)
- 包含任意非空白字符的括号视为一个填空`,
  // 简答题提示
  `- 题面以序号开头 (可后跟多行)
- 答案单独成行，以 “答案:/答:” 等标识开头`,
];
const parse: Array<Function> = [parseSelectQuestion, parseBlankQuestion, parseSAQ];

async function importQuestion(append: boolean) {
  const questions = parse[qtype.value](importQuestionInput.value, customFilter.value);
  if (append) {
    q.append(questions);
  } else {
    q.recover(nameInput.value, questions);
  }

  importQuestionInput.value = '';
  a.reset();
  s.reset();

  setTimeout(() => {
    ElNotification({
      title: '导入成功',
      message: `共导入 ${questions.length} 题，题库共 ${q.qCount} 题`,
      type: 'success',
      duration: 2000,
    });
  }, 500);

  if (autoGoDo.value) {
    router.push({ name: 'do' });
  }
}
</script>

<template>
  <div id="import_input_group" class="flex flex-col gap-2">
    <el-input v-model="nameInput" placeholder="题库名称 (覆盖导入时有效)" />

    <el-radio-group v-model="qtype">
      <el-radio :value="0">选择题</el-radio>
      <el-radio :value="1">填空题</el-radio>
      <el-radio :value="2">简答题</el-radio>
    </el-radio-group>

    <el-input
      v-model="importQuestionInput"
      :autosize="{ minRows: 6, maxRows: 6 }"
      type="textarea"
      :placeholder="'在此粘贴题库\n' + tips[qtype]"
    />
    <el-input
      v-model="customFilter"
      :autosize="{ minRows: 1, maxRows: 6 }"
      type="textarea"
      placeholder="自定义行过滤正则表达式 (每行一条)"
    />
  </div>

  <div class="flex justify-between my-4 mx-0">
    <div>
      <el-button
        type="primary"
        @click="importQuestion(false)"
        :disabled="importQuestionInput === ''"
        >覆盖导入
      </el-button>
      <el-button
        type="primary"
        @click="importQuestion(true)"
        :disabled="importQuestionInput === '' || q.isEmpty()"
        >追加导入
      </el-button>
    </div>
    <div>
      <el-switch v-model="autoGoDo" active-text="自动跳转到做题"></el-switch>
    </div>
  </div>
  <div v-if="showImportResult">
    <el-alert title="导入成功" type="success">
      <el-text>共导入 {{ q.qCount }} 题</el-text>
    </el-alert>
  </div>
</template>

<style scoped></style>
