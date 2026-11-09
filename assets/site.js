// The Arcadia website's only script. No tracking and no cookies. It sets the header over the hero and on scroll, opens
// the phone menu, lets sections rise into view, steps through "How Arcadia works", moves the product pictures, switches
// the sample client view's language, shows the phone's demo button, and sends the demo request form to Murphy and Leon.

// Where the form is sent: the Google Apps Script web app in Arcadia's Google Workspace, which emails both founders.
// While it's empty, the form opens the visitor's own email app with the request filled in instead.
const INQUIRY_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyax7s4-FwY9X4KJt0L1SY9w_f7TtKAqBSMyNi2GweoE8VcLxGV4SzOjEIle9dUUkvNLQ/exec";
const INQUIRY_EMAILS = "murphy@arcadiaimmtech.com,leon.li@arcadiaimmtech.com";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const page = document.body.dataset.page;

// Links to the old one-page site's sections still land in the right place.
const moved = { "#demo": "demo.html", "#team": "company.html#founders", "#faq": "demo.html#faq", "#inside": "#tour" };
if (page === "index" && moved[location.hash]) location.replace(moved[location.hash]);

// The header: clear over a dark hero, then a frosted ivory bar once the hero has scrolled away.
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
let solidAt = 8;
const measure = () => {
  solidAt = hero && document.body.dataset.hero === "dark" ? hero.offsetHeight - header.offsetHeight : 8;
};
const onScroll = () => header.classList.toggle("solid", window.scrollY > solidAt);
measure();
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", () => {
  measure();
  onScroll();
});

// The phone menu: the menu button opens the links as a sheet; a link, Escape or a wider screen closes it.
const menuButton = document.querySelector(".menu-button");
const nav = document.getElementById("site-nav");
if (menuButton && nav) {
  const setMenu = (open) => {
    header.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
  };
  menuButton.addEventListener("click", () => setMenu(!header.classList.contains("open")));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !header.classList.contains("open")) return;
    setMenu(false);
    menuButton.focus();
  });
  window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });
}

// Sections rise into place as they come into view (skipped when the visitor prefers less motion).
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const seen = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("in");
        seen.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  reveals.forEach((el) => seen.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

// The sample case in the hero counts up to its progress.
document.querySelectorAll("[data-count]").forEach((num) => {
  if (reduceMotion) return;
  const target = Number(num.dataset.count);
  const meter = num.closest(".ui-card")?.querySelector("[data-meter]");
  const start = performance.now() + 700;
  const length = 1800;
  if (meter) {
    meter.style.setProperty("--p", "0%");
    meter.classList.add("is-counting");
    setTimeout(() => meter.style.setProperty("--p", `${target}%`), 700);
  }
  num.textContent = "0";
  const tick = (now) => {
    const t = Math.min(Math.max((now - start) / length, 0), 1);
    num.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

// "How Arcadia works": the step in the middle of the screen chooses the picture held beside it.
const steps = [...document.querySelectorAll(".step")];
const scenes = [...document.querySelectorAll(".scene")];
if (steps.length && "IntersectionObserver" in window) {
  const show = (i) => {
    steps.forEach((s) => s.classList.toggle("is-active", s.dataset.step === String(i)));
    scenes.forEach((s) => s.classList.toggle("is-active", s.dataset.scene === String(i)));
  };
  show(0);
  const middle = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) show(entry.target.dataset.step);
    },
    { rootMargin: "-45% 0px -45% 0px" },
  );
  steps.forEach((s) => middle.observe(s));
}

// "A look inside": the arrows move the pictures one at a time; swiping and the keyboard work too.
const rail = document.querySelector(".rail");
if (rail) {
  const prev = document.querySelector('[data-rail="prev"]');
  const next = document.querySelector('[data-rail="next"]');
  const stepSize = () => {
    const slide = rail.querySelector(".slide");
    return slide ? slide.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 0) : rail.clientWidth;
  };
  const update = () => {
    prev.disabled = rail.scrollLeft <= 4;
    next.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 4;
  };
  prev.addEventListener("click", () => rail.scrollBy({ left: -stepSize(), behavior: reduceMotion ? "auto" : "smooth" }));
  next.addEventListener("click", () => rail.scrollBy({ left: stepSize(), behavior: reduceMotion ? "auto" : "smooth" }));
  rail.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

// The sample client view: English, Chinese and Spanish. It turns through them on its own until someone picks one.
const words = {
  en: {
    title: "Your case",
    progress: "Progress",
    msg: "We received your marriage certificate.",
    next: "Next step: please upload proof of a shared address.",
    upload: "Upload documents",
  },
  zh: {
    title: "您的案件",
    progress: "进度",
    msg: "我们已收到您的结婚证书。",
    next: "下一步：请上传共同住址证明。",
    upload: "上传文件",
  },
  es: {
    title: "Su caso",
    progress: "Progreso",
    msg: "Recibimos su acta de matrimonio.",
    next: "Siguiente paso: suba un comprobante de domicilio compartido.",
    upload: "Subir documentos",
  },
};
document.querySelectorAll("[data-lang-demo]").forEach((phone) => {
  const screen = phone.querySelector(".phone-screen");
  const buttons = [...phone.querySelectorAll("[data-lang]")];
  const order = ["en", "zh", "es"];
  let current = "en";
  let timer = null;
  const setLang = (lang) => {
    if (lang === current) return;
    current = lang;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    screen.classList.add("is-switching");
    setTimeout(
      () => {
        screen.lang = lang;
        screen.querySelectorAll("[data-i18n]").forEach((el) => {
          el.textContent = words[lang][el.dataset.i18n];
        });
        screen.classList.remove("is-switching");
      },
      reduceMotion ? 0 : 220,
    );
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };
  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      stop();
      phone.dataset.chosen = "yes";
      setLang(b.dataset.lang);
    }),
  );
  if (reduceMotion || !("IntersectionObserver" in window)) return;
  new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && !timer && !phone.dataset.chosen) {
        timer = setInterval(() => setLang(order[(order.indexOf(current) + 1) % order.length]), 3200);
      } else if (!entry.isIntersecting) {
        stop();
      }
    }
  }).observe(phone);
});

// Full-width photographs drift a little slower than the page.
const drifting = [...document.querySelectorAll("[data-parallax]")];
if (drifting.length && !reduceMotion) {
  let queued = false;
  const drift = () => {
    queued = false;
    const vh = window.innerHeight;
    for (const img of drifting) {
      const box = img.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > vh) continue;
      const extra = img.offsetHeight - box.height;
      const progress = Math.min(Math.max((vh - box.top) / (vh + box.height), 0), 1);
      img.style.transform = `translate3d(0, ${(-extra * progress).toFixed(1)}px, 0)`;
    }
  };
  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(drift);
    }
  };
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  drift();
}

// On phones, the demo button at the bottom of the screen: shown once the opening has scrolled away, hidden again
// while a closing invitation, the form or the footer is in view.
const mobileCta = document.querySelector(".mobile-cta");
const ctaHiders = [".hero", ".intro", "[data-cta]", ".site-footer"].flatMap((s) => [...document.querySelectorAll(s)]);
if (mobileCta && "IntersectionObserver" in window) {
  const inView = new Set(ctaHiders);
  const watch = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) inView.add(entry.target);
      else inView.delete(entry.target);
    }
    mobileCta.classList.toggle("show", inView.size === 0);
  });
  ctaHiders.forEach((el) => watch.observe(el));
}

// The demo request form.
const form = document.getElementById("inquiry");
if (form) {
  const done = form.parentElement.querySelector(".form-done");
  const error = form.querySelector(".form-error");
  const submit = form.querySelector(".submit");
  const submitText = submit.innerHTML;
  form.elements.started.value = String(Date.now());

  const labelOf = (el) =>
    el.type === "checkbox"
      ? "the law firm confirmation"
      : el.closest("label").querySelector("span").firstChild.textContent.trim().toLowerCase();

  const showError = (html) => {
    error.innerHTML = html;
    error.hidden = false;
  };

  const finish = (byEmail) => {
    if (byEmail) {
      done.querySelector("h2").textContent = "Almost done: your email is ready to send.";
      done.querySelector("p").textContent =
        "Your email app has opened with your request filled in. Press Send, and Murphy or Leon will reply personally.";
    }
    form.hidden = true;
    done.hidden = false;
    done.focus();
  };

  // Clear a field's warning as soon as it's corrected.
  form.addEventListener("input", (event) => {
    if (event.target.checkValidity?.()) event.target.removeAttribute("aria-invalid");
  });
  form.addEventListener("change", (event) => {
    if (event.target.checkValidity?.()) event.target.removeAttribute("aria-invalid");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.hidden = true;

    for (const el of form.elements) {
      if (!el.willValidate) continue;
      el.value = el.type === "checkbox" ? el.value : el.value.trim();
    }
    const invalid = [...form.elements].filter((el) => el.willValidate && !el.checkValidity());
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    if (invalid.length) {
      invalid.forEach((el) => el.setAttribute("aria-invalid", "true"));
      const emailWrong = invalid.some((el) => el.name === "email" && el.value);
      showError(
        emailWrong && invalid.length === 1
          ? "Please check the work email address."
          : `Please complete ${invalid.map(labelOf).join(", ").replace(/, ([^,]*)$/, " and $1")}.`,
      );
      invalid[0].focus();
      return;
    }

    // People never see the "website" field; only bots fill it in. Thank them and send nothing.
    if (form.elements.website.value) {
      finish(false);
      return;
    }

    const data = Object.fromEntries(new FormData(form));

    if (!INQUIRY_ENDPOINT) {
      const lines = [
        `Name: ${data.name}`,
        `Work email: ${data.email}`,
        `Law firm: ${data.firm}`,
        `Phone: ${data.phone || "-"}`,
        `Role: ${data.role}`,
        `Attorneys at the firm: ${data.size}`,
        "",
        data.message || "",
      ];
      const subject = `Private demo request: ${data.firm}`;
      window.location.href = `mailto:${INQUIRY_EMAILS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\r\n").trim())}`;
      finish(true);
      return;
    }

    submit.disabled = true;
    submit.textContent = "Sending…";
    const stop = new AbortController();
    const timer = setTimeout(() => stop.abort(), 20000);
    try {
      const response = await fetch(INQUIRY_ENDPOINT, {
        method: "POST",
        body: new URLSearchParams(data),
        signal: stop.signal,
      });
      const reply = await response.json();
      if (!reply.ok) throw new Error("not sent");
      finish(false);
    } catch {
      showError(
        'Sorry, your request didn\'t go through. Please try again, or email <a href="mailto:murphy@arcadiaimmtech.com?subject=Arcadia%20demo">murphy@arcadiaimmtech.com</a>.',
      );
    } finally {
      clearTimeout(timer);
      submit.disabled = false;
      submit.innerHTML = submitText;
    }
  });
}
