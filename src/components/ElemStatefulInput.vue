<script setup lang="ts">
const props = defineProps<{
  value?: string;
  placeholder: string;
}>();
const userInput = ref(props.value || '');
watch(
  () => props.value,
  (value) => {
    userInput.value = value || '';
  }
);
</script>

<template>
  <el-input
    v-model="userInput"
    :placeholder="props.placeholder"
    @input="$emit('input', $event)"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
    @change="$emit('change', $event)"
    @clear="$emit('clear', $event)"
  />
</template>

<style scoped></style>
