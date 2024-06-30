import { useTipsStore } from '@/stores/tips';
import { driver, type DriveStep, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const tips: Map<string, DriveStep[]> = new Map();
tips.set('do_scrollSeg_1', [
  {
    element: '.do-scrollSeg',
    popover: {
      title: '🎉导航条新特性',
      description: '现支持🖱️鼠标滚轮、滑动滚动，点击跳转到对应题目',
      side: 'bottom',
      showButtons: ['close'],
      doneBtnText: '我知道了',
    },
  },
]);
tips.set('hotkeys_1', [
  {
    element: '#nav_setting',
    popover: {
      title: '🎉增强的键盘快捷键',
      description: `[键盘快捷键逻辑优化]
1. 下一题快捷键不再自动提交，新增提交快捷键
2. 新增4个选项快捷键，支持选项更多的题目
3. 新增查看答案、聚焦输入框快捷键`,
      side: 'bottom',
      align: 'start',
      showButtons: ['close'],
      doneBtnText: '我知道了',
      onPopoverRender: (popover) => {
        popover.wrapper.style.maxWidth = 'unset';
        popover.description.style.whiteSpace = 'pre-line';
      },
    },
  },
]);

export function tip(key: string) {
  if (!tips.has(key)) return;
  startDriver(key);
}

export function tipOnce(key: string) {
  if (!tips.has(key)) return;
  const t = useTipsStore();
  if (t.isTipped(key)) return;
  startDriver(key, () => {
    t.setTip(key);
  });
}

function startDriver(key: string, after: Function = () => {}): Driver {
  const driverObj = driver({
    smoothScroll: true,
    overlayOpacity: 0.3,
    disableActiveInteraction: true,
    steps: [],
    onDestroyStarted: () => {
      if (driverObj.hasNextStep()) driverObj.moveNext();
      else driverObj.destroy();
    },
  });

  const steps = tips.get(key);
  if (!steps) return driverObj;
  steps.forEach((step) => {
    if (!step.popover) return;
    step.popover.onCloseClick = () => {
      driverObj.destroy();
    };
  });
  driverObj.setSteps(steps);

  if (steps[0].element) {
    waitForElem(steps[0].element as string).then(() => {
      driverObj.drive();
      after();
    });
  } else {
    driverObj.drive();
    after();
  }
  return driverObj;
}

export const movePrevUntil = (waitFor: string, driver: Driver) => {
  waitForElem(waitFor).then(() => {
    driver.movePrevious();
  });
};
export const moveNextUntil = (waitFor: string, driver: Driver) => {
  waitForElem(waitFor).then(() => {
    driver.moveNext();
  });
};

export function waitForElem(selector: string) {
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
