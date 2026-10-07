(() => {
  "use strict";

  // ───────── Menú móvil ─────────
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  const setMenu = (open) => {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  links.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && (setMenu(false), toggle.focus()));

  // ───────── DOM seguro: siempre textContent, nunca innerHTML con datos ─────────
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };

  const renderers = {
    features: (f) => {
      const a = el("article", "card");
      a.append(el("h3", "", f.title), el("p", "", f.text));
      return a;
    },
    plans: (p) => {
      const a = el("article", "card");
      const ul = el("ul");
      p.perks.forEach((x) => ul.append(el("li", "", x)));
      a.append(el("h3", "", p.name), el("p", "price", p.price), ul, Object.assign(el("a", "btn btn-secondary", "Elegir"), { href: "#cta" }));
      return a;
    },
    testimonials: (t) => {
      const b = el("blockquote", "card");
      b.append(el("p", "", `“${t.quote}”`), el("footer", "", `— ${t.author}`));
      return b;
    },
  };

  // ───────── Skeleton loaders ─────────
  const skeletonCard = () => {
    const c = el("div", "card skeleton");
    c.append(el("span", "skel skel-title"), el("span", "skel skel-line"), el("span", "skel skel-line short"));
    return c;
  };
  const containers = [...document.querySelectorAll("[data-list]")];
  containers.forEach((box) => {
    box.setAttribute("aria-label", "Cargando");
    for (let i = 0; i < 3; i++) box.append(skeletonCard());
  });

  const showError = (box) => {
    box.replaceChildren(el("p", "error-box", "No se pudo cargar. Recarga la página."));
    box.setAttribute("aria-busy", "false");
    box.removeAttribute("aria-label");
  };

  fetch("data/content.json", { credentials: "omit" })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
    .then((data) => {
      containers.forEach((box) => {
        const key = box.dataset.list;
        const items = Array.isArray(data[key]) ? data[key] : [];
        box.replaceChildren(...items.map(renderers[key]));
        box.setAttribute("aria-busy", "false");
        box.removeAttribute("aria-label");
      });
    })
    .catch(() => containers.forEach(showError));

  // ───────── Formulario: sanitización, rate limit cliente, envío ─────────
  const form = document.getElementById("subscribe-form");
  const input = form.elements.email;
  const msg = document.getElementById("form-msg");
  const btn = form.querySelector("button");

  const say = (text, kind) => {
    msg.textContent = text;
    msg.className = `form-msg ${kind || ""}`;
  };
  const sanitize = (s) => s.replace(/[\u0000-\u001F\u007F\s]/g, "").toLowerCase();
  const EMAIL = /^[^\s@<>()"'`\\]+@[^\s@<>()"'`\\]+\.[^\s@<>()"'`\\]{2,}$/;

  // Throttle de UX (3 envíos/min). El límite real está en el servidor.
  let hits = [];
  const allowed = () => {
    const now = Date.now();
    hits = hits.filter((t) => now - t < 60_000);
    if (hits.length >= 3) return false;
    hits.push(now);
    return true;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    say("");
    input.removeAttribute("aria-invalid");

    if (form.elements.website.value) return; // honeypot: bot
    const email = sanitize(input.value);
    if (email.length > 254 || !EMAIL.test(email)) {
      input.setAttribute("aria-invalid", "true");
      say("Correo inválido.", "error");
      input.focus();
      return;
    }
    if (!allowed()) return say("Demasiados intentos. Espera 1 minuto.", "error");

    const { functionsUrl, anonKey } = window.APP_CONFIG || {};
    if (!functionsUrl || !anonKey) return say("Demo: backend no configurado.", "ok");
    if (!functionsUrl.startsWith("https://")) return say("Configuración insegura.", "error");

    btn.disabled = true;
    try {
      const r = await fetch(`${functionsUrl}/subscribe`, {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json", apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        body: JSON.stringify({ email }),
      });
      if (r.status === 429) say("Límite alcanzado. Intenta más tarde.", "error");
      else if (!r.ok) say("No se pudo enviar.", "error");
      else { say("¡Listo! Revisa tu correo.", "ok"); form.reset(); }
    } catch {
      say("Sin conexión.", "error");
    } finally {
      btn.disabled = false;
    }
  });
})();
