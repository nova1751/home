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
): Promise<Song[]> => {
  const endpoint = new URL(api, window.location.href);
  for (const [key, value] of Object.entries({ server, type, id }))
    endpoint.searchParams.set(key, value);
  const data = await fetchJSON<unknown>(endpoint.href, 15000);
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
};

/**
 * 一言
 */
export const getHitokoto = () => fetchJSON("https://v1.hitokoto.cn");
