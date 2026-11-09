<template>
  <div v-if="siteLinks[0]" class="links">
    <div class="line">
      <Icon size="20">
        <Link />
      </Icon>
      <span class="title">网站列表</span>
    </div>
    <!-- 网站列表 -->
    <Swiper
      v-if="siteLinks[0]"
      :modules="[Pagination, Mousewheel]"
      :slides-per-view="1"
      :space-between="40"
      :pagination="{
        el: '.swiper-pagination',
        clickable: true,
        bulletElement: 'div',
      }"
      :mousewheel="true"
    >
      <SwiperSlide v-for="(site, i) in siteLinksList" :key="i">
        <el-row class="link-all" :gutter="20">
          <el-col v-for="(item, index) in site" :key="item.name" :span="8">
            <div
              class="item cards"
              :style="{ '--i': index, marginBottom: index < 3 ? '20px' : undefined }"
              @click="jumpLink(item)"
            >
              <Icon size="26">
                <component :is="siteIcon[item.icon]" />
              </Icon>
              <span class="name text-hidden">{{ item.name }}</span>
            </div>
          </el-col>
        </el-row>
      </SwiperSlide>
      <div class="swiper-pagination" />
    </Swiper>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";
// 可前往 https://www.xicons.org 自行挑选并在此处引入
import { Link, Blog, CompactDisc, Cloud, Compass, Book, Fire, LaptopCode } from "@vicons/fa"; // 注意使用正确的类别
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Mousewheel } from "swiper/modules";
import siteLinks from "~/assets/data/siteLinks.json";

interface SiteLink {
  icon: string;
  name: string;
  link: string;
}

const store = useMainStore();

// 计算网站链接（每页 6 个）
const siteLinksList = computed(() => {
  const result: SiteLink[][] = [];
  for (let i = 0; i < siteLinks.length; i += 6) {
    result.push(siteLinks.slice(i, i + 6));
  }
  return result;
});

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

// 链接跳转
const jumpLink = (data: SiteLink) => {
  if (data.name === "音乐" && store.musicClick && store.musicIsOk) {
    store.musicListShow = true;
  } else {
    window.open(data.link, "_blank");
  }
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
  .swiper {
    left: -10px;
    width: calc(100% + 20px);
    padding: 5px 10px 0;
    z-index: 0;
    .swiper-slide {
      height: 100%;
    }
    .swiper-pagination {
      position: static;
      margin-top: 4px;
      :deep(.swiper-pagination-bullet) {
        background-color: #fff;
        width: 18px;
        height: 4px;
        border-radius: 4px;
        transition: opacity 0.3s;
        &:hover {
          opacity: 1;
        }
      }
    }
  }
  .link-all {
    height: 220px;
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
      height: 180px;
    }
  }
}
</style>
