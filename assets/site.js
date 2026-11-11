// The script every page uses. No tracking and no cookies. It sets the header over the home page's photograph, opens
// the phone menu, lets sections rise into view, lights the statement word by word, and sends the demo request form
// to Murphy and Leon. The home page's own pieces are in home.js.

// Where the form is sent: the Google Apps Script web app in Arcadia's Google Workspace, which emails both founders.
// While it's empty, the form opens the visitor's own email app with the request filled in instead.
const INQUIRY_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyax7s4-FwY9X4KJt0L1SY9w_f7TtKAqBSMyNi2GweoE8VcLxGV4SzOjEIle9dUUkvNLQ/exec";
const INQUIRY_EMAILS = "murphy@arcadiaimmtech.com,leon.li@arcadiaimmtech.com";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const page = document.body.dataset.page;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Links to the old site's sections still land in the right place.
const moved = { "#demo": "demo.html", "#team": "company.html#founders", "#faq": "demo.html#faq", "#inside": "product.html", "#tour": "#try" };
if (page === "index" && moved[location.hash]) location.replace(moved[location.hash]);

// A number moving smoothly to its new value.
function tween(from, to, ms, draw, done) {
  if (reduceMotion || ms <= 0) {
    draw(to);
    if (done) done();
    return;
  }
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    draw(from + (to - from) * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
    else if (done) done();
  };
  requestAnimationFrame(step);
}

// ---------------- header, phone menu, scrolling effects ----------------
const header = $(".site");
const darkHero = document.body.dataset.hero === "dark" ? $(".hero, .intro") : null;
const heroMedia = $(".hero-media");
const drifters = $$("[data-drift]");
const words = $(".words");
let wordSpans = [];
if (words) {
  words.innerHTML = words.textContent
    .trim()
    .split(/\s+/)
    .map((w) => `<span>${w.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</span>`)
    .join(" ");
  wordSpans = $$("span", words);
}

let queued = false;
function onFrame() {
  queued = false;
  const y = window.scrollY;
  const vh = window.innerHeight;
  header.classList.toggle("solid", !darkHero || y > darkHero.offsetHeight - header.offsetHeight - 10);
  if (!reduceMotion) {
    if (heroMedia && y < darkHero.offsetHeight) heroMedia.style.transform = `translate3d(0, ${(y * 0.3).toFixed(1)}px, 0)`;
    for (const el of drifters) {
      const box = el.parentElement.getBoundingClientRect();
      if (box.top < vh && box.bottom > 0) el.style.transform = `translate3d(0, ${((box.top - vh / 2) * -0.12).toFixed(1)}px, 0)`;
    }
  }
  if (words) {
    const r = words.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (vh * 0.82 - r.top) / (r.height + vh * 0.3)));
    const lit = reduceMotion ? wordSpans.length : Math.round(p * wordSpans.length);
    wordSpans.forEach((s, i) => s.classList.toggle("lit", i < lit));
  }
}
const queue = () => {
  if (!queued) {
    queued = true;
    requestAnimationFrame(onFrame);
  }
};
window.addEventListener("scroll", queue, { passive: true });
window.addEventListener("resize", queue);
onFrame();

const menuButton = $(".menu");
if (menuButton) {
  const setMenu = (open) => {
    header.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
  };
  menuButton.addEventListener("click", () => setMenu(!header.classList.contains("open")));
  $("#site-nav").addEventListener("click", (event) => {
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

// Sections rise into place as they come into view.
const risers = $$(".rv");
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
  risers.forEach((el) => seen.observe(el));
} else {
  risers.forEach((el) => el.classList.add("in"));
}

// ---------------- the demo request form ----------------
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
