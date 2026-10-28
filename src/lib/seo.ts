import { LANGS } from "@/lib/i18n";

export const SITE_URL = "https://sweet-vpn-spot.lovable.app";
export const DEFAULT_LANG = "ru";

const RU_TITLE = "Cfg — Рабочие VPN конфиги";
const RU_DESC =
  "Свежие VPN конфиги VLESS, WireGuard, Shadowsocks и Outline. Обход блокировок за секунды. Выбери тариф и узнай, как настроить подключение.";

/** Path of the home page in a language: Russian lives at `/`, the others at `/<code>`. */
export const langPath = (lang: string) => (lang === DEFAULT_LANG ? "/" : `/${lang}`);

/** Title and description for the home page, reusing the already translated hero copy. */
export function homeMeta(lang: string): { title: string; description: string } {
  const d = LANGS[lang]?.d;
  if (lang === DEFAULT_LANG || !d) return { title: RU_TITLE, description: RU_DESC };
  return { title: `Cfg — ${d.h1}`, description: d.sub };
}

/** Head tags for the home page in `lang`: meta, canonical and hreflang alternates. */
export function homeHead(lang: string) {
  const { title, description } = homeMeta(lang);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}${langPath(lang)}` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}${langPath(lang)}` },
      ...Object.keys(LANGS).map((code) => ({
        rel: "alternate",
        hrefLang: code,
        href: `${SITE_URL}${langPath(code)}`,
      })),
      { rel: "alternate", hrefLang: "x-default", href: `${SITE_URL}${langPath(DEFAULT_LANG)}` },
    ],
  };
}
