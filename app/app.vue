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
      @click="toggleMobileMenu"
    >
      <Icon size="24" aria-hidden="true">
        <component :is="store.mobileOpenState ? CloseSmall : HamburgerButton" />
      </Icon>
    </button>
    <div v-show="!store.backgroundShow" ref="content" class="container">
      <section class="all">
        <Transition name="panel">
          <MainLeft v-show="!showBox || !compact" class="intro" />
        </Transition>
        <Transition :name="rightPanelTransition" @after-leave="finishDesktopExit">
          <MainRight
            v-show="compact ? !showBox : desktopPanel === 'sites'"
            class="sites"
            :class="{ 'sites-revisited': BoxComponent }"
            :inert="showBox"
          />
        </Transition>
        <Transition :name="rightPanelTransition" @after-leave="finishDesktopExit">
          <section
            v-if="compact ? showBox : desktopPanel === 'capsule'"
            :inert="!showBox"
            ref="boxPanel"
            class="box-panel"
            aria-label="时光胶囊"
            @keydown.esc.stop="closeBox"
          >
            <BoxComponent @close="closeBox" />
          </section>
        </Transition>
      </section>
    </div>
    <!-- 页脚 -->
    <Transition name="fade" mode="out-in">
      <Footer v-show="!store.backgroundShow" />
    </Transition>
    <dialog
      ref="settingsDialog"
      class="settings-dialog"
      aria-labelledby="settings-title"
      @cancel.prevent="store.setOpenState = false"
      @click.self="store.setOpenState = false"
    >
      <Suspense v-if="setLoaded" @resolve="setReady = true">
        <LazyMoreSet />
      </Suspense>
    </dialog>
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
const BoxComponent = shallowRef<typeof import("~/components/Box.vue").default>();
const showBox = computed(() => store.boxOpenState && !!BoxComponent.value);
const compact = computed(() => (store.innerWidth ?? 0) <= 720);
// Keep the site widgets mounted (including audio) while the outgoing desktop view leaves.
type DesktopPanel = "sites" | "capsule";
const requestedPanel = computed<DesktopPanel>(() => showBox.value ? "capsule" : "sites");
const desktopPanel = ref<DesktopPanel | null>("sites");
const rightPanelTransition = computed(() => compact.value ? "panel" : "desktop-panel");
watch([requestedPanel, compact], ([target, narrow], [, wasNarrow]) => {
  if (narrow || wasNarrow) desktopPanel.value = target;
  else if (desktopPanel.value !== target) desktopPanel.value = null;
});
const finishDesktopExit = () => {
  if (desktopPanel.value === null) desktopPanel.value = requestedPanel.value;
};

const boxPanel = ref<HTMLElement | null>(null);
watch(boxPanel, (panel) => {
  panel?.querySelector<HTMLButtonElement>(".setting")?.focus({ preventScroll: true });
}, { flush: "post" });
const closeBox = async () => {
  store.boxOpenState = false;
  await nextTick();
  main.value?.querySelector<HTMLButtonElement>(".description")?.focus({ preventScroll: true });
};
const toggleMobileMenu = () => {
  store.boxOpenState = false;
  store.mobileOpenState = !store.mobileOpenState;
};
watch(
  () => store.boxOpenState,
  async (open) => {
    if (open && !BoxComponent.value)
      BoxComponent.value = (await import("~/components/Box.vue")).default;
  },
);
const setLoaded = ref(false);
const setReady = ref(false);
const settingsDialog = ref<HTMLDialogElement | null>(null);
watch(
  [() => store.setOpenState, setReady],
  ([open, ready]) => {
    if (open) setLoaded.value = true;
    const dialog = settingsDialog.value;
    if (!dialog) return;
    if (open && ready && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  },
  { flush: "post" },
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
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 1.25rem;
      align-items: center;
      .intro,
      .sites,
      .box-panel {
        grid-row: 1;
        width: 100%;
        margin-inline: 0;
      }
      .intro {
        grid-column: 1;
      }
      .sites,
      .box-panel {
        grid-column: 2;
      }
      .box-panel {
        max-height: 80dvh;
        overflow: auto;
        border-radius: 6px;
      }
      @media (width > 720px) {
        // On return, the widgets move together instead of replaying their initial stagger.
        .sites-revisited :deep(:is(.cards, .line)),
        .box-panel :deep(:is(.box, .box > .content)) {
          animation: none;
        }
        .desktop-panel-enter-active,
        .desktop-panel-leave-active {
          --handoff-duration: var(--panel-enter);
          transition: translate var(--handoff-duration) var(--panel-curve);

          :deep(:is(.cards, .line, .box, #music-controls)) {
            transition: opacity var(--handoff-duration) var(--panel-curve);
          }
        }
        .desktop-panel-leave-active {
          --handoff-duration: 220ms;
          pointer-events: none;
        }
        .desktop-panel-enter-from { translate: 0 14px; }
        .desktop-panel-leave-to { translate: 0 -6px; }
        :is(.desktop-panel-enter-from, .desktop-panel-leave-to) {
          :deep(:is(.cards, .line, .box, #music-controls)) { opacity: 0; }
        }
      }
      .panel-enter-active, .panel-leave-active {
        transition: translate var(--panel-enter) var(--panel-curve);
      }
      .panel-leave-active {
        transition-duration: var(--panel-leave);
        pointer-events: none;
        // Fade the outgoing surfaces independently so the parent still samples the wallpaper.
        :deep(.cards), :deep(.box), :deep(.message .logo), :deep(.social), :deep(.line), :deep(.right > .logo) {
          opacity: 0;
          transition: opacity var(--panel-leave) ease;
        }
      }
      .panel-enter-from, .panel-leave-to { translate: 0 16px; }
    }
    @media (max-width: 1200px) {
      padding: 0 2vw;
    }
  }
  .settings-dialog {
    margin: auto;
    width: min(80vw, 72rem);
    height: fit-content;
    max-width: none;
    max-height: calc(100dvh - 1.5rem - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    overflow: auto;
    overscroll-behavior: contain;
    border: 0;
    border-radius: 8px;
    background: rgb(255 255 255 / 40%);
    color: #fff;
    --dialog-duration: var(--panel-leave);
    opacity: 0;
    translate: 0 16px;
    transition:
      opacity var(--dialog-duration) ease,
      translate var(--dialog-duration) var(--panel-curve),
      display var(--dialog-duration) allow-discrete,
      overlay var(--dialog-duration) allow-discrete;
    &[open] {
      --dialog-duration: var(--panel-enter);
      opacity: 1;
      translate: 0;
      @starting-style {
        opacity: 0;
        translate: 0 16px;
      }
    }
    &::backdrop {
      --dialog-duration: var(--panel-leave);
      background: rgb(0 0 0 / 50%);
      backdrop-filter: blur(20px);
      opacity: 0;
      transition:
        opacity var(--dialog-duration) ease,
        display var(--dialog-duration) allow-discrete,
        overlay var(--dialog-duration) allow-discrete;
    }
    &[open]::backdrop {
      --dialog-duration: var(--panel-enter);
      opacity: 1;
      @starting-style {
        opacity: 0;
      }
    }
    @media (max-width: 720px) {
      width: calc(100% - 1.5rem - env(safe-area-inset-left) - env(safe-area-inset-right));
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
    animation: rise .7s var(--ease-out) .24s backwards;
    transition: translate .25s var(--ease-out), background-color .16s ease;
    &:active {
      translate: 0 2px;
      background-color: #ffffff30;
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
    .container {
      grid-area: content;
      overflow-y: auto;
      scrollbar-gutter: stable both-edges;
      height: auto;
      .all {
        height: auto;
        min-height: 100%;
        grid-template-columns: minmax(0, 1fr);
        .intro,
        .sites,
        .box-panel {
          grid-column: 1;
        }
        .box-panel {
          max-height: none;
          overflow: visible;
        }
        padding: clamp(0.75rem, 3dvh, 2rem) 0.75rem;
        padding-top: max(clamp(0.75rem, 3dvh, 2rem), env(safe-area-inset-top));
        padding-left: max(0.75rem, env(safe-area-inset-left));
        padding-right: max(0.75rem, env(safe-area-inset-right));
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
      .sites {
        grid-row: 2;
      }
    }
    .menu {
      display: none;
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
    :deep(#footer) {
      position: static;
    }
  }
}
</style>
