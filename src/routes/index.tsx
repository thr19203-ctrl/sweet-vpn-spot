import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import wave from "@/assets/wave.jpg";

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
  const items = ["Продукт", "Протоколы", "Скачать", "Тарифы", "Сообщество"];
  return (
    <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
      <div className="flex items-center gap-10">
        <a href="/" className="text-foreground"><Logo /></a>
        <nav className="hidden gap-8 text-sm font-medium md:flex">
          {items.map((i) => (
            <a key={i} href={i === "Сообщество" ? DISCORD : `#${i}`} className="text-foreground/90 hover:text-foreground">
              {i} <span className="text-muted-foreground">⌄</span>
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <a href={DISCORD} target="_blank" rel="noreferrer" className="hidden rounded-xl bg-secondary px-4 py-2 text-sm font-semibold sm:inline-block">Войти ⌄</a>
        <a href={DISCORD} target="_blank" rel="noreferrer" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Получить ↗</a>
      </div>
    </header>
  );
}

const cfgLines: [string, string][] = [
  ["com", "# Cfg — Германия, Франкфурт #1"],
  ["key", "[Interface]"],
  ["", "PrivateKey = "],
  ["key", "Address = 10.8.0.2/32"],
  ["", "DNS = 1.1.1.1, 8.8.8.8"],
  ["", ""],
  ["key", "[Peer]"],
  ["", "PublicKey = "],
  ["str", "Endpoint = de1.cfg.gg:51820"],
  ["", "AllowedIPs = 0.0.0.0/0, ::/0"],
  ["num", "PersistentKeepalive = 25"],
  ["", ""],
  ["com", "# vless://...@nl2.cfg.gg:443?security=reality&flow=xtls-rprx-vision"],
];
const color: Record<string, string> = { com: "text-code-com italic", key: "text-code-key", str: "text-code-str", num: "text-code-num", "": "text-foreground/90" };

function AppWindow() {
  const servers = [["🇩🇪 Германия", "12"], ["🇳🇱 Нидерланды", "9"], ["🇫🇮 Финляндия", "7"], ["🇺🇸 США", "11"], ["🇯🇵 Япония", "4"]];
  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-t-2xl border border-border bg-card/95 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 font-semibold"><Logo /> Cfg</div>
        <div className="hidden gap-5 text-muted-foreground sm:flex"><span>⌂</span><span className="text-foreground">{"</>"}</span><span>◍</span><span>⚙</span></div>
        <div className="flex gap-4 text-muted-foreground"><span>—</span><span>□</span><span>✕</span></div>
      </div>
      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-border p-4 md:block">
          <div className="mb-3 text-lg font-semibold">Серверы</div>
          <div className="mb-4 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">⌕ Поиск...</div>
          {servers.map(([n, c]) => (
            <div key={n} className="flex items-center justify-between py-2 text-sm font-medium text-foreground/90">
              <span>› {n}</span><span className="text-xs text-muted-foreground">{c}</span>
            </div>
          ))}
        </aside>
        <div className="min-w-0 flex-1 p-3">
          <div className="flex flex-wrap gap-4 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
            <span>▶ Подключить</span><span>⧉ Копировать</span><span>⬇ Скачать</span><span>▦ QR</span>
            <span className="ml-auto flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-online" />Онлайн</span>
          </div>
          <pre className="overflow-x-auto p-3 font-mono text-[13px] leading-6 sm:text-sm">
            {cfgLines.map(([t, l], i) => (
              <div key={i}><span className="mr-4 inline-block w-5 text-right text-muted-foreground">{i + 1}</span><span className={color[t]}>{l}{l.endsWith("= ") && <span className="text-code-str">●●●●●●●●●●●●●●</span>}</span></div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}

const features = [
  { id: "Продукт", t: "Конфиги, которые просто работают.", d: "Каждый конфиг проверяется автоматически каждые 10 минут. Мёртвые серверы удаляются, новые добавляются — ты всегда получаешь только рабочее.", tags: ["Автопроверка", "Пинг в реальном времени", "Без логов", "Безлимит"] },
  { id: "Протоколы", t: "Любой протокол — в одном месте.", d: "VLESS Reality, WireGuard, Shadowsocks, Outline, Trojan и Hysteria2. Выбирай под свою сеть и обходи DPI без лишних настроек.", tags: ["VLESS Reality", "WireGuard", "Shadowsocks", "Hysteria2"] },
  { id: "Скачать", t: "Импорт в один клик на любом устройстве.", d: "Копируй ссылку, сканируй QR или скачивай файл. Подходит для v2rayNG, Hiddify, Nekobox, Streisand, Outline и WireGuard.", tags: ["Android", "iOS", "Windows", "macOS"] },
  { id: "Тарифы", t: "Бесплатные конфиги каждый день в Discord.", d: "Ежедневные раздачи, приватные премиум-серверы для участников и поддержка 24/7 прямо в нашем сообществе.", tags: ["Ежедневные раздачи", "Премиум", "Поддержка 24/7", "Discord"] },
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
  { n: "Free", p: "0 ₽", d: "Ежедневные конфиги в Discord", f: ["VLESS, Shadowsocks", "5 локаций", "До 50 Мбит/с"] },
  { n: "Pro", p: "199 ₽", d: "Приватные серверы без перегрузки", f: ["Все протоколы", "40+ локаций", "До 1 Гбит/с", "Поддержка 24/7"], hot: true },
  { n: "Team", p: "499 ₽", d: "До 5 устройств на одной подписке", f: ["Всё из Pro", "5 устройств", "Выделенный IP"] },
];

function Pricing() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">Выбери свой тариф.</h2>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {plans.map((p) => (
          <div key={p.n} className={`group relative rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-neon ${p.hot ? "border-neon/50" : "border-border"}`}>
            {p.hot && <span className="absolute -top-3 right-6 rounded-md bg-primary px-3 py-1 text-xs font-bold tracking-wider text-primary-foreground">ПОПУЛЯРНЫЙ</span>}
            <div className="text-lg font-semibold">{p.n}</div>
            <div className="mt-2 text-4xl font-semibold">{p.p}<span className="text-sm text-muted-foreground"> / мес</span></div>
            <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
            <ul className="mt-6 space-y-2 text-sm">{p.f.map((x) => <li key={x}><span className="mr-2 text-online">✓</span>{x}</li>)}</ul>
            <a href={DISCORD} target="_blank" rel="noreferrer" className="mt-6 block rounded-xl bg-secondary py-3 text-center text-sm font-semibold transition-colors group-hover:bg-primary group-hover:text-primary-foreground">Получить</a>
          </div>
        ))}
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
              <>
                <tr key={g.g} className="border-b border-border bg-accent/40"><td colSpan={4} className="px-5 py-3 font-semibold">{g.g}</td></tr>
                {g.rows.map(([l, a, b, c]) => (
                  <tr key={l} className="border-b border-border last:border-0">
                    <td className="px-5 py-4 text-muted-foreground">{l}</td>
                    <td className="bg-muted px-4 py-4 text-center"><Mark v={a} /></td>
                    <td className="px-4 py-4 text-center"><Mark v={b} /></td>
                    <td className="px-4 py-4 text-center"><Mark v={c} /></td>
                  </tr>
                ))}
              </>
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
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">Частые вопросы.</h2>
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

function LangSwitcher() {
  const [lang, setLang] = useState("Русский");
  return (
    <div className="mx-auto mt-8 flex max-w-6xl justify-center sm:justify-end">
      <label className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-sm">
        <span aria-hidden>🌐</span>
        <select aria-label="Язык" value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-foreground outline-none">
          {langs.map((l) => <option key={l} value={l} className="bg-card">{l}</option>)}
        </select>
      </label>
    </div>
  );
}

function Index() {
  const [cookie, setCookie] = useState(true);
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <div className="relative">
        <img src={wave} alt="" width={1920} height={1088} className="pointer-events-none absolute inset-x-0 top-0 h-[900px] w-full object-cover opacity-80" />
        <div className="absolute inset-x-0 top-[600px] h-[300px] bg-gradient-to-b from-transparent to-background" />
        <Nav />
        <section className="relative z-10 px-5 pt-16 text-center sm:pt-24">
          <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">Обходи любые блоки.</h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-foreground/80 sm:text-lg">
            Свежие VPN конфиги для VLESS, WireGuard и Shadowsocks — проверенные, быстрые и всегда в одном месте.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Btn href={DISCORD} light>Присоединиться к Discord</Btn>
            <Btn href="#Тарифы">Тарифы</Btn>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">Используя Cfg, вы соглашаетесь с <a href={DISCORD} className="underline">Условиями использования</a>.</p>
          <div className="mt-14"><AppWindow /></div>
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
          <div className={i % 2 ? "md:order-2" : ""}>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{f.t}</h2>
            <p className="mt-4 text-muted-foreground">{f.d}</p>
            <ul className="mt-6 grid grid-cols-2 gap-2 text-sm">
              {f.tags.map((t) => <li key={t} className="flex items-center gap-2"><span className="text-muted-foreground">✓</span>{t}</li>)}
            </ul>
          </div>
          <Visual i={i} />
        </section>
      ))}

      <Pricing />
      <Compare />
      <Faq />

      <section className="px-5 py-24 text-center">
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">Присоединяйся к сообществу.</h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">Бесплатные конфиги каждый день, новости и помощь с настройкой — всё в нашем Discord.</p>
        <div className="mt-8"><Btn href={DISCORD} light>Открыть Discord ↗</Btn></div>
      </section>

      <footer className="border-t border-border px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2 text-foreground"><Logo /> Cfg</div>
          <span>© 2026 Cfg. Все права защищены.</span>
          <a href={DISCORD} target="_blank" rel="noreferrer" className="hover:text-foreground">Discord</a>
        </div>
        <LangSwitcher />
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
  );
}
