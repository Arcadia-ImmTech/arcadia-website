// The Arcadia website's only script. No tracking and no cookies. It sets the header over the home page's photograph,
// opens the phone menu, lets sections rise into view, lights the statement word by word, runs "Prepare a case in four
// clicks" (a fictional sample case, nothing sent anywhere), steps through "How Arcadia works", makes the workspace
// tiles respond, and sends the demo request form to Murphy and Leon.

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
const darkHero = document.body.dataset.hero === "dark" ? $(".hero") : null;
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

// The sample case resting on the home page's photograph counts up to 100.
const glass = $(".glass");
if (glass) {
  const gp = $("#gp", glass);
  const gm = $("#gm", glass);
  const gs = $("#gs", glass);
  if (!reduceMotion) {
    gp.textContent = "0";
    gm.style.width = "0%";
    gs.textContent = "Reading 11 documents";
  }
  setTimeout(() => {
    tween(0, 100, 3600, (v) => {
      gp.textContent = Math.round(v);
      gm.style.width = `${v}%`;
      gs.textContent =
        v < 45 ? "Reading 11 documents" : v < 82 ? "Drafting the I-130 and I-485" : v < 100 ? "Building the filing package" : "Ready for your signature";
    });
  }, 1100);
}

// ---------------- "Prepare a case in four clicks" ----------------
// A fictional sample case. The time given back uses Arcadia's own estimate per task (a trained paralegal's minutes,
// less the seconds a person spends reviewing Arcadia's work), the same estimates as the product's Performance page.
const demo = $("#taste");
if (demo) {
  const EST = { doc: 8 - 20 / 60, find: 6 - 30 / 60, answer: 1 - 5 / 60, form: 20 - 120 / 60 };
  const pctEl = $("#pct");
  const meter = $("#meter");
  const statusEl = $("#status");
  const hrs = $("#hrs");
  const T = { docs: $("#tDocs"), find: $("#tFind"), ans: $("#tAns"), forms: $("#tForms"), pkg: $("#tPkg") };
  let S = { pct: 0, min: 0, docs: 0 };
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, reduceMotion ? Math.min(ms, 60) : ms));
  const status = (t) => (statusEl.textContent = t);
  const setPct = (v) => {
    const from = S.pct;
    S.pct = v;
    meter.style.width = `${v}%`;
    tween(from, v, 1200, (x) => (pctEl.textContent = Math.round(x)));
  };
  const addMinutes = (m, ms = 600) => {
    const from = S.min;
    S.min += m;
    tween(from, S.min, ms, (x) => (hrs.textContent = (x / 60).toFixed(1)));
  };
  const count = (el, to, ms = 400) => {
    const from = Number(el.textContent) || 0;
    tween(from, to, ms, (x) => (el.textContent = Math.round(x)));
  };
  const show = (name) => {
    $$(".pane", demo).forEach((p) => p.classList.toggle("on", p.dataset.pane === name));
    const top = demo.getBoundingClientRect().top;
    if (window.innerWidth < 760 && top < 0) {
      window.scrollTo({ top: top + window.scrollY - header.offsetHeight - 10, behavior: reduceMotion ? "auto" : "smooth" });
    }
  };
  const stepTo = (n) =>
    $$("#steps li").forEach((li, i) => {
      li.classList.toggle("on", i === n);
      li.classList.toggle("done", i < n);
    });
  const srcSwitch = (which) => {
    $$(".src[data-src]", demo).forEach((b) => {
      b.classList.toggle("on", b.dataset.src === which);
      b.setAttribute("aria-pressed", String(b.dataset.src === which));
    });
    $("#sheetDiv").hidden = which !== "div";
    $("#sheetMar").hidden = which !== "mar";
    $("#docName").textContent = which === "div" ? "Divorce judgment" : "Marriage certificate";
    $("#docPage").textContent = which === "div" ? "page 2 of 2" : "page 1 of 1";
  };
  const type = (el, text, ms) => {
    if (reduceMotion) {
      el.textContent = text;
      return;
    }
    let i = 0;
    const per = Math.max(14, ms / text.length);
    const tick = () => {
      i += 1;
      el.textContent = text.slice(0, i);
      if (i < text.length) timers.push(setTimeout(tick, per));
    };
    tick();
  };

  const reset = () => {
    timers.forEach(clearTimeout);
    timers = [];
    S = { pct: 0, min: 0, docs: 0 };
    meter.style.width = "0%";
    pctEl.textContent = "0";
    hrs.textContent = "0.0";
    Object.values(T).forEach((el) => (el.textContent = "0"));
    $("#drop").classList.remove("go");
    $$(".rr", demo).forEach((r) => r.classList.remove("in", "done"));
    $("#rsum").classList.remove("in");
    $("#need").classList.remove("resolved", "asking");
    $("#reply").classList.add("hide");
    $('[data-act="send"]', demo).hidden = false;
    srcSwitch("div");
    $$(".fr", demo).forEach((r) => {
      r.classList.remove("f");
      $(".v", r).textContent = "";
    });
    $("#c130").textContent = "0";
    $("#c485").textContent = "0";
    $("#ready").classList.remove("in");
    const fill = $("#fillBtn");
    fill.classList.remove("quiet");
    fill.disabled = false;
    fill.textContent = "Fill USCIS forms";
    $$(".sh", demo).forEach((s) => s.classList.remove("in"));
    $$("#plist li").forEach((l) => l.classList.remove("in"));
    $("#pbadges").classList.remove("in");
    $("#pkgGo").classList.remove("gone");
    $("#pkgwrap").classList.remove("built");
    $("#doneO").classList.remove("on");
    show("drop");
    stepTo(0);
    status("Waiting for the client's documents");
  };

  const drop = () => {
    $("#drop").classList.add("go");
    status("Reading 8 documents");
    later(() => {
      show("read");
      const rows = $$(".rr", demo);
      rows.forEach((r, i) => {
        later(() => r.classList.add("in"), 80 + i * 150);
        later(() => {
          r.classList.add("done");
          S.docs += 1;
          count(T.docs, S.docs, 200);
          addMinutes(EST.doc, 300);
          setPct(Math.round((68 * (i + 1)) / rows.length));
        }, 80 + i * 150 + 420);
      });
      const end = 80 + rows.length * 150 + 560;
      later(() => {
        $("#rsum").classList.add("in");
        count(T.find, 1);
        addMinutes(EST.find);
        status("1 needs you");
      }, end);
      later(() => {
        show("review");
        stepTo(1);
      }, end + 1500);
    }, 520);
  };
  const resolve = (text) => {
    const need = $("#need");
    need.classList.remove("asking");
    need.classList.add("resolved");
    $("#recText").textContent = text;
    setPct(86);
    status("Nothing open. Forms next");
    later(() => {
      show("forms");
      stepTo(2);
      status("Ready to fill the forms");
    }, 1500);
  };
  const send = () => {
    $('[data-act="send"]', demo).hidden = true;
    status("Sent to Mariana");
    later(() => {
      $("#reply").classList.remove("hide");
      S.docs += 1;
      count(T.docs, S.docs);
      addMinutes(EST.doc);
      status("Mariana replied · file checked");
    }, 1000);
    later(() => resolve("Settled by the final decree (p.3) · confirmed by you · just now"), 2300);
  };
  const fill = () => {
    const b = $("#fillBtn");
    b.classList.add("quiet");
    b.disabled = true;
    b.textContent = "Forms filled";
    status("Drafting the I-130 and I-485");
    const a = $$("#f130 .fr");
    const c = $$("#f485 .fr");
    const order = a.flatMap((r, i) => [r, c[i]]).filter(Boolean);
    order.forEach((r, i) =>
      later(() => {
        type($(".v", r), $(".v", r).dataset.v, 260);
        r.classList.add("f");
      }, 120 + i * 140),
    );
    count($("#c130"), 160, 1700);
    count($("#c485"), 159, 1700);
    count(T.ans, 319, 1700);
    addMinutes(319 * EST.answer, 1700);
    setPct(100);
    later(() => {
      count(T.forms, 2);
      addMinutes(2 * EST.form);
      $("#ready").classList.add("in");
      status("Ready for your review and signature");
    }, 1900);
    later(() => {
      show("package");
      stepTo(3);
      status("Package next");
    }, 4000);
  };
  const build = () => {
    $("#pkgGo").classList.add("gone");
    $("#pkgwrap").classList.add("built");
    status("Assembling in USCIS's order");
    const sheets = $$(".sh", demo);
    const items = $$("#plist li");
    sheets.forEach((s, i) =>
      later(() => {
        s.classList.add("in");
        items[i].classList.add("in");
        count(T.pkg, i + 1, 150);
      }, 150 + i * 230),
    );
    later(() => {
      $("#pbadges").classList.add("in");
      status("Package ready to sign");
    }, 150 + sheets.length * 230 + 200);
    later(() => {
      $("#doneH").textContent = (S.min / 60).toFixed(1);
      $("#doneO").classList.add("on");
      $$("#steps li").forEach((l) => {
        l.classList.remove("on");
        l.classList.add("done");
      });
      $("#doneO .btn").focus({ preventScroll: true });
    }, 150 + sheets.length * 230 + 1500);
  };

  $("#try").addEventListener("click", (event) => {
    const b = event.target.closest("[data-act],[data-src]");
    if (!b) return;
    if (b.dataset.src) return srcSwitch(b.dataset.src);
    const act = b.dataset.act;
    if (act === "drop") drop();
    else if (act === "ok") resolve("Marked OK by you · attorney reviewed · just now");
    else if (act === "ask") {
      $("#need").classList.add("asking");
      status("Message drafted in Spanish");
    } else if (act === "send") send();
    else if (act === "fill") fill();
    else if (act === "build") build();
    else if (act === "again") reset();
  });
  reset();
}

// ---------------- "How Arcadia works": the step in the middle of the screen picks the picture ----------------
const storySteps = $$(".hs");
const storyPics = $$(".hv .vis");
if (storySteps.length && storyPics.length) {
  // On phones each step shows its own picture underneath.
  storySteps.forEach((s, i) => {
    const copy = storyPics[i].cloneNode(true);
    copy.classList.add("inline", "on");
    s.appendChild(copy);
  });
  const showStep = (i) => {
    storySteps.forEach((s, k) => s.classList.toggle("on", k === i));
    storyPics.forEach((v, k) => v.classList.toggle("on", k === i));
  };
  showStep(0);
  if ("IntersectionObserver" in window) {
    const middle = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) showStep(Number(entry.target.dataset.v));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    storySteps.forEach((s) => middle.observe(s));
  }
}

// ---------------- the workspace tiles ----------------
$$("#today .todo").forEach((t) =>
  t.addEventListener("click", () => {
    t.classList.toggle("x");
    t.setAttribute("aria-pressed", String(t.classList.contains("x")));
  }),
);

const caseTabs = $$("#ctabs button");
const caseLists = $$(".clist");
caseTabs.forEach((t) =>
  t.addEventListener("click", () => {
    caseTabs.forEach((x) => x.classList.toggle("on", x === t));
    caseTabs.forEach((x) => x.setAttribute("aria-selected", String(x === t)));
    caseLists.forEach((l, i) => l.classList.toggle("on", i === Number(t.dataset.l)));
  }),
);

const ANSWERS = [
  {
    text: "Four things: the prior marriage dates to confirm, the spelling of Castillo, the renewed lease from the client, and your signature on the I-130 and I-485.",
    sources: ["Divorce judgment · p.2", "Passport · p.1", "Chat · Nov 9"],
  },
  {
    text: "Brooks & Ruiz Soto: evidence response due Dec 7. Whitfield & Reyes Castillo: medical exam Dec 1. Kowalski & Wang: interview Jan 14, notice read.",
    sources: ["Evidence request · p.1", "Call notes · Nov 4", "Interview notice · p.1"],
  },
];
const answerBox = $("#ans");
$$("#askq .qb").forEach((b) =>
  b.addEventListener("click", () => {
    $$("#askq .qb").forEach((x) => x.classList.toggle("on", x === b));
    const a = ANSWERS[Number(b.dataset.a)];
    answerBox.innerHTML = `<span class="tx"></span><div class="srcs" style="opacity:0">${a.sources.map((s) => `<span class="src">${s}</span>`).join("")}</div>`;
    const tx = $(".tx", answerBox);
    const sr = $(".srcs", answerBox);
    if (reduceMotion) {
      tx.textContent = a.text;
      sr.style.opacity = 1;
      return;
    }
    let i = 0;
    const tick = () => {
      i += 2;
      tx.textContent = a.text.slice(0, i);
      if (i < a.text.length) setTimeout(tick, 12);
      else sr.style.opacity = 1;
    };
    tick();
  }),
);

const callButton = $("#call .cbtn");
if (callButton) {
  callButton.addEventListener("click", () => {
    if (callButton.classList.contains("saved")) return;
    $("#call .callout").classList.add("on");
    callButton.textContent = "Saved to the case ✓";
    callButton.classList.add("saved");
  });
}

const MESSAGES = {
  en: "We received your marriage certificate. Next, please send proof that you live together, like a lease or a joint bank statement.",
  es: "Recibimos su certificado de matrimonio. Ahora, envíenos un comprobante de que viven juntos, como un contrato de arrendamiento o un estado de cuenta conjunto.",
  zh: "我们已收到您的结婚证书。下一步：请上传共同住址证明，例如租约或联名银行账单。",
};
const langMsg = $("#langMsg");
$$("#lang button").forEach((b) =>
  b.addEventListener("click", () => {
    $$("#lang button").forEach((x) => {
      x.classList.toggle("on", x === b);
      x.setAttribute("aria-pressed", String(x === b));
    });
    const lang = b.dataset.g;
    langMsg.lang = lang === "zh" ? "zh-Hans" : lang;
    langMsg.innerHTML = `${MESSAGES[lang]}<small>${lang === "en" ? "Draft" : "Draft translation"} · confirmed by your staff before sending</small>`;
  }),
);

if ("IntersectionObserver" in window) {
  const live = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        if (el.id === "perf") {
          $$("#bars i").forEach((b, i) => setTimeout(() => (b.style.height = `${b.dataset.h}%`), reduceMotion ? 0 : i * 50));
          tween(0, 90, 1400, (v) => ($("#perfH").textContent = Math.round(v)));
          live.unobserve(el);
        } else {
          el.classList.add("live");
        }
      }
    },
    { threshold: 0.3 },
  );
  if ($("#perf")) live.observe($("#perf"));
  $$(".tile").forEach((t) => {
    if ($(".sort", t)) live.observe(t);
  });
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
