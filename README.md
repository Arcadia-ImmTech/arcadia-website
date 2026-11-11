# Arcadia website (arcadiaimmtech.com)

The public marketing site for law firms. Plain HTML and CSS: no build step, no server code, no cookies, no analytics. One form (the demo request), sent by email.

**This repo is PUBLIC.** It holds only the website's own files. Never add product code, internal documents (founder notes, decisions, security notes), client documents or secrets. The product lives in the private repo `Arcadia-ImmTech/Arcadia`.

## Pages
| Page | What it is |
|---|---|
| `index.html` | Home: a full-screen city photograph that stays in place while the product rises over it, the statement that lights up as you scroll, "Prepare a case in four clicks" on a dark stage (a working miniature of Arcadia with a fictional sample case: drag the files in, and it times you), how Arcadia works (six panels that move sideways as you scroll), why Arcadia (a switch from legacy software to Arcadia), the workspace (tiles that respond, with a command bar you can type in), "Count it for your firm" (a slider on Arcadia's own estimate), built for trust, the founders, and the closing invitation over the city at night |
| `product.html` | The AI case workspace: the six steps, five features with pictures of the product (fictional sample cases), and what else is built in |
| `security.html` | Security and trust: where Arcadia stops, your clients' information, how Arcadia writes |
| `company.html` | What we believe, who we serve, the founders |
| `demo.html` | Request a demo: what happens next, the form and the questions |
| `privacy.html` | Privacy notice |

Every page carries the same header (logo, Try it, Product, Security, Company, Request a demo) and the same footer. They're written out in each file, so change all six when you change one. Links to the old site's sections (`/#demo`, `/#team`, `/#faq`, `/#inside`, `/#tour`) are sent to their new places by `assets/site.js`; `company.html#founders`, `product.html#features`, `product.html#clients` and `demo.html#faq` still exist.

## Files
| File | What it is |
|---|---|
| `assets/styles.css` | Brand colors, type and the layout of every page |
| `assets/site.js` | The script every page uses: the header over the photograph, the phone menu, sections rising into view, the statement lighting up, the demo request form. No tracking |
| `assets/home.css`, `assets/home.js` | The home page's own pieces: the pinned opening, the four-click miniature, the sideways story, the switch, the workspace tiles, the slider. No tracking, nothing sent anywhere |
| `assets/brand/` | The logo as vector files, taken from the Brand Identity Packet's own artwork (see below) |
| `assets/img/product/*.jpg` | Pictures of the product with fictional sample cases |
| `assets/img/photo/` | Photographs, each at two or three widths for phones and large screens |
| `assets/og.jpg` | The picture shown when the link is shared |
| `assets/fonts/` | Manrope and Space Grotesk, served from the site itself (SIL Open Font License, the license text beside each font) |
| `assets/favicon.svg`, `assets/favicon.png`, `assets/apple-touch-icon.png` | Browser-tab and phone icons, from the monogram |

## The logo
The files in `assets/brand/` are the vector artwork from the Brand Identity Packet (2026), lifted from the packet's
PDF: the wordmark, the monogram ("the cradle") and its small version for sizes under 48px, and the stacked and
horizontal lockups. Place them; never retype the wordmark in a font.

- `sprite.svg` holds the wordmark, monograms and lockups for the pages. The letters take the text color, and the dot
  takes `--dot` (terracotta), so one file serves every colorway.
- `arcadia-*.svg` are standalone files in fixed colors, for anything outside the website.
- `favicon.svg` is the small monogram; its letter turns ivory when the browser is in dark mode. Browsers that can't
  show SVG icons get `favicon.png`, the ivory tile.

## Photographs
From Unsplash, under the Unsplash License (free for commercial use; no permission or credit needed), graded warm.
Places only: no people, hands or staged rooms. In use:

| File | Unsplash photo |
|---|---|
| `la-dusk` | photo-1515896769750-31548aa180ed |
| `la-night` | photo-1444723121867-7a241cacace9 |

The product pictures in `assets/img/product/` are screenshots of Arcadia with fictional sample cases.

## Preview on this Mac
```bash
cd ~/Code/arcadia-website && python3 -m http.server 4100 --bind 127.0.0.1
```
Then open http://127.0.0.1:4100 in Chrome. Press Ctrl+C in Terminal to stop.

## Wording rules
Written for law firms only, in the packet's voice: calm, precise, warm, confident. It sells what the attorney gets
(time, fewer hands needed, accuracy, deadlines kept, one place for the firm) and shows the product working. Say
"AI case workspace", "verified and sourced", "ready for attorney review", "more cases without more hires". Never
"robot lawyer", "replaces your staff", "guaranteed approval", "instant visa" or "eligibility score". Neutral words:
never eligible, ineligible, approve, deny or "should file", and never "compliant" or a certification. No customer
counts, results, testimonials or claims that aren't true; the only figures are a fictional sample case's own and
Arcadia's estimate of paralegal time, labelled as an estimate. The security page states only what the privacy notice
and the firm agreement already promise. Arcadia never gives legal advice; the footer says it isn't a law firm.
Headlines and buttons in sentence case; the wordmark always lowercase.

## The demo request form
"Request a demo" leads to `demo.html`, a short form (name, work email, law firm, role, attorneys at the firm, optional
phone and message, and a tick confirming a law firm). `assets/site.js` posts it to `INQUIRY_ENDPOINT`, a Google Apps
Script web app in Arcadia's Google Workspace that emails both founders, with Reply going to the visitor. While
`INQUIRY_ENDPOINT` is empty, the form opens the visitor's own email app with the request filled in instead. A hidden
field and the time the page was opened keep out most automated spam. The privacy page says what the form collects;
keep it in step with the form's fields.

## Design
White and spacious, in the Brand Identity Packet's colors and type: Manrope set very large for headlines and text,
Space Grotesk for small spaced-out labels and figures. Espresso carries the words and the dark sections, ivory and
sand fill soft panels, and terracotta stays rare, like the dot: it marks the places a person must act. The home page
opens on a full-screen photograph and closes on another; the product is shown working, in miniatures drawn in HTML
and in real screenshots of fictional sample cases.

On phones the menu becomes a full-screen sheet, the four-click miniature shows one step at a time, the scrolling
story shows each step with its own picture, and form fields use 16px text (so iPhone doesn't zoom in). Visitors who
ask for less motion get the pages without animation.
