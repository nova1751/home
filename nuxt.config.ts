// https://nuxt.com/docs/api/configuration/nuxt-config
import pkg from "./package.json";

const env = process.env;
const siteName = env.VITE_SITE_NAME || "Home";

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

  css: ["swiper/css", "swiper/css/pagination", "~/assets/style/style.scss"],

  // 站点配置（构建时由 .env 写入）
  runtimeConfig: {
    public: {
      version: pkg.version,
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
      link: [
        { rel: "icon", href: env.VITE_SITE_LOGO },
        { rel: "apple-touch-icon", href: env.VITE_SITE_APPLE_LOGO },
        { rel: "preconnect", href: "https://s1.hdslb.com", crossorigin: "" },
        // HarmonyOS Sans
        {
          rel: "stylesheet",
          href: "https://s1.hdslb.com/bfs/static/jinkela/long/font/regular.css",
        },
        {
          rel: "preload",
          href: "/font/Pacifico-Regular.woff2",
          as: "font",
          type: "font/woff2",
          crossorigin: "",
        },
      ],
      noscript: [{ innerHTML: '<div style="text-align: center">请开启 JavaScript</div>' }],
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
      icons: [48, 72, 96, 128, 144, 192, 512].map((size) => ({
        src: `/images/icon/${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png",
      })),
    },
    workbox: {
      navigateFallback: "/",
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
      // 本站静态资源走预缓存
      globPatterns: ["**/*.{js,css,html,woff2,webp,svg}"],
      // 壁纸较大，按需加载后再由运行时缓存
      globIgnores: ["**/images/background*", "**/200.html", "**/404.html"],
      runtimeCaching: [
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
