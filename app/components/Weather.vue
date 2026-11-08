<template>
  <div v-if="weatherData.adCode.city && weatherData.weather.weather" class="weather">
    <span>{{ weatherData.adCode.city }}&nbsp;</span>
    <span>{{ weatherData.weather.weather }}&nbsp;</span>
    <span>{{ weatherData.weather.temperature }}℃</span>
    <span class="sm-hidden">
      &nbsp;{{
        weatherData.weather.winddirection?.endsWith("风")
          ? weatherData.weather.winddirection
          : weatherData.weather.winddirection + "风"
      }}&nbsp;
    </span>
    <span class="sm-hidden">{{ weatherData.weather.windpower }}&nbsp;级</span>
  </div>
  <div v-else class="weather">
    <span>{{ loading ? "天气加载中" : "天气数据获取失败" }}</span>
  </div>
</template>

<script setup lang="ts">
import { getAdcode, getWeather, getOtherWeather } from "~/utils/api";
import { Error as ErrorIcon } from "@icon-park/vue-next";

// 高德开发者 Key
const mainKey = useRuntimeConfig().public.weatherKey;

const loading = ref(true);

// 天气数据
const weatherData = reactive({
  adCode: {
    city: null as string | null, // 城市
    adcode: null as string | null, // 城市编码
  },
  weather: {
    weather: null as string | null, // 天气现象
    temperature: null as string | number | null, // 实时气温
    winddirection: null as string | null, // 风向描述
    windpower: null as string | null, // 风力级别
  },
});

// 取出天气平均值
const getTemperature = (min: string | number, max: string | number) => {
  const average = (Number(min) + Number(max)) / 2;
  return Number.isNaN(average) ? "NaN" : Math.round(average);
};

// 获取天气数据
const getWeatherData = async () => {
  try {
    if (!mainKey) {
      const { result: data } = await getOtherWeather();
      weatherData.adCode = {
        city: data.city.City || "未知地区",
        adcode: null,
      };
      weatherData.weather = {
        weather: data.condition.day_weather,
        temperature: getTemperature(data.condition.min_degree, data.condition.max_degree),
        winddirection: data.condition.day_wind_direction,
        windpower: data.condition.day_wind_power,
      };
    } else {
      // 获取 Adcode（IP 定位偶尔返回空数组，重试一次）
      const located = (res: any) => res.infocode === "10000" && typeof res.adcode === "string";
      let adCode = await getAdcode(mainKey);
      if (!located(adCode)) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        adCode = await getAdcode(mainKey);
      }
      if (!located(adCode)) {
        throw new Error("地区查询失败");
      }
      weatherData.adCode = {
        city: adCode.city,
        adcode: adCode.adcode,
      };
      // 获取天气信息
      const result = await getWeather(mainKey, adCode.adcode);
      const live = result.lives?.[0];
      if (!live) throw new Error("天气查询失败");
      weatherData.weather = {
        weather: live.weather,
        temperature: live.temperature,
        winddirection: live.winddirection,
        windpower: live.windpower,
      };
    }
  } catch (error) {
    console.error("天气信息获取失败:", error);
    ElMessage({
      message: "天气信息获取失败",
      icon: h(ErrorIcon, { theme: "filled", fill: "#efefef" }),
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getWeatherData();
});
</script>
