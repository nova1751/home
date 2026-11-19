<template>
  <div class="box cards">
    <button type="button" class="close" aria-label="关闭功能面板" @click="store.boxOpenState = false">
      <close-one theme="filled" size="26" fill="#ffffffb0" aria-hidden="true" />
    </button>
    <button
      type="button"
      class="setting"
      aria-label="打开设置"
      aria-haspopup="dialog"
      @click="store.setOpenState = true"
    >
      <setting-two theme="filled" size="26" fill="#ffffffb0" aria-hidden="true" />
    </button>
    <div class="content">
      <TimeCapsule />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CloseOne, SettingTwo } from "@icon-park/vue-next";

const store = useMainStore();
</script>

<style lang="scss" scoped>
.box {
  flex: 1 0 0%;
  margin-left: 0.75rem;
  height: 80%;
  max-width: 50%;
  position: relative;
  animation: fade 0.5s;

  &:hover {
    transform: scale(1);
  }

  .close,
  .setting {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    background: transparent;
    border: 0;
    transition:
      transform 0.3s,
      opacity 0.3s;

    &:hover {
      transform: scale(1.2);
    }

    &:active {
      transform: scale(1);
    }
  }

  .setting {
    right: 54px;
  }

  .content {
    display: flex;
    flex-direction: column;
    padding: 58px 30px 30px;
    width: 100%;
    height: 100%;
  }
}
</style>
