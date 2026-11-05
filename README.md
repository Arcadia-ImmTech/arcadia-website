# Arcadia website (arcadiaimmtech.com)

The public marketing site for law firms. Plain HTML and CSS: no build step, no server code, no cookies, no analytics. One form (the demo request), sent by email.

**This repo will be PUBLIC.** It holds only the website's own files. Never add product code, internal documents (founder notes, decisions, security notes), client documents or secrets. The product lives in the private repo `Arcadia-ImmTech/Arcadia`.

## Files
| File | What it is |
|---|---|
| `index.html` | The home page |
| `privacy.html` | Privacy notice |
| `assets/styles.css` | Brand colors, fonts, the logo and the layout |
| `assets/site.js` | The only script: header line, phone menu, sections rising into view, the product tabs, the phone's demo button, the demo request form. No tracking |
| `assets/img/` | Cropped glimpses of the product, from fictional sample cases |
| `assets/og.png` | The picture shown when the link is shared |
| `assets/fonts/` | Manrope and Space Grotesk, served from the site itself (Open Font License) |
| `assets/favicon.png`, `assets/apple-touch-icon.png` | Browser-tab and phone icons |

## The logo
Lowercase "arcadia" in Manrope Bold (700), letter spacing -0.03em, with the i's dot a terracotta circle 0.2em wide,
its top 0.081em below the top of the letter box and nudged 0.012em right to sit over the stem. These numbers match
Murphy's final logo file (November 2026) to within a pixel; keep them the same in the product.

## Preview on this Mac
```bash
cd ~/Code/arcadia-website && python3 -m http.server 4100 --bind 127.0.0.1
```
Then open http://127.0.0.1:4100 in Chrome. Press Ctrl+C in Terminal to stop.

## Wording rules
Written for law firms only. It sells outcomes (time, money, accuracy, deadlines, one integrated firm, happier
clients) and keeps the "how" for the private demo. Neutral words: never eligible, ineligible, approve, deny or "should
file", and never "compliant" or a certification. No numbers, customer counts, testimonials or claims that aren't true.
Arcadia never gives legal advice; the footer says it isn't a law firm.

## The demo request form
"Request a private demo" leads to a short form (name, work email, law firm, role, attorneys at the firm, optional phone
and message, and a tick confirming a law firm). `assets/site.js` posts it to `INQUIRY_ENDPOINT`, a Google Apps Script
web app in Arcadia's Google Workspace that emails both founders, with Reply going to the visitor. While
`INQUIRY_ENDPOINT` is empty, the form opens the visitor's own email app with the request filled in instead. A hidden
field and the time the page was opened keep out most automated spam. The program and how to set it up are kept in the
private repo (`docs/WEBSITE_INQUIRY_FORM.md`). The privacy page says what the form collects; keep it in step with the
form's fields.

## Design
Editorial and calm: hairline rules instead of boxes, square-cornered buttons, quiet shadows, numbered sections. On
phones the menu becomes a sheet, the product pictures stack with their titles, form fields use 16px text (so iPhone
doesn't zoom in), and a demo button stays at the bottom of the screen until the form is in view.
