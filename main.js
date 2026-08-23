(function () {
  "use strict";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));
  const WA_NUMBER = "5214142804939";

  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  function waLink(message) {
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function initWhatsappLinks() {
    $$("[data-wa-link]").forEach(a => {
      const msg = a.getAttribute("data-wa-link") || "Hola, me gustaría más información sobre Viñedos Los Rosales.";
      a.href = waLink(msg);
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  function initMultistepForm() {
    const form = $("[data-multistep-form]");
    if (!form) return;
    const steps = $$(".ms-step", form);
    const dots = $$(".ms-progress-dot", form);
    const optionsWrap = $(".ms-options", form);
    let interes = "";

    function goTo(n) {
      steps.forEach(s => s.classList.toggle("is-active", Number(s.dataset.step) === n));
      dots.forEach(d => {
        const i = Number(d.dataset.dot);
        d.classList.toggle("is-active", i === n);
        d.classList.toggle("is-done", i < n);
      });
    }

    if (optionsWrap) {
      $$(".ms-option", optionsWrap).forEach(btn => {
        btn.addEventListener("click", () => {
          $$(".ms-option", optionsWrap).forEach(b => b.classList.remove("is-selected"));
          btn.classList.add("is-selected");
          interes = btn.getAttribute("data-value") || "";
          setTimeout(() => goTo(2), 220);
        });
      });
    }

    $$("[data-ms-back]", form).forEach(btn => btn.addEventListener("click", () => {
      const current = Number(btn.closest(".ms-step").dataset.step);
      goTo(Math.max(1, current - 1));
    }));

    $$("[data-ms-next]", form).forEach(btn => btn.addEventListener("click", () => {
      const current = Number(btn.closest(".ms-step").dataset.step);
      goTo(current + 1);
    }));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const nombre = $("#c-nombre", form)?.value.trim() || "";
      const personas = $("#c-personas", form)?.value.trim() || "";
      const fecha = $("#c-fecha", form)?.value.trim() || "";
      const mensaje = $("#c-mensaje", form)?.value.trim() || "";
      const lines = [
        "Hola, me gustaría reservar una visita a Viñedos Los Rosales.",
        interes ? `Interés: ${interes}` : "",
        nombre ? `Nombre: ${nombre}` : "",
        fecha ? `Fecha tentativa: ${fecha}` : "",
        personas ? `Número de personas: ${personas}` : "",
        mensaje ? `Mensaje: ${mensaje}` : ""
      ].filter(Boolean).join("\n");
      window.open(waLink(lines), "_blank", "noopener");
    });
  }

  function initFooterYear() {
    $$("[data-year]").forEach(el => { el.textContent = String(new Date().getFullYear()); });
  }

  function initNav() {
    const toggles = $$(".nav-toggle");
    const menu = $(".mobile-menu");
    if (toggles.length && menu) {
      toggles.forEach(t => t.addEventListener("click", () => {
        const open = menu.classList.toggle("is-open");
        toggles.forEach(x => x.setAttribute("aria-expanded", String(open)));
        document.body.style.overflow = open ? "hidden" : "";
      }));
      $$("a", menu).forEach(a => a.addEventListener("click", () => {
        menu.classList.remove("is-open");
        document.body.style.overflow = "";
      }));
    }
  }

  function initAnchorScroll() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: "smooth" });
    });
  }

  function initReveals() {
    const items = $$(".reveal");
    if (!items.length) return;
    if (typeof IntersectionObserver === "undefined") { items.forEach(el => el.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); } });
    }, { threshold: 0.05, rootMargin: "0px 0px -6% 0px" });
    items.forEach(el => io.observe(el));
    setTimeout(() => items.forEach(el => el.classList.add("is-visible")), 6000);
  }

  function initCountUp() {
    const items = $$(".count-up");
    if (!items.length) return;
    const animate = (el) => {
      const to = parseFloat(el.getAttribute("data-count-to") || "0");
      const dur = reduced ? 400 : 1300;
      const start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * eased);
        if (p < 1) requestAnimationFrame(tick); else el.textContent = to;
      }
      requestAnimationFrame(tick);
    };
    if (typeof IntersectionObserver === "undefined") { items.forEach(animate); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); } });
    }, { threshold: 0.05 });
    items.forEach(el => io.observe(el));
    setTimeout(() => items.forEach(el => { if (el.textContent === "0") animate(el); }), 6000);
  }

  function boot() {
    safe(initWhatsappLinks, "initWhatsappLinks");
    safe(initMultistepForm, "initMultistepForm");
    safe(initFooterYear, "initFooterYear");
    safe(initNav, "initNav");
    safe(initAnchorScroll, "initAnchorScroll");
    safe(initReveals, "initReveals");
    safe(initCountUp, "initCountUp");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
