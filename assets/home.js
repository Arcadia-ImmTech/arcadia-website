// The home page's own script, loaded after site.js (it uses site.js's $, $$, tween, reduceMotion and header).
// No tracking, nothing sent anywhere: the sample case is fictional and lives only in the page.
{
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const wide = window.matchMedia("(min-width: 761px)");
  const sideways = window.matchMedia("(min-width: 901px)");

  // ---------------- the opening: the photograph stays, the product rises over it ----------------
  const intro = $("#intro");
  const photo = $(".intro-photo");
  const dim = $(".intro-dim");
  const copy = $(".intro-copy");
  const product = $(".intro-product");
  const cap = $(".intro-cap");
  const cue = $(".scrollcue");

  // ---------------- how Arcadia works: six panels moved sideways by the scroll ----------------
  const story = $("#how");
  const track = $("#storyTrack");
  const countEl = $("#storyN");
  const bar = $("#storyBar");
  const panels = $$(".panel", track);
  const pinned = () => sideways.matches && !reduceMotion;
  const sizeStory = () => {
    story.style.height = pinned() ? `${window.innerHeight + track.scrollWidth - window.innerWidth}px` : "";
    if (!pinned()) track.style.transform = "";
  };
  const showCount = (p) => {
    countEl.textContent = String(Math.round(p * (panels.length - 1)) + 1).padStart(2, "0");
    bar.style.transform = `scaleX(${Math.max(0.02, p).toFixed(3)})`;
  };
  track.addEventListener(
    "scroll",
    () => {
      if (!pinned()) showCount(clamp(track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth)));
    },
    { passive: true },
  );

  let waiting = false;
  const frame = () => {
    waiting = false;
    const vh = window.innerHeight;
    if (wide.matches && !reduceMotion) {
      const p = clamp(window.scrollY / Math.max(1, intro.offsetHeight - vh));
      if (p < 1.05) {
        photo.style.transform = `scale(${(1 + 0.1 * p).toFixed(4)})`;
        dim.style.opacity = (clamp((p - 0.1) / 0.6) * 0.66).toFixed(3);
        copy.style.opacity = (1 - clamp(p / 0.3)).toFixed(3);
        copy.style.transform = `translate3d(0, ${(-p * 170).toFixed(1)}px, 0)`;
        copy.style.pointerEvents = p > 0.2 ? "none" : "";
        const q = easeOut(clamp((p - 0.12) / 0.62));
        product.style.opacity = clamp((p - 0.12) / 0.22).toFixed(3);
        product.style.transform = `translate3d(0, ${((1 - q) * 62).toFixed(2)}vh, 0) scale(${(0.93 + 0.07 * q).toFixed(4)})`;
        cap.style.opacity = clamp((p - 0.7) / 0.18).toFixed(3);
        cue.style.opacity = p > 0.04 ? 0 : 1;
      }
    }
    if (pinned()) {
      const r = story.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, story.offsetHeight - vh));
      track.style.transform = `translate3d(${(-p * (track.scrollWidth - window.innerWidth)).toFixed(1)}px, 0, 0)`;
      showCount(p);
    }
  };
  const ask = () => {
    if (!waiting) {
      waiting = true;
      requestAnimationFrame(frame);
    }
  };
  window.addEventListener("scroll", ask, { passive: true });
  window.addEventListener("resize", () => {
    sizeStory();
    ask();
  });
  window.addEventListener("load", () => {
    sizeStory();
    ask();
  });
  sizeStory();
  frame();

  // ---------------- "Prepare a case in four clicks" ----------------
  // The time given back uses Arcadia's own estimate per task (a trained paralegal's minutes, less the seconds a person
  // spends reviewing Arcadia's work), the same estimates as the product's Performance page.
  const EST = { doc: 8 - 20 / 60, find: 6 - 30 / 60, answer: 1 - 5 / 60, form: 20 - 120 / 60 };
  const demo = $("#taste");
  const pile = $("#pile");
  const target = $("#target");
  const pctEl = $("#pct");
  const meter = $("#meter");
  const statusEl = $("#status");
  const hrs = $("#hrs");
  const clock = $("#tm");
  const docsEl = $("#tDocs");
  const ansEl = $("#tAns");
  let S = { pct: 0, min: 0, docs: 0, t0: 0, started: false };
  let timers = [];
  let ticking = null;
  const later = (fn, ms) => timers.push(setTimeout(fn, reduceMotion ? Math.min(ms, 60) : ms));
  const status = (t) => (statusEl.textContent = t);
  const elapsed = () => (performance.now() - S.t0) / 1000;
  const clockText = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
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
  const count = (el, to, ms = 400) => tween(Number(el.textContent) || 0, to, ms, (x) => (el.textContent = Math.round(x)));
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
    if (reduceMotion) return void (el.textContent = text);
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
    clearInterval(ticking);
    S = { pct: 0, min: 0, docs: 0, t0: 0, started: false };
    meter.style.width = "0%";
    pctEl.textContent = "0";
    hrs.textContent = "0.0";
    clock.textContent = "0:00";
    docsEl.textContent = "0";
    ansEl.textContent = "0";
    pile.classList.remove("gone", "drag");
    pile.style.transform = "";
    target.classList.remove("over");
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

  // Step 1: the files go into the case, dragged or clicked.
  const drop = () => {
    if (S.started) return;
    S.started = true;
    S.t0 = performance.now();
    ticking = setInterval(() => (clock.textContent = clockText(elapsed())), 200);
    const a = pile.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const now = new DOMMatrixReadOnly(getComputedStyle(pile).transform);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2) + now.m41;
    const dy = b.top + b.height / 2 - (a.top + a.height / 2) + now.m42;
    pile.classList.remove("drag");
    pile.style.transform = `translate(${dx.toFixed(0)}px, ${dy.toFixed(0)}px) scale(0.35)`;
    pile.classList.add("gone");
    status("Reading 8 documents");
    later(() => {
      show("read");
      const rows = $$(".rr", demo);
      rows.forEach((r, i) => {
        later(() => r.classList.add("in"), 80 + i * 150);
        later(() => {
          r.classList.add("done");
          S.docs += 1;
          count(docsEl, S.docs, 200);
          addMinutes(EST.doc, 300);
          setPct(Math.round((68 * (i + 1)) / rows.length));
        }, 80 + i * 150 + 420);
      });
      const end = 80 + rows.length * 150 + 560;
      later(() => {
        $("#rsum").classList.add("in");
        addMinutes(EST.find);
        status("1 needs you");
      }, end);
      later(() => {
        show("review");
        stepTo(1);
      }, end + 1500);
    }, 480);
  };
  let grab = null;
  const overTarget = () => {
    const a = pile.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const x = a.left + a.width / 2;
    const y = a.top + a.height / 2;
    return x > b.left - 24 && x < b.right + 24 && y > b.top - 24 && y < b.bottom + 24;
  };
  pile.addEventListener("pointerdown", (e) => {
    if (S.started) return;
    grab = { x: e.clientX, y: e.clientY, moved: false };
    pile.setPointerCapture(e.pointerId);
    pile.classList.add("drag");
  });
  pile.addEventListener("pointermove", (e) => {
    if (!grab) return;
    const dx = e.clientX - grab.x;
    const dy = e.clientY - grab.y;
    if (Math.hypot(dx, dy) > 6) grab.moved = true;
    pile.style.transform = `translate(${dx}px, ${dy}px) rotate(${(dx * 0.015).toFixed(2)}deg)`;
    target.classList.toggle("over", overTarget());
  });
  const release = () => {
    if (!grab) return;
    const go = overTarget() || !grab.moved;
    grab = null;
    target.classList.remove("over");
    if (go) return drop();
    pile.classList.remove("drag");
    pile.style.transform = "";
  };
  pile.addEventListener("pointerup", release);
  pile.addEventListener("pointercancel", release);
  pile.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    drop();
  });

  // Step 2: the one thing that needs the attorney.
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
      count(docsEl, S.docs);
      addMinutes(EST.doc);
      status("Mariana replied · file checked");
    }, 1000);
    later(() => resolve("Settled by the final decree (p.3) · confirmed by you · just now"), 2300);
  };

  // Step 3: the forms.
  const fill = () => {
    const b = $("#fillBtn");
    b.classList.add("quiet");
    b.disabled = true;
    b.textContent = "Forms filled";
    status("Drafting the I-130 and I-485");
    const left = $$("#f130 .fr");
    const right = $$("#f485 .fr");
    left
      .flatMap((r, i) => [r, right[i]])
      .filter(Boolean)
      .forEach((r, i) =>
        later(() => {
          type($(".v", r), $(".v", r).dataset.v, 260);
          r.classList.add("f");
        }, 120 + i * 140),
      );
    count($("#c130"), 160, 1700);
    count($("#c485"), 159, 1700);
    count(ansEl, 319, 1700);
    addMinutes(319 * EST.answer, 1700);
    setPct(100);
    later(() => {
      addMinutes(2 * EST.form);
      $("#ready").classList.add("in");
      status("Ready for your review and signature");
    }, 1900);
    later(() => {
      show("package");
      stepTo(3);
      status("Package next");
    }, 3800);
  };

  // Step 4: the package, then the result.
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
      }, 150 + i * 230),
    );
    later(() => {
      $("#pbadges").classList.add("in");
      status("Package ready to sign");
    }, 150 + sheets.length * 230 + 200);
    later(() => {
      clearInterval(ticking);
      const s = Math.max(1, Math.round(elapsed()));
      clock.textContent = clockText(s);
      $("#doneT").textContent = s < 60 ? `${s} seconds` : `${Math.floor(s / 60)} min ${s % 60} s`;
      $("#doneH").textContent = (S.min / 60).toFixed(1);
      $("#doneO").classList.add("on");
      $$("#steps li").forEach((l) => {
        l.classList.remove("on");
        l.classList.add("done");
      });
      $("#doneO .btn").focus({ preventScroll: true });
    }, 150 + sheets.length * 230 + 1400);
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

  // ---------------- why Arcadia: the switch ----------------
  const flip = $("#flip");
  const sides = $$("#switch button");
  const knob = $("#switch .knob");
  const setSide = (side) => {
    flip.dataset.side = side;
    sides.forEach((b) => {
      const on = b.dataset.side === side;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", String(on));
      if (on) {
        knob.style.left = `${b.offsetLeft}px`;
        knob.style.width = `${b.offsetWidth}px`;
      }
    });
  };
  sides.forEach((b) => b.addEventListener("click", () => setSide(b.dataset.side)));
  setSide("old");
  window.addEventListener("resize", () => setSide(flip.dataset.side));
  if ("IntersectionObserver" in window && !reduceMotion) {
    const once = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        once.disconnect();
        setTimeout(() => setSide("new"), 900);
      },
      { threshold: 0.55 },
    );
    once.observe(flip);
  } else {
    setSide("new");
  }

  // ---------------- the command bar tile ----------------
  const CASES = [
    ["Whitfield & Reyes Castillo", "Needs you · 1"],
    ["Brooks & Ruiz Soto", "Evidence response due Dec 7"],
    ["Turner & Chen", "Ready for your signature"],
    ["Kowalski & Wang", "Interview Jan 14"],
    ["Morrison & Paredes Vega", "Reading 6 of 11"],
    ["Novak & Ibarra", "Waiting on the client"],
    ["Haddad & Moreno", "Questionnaire sent"],
    ["Log a call", "Action"],
    ["New case from a note", "Action"],
  ];
  const kin = $("#kin");
  const kres = $("#kres");
  let ksel = 0;
  let kshown = [];
  const plain = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const safe = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const mark = (name, q) => {
    const at = q ? plain(name).indexOf(q) : -1;
    return at < 0 ? safe(name) : `${safe(name.slice(0, at))}<mark>${safe(name.slice(at, at + q.length))}</mark>${safe(name.slice(at + q.length))}`;
  };
  const drawK = () => {
    const q = plain(kin.value.trim());
    kshown = CASES.filter(([name]) => plain(name).includes(q)).slice(0, 4);
    ksel = Math.min(ksel, Math.max(0, kshown.length - 1));
    kres.innerHTML = kshown.length
      ? kshown.map(([name, where], i) => `<li role="option" data-k="${i}" class="${i === ksel ? "sel" : ""}"><span>${mark(name, q)}</span><small>${where}</small></li>`).join("")
      : '<li class="none">No case by that name.</li>';
  };
  const openK = (i) => {
    const hit = kshown[i];
    if (!hit) return;
    kres.innerHTML = `<li class="opened"><b>${safe(hit[0])}</b>${hit[1] === "Action" ? "Ready when you are." : `Opened · ${hit[1]}`}</li>`;
    kin.value = "";
    setTimeout(drawK, 1800);
  };
  kin.addEventListener("input", () => {
    ksel = 0;
    drawK();
  });
  kin.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      ksel = clamp(ksel + (e.key === "ArrowDown" ? 1 : -1), 0, kshown.length - 1);
      drawK();
    } else if (e.key === "Enter") {
      openK(ksel);
    }
  });
  kres.addEventListener("click", (e) => {
    const li = e.target.closest("[data-k]");
    if (li) openK(Number(li.dataset.k));
  });
  drawK();

  // ---------------- count it for your firm ----------------
  // 6.6 hours is the sample case above: 8 documents read, 1 problem written up, 319 form answers drafted and 2 USCIS
  // forms filled, at Arcadia's estimate of a paralegal's time for each, less the time spent reviewing.
  const HOURS_A_CASE = 6.6;
  const casesIn = $("#cCases");
  const rateIn = $("#cRate");
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const fillOf = (el) => el.style.setProperty("--fill", `${((el.value - el.min) / (el.max - el.min)) * 100}%`);
  const countIt = () => {
    const cases = Number(casesIn.value);
    const rate = Number(rateIn.value);
    const hours = cases * HOURS_A_CASE;
    $("#cCasesOut").textContent = cases;
    $("#cRateOut").textContent = `$${rate.toFixed(2)}`;
    $("#oHours").textContent = Math.round(hours);
    $("#oDays").textContent = (hours / 8).toFixed(1);
    $("#oMoney").textContent = money.format(hours * rate);
    fillOf(casesIn);
    fillOf(rateIn);
  };
  casesIn.addEventListener("input", countIt);
  rateIn.addEventListener("input", countIt);
  countIt();

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
}
