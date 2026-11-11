<template>
  <div v-if="siteLinks[0]" class="links">
    <div class="line">
      <Icon size="20">
        <Link />
      </Icon>
      <span class="title">网站列表</span>
    </div>
    <nav class="link-all" aria-label="网站列表">
      <a
        v-for="(item, index) in siteLinks"
        :key="item.name"
        class="item cards"
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
      animation: rise 0.7s var(--ease-out) calc(0.28s + var(--i) * 0.05s) backwards;

      transition:
        transform 0.35s var(--ease-out),
        background-color 0.3s;
      &:hover {
        transform: scale(1.02);
        background: rgb(0 0 0 / 40%);
      }

      &:active {
        transform: scale(1);
      }
      &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }

      .name {
        font-size: 1.1rem;
        margin-left: 8px;
      }
      @media (min-width: 720px) and (max-width: 820px) {
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
      height: 190px;
    }
  }
}
</style>
