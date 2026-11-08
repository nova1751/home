<template>
  <!-- 壁纸 -->
  <Background @load-complete="loadComplete" />
  <!-- 主界面（预渲染为静态 HTML，打开即显示） -->
  <main id="main">
    <div v-show="!store.backgroundShow" class="container">
      <section v-show="!store.setOpenState" class="all">
        <MainLeft />
        <MainRight v-show="!store.boxOpenState" />
        <LazyBox v-if="boxLoaded" v-show="store.boxOpenState" />
      </section>
      <section
        v-if="setLoaded"
        v-show="store.setOpenState"
        class="more"
        @click="store.setOpenState = false"
      >
        <LazyMoreSet />
      </section>
    </div>
    <!-- 移动端菜单按钮 -->
    <Icon
      v-show="!store.backgroundShow"
      class="menu"
      size="24"
      @click="store.mobileOpenState = !store.mobileOpenState"
    >
      <component :is="store.mobileOpenState ? CloseSmall : HamburgerButton" />
    </Icon>
    <!-- 页脚 -->
    <Transition name="fade" mode="out-in">
      <Footer v-show="!store.backgroundShow && !store.setOpenState" />
    </Transition>
  </main>
</template>

<script setup lang="ts">
import { throttle } from "lodash-es";
import { HamburgerButton, CloseSmall } from "@icon-park/vue-next";
import { helloInit, checkDays } from "~/utils/getTime";

const store = useMainStore();

// 盒子 / 设置页首次打开时才加载
const boxLoaded = ref(false);
const setLoaded = ref(false);
watch(
  () => store.boxOpenState,
  (value) => value && (boxLoaded.value = true),
);
watch(
  () => store.setOpenState,
  (value) => value && (setLoaded.value = true),
);

// 加载完成事件
const loadComplete = () => {
  nextTick(() => {
    // 欢迎提示
    helloInit();
    // 默哀模式
    checkDays();
  });
};

// 页面宽度
const getWidth = throttle(() => store.setInnerWidth(window.innerWidth), 200);

onMounted(() => {
  getWidth();
  window.addEventListener("resize", getWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", getWidth);
});
</script>

<style lang="scss" scoped>
#main {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // 纯 CSS 短入场，不等 JS。不要用 forwards：opacity 动画效果若保留，
  // #main 会成为 backdrop root，内部毛玻璃将无法模糊 #main 之外的壁纸
  animation:
    fade 0.3s ease-out,
    main-in 0.3s ease-out;
  .container {
    width: 100%;
    height: 100vh;
    margin: 0 auto;
    .all {
      width: 100%;
      height: 100%;
      padding: 0 0.75rem;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
    .more {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #00000080;
      backdrop-filter: blur(20px);
      z-index: 2;
      animation: fade 0.5s;
    }
    @media (max-width: 1200px) {
      padding: 0 2vw;
    }
  }
  .menu {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 84%;
    left: calc(50% - 28px);
    width: 56px;
    height: 34px;
    background: rgb(0 0 0 / 20%);
    backdrop-filter: blur(10px);
    border-radius: 6px;
    transition: transform 0.3s;
    animation: fade 0.5s;
    &:active {
      transform: scale(0.95);
    }
    .i-icon {
      transform: translateY(2px);
    }
    @media (min-width: 721px) {
      display: none;
    }
  }
}
</style>
