# Arcadia website (arcadiaimmtech.com)

The public marketing site for law firms. Plain HTML and CSS: no build step, no server code, no cookies, no analytics. One form (the demo request), sent by email.

**This repo will be PUBLIC.** It holds only the website's own files. Never add product code, internal documents (founder notes, decisions, security notes), client documents or secrets. The product lives in the private repo `Arcadia-ImmTech/Arcadia`.

## Pages
| Page | What it is |
|---|---|
| `index.html` | Home: the hero, the problem, how Arcadia works (AI reads, code checks, attorneys decide), what changes, a look inside, clients in their language, where Arcadia stops, Los Angeles, and the closing invitation |
| `product.html` | The AI case workspace: the three steps and the six features, each with a product picture |
| `security.html` | Security and trust: where Arcadia stops, client information, how Arcadia writes |
| `company.html` | AI in service of people: the dot, the name, who we serve, personality, founders |
| `demo.html` | Book a demo: the request form and the questions |
| `privacy.html` | Privacy notice |

Every page carries the same header (logo, Product, Security, Company, Book a demo) and the same footer. They're
written out in each file, so change all six when you change one. Links to the old one-page site's sections
(`/#demo`, `/#team`, `/#faq`, `/#inside`) are sent to their new places by `assets/site.js`.

## Files
| File | What it is |
|---|---|
| `assets/styles.css` | Brand colors, type and the layout of every page |
| `assets/site.js` | The only script: the header over the hero, phone menu, sections rising into view, the "How Arcadia works" steps, the product pictures' arrows, the sample client view's languages, photographs drifting on scroll, the phone's demo button, the demo request form. No tracking |
| `assets/brand/` | The logo as vector files, taken from the Brand Identity Packet's own artwork (see below) |
| `assets/img/*.jpg` | Cropped glimpses of the product, from fictional sample cases |
| `assets/img/photo/` | Photographs, each at two or three widths for phones and large screens |
| `assets/og.jpg` | The picture shown when the link is shared |
| `assets/fonts/` | Space Grotesk, served from the site itself (Open Font License) |
| `assets/favicon.svg`, `assets/favicon.png`, `assets/apple-touch-icon.png` | Browser-tab and phone icons, from the monogram |

## The logo
The files in `assets/brand/` are the vector artwork from the Brand Identity Packet (2026), lifted from the packet's
PDF: the wordmark, the monogram ("the cradle") and its small version for sizes under 48px, and the stacked and
horizontal lockups. Place them; never retype the wordmark in a font.

- `sprite.svg` holds the wordmark, monograms and lockups for the pages. The letters take the text color, and the dot
  takes `--dot` (terracotta, or espresso on a terracotta ground), so one file serves every colorway.
- `arcadia-*.svg` are standalone files in fixed colors, for anything outside the website.
- `favicon.svg` is the small monogram; its letter turns ivory when the browser is in dark mode. Browsers that can't
  show SVG icons get `favicon.png`, the ivory tile.
- Over photographs, the header becomes a frosted ivory bar once the page scrolls: the packet's holding shape.

## Photographs
From Unsplash, under the Unsplash License (free for commercial use; no permission or credit needed). Each was graded
warm toward espresso and ivory so they read as one set. The source files, by Unsplash photo ID:

| File | Unsplash photo |
|---|---|
| `la-night` | photo-1444723121867-7a241cacace9 |
| `la-dusk` | photo-1515896769750-31548aa180ed |
| `earth-night` | photo-1451187580459-43490279c0fa |
| `family-poppies` | photo-1588979355313-6711a095465f |
| `consult-window` | photo-1573497491208-6b1acb260507 |
| `consult-table` | photo-1573497620053-ea5300f94f21 |
| `late-window` | photo-1497493292307-31c376b6e479 |
| `signing` | photo-1521791055366-0d553872125f |
| `library` | photo-1481627834876-b7833e8f5570 |
| `pen` | photo-1455390582262-044cdead277a |
| `notes` | photo-1434030216411-0b793f4b4173 |
| `beach-group` | photo-1511895426328-dc8714191300 |

Photographs show people in general, never Arcadia's clients or staff. When the founders' own portraits are ready,
they replace the initials in `company.html` (`.avatar`).

## Preview on this Mac
```bash
cd ~/Code/arcadia-website && python3 -m http.server 4100 --bind 127.0.0.1
```
Then open http://127.0.0.1:4100 in Chrome. Press Ctrl+C in Terminal to stop.

## Wording rules
Written for law firms only, in the packet's voice: calm, precise, warm, confident. It sells outcomes (time, money,
accuracy, deadlines, one integrated firm, happier clients) and keeps the "how" for the private demo. Say "AI paralegal",
"case workspace", "verified and sourced", "ready for attorney review", "more cases without more hires". Never "robot
lawyer", "replaces your staff", "guaranteed approval", "instant visa" or "eligibility score". Neutral words: never
eligible, ineligible, approve, deny or "should file", and never "compliant" or a certification. No numbers, customer
counts, testimonials or claims that aren't true; the security page states only what the privacy notice and the firm
agreement already promise. Arcadia never gives legal advice; the footer says it isn't a law firm. Headlines and
buttons in sentence case; the wordmark always lowercase.

## The demo request form
"Book a demo" leads to `demo.html`, a short form (name, work email, law firm, role, attorneys at the firm, optional
phone and message, and a tick confirming a law firm). `assets/site.js` posts it to `INQUIRY_ENDPOINT`, a Google Apps
Script web app in Arcadia's Google Workspace that emails both founders, with Reply going to the visitor. While
`INQUIRY_ENDPOINT` is empty, the form opens the visitor's own email app with the request filled in instead. A hidden
field and the time the page was opened keep out most automated spam. The program and how to set it up are kept in the
private repo (`docs/WEBSITE_INQUIRY_FORM.md`). The privacy page says what the form collects; keep it in step with the
form's fields.

## Design
Calm and cinematic, after the Brand Identity Packet. Full-screen scenes alternate espresso and ivory; type is Space
Grotesk, set large; photographs are graded warm. Ivory leads, espresso carries the words, sand fills, and terracotta
stays rare, like the dot: it marks the places a person must act. Buttons are espresso (ivory on dark grounds). The
product is shown two ways: real screenshots of fictional sample cases, and small scenes drawn in HTML (the sample case
in the hero, the three steps) so they stay sharp at any size.

On phones the menu becomes a full-screen sheet, the three steps stack each above its picture, form fields use 16px
text (so iPhone doesn't zoom in), and a demo button stays at the bottom of the screen until a closing invitation, the
form or the footer is in view. Visitors who ask for less motion get the pages without animation.
