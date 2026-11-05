// The Arcadia website's only script. No tracking and no cookies. It draws a line under the header on scroll, opens the
// phone menu, lets sections rise into view, switches the product tabs, shows the phone's demo button, and sends the
// private-demo request form to Murphy and Leon.

// Where the form is sent: the Google Apps Script web app in Arcadia's Google Workspace, which emails both founders.
// While it's empty, the form opens the visitor's own email app with the request filled in instead.
const INQUIRY_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyax7s4-FwY9X4KJt0L1SY9w_f7TtKAqBSMyNi2GweoE8VcLxGV4SzOjEIle9dUUkvNLQ/exec";
const INQUIRY_EMAILS = "murphy@arcadiaimmtech.com,leon.li@arcadiaimmtech.com";

// A thin line under the header once the page scrolls.
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

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
  window.matchMedia("(min-width: 861px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });
}

// Sections rise into place as they come into view (skipped when the visitor prefers less motion).
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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

// "A look inside": tabs, with arrow keys moving between them. On phones the stylesheet shows every picture instead.
const tabs = [...document.querySelectorAll('[role="tab"]')];
const select = (tab, focus = false) => {
  for (const t of tabs) {
    const on = t === tab;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  }
  if (focus) tab.focus();
};
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => select(tab));
  tab.addEventListener("keydown", (event) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
    if (event.key === "Home") select(tabs[0], true);
    else if (event.key === "End") select(tabs[tabs.length - 1], true);
    else if (step) select(tabs[(i + step + tabs.length) % tabs.length], true);
    else return;
    event.preventDefault();
  });
});

// On phones, the demo button at the bottom of the screen: shown once the hero has scrolled away, hidden again while
// the form or the footer is in view.
const mobileCta = document.querySelector(".mobile-cta");
const ctaHiders = [".hero", "#demo", ".site-footer"].map((s) => document.querySelector(s)).filter(Boolean);
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

// The private-demo request form.
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
      done.querySelector("h3").textContent = "Almost done: your email is ready to send.";
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
