<template>
  <div
    v-show="!store.musicOpenState"
    class="hitokoto cards"
    @mouseenter="openMusicShow = true"
    @mouseleave="openMusicShow = false"
    @click.stop
  >
    <!-- 打开音乐面板 -->
    <Transition name="el-fade-in-linear">
      <div
        v-show="openMusicShow && store.musicIsOk"
        class="open-music"
        @click="store.musicOpenState = true"
      >
        <music-menu theme="filled" size="18" fill="#efefef" />
        <span>打开音乐播放器</span>
      </div>
    </Transition>
    <!-- 一言内容 -->
    <Transition name="el-fade-in-linear" mode="out-in">
      <div :key="hitokotoData.text" class="content" @click="updateHitokoto">
        <span class="text">{{ hitokotoData.text }}</span>
        <span class="from">-「&nbsp;{{ hitokotoData.from }}&nbsp;」</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { debounce } from "lodash-es";
import { MusicMenu, Error } from "@icon-park/vue-next";
import { getHitokoto } from "~/utils/api";

const store = useMainStore();

// 开启音乐面板按钮显隐
const openMusicShow = ref(false);

// 一言数据
const CACHE_KEY = "hitokoto";
const hitokotoData = reactive({
  text: "每一个不曾起舞的日子，都是对生活的辜负！",
  from: "尼采",
});

// 获取一言数据
const getHitokotoData = async (manual = false) => {
  try {
    const result = await getHitokoto();
    hitokotoData.text = result.hitokoto;
    hitokotoData.from = result.from;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ text: result.hitokoto, from: result.from }));
    } catch {
      // 存储不可用时只是下次没有缓存
    }
  } catch (error) {
    console.error("一言获取失败：", error);
    // 接口偶尔很慢：自动加载失败时保留当前内容，只有用户主动刷新才提示
    if (manual) {
      ElMessage({
        message: "一言获取失败",
        icon: h(Error, { theme: "filled", fill: "#efefef" }),
      });
    }
  }
};

// 更新一言数据（防抖）
const updateHitokoto = debounce(() => getHitokotoData(true), 500);

onMounted(() => {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null");
    if (cached?.text) Object.assign(hitokotoData, cached);
  } catch {
    // 缓存不可用时显示默认内容
  }
  getHitokotoData();
});

onBeforeUnmount(() => updateHitokoto.cancel());
</script>

<style lang="scss" scoped>
.hitokoto {
  width: 100%;
  height: 100%;
  padding: 20px;
  animation: rise 0.7s var(--ease-out) 0.12s backwards;
  .open-music {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #00000026;
    padding: 4px 0;
    border-radius: 8px 8px 0 0;
    .i-icon {
      width: 18px;
      height: 18px;
      display: block;
      margin-right: 8px;
    }
    span {
      font-size: 0.95rem;
    }
  }
  .content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    .text {
      font-size: 1.1rem;
      word-break: break-all;
      text-overflow: ellipsis;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
    .from {
      margin-top: 10px;
      font-weight: bold;
      align-self: flex-end;
      font-size: 1.1rem;
    }
  }
}
</style>
