<template>
  <div ref="weatherCard" class="weather">
    <template v-if="weather">
      <div class="weather-summary">
        <span>{{ weather.city }}&nbsp;{{ weather.text }}&nbsp;{{ weather.temp }}℃</span>
        <span v-if="weather.windDir || weather.windScale" class="weather-wind">
          <template v-if="weather.windDir">
            {{ weather.windDir.endsWith("风") ? weather.windDir : weather.windDir + "风" }}
          </template>
          <template v-if="weather.windScale">{{ weather.windScale }}&nbsp;级</template>
        </span>
      </div>
      <a
        v-if="weather.source === 'open-meteo'"
        href="https://open-meteo.com/"
        target="_blank"
        rel="noopener"
        class="weather-source"
        >数据来源 · Open-Meteo</a
      >
    </template>
    <span v-else>{{ loading ? "天气加载中" : "天气暂不可用" }}</span>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig().public;
const weatherCard = ref<HTMLDivElement | null>(null);
const loading = ref(true);
const weather = ref<{
  city: string;
  text: string;
  temp: string | number;
  windDir: string;
  windScale: string;
  source?: "open-meteo";
} | null>(null);
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
.weather-source {
  display: inline-block;
  font-size: 0.75rem;
  text-decoration: underline;
  text-underline-offset: 0.15em;
  color: rgb(255 255 255 / 80%);
}

.weather {
  width: 100%;
  text-align: center;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.weather-wind {
  display: inline-block;
  margin-inline-start: 0.45em;
}

@media (910px <= width <= 1200px) {
  .weather-wind {
    display: none;
  }
}

@media (max-width: 720px) {
  .weather {
    font-size: 0.9rem;
  }
}
</style>
