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

export function tip(key: string) {
  if (!tips.has(key)) return;
  startDriver(key);
}

export function tipOnce(key: string) {
  if (!tips.has(key)) return;
  const t = useTipsStore();
  if (t.isTipped(key)) return;
  t.setTip(key);
  startDriver(key);
}

function startDriver(key: string): Driver {
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

  waitForElem(steps[0].element as string).then(() => {
    driverObj.drive();
  });
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
