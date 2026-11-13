<template>
  <!-- 壁纸 -->
  <Background @load-complete="loadComplete" />
  <!-- 主界面（预渲染为静态 HTML，打开即显示） -->
  <main id="main" ref="main" @keydown.esc="closeMobileMenu">
    <!-- Place the disclosure before its panel so Tab reaches the revealed links. -->
    <button
      v-show="!store.backgroundShow"
      ref="mobileMenu"
      class="menu"
      type="button"
      aria-controls="site-panel"
      :aria-expanded="store.mobileOpenState"
      :aria-label="store.mobileOpenState ? '关闭站点菜单' : '打开站点菜单'"
      @click="store.mobileOpenState = !store.mobileOpenState"
    >
      <Icon size="24" aria-hidden="true">
        <component :is="store.mobileOpenState ? CloseSmall : HamburgerButton" />
      </Icon>
    </button>
    <div v-show="!store.backgroundShow" ref="content" class="container">
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
const main = ref<HTMLElement | null>(null);
const mobileMenu = ref<HTMLButtonElement | null>(null);
const content = ref<HTMLDivElement | null>(null);
const closeMobileMenu = () => {
  if (!store.mobileOpenState || store.musicListShow || store.setOpenState) return;
  store.mobileOpenState = false;
  mobileMenu.value?.focus();
};
watch(
  () => store.mobileOpenState,
  () => {
    content.value?.scrollTo(0, 0);
    main.value?.scrollTo(0, 0);
  },
  { flush: "post" },
);

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
    display: none;
    justify-content: center;
    align-items: center;
    width: 56px;
    height: 36px;
    border: 0;
    background: rgb(0 0 0 / 20%);
    backdrop-filter: blur(10px);
    border-radius: 6px;
    transition: transform 0.3s;
    animation: rise 0.7s var(--ease-out) 0.24s backwards;
    &:active {
      transform: scale(0.95);
    }
    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 3px;
    }
  }

  @media (max-width: 720px) {
    height: 100dvh;
    display: grid;
    grid-template:
      "content" minmax(0, 1fr)
      "menu" auto
      "footer" auto / minmax(0, 1fr);
    overflow: auto;
    scrollbar-gutter: stable both-edges;
    .container {
      grid-area: content;
      overflow-y: auto;
      scrollbar-gutter: stable both-edges;
      height: auto;
      .all {
        height: auto;
        min-height: 100%;
        flex-direction: column;
        padding: clamp(0.75rem, 3dvh, 2rem) 0.75rem;
      }
    }
    .menu {
      grid-area: menu;
      margin: 4px auto 8px;
      display: flex;
    }
    :deep(#footer) {
      grid-area: footer;
      position: static;
      height: auto;
      line-height: 36px;
      padding-bottom: env(safe-area-inset-bottom);
    }
  }

  @media (max-width: 720px) and (scripting: none) {
    .container .all {
      gap: 1rem;
    }
    .menu {
      display: none;
    }
  }

  @media (max-width: 720px) and (max-height: 540px) {
    grid-template-rows: minmax(max-content, 1fr) auto auto;
    .container {
      overflow: visible;
      .all {
        min-height: 14rem;
      }
    }
  }

  @media (width > 720px) and (max-height: 560px) {
    height: 100dvh;
    overflow-y: auto;
    .container {
      height: auto;
      .all {
        height: auto;
        min-height: calc(100dvh - 46px);
        padding-block: 1rem;
      }
    }
    :deep(.box) {
      height: 80dvh;
    }
    :deep(#footer) {
      position: static;
    }
  }
}
</style>
