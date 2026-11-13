<template>
  <!-- 社交链接 -->
  <div class="social">
    <div class="link">
      <a
        v-for="item in socialLinks"
        :key="item.name"
        :href="item.url"
        target="_blank"
        @mouseenter="socialTip = item.tip"
        @mouseleave="socialTip = '通过这里联系我吧'"
      >
        <img class="icon" :src="item.icon" :alt="item.name" height="24" />
      </a>
    </div>
    <span class="tip">{{ socialTip }}</span>
  </div>
</template>

<script setup lang="ts">
import socialLinks from "~/assets/data/socialLinks.json";

// 社交链接提示
const socialTip = ref("通过这里联系我吧");
</script>

<style lang="scss" scoped>
.social {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 460px;
  width: 100%;
  height: 42px;
  border-radius: 6px;
  position: relative;
  isolation: isolate;
  animation: rise 0.7s var(--ease-out) 0.12s backwards;
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    background-color: #00000040;
    backdrop-filter: blur(5px);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  @media (max-width: 840px) {
    max-width: 100%;
    justify-content: center;
    .link {
      justify-content: space-evenly !important;
      width: 90%;
    }
    .tip {
      display: none !important;
    }
  }
  .link {
    display: flex;
    align-items: center;
    justify-content: center;
    a {
      display: inherit;
      .icon {
        margin: 0 12px;
        transition: transform 0.3s;
        &:hover {
          transform: scale(1.1);
        }
        &:active {
          transform: scale(1);
        }
      }
    }
  }
  @media (max-width: 720px) {
    .link a {
      flex: 1;
      min-height: 42px;
      align-items: center;
      justify-content: center;
      .icon {
        margin: 0;
      }
    }
  }
  @media (max-width: 720px) and (max-height: 540px) {
    margin-top: 0.5rem;
  }
  .tip {
    display: none;
    margin-right: 12px;
    animation: fade 0.5s;
  }
  @media (min-width: 768px) {
    &:hover {
      &::before {
        opacity: 1;
      }
      .tip {
        display: block;
      }
    }
  }
}
</style>
