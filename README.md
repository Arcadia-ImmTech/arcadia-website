# Arcadia website (arcadiaimmtech.com)

The public marketing site for law firms. Plain HTML and CSS: no build step, no server code, no forms, no cookies, no analytics.

**This repo will be PUBLIC.** It holds only the website's own files. Never add product code, internal documents (founder notes, decisions, security notes), client documents or secrets. The product lives in the private repo `Arcadia-ImmTech/Arcadia`.

## Files
| File | What it is |
|---|---|
| `index.html` | The home page |
| `privacy.html` | Privacy notice: the site collects nothing |
| `assets/styles.css` | Brand colors, fonts and layout |
| `assets/fonts/` | Manrope and Space Grotesk, served from the site itself (Open Font License) |
| `assets/favicon.png`, `assets/apple-touch-icon.png` | Browser-tab and phone icons, from Logo A |

## Preview on this Mac
```bash
cd ~/Code/arcadia-website && python3 -m http.server 4100 --bind 127.0.0.1
```
Then open http://127.0.0.1:4100 in Chrome. Press Ctrl+C in Terminal to stop.

## Wording rules
Written for law firms only. Neutral words: never eligible, ineligible, approve, deny or "should file". No claims that aren't true yet (security certifications, zero data retention, outcomes). Counsel reads the wording before it goes live.
