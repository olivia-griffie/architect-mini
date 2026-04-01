# architect-mini

> A lightweight, embeddable business card designer widget.  
> Users fill out a form → card updates live → download as PDF or preview in a new tab.

---

## File Structure

```
architect-mini/
├── index.html   ← widget shell & markup
├── styles.css   ← all layout, card, and form styles
├── app.js       ← live preview, zoom, logo upload, PDF/preview logic
└── README.md
```

---

## Features (v0.1)

- ✅ Live preview — card updates as you type
- ✅ Front & back card sides with paginated view
- ✅ Zoom slider (50%–150%)
- ✅ Logo upload (renders on both front & back)
- ✅ Address dropdown
- ✅ Design name field
- ✅ **Preview in Tab** — opens a clean standalone HTML snapshot
- ✅ **Download PDF** — generates a print-ready 3.5×2" PDF via html2canvas + jsPDF (loaded from CDN on demand)
- ✅ Responsive layout (stacks on mobile)

---

## Embedding

### Option 1 — Direct HTML page
Just drop `index.html`, `styles.css`, and `app.js` in the same folder and open `index.html`.

### Option 2 — Squarespace / website builder
Use a **Code Block** or **Embed Block** and paste an `<iframe>`:

```html
<iframe
  src="https://yourdomain.com/architect-mini/index.html"
  width="100%"
  height="700"
  style="border:none;border-radius:16px;"
  title="Business Card Designer"
></iframe>
```

Host the three files anywhere (GitHub Pages, Netlify, Vercel, your own server).

### Option 3 — GitHub Pages
1. Push `index.html`, `styles.css`, `app.js` to a `gh-pages` branch (or `/docs` folder)
2. Enable GitHub Pages in repo Settings
3. Embed the resulting URL as an `<iframe>` in Squarespace or any other site

---

## Roadmap

- [ ] Multiple templates (template picker screen)
- [ ] Text color & font choices
- [ ] Two-phone-number support on front card
- [ ] Form validation & error states
- [ ] Save / load designs (localStorage)
- [ ] High-res PNG export option

---

## Dependencies (CDN — no install needed)

| Library | Purpose | Loaded |
|---|---|---|
| [html2canvas 1.4.1](https://html2canvas.hertzen.com/) | Capture card as image | Lazy (on PDF click) |
| [jsPDF 2.5.1](https://github.com/parallax/jsPDF) | Pack images into PDF | Lazy (on PDF click) |
| [Google Fonts](https://fonts.google.com/) | Cormorant Garamond + DM Sans | `<head>` |

---

## Development Notes

- No build step required — plain HTML/CSS/JS
- Card dimensions follow standard **3.5 × 2 inch** business card ratio
- PDF is generated at **3× scale** for print quality
- The `data-preview` attribute on form inputs wires them automatically to card preview elements — add new fields by matching the attribute to a preview element ID
