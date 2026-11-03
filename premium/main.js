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

const formatTime = (minutes) =>
  `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}`;

function getKitchenStatus(now = new Date()) {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const current = KITCHEN_HOURS[day].find(([open, close]) => minutes >= open && minutes < close);
  if (current) return { isOpen: true, label: `Cuisine ouverte jusqu'à ${formatTime(current[1])}` };

  const laterToday = KITCHEN_HOURS[day].find(([open]) => open > minutes);
  if (laterToday) return { isOpen: false, label: `Fermé · ouvre à ${formatTime(laterToday[0])}` };
  return { isOpen: false, label: "Fermé pour aujourd'hui · réservez pour demain" };
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
  date: (v) => (v && new Date(v) > new Date() ? "" : "Choisissez une date à venir."),
  guests: (v) => (Number(v) >= 10 && Number(v) <= 100 ? "" : "Entre 10 et 100 personnes."),
  occasion: (v) => (v ? "" : "Indiquez le type d'événement."),
  name: (v) => (v.trim().length >= 2 ? "" : "Indiquez votre nom."),
  phone: (v) => (/^[+0-9 ./-]{9,}$/.test(v.trim()) ? "" : "Numéro de téléphone invalide."),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Adresse e-mail invalide."),
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
      message.textContent = "Adresse e-mail invalide.";
      form.elements.email.focus();
      return;
    }
    if (!form.elements.consent.checked) {
      message.textContent = "Cochez la case pour accepter de recevoir la lettre.";
      return;
    }
    message.textContent = "Benvenuto in famiglia ! (Maquette : aucune inscription réelle.)";
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
