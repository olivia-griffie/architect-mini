/**
 * architect-mini — app.js
 * Handles live preview updates, zoom, logo upload,
 * PDF download (via html2canvas + jsPDF), and tab preview.
 */

/* ─── DOM refs ─────────────────────────────────────── */
const cardWrapper   = document.getElementById('cardWrapper');
const zoomSlider    = document.getElementById('zoomSlider');
const zoomInBtn     = document.getElementById('zoomIn');
const zoomOutBtn    = document.getElementById('zoomOut');
const closePanel    = document.getElementById('closePanel');
const fieldLogo     = document.getElementById('fieldLogo');
const uploadName    = document.getElementById('uploadFilename');
const btnDownload   = document.getElementById('btnDownloadPDF');
const btnPreview    = document.getElementById('btnPreviewTab');
const pageButtons   = document.querySelectorAll('.am-page-btn');
const cardFront     = document.getElementById('cardFront');
const cardBack      = document.getElementById('cardBack');
const designName    = document.getElementById('designName');

/* ─── Live field → preview binding ──────────────────── */
// All inputs/selects with data-preview wired automatically
document.querySelectorAll('[data-preview]').forEach(input => {
  const targetId = input.dataset.preview;
  const target   = document.getElementById(targetId);
  if (!target) return;

  // Sync back targets that mirror the same field
  const mirrorMap = {
    previewCompany:  'previewBackCompany',
    previewTagline:  'previewBackTagline',
    previewWebsite:  null, // back only
  };

  input.addEventListener('input', () => {
    const val = input.value.trim();
    target.textContent = val || input.placeholder || '';

    // Keep back-of-card in sync
    if (mirrorMap[targetId]) {
      const mirror = document.getElementById(mirrorMap[targetId]);
      if (mirror) mirror.textContent = val || input.placeholder || '';
    }
  });
});

/* ─── Last name gets a leading space for display ───── */
const fieldLastName = document.getElementById('fieldLastName');
const previewLast   = document.getElementById('previewLastName');
fieldLastName.addEventListener('input', () => {
  previewLast.textContent = fieldLastName.value.trim()
    ? ' ' + fieldLastName.value.trim()
    : ' LOU WAN';
});

/* ─── Zoom ───────────────────────────────────────────── */
function applyZoom(val) {
  const scale = val / 100;
  cardWrapper.style.transform = `scale(${scale})`;
  // Update slider gradient fill
  zoomSlider.style.background =
    `linear-gradient(to right, var(--accent) ${val}%, var(--border) ${val}%)`;
}

zoomSlider.addEventListener('input', () => applyZoom(zoomSlider.value));
zoomInBtn.addEventListener('click', () => {
  zoomSlider.value = Math.min(150, +zoomSlider.value + 10);
  applyZoom(zoomSlider.value);
});
zoomOutBtn.addEventListener('click', () => {
  zoomSlider.value = Math.max(50, +zoomSlider.value - 10);
  applyZoom(zoomSlider.value);
});
applyZoom(100);

/* ─── Pagination (front / back toggle) ───────────────── */
pageButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    pageButtons.forEach(b => b.classList.remove('am-page-btn--active'));
    btn.classList.add('am-page-btn--active');

    const page = btn.dataset.page;
    if (page === '1') {
      cardFront.style.display = '';
      cardBack.style.display  = 'none';
      document.querySelectorAll('.am-card-label')[0].style.display = '';
      document.querySelectorAll('.am-card-label')[1].style.display = 'none';
    } else {
      cardFront.style.display = 'none';
      cardBack.style.display  = '';
      document.querySelectorAll('.am-card-label')[0].style.display = 'none';
      document.querySelectorAll('.am-card-label')[1].style.display = '';
    }
  });
});

/* ─── Logo upload ────────────────────────────────────── */
fieldLogo.addEventListener('change', () => {
  const file = fieldLogo.files[0];
  if (!file) return;

  uploadName.textContent = file.name;
  const reader = new FileReader();
  reader.onload = e => {
    const src = e.target.result;
    // Replace placeholder SVGs with the uploaded image
    ['previewLogoFront', 'previewLogoBack'].forEach(id => {
      const area = document.getElementById(id);
      area.innerHTML = `<img src="${src}" alt="Logo" />`;
    });
  };
  reader.readAsDataURL(file);
});

/* ─── Close panel (hide right panel) ────────────────── */
closePanel.addEventListener('click', () => {
  const panel = document.getElementById('amRightPanel');
  panel.style.display = panel.style.display === 'none' ? '' : 'none';
});

/* ─── Collect current card data ──────────────────────── */
function getCardData() {
  return {
    designName: designName.value || 'My Design',
    firstName:  document.getElementById('fieldFirstName').value || 'First Name',
    lastName:   document.getElementById('fieldLastName').value  || 'Last Name',
    title:      document.getElementById('fieldTitle').value     || 'Title',
    phone:      document.getElementById('fieldPhone').value     || '(888)-888-8888',
    email:      document.getElementById('fieldEmail').value     || 'email@example.com',
    address:    document.getElementById('fieldAddress').value   || '132 9th Street…',
    company:    document.getElementById('fieldCompany').value   || 'CREATIVE DEVELOPERS',
    tagline:    document.getElementById('fieldTagline').value   || 'Ideas Developed By Creative Experts!',
    website:    document.getElementById('fieldWebsite').value   || 'www.creativedevelopers.com',
  };
}

/* ─── Build a standalone HTML snapshot of both cards ─── */
function buildPreviewHTML(data) {
  // Capture logo src if uploaded
  const logoFrontImg  = document.querySelector('#previewLogoFront img');
  const logoSrc       = logoFrontImg ? logoFrontImg.src : null;
  const logoHTML      = logoSrc
    ? `<img src="${logoSrc}" style="width:100%;height:100%;object-fit:contain;" />`
    : `<svg viewBox="0 0 60 60" fill="none" style="width:48px;height:48px"><path d="M30 5 L55 30 L30 55 L5 30 Z" stroke="#00C8C8" stroke-width="2.5" fill="none"/><path d="M20 30 L30 15 L40 30 L30 45 Z" stroke="#00C8C8" stroke-width="2" fill="none"/></svg>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${data.designName} — Preview</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700&display=swap" rel="stylesheet"/>
  <style>
    body{font-family:'DM Sans',sans-serif;background:#F4F3F8;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:1.5rem;padding:2rem;}
    h1{font-size:1.1rem;color:#1A1A2E;font-weight:500;margin-bottom:.25rem;}
    .card{width:380px;height:212px;border-radius:8px;overflow:hidden;position:relative;box-shadow:0 6px 24px rgba(27,42,74,0.22);}
    .card-label{font-size:.72rem;color:#7A7A99;text-align:center;margin-top:.4rem;}
    /* Front */
    .card-bg{position:absolute;inset:0;background:#1B2A4A;}
    .shape-dark{position:absolute;left:0;top:0;width:62%;height:100%;background:#1B2A4A;clip-path:polygon(0 0,100% 0,78% 100%,0 100%);z-index:1;}
    .shape-teal-tri{position:absolute;right:0;bottom:0;width:50%;height:60%;background:#00C8C8;clip-path:polygon(50% 0%,100% 100%,0% 100%);z-index:2;}
    .shape-teal-r{position:absolute;right:0;top:0;width:42%;height:100%;background:#0E1E3A;clip-path:polygon(22% 0,100% 0,100% 100%,0 100%);z-index:1;}
    .front-content{position:relative;z-index:10;display:flex;justify-content:space-between;height:100%;padding:18px 20px 18px 22px;}
    .card-left{display:flex;flex-direction:column;justify-content:center;gap:3px;max-width:55%;}
    .card-name{font-size:.85rem;font-weight:300;color:white;letter-spacing:.04em;line-height:1.3;}
    .card-name strong{font-weight:700;}
    .card-title{font-size:.62rem;color:white;opacity:.85;font-weight:300;}
    .divider{width:28px;height:2px;background:#00C8C8;margin:4px 0 6px;border-radius:1px;}
    .contact{display:flex;flex-direction:column;gap:4px;}
    .contact-row{display:flex;align-items:flex-start;gap:5px;font-size:.55rem;color:white;opacity:.88;line-height:1.35;font-weight:300;}
    .card-right{display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-start;gap:4px;padding-top:4px;}
    .logo-area{width:52px;height:52px;display:flex;align-items:center;justify-content:center;}
    .company{font-size:.58rem;color:white;font-weight:600;letter-spacing:.06em;text-align:right;}
    .tagline{font-size:.48rem;color:white;opacity:.7;text-align:right;font-weight:300;max-width:120px;line-height:1.4;}
    /* Back */
    .back-bg{position:absolute;inset:0;background:#1B2A4A;}
    .back-teal-l{position:absolute;left:0;top:0;width:50%;height:100%;background:#00C8C8;clip-path:polygon(0 0,70% 0,50% 100%,0 100%);z-index:1;}
    .back-teal-b{position:absolute;left:0;bottom:0;width:50%;height:50%;background:#00A5A5;clip-path:polygon(0 50%,55% 0,55% 100%,0 100%);z-index:2;}
    .back-content{position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:5px;}
    .back-company{font-size:.72rem;color:white;font-weight:700;letter-spacing:.1em;}
    .back-tagline{font-size:.52rem;color:white;opacity:.75;font-weight:300;}
    .back-website{font-size:.55rem;color:#00C8C8;margin-top:4px;letter-spacing:.04em;}
  </style>
</head>
<body>
  <h1>${data.designName}</h1>

  <div>
    <div class="card">
      <div class="card-bg">
        <div class="shape-dark"></div>
        <div class="shape-teal-tri"></div>
        <div class="shape-teal-r"></div>
      </div>
      <div class="front-content">
        <div class="card-left">
          <p class="card-name"><strong>${data.firstName}</strong> ${data.lastName}</p>
          <p class="card-title">${data.title}</p>
          <div class="divider"></div>
          <div class="contact">
            <div class="contact-row">📞 ${data.phone}</div>
            <div class="contact-row">📍 ${data.address}</div>
            <div class="contact-row">✉️ ${data.email}</div>
          </div>
        </div>
        <div class="card-right">
          <div class="logo-area">${logoHTML}</div>
          <p class="company">${data.company}</p>
          <p class="tagline">${data.tagline}</p>
        </div>
      </div>
    </div>
    <div class="card-label">Front Side</div>
  </div>

  <div>
    <div class="card">
      <div class="back-bg">
        <div class="back-teal-l"></div>
        <div class="back-teal-b"></div>
      </div>
      <div class="back-content">
        <div class="logo-area">${logoHTML}</div>
        <p class="back-company">${data.company}</p>
        <p class="back-tagline">${data.tagline}</p>
        <p class="back-website">${data.website}</p>
      </div>
    </div>
    <div class="card-label">Back Side</div>
  </div>

</body>
</html>`;
}

/* ─── Preview in Tab ─────────────────────────────────── */
btnPreview.addEventListener('click', () => {
  const data = getCardData();
  const html = buildPreviewHTML(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
});

/* ─── Download PDF ───────────────────────────────────── */
// Uses html2canvas + jsPDF loaded from CDN.
// If the scripts aren't on the page yet, we inject them lazily.

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

btnDownload.addEventListener('click', async () => {
  btnDownload.textContent = 'Generating…';
  btnDownload.disabled = true;

  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

    const { jsPDF } = window.jspdf;

    // Standard business card size: 3.5 × 2 inches at 300 dpi
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'in', format: [3.5, 2] });

    // Temporarily reset zoom for capture
    const prevTransform = cardWrapper.style.transform;
    cardWrapper.style.transform = 'scale(1)';

    // Capture front
    const frontCanvas = await html2canvas(cardFront, {
      scale: 3,
      backgroundColor: null,
      useCORS: true,
      logging: false,
    });
    pdf.addImage(frontCanvas.toDataURL('image/png'), 'PNG', 0, 0, 3.5, 2);

    // Capture back (show it temporarily if hidden)
    const backWasHidden = cardBack.style.display === 'none';
    if (backWasHidden) cardBack.style.display = '';
    const backCanvas = await html2canvas(cardBack, {
      scale: 3,
      backgroundColor: null,
      useCORS: true,
      logging: false,
    });
    if (backWasHidden) cardBack.style.display = 'none';

    pdf.addPage([3.5, 2], 'landscape');
    pdf.addImage(backCanvas.toDataURL('image/png'), 'PNG', 0, 0, 3.5, 2);

    // Restore zoom
    cardWrapper.style.transform = prevTransform;

    const filename = (designName.value || 'business-card').replace(/\s+/g, '-').toLowerCase() + '.pdf';
    pdf.save(filename);

  } catch (err) {
    console.error('PDF generation failed:', err);
    alert('PDF generation failed. Please try the "Preview in Tab" option.');
  } finally {
    btnDownload.textContent = 'Download PDF';
    btnDownload.disabled = false;
  }
});

/* ─── Init default text on cards ─────────────────────── */
// Inputs start empty; show placeholder text in the card preview
document.querySelectorAll('[data-preview]').forEach(input => {
  const targetId = input.dataset.preview;
  const target   = document.getElementById(targetId);
  if (target && !target.textContent.trim()) {
    target.textContent = input.placeholder || '';
  }
});
