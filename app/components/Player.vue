<template>
  <APlayer
    v-if="playList.length"
    ref="player"
    :audio="playList"
    :autoplay="store.playerAutoplay"
    :theme="theme"
    :auto-switch="false"
    :loop="store.playerLoop"
    :order="store.playerOrder"
    :volume="volume"
    :show-lrc="true"
    :list-folded="listFolded"
    :list-max-height="listMaxHeight"
    :notice-switch="false"
    @play="onPlay"
    @pause="onPause"
    @timeupdate="onTimeUp"
    @error="loadMusicError"
  />
</template>

<script setup lang="ts">
import { MusicOne, PlayWrong } from "@icon-park/vue-next";
import { getPlayerList, HttpRequestError, musicServiceUnavailable, type Song } from "~/utils/api";

// APlayer 体积较大，单独拆包按需加载
const APlayer = defineAsyncComponent(() => import("@worstone/vue-aplayer"));

const store = useMainStore();

// 获取播放器 DOM
const player = ref<any>(null);

// 歌曲播放列表
const playList = ref<Song[]>([]);

// 歌曲播放项
const playIndex = ref(0);

// 配置项
const props = defineProps({
  // 主题色
  theme: { type: String, default: "#efefef" },
  // 默认音量
  volume: {
    type: Number,
    default: 0.7,
    validator: (value: number) => value >= 0 && value <= 1,
  },
  // 歌曲 API 地址
  songApi: { type: String, required: true },
  songFallbackApi: { type: String, default: "" },
  // 歌曲服务器 ( netease-网易云, tencent-qq音乐 )
  songServer: { type: String, default: "netease" },
  // 播放类型 ( song-歌曲, playlist-播放列表, album-专辑, search-搜索, artist-艺术家 )
  songType: { type: String, default: "playlist" },
  // id
  songId: { type: String, default: "7452421335" },
  // 列表是否默认折叠
  listFolded: { type: Boolean, default: false },
  // 列表最大高度
  listMaxHeight: { type: Number, default: 420 },
});

const listHeight = computed(() => props.listMaxHeight + "px");

let mounted = false;
let loading = false;
let retryTimer: ReturnType<typeof setTimeout> | undefined;

// Retry only once automatically; client errors are left for a manual retry.
const loadPlaylist = async (allowAutomaticRetry: boolean) => {
  if (loading || !mounted) return;
  loading = true;
  try {
    const list = await getPlayerList(
      props.songApi,
      props.songServer,
      props.songType,
      props.songId,
      props.songFallbackApi,
    );
    if (!mounted) return;
    playList.value = list;
    store.musicIsOk = true;
    store.musicLoadFailed = false;
  } catch (err) {
    if (!mounted) return;
    store.musicIsOk = false;
    store.musicLoadFailed = true;
    const isClientError = err instanceof HttpRequestError && err.status >= 400 && err.status < 500;
    if (allowAutomaticRetry && !isClientError) {
      store.musicRetrying = true;
      retryTimer = setTimeout(() => {
        retryTimer = undefined;
        loading = false;
        void loadPlaylist(false);
      }, 2000);
      return;
    }
    console.error("播放器加载失败：", err);
    ElMessage({
      message: "播放器加载失败",
      grouping: true,
      icon: h(PlayWrong, { theme: "filled", fill: "#efefef" }),
    });
  } finally {
    if (mounted && retryTimer === undefined) {
      loading = false;
      store.musicRetrying = false;
    }
  }
};

const retryLoad = () => {
  if (loading || !mounted) return;
  store.musicRetrying = true;
  void loadPlaylist(false);
};

onMounted(() => {
  mounted = true;
  store.musicIsOk = false;
  store.musicLoadFailed = false;
  store.musicRetrying = false;
  void loadPlaylist(true);
});

onBeforeUnmount(() => {
  mounted = false;
  clearTimeout(retryTimer);
  store.musicRetrying = false;
});

// 播放
const onPlay = () => {
  playIndex.value = player.value.aplayer.index;
  // 播放状态
  store.setPlayerState(player.value.audioRef.paused);
  // 储存播放器信息
  const song = playList.value[playIndex.value];
  if (!song) return;
  store.setPlayerData(song.name, song.artist);
  ElMessage({
    message: song.name + " - " + song.artist,
    grouping: true,
    icon: h(MusicOne, { theme: "filled", fill: "#efefef" }),
  });
};

// 暂停
const onPause = () => {
  store.setPlayerState(player.value.audioRef.paused);
};

// 音频时间更新事件
const onTimeUp = () => {
  const lyrics = player.value.aplayer.lyrics[playIndex.value];
  const lyricIndex = player.value.aplayer.lyricIndex;
  if (!lyrics || !lyrics[lyricIndex]) return;
  let lrc = lyrics[lyricIndex][1];
  if (lrc === "Loading") {
    lrc = "歌词加载中";
  } else if (lrc === "Not available") {
    lrc = "歌词加载失败";
  }
  if (lrc !== store.playerLrc) store.setPlayerLrc(lrc);
};

// 切换播放暂停事件
const playToggle = () => {
  player.value?.toggle();
};

// 切换音量事件
const changeVolume = (value: number) => {
  player.value?.setVolume(value, false);
};

// 切换上下曲
const changeSong = (type: number) => {
  if (!player.value) return;
  if (type === 0) player.value.skipBack();
  else player.value.skipForward();
  nextTick(() => {
    player.value.play();
  });
};

// 切换歌曲列表状态
const toggleList = () => {
  player.value?.toggleList();
};

// 加载音频错误
let recoveryAttempted = false;
const loadMusicError = async () => {
  const current = playList.value[player.value?.aplayer.index ?? 0];
  if (!recoveryAttempted && props.songFallbackApi && current) {
    const resume = !player.value?.audioRef.paused;
    recoveryAttempted = true;
    try {
      if (await musicServiceUnavailable(current.url, props.songApi)) {
        const alternate = await getPlayerList(props.songFallbackApi, props.songServer, props.songType, props.songId);
        clearTimeout(player.value?.skipForwardTimeout);
        player.value?.clearList();
        playList.value = alternate;
        await nextTick();
        player.value?.switchList(0);
        if (resume) player.value?.play();
        ElMessage({ message: "音乐服务暂不可用，已切换原来的接口", grouping: true });
        return;
      }
      recoveryAttempted = false;
    } catch {
      // A failed fallback is attempted only once, avoiding an endless error loop.
    }
  }
  const notice =
    playList.value.length > 1 ? "播放歌曲出现错误，播放器将在 2s 后进行下一首" : "播放歌曲出现错误";
  ElMessage({
    message: notice,
    grouping: true,
    duration: 2000,
    icon: h(PlayWrong, { theme: "filled", fill: "#EFEFEF" }),
  });
  console.error(
    "播放歌曲: " + player.value?.aplayer.audio[player.value.aplayer.index]?.name + " 出现错误",
  );
};

// 暴露子组件方法
defineExpose({ playToggle, changeVolume, changeSong, toggleList, retryLoad });
</script>

<style lang="scss" scoped>
.aplayer {
  width: 80%;
  border-radius: 6px;
  font-family: "HarmonyOS_Regular", sans-serif !important;
  :deep(.aplayer-body) {
    background-color: transparent;
    .aplayer-pic {
      display: none;
    }
    .aplayer-info {
      margin-left: 0;
      background-color: #ffffff40;
      border-color: transparent !important;
      .aplayer-music {
        flex-grow: initial;
        margin-bottom: 2px;
        overflow: initial;
        .aplayer-title {
          font-size: 16px;
          margin-right: 6px;
        }
        .aplayer-author {
          color: #efefef;
        }
      }
      .aplayer-lrc {
        text-align: left;
        margin: 7px 0 6px 6px;
        height: 44px;
        mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        -webkit-mask: linear-gradient(
          #fff 15%,
          #fff 85%,
          hsla(0deg, 0%, 100%, 0.6) 90%,
          hsla(0deg, 0%, 100%, 0)
        );
        &::before,
        &::after {
          display: none;
        }
        p {
          color: #efefef;
        }
        .aplayer-lrc-current {
          font-size: 0.95rem;
          margin-bottom: 4px !important;
        }
      }
      .aplayer-controller {
        display: none;
      }
    }
  }
  :deep(.aplayer-list) {
    margin-top: 6px;
    height: v-bind(listHeight);
    background-color: transparent;
    ol {
      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
      li {
        border-color: transparent;
        &.aplayer-list-light {
          background: #ffffff40;
          border-radius: 6px;
        }
        transition: background-color 0.3s;
        &:hover {
          background: #ffffff26 !important;
          border-radius: 6px !important;
        }
        .aplayer-list-index,
        .aplayer-list-author {
          color: #efefef;
        }
      }
    }
  }
}
</style>
