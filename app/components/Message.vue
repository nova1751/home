<template>
  <!-- 基本信息 -->
  <div class="message">
    <!-- Logo -->
    <div class="logo">
      <img class="logo-img" :src="siteLogo" alt="logo" width="120" height="120" />
      <div :class="{ name: true, 'text-hidden': true, long: domainName.length >= 6 }">
        <span class="bg">{{ domainName }}</span>
        <span class="sm">.{{ domainSuffix }}</span>
      </div>
    </div>
    <!-- 简介 -->
    <div class="description cards" @click="changeBox">
      <div class="content">
        <Icon size="16">
          <QuoteLeft />
        </Icon>
        <div class="text">
          <p>{{ descriptionText.hello }}</p>
          <p>{{ descriptionText.text }}</p>
        </div>
        <Icon size="16">
          <QuoteRight />
        </Icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QuoteLeft, QuoteRight } from "@vicons/fa";
import { Error } from "@icon-park/vue-next";

const store = useMainStore();
const { config, domainName, domainSuffix } = useSite();

// 主页站点logo
const siteLogo = config.siteMainLogo;

// 简介区域文字
const descriptionText = computed(() =>
  store.boxOpenState
    ? { hello: config.descHelloOther, text: config.descTextOther }
    : { hello: config.descHello, text: config.descText },
);

// 切换右侧功能区
const changeBox = () => {
  if ((store.getInnerWidth ?? 0) >= 990) {
    store.boxOpenState = !store.boxOpenState;
  } else {
    ElMessage({
      message: "当前页面宽度不足以开启盒子",
      grouping: true,
      icon: h(Error, { theme: "filled", fill: "#efefef" }),
    });
  }
};
</script>

<style lang="scss" scoped>
.message {
  .logo {
    --avatar-size: 120px;
    --logo-gap: 22px;
    --title-max: 5rem;
    display: flex;
    align-items: center;
    gap: var(--logo-gap);
    animation: rise 0.7s var(--ease-out) 0s backwards;
    max-width: 460px;
    // 字号跟随这一栏的实际宽度（而不是窗口宽度），标题在任何布局下都放得下。
    // 整个标题约为大字号的 3.9 倍宽，后缀是大字号的 0.4 倍
    container-type: inline-size;
    .logo-img {
      flex: none;
      border-radius: 50%;
      width: var(--avatar-size);
      height: auto;
    }
    .name {
      min-width: 0;
      --title-size: min(
        var(--title-max),
        calc((100cqi - var(--avatar-size) - var(--logo-gap)) / 3.9)
      );
      transform: translateY(-8px);
      font-family: "Pacifico-Regular";

      .bg {
        font-size: var(--title-size);
      }

      .sm {
        margin-left: 6px;
        font-size: calc(var(--title-size) * 0.4);
      }
    }
    @media (max-width: 768px) {
      --avatar-size: 100px;
      --title-max: 4.5rem;
      .name {
        height: 128px;
      }
    }

    @media (max-width: 720px) {
      --avatar-size: clamp(52px, min(18vw, 15dvh), 100px);
      --logo-gap: clamp(12px, 3vw, 22px);
      --title-max: clamp(2rem, 12dvh, 4.5rem);
      justify-content: center;
      max-width: 100%;
      .name {
        --descender-space: calc(var(--title-size) * 0.25);
        height: auto;
        line-height: 1.35;
        padding-bottom: var(--descender-space);
        margin-bottom: calc(-1 * var(--descender-space));
        transform: none;
      }
    }
  }

  .description {
    padding: 1rem;
    margin-top: 3.5rem;
    max-width: 460px;
    animation: rise 0.7s var(--ease-out) 0.06s backwards;

    .content {
      display: flex;
      justify-content: space-between;

      .text {
        margin: 0.75rem 1rem;
        line-height: 2rem;
        margin-right: auto;

        p {
          &:nth-of-type(1) {
            font-family: "Pacifico-Regular";
          }
        }
      }

      .xicon:nth-of-type(2) {
        align-self: flex-end;
      }
    }
    @media (max-width: 720px) {
      max-width: 100%;
      margin-top: clamp(0.75rem, 4dvh, 2rem);
      pointer-events: none;
    }
  }
  @media (max-width: 720px) and (max-height: 540px) {
    .description {
      padding-block: 0.625rem;
      .content .text {
        margin-block: 0.25rem;
        line-height: 1.5rem;
      }
    }
  }
}
</style>
