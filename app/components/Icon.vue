<template>
  <span class="xicon" :style="{ color, fontSize }">
    <slot />
  </span>
</template>

<script setup lang="ts">
// 替代 @vicons/utils 的 Icon（原实现依赖运行时注入样式，无法预渲染）
const props = defineProps<{ size?: number | string; color?: string }>();

const fontSize = computed(() => {
  const { size } = props;
  if (size === undefined) return undefined;
  return typeof size === "number" || /^\d+$/.test(size) ? `${size}px` : size;
});
</script>
