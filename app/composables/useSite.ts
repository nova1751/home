// 站点配置（来自 .env，构建时写入）
export const useSite = () => {
  const config = useRuntimeConfig().public;

  // 站点域名拆分，如 refrain.site => ["refrain", "site"]
  const host = (config.siteUrl || "imsyy.top").replace(/^(https?:\/\/)/, "").replace(/\/.*$/, "");
  const [domainName = "", ...rest] = host.split(".");
  const domainSuffix = rest.join(".");

  // 站点完整链接
  const siteLink = config.siteUrl
    ? /^https?:\/\//.test(config.siteUrl)
      ? config.siteUrl
      : "//" + config.siteUrl
    : "https://www.imsyy.top";

  return { config, domainName, domainSuffix, siteLink };
};
