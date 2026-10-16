import { createFileRoute } from "@tanstack/react-router";
import { Fragment, createContext, useContext, useEffect, useRef, useState } from "react";
import wave from "@/assets/wave.jpg";
import laptop from "@/assets/laptop.jpg";
import { LANGS, type Dict } from "@/lib/i18n";

const T = createContext<Dict>(LANGS["ru"]!.d);
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

const features = [
  { id: "Продукт", t: "Конфиги, которые просто работают.", d: "Каждый конфиг проверяется автоматически каждые 10 минут. Мёртвые серверы удаляются, новые добавляются — ты всегда получаешь только рабочее.", tags: ["Автопроверка", "Пинг в реальном времени", "Без логов", "Безлимит"] },
  { id: "Протоколы", t: "Любой протокол — в одном месте.", d: "VLESS Reality, WireGuard, Shadowsocks, Outline, Trojan и Hysteria2. Выбирай под свою сеть и обходи DPI без лишних настроек.", tags: ["VLESS Reality", "WireGuard", "Shadowsocks", "Hysteria2"] },
  { id: "Скачать", t: "Импорт в один клик на любом устройстве.", d: "Копируй ссылку, сканируй QR или скачивай файл. Подходит для v2rayNG, Hiddify, Nekobox, Streisand, Outline и WireGuard.", tags: ["Android", "iOS", "Windows", "macOS"] },
  { id: "Discord", t: "Бесплатные конфиги каждый день в Discord.", d: "Ежедневные раздачи, приватные премиум-серверы для участников и поддержка 24/7 прямо в нашем сообществе.", tags: ["Ежедневные раздачи", "Премиум", "Поддержка 24/7", "Discord"] },
];

function Visual({ i }: { i: number }) {
  const rows = [
    [["DE-Frankfurt-1", "24 ms"], ["NL-Amsterdam-2", "31 ms"], ["FI-Helsinki-1", "38 ms"], ["US-NewYork-3", "96 ms"]],
    [["vless://reality", "TCP"], ["wireguard", "UDP"], ["ss://chacha20", "TCP"], ["hysteria2", "QUIC"]],
    [["v2rayNG", "Android"], ["Streisand", "iOS"], ["Hiddify", "Windows"], ["Nekobox", "Linux"]],
    [["#free-configs", "сегодня"], ["#premium", "закрыто"], ["#support", "онлайн"], ["#news", "новое"]],
  ][i];
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      {(rows ?? []).map(([a, b]) => (
        <div key={a} className="mb-2 flex items-center justify-between rounded-xl bg-muted px-4 py-3 last:mb-0">
          <span className="flex items-center gap-2 font-mono text-sm"><span className="h-2 w-2 rounded-full bg-online" />{a}</span>
          <span className="text-xs text-muted-foreground">{b}</span>
        </div>
      ))}
    </div>
  );
}

const plans = [
  { n: "Free", m: 0, d: "Ежедневные конфиги в Discord", f: ["VLESS, Shadowsocks", "5 локаций", "До 50 Мбит/с", "Сообщество"] },
  { n: "Pro", m: 199, d: "Приватные серверы без перегрузки", f: ["Все протоколы", "40+ локаций", "До 1 Гбит/с", "Поддержка 24/7", "Автозамена конфигов"], hot: true },
  { n: "Team", m: 499, d: "До 5 устройств на одной подписке", f: ["Всё из Pro", "5 устройств", "Выделенный IP", "Приоритетная поддержка"] },
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
        {plans.map((p, i) => {
          const price = year ? Math.round(p.m * 0.8) : p.m;
          return (
            <Reveal key={p.n} delay={i * 120}>
              <div className={`group relative flex h-full flex-col rounded-3xl border p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-neon ${p.hot ? "border-foreground/25 bg-gradient-to-b from-accent to-card" : "border-border bg-card"}`}>
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold">{p.n}</div>
                  {p.hot && <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold tracking-wider text-primary-foreground">{t.popular}</span>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
                <div className="mt-6 flex items-end gap-1">
                  <span key={price} className="animate-in fade-in slide-in-from-bottom-2 text-5xl font-semibold tracking-tight duration-300">{price} ₽</span>
                  <span className="mb-1.5 text-sm text-muted-foreground">{t.perMonth}</span>
                </div>
                <a href={DISCORD} target="_blank" rel="noreferrer" className={`mt-6 block rounded-xl py-3 text-center text-sm font-semibold transition-all duration-300 ${p.hot ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-secondary group-hover:bg-primary group-hover:text-primary-foreground"}`}>{t.buy}</a>
                <div className="my-6 h-px bg-border" />
                <ul className="space-y-3 text-sm">{p.f.map((x) => <li key={x} className="flex items-center gap-3"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px]">✓</span>{x}</li>)}</ul>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

type Cell = boolean | string;
const cmp: { g: string; rows: [string, Cell, Cell, Cell][] }[] = [
  { g: "Протоколы", rows: [["VLESS Reality", true, false, false], ["WireGuard", true, true, false], ["Hysteria2", true, false, false], ["Обход DPI", true, false, false]] },
  { g: "Скорость", rows: [["Макс. скорость", "1 Гбит/с", "100 Мбит/с", "20 Мбит/с"], ["Средний пинг", "<30 мс", "~80 мс", "~150 мс"], ["Локации", "40+", "10", "3"]] },
  { g: "Доступ", rows: [["Без логов", true, true, false], ["Автопроверка", true, false, false], ["Поддержка 24/7", true, false, false]] },
];

const Mark = ({ v }: { v: Cell }) =>
  typeof v === "string" ? <span className="font-semibold">{v}</span> : v ? (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">✓</span>
  ) : (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-muted-foreground">✕</span>
  );

function Compare() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-20">
      <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">Сравни Cfg с другими VPN.</h2>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">Главное рядом: протоколы, скорость, пинг и доступ.</p>
      <div className="mt-12 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th />
              <th className="relative bg-muted px-4 py-6"><div className="flex flex-col items-center gap-2"><Logo />Cfg</div></th>
              <th className="px-4 py-6 font-medium text-muted-foreground">Обычный VPN</th>
              <th className="px-4 py-6 font-medium text-muted-foreground">Бесплатный прокси</th>
            </tr>
          </thead>
          <tbody>
            {cmp.map((g) => (
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

const faqs = [
  ["Что такое VPN конфиг?", "Это файл или ссылка с настройками сервера. Импортируешь её в приложение (v2rayNG, Hiddify, WireGuard) — и подключение готово."],
  ["Как получить бесплатный конфиг?", "Зайди в наш Discord, открой канал #free-configs и скопируй свежий конфиг. Новые выкладываются каждый день."],
  ["Как купить Pro?", "Нажми «Получить», зайди в Discord и создай тикет в #premium. Оплата картой или криптой, выдача за пару минут."],
  ["Какой протокол выбрать?", "Для обхода жёстких блокировок — VLESS Reality. Для скорости — WireGuard или Hysteria2. Не уверен — спроси в #support."],
  ["Как подключиться на iPhone?", "Установи Streisand или Hiddify из App Store, скопируй ссылку vless:// и нажми «Импорт из буфера»."],
  ["Конфиг перестал работать, что делать?", "Серверы проверяются каждые 10 минут. Возьми новый конфиг в Discord или напиши в поддержку — заменим бесплатно."],
];

function Faq() {
  const t = useT();
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">{t.faq}</h2>
      <div className="mt-10 space-y-3">
        {faqs.map(([q, a]) => (
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
  const t = (LANGS[lang] ?? LANGS["ru"]!).d;
  return (
    <T.Provider value={t}>
    <div className="min-h-screen overflow-x-hidden bg-background">
      <div className="relative">
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
          <p className="mt-5 text-xs text-muted-foreground">Используя Cfg, вы соглашаетесь с <a href={DISCORD} className="underline">Условиями использования</a>.</p>
          <div className="mx-auto mt-14 max-w-5xl animate-in fade-in zoom-in-95 duration-1000"><img src={laptop} alt="Приложение Cfg на ноутбуке" width={1600} height={1008} className="animate-float w-full [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_75%)]" /></div>
        </section>
      </div>

      <section className="border-y border-border bg-card/40 px-5 py-14 text-center">
        <p className="text-sm text-muted-foreground">Нам доверяют более 50 000 человек</p>
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          {[["99.9%", "Аптайм серверов"], ["<30мс", "Средний пинг"], ["40+", "Локаций"], ["24/7", "Поддержка"]].map(([a, b]) => (
            <div key={b}><div className="text-3xl font-semibold">{a}</div><div className="mt-1 text-sm text-muted-foreground">{b}</div></div>
          ))}
        </div>
      </section>

      {features.map((f, i) => (
        <section key={f.id} id={f.id} className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-2">
          <Reveal className={i % 2 ? "md:order-2" : ""}>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{f.t}</h2>
            <p className="mt-4 text-muted-foreground">{f.d}</p>
            <ul className="mt-6 grid grid-cols-2 gap-2 text-sm">
              {f.tags.map((t) => <li key={t} className="flex items-center gap-2"><span className="text-muted-foreground">✓</span>{t}</li>)}
            </ul>
          </Reveal>
          <Reveal delay={150}><Visual i={i} /></Reveal>
        </section>
      ))}

      <Pricing />
      <Compare />
      <Faq />

      <section className="px-5 py-24 text-center">
        <Reveal><h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">{t.community}</h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">{t.communityDesc}</p>
        <div className="mt-8"><Btn href={DISCORD} light>{t.open}</Btn></div></Reveal>
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
          <div><div className="font-medium">Мы используем cookie</div><p className="text-sm text-muted-foreground">Чтобы сайт работал стабильно и мы понимали, как его улучшить.</p></div>
          <div className="flex gap-2">
            <button onClick={() => setCookie(false)} className="rounded-full bg-accent px-4 py-2 text-sm">Только необходимые</button>
            <button onClick={() => setCookie(false)} className="rounded-full bg-accent px-4 py-2 text-sm">Принять все</button>
          </div>
        </div>
      )}
    </div>
    </T.Provider>
  );
}
