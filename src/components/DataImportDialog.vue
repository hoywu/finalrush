<script setup lang="ts">
import { useSnapshootStore } from '@/stores/snapshoot';
import { useQuestionStore } from '@/stores/question';
import { useAnswerStore } from '@/stores/answerSheet';
import { useStateStore } from '@/stores/state';
import { loadFromJSON, loadFromLocal, loadFromServer, removeLocal } from '@/utils/snapshoot';
import { useFileSystemAccess } from '@vueuse/core';
import { ElMessage } from 'element-plus';

const visible = defineModel<boolean>();
const loading = ref(false);
const ss = useSnapshootStore();
const q = useQuestionStore();
const a = useAnswerStore();
const s = useStateStore();

interface File {
  name: string;
  url: string;
}
const fileList = ref([] as Array<File>);
axios
  .get('dataList.json', {
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
  .then((response) => {
    fileList.value = response.data;
  });

const iType = ref(1);
const onlineFn = ref();
const localFn = ref('');
const customFn = ref('');

const res = useFileSystemAccess({
  dataType: 'Text',
  types: [
    {
      description: 'JSON',
      accept: {
        'application/json': ['.json'],
      },
    },
  ],
  excludeAcceptAllOption: true,
});

function selectFile() {
  // 选择文件
  if (!res.isSupported.value) {
    ElMessage.error('当前环境不支持文件操作');
    return;
  }
  res.open();
}

async function importFile() {
  // 导入题库
  loading.value = true;

  load().then(() => {
    loading.value = false;
    visible.value = false;
  });

  onlineFn.value = null;
  localFn.value = '';
  customFn.value = '';
}

function load(): Promise<void> {
  switch (iType.value) {
    case 1:
      // 在线题库
      if (!onlineFn.value && !customFn.value) break;
      if (customFn.value) {
        return loadFromServer(q, a, s, customFn.value, customFn.value);
      } else {
        return loadFromServer(q, a, s, onlineFn.value.name, onlineFn.value.url);
      }
    case 2:
      // 本地题库
      if (!localFn.value) break;
      loadFromLocal(ss, q, a, s, localFn.value);
      break;
    case 3:
      // JSON 文件
      if (!res.data.value) break;
      loadFromJSON(q, a, s, res.fileName.value, res.data.value);
      break;
  }
  return Promise.resolve();
}
</script>

<template>
  <div v-loading="loading">
    <el-dialog class="max-w-96" v-model="visible" title="载入题库">
      <div class="flex flex-col gap-2">
        <el-radio-group v-model="iType">
          <el-radio :value="1">在线题库</el-radio>
          <el-radio :value="2">本地题库</el-radio>
          <el-radio :value="3">JSON 文件</el-radio>
        </el-radio-group>

        <el-select
          v-if="iType === 1"
          v-model="onlineFn"
          value-key="name"
          placeholder="选择在线题库"
        >
          <el-option v-for="f of fileList" :key="f.name" :label="f.name" :value="f" />
        </el-select>
        <el-input
          v-if="iType === 1"
          v-model="customFn"
          @keyup.enter="importFile"
          placeholder="或输入隐藏题库名"
        />

        <el-select v-if="iType === 2" v-model="localFn" placeholder="选择本地题库">
          <el-option v-for="(v, k) in ss.snapshoot" :key="k" :label="v[0]" :value="v[0]">
            <span>{{ v[0] }}</span>
            <span class="float-right h-full flex items-center" @click.stop="removeLocal(ss, v[0])">
              <icon-material-symbols:delete-forever-rounded />
            </span>
          </el-option>
        </el-select>

        <div v-if="iType === 3" class="flex gap-3">
          <el-button type="primary" @click="selectFile">选择文件</el-button>
          <el-text>{{ res.fileName }}</el-text>
        </div>
      </div>

      <template #footer>
        <span>
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="importFile">导入</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped></style>
