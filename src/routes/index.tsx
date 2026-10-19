import { createFileRoute } from "@tanstack/react-router";
import { Fragment, createContext, useContext, useEffect, useRef, useState } from "react";
import wave from "@/assets/wave.jpg";
import laptop from "@/assets/laptop.jpg";
import { LANGS, type Dict } from "@/lib/i18n";
import { CONTENT, type Content } from "@/lib/i18n-content";
import f1 from "@/assets/server-premium.jpg";
import f2 from "@/assets/globe-premium.jpg";
import f3 from "@/assets/devices-premium.jpg";
import f4 from "@/assets/f4.jpg";
import { PLANS, formatPrice, planPrice } from "@/lib/pricing";
import { Workflow } from "@/components/workflow";

type TT = Dict & Content;
const T = createContext<TT>({ ...LANGS["ru"]!.d, ...CONTENT["ru"]! });
const useT = () => useContext(T);

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transition-all duration-700 ease-out ${on ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}>{children}</div>;
}

const DISCORD = "https://discord.gg/6DsXVJkEJw";
const TITLE = "Cfg — Рабочие VPN конфиги";
const DESC = "Свежие VPN конфиги VLESS, WireGuard, Shadowsocks и Outline. Обход блокировок за секунды. Присоединяйся к нашему Discord.";

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
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
      <path d="M6 22 L14 8" /><path d="M11 25 L21 7" /><path d="M17 26 L26 10" />
    </svg>
  );
}

const Btn = ({ href, children, light }: { href: string; children: React.ReactNode; light?: boolean }) => (
  <a
    href={href}
    target={href.startsWith("http") ? "_blank" : undefined}
    rel="noreferrer"
    className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-3 text-[15px] font-medium transition-colors ${
      light ? "bg-primary text-primary-foreground hover:bg-primary/85" : "bg-secondary text-secondary-foreground hover:bg-accent"
    }`}
  >
    {children}
  </a>
);

function DiscordLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label="Discord" role="img">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, big = false, raf = 0;
    const move = (e: PointerEvent) => { x = e.clientX; y = e.clientY; big = !!(e.target as HTMLElement).closest("a,button,select,summary"); };
    const loop = () => {
      rx += (x - rx) * 0.15; ry += (y - ry) * 0.15;
      if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%) scale(${big ? 1.8 : 1})`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", move); loop();
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); document.documentElement.classList.remove("has-cursor"); };
  }, []);
  return (
    <>
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-9 w-9 rounded-full border border-foreground/60 transition-[width,height] duration-300 [.has-cursor_&]:block" style={{ transitionProperty: "none" }} />
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-1.5 w-1.5 rounded-full bg-foreground [.has-cursor_&]:block" />
    </>
  );
}

function Nav() {
  const t = useT();
  const ids = ["Продукт", "Протоколы", "Скачать", "Тарифы", "Сообщество"];
  return (
    <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
      <div className="flex items-center gap-10">
        <a href="/" className="text-foreground"><Logo /></a>
        <nav className="hidden gap-8 text-sm font-medium md:flex">
          {ids.map((i, k) => (
            <a key={i} href={i === "Сообщество" ? DISCORD : `#${i}`} className="text-foreground/90 transition-colors hover:text-foreground">
              {t.nav[k]} <span className="text-muted-foreground">⌄</span>
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <a href={DISCORD} target="_blank" rel="noreferrer" className="hidden rounded-xl bg-secondary px-4 py-2 text-sm font-semibold sm:inline-block">{t.login} ⌄</a>
        <a href={DISCORD} target="_blank" rel="noreferrer" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105">{t.get} ↗</a>
      </div>
    </header>
  );
}

const feats = (t: TT) => [
  { id: "Продукт", t: t.f1t, d: t.f1d, img: f1, tags: t.f1tags.split("|") },
  { id: "Протоколы", t: t.f2t, d: t.f2d, img: f2, tags: ["VLESS Reality", "WireGuard", "Shadowsocks", "Hysteria2"] },
  { id: "Скачать", t: t.f3t, d: t.f3d, img: f3, tags: ["Android", "iOS", "Windows", "macOS"] },
  { id: "Discord", t: t.f4t, d: t.f4d, img: f4, tags: ["#free-configs", "#premium", "#support", "24/7"] },
];

function Visual({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="vpn-visual group relative overflow-hidden rounded-2xl bg-card">
      <img src={src} alt={alt} width={1024} height={768} loading="lazy" className="vpn-visual-image aspect-[4/3] w-full object-cover" />
    </div>
  );
}

const mkPlans = (t: TT) => [
  { n: PLANS[0].name, m: PLANS[0].monthly, d: t.pd1, f: ["VLESS, Shadowsocks", `5 ${t.s3}`, "50 Mbps", t.comm] },
  { n: PLANS[1].name, m: PLANS[1].monthly, d: t.pd2, f: [t.allProto, `40+ ${t.s3}`, "1 Gbps", `${t.s4} 24/7`, t.autoCheck] },
  { n: PLANS[2].name, m: PLANS[2].monthly, d: t.pd3, f: [t.allPro.replace(/Pro/g, "Plus"), `5 ${t.devices}`, t.dedIp, `${t.s4} 24/7`], hot: true },
];

function Pricing() {
  const t = useT();
  const [year, setYear] = useState(false);
  return (
    <section id="Тарифы" className="mx-auto max-w-6xl px-5 py-24">
      <Reveal className="text-center">
        <div className="text-sm font-medium text-muted-foreground">{t.plans}</div>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">{t.pricing}</h2>
        <div className="mx-auto mt-8 inline-flex rounded-xl border border-border bg-secondary p-1 text-sm font-medium">
          {[false, true].map((y) => (
            <button key={String(y)} onClick={() => setYear(y)} className={`rounded-lg px-5 py-2 transition-all duration-300 ${year === y ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>
              {y ? t.yearly : t.monthly}{y && <span className={`ml-2 rounded-md px-1.5 py-0.5 text-[11px] ${year ? "bg-background/15" : "bg-online/20 text-online"}`}>-20%</span>}
            </button>
          ))}
        </div>
      </Reveal>
      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {mkPlans(t).map((p, i) => {
           const price = planPrice(p.m, year);
          return (
            <Reveal key={p.n} delay={i * 120}>
              <div data-plan={p.n} className={`pricing-card group relative flex h-full flex-col rounded-2xl border p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-neon ${p.hot ? "pricing-card-pro border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold">{p.n}</div>
                  {p.hot && <span className="rounded-full bg-primary-foreground px-3 py-1 text-[11px] font-bold tracking-wider text-primary">{t.popular}</span>}
                </div>
                <p className={`mt-2 text-sm ${p.hot ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{p.d}</p>
                <div className="mt-6 flex items-end gap-1">
                  <span key={price} className="animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap text-5xl font-semibold duration-300">{formatPrice(price)}</span>
                  <span className={`mb-1.5 text-sm ${p.hot ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{t.perMonth}</span>
                </div>
                <a href={DISCORD} target="_blank" rel="noreferrer" className={`mt-6 block rounded-xl py-3 text-center text-sm font-semibold transition-all duration-300 ${p.hot ? "bg-primary-foreground text-primary hover:opacity-90" : "bg-secondary group-hover:bg-primary group-hover:text-primary-foreground"}`}>{t.buy}</a>
                <div className={`my-6 h-px ${p.hot ? "bg-primary-foreground/15" : "bg-border"}`} />
                <ul className="space-y-3 text-sm">{p.f.map((x) => <li key={x} className="flex items-center gap-3"><span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${p.hot ? "bg-primary-foreground/10" : "bg-accent"}`}>✓</span>{x}</li>)}</ul>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

type Cell = boolean | string;
const mkCmp = (t: TT): { g: string; rows: [string, Cell, Cell, Cell][] }[] => [
  { g: t.nav[1] ?? "", rows: [["VLESS Reality", true, false, false], ["WireGuard", true, true, false], ["Hysteria2", true, false, false], ["DPI bypass", true, false, false]] },
  { g: t.speed, rows: [[t.maxSpeed, "1 Gbps", "100 Mbps", "20 Mbps"], [t.s2, "<30 ms", "~80 ms", "~150 ms"], [t.s3, "40+", "10", "3"]] },
  { g: t.access, rows: [[t.noLogs, true, true, false], [t.autoCheck, true, false, false], [`${t.s4} 24/7`, true, false, false]] },
];

const Mark = ({ v }: { v: Cell }) =>
  typeof v === "string" ? <span className="font-semibold">{v}</span> : v ? (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">✓</span>
  ) : (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-muted-foreground">✕</span>
  );

function Compare() {
  const t = useT();
  return (
    <section className="mx-auto max-w-5xl px-5 py-20">
      <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">{t.cmpT}</h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">{t.cmpS}</p>
      <div className="mt-12 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th />
              <th className="relative bg-muted px-4 py-6"><div className="flex flex-col items-center gap-2"><Logo />Cfg</div></th>
              <th className="px-4 py-6 font-medium text-muted-foreground">{t.ordVpn}</th>
              <th className="px-4 py-6 font-medium text-muted-foreground">{t.freeProxy}</th>
            </tr>
          </thead>
          <tbody>
            {mkCmp(t).map((g) => (
              <Fragment key={g.g}>
                <tr className="border-b border-border bg-accent/40"><td colSpan={4} className="px-5 py-3 font-semibold">{g.g}</td></tr>
                {g.rows.map(([l, a, b, c]) => (
                  <tr key={l} className="border-b border-border last:border-0">
                    <td className="px-5 py-4 text-muted-foreground">{l}</td>
                    <td className="bg-muted px-4 py-4 text-center"><Mark v={a} /></td>
                    <td className="px-4 py-4 text-center"><Mark v={b} /></td>
                    <td className="px-4 py-4 text-center"><Mark v={c} /></td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Faq() {
  const t = useT();
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">{t.faq}</h2>
      <div className="mt-10 space-y-3">
        {[[t.q1, t.a1], [t.q2, t.a2], [t.q3, t.a3], [t.q4, t.a4]].map(([q, a]) => (
          <details key={q} className="group rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:border-neon/40">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
              {q}<span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

const langs = ["English", "Русский", "Español", "Deutsch", "Français", "Português", "Italiano", "Türkçe", "Polski", "Українська", "Қазақша", "O'zbekcha", "العربية", "हिन्दी", "Bahasa Indonesia", "Tiếng Việt", "ไทย", "日本語", "한국어", "中文"];

function LangSwitcher({ lang, setLang }: { lang: string; setLang: (l: string) => void }) {
  return (
    <div className="mx-auto mt-8 flex max-w-6xl justify-center sm:justify-end">
      <label className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-sm transition-colors hover:border-foreground/30">
        <span aria-hidden>🌐</span>
        <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value)} className="cursor-pointer bg-transparent text-foreground outline-none">
          {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k} className="bg-card">{v.name}</option>)}
        </select>
      </label>
    </div>
  );
}

function Index() {
  const [cookie, setCookie] = useState(true);
  const [lang, setLangState] = useState("ru");
  useEffect(() => { const l = localStorage.getItem("lang"); if (l && LANGS[l]) setLangState(l); }, []);
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = LANGS[lang]?.rtl ? "rtl" : "ltr"; }, [lang]);
  const setLang = (l: string) => { setLangState(l); localStorage.setItem("lang", l); };
  const t: TT = { ...(LANGS[lang] ?? LANGS["ru"]!).d, ...(CONTENT[lang] ?? CONTENT["ru"]!) };
  return (
    <T.Provider value={t}>
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Cursor />
      <div className="relative overflow-hidden">
        <img src={wave} alt="" width={1920} height={1088} className="pointer-events-none absolute inset-x-0 top-0 h-[900px] w-full object-cover opacity-80" />
        <div className="absolute inset-x-0 top-[600px] h-[300px] bg-gradient-to-b from-transparent to-background" />
        <Nav />
        <section className="relative z-10 px-5 pt-16 text-center sm:pt-24">
          <h1 key={lang} className="animate-in fade-in slide-in-from-bottom-4 text-5xl font-semibold tracking-tight duration-700 sm:text-7xl">{t.h1}</h1>
          <p className="mx-auto mt-5 max-w-xl animate-in fade-in text-base text-foreground/80 duration-1000 sm:text-lg">{t.sub}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Btn href={DISCORD} light>{t.join}</Btn>
            <Btn href="#Тарифы">{t.plans}</Btn>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">{t.terms} <a href={DISCORD} className="underline">{t.termsLink}</a>.</p>
          <div className="mx-auto mt-14 max-w-5xl animate-in fade-in zoom-in-95 duration-1000"><img src={laptop} alt="Cfg VPN" width={1600} height={1008} className="animate-float w-full [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_75%)]" /></div>
        </section>
      </div>

      <section className="relative z-10 border-y border-border bg-background px-5 py-14 text-center">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          {[["99.9%", t.s1], ["<30 ms", t.s2], ["40+", t.s3], ["24/7", t.s4]].map(([a, b]) => (
            <div key={b}><div className="text-3xl font-semibold">{a}</div><div className="mt-1 text-sm text-muted-foreground">{b}</div></div>
          ))}
        </div>
      </section>

      {feats(t).map((f, i) => (
        <section key={f.id} id={f.id} className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-2">
          <Reveal className={i % 2 ? "md:order-2" : ""}>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{f.t}</h2>
            <p className="mt-4 text-muted-foreground">{f.d}</p>
            <ul className="mt-6 grid grid-cols-2 gap-2 text-sm">
              {f.tags.map((x) => <li key={x} className="flex items-center gap-2"><span className="text-muted-foreground">✓</span>{x}</li>)}
            </ul>
          </Reveal>
          <Reveal delay={150}><Visual src={f.img} alt={f.t} /></Reveal>
        </section>
      ))}

      <Reveal><Workflow lang={lang} /></Reveal>
      <Pricing />
      <Compare />
      <Faq />

      <section className="px-5 py-24">
        <Reveal>
          <div className="discord-join relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-discord px-6 py-16 text-center text-discord-foreground shadow-discord">
            <DiscordLogo className="animate-float mx-auto h-20 w-20 sm:h-24 sm:w-24" />
            <h2 className="relative mt-6 text-4xl font-bold tracking-tight sm:text-6xl">{t.community}</h2>
            <p className="relative mx-auto mt-4 max-w-md text-base font-medium text-discord-foreground/90 sm:text-lg">{t.communityDesc}</p>
            <a href={DISCORD} target="_blank" rel="noreferrer" className="discord-join-link relative mt-8 inline-flex items-center gap-2 rounded-xl bg-discord-foreground px-7 py-3.5 text-[15px] font-semibold text-discord transition-transform duration-300 hover:scale-105">
              <DiscordLogo className="h-5 w-5" />{t.open}
            </a>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2 text-foreground"><Logo /> Cfg</div>
          <span>© 2026 Cfg. {t.rights}</span>
          <a href={DISCORD} target="_blank" rel="noreferrer" className="hover:text-foreground">Discord</a>
        </div>
        <LangSwitcher lang={lang} setLang={setLang} />
      </footer>

      {cookie && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-4 border-t border-border bg-card/95 p-5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div><div className="font-medium">{t.cookieT}</div><p className="text-sm text-muted-foreground">{t.cookieD}</p></div>
          <div className="flex gap-2">
            <button onClick={() => setCookie(false)} className="rounded-full bg-accent px-4 py-2 text-sm">{t.necessary}</button>
            <button onClick={() => setCookie(false)} className="rounded-full bg-accent px-4 py-2 text-sm">{t.acceptAll}</button>
          </div>
        </div>
      )}
    </div>
    </T.Provider>
  );
}
