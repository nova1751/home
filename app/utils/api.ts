export class HttpRequestError extends Error {
  constructor(public status: number) { super(`请求失败: ${status}`); }
}

// 带超时与状态检查的 JSON 请求
export const fetchJSON = async <T = any>(url: string, timeout = 8000): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new HttpRequestError(res.status);
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

function mediaUrl(value: unknown, base: URL) {
  if (typeof value !== "string" || !value.trim() || value.trimStart().startsWith("@")) return "";
  try {
    const url = new URL(value, base);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
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
  fallbackApi = "",
): Promise<Song[]> => {
  try {
    return await loadPlayerList(api, server, type, id);
  } catch (error) {
    if (!fallbackApi || (error instanceof HttpRequestError && error.status < 500)) throw error;
    return loadPlayerList(fallbackApi, server, type, id);
  }
};

async function loadPlayerList(api: string, server: string, type: string, id: string): Promise<Song[]> {
  const endpoint = new URL(api, window.location.href);
  for (const [key, value] of Object.entries({ server, type, id }))
    endpoint.searchParams.set(key, value);
  const data = await fetchJSON<unknown>(endpoint.href, 8000);
  if (!Array.isArray(data)) throw new Error("歌单接口未返回有效数据");

  const playlist: Song[] = [];
  for (const entry of data) {
    if (!entry || typeof entry !== "object") continue;
    const track = entry as Record<string, unknown>;
    const url = mediaUrl(track.url, endpoint);
    if (!url) continue;
    const name = track.name || track.title;
    const artist = track.artist || track.author;
    playlist.push({
      name: typeof name === "string" ? name : "未知歌曲",
      artist: typeof artist === "string" ? artist : "未知歌手",
      url,
      cover: mediaUrl(track.cover, endpoint) || mediaUrl(track.pic, endpoint),
      lrc: mediaUrl(track.lrc, endpoint) || "data:text/plain,",
    });
  }
  if (!playlist.length) throw new Error("歌单没有可播放的直链");
  return playlist;
}

/** Probe an API URL without downloading audio. A redirect is healthy; refusals
 * must not be bypassed. The caller supplies the trusted configured API origin. */
export async function musicServiceUnavailable(media: string, api: string) {
  try {
    const target = new URL(media, window.location.href);
    const own = new URL(api, window.location.href);
    if (target.origin !== own.origin || target.pathname !== own.pathname) return false;
    try {
      const response = await fetch(target.href, { redirect: "manual", signal: AbortSignal.timeout(8000) });
      const unavailable = response.status >= 500;
      await response.body?.cancel();
      return unavailable;
    } catch { return true; }
  } catch { return false; }
}

/**
 * 一言
 */
export const getHitokoto = () => fetchJSON("https://v1.hitokoto.cn");
