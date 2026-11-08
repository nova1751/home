import cursorInit from "~/utils/cursor";

// 仅客户端运行的全局交互
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", () => {
    const store = useMainStore();
    const config = useRuntimeConfig().public;

    // 自定义鼠标
    cursorInit();

    // 屏蔽右键
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      ElMessage({ message: "为了浏览体验，本站禁用右键", grouping: true, duration: 2000 });
    });

    // 鼠标中键切换壁纸展示
    window.addEventListener("mousedown", (event) => {
      if (event.button !== 1) return;
      event.preventDefault();
      store.backgroundShow = !store.backgroundShow;
      ElMessage({
        message: `已${store.backgroundShow ? "开启" : "退出"}壁纸展示状态`,
        grouping: true,
      });
    });

    // PWA 更新提醒
    navigator.serviceWorker?.addEventListener("controllerchange", () => {
      ElMessage("站点已更新，刷新后生效");
    });

    // 控制台输出
    const styleTitle1 = "font-size: 20px;font-weight: 600;color: rgb(73, 177, 245);";
    const styleTitle2 = "font-size:12px;color: rgb(73, 177, 245);";
    const styleContent = "color: rgb(30,152,255);";
    const title1 = config.siteName;
    const title2 = `

███╗   ██╗ ██████╗ ██╗   ██╗ █████╗  ██╗███████╗███████╗ ██╗
████╗  ██║██╔═══██╗██║   ██║██╔══██╗███║╚════██║██╔════╝███║
██╔██╗ ██║██║   ██║██║   ██║███████║╚██║    ██╔╝███████╗╚██║
██║╚██╗██║██║   ██║╚██╗ ██╔╝██╔══██║ ██║   ██╔╝ ╚════██║ ██║
██║ ╚████║╚██████╔╝ ╚████╔╝ ██║  ██║ ██║   ██║  ███████║ ██║
╚═╝  ╚═══╝ ╚═════╝   ╚═══╝  ╚═╝  ╚═╝ ╚═╝   ╚═╝  ╚══════╝ ╚═╝
                                                            `;
    const content = `\n\n版本: ${config.version}\n主页: ${config.home}\nGithub: ${config.github}`;
    console.info(`%c${title1} %c${title2} %c${content}`, styleTitle1, styleTitle2, styleContent);
  });
});
