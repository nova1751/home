<template>
  <div :class="store.backgroundShow ? 'cover show' : 'cover'">
    <img
      v-if="bgUrl"
      v-show="store.imgLoadStatus"
      :src="bgUrl"
      class="bg"
      alt="cover"
      fetchpriority="high"
      @load="imgLoadComplete"
      @error="imgLoadError"
      @animationend="imgAnimationEnd"
    />
    <div :class="store.backgroundShow ? 'gray hidden' : 'gray'" />
    <Transition name="fade" mode="out-in">
      <a
        v-if="store.backgroundShow && store.coverType != '3'"
        class="down"
        :href="bgUrl ?? undefined"
        target="_blank"
      >
        下载壁纸
      </a>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { Error } from "@icon-park/vue-next";

const store = useMainStore();
const bgUrl = ref<string | null>(null);
const emit = defineEmits(["loadComplete"]);

// 默认壁纸数量（在 nuxt.config.ts 中配置）
const BG_COUNT = useRuntimeConfig().public.bgCount;
// 壁纸加载超时后先展示页面，壁纸加载完成后再淡入
const BG_TIMEOUT = 2000;

let defaultBg = "";
let loadTimer: ReturnType<typeof setTimeout> | undefined;
let completed = false;

// 更换壁纸链接
const changeBg = (type: string) => {
  const urls: Record<string, string> = {
    "0": defaultBg,
    "1": "https://api.dujin.org/bing/1920.php",
    "2": "https://api.aixiaowai.cn/gqapi/gqapi.php",
    "3": "https://api.aixiaowai.cn/api/api.php",
  };
  bgUrl.value = urls[type] ?? defaultBg;
};

// 图片加载完成
const imgLoadComplete = () => {
  clearTimeout(loadTimer);
  store.setImgLoadStatus(true);
};

// 图片动画完成
const imgAnimationEnd = () => {
  if (completed) return;
  completed = true;
  emit("loadComplete");
};

// 图片显示失败
const imgLoadError = () => {
  console.error("壁纸加载失败：", bgUrl.value);
  if (bgUrl.value === defaultBg) {
    imgLoadComplete();
    return;
  }
  ElMessage({
    message: "壁纸加载失败，已临时切换回默认",
    icon: h(Error, { theme: "filled", fill: "#efefef" }),
  });
  bgUrl.value = defaultBg;
};

// 监听壁纸切换
watch(() => store.coverType, changeBg);

onMounted(() => {
  // 优先使用 <head> 内联脚本已开始预加载的壁纸
  defaultBg =
    (window as { __BG__?: string }).__BG__ ||
    `/images/background${Math.floor(Math.random() * BG_COUNT) + 1}.webp`;
  changeBg(store.coverType);
  loadTimer = setTimeout(() => {
    if (!store.imgLoadStatus) {
      console.warn("壁纸加载超时，先行展示页面");
      store.setImgLoadStatus(true);
      imgAnimationEnd();
    }
  }, BG_TIMEOUT);
});

onBeforeUnmount(() => {
  clearTimeout(loadTimer);
});
</script>

<style lang="scss" scoped>
.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: 0.25s;
  z-index: -1;

  &.show {
    z-index: 1;
  }

  .bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    backface-visibility: hidden;
    filter: blur(20px) brightness(0.3);
    transition:
      filter 0.3s,
      transform 0.3s;
    animation: fade-blur-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    animation-delay: 0.2s;
  }
  .gray {
    opacity: 1;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0.5) 100%),
      radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0.3) 166%);

    transition: 1.5s;
    &.hidden {
      opacity: 0;
      transition: 1.5s;
    }
  }
  .down {
    font-size: 16px;
    color: white;
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    margin: 0 auto;
    display: block;
    padding: 20px 26px;
    border-radius: 8px;
    background-color: #00000030;
    width: 120px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      transform: scale(1.05);
      background-color: #00000060;
    }
    &:active {
      transform: scale(1);
    }
  }
}
</style>
