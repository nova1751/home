<template>
  <div ref="weatherCard" class="weather">
    <template v-if="weather">
      <span class="weather-city" :title="weather.city">{{ weather.city }}</span>
      <span>{{ weather.text }}&nbsp;{{ weather.temp }}℃</span>
      <span v-if="wind" class="sm-hidden">{{ wind }}</span>
      <a
        v-if="weather.source === 'open-meteo'"
        class="weather-credit"
        href="https://open-meteo.com/en/license"
        target="_blank"
        rel="noopener"
        :aria-label="credit"
        :title="credit"
      >
        <span aria-hidden="true">ⓘ</span>
      </a>
    </template>
    <span v-else>{{ loading ? "天气加载中" : "天气暂不可用" }}</span>
  </div>
</template>

<script setup lang="ts">
import type { CurrentWeather } from "~/utils/weather";

const config = useRuntimeConfig().public;
const weatherCard = ref<HTMLDivElement | null>(null);
const loading = ref(true);
const weather = ref<(CurrentWeather & { city: string }) | null>(null);
const credit = "天气数据由 Open-Meteo 提供（CC BY 4.0，已转换天气描述和风力等级）";
const wind = computed(() => {
  if (!weather.value) return "";
  const { windDir, windScale } = weather.value;
  const direction = windDir && !windDir.endsWith("风") ? windDir + "风" : windDir;
  return [direction, windScale && windScale + " 级"].filter(Boolean).join(" ");
});
let observer: IntersectionObserver | undefined;

async function loadWeather() {
  try {
    const { getLocalWeather } = await import("~/utils/weather");
    const { city, now } = await getLocalWeather(config);
    weather.value = { city, ...now };
  } catch {
    // 天气卡片内显示请求结果。
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (!weatherCard.value || !("IntersectionObserver" in window)) {
    void loadWeather();
    return;
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer?.disconnect();
      void loadWeather();
    },
    { rootMargin: "300px 0px" },
  );
  observer.observe(weatherCard.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<style scoped>
.weather {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35em;
  width: 100%;
  white-space: nowrap;
}

.weather-city {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.weather-credit {
  display: grid;
  flex: 0 0 24px;
  min-height: 24px;
  place-items: center;
  border-radius: 6px;
  font: 1rem/1 system-ui, sans-serif;
  opacity: 0.75;
}

.weather-credit:hover,
.weather-credit:focus-visible {
  background: rgb(255 255 255 / 12%);
  opacity: 1;
}

.weather-credit:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 1px;
}
</style>
