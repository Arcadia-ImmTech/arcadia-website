// The Arcadia website's only script. No tracking, no cookies, nothing sent anywhere: it draws a line under the header
// on scroll, lets sections rise into view, switches the product tabs, and runs the private-demo invitation.

// A thin line under the header once the page scrolls.
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

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

// "A look inside": tabs, with arrow keys moving between them.
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

// The private-demo invitation: two quick questions, then the link to book a time. The answers are only used to move to
// the next step; they aren't stored or sent. Without dialog support the buttons simply lead to the demo section.
const invitation = document.getElementById("invitation");
if (invitation && typeof invitation.showModal === "function") {
  const show = (name) => {
    for (const step of invitation.querySelectorAll("[data-step]")) step.hidden = step.dataset.step !== name;
    invitation.querySelector(`[data-step="${name}"] button, [data-step="${name}"] a`)?.focus();
  };
  document.querySelectorAll("[data-invite]").forEach((el) =>
    el.addEventListener("click", (event) => {
      event.preventDefault();
      show("1");
      invitation.showModal();
    }),
  );
  invitation.querySelectorAll("[data-next]").forEach((el) => el.addEventListener("click", () => show(el.dataset.next)));
  invitation.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", () => invitation.close()));
  // A click on the dimmed backdrop closes it too.
  invitation.addEventListener("click", (event) => {
    if (event.target === invitation) invitation.close();
  });
}
