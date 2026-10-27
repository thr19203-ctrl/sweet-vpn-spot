import { createFileRoute } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import wave from "@/assets/wave.jpg";
import laptop from "@/assets/laptop.jpg";
import { LANGS, readStoredLang, storeLang, type Dict } from "@/lib/i18n";
import { CONTENT, type Content } from "@/lib/i18n-content";
import f1 from "@/assets/server-premium.jpg";
import f2 from "@/assets/globe-premium.jpg";
import f3 from "@/assets/devices-premium.jpg";
import { Button } from "@/components/ui/button";
import { PLANS, formatPrice, planPrice } from "@/lib/pricing";
import { Workflow } from "@/components/workflow";
import { Headphones } from "lucide-react";

type TT = Dict & Content;
const T = createContext<TT | null>(null);
const useT = () => {
  const value = useContext(T);
  if (!value) throw new Error("Cfg translations are unavailable");
  return value;
};

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Without IntersectionObserver the reveal would never fire and the whole
    // section would stay at opacity 0, so render it immediately instead.
    if (typeof IntersectionObserver === "undefined") {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${on ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

const PRICING = "#Тарифы";
const TITLE = "Cfg — Рабочие VPN конфиги";
const DESC =
  "Свежие VPN конфиги VLESS, WireGuard, Shadowsocks и Outline. Обход блокировок за секунды. Выбери тариф и узнай, как настроить подключение.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Logo() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
    >
      <path d="M6 22 L14 8" />
      <path d="M11 25 L21 7" />
      <path d="M17 26 L26 10" />
    </svg>
  );
}

const Btn = ({ href, children, light }: { href: string; children: ReactNode; light?: boolean }) => (
  <Button
    asChild
    variant={light ? "default" : "secondary"}
    className="h-auto rounded-xl px-5 py-3 text-[15px]"
  >
    <a href={href}>{children}</a>
  </Button>
);

function Nav() {
  const t = useT();
  const items = [
    { id: "Продукт", label: t.nav[0] ?? "Product" },
    { id: "Протоколы", label: t.nav[1] ?? "Protocols" },
    { id: "Скачать", label: t.nav[2] ?? "Download" },
    { id: "Тарифы", label: t.nav[3] ?? "Pricing" },
    { id: "Поддержка", label: t.nav[4] ?? "Support" },
  ];
  return (
    <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
      <div className="flex items-center gap-10">
        <a
          href="/"
          aria-label="Cfg"
          className="flex items-center gap-2 text-lg font-semibold text-foreground"
        >
          <Logo />
          Cfg
        </a>
        <nav className="hidden gap-8 text-sm font-medium md:flex">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-foreground/90 transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild className="rounded-xl font-semibold transition-transform hover:scale-105">
          <a href={PRICING}>{t.get} ↗</a>
        </Button>
      </div>
    </header>
  );
}

const feats = (t: TT) => [
  { id: "Продукт", t: t.f1t, d: t.f1d, img: f1, tags: t.f1tags.split("|") },
  {
    id: "Протоколы",
    t: t.f2t,
    d: t.f2d,
    img: f2,
    tags: ["VLESS Reality", "WireGuard", "Shadowsocks", "Hysteria2"],
  },
  { id: "Скачать", t: t.f3t, d: t.f3d, img: f3, tags: ["Android", "iOS", "Windows", "macOS"] },
];

function Visual({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="vpn-visual group relative overflow-hidden rounded-lg bg-card">
      <img
        src={src}
        alt={alt}
        width={1024}
        height={768}
        loading="lazy"
        className="vpn-visual-image aspect-[4/3] w-full object-cover"
      />
    </div>
  );
}

const mkPlans = (t: TT) => [
  {
    n: PLANS[0].name,
    m: PLANS[0].monthly,
    d: t.pd2,
    f: [t.allProto, `40+ ${t.s3}`, "1 Gbps", `${t.s4} 24/7`, t.autoCheck],
  },
  {
    n: PLANS[1].name,
    m: PLANS[1].monthly,
    d: t.pd3,
    f: [t.allPro.replace(/Pro/g, "Plus"), `5 ${t.devices}`, t.dedIp, `${t.s4} 24/7`],
    hot: true,
  },
];

function Pricing() {
  const t = useT();
  const [year, setYear] = useState(false);
  return (
    <section id="Тарифы" className="mx-auto max-w-4xl px-5 py-20">
      <Reveal className="text-center">
        <div className="text-sm font-medium text-muted-foreground">{t.plans}</div>
        <h2 className="mt-3 text-4xl font-semibold sm:text-6xl">{t.pricing}</h2>
        <div className="mx-auto mt-8 inline-flex rounded-xl border border-border bg-secondary p-1 text-sm font-medium">
          {[false, true].map((y) => (
            <Button
              variant="ghost"
              key={String(y)}
              aria-pressed={year === y}
              onClick={() => setYear(y)}
              className={`rounded-lg px-5 py-2 transition-all duration-300 ${year === y ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
            >
              {y ? t.yearly : t.monthly}
              {y && (
                <span
                  className={`ml-2 rounded-md px-1.5 py-0.5 text-[11px] ${year ? "bg-background/15" : "bg-online/20 text-online"}`}
                >
                  -20%
                </span>
              )}
            </Button>
          ))}
        </div>
      </Reveal>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {mkPlans(t).map((p, i) => {
          const price = planPrice(p.m, year);
          return (
            <Reveal key={p.n} delay={i * 120}>
              <div
                data-plan={p.n}
                className={`pricing-card group relative flex h-full flex-col rounded-lg border p-7 transition-all duration-300 hover:-translate-y-1 ${p.hot ? "pricing-card-pro border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold">{p.n}</div>
                  {p.hot && (
                    <span className="rounded-full bg-primary-foreground px-3 py-1 text-[11px] font-bold tracking-wider text-primary">
                      {t.popular}
                    </span>
                  )}
                </div>
                <p
                  className={`mt-2 text-sm ${p.hot ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {p.d}
                </p>
                <div className="mt-6 flex items-end gap-1">
                  <span
                    key={price}
                    className="animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap text-5xl font-semibold duration-300"
                  >
                    {formatPrice(price)}
                  </span>
                  <span
                    className={`mb-1.5 text-sm ${p.hot ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {t.perMonth}
                  </span>
                </div>
                <Button
                  asChild
                  variant="secondary"
                  className={`mt-6 h-auto rounded-xl py-3 font-semibold ${p.hot ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90" : "group-hover:bg-primary group-hover:text-primary-foreground"}`}
                >
                  <a href={PRICING}>{t.buy}</a>
                </Button>
                <div className={`my-6 h-px ${p.hot ? "bg-primary-foreground/15" : "bg-border"}`} />
                <ul className="space-y-3 text-sm">
                  {p.f.map((x) => (
                    <li key={x} className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${p.hot ? "bg-primary-foreground/10" : "bg-accent"}`}
                      >
                        ✓
                      </span>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function LangSwitcher({ lang, setLang }: { lang: string; setLang: (l: string) => void }) {
  return (
    <div className="mx-auto mt-8 flex max-w-6xl justify-center sm:justify-end">
      <label className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-sm transition-colors hover:border-foreground/30">
        <span aria-hidden>🌐</span>
        <select
          aria-label="Language"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="cursor-pointer bg-transparent text-foreground outline-none"
        >
          {Object.entries(LANGS).map(([k, v]) => (
            <option key={k} value={k} className="bg-card">
              {v.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function Index() {
  const [lang, setLangState] = useState("ru");
  useEffect(() => {
    const stored = readStoredLang();
    if (stored) setLangState(stored);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGS[lang]?.rtl ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (l: string) => {
    setLangState(l);
    storeLang(l);
  };
  const dictionary = LANGS[lang] ?? LANGS["ru"];
  const content = CONTENT[lang] ?? CONTENT["ru"];
  if (!dictionary || !content) return null;
  const t: TT = { ...dictionary.d, ...content };
  return (
    <T.Provider value={t}>
      <div className="min-h-screen overflow-x-hidden bg-background">
        <div className="relative overflow-hidden">
          <img
            src={wave}
            alt=""
            width={1920}
            height={1088}
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] w-full object-cover opacity-80"
          />
          <div className="absolute inset-x-0 top-[600px] h-[300px] bg-gradient-to-b from-transparent to-background" />
          <Nav />
          <section className="relative z-10 px-5 pt-16 text-center sm:pt-24">
            <h1
              key={lang}
              className="animate-in fade-in slide-in-from-bottom-4 text-5xl font-semibold duration-700 sm:text-7xl"
            >
              {t.h1}
            </h1>
            <p className="mx-auto mt-5 max-w-xl animate-in fade-in text-base text-foreground/80 duration-1000 sm:text-lg">
              {t.sub}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Btn href={PRICING} light>
                {t.getConfig}
              </Btn>
              <Btn href="#Тарифы">{t.plans}</Btn>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              {t.terms}{" "}
              <a href="/terms" className="underline">
                {t.termsLink}
              </a>
              .
            </p>
            <div className="mx-auto mt-14 max-w-5xl animate-in fade-in zoom-in-95 duration-1000">
              <img
                src={laptop}
                alt="Cfg VPN"
                width={1600}
                height={1008}
                className="animate-float w-full [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_75%)]"
              />
            </div>
          </section>
        </div>

        {feats(t).map((f, i) => (
          <section
            key={f.id}
            id={f.id}
            className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-2"
          >
            <Reveal className={i % 2 ? "md:order-2" : ""}>
              <h2 className="text-3xl font-semibold sm:text-4xl">{f.t}</h2>
              <p className="mt-4 text-muted-foreground">{f.d}</p>
              <ul className="mt-6 grid grid-cols-2 gap-2 text-sm">
                {f.tags.map((x) => (
                  <li key={x} className="flex items-center gap-2">
                    <span className="text-muted-foreground">✓</span>
                    {x}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={150}>
              <Visual src={f.img} alt={f.t} />
            </Reveal>
          </section>
        ))}

        <Reveal>
          <Workflow lang={lang} />
        </Reveal>
        <Pricing />
        <section id="Поддержка" className="px-5 py-24">
          <Reveal>
            <div className="support-cta relative mx-auto max-w-4xl px-6 py-16 text-center text-foreground">
              <Headphones
                aria-hidden="true"
                className="animate-float mx-auto h-20 w-20 sm:h-24 sm:w-24"
              />
              <h2 className="relative mt-6 text-4xl font-bold sm:text-6xl">{t.supportT}</h2>
              <p className="relative mx-auto mb-6 mt-4 max-w-md text-base font-medium text-muted-foreground sm:text-lg">
                {t.supportD}
              </p>
              <Btn href={PRICING} light>
                {t.getConfig}
              </Btn>
            </div>
          </Reveal>
        </section>
        <div className="px-5 pb-8">
          <LangSwitcher lang={lang} setLang={setLang} />
        </div>
      </div>
    </T.Provider>
  );
}
