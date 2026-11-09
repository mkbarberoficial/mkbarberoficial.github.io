(function () {
  "use strict";

  /* ---------- WhatsApp ---------- */
  // Número informado pelo cliente: (99) 8444-2938 — mantido exatamente como foi passado.
  var WA_NUMBER = "559984442938";
  var MSG = {
    agendar: "Olá! Vi o site da barbearia e gostaria de agendar um horário.",
    local: "Olá! Vi o site da barbearia e gostaria de saber a localização."
  };
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    var text = MSG[el.getAttribute("data-wa")] || MSG.agendar;
    el.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
    el.target = "_blank";
    el.rel = "noopener";
  });

  /* ---------- Menu ---------- */
  var header = document.querySelector(".header");
  var burger = document.querySelector(".burger");
  function setMenu(open) {
    header.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
  burger.addEventListener("click", function () { setMenu(!header.classList.contains("is-open")); });
  document.querySelectorAll(".nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 20); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Destaca o item do menu da seção visível
  var links = {};
  document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("is-active"); });
          links[en.target.id].classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });

    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); reveal.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".section__head, .about__photo, .about__text, .service, .feature, .gallery__grid li, .place, .hours__grid > div:first-child")
      .forEach(function (el) { el.classList.add("reveal"); reveal.observe(el); });
  }

  /* ---------- Horários / aberto agora ---------- */
  // [abre, fecha] em minutos; índice 0 = domingo
  var HOURS = [[480, 840], [540, 1200], [540, 1200], [540, 1200], [540, 1200], [540, 1200], [480, 1080]];
  var DAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  function fmt(m) { var h = Math.floor(m / 60), mm = m % 60; return h + "h" + (mm ? String(mm).padStart(2, "0") : ""); }

  function localNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Fortaleza", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var map = {}; parts.forEach(function (p) { map[p.type] = p.value; });
      var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(map.weekday);
      var h = parseInt(map.hour, 10) % 24;
      return { day: day, min: h * 60 + parseInt(map.minute, 10) };
    } catch (e) {
      var d = new Date(); return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function updateStatus() {
    var now = localNow();
    var today = HOURS[now.day];
    var msg, open = false;
    if (now.min >= today[0] && now.min < today[1]) {
      open = true;
      msg = "Aberto agora · fecha às " + fmt(today[1]);
    } else if (now.min < today[0]) {
      msg = "Fechado agora · abre hoje às " + fmt(today[0]);
    } else {
      var next = (now.day + 1) % 7;
      msg = "Fechado agora · abre " + (next === 0 ? "amanhã (domingo)" : "amanhã") + " às " + fmt(HOURS[next][0]);
    }
    document.querySelectorAll("[data-status]").forEach(function (el) {
      el.innerHTML = '<span class="status-dot' + (open ? " is-open" : "") + '"></span>' + msg;
    });
    document.querySelectorAll(".hours__table tr").forEach(function (tr) {
      tr.classList.toggle("is-today", Number(tr.getAttribute("data-day")) === now.day);
    });
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Galeria / lightbox ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-gallery] button"));
  var box = document.querySelector(".lightbox");
  var boxImg = box.querySelector("img");
  var boxCap = box.querySelector("figcaption");
  var current = 0, lastFocus = null;

  function show(i) {
    current = (i + items.length) % items.length;
    var thumb = items[current].querySelector("img");
    boxImg.src = items[current].getAttribute("data-full");
    boxImg.alt = thumb.alt;
    boxCap.textContent = thumb.alt + " · " + (current + 1) + "/" + items.length;
  }
  function openBox(i) {
    lastFocus = document.activeElement;
    show(i);
    box.hidden = false;
    document.body.style.overflow = "hidden";
    box.querySelector(".lightbox__close").focus();
  }
  function closeBox() {
    box.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  items.forEach(function (btn, i) { btn.addEventListener("click", function () { openBox(i); }); });
  box.querySelector(".lightbox__close").addEventListener("click", closeBox);
  box.querySelector(".lightbox__prev").addEventListener("click", function () { show(current - 1); });
  box.querySelector(".lightbox__next").addEventListener("click", function () { show(current + 1); });
  box.addEventListener("click", function (e) { if (e.target === box) closeBox(); });
  document.addEventListener("keydown", function (e) {
    if (box.hidden) return;
    if (e.key === "Escape") closeBox();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
  var startX = null;
  box.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
