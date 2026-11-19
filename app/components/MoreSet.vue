<template>
  <div class="set">
    <button
      type="button"
      class="close"
      aria-label="关闭设置"
      autofocus
      @click="store.setOpenState = false"
    >
      <close-one theme="filled" size="24" fill="#ffffffb0" aria-hidden="true" />
    </button>
    <el-row :gutter="40">
      <el-col :span="12" class="left">
        <div class="logo text-hidden">
          <span class="bg">{{ domainName }}</span>
          <span class="sm">.{{ domainSuffix }}</span>
        </div>
        <div class="version">
          <div class="num">v&nbsp;{{ config.version }}</div>
          <el-tooltip content="Github 源代码仓库" placement="right" :show-arrow="false">
            <github-one class="github" theme="outline" size="24" @click="jumpTo(config.github)" />
          </el-tooltip>
        </div>
        <el-card class="update">
          <template #header>
            <div class="card-header">
              <span>更新日志</span>
            </div>
          </template>
          <div class="upnote">
            <div v-for="item in upData.new" :key="item" class="uptext">
              <add-one theme="outline" size="22" />
              {{ item }}
            </div>
            <div v-for="item in upData.fix" :key="item" class="uptext">
              <bug theme="outline" size="22" />
              {{ item }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12" class="right">
        <div class="title">
          <setting-two theme="filled" size="28" fill="#ffffff60" />
          <h2 id="settings-title" class="name">全局设置</h2>
        </div>
        <Settings />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { CloseOne, SettingTwo, GithubOne, AddOne, Bug } from "@icon-park/vue-next";

const store = useMainStore();
const { config, domainName, domainSuffix } = useSite();

// 更新日志
const upData = {
  new: [
    "迁移至 Nuxt 4，页面预渲染为静态 HTML",
    "音乐播放器、设置等模块按需加载",
    "壁纸 / 字体转为 WebP / WOFF2",
    "依赖全面升级",
  ],
  fix: [
    "随机壁纸被缓存导致不变化",
    "音量为 0 时刷新被重置",
    "建站时长计算误差",
    "空格键在输入时误触发播放",
  ],
};

// 跳转源代码仓库
const jumpTo = (url: string) => {
  window.open(url);
};
</script>

<style lang="scss" scoped>
.set {
  position: relative;
  padding: 40px;

  .close {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 6px;
    background: #ffffff12;
    z-index: 1;

    transition: transform 0.3s;
    &:hover {
      transform: scale(1.2);
    }

    &:active {
      transform: scale(1);
    }
  }

  .el-row {
    flex-wrap: nowrap;

    .left {
      height: 100%;
      padding-left: 40px !important;
      padding-bottom: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .logo {
        transform: translateY(-8%);
        font-family: "Pacifico-Regular";
        padding-left: 22px;
        width: 100%;
        margin-bottom: 1.5rem;
        .bg {
          font-size: 5rem;
        }

        .sm {
          margin-left: 6px;
          font-size: 2rem;
        }
      }

      .version {
        display: flex;
        flex-direction: row;
        align-items: center;

        .num {
          font-size: 2rem;
          font-family: "Pacifico-Regular";
        }

        .github {
          width: 24px;
          height: 24px;
          margin-left: 12px;
          margin-top: 6px;

          transition: transform 0.3s;
          &:hover {
            transform: scale(1.2);
          }
        }
      }

      .update {
        margin-top: 30px;
        height: 100%;

        :deep(.el-card__body) {
          height: 100%;

          .upnote {
            padding: 20px;
            height: calc(100% - 56px);
            overflow-y: auto;

            .uptext {
              display: flex;
              flex-direction: row;
              align-items: center;
              padding-bottom: 16px;

              &:nth-last-of-type(1) {
                padding: 0;
              }

              .i-icon {
                width: 22px;
                height: 22px;
                margin-right: 8px;
              }
            }
          }
        }
      }
    }

    .right {
      height: 100%;
      padding-right: 40px !important;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .title {
        display: flex;
        align-items: center;
        flex-direction: row;
        font-size: 18px;
        margin-bottom: 16px;
        .name {
          font: inherit;
        }

        .i-icon {
          width: 28px;
          height: 28px;
          margin-right: 6px;
        }
      }
    }
  }
  @media (max-width: 989px) {
    padding: 1.25rem;
    .close {
      top: 10px;
      right: 10px;
    }
    .el-row {
      margin: 0 !important;
      .left {
        display: none;
      }
      .right {
        flex: 0 0 100%;
        max-width: 100%;
        padding: 0 !important;
        .title {
          padding-inline-end: 42px;
        }
      }
    }
  }
}
</style>
