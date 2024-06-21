<script setup lang="ts">
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const openTour = defineModel<boolean>();
const router = useRouter();
const driverObj = driver({
  showProgress: true,
  smoothScroll: true,
  overlayOpacity: 0.3,
  disableActiveInteraction: true,
  steps: [
    {
      element: '#nav_data',
      popover: {
        title: '载入题库',
        description: '在数据页面，可以载入、保存题库',
        side: 'bottom',
        prevBtnText: '上一步',
        nextBtnText: '下一步',
        onNextClick: () => {
          moveNextUntil('#data_load_btn');
        },
        onCloseClick: () => {
          driverObj.destroy();
        },
        onPopoverRender: (popover) => {
          const info = document.getElementById('tour_info_text')?.cloneNode(true);
          if (info && info instanceof HTMLElement) {
            info.id = '';
            info.style.display = 'block';
            popover.description.appendChild(info);
          }
        },
      },
      onHighlightStarted: () => {
        router.push({ name: 'data' });
      },
    },
    {
      element: '#data_load_btn',
      popover: {
        title: '加载按钮',
        description: '加载在线题库、本地题库、JSON 文件',
        side: 'bottom',
        prevBtnText: '上一步',
        nextBtnText: '下一步',
        onCloseClick: () => {
          driverObj.destroy();
        },
      },
    },
    {
      element: '#data_save_btn',
      popover: {
        title: '保存按钮',
        description: '将当前 题库/进度 保存到浏览器存储或 JSON 文件',
        side: 'bottom',
        prevBtnText: '上一步',
        nextBtnText: '下一步',
        onCloseClick: () => {
          driverObj.destroy();
        },
      },
    },
    {
      element: '#data_action_btn',
      popover: {
        title: '操作按钮',
        description: '包含题目去重、打乱等实用功能',
        side: 'bottom',
        prevBtnText: '上一步',
        nextBtnText: '下一步',
        onCloseClick: () => {
          driverObj.destroy();
        },
      },
    },
    {
      element: '#nav_import',
      popover: {
        title: '导入题库',
        description: '在导入页面，可以解析文本导入题目',
        side: 'bottom',
        prevBtnText: '上一步',
        nextBtnText: '下一步',
        onPrevClick: () => {
          router.push({ name: 'data' });
          movePrevUntil('#data_action_btn');
        },
        onNextClick: () => {
          moveNextUntil('#import_input_group');
        },
        onCloseClick: () => {
          driverObj.destroy();
        },
      },
      onHighlightStarted: () => {
        router.push({ name: 'import' });
      },
    },
    {
      element: '#import_input_group',
      popover: {
        title: '粘贴题目',
        description: '在这里粘贴题目文本，可以自定义过滤规则、设置题库名以方便保存',
        side: 'bottom',
        prevBtnText: '上一步',
        doneBtnText: '完成',
      },
    },
  ],
  onDestroyStarted: () => {
    if (driverObj.hasNextStep()) driverObj.moveNext();
    else driverObj.destroy();
  },
  onDestroyed: () => {
    router.push({ name: 'do' });
    openTour.value = false;
  },
});
watch(openTour, (val) => {
  if (val) {
    driverObj.drive();
  }
});

/** Functions **/
const movePrevUntil = (waitFor: string) => {
  waitForElem(waitFor).then(() => {
    driverObj.movePrevious();
  });
};
const moveNextUntil = (waitFor: string) => {
  waitForElem(waitFor).then(() => {
    driverObj.moveNext();
  });
};

function waitForElem(selector: string) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    // If you get "parameter 1 is not of type 'Node'" error,
    // see https://stackoverflow.com/a/77855838/492336
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
</script>

<template>
  <div id="tour_info_text" style="display: none">
    <el-text type="primary">(点击屏幕任意位置 继续教程)</el-text>
  </div>
</template>

<style scoped></style>
