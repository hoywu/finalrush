<script setup lang="ts">
const props = defineProps<{
  placeholder: string;
}>();
const userInput = ref('');
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
