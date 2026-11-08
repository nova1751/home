import fetchJsonp from "fetch-jsonp";

// 带超时与状态检查的 JSON 请求
export const fetchJSON = async <T = any>(url: string, timeout = 8000): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`请求失败: ${res.status} ${url}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
};

export interface Song {
  name: string;
  artist: string;
  url: string;
  cover: string;
  lrc: string;
}

/**
 * 音乐播放器
 */

// 获取音乐播放列表
export const getPlayerList = async (
  api: string,
  server: string,
  type: string,
  id: string,
): Promise<Song[]> => {
  const data = await fetchJSON<any[]>(`${api}?server=${server}&type=${type}&id=${id}`, 15000);
  if (!Array.isArray(data) || !data.length) throw new Error("歌单为空");

  const format = (v: any, url: string): Song => ({
    name: v.name || v.title,
    artist: v.artist || v.author,
    url,
    cover: v.cover || v.pic,
    lrc: v.lrc,
  });

  if (data[0].url?.startsWith("@")) {
    const url = data[0].url.split("@").slice(1)[3];
    const jsonpData = await fetchJsonp(url).then((res) => res.json());
    const sip: string[] = jsonpData.req_0.data.sip;
    const domain = (sip.find((i) => !i.startsWith("http://ws")) || sip[0]).replace(
      "http://",
      "https://",
    );
    return data.map((v, i) => format(v, domain + jsonpData.req_0.data.midurlinfo[i].purl));
  }
  return data.map((v) => format(v, v.url));
};

/**
 * 一言
 */
export const getHitokoto = () => fetchJSON("https://v1.hitokoto.cn");

/**
 * 天气
 */

// 获取高德地理位置信息
export const getAdcode = (key: string) => fetchJSON(`https://restapi.amap.com/v3/ip?key=${key}`);

// 获取高德地理天气信息
export const getWeather = (key: string, city: string) =>
  fetchJSON(`https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${city}`);

// 获取教书先生天气 API
// https://api.oioweb.cn/doc/weather/GetWeather
export const getOtherWeather = () => fetchJSON("https://api.oioweb.cn/api/weather/GetWeather");
