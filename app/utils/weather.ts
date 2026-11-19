import { HttpRequestError } from "./api";

export interface CurrentWeather {
  icon: string;
  text: string;
  temp: string;
  humidity: string;
  windDir: string;
  windScale: string;
}

interface LocalWeather {
  city: string;
  location: string;
  now: CurrentWeather;
}

const cacheKey = "home-weather-local-v3";
const cacheDuration = 10 * 60_000;

function validWeather(value: LocalWeather | null | undefined): value is LocalWeather {
  return !!value && typeof value.city === "string" && !!value.city.trim() &&
    typeof value.location === "string" && !!value.location && !!value.now &&
    ["icon", "text", "temp", "humidity", "windDir", "windScale"].every(
      (key) => typeof value.now[key as keyof CurrentWeather] === "string" &&
        !!value.now[key as keyof CurrentWeather].trim(),
    ) && Number.isFinite(Number(value.now.temp)) &&
    Number.isFinite(Number(value.now.humidity)) && Number(value.now.humidity) >= 0 &&
    Number(value.now.humidity) <= 100;
}

function readCache(): LocalWeather | undefined {
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) ?? "null") as {
      value: LocalWeather;
      expires: number;
    } | null;
    if (cached && cached.expires > Date.now() && validWeather(cached.value)) return cached.value;
  } catch {
    // 存储不可用时直接请求 Worker。
  }
}

export async function getLocalWeather(): Promise<LocalWeather> {
  const cached = readCache();
  if (cached) return cached;
  const response = await fetch("/api/weather/local", { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new HttpRequestError(response.status);
  const weather = await response.json() as LocalWeather;
  if (!validWeather(weather)) throw new Error("天气查询未返回有效数据");

  const fetchedAt = Number(response.headers.get("X-Weather-Fetched-At")) || Date.now();
  const maxAge = response.headers.get("X-Weather-Cache") === "STALE" ? 60 * 60_000 : cacheDuration;
  // 不让浏览器缓存延长 Worker 返回数据的有效期。
  const expires = Math.min(Date.now() + cacheDuration, fetchedAt + maxAge);
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ value: weather, expires }));
  } catch {
    // 存储不可用时仍显示本次查询结果。
  }
  return weather;
}
