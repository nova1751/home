<template>
  <footer id="footer" :class="{ blur: mounted && store.footerBlur }">
    <Transition name="fade" mode="out-in">
      <div v-if="!store.playerState || !store.playerLrcShow" class="power">
        <span>
          Copyright&nbsp;&copy;
          <span v-if="siteStartDate?.length >= 4" class="site-start">
            {{ siteStartDate.substring(0, 4) }}
            -
          </span>
          {{ fullYear }}
          <a :href="siteUrl">{{ siteAnthor }}</a>
        </span>
        <!-- 以下信息请不要修改哦 -->
        <span class="hidden">
          &amp;&nbsp;Made&nbsp;by
          <a :href="config.github" target="_blank">
            {{ config.author }}
          </a>
        </span>
        <!-- 站点备案 -->
        <a v-if="siteIcp" href="https://beian.miit.gov.cn" target="_blank">
          &amp;
          {{ siteIcp }}
        </a>
      </div>
      <div v-else class="lrc">
        <Transition name="fade" mode="out-in">
          <div :key="store.getPlayerLrc" class="lrc-all">
            <music-one theme="filled" size="18" fill="#efefef" />
            <span class="lrc-text text-hidden">{{ store.getPlayerLrc }}</span>
            <music-one theme="filled" size="18" fill="#efefef" />
          </div>
        </Transition>
      </div>
    </Transition>
  </footer>
</template>

<script setup lang="ts">
import { MusicOne } from "@icon-park/vue-next";

const store = useMainStore();
const { config, siteLink } = useSite();
const fullYear = new Date().getFullYear();

// 加载配置数据
const siteStartDate = config.siteStart;
const siteIcp = config.siteIcp;
const siteAnthor = config.siteAuthor;
const siteUrl = siteLink;

// 底栏模糊为本地设置，挂载后再应用，避免与预渲染内容不一致
const mounted = ref(false);
onMounted(() => (mounted.value = true));
</script>

<style lang="scss" scoped>
#footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 46px;
  line-height: 46px;
  text-align: center;
  z-index: 0;
  font-size: 14px;
  .power {
    animation: fade 0.7s ease-out 0.3s backwards;
  }
  .lrc {
    padding: 0 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    .lrc-all {
      width: 98%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      .lrc-text {
        margin: 0 8px;
      }
      .i-icon {
        width: 18px;
        height: 18px;
        display: inherit;
      }
    }
  }
  &.blur {
    backdrop-filter: blur(10px);
    background: rgb(0 0 0 / 25%);
    font-size: 16px;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease-in-out;
  }
  @media (max-width: 720px) {
    font-size: 0.85rem;
    &.blur {
      font-size: 0.85rem;
    }
  }
  @media (max-width: 480px) {
    .hidden {
      display: none;
    }
  }
}
</style>
