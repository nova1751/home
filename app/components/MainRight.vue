<template>
  <div :class="store.mobileOpenState ? 'right' : 'right hidden'">
    <!-- 移动端 Logo -->
    <div class="logo text-hidden" @click="store.mobileFuncState = !store.mobileFuncState">
      <span class="bg">{{ domainName }}</span>
      <span class="sm">.{{ domainSuffix }}</span>
    </div>
    <!-- 功能区 -->
    <Func />
    <!-- 网站链接 -->
    <LazyLinks hydrate-on-idle />
  </div>
</template>

<script setup lang="ts">
const store = useMainStore();
const { domainName, domainSuffix } = useSite();
</script>

<style lang="scss" scoped>
.right {
  // flex: 1 0 0%;
  width: 50%;
  // Swiper 初始化后右栏不能再收缩；预渲染时就保持一致，避免 JS 激活时布局横移
  flex-shrink: 0;
  margin-left: 0.75rem;
  .logo {
    width: 100%;
    font-family: "Pacifico-Regular";
    font-size: 1.75rem;
    position: fixed;
    top: 6%;
    left: 0;
    text-align: center;
    transition: transform 0.3s;
    animation: fade 0.5s;
    &:active {
      transform: scale(0.95);
    }
    @media (min-width: 720px) {
      display: none;
    }
  }
  @media (max-width: 720px) {
    margin-left: 0;
    width: 100%;
    &.hidden {
      display: none;
    }
  }
}
</style>
