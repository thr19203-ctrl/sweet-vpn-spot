type WorkflowCopy = { title: string; description: string; play: string };

export const WORKFLOW: Record<string, WorkflowCopy> = Object.fromEntries([
  ["en", "See the Cfg workflow.", "Configs, protocols, devices, and Discord — the Cfg experience in one place.", "See Cfg in action"],
  ["ru", "Посмотри, как работает Cfg.", "Конфиги, протоколы, устройства и Discord — всё о Cfg в одном видео.", "Посмотреть Cfg в действии"],
  ["es", "Descubre cómo funciona Cfg.", "Configs, protocolos, dispositivos y Discord — toda la experiencia Cfg en un solo lugar.", "Ver Cfg en acción"],
  ["de", "Entdecke den Cfg-Workflow.", "Configs, Protokolle, Geräte und Discord — das Cfg-Erlebnis an einem Ort.", "Cfg in Aktion sehen"],
  ["fr", "Découvrez le fonctionnement de Cfg.", "Configs, protocoles, appareils et Discord — toute l’expérience Cfg au même endroit.", "Voir Cfg en action"],
  ["pt", "Veja como o Cfg funciona.", "Configs, protocolos, dispositivos e Discord — toda a experiência Cfg em um só lugar.", "Ver Cfg em ação"],
  ["it", "Scopri come funziona Cfg.", "Config, protocolli, dispositivi e Discord — tutta l’esperienza Cfg in un unico posto.", "Guarda Cfg in azione"],
  ["tr", "Cfg iş akışını keşfet.", "Configler, protokoller, cihazlar ve Discord — Cfg deneyimi tek bir yerde.", "Cfg’yi çalışırken gör"],
  ["pl", "Zobacz, jak działa Cfg.", "Configi, protokoły, urządzenia i Discord — całe doświadczenie Cfg w jednym miejscu.", "Zobacz Cfg w akcji"],
  ["uk", "Подивись, як працює Cfg.", "Конфіги, протоколи, пристрої та Discord — усе про Cfg в одному відео.", "Переглянути Cfg у дії"],
  ["kk", "Cfg қалай жұмыс істейтінін көр.", "Конфигтер, протоколдар, құрылғылар және Discord — Cfg бір бейнеде.", "Cfg жұмысын көру"],
  ["uz", "Cfg qanday ishlashini ko‘ring.", "Konfiglar, protokollar, qurilmalar va Discord — Cfg imkoniyatlari bir joyda.", "Cfg’ni amalda ko‘rish"],
  ["ar", "شاهد كيف يعمل Cfg.", "الإعدادات والبروتوكولات والأجهزة وDiscord — تجربة Cfg في مكان واحد.", "شاهد Cfg أثناء العمل"],
  ["hi", "देखें Cfg कैसे काम करता है।", "कॉन्फ़िग, प्रोटोकॉल, डिवाइस और Discord — Cfg का अनुभव एक ही जगह।", "Cfg को काम करते देखें"],
  ["id", "Lihat alur kerja Cfg.", "Config, protokol, perangkat, dan Discord — pengalaman Cfg di satu tempat.", "Lihat Cfg beraksi"],
  ["vi", "Khám phá cách Cfg hoạt động.", "Cấu hình, giao thức, thiết bị và Discord — trải nghiệm Cfg ở một nơi.", "Xem Cfg hoạt động"],
  ["th", "ดูขั้นตอนการทำงานของ Cfg", "คอนฟิก โปรโตคอล อุปกรณ์ และ Discord — ประสบการณ์ Cfg ในที่เดียว", "ดู Cfg ทำงานจริง"],
  ["ja", "Cfgのワークフローを見る。", "設定、プロトコル、デバイス、Discord — Cfgのすべてをひとつの動画で。", "Cfgの動作を見る"],
  ["ko", "Cfg의 작업 흐름을 살펴보세요.", "설정, 프로토콜, 기기, Discord — Cfg의 모든 경험을 한곳에서.", "Cfg 실행 모습 보기"],
  ["zh", "了解 Cfg 的工作流程。", "配置、协议、设备和 Discord — 一站了解 Cfg 体验。", "观看 Cfg 实际运行"],
].map(([lang, title, description, play]) => [lang, { title, description, play }])) as Record<string, WorkflowCopy>;