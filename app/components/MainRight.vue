<template>
  <div id="site-panel" :class="store.mobileOpenState ? 'right' : 'right hidden'">
    <h1 class="site-title">{{ domain }}</h1>
    <!-- 功能区 -->
    <Func class="widgets" />
    <!-- 网站链接 -->
    <Links />
  </div>
</template>

<script setup lang="ts">
const store = useMainStore();
const { domainName, domainSuffix } = useSite();
const domain = [domainName, domainSuffix].filter(Boolean).join(".");
</script>

<style lang="scss" scoped>
.right {
  // flex: 1 0 0%;
  width: 50%;
  // Swiper 初始化后右栏不能再收缩；预渲染时就保持一致，避免 JS 激活时布局横移
  flex-shrink: 0;
  margin-left: 0.75rem;
  .site-title {
    display: none;
    width: 100%;
    font-family: "Pacifico-Regular";
    font-size: clamp(2.8rem, 12vw, 4.25rem);
    font-weight: 400;
    line-height: 1.4;
    padding-bottom: 0.2em;
    margin: 0 0 clamp(0.5rem, 2dvh, 1rem);
    text-align: center;
    overflow-wrap: anywhere;
  }
  @media (max-width: 720px) {
    margin-left: 0;
    width: 100%;
    .site-title {
      display: block;
    }
    &.hidden {
      display: none;
    }
  }
  @media (max-width: 720px) and (scripting: none) {
    &.hidden {
      display: block;
    }
    .site-title,
    .widgets {
      display: none;
    }
  }
}
</style>
