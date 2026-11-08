import { defineStore } from "pinia";

export type PlayerLoop = "all" | "one" | "none";
export type PlayerOrder = "list" | "random";

export const useMainStore = defineStore("main", {
  state: () => ({
    imgLoadStatus: false, // 壁纸加载状态
    innerWidth: null as number | null, // 当前窗口宽度
    coverType: "0", // 壁纸种类
    siteStartShow: false, // 建站日期显示
    musicClick: false, // 音乐链接是否跳转
    musicIsOk: false, // 音乐是否加载完成
    musicVolume: 0.7, // 音乐音量
    musicOpenState: false, // 音乐面板开启状态
    musicListShow: false, // 音乐列表弹窗开启状态
    backgroundShow: false, // 壁纸展示状态
    boxOpenState: false, // 盒子开启状态
    mobileOpenState: false, // 移动端开启状态
    mobileFuncState: false, // 移动端功能区开启状态
    setOpenState: false, // 设置页面开启状态
    playerState: false, // 当前是否正在播放
    playerTitle: null as string | null, // 当前播放歌曲名
    playerArtist: null as string | null, // 当前播放歌手名
    playerLrc: "歌词加载中", // 当前播放歌词
    playerLrcShow: true, // 是否显示底栏歌词
    footerBlur: true, // 底栏模糊
    playerAutoplay: false, // 是否自动播放
    playerLoop: "all" as PlayerLoop, // 循环播放
    playerOrder: "list" as PlayerOrder, // 循环顺序
    persistVersion: 2, // 本地存储版本
  }),
  getters: {
    getPlayerLrc: (state) => state.playerLrc,
    getPlayerData: (state) => ({ name: state.playerTitle, artist: state.playerArtist }),
    getInnerWidth: (state) => state.innerWidth,
  },
  actions: {
    // 更改当前页面宽度
    setInnerWidth(value: number) {
      this.innerWidth = value;
      if (value >= 720) {
        this.mobileOpenState = false;
        this.mobileFuncState = false;
      }
      if (value < 990) {
        this.boxOpenState = false;
      }
    },
    // 更改播放状态（传入 audio.paused）
    setPlayerState(paused: boolean) {
      this.playerState = !paused;
    },
    // 更改歌词
    setPlayerLrc(value: string) {
      this.playerLrc = value;
    },
    // 更改歌曲数据
    setPlayerData(title: string, artist: string) {
      this.playerTitle = title;
      this.playerArtist = artist;
    },
    // 更改壁纸加载状态
    setImgLoadStatus(value: boolean) {
      this.imgLoadStatus = value;
    },
  },
  persist: {
    key: "data",
    storage: piniaPluginPersistedstate.localStorage(),
    pick: [
      "coverType",
      "musicVolume",
      "siteStartShow",
      "musicClick",
      "playerLrcShow",
      "footerBlur",
      "playerAutoplay",
      "playerLoop",
      "playerOrder",
      "persistVersion",
    ],
    afterHydrate: ({ store }) => {
      // 旧版本中音量 0 表示「未设置」，迁移为默认值
      try {
        const raw = JSON.parse(localStorage.getItem("data") || "{}");
        if (!("persistVersion" in raw) && raw.musicVolume === 0) store.musicVolume = 0.7;
      } catch {
        // ignore
      }
    },
  },
});
