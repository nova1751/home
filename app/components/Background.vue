<template>
  <div :class="['cover', { show: store.backgroundShow, revealed: bgRevealed }]">
    <img
      v-if="bgUrl"
      :key="bgUrl"
      :src="bgUrl"
      class="bg"
      alt="cover"
      fetchpriority="high"
      @animationend="imgAnimationEnd"
    />
    <div :class="store.backgroundShow ? 'gray hidden' : 'gray'" />
    <Transition name="fade" mode="out-in">
      <a
        v-if="store.backgroundShow && bgUrl && store.coverType !== '3'"
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
import { Error as ErrorIcon } from "@icon-park/vue-next";

const store = useMainStore();
const bgUrl = ref<string | null>(null);
const bgRevealed = ref(false); // 淡入已完成
const emit = defineEmits(["loadComplete"]);

// 默认壁纸数量（在 nuxt.config.ts 中配置）
const BG_COUNT = useRuntimeConfig().public.bgCount;
// 壁纸加载超时后先弹出欢迎提示，壁纸加载完成后再淡入
const BG_TIMEOUT = 2000;

let defaultBg = "";
let loadTimer: ReturnType<typeof setTimeout> | undefined;
let welcomed = false;
let requestId = 0;
let animeRequest: AbortController | undefined;

const releaseBg = (url: string | null) => {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
};

const fetchAnime = async (controller: AbortController) => {
  const type = window.matchMedia("(orientation: portrait)").matches ? "mb" : "pc";
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(
      `https://rimg.zhuqiy.top/api/random?type=${type}&t=${Date.now()}`,
      {
        signal: controller.signal,
        cache: "no-store",
        credentials: "omit",
      },
    );
    if (!response.ok) throw new Error("Wallpaper request failed");
    return URL.createObjectURL(await response.blob());
  } finally {
    clearTimeout(timeout);
  }
};

const wallpaperUrl = (index: number) => `/images/background${index}.webp`;

const scenery = Array.from({ length: BG_COUNT }, (_, index) => index + 1).filter(
  (index) => index !== 11 && index !== 12,
);

const selectBg = (type: string) => {
  if (type === "1") return wallpaperUrl((Math.floor(Date.now() / 86_400_000) % BG_COUNT) + 1);
  const collection = type === "2" ? scenery : [];
  const alternatives = collection.filter((index) => wallpaperUrl(index) !== bgUrl.value);
  const choices = alternatives.length ? alternatives : collection;
  return choices.length
    ? wallpaperUrl(choices[Math.floor(Math.random() * choices.length)])
    : defaultBg;
};

const decodeBg = async (url: string) => {
  const image = new Image();
  image.src = url;
  await image.decode();
};

// Keep the current image visible until the next one is ready.
const changeBg = async (type: string) => {
  const id = ++requestId;
  animeRequest?.abort();
  let url = "";
  try {
    if (type === "3") {
      animeRequest = new AbortController();
      url = await fetchAnime(animeRequest);
    } else {
      url = selectBg(type);
    }
    await decodeBg(url);
    if (id !== requestId) {
      releaseBg(url);
      return;
    }
    const previous = bgUrl.value;
    bgUrl.value = url;
    nextTick(() => releaseBg(previous));
    store.setImgLoadStatus(true);
  } catch {
    releaseBg(url);
    if (id !== requestId) return;
    if (!bgUrl.value && url !== defaultBg) {
      await changeBg("0");
      return;
    }
    store.setImgLoadStatus(true);
    welcome();
    ElMessage({
      message: "壁纸加载失败",
      icon: h(ErrorIcon, { theme: "filled", fill: "#efefef" }),
    });
  }
};

// 触发加载完成事件（欢迎提示等），只触发一次
const welcome = () => {
  if (welcomed) return;
  welcomed = true;
  emit("loadComplete");
};

// 图片动画完成
const imgAnimationEnd = () => {
  clearTimeout(loadTimer);
  bgRevealed.value = true;
  welcome();
};

// 监听壁纸切换
watch([() => store.coverType, () => store.wallpaperRefresh], ([type]) => changeBg(type));

onMounted(() => {
  // 优先使用 <head> 内联脚本已开始预加载的壁纸
  defaultBg =
    (window as { __BG__?: string }).__BG__ ||
    `/images/background${Math.floor(Math.random() * BG_COUNT) + 1}.webp`;
  void changeBg(store.coverType);
  loadTimer = setTimeout(() => {
    store.setImgLoadStatus(true);
    welcome();
  }, BG_TIMEOUT);
});

onBeforeUnmount(() => {
  requestId++;
  animeRequest?.abort();
  releaseBg(bgUrl.value);
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
  &.revealed {
    &::before {
      display: none;
    }
    .bg {
      animation: none;
    }
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
