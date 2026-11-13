<template>
  <div id="site-panel" :class="store.mobileOpenState ? 'right' : 'right hidden'">
    <!-- 移动端 Logo -->
    <button
      type="button"
      class="logo text-hidden"
      aria-label="显示一言和音乐"
      :aria-pressed="store.mobileFuncState"
      @click="store.mobileFuncState = !store.mobileFuncState"
    >
      <span class="bg">{{ domainName }}</span>
      <span class="sm">.{{ domainSuffix }}</span>
    </button>
    <!-- 功能区 -->
    <Func class="widgets" />
    <!-- 网站链接 -->
    <Links />
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
    display: none;
    width: 100%;
    font-family: "Pacifico-Regular";
    font-size: clamp(2.25rem, 7vw, 3rem);
    line-height: 1.4;
    padding-bottom: 0.2em;
    margin-bottom: clamp(0.5rem, 2dvh, 1rem);
    border: 0;
    background: transparent;
    text-align: center;
    transition: transform 0.3s;
    animation: fade 0.5s;
    &:active {
      transform: scale(0.95);
    }
  }
  @media (max-width: 720px) {
    margin-left: 0;
    width: 100%;
    .logo {
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
    .logo,
    .widgets {
      display: none;
    }
  }
}
</style>
