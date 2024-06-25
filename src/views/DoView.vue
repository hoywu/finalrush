<script setup lang="ts">
import { ElMessageBox, ElScrollbar } from 'element-plus';
import { useStateStore } from '@/stores/state';
import { useQuestionStore, type Question } from '@/stores/question';
import { useAnswerStore } from '@/stores/answerSheet';
import { useConfigStore } from '@/stores/config';
import { useWindowSize, useMagicKeys, whenever } from '@vueuse/core';

/*** 全局存储 ***/
const s = useStateStore();
const q = useQuestionStore();
const a = useAnswerStore();
const c = useConfigStore();

/*** 初始化 ***/
onMounted(() => {
  reset();
  navScrollToMid();
});

/*** 快捷键 ***/
const { h, j, k, l, bracketleft, bracketright } = useMagicKeys();
function hasOption(i: number): boolean {
  if (q.questions[s.state.qIndex].options && q.questions[s.state.qIndex].options instanceof Array) {
    return i < q.questions[s.state.qIndex].options.length;
  }
  return false;
}
function setAnswer(ans: any) {
  if (typeof ans === 'number') {
    if (!hasOption(ans)) return;
    selectAnswer();
  }

  if (q.isSingle(s.state.qIndex)) {
    (a.answerSheet[s.state.qIndex] as any) = ans;
    return;
  }

  if (q.isMultiple(s.state.qIndex)) {
    if ((a.answerSheet[s.state.qIndex] as any) instanceof Array) {
      if ((a.answerSheet[s.state.qIndex] as any).includes(ans)) {
        (a.answerSheet[s.state.qIndex] as any).splice(
          (a.answerSheet[s.state.qIndex] as any).indexOf(ans),
          1
        );
      } else {
        (a.answerSheet[s.state.qIndex] as any).push(ans);
      }
      return;
    }
    (a.answerSheet[s.state.qIndex] as any) = [ans];
    return;
  }
}
whenever(h, () => setAnswer(0));
whenever(j, () => setAnswer(1));
whenever(k, () => setAnswer(2));
whenever(l, () => setAnswer(3));
whenever(bracketleft, () => {
  if (q.isBlank(s.state.qIndex)) return;
  if (q.isSAQ(s.state.qIndex) && !c.skipSAQ) return;
  prev();
});
whenever(bracketright, () => {
  if (q.isBlank(s.state.qIndex)) return;
  if (q.isSAQ(s.state.qIndex) && !c.skipSAQ) return;
  next();
});

/*** 引导 ***/
const openTour = ref(false);

const loading = ref(false);
/*** 查看答案框 ***/
const errIndex = ref(-1);
const showCheck = ref(false);
const checkIndex = computed(() => {
  return errIndex.value !== -1 ? errIndex.value : s.state.qIndex;
});
/*** 手动判题 ***/
const manualCheck = ref(true);

/*** 导航工具条 ***/
const navIndex = ref(s.state.qIndex + 1);
const navOpts = computed(() => {
  // 生成导航条选项
  return Array.from({ length: q.qCount }, (_, i) => i + 1);
});
const navWidth = computed(() => {
  // 计算导航条宽度
  return `max(100%, ${q.qCount * 55}px)`;
});
const { width } = useWindowSize();
const navMid = computed(() => {
  // 导航条中间位置
  return Math.round(width.value / 2 / 55);
});
const navScrollRef = ref<InstanceType<typeof ElScrollbar>>();
function navScrollToMid() {
  // 导航条滚动到中间
  navScrollRef.value?.setScrollLeft((navIndex.value - navMid.value) * 55);
}
watch(navIndex, (val) => {
  s.state.qIndex = val - 1;
  navScrollToMid();
});
watch(s.state, (val) => {
  navIndex.value = val.qIndex + 1;
});

/*** 错误率 ***/
const errRate = computed(() => {
  const rate = q.questions[s.state.qIndex].errNum / q.questions[s.state.qIndex].doNum;
  return isNaN(rate)
    ? '0% (0/0)'
    : `${(rate * 100).toFixed(0)}% (${q.questions[s.state.qIndex].errNum}/${q.questions[s.state.qIndex].doNum})`;
});
const errColor = computed(() => {
  if (q.questions[s.state.qIndex].doNum <= 3) {
    return 'info';
  }
  const rate = q.questions[s.state.qIndex].errNum / q.questions[s.state.qIndex].doNum;
  if (rate < 0.2) {
    return 'success';
  } else if (rate < 0.5) {
    return 'warning';
  } else {
    return 'danger';
  }
});

/*** 事件函数 ***/
const navScrollLeft = ref(0);
function onScrollNav(event: WheelEvent) {
  // 导航条滚轮事件
  navScrollRef.value?.setScrollLeft(navScrollLeft.value + event.deltaY);
}

function setArrayAnswer(ans: string, index: number) {
  // 在答题卡中存放数组答案
  if (!a.answerSheet[s.state.qIndex]) {
    (a.answerSheet[s.state.qIndex] as any) = [];
  }
  (a.answerSheet[s.state.qIndex][index] as any) = ans;
}

function getBlankValue(index: number) {
  // 获取填空当前值
  if ((a.answerSheet[s.state.qIndex] as any) instanceof Array) {
    return a.answerSheet[s.state.qIndex][index] || '';
  }
  return '';
}

function nextInput(event: KeyboardEvent) {
  // 焦点切换到下一个输入框，到达最后一个输入框自动下一题
  const src = event.target as HTMLInputElement;
  let parent = src.parentElement;
  while (parent) {
    if (parent.classList.contains('blank-item')) break;
    parent = parent.parentElement;
  }

  if (parent) {
    let n = parent.nextElementSibling;
    if (n && n.classList.contains('blank-item')) {
      n.querySelector('input')?.focus();
      return;
    }
  }

  next();
}

function selectAnswer() {
  // 选择答案回调
  setTimeout(() => {
    if (c.autoNext && q.isSingle(s.state.qIndex)) {
      next();
    }
  }, 300);
}

function showAnswer() {
  // 查看答案按钮
  errIndex.value = -1;
  showCheck.value = !showCheck.value;
}

function prev() {
  // 上一题按钮
  if (s.state.qIndex === 0) {
    return;
  }
  showCheck.value = false;
  s.state.qIndex--;
}

function next() {
  // 下一题按钮
  let correct;
  if (!q.supportCheck(s.state.qIndex)) {
    // 需人工判题的题型
    correct = manualCheck.value;
  } else {
    // 其他题型
    correct = q.checkAnswer(s.state.qIndex, a.get(s.state.qIndex));
  }
  correct ? correctAnswer(s.state.qIndex) : wrongAnswer(s.state.qIndex);
  if (s.state.qIndex === q.qCount - 1) {
    submit();
    return;
  }
  manualCheck.value = true;
  s.state.qIndex++;
  if (q.isBlank(s.state.qIndex)) {
    // 填空自动聚焦
    const input = document.querySelector('.blank-item input');
    if (input instanceof HTMLInputElement) {
      input.focus();
    }
  }
}

function submit() {
  // 做完提交
  loading.value = true;
  setTimeout(() => {
    showResultDialog();
    loading.value = false;
  }, 1);
}

function restart() {
  // 重新开始
  s.reset();
  a.reset();
  reset();
}

function reset() {
  // 清除当前页面的状态
  errIndex.value = -1;
  showCheck.value = false;
}

function showResultDialog() {
  let correct = 0;
  let wrong = [] as Array<Question>;
  q.questions.forEach((v, i) => {
    q.checkAnswer(i, a.get(i)) ? correct++ : wrong.push(v);
  });

  ElMessageBox({
    title: '做题结果',
    message: `正确 ${correct} 题，错误 ${wrong.length} 题<br>
                        是否导入错题重新开始？`,
    dangerouslyUseHTMLString: true,
    type: 'success',
    showCancelButton: true,
    confirmButtonText: '导入错题',
    cancelButtonText: '取消',
  })
    .then((action) => {
      if (action === 'confirm') {
        q.questions = wrong;
        restart();
      }
    })
    .catch(() => {});
}

function correctAnswer(index: number) {
  // 用户点击下一题，答案正确
  s.correct();
  q.plusCorrect(index);
  reset();
}

function wrongAnswer(index: number) {
  // 用户点击下一题，答案错误
  s.wrong();
  q.plusWrong(index);
  errIndex.value = index;
  if (c.immediateCheck) {
    showCheck.value = true;
  }
}
</script>

<template>
  <div v-if="q.isEmpty()">
    <el-alert title="题库为空" type="warning">
      <div class="flex gap-3">
        <el-text>请先导入题库</el-text>
        <el-button type="primary" size="small" @click="openTour = true">查看教程</el-button>
      </div>
    </el-alert>

    <TheTour v-model="openTour" />
  </div>

  <div v-else v-loading="loading">
    <!-- 导航工具条 -->
    <div class="do-scrollSeg">
      <el-scrollbar
        ref="navScrollRef"
        @scroll="navScrollLeft = $event.scrollLeft"
        @wheel.prevent="onScrollNav"
      >
        <el-segmented
          :style="{ width: navWidth }"
          v-model="navIndex"
          :options="navOpts"
          size="default"
        />
      </el-scrollbar>
    </div>

    <!-- 进度条 -->
    <div class="flex items-center justify-center gap-2 mt-2">
      <el-text>{{ s.state.qIndex + 1 }} / {{ q.qCount }}</el-text>
      <el-progress
        :percentage="((s.state.qIndex + 1) / q.qCount) * 100"
        :show-text="false"
        style="flex-grow: 1"
        id="el-progress"
      />
    </div>

    <!-- 指示器 -->
    <div class="flex items-center gap-2 mt-2">
      <el-tag type="success">正确 {{ s.state.correctCount }}</el-tag>
      <el-tag type="danger">错误 {{ s.state.wrongCount }}</el-tag>
    </div>

    <!-- 做题区 -->
    <div class="my-5 mx-0">
      <!-- 题目 -->
      <div class="flex items-center gap-2" :style="{ fontSize: c.titleFontSize + 'px' }">
        <el-tag>{{ s.state.qIndex + 1 }}</el-tag>
        {{ q.questions[s.state.qIndex].title }}
      </div>

      <div class="mt-2">
        <el-tag :type="errColor">错误率: {{ errRate }}</el-tag>
      </div>

      <!-- 图片 -->
      <div v-if="q.questions[s.state.qIndex].imgs" class="mt-2">
        <img v-for="(img, i) of q.questions[s.state.qIndex].imgs" :key="i" :src="img" />
      </div>

      <!-- 选项 -->
      <div class="flex flex-col my-5 mx-0">
        <!-- 单选 -->
        <el-radio-group
          v-model="a.answerSheet[s.state.qIndex]"
          class="do-option-group"
          v-if="q.questions[s.state.qIndex].type === 'single'"
        >
          <el-radio
            v-for="(option, index) in q.questions[s.state.qIndex].options"
            :key="index"
            :value="index"
            border
            size="large"
            style="width: 100%"
            @change="selectAnswer"
          >
            <el-text :style="{ fontSize: c.optionFontSize + 'px' }">{{ option }}</el-text>
          </el-radio>
        </el-radio-group>

        <!-- 多选 -->
        <el-checkbox-group
          v-model="a.answerSheet[s.state.qIndex]"
          class="do-option-group"
          v-if="q.questions[s.state.qIndex].type === 'multiple'"
        >
          <el-checkbox
            v-for="(option, index) in q.questions[s.state.qIndex].options"
            :key="index"
            :value="index"
            border
            size="large"
            style="width: 100%"
            @change="selectAnswer"
          >
            <el-text :style="{ fontSize: c.optionFontSize + 'px' }">{{ option }}</el-text>
          </el-checkbox>
        </el-checkbox-group>

        <!-- 填空 -->
        <div class="flex flex-col gap-2" v-if="q.questions[s.state.qIndex].type === 'blank'">
          <div
            class="blank-item flex items-center gap-2"
            v-for="(_, i) in q.questions[s.state.qIndex].answer"
            :key="i"
          >
            <el-tag>{{ i + 1 }}</el-tag>
            <ElemStatefulInput
              :value="getBlankValue(i)"
              @input="setArrayAnswer($event, i)"
              @keydown.enter="nextInput"
              placeholder="请填空"
            />
          </div>
        </div>

        <!-- 简答 -->
        <div v-if="q.questions[s.state.qIndex].type === 'short_answer'">
          <el-alert v-if="!c.skipSAQ" title="请人工判题" type="info" :closable="false">
            <el-radio-group v-model="manualCheck">
              <el-radio :value="true">正确</el-radio>
              <el-radio :value="false">错误</el-radio>
            </el-radio-group>
          </el-alert>

          <el-input
            v-if="!c.skipSAQ"
            class="mt-3"
            type="textarea"
            :rows="5"
            placeholder="请简答"
            v-model="a.answerSheet[s.state.qIndex]"
          />

          <!-- prettier-ignore -->
          <ElemCard :content="(q.questions[s.state.qIndex].answer as string)" />
        </div>

        <!-- 编程 -->
        <div v-if="q.questions[s.state.qIndex].type === 'coding'">
          <!-- prettier-ignore -->
          <ElemCode :code="(q.questions[s.state.qIndex].answer as Array<string>)" />
        </div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div id="do-control">
      <div>
        <el-button type="primary" @click="prev" :disabled="s.state.qIndex === 0">上一题</el-button>
        <el-button type="primary" @click="next">下一题</el-button>
      </div>
      <div>
        <el-button type="warning" @click="restart">重新开始</el-button>
        <el-button type="primary" @click="showAnswer">查看答案</el-button>
      </div>
    </div>

    <!-- 查看答案框 -->
    <div v-if="showCheck" class="mt-4">
      <DoShowAnswer :question="q.questions[checkIndex]" :isWrong="errIndex !== -1" />
    </div>
  </div>
</template>

<style scoped>
.do-option-group {
  @apply flex flex-col items-start gap-3 w-full;
}

.do-option-group > :deep(*) {
  height: fit-content !important;
  min-height: 40px;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
  margin: 0 !important;
}

.do-option-group :deep(*) {
  white-space: normal;
  line-height: 1.4;
}

.do-scrollSeg :deep(.el-segmented__item-selected),
.do-scrollSeg :deep(.el-segmented__item-label) {
  transition: unset;
}

.do-scrollSeg :deep(.el-scrollbar__bar) {
  display: none;
}

#do-control {
  @apply flex items-center justify-between gap-3;
}

@media (max-width: 768px) {
  #do-control {
    flex-direction: column-reverse;
    align-items: flex-end;
  }
}
</style>
