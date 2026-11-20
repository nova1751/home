<template>
  <!-- 音乐控制面板 -->
  <Transition name="widget">
    <div
      v-show="store.musicOpenState"
      id="music-controls"
      class="music"
      @mouseenter="volumeHovered = true"
      @mouseleave="volumeHovered = false"
      @focusin="onMusicFocusIn"
      @focusout="onMusicFocusOut"
    >
      <div class="btns">
        <button type="button" @click="store.musicListShow = true">音乐列表</button>
        <button type="button" @click="store.musicOpenState = false">回到一言</button>
      </div>
      <div class="control">
        <button type="button" aria-label="上一首" @click="changeMusicIndex(0)">
          <go-start theme="filled" size="30" fill="#efefef" aria-hidden="true" />
        </button>
        <button type="button" class="state" :aria-label="store.playerState ? '暂停' : '播放'" @click="changePlayState">
          <play-one v-show="!store.playerState" theme="filled" size="50" fill="#efefef" aria-hidden="true" />
          <pause v-show="store.playerState" theme="filled" size="50" fill="#efefef" aria-hidden="true" />
        </button>
        <button type="button" aria-label="下一首" @click="changeMusicIndex(1)">
          <go-end theme="filled" size="30" fill="#efefef" aria-hidden="true" />
        </button>
      </div>
      <div class="menu" :class="{ 'retry-menu': store.musicLoadFailed && !store.musicRetrying }">
        <div
          v-show="!volumeShow || store.musicLoadFailed || store.musicRetrying"
          class="name"
          :class="{ 'retry-status': store.musicLoadFailed && !store.musicRetrying }"
        >
          <span role="status" aria-live="polite">{{ playerStatus }}</span>
          <button
            v-if="store.musicLoadFailed && !store.musicRetrying"
            type="button"
            class="retry"
            aria-label="重新加载音乐"
            @click="playerRef?.retryLoad()"
          >重试</button>
        </div>
        <div v-show="volumeShow && !store.musicLoadFailed && !store.musicRetrying" class="volume">
          <div class="icon">
            <volume-mute v-if="volumeNum == 0" theme="filled" size="24" fill="#efefef" aria-hidden="true" />
            <volume-small
              v-else-if="volumeNum > 0 && volumeNum < 0.7"
              theme="filled"
              size="24"
              fill="#efefef"
              aria-hidden="true"
            />
            <volume-notice v-else theme="filled" size="24" fill="#efefef" aria-hidden="true" />
          </div>
          <ClientOnly>
            <el-slider v-model="volumeNum" aria-label="音量" :show-tooltip="false" :min="0" :max="1" :step="0.01" />
          </ClientOnly>
        </div>
      </div>
    </div>
  </Transition>
  <!-- 音乐列表弹窗 -->
  <Transition name="fade">
    <div v-show="store.musicListShow" class="music-list" @click="store.musicListShow = false">
      <Transition name="playlist-zoom">
        <div v-show="store.musicListShow" class="list" @click.stop>
          <button
            class="close"
            type="button"
            aria-label="关闭音乐列表"
            @click="store.musicListShow = false"
          >
            <close-one theme="filled" size="28" fill="#ffffff60" aria-hidden="true" />
          </button>
          <ClientOnly>
            <Player
              ref="playerRef"
              :song-api="playerData.api"
              :song-fallback-api="config.songFallbackApi"
              :song-server="playerData.server"
              :song-type="playerData.type"
              :song-id="playerData.id"
              :volume="volumeNum"
            />
          </ClientOnly>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import {
  GoStart,
  PlayOne,
  Pause,
  GoEnd,
  CloseOne,
  VolumeMute,
  VolumeSmall,
  VolumeNotice,
} from "@icon-park/vue-next";

const store = useMainStore();
const config = useRuntimeConfig().public;

// 音量条数据
const volumeHovered = ref(false);
const volumeFocused = ref(false);
const volumeShow = computed(() => volumeHovered.value || volumeFocused.value);
const onMusicFocusIn = (event: FocusEvent) => {
  if ((event.target as HTMLElement | null)?.matches(":focus-visible")) volumeFocused.value = true;
};
const onMusicFocusOut = (event: FocusEvent) => {
  const next = event.relatedTarget;
  if (!(next instanceof Node) || !(event.currentTarget as HTMLElement).contains(next)) {
    volumeFocused.value = false;
  }
};
const volumeNum = computed({
  get: () => store.musicVolume,
  set: (value: number) => (store.musicVolume = value),
});

// 播放列表数据
const playerRef = ref<{
  playToggle: () => void;
  changeVolume: (value: number) => void;
  changeSong: (type: number) => void;
  toggleList: () => void;
  retryLoad: () => void;
} | null>(null);
const playerData = {
  api: config.songApi,
  server: config.songServer,
  type: config.songType,
  id: config.songId,
};

const playerStatus = computed(() => {
  if (store.musicRetrying) return "正在重试…";
  if (!store.musicIsOk) return store.musicLoadFailed ? "歌单暂不可用" : "歌单加载中";
  const { name, artist } = store.getPlayerData;
  return name ? name + " - " + artist : "未播放音乐";
});

// 开关播放列表
watch(
  () => store.musicListShow,
  () => playerRef.value?.toggleList(),
);

// 音乐播放暂停
const changePlayState = () => {
  playerRef.value?.playToggle();
};

// 音乐上下曲
const changeMusicIndex = (type: number) => {
  playerRef.value?.changeSong(type);
};

// 空格键播放 / 暂停
const onKeydown = (e: KeyboardEvent) => {
  if (!store.musicIsOk || e.code !== "Space" || e.repeat) return;
  const target = e.target as HTMLElement | null;
  if (target?.closest("input, textarea, select, button, [contenteditable='true']")) return;
  e.preventDefault();
  changePlayState();
};

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});

// 监听音量变化
watch(volumeNum, (value) => {
  playerRef.value?.changeVolume(value);
});
</script>

<style lang="scss" scoped>
.music {
  width: 100%;
  height: 100%;
  background: #00000040;
  backdrop-filter: blur(10px);
  border-radius: 6px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;

  .btns {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    button {
      background: #ffffff26;
      border: 0;
      color: inherit;
      cursor: pointer;
      font: inherit;
      padding: 2px 8px;
      border-radius: 6px;
      margin: 0px 6px;
      text-overflow: ellipsis;
      overflow-x: hidden;
      white-space: nowrap;
      transition: background-color 0.3s;
      &:hover {
        background: #ffffff4d;
      }
      &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }
    }
  }
  .control {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
        border-radius: 6px;
      }
    }
    .state {
      .i-icon {
        width: 50px;
        height: 50px;
        display: block;
      }
    }
    .i-icon {
      width: 36px;
      height: 36px;
      display: flex;
      border-radius: 6px;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transform: scale(1);
      transition:
        transform 0.3s,
        background-color 0.3s;
      &:hover {
        background: #ffffff33;
      }
      &:active {
        transform: scale(0.95);
      }
    }
  }
  .menu {
    height: 26px;
    width: 100%;
    line-height: 26px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    &.retry-menu {
      height: 36px;
      line-height: normal;
    }
    .name {
      width: 100%;
      text-align: center;
      text-overflow: ellipsis;
      overflow-x: hidden;
      white-space: nowrap;
      animation: fade 0.3s;
      &.retry-status {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .retry {
        min-height: 36px;
        padding: 2px 8px;
        border: 0;
        border-radius: 6px;
        background: #ffffff26;
        color: inherit;
        cursor: pointer;
        font: inherit;
        transition: background-color 0.3s;
        &:hover {
          background: #ffffff4d;
        }
        &:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 2px;
        }
      }
    }
    .volume {
      width: 100%;
      padding: 0 12px;
      display: flex;
      align-items: center;
      flex-direction: row;
      animation: fade 0.3s;
      .icon {
        margin-right: 12px;
        span {
          width: 24px;
          height: 24px;
          display: block;
        }
      }
      :deep(*) {
        transition: none;
      }
      :deep(.el-slider__button) {
        transition: 0.3s;
      }
      .el-slider {
        margin-right: 12px;
        --el-slider-main-bg-color: #efefef;
        --el-slider-runway-bg-color: #ffffff40;
        --el-slider-button-size: 16px;
      }
    }
  }
}
.music-list {
  position: fixed;
  top: 0;
  left: 0;
  margin: auto;
  width: 100%;
  height: 100%;
  background-color: #00000080;
  backdrop-filter: blur(20px);
  z-index: 1;
  .list {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: calc(50% - 300px);
    left: calc(50% - 320px);
    width: 640px;
    height: 600px;
    background-color: #ffffff66;
    border-radius: 6px;
    z-index: 999;
    @media (max-width: 720px) {
      left: calc(50% - 45%);
      width: 90%;
    }
    .close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 28px;
      height: 28px;
      display: block;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      transition: transform 0.3s;
      &:hover {
        transform: scale(1.2);
      }
      &:active {
        transform: scale(0.95);
      }
      &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
        border-radius: 6px;
      }
    }
  }
}

.playlist-zoom-enter-active,
.playlist-zoom-leave-active {
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
}
.playlist-zoom-leave-active {
  transition-duration: 0.3s;
}
.playlist-zoom-enter-from,
.playlist-zoom-leave-to {
  opacity: 0;
  transform: scale(0) translateY(-600px);
}
</style>
