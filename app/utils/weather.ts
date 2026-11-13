import { fetchJSON } from "./api";

interface Location {
  city: string;
  location: string;
  adcode?: string;
}

interface WeatherConfig {
  weatherKey: string;
  qweatherKey: string;
  qweatherHost: string;
  qweatherGeoHost: string;
}

interface CurrentWeather {
  text: string;
  temp: string;
  windDir: string;
  windScale: string;
  source?: "open-meteo";
}

const fallback: Location = { city: "杭州市", location: "120.155070,30.274085" };
const timeout = 4000;

function coordinates(longitude: unknown, latitude: unknown) {
  if (
    typeof longitude !== "number" ||
    typeof latitude !== "number" ||
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude) ||
    Math.abs(longitude) > 180 ||
    Math.abs(latitude) > 90
  ) {
    throw new Error("无效的定位坐标");
  }
  return `${longitude.toFixed(4)},${latitude.toFixed(4)}`;
}

async function locateWithAmap(key: string): Promise<Location> {
  if (!key) throw new Error("未配置高德 Key");
  const url = new URL("https://restapi.amap.com/v3/ip");
  url.searchParams.set("key", key);
  const result = await fetchJSON<{ rectangle?: unknown; city?: unknown; adcode?: string }>(
    url.href,
    timeout,
  );
  if (typeof result.rectangle !== "string") throw new Error("高德未返回定位坐标");
  const corners = result.rectangle.match(/^(-?[\d.]+),(-?[\d.]+);(-?[\d.]+),(-?[\d.]+)$/);
  if (!corners) throw new Error("高德未返回有效定位范围");
  const [west, south, east, north] = corners.slice(1).map(Number);
  return {
    city: typeof result.city === "string" ? result.city : "",
    location: coordinates((west + east) / 2, (south + north) / 2),
    adcode: typeof result.adcode === "string" ? result.adcode : undefined,
  };
}

function ipCity(result: { country?: string; region?: string; city?: string }) {
  return [result.country, result.region || result.city].filter(Boolean).join("·");
}

async function locateWithIpWho(): Promise<Location> {
  const result = await fetchJSON<{
    success?: boolean;
    longitude?: number;
    latitude?: number;
    country?: string;
    region?: string;
    city?: string;
  }>("https://ipwho.is/?fields=success,latitude,longitude,country,region,city&lang=zh", timeout);
  if (!result.success) throw new Error("ipwho 未返回定位坐标");
  return { city: ipCity(result), location: coordinates(result.longitude, result.latitude) };
}

async function locateWithIpSb(): Promise<Location> {
  const result = await fetchJSON<{
    longitude?: number;
    latitude?: number;
    country?: string;
    region?: string;
    city?: string;
  }>("https://api.ip.sb/geoip", timeout);
  return { city: ipCity(result), location: coordinates(result.longitude, result.latitude) };
}

function readCache<T>(key: string): T | undefined {
  try {
    const item = JSON.parse(localStorage.getItem(key) ?? "null") as {
      value: T;
      expires: number;
    } | null;
    if (item && item.expires > Date.now()) return item.value;
  } catch {
    // 存储不可用时直接查询。
  }
}

function writeCache<T>(key: string, value: T, minutes: number) {
  try {
    localStorage.setItem(key, JSON.stringify({ value, expires: Date.now() + minutes * 60_000 }));
  } catch {
    // 存储不可用时仍显示本次查询结果。
  }
}

function weatherUrl(host: string, path: string, key: string, location: string) {
  const url = new URL(path, `https://${host}`);
  url.search = new URLSearchParams({ location, key, lang: "zh" }).toString();
  return url.href;
}

async function resolveLocation(config: WeatherConfig): Promise<Location> {
  const cacheKey = "home-weather-location";
  const cached = readCache<Location>(cacheKey);
  if (cached?.location) return cached;

  let place = fallback;
  for (const lookup of [() => locateWithAmap(config.weatherKey), locateWithIpWho, locateWithIpSb]) {
    try {
      place = await lookup();
      break;
    } catch {
      // 与博客一致，依次尝试下一个 IP 定位来源。
    }
  }
  if (place === fallback) return fallback;

  if (config.qweatherKey && config.qweatherGeoHost && !place.adcode) {
    try {
      const result = await fetchJSON<{
        code: string;
        location?: { country: string; adm1: string; adm2: string; name: string }[];
      }>(
        weatherUrl(config.qweatherGeoHost, "/v2/city/lookup", config.qweatherKey, place.location) +
          "&number=1",
        timeout,
      );
      const city = result.location?.[0];
      if (result.code === "200" && city) {
        place.city =
          city.country === "中国"
            ? city.adm2 || city.name
            : `${city.country}·${city.adm1 || city.name}`;
      }
    } catch {
      // 城市名称获取失败时仍可使用坐标查询天气。
    }
  }

  if (place.city) writeCache(cacheKey, place, 360);
  return place;
}

const weatherLabels: Record<number, string> = {
  0: "晴",
  1: "大部晴朗",
  2: "多云",
  3: "阴",
  45: "雾",
  48: "雾",
  51: "毛毛雨",
  53: "毛毛雨",
  55: "毛毛雨",
  56: "冻雨",
  57: "冻雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  66: "冻雨",
  67: "冻雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  77: "雪粒",
  80: "阵雨",
  81: "阵雨",
  82: "强阵雨",
  85: "阵雪",
  86: "强阵雪",
  95: "雷雨",
  96: "雷雨伴冰雹",
  99: "雷雨伴冰雹",
};

async function getOpenMeteoWeather(location: string): Promise<CurrentWeather> {
  const [longitude, latitude] = location.split(",");
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    longitude,
    latitude,
    current: "temperature_2m,weather_code,wind_speed_10m,wind_direction_10m",
    wind_speed_unit: "ms",
  }).toString();
  const { current } = await fetchJSON<{
    current?: {
      temperature_2m: number;
      weather_code: number;
      wind_speed_10m: number;
      wind_direction_10m: number;
    };
  }>(url.href, timeout);
  if (!current || !Number.isFinite(current.temperature_2m)) throw new Error("实时天气查询失败");
  const directions = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
  const windDir = directions[Math.round(current.wind_direction_10m / 45) % 8] || "";
  const thresholds = [0.3, 1.6, 3.4, 5.5, 8, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7];
  const windScale = Number.isFinite(current.wind_speed_10m)
    ? String(thresholds.filter((speed) => current.wind_speed_10m >= speed).length)
    : "";
  return {
    text: weatherLabels[current.weather_code] || "天气未知",
    temp: String(Math.round(current.temperature_2m)),
    windDir,
    windScale,
    source: "open-meteo",
  };
}

async function loadCurrentWeather(config: WeatherConfig, place: Location): Promise<CurrentWeather> {
  try {
    if (config.qweatherKey && config.qweatherHost) {
      const result = await fetchJSON<{ code: string; now?: CurrentWeather }>(
        weatherUrl(config.qweatherHost, "/v7/weather/now", config.qweatherKey, place.location),
        timeout,
      );
      if (result.code === "200" && result.now?.text) return result.now;
    }
    const adcode = place.adcode || (place === fallback ? "330100" : "");
    if (config.weatherKey && adcode) {
      const url = new URL("https://restapi.amap.com/v3/weather/weatherInfo");
      url.search = new URLSearchParams({ key: config.weatherKey, city: adcode }).toString();
      const result = await fetchJSON<{
        lives?: {
          weather: string;
          temperature: string;
          winddirection: string;
          windpower: string;
        }[];
      }>(url.href, timeout);
      const live = result.lives?.[0];
      if (live?.weather) {
        return {
          text: live.weather,
          temp: live.temperature,
          windDir: live.winddirection,
          windScale: live.windpower,
        };
      }
    }
  } catch {
    // 首选服务失败时按同一坐标请求天气。
  }
  return getOpenMeteoWeather(place.location);
}

export async function getLocalWeather(config: WeatherConfig) {
  const place = await resolveLocation(config);
  const cacheKey = "home-weather-current";
  const cached = readCache<{ location: string; now: CurrentWeather }>(cacheKey);
  if (cached?.location === place.location && cached.now?.text) {
    return { city: place.city || "未知地区", now: cached.now };
  }
  const now = await loadCurrentWeather(config, place);
  writeCache(cacheKey, { location: place.location, now }, 30);
  return { city: place.city || "未知地区", now };
}
