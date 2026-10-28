// Copy for the 404 and error screens. English is the server-rendered default; the visitor's
// stored language is applied after mount (same approach as the home page).
export type UiMessages = {
  notFoundTitle: string;
  notFoundText: string;
  goHome: string;
  errorTitle: string;
  errorText: string;
  tryAgain: string;
};

export const UI_MESSAGES: Record<string, UiMessages> = {
  en: {
    notFoundTitle: "Page not found",
    notFoundText: "The page you're looking for doesn't exist or has been moved.",
    goHome: "Go home",
    errorTitle: "This page didn't load",
    errorText: "Something went wrong on our end. You can try refreshing or head back home.",
    tryAgain: "Try again",
  },
  ru: {
    notFoundTitle: "Страница не найдена",
    notFoundText: "Такой страницы не существует или она была перемещена.",
    goHome: "На главную",
    errorTitle: "Страница не загрузилась",
    errorText:
      "На нашей стороне что-то пошло не так. Попробуйте обновить страницу или вернуться на главную.",
    tryAgain: "Повторить",
  },
  es: {
    notFoundTitle: "Página no encontrada",
    notFoundText: "La página que buscas no existe o se ha movido.",
    goHome: "Ir al inicio",
    errorTitle: "Esta página no se cargó",
    errorText: "Algo salió mal por nuestra parte. Prueba a actualizar o vuelve al inicio.",
    tryAgain: "Reintentar",
  },
  de: {
    notFoundTitle: "Seite nicht gefunden",
    notFoundText: "Die gesuchte Seite existiert nicht oder wurde verschoben.",
    goHome: "Zur Startseite",
    errorTitle: "Diese Seite konnte nicht geladen werden",
    errorText:
      "Bei uns ist etwas schiefgelaufen. Lade die Seite neu oder kehre zur Startseite zurück.",
    tryAgain: "Erneut versuchen",
  },
  fr: {
    notFoundTitle: "Page introuvable",
    notFoundText: "La page que vous cherchez n'existe pas ou a été déplacée.",
    goHome: "Retour à l'accueil",
    errorTitle: "Cette page ne s'est pas chargée",
    errorText:
      "Une erreur s'est produite de notre côté. Essayez d'actualiser ou retournez à l'accueil.",
    tryAgain: "Réessayer",
  },
  pt: {
    notFoundTitle: "Página não encontrada",
    notFoundText: "A página que você procura não existe ou foi movida.",
    goHome: "Ir para o início",
    errorTitle: "Esta página não carregou",
    errorText: "Algo deu errado do nosso lado. Tente atualizar ou volte ao início.",
    tryAgain: "Tentar novamente",
  },
  it: {
    notFoundTitle: "Pagina non trovata",
    notFoundText: "La pagina che cerchi non esiste o è stata spostata.",
    goHome: "Vai alla home",
    errorTitle: "Questa pagina non si è caricata",
    errorText: "Qualcosa è andato storto da parte nostra. Prova ad aggiornare o torna alla home.",
    tryAgain: "Riprova",
  },
  tr: {
    notFoundTitle: "Sayfa bulunamadı",
    notFoundText: "Aradığınız sayfa mevcut değil veya taşınmış.",
    goHome: "Ana sayfaya git",
    errorTitle: "Bu sayfa yüklenemedi",
    errorText:
      "Bizim tarafımızda bir sorun oluştu. Sayfayı yenilemeyi deneyin veya ana sayfaya dönün.",
    tryAgain: "Tekrar dene",
  },
  pl: {
    notFoundTitle: "Nie znaleziono strony",
    notFoundText: "Strona, której szukasz, nie istnieje lub została przeniesiona.",
    goHome: "Wróć na stronę główną",
    errorTitle: "Ta strona się nie załadowała",
    errorText:
      "Po naszej stronie coś poszło nie tak. Spróbuj odświeżyć stronę lub wróć na stronę główną.",
    tryAgain: "Spróbuj ponownie",
  },
  uk: {
    notFoundTitle: "Сторінку не знайдено",
    notFoundText: "Такої сторінки не існує або її було переміщено.",
    goHome: "На головну",
    errorTitle: "Сторінка не завантажилась",
    errorText:
      "З нашого боку щось пішло не так. Спробуйте оновити сторінку або повернутися на головну.",
    tryAgain: "Спробувати ще раз",
  },
  kk: {
    notFoundTitle: "Бет табылмады",
    notFoundText: "Сіз іздеген бет жоқ немесе басқа жерге көшірілген.",
    goHome: "Басты бетке",
    errorTitle: "Бет жүктелмеді",
    errorText:
      "Біздің тарапта бір нәрсе дұрыс болмады. Бетті жаңартып көріңіз немесе басты бетке оралыңыз.",
    tryAgain: "Қайталау",
  },
  uz: {
    notFoundTitle: "Sahifa topilmadi",
    notFoundText: "Siz izlayotgan sahifa mavjud emas yoki ko'chirilgan.",
    goHome: "Bosh sahifaga",
    errorTitle: "Sahifa yuklanmadi",
    errorText:
      "Bizning tomonda nimadir xato ketdi. Sahifani yangilab ko'ring yoki bosh sahifaga qayting.",
    tryAgain: "Qayta urinish",
  },
  ar: {
    notFoundTitle: "الصفحة غير موجودة",
    notFoundText: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    goHome: "العودة إلى الرئيسية",
    errorTitle: "تعذّر تحميل هذه الصفحة",
    errorText: "حدث خطأ من جانبنا. جرّب تحديث الصفحة أو العودة إلى الصفحة الرئيسية.",
    tryAgain: "حاول مرة أخرى",
  },
  hi: {
    notFoundTitle: "पेज नहीं मिला",
    notFoundText: "आप जो पेज खोज रहे हैं वह मौजूद नहीं है या उसे हटा दिया गया है।",
    goHome: "होम पर जाएँ",
    errorTitle: "यह पेज लोड नहीं हुआ",
    errorText: "हमारी ओर से कुछ गड़बड़ हो गई। पेज को रीफ़्रेश करके देखें या होम पर लौट जाएँ।",
    tryAgain: "फिर से कोशिश करें",
  },
  id: {
    notFoundTitle: "Halaman tidak ditemukan",
    notFoundText: "Halaman yang Anda cari tidak ada atau telah dipindahkan.",
    goHome: "Ke beranda",
    errorTitle: "Halaman ini gagal dimuat",
    errorText: "Terjadi masalah di sisi kami. Coba muat ulang halaman atau kembali ke beranda.",
    tryAgain: "Coba lagi",
  },
  vi: {
    notFoundTitle: "Không tìm thấy trang",
    notFoundText: "Trang bạn tìm không tồn tại hoặc đã được di chuyển.",
    goHome: "Về trang chủ",
    errorTitle: "Không tải được trang này",
    errorText: "Đã có sự cố từ phía chúng tôi. Hãy thử tải lại trang hoặc quay về trang chủ.",
    tryAgain: "Thử lại",
  },
  th: {
    notFoundTitle: "ไม่พบหน้านี้",
    notFoundText: "หน้าที่คุณกำลังหาไม่มีอยู่หรือถูกย้ายไปแล้ว",
    goHome: "กลับหน้าแรก",
    errorTitle: "โหลดหน้านี้ไม่สำเร็จ",
    errorText: "เกิดข้อผิดพลาดจากฝั่งเรา ลองรีเฟรชหน้านี้หรือกลับไปหน้าแรก",
    tryAgain: "ลองอีกครั้ง",
  },
  ja: {
    notFoundTitle: "ページが見つかりません",
    notFoundText: "お探しのページは存在しないか、移動されました。",
    goHome: "ホームへ戻る",
    errorTitle: "このページを読み込めませんでした",
    errorText: "こちら側で問題が発生しました。ページを再読み込みするか、ホームに戻ってください。",
    tryAgain: "再試行",
  },
  ko: {
    notFoundTitle: "페이지를 찾을 수 없습니다",
    notFoundText: "찾으시는 페이지가 없거나 이동되었습니다.",
    goHome: "홈으로 가기",
    errorTitle: "이 페이지를 불러오지 못했습니다",
    errorText: "저희 쪽에서 문제가 발생했습니다. 새로고침하거나 홈으로 돌아가 주세요.",
    tryAgain: "다시 시도",
  },
  zh: {
    notFoundTitle: "页面未找到",
    notFoundText: "你要找的页面不存在或已被移动。",
    goHome: "返回首页",
    errorTitle: "此页面未能加载",
    errorText: "我们这边出了点问题。请尝试刷新页面或返回首页。",
    tryAgain: "重试",
  },
};

export const UI_FALLBACK = UI_MESSAGES["en"] as UiMessages;

export const messagesFor = (lang: string): UiMessages => UI_MESSAGES[lang] ?? UI_FALLBACK;
