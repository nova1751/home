<template>
  <div v-if="siteLinks[0]" class="links">
    <div class="line">
      <Icon size="20">
        <Link />
      </Icon>
      <span class="title">网站列表</span>
      <button
        v-if="playerConfigured"
        type="button"
        class="widget-toggle"
        aria-controls="home-widgets"
        :aria-label="store.mobileFuncState ? '切换到时钟和天气' : '切换到一言和音乐'"
        @click="store.toggleMobileWidgets"
      >
        {{ store.mobileFuncState ? "时钟&天气" : "一言&音乐" }}
      </button>
    </div>
    <nav class="link-all" aria-label="网站列表">
      <a
        v-for="(item, index) in siteLinks"
        :key="item.name"
        class="item cards card-action"
        :href="item.link"
        :aria-label="item.name"
        target="_blank"
        rel="noopener"
        :style="{ '--i': index % 6 }"
        @click="openMusic($event, item.name)"
      >
        <Icon size="26" aria-hidden="true">
          <component :is="siteIcon[item.icon]" />
        </Icon>
        <span class="name text-hidden">{{ item.name }}</span>
      </a>
    </nav>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";
// 可前往 https://www.xicons.org 自行挑选并在此处引入
import { Link, Blog, CompactDisc, Cloud, Compass, Book, Fire, LaptopCode } from "@vicons/fa"; // 注意使用正确的类别
import siteLinks from "~/assets/data/siteLinks.json";

const store = useMainStore();
const playerConfigured = !!useRuntimeConfig().public.songId;

// 网站链接图标
const siteIcon: Record<string, Component> = {
  Blog,
  Cloud,
  CompactDisc,
  Compass,
  Book,
  Fire,
  LaptopCode,
};

// Keep the real link available, including modified clicks and before hydration.
const openMusic = (event: MouseEvent, name: string) => {
  if (name !== "音乐" || !store.musicClick || !store.musicIsOk) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  event.preventDefault();
  store.musicListShow = true;
};
</script>

<style lang="scss" scoped>
.links {
  .line {
    margin: 2rem 0.25rem 1rem;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    animation: rise 0.7s var(--ease-out) 0.24s backwards;
    .title {
      margin-left: 8px;
      font-size: 1.15rem;
      text-shadow: 0 0 5px #00000050;
    }
    .widget-toggle {
      display: none;
      margin-inline-start: auto;
      min-height: 36px;
      padding: 0 0.65rem;
      border: 0;
      border-radius: 6px;
      background: #ffffff26;
      font: inherit;
      font-size: 0.9rem;
      &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }
    }
    @media (max-width: 910px) and (scripting: enabled) {
      .widget-toggle {
        display: block;
      }
    }
  }
  .link-all {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-content: start;
    gap: 20px;
    height: 230px;
    margin: 0 -5px;
    padding: 5px;
    overflow-y: auto;
    .item {
      height: 100px;
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: center;
      padding: 0 10px;
      > * {
        animation: fade 0.3s ease-out calc(var(--i) * 0.025s) backwards;
      }

      .name {
        font-size: 1.1rem;
        margin-left: 8px;
      }
      @media (720px < width <= 820px) {
        .name {
          display: none;
        }
      }
      @media (max-width: 720px) {
        height: 80px;
      }
      @media (max-width: 460px) {
        flex-direction: column;
        .name {
          font-size: 1rem;
          margin-left: 0;
          margin-top: 8px;
        }
      }
    }
    @media (max-width: 720px) {
      height: auto;
      overflow: visible;
    }
  }
  @media (max-width: 720px) and (max-height: 540px) {
    .line {
      margin-block: 0.75rem 0.5rem;
    }
    .link-all {
      gap: 0.75rem;
      .item {
        height: 68px;
      }
    }
  }
}
</style>
