<template>
  <div class="time-capsule">
    <div class="title">
      <hourglass-full theme="two-tone" size="24" :fill="['#efefef', '#00000020']" />
      <span>时光胶囊</span>
    </div>
    <div v-for="{ key, period, unit } in periods" :key="key" class="period">
      <div class="summary">
        <span :id="`capsule-${key}`">{{ period }}已经度过了 {{ timeData[key].elapsed }} {{ unit }}</span>
        <span aria-hidden="true">{{ timeData[key].pass }}%</span>
      </div>
      <el-progress
        :aria-labelledby="`capsule-${key}`"
        :percentage="timeData[key].pass"
        :show-text="false"
        :stroke-width="8"
      />
    </div>
    <div v-if="startDate.length >= 4 && store.siteStartShow">
      <span class="text">{{ startDateText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HourglassFull } from "@icon-park/vue-next";
import { getTimeCapsule, siteDateStatistics } from "~/utils/getTime";

const store = useMainStore();

// 进度条数据
const periods = [
  { key: "day", period: "今日", unit: "小时" },
  { key: "week", period: "本周", unit: "天" },
  { key: "month", period: "本月", unit: "天" },
  { key: "year", period: "今年", unit: "个月" },
] as const;
const timeData = ref(getTimeCapsule());
const startDate = useRuntimeConfig().public.siteStart;
const startDateText = ref<string | null>(null);
let timeInterval: ReturnType<typeof setInterval> | undefined;

const update = () => {
  timeData.value = getTimeCapsule();
  if (startDate) startDateText.value = siteDateStatistics(new Date(startDate));
};

onMounted(() => {
  update();
  // 进度按分钟变化，无需每秒刷新
  timeInterval = setInterval(update, 60 * 1000);
});

onBeforeUnmount(() => {
  clearInterval(timeInterval);
});
</script>

<style lang="scss" scoped>
.time-capsule {
  width: 100%;
  font-variant-numeric: tabular-nums;
  :deep(.el-progress-bar__outer) {
    background-color: #00000020;
  }
  :deep(.el-progress-bar__inner) {
    background-color: #efefef;
    animation: fill-progress .9s var(--panel-curve) .16s backwards;
  }
  .title {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0.2rem 0 1.5rem;
    font-size: 1.1rem;
    .i-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 6px;
    }
  }
  .summary {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.75rem;
    margin: 1.25rem 0 0.5rem;
    font-size: 0.95rem;
  }
  .text {
    display: block;
    margin: 1rem 0rem 0.5rem 0rem;
    font-size: 0.95rem;
  }
}
@keyframes fill-progress {
  from {
    clip-path: inset(0 100% 0 0 round 6px);
  }
  to {
    clip-path: inset(0 0 0 0 round 6px);
  }
}
</style>
