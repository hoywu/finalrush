<script setup lang="ts">
const visible = defineModel<boolean>('visible');

const popoverBody = ref<HTMLElement>();

watch(visible, (value) => {
  // 添加分割线
  if (!value || !popoverBody.value) return;
  const elems = [] as Array<HTMLElement>;
  popoverBody.value.childNodes.forEach((node) => {
    if (node instanceof HTMLElement) elems.push(node);
  });

  for (let i = 0; i < elems.length - 1; i++) {
    if (elems[i + 1].classList.contains('_divider')) {
      i += 1;
      continue;
    }
    const divider = document.createElement('div');
    divider.classList.add('_divider');
    elems[i].after(divider);
  }
});
</script>

<template>
  <el-popover
    v-model:visible="visible"
    :hide-after="0"
    :teleported="false"
    placement="bottom"
    transition="none"
    trigger="click"
    popper-style="padding: 5px 0 5px 0 !important;"
  >
    <template #reference>
      <slot name="reference"></slot>
    </template>

    <div id="popover-body" ref="popoverBody" @click="visible = false">
      <slot></slot>
    </div>
  </el-popover>
</template>

<style scoped>
#popover-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#popover-body > :slotted(*) {
  width: 100%;
}
</style>
