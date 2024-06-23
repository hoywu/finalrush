import _ from 'lodash';
import { useObjectUrl } from '@vueuse/core';

// const ss = useSnapshootStore();
// const q = useQuestionStore();
// const a = useAnswerStore();
// const s = useStateStore();

export function saveToLocal(ss: any, q: any, a: any, s: any, name: string = q.filename) {
  // 保存到本地存储
  if (q.isEmpty()) {
    setTimeout(() => {
      ElNotification({
        title: '保存失败',
        message: '题库为空，无法保存',
        type: 'error',
        duration: 2000,
      });
    }, 1);
    return;
  }

  if (name.trim() === '') {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    name = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  ss.snapshoot.set(name, {
    state: _.cloneDeep(s.state),
    questions: _.cloneDeep(q.questions),
    answerSheet: _.cloneDeep(a.answerSheet),
  });

  setTimeout(() => {
    ElNotification({
      title: '保存成功',
      message: `${name} 题库及做题状态已保存`,
      type: 'success',
      duration: 2000,
    });
  }, 1);
}

export function saveToFile(q: any, a: any, s: any, name: string = q.filename) {
  // 保存到 JSON 文件
  const data = JSON.stringify({
    questions: q.questions,
    answerSheet: a.answerSheet,
    state: s.state,
  });
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
  const url = useObjectUrl(blob);
  if (!url.value) {
    setTimeout(() => {
      ElNotification({
        title: '保存失败',
        message: '无法生成链接',
        type: 'error',
        duration: 2000,
      });
    }, 1);
    return;
  }
  const el = document.createElement('a');
  el.href = url.value;
  el.download = name + '.json';
  el.click();
}

export function loadFromJSON(q: any, a: any, s: any, name: string, text: string) {
  // 从 JSON 文本中恢复
  const data = JSON.parse(text);
  q.recover(name, data.questions);
  a.recover(data.answerSheet);
  s.recover(data.state);
  setTimeout(() => {
    ElNotification({
      title: '导入成功',
      message: `${name} 题库已导入，共 ${q.qCount} 题`,
      type: 'success',
      duration: 2000,
    });
  }, 1);
}

export function loadFromServer(q: any, a: any, s: any, name: string, url: string): Promise<void> {
  // 从服务器导入
  return axios
    .get('json/' + url, {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
    .then((response) => {
      q.recover(name, response.data);
      a.reset();
      s.reset();
      setTimeout(() => {
        ElNotification({
          title: '导入成功',
          message: `题库共 ${q.qCount} 题`,
          type: 'success',
          duration: 2000,
        });
      }, 500);
    })
    .catch(() => {
      ElNotification({
        title: '导入失败',
        message: '请确认文件是否存在',
        type: 'error',
        duration: 2000,
      });
    });
}

export function loadFromLocal(ss: any, q: any, a: any, s: any, name: string) {
  // 从本地存储恢复
  const file = ss.snapshoot.get(name);
  if (file) {
    q.recover(name, file.questions);
    a.recover(file.answerSheet);
    s.recover(file.state);
  }

  setTimeout(() => {
    ElNotification({
      title: '导入成功',
      message: `${name} 题库已导入，共 ${q.qCount} 题`,
      type: 'success',
      duration: 2000,
    });
  }, 1);
}

export function removeLocal(ss: any, name: string) {
  // 从本地存储删除
  ss.snapshoot.delete(name);
  setTimeout(() => {
    ElNotification({
      title: '删除成功',
      message: `${name} 题库已删除`,
      type: 'success',
      duration: 2000,
    });
  }, 1);
}
