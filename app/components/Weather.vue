<template>
  <div ref="weatherCard" class="weather">
    <template v-if="weather">
      <span>{{ weather.city }}&nbsp;</span>
      <span>{{ weather.text }}&nbsp;</span>
      <span>{{ weather.temp }}℃</span>
      <span v-if="weather.windDir" class="sm-hidden">
        &nbsp;{{ weather.windDir.endsWith("风") ? weather.windDir : weather.windDir + "风" }}&nbsp;
      </span>
      <span v-if="weather.windScale" class="sm-hidden">{{ weather.windScale }}&nbsp;级</span>
      <a
        v-if="weather.source === 'open-meteo'"
        href="https://open-meteo.com/"
        target="_blank"
        rel="noopener"
        class="weather-source"
        >Open-Meteo</a
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
  margin-inline-start: 0.35em;
  font-size: 0.7em;
  text-decoration: underline;
}
</style>
