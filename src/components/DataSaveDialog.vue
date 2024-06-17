<script setup lang="ts">
import { useSnapshootStore } from '@/stores/snapshoot';
import { useQuestionStore } from '@/stores/question';
import { useAnswerStore } from '@/stores/answerSheet';
import { useStateStore } from '@/stores/state';
import { saveToFile, saveToLocal } from '@/utils/snapshoot';

const visible = defineModel<boolean>();

const ss = useSnapshootStore();
const q = useQuestionStore();
const a = useAnswerStore();
const s = useStateStore();

const saveType = ref(1);
const saveName = ref('');

function save() {
  // 保存题库
  visible.value = false;
  if (saveType.value === 1) {
    // 浏览器存储
    saveToLocal(ss, q, a, s, saveName.value);
  } else if (saveType.value === 2) {
    // JSON 文件
    saveToFile(q, a, s, saveName.value);
  }
}

watch(visible, (value) => {
  if (value) {
    saveName.value = q.filename;
  }
});
</script>

<template>
  <el-dialog class="max-w-96" v-model="visible" title="保存题库">
    <div class="flex flex-col gap-2">
      <el-radio-group v-model="saveType">
        <el-radio :value="1">浏览器存储</el-radio>
        <el-radio :value="2">JSON 文件</el-radio>
      </el-radio-group>

      <div class="grid gap-1">
        <el-text>题库名 (同名浏览器存储将被覆盖)</el-text>
        <el-input v-model="saveName" @keyup.enter="save" placeholder="保存名称"></el-input>
      </div>
    </div>

    <template #footer>
      <span>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped></style>
