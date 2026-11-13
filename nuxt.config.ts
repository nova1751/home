// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import pkg from "./package.json";
import bgThumbs from "./app/assets/data/bgThumbs.json";

const env = process.env;
const siteName = env.VITE_SITE_NAME || "Home";

// 默认壁纸数量（public/images/background{1..N}.webp）
const BG_COUNT = bgThumbs.length;

// 在 HTML 解析阶段就选好默认壁纸：写入模糊缩略图（首帧显示），并开始下载原图，无需等待 JS 激活
// 外部壁纸接口每次返回的图片可能不同，不做预加载
const bgPreloadScript = `(function(){try{var d=JSON.parse(localStorage.getItem("data")||"{}");if(d.coverType&&d.coverType!=="0")return}catch(e){}var T=${JSON.stringify(bgThumbs)},i=Math.floor(Math.random()*T.length),u="/images/background"+(i+1)+".webp";window.__BG__=u;document.documentElement.style.setProperty("--bg-thumb",'url("'+T[i]+'")');var l=document.createElement("link");l.rel="preload";l.as="image";l.href=u;l.fetchPriority="high";document.head.appendChild(l)})()`;

export default defineNuxtConfig({
  compatibilityDate: "2026-11-01",
  ssr: true,
  devtools: { enabled: false },

  modules: [
    "@nuxt/eslint",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@element-plus/nuxt",
    "@vite-pwa/nuxt",
  ],

  css: ["~/assets/style/style.scss"],

  // 站点配置（构建时由 .env 写入）
  runtimeConfig: {
    public: {
      version: pkg.version,
      bgCount: BG_COUNT,
      author: pkg.author,
      github: pkg.github,
      home: pkg.home,
      siteName,
      siteAuthor: env.VITE_SITE_ANTHOR || "",
      siteUrl: env.VITE_SITE_URL || "",
      siteMainLogo: env.VITE_SITE_MAIN_LOGO || "",
      descHello: env.VITE_DESC_HELLO || "",
      descText: env.VITE_DESC_TEXT || "",
      descHelloOther: env.VITE_DESC_HELLO_OTHER || "",
      descTextOther: env.VITE_DESC_TEXT_OTHER || "",
      weatherKey: env.VITE_WEATHER_KEY || "",
      qweatherKey: env.VITE_QWEATHER_KEY || "",
      qweatherHost: env.VITE_QWEATHER_HOST || "",
      qweatherGeoHost: env.VITE_QWEATHER_GEO_HOST || env.VITE_QWEATHER_HOST || "",
      siteStart: env.VITE_SITE_START || "",
      siteIcp: env.VITE_SITE_ICP || "",
      songApi: env.VITE_SONG_API || "",
      songServer: env.VITE_SONG_SERVER || "netease",
      songType: env.VITE_SONG_TYPE || "playlist",
      songId: env.VITE_SONG_ID || "",
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: "zh-CN" },
      title: siteName,
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
        { name: "description", content: env.VITE_SITE_DES },
        { name: "keywords", content: env.VITE_SITE_KEYWORDS },
        { name: "author", content: env.VITE_SITE_ANTHOR },
        { name: "theme-color", content: "#424242" },
      ],
      script: [{ innerHTML: bgPreloadScript, tagPriority: "critical" }],
      link: [
        { rel: "icon", type: "image/png", sizes: "32x32", href: env.VITE_SITE_LOGO },
        { rel: "apple-touch-icon", sizes: "180x180", href: env.VITE_SITE_APPLE_LOGO },
        { rel: "preconnect", href: "https://s1.hdslb.com", crossorigin: "" },
        {
          rel: "preload",
          href: "/font/Pacifico-Regular.woff2",
          as: "font",
          type: "font/woff2",
          crossorigin: "",
        },
      ],
    },
  },

  elementPlus: {
    importStyle: "css",
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // global.scss 只放变量 / mixin，不会产生重复 CSS
          additionalData: '@use "~/assets/style/global.scss" as *;',
        },
      },
    },
  },

  hooks: {
    // 盒子、设置页和播放器等分包在用到时再加载。
    "build:manifest": (manifest) => {
      for (const file of Object.values(manifest)) {
        file.prefetch = false;
      }
    },
    "pwa:beforeBuildServiceWorker": (options) => {
      // Keep Nuxt's manifest transforms and then select the prerendered shell's resources.
      const transforms = (options.workbox.manifestTransforms ??= []);
      transforms.push(async (entries) => {
        const html = await readFile(join(options.outDir, "index.html"), "utf8");
        const required = new Set(["/", "/index.html"]);
        for (const [tag] of html.matchAll(/<(?:link|script|img)\b[^>]*>/g)) {
          if (tag.startsWith("<link") && !/\brel="(?:stylesheet|modulepreload|preload)"/.test(tag))
            continue;
          const resource = tag.match(/\s(?:src|href)="(\/[^/"][^"]*)"/)?.[1];
          if (resource) required.add(resource.split("?", 1)[0]);
        }
        return {
          manifest: entries.filter(({ url }) => required.has(`/${url.replace(/^\//, "")}`)),
          warnings: [],
        };
      });
    },
  },

  nitro: {
    prerender: {
      routes: ["/"],
      crawlLinks: false,
    },
  },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: siteName,
      short_name: siteName,
      description: env.VITE_SITE_DES,
      display: "standalone",
      start_url: "/",
      theme_color: "#424242",
      background_color: "#424242",
      icons: [
        ...[48, 72, 96, 128, 144, 192, 512].map((size) => ({
          src: `/images/icon/${size}.png`,
          sizes: `${size}x${size}`,
          type: "image/png",
        })),
        {
          src: "/images/icon/maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
      // Allow the revisioned Nuxt payload query to match the precached file.
      ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^_b$/],
      globPatterns: ["**/*.{js,css,html,woff2,webp,svg}"],
      // 壁纸较大，按需加载后再由运行时缓存
      globIgnores: ["**/images/background*", "**/200.html", "**/404.html"],
      runtimeCaching: [
        {
          urlPattern: ({ sameOrigin, url, request }) =>
            sameOrigin &&
            url.pathname.startsWith("/_nuxt/") &&
            ["script", "style"].includes(request.destination),
          handler: "CacheFirst",
          options: {
            cacheName: "nuxt-assets",
            expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
        {
          // 仅缓存同源图片，跨域壁纸接口（随机图）不缓存
          urlPattern: ({ sameOrigin, request }) => sameOrigin && request.destination === "image",
          handler: "CacheFirst",
          options: {
            cacheName: "image-cache",
            expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
        {
          // 外部字体样式
          urlPattern: /^https:\/\/s1\.hdslb\.com\/.*/,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "font-cache",
            expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 60 },
          },
        },
      ],
    },
    client: {
      installPrompt: false,
    },
  },
});
