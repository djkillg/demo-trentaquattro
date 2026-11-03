// Trentaquattro — interactions de la maquette (aucune dépendance)

// Heures de cuisine, index = jour JS (0 = dimanche). Minutes depuis minuit.
const KITCHEN_HOURS = [
  [[720, 840], [1080, 1290]], // dimanche
  [],                         // lundi : fermé
  [[720, 840], [1080, 1290]],
  [[720, 840], [1080, 1290]],
  [[720, 840], [1080, 1290]],
  [[720, 840], [1080, 1320]], // vendredi jusque 22h
  [[1080, 1320]],             // samedi : soir uniquement
];

// Messages de l'interface dans les six langues du site, choisis d'après <html lang>
const MESSAGES = {
  fr: {
    open: (t) => `Cuisine ouverte jusqu'à ${t}`, opensAt: (t) => `Fermé · ouvre à ${t}`,
    closedToday: "Fermé pour aujourd'hui · réservez pour demain",
    date: "Choisissez une date à venir.", guests: "Entre 10 et 100 personnes.",
    occasion: "Indiquez le type d'événement.", name: "Indiquez votre nom.",
    phone: "Numéro de téléphone invalide.", email: "Adresse e-mail invalide.",
    consent: "Cochez la case pour accepter de recevoir la lettre.",
    welcome: "Benvenuto in famiglia ! (Maquette : aucune inscription réelle.)",
  },
  nl: {
    open: (t) => `Keuken open tot ${t}`, opensAt: (t) => `Gesloten · opent om ${t}`,
    closedToday: "Vandaag gesloten · reserveer voor morgen",
    date: "Kies een datum in de toekomst.", guests: "Tussen 10 en 100 personen.",
    occasion: "Kies het soort evenement.", name: "Vul uw naam in.",
    phone: "Ongeldig telefoonnummer.", email: "Ongeldig e-mailadres.",
    consent: "Vink het vakje aan om de nieuwsbrief te ontvangen.",
    welcome: "Benvenuto in famiglia! (Demo: er wordt niets verzonden.)",
  },
  en: {
    open: (t) => `Kitchen open until ${t}`, opensAt: (t) => `Closed · opens at ${t}`,
    closedToday: "Closed for today · book for tomorrow",
    date: "Choose a date in the future.", guests: "Between 10 and 100 guests.",
    occasion: "Choose the type of event.", name: "Please enter your name.",
    phone: "Invalid phone number.", email: "Invalid e-mail address.",
    consent: "Tick the box to agree to receive the newsletter.",
    welcome: "Benvenuto in famiglia! (Demo: nothing is actually sent.)",
  },
  it: {
    open: (t) => `Cucina aperta fino alle ${t}`, opensAt: (t) => `Chiuso · apre alle ${t}`,
    closedToday: "Chiuso per oggi · prenota per domani",
    date: "Scegli una data futura.", guests: "Tra 10 e 100 persone.",
    occasion: "Indica il tipo di evento.", name: "Indica il tuo nome.",
    phone: "Numero di telefono non valido.", email: "Indirizzo e-mail non valido.",
    consent: "Spunta la casella per ricevere la newsletter.",
    welcome: "Benvenuto in famiglia! (Demo: nessuna iscrizione reale.)",
  },
  de: {
    open: (t) => `Küche geöffnet bis ${t} Uhr`, opensAt: (t) => `Geschlossen · öffnet um ${t} Uhr`,
    closedToday: "Heute geschlossen · für morgen reservieren",
    date: "Wählen Sie ein Datum in der Zukunft.", guests: "Zwischen 10 und 100 Personen.",
    occasion: "Wählen Sie die Art der Veranstaltung.", name: "Bitte geben Sie Ihren Namen ein.",
    phone: "Ungültige Telefonnummer.", email: "Ungültige E-Mail-Adresse.",
    consent: "Kreuzen Sie das Kästchen an, um den Newsletter zu erhalten.",
    welcome: "Benvenuto in famiglia! (Demo: Es wird nichts gesendet.)",
  },
  pt: {
    open: (t) => `Cozinha aberta até às ${t}`, opensAt: (t) => `Fechado · abre às ${t}`,
    closedToday: "Fechado hoje · reserve para amanhã",
    date: "Escolha uma data futura.", guests: "Entre 10 e 100 pessoas.",
    occasion: "Indique o tipo de evento.", name: "Indique o seu nome.",
    phone: "Número de telefone inválido.", email: "Endereço de e-mail inválido.",
    consent: "Assinale a caixa para aceitar receber a newsletter.",
    welcome: "Benvenuto in famiglia! (Demo: nada é enviado.)",
  },
  es: {
    open: (t) => `Cocina abierta hasta las ${t}`, opensAt: (t) => `Cerrado · abre a las ${t}`,
    closedToday: "Cerrado por hoy · reserve para mañana",
    date: "Elija una fecha futura.", guests: "Entre 10 y 100 personas.",
    occasion: "Indique el tipo de evento.", name: "Indique su nombre.",
    phone: "Número de teléfono no válido.", email: "Dirección de correo no válida.",
    consent: "Marque la casilla para aceptar recibir el boletín.",
    welcome: "¡Benvenuto in famiglia! (Demo: no se envía nada.)",
  },
  zh: {
    open: (t) => `厨房营业至 ${t}`, opensAt: (t) => `休息中 · ${t} 开门`,
    closedToday: "今日已打烊 · 欢迎预订明天",
    date: "请选择未来的日期。", guests: "人数需在 10 至 100 人之间。",
    occasion: "请选择活动类型。", name: "请填写您的姓名。",
    phone: "电话号码无效。", email: "电子邮箱地址无效。",
    consent: "请勾选同意接收会员通讯。",
    welcome: "Benvenuto in famiglia！（演示版：不会真正提交。）",
  },
};
const LANG = document.documentElement.lang.slice(0, 2);
const T = MESSAGES[LANG] || MESSAGES.fr;

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = String(minutes % 60).padStart(2, "0");
  return LANG === "fr" ? `${hours}h${mins}` : `${hours}:${mins}`;
};

function getKitchenStatus(now = new Date()) {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const current = KITCHEN_HOURS[day].find(([open, close]) => minutes >= open && minutes < close);
  if (current) return { isOpen: true, label: T.open(formatTime(current[1])) };

  const laterToday = KITCHEN_HOURS[day].find(([open]) => open > minutes);
  if (laterToday) return { isOpen: false, label: T.opensAt(formatTime(laterToday[0])) };
  return { isOpen: false, label: T.closedToday };
}

function initStatus() {
  const { isOpen, label } = getKitchenStatus();
  document.querySelectorAll("[data-status]").forEach((el) => {
    el.dataset.open = String(isOpen);
    const text = el.querySelector("[data-status-text]");
    if (text) text.textContent = label;
  });
  const today = String(new Date().getDay());
  document.querySelectorAll(`.hours tr[data-day="${today}"]`).forEach((row) => {
    row.dataset.today = "true";
  });
}

function setNavOpen(toggle, nav, isOpen) {
  toggle.setAttribute("aria-expanded", String(isOpen));
  nav.dataset.open = String(isOpen);
  document.body.dataset.navOpen = String(isOpen);
}

// Menu plein écran : s'ouvre au bouton, se ferme avec Échap ou au choix d'un lien
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    setNavOpen(toggle, nav, toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setNavOpen(toggle, nav, false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || nav.dataset.open !== "true") return;
    setNavOpen(toggle, nav, false);
    toggle.focus();
  });
}

// En-tête transparent sur l'image d'ouverture, plein dès que la page défile
function initHeader() {
  const header = document.querySelector(".hd");
  const sentinel = document.querySelector(".hero, .page-hero");
  if (!header || !sentinel || !("IntersectionObserver" in window)) {
    if (header) header.dataset.scrolled = "true";
    return;
  }
  const observer = new IntersectionObserver(([entry]) => {
    header.dataset.scrolled = String(!entry.isIntersecting);
  }, { rootMargin: "-80px 0px 0px 0px", threshold: 0 });
  const marker = document.createElement("span");
  marker.setAttribute("aria-hidden", "true");
  marker.style.cssText = "position:absolute;top:50%;height:1px;width:1px";
  sentinel.style.position ||= "relative";
  sentinel.prepend(marker);
  observer.observe(marker);
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10% 0px" });
  items.forEach((el) => observer.observe(el));
}

// Met en évidence la rubrique de la carte en cours de lecture
function initMenuChips() {
  const links = [...document.querySelectorAll(".chips a")];
  if (!links.length || !("IntersectionObserver" in window)) return;
  const byId = new Map(links.map((link) => [link.hash.slice(1), link]));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => link.removeAttribute("aria-current"));
      const active = byId.get(entry.target.id);
      if (!active) return;
      active.setAttribute("aria-current", "true");
      active.scrollIntoView({ block: "nearest", inline: "center" });
    });
  }, { rootMargin: "-30% 0px -60% 0px" });
  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

const QUOTE_RULES = {
  date: (v) => (v && new Date(v) > new Date() ? "" : T.date),
  guests: (v) => (Number(v) >= 10 && Number(v) <= 100 ? "" : T.guests),
  occasion: (v) => (v ? "" : T.occasion),
  name: (v) => (v.trim().length >= 2 ? "" : T.name),
  phone: (v) => (/^[+0-9 ./-]{9,}$/.test(v.trim()) ? "" : T.phone),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : T.email),
};

function validateField(form, name) {
  const input = form.elements[name];
  const message = QUOTE_RULES[name](input.value);
  const field = input.closest(".field");
  field.dataset.invalid = String(Boolean(message));
  field.querySelector(".field-error").textContent = message;
  input.setAttribute("aria-invalid", String(Boolean(message)));
  return !message;
}

function initQuoteForm() {
  const form = document.getElementById("quote-form");
  if (!form) return;
  Object.keys(QUOTE_RULES).forEach((name) => {
    form.elements[name].addEventListener("blur", () => validateField(form, name));
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const results = Object.keys(QUOTE_RULES).map((name) => validateField(form, name));
    if (results.includes(false)) {
      form.querySelector("[aria-invalid='true']")?.focus();
      return;
    }
    // Maquette : aucun envoi. En production, ce formulaire part vers l'e-mail du restaurant (ou le CRM).
    form.dataset.sent = "true";
    form.querySelector(".form-success").focus();
  });
}

// Vidéos d'ambiance : lecture muette seulement à l'écran, jamais si l'utilisateur limite les animations.
function initAmbientVideos() {
  const videos = document.querySelectorAll("video[data-autoplay]");
  if (!videos.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    videos.forEach((video) => { video.controls = true; });
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) { target.pause(); return; }
      target.play().catch(() => { target.controls = true; });
    });
  }, { threshold: 0.35 });
  videos.forEach((video) => observer.observe(video));
}

// Lettre « La famiglia » : validation seulement, aucun envoi dans la maquette
function initSignup() {
  const form = document.getElementById("signup-form");
  if (!form) return;
  const message = form.querySelector(".signup-msg");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = form.elements.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.textContent = T.email;
      form.elements.email.focus();
      return;
    }
    if (!form.elements.consent.checked) {
      message.textContent = T.consent;
      return;
    }
    message.textContent = T.welcome;
    form.reset();
  });
}

function initYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

initNav();
initHeader();
initStatus();
initReveal();
initMenuChips();
initQuoteForm();
initAmbientVideos();
initSignup();
initYear();
