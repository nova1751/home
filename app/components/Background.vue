<template>
  <div :class="['cover', { show: store.backgroundShow, revealed: bgRevealed }]">
    <img
      v-if="bgUrl"
      v-show="bgLoaded"
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
const bgLoaded = ref(false); // 壁纸图片已加载，开始淡入
const bgRevealed = ref(false); // 淡入已完成
const emit = defineEmits(["loadComplete"]);

// 默认壁纸数量（在 nuxt.config.ts 中配置）
const BG_COUNT = useRuntimeConfig().public.bgCount;
// 壁纸加载超时后先弹出欢迎提示，壁纸加载完成后再淡入
const BG_TIMEOUT = 2000;

let defaultBg = "";
let loadTimer: ReturnType<typeof setTimeout> | undefined;
let welcomed = false;

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
  bgLoaded.value = true;
  store.setImgLoadStatus(true);
};

// 触发加载完成事件（欢迎提示等），只触发一次
const welcome = () => {
  if (welcomed) return;
  welcomed = true;
  emit("loadComplete");
};

// 图片动画完成
const imgAnimationEnd = () => {
  bgRevealed.value = true;
  welcome();
};

// 图片显示失败
const imgLoadError = () => {
  console.error("壁纸加载失败：", bgUrl.value);
  if (bgUrl.value === defaultBg) {
    clearTimeout(loadTimer);
    store.setImgLoadStatus(true);
    welcome();
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
      console.warn("壁纸加载超时");
      store.setImgLoadStatus(true);
      welcome();
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
  z-index: -1;
  overflow: hidden;

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
    // 从模糊占位图融入清晰壁纸，同时轻微回位；不逐帧计算模糊
    animation: wallpaper-in 1s var(--ease-out) both;
  }
  // 模糊占位图：缩略图由 <head> 内联脚本写入 --bg-thumb，首帧即可显示，壁纸淡入后移除
  &::before {
    content: "";
    position: absolute;
    // 向外扩出屏幕，遮住模糊后变透明的边缘（用定值，窄屏上比例放大不够）
    inset: -100px;
    background: var(--bg-thumb, none) center / cover no-repeat;
    // 竖屏上缩略图每像素约被拉到 50px，模糊要足够大，否则看得出方形色块
    filter: blur(40px);
  }
  &.revealed::before {
    display: none;
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

    transition: opacity 1.5s;
    &.hidden {
      opacity: 0;
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
    transition:
      transform 0.3s,
      background-color 0.3s;
    &:hover {
      transform: scale(1.05);
      background-color: #00000060;
    }
    &:active {
      transform: scale(1);
    }
  }
}

@keyframes wallpaper-in {
  from {
    opacity: 0;
    transform: scale(1.04);
  }
}
</style>
