# Arcadia website (arcadiaimmtech.com)

The public marketing site for law firms. Plain HTML and CSS: no build step, no server code, no forms, no cookies, no analytics.

**This repo will be PUBLIC.** It holds only the website's own files. Never add product code, internal documents (founder notes, decisions, security notes), client documents or secrets. The product lives in the private repo `Arcadia-ImmTech/Arcadia`.

## Files
| File | What it is |
|---|---|
| `index.html` | The home page |
| `privacy.html` | Privacy notice |
| `assets/styles.css` | Brand colors, fonts, the logo and the layout |
| `assets/site.js` | The only script: header line, sections rising into view, the product tabs, the private-demo invitation. No tracking |
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

## Booking a demo
The demo invitation asks two questions (not stored or sent anywhere), then links to Murphy's Google Calendar booking
page, which opens in a new tab. Nothing loads from Google until a visitor clicks; the privacy page says so.
