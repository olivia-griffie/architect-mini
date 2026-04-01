/**
 * architect-mini - app.js
 * Handles live preview updates, zoom, logo upload,
 * PDF download (via html2canvas + jsPDF), and tab preview.
 */

/* DOM refs */
const cardWrapper = document.getElementById('cardWrapper');
const zoomSlider = document.getElementById('zoomSlider');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const closePanel = document.getElementById('closePanel');
const fieldLogo = document.getElementById('fieldLogo');
const uploadName = document.getElementById('uploadFilename');
const btnDownload = document.getElementById('btnDownloadPDF');
const btnPreview = document.getElementById('btnPreviewTab');
const pageButtons = document.querySelectorAll('.am-page-btn');
const cardFront = document.getElementById('cardFront');
const cardBack = document.getElementById('cardBack');
const designName = document.getElementById('designName');

/* Live field -> preview binding */
document.querySelectorAll('[data-preview]').forEach(input => {
  const targetId = input.dataset.preview;
  const target = document.getElementById(targetId);
  if (!target) return;

  const mirrorMap = {
    previewCompany: 'previewBackCompany',
    previewTagline: 'previewBackTagline',
    previewWebsiteFront: null,
  };

  input.addEventListener('input', () => {
    const val = input.value.trim();
    target.textContent = val || input.placeholder || '';

    if (mirrorMap[targetId]) {
      const mirror = document.getElementById(mirrorMap[targetId]);
      if (mirror) mirror.textContent = val || input.placeholder || '';
    }
  });
});

/* Last name gets a leading space for display */
const fieldLastName = document.getElementById('fieldLastName');
const previewLast = document.getElementById('previewLastName');
fieldLastName.addEventListener('input', () => {
  previewLast.textContent = fieldLastName.value.trim()
    ? ' ' + fieldLastName.value.trim()
    : ' LOU WAN';
});

/* Zoom */
function applyZoom(val) {
  const scale = val / 100;
  cardWrapper.style.transform = `scale(${scale})`;
  zoomSlider.style.background =
    `linear-gradient(to right, var(--accent) ${val}%, var(--border) ${val}%)`;
}

zoomSlider.addEventListener('input', () => applyZoom(zoomSlider.value));
zoomInBtn.addEventListener('click', () => {
  zoomSlider.value = Math.min(150, Number(zoomSlider.value) + 10);
  applyZoom(zoomSlider.value);
});
zoomOutBtn.addEventListener('click', () => {
  zoomSlider.value = Math.max(50, Number(zoomSlider.value) - 10);
  applyZoom(zoomSlider.value);
});
applyZoom(100);

/* Pagination (front / back toggle) */
pageButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    pageButtons.forEach(b => b.classList.remove('am-page-btn--active'));
    btn.classList.add('am-page-btn--active');

    const page = btn.dataset.page;
    if (page === '1') {
      cardFront.style.display = '';
      cardBack.style.display = 'none';
      document.querySelectorAll('.am-card-label')[0].style.display = '';
      document.querySelectorAll('.am-card-label')[1].style.display = 'none';
    } else {
      cardFront.style.display = 'none';
      cardBack.style.display = '';
      document.querySelectorAll('.am-card-label')[0].style.display = 'none';
      document.querySelectorAll('.am-card-label')[1].style.display = '';
    }
  });
});

/* Logo upload */
fieldLogo.addEventListener('change', () => {
  const file = fieldLogo.files[0];
  if (!file) return;

  uploadName.textContent = file.name;
  const reader = new FileReader();
  reader.onload = e => {
    const src = e.target.result;
    ['previewLogoFront', 'previewLogoBack'].forEach(id => {
      const area = document.getElementById(id);
      if (!area) return;
      area.innerHTML = `<img src="${src}" alt="Logo" />`;
    });
  };
  reader.readAsDataURL(file);
});

/* Close panel (hide right panel) */
closePanel.addEventListener('click', () => {
  const panel = document.getElementById('amRightPanel');
  panel.style.display = panel.style.display === 'none' ? '' : 'none';
});

/* Collect current card data */
function getCardData() {
  return {
    designName: designName.value || 'My Design',
    firstName: document.getElementById('fieldFirstName').value || 'First Name',
    lastName: document.getElementById('fieldLastName').value || 'Last Name',
    title: document.getElementById('fieldTitle').value || 'Title',
    phone: document.getElementById('fieldPhone').value || '(888)-888-8888',
    email: document.getElementById('fieldEmail').value || 'email@example.com',
    address: document.getElementById('fieldAddress').value || '123 Anywhere St., Any City, 12345',
    company: document.getElementById('fieldCompany').value || 'CREATIVE DEVELOPERS',
    tagline: document.getElementById('fieldTagline').value || 'Ideas Developed By Creative Experts!',
    website: document.getElementById('fieldWebsite').value || 'www.creativedevelopers.com',
  };
}

/* Build a standalone HTML snapshot of both cards */
function buildPreviewHTML(data) {
  const logoImg = document.querySelector('#previewLogoBack img');
  const frontBgImg = document.querySelector('#cardFront .am-card-bg-image');
  const backBgImg = document.querySelector('#cardBack .am-card-bg-image');
  const logoSrc = logoImg ? logoImg.src : null;
  const frontBgSrc = frontBgImg ? frontBgImg.src : '';
  const backBgSrc = backBgImg ? backBgImg.src : '';
  const logoHTML = logoSrc
    ? `<img src="${logoSrc}" style="width:100%;height:100%;object-fit:contain;" alt="Logo" />`
    : `<svg viewBox="0 0 60 60" fill="none" style="width:48px;height:48px"><path d="M30 5 L55 30 L30 55 L5 30 Z" stroke="#00C8C8" stroke-width="2.5" fill="none"/><path d="M20 30 L30 15 L40 30 L30 45 Z" stroke="#00C8C8" stroke-width="2" fill="none"/></svg>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${data.designName} - Preview</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    body{font-family:'DM Sans',sans-serif;background:#F4F3F8;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:1.5rem;padding:2rem;}
    h1{font-size:1.1rem;color:#1A1A2E;font-weight:500;margin-bottom:.25rem;}
    .card{width:380px;height:212px;border-radius:8px;overflow:hidden;position:relative;box-shadow:0 6px 24px rgba(27,42,74,.22);}
    .card-label{font-size:.72rem;color:#7A7A99;text-align:center;margin-top:.4rem;}
    .card-bg{position:absolute;inset:0;}
    .card-bg img{display:block;width:100%;height:100%;object-fit:cover;}
    .front-content{position:relative;z-index:10;height:100%;padding:31px 28px 26px 31px;}
    .front-header{max-width:80%;}
    .card-name{font-size:1.02rem;font-weight:400;color:#113D6E;letter-spacing:-.03em;line-height:1.02;text-transform:uppercase;}
    .card-name strong{font-weight:800;}
    .card-title{font-size:.44rem;color:#131313;margin-top:.18rem;font-weight:400;letter-spacing:-.01em;}
    .contact{display:flex;flex-direction:column;gap:.72rem;margin-top:2.4rem;margin-left:3.55rem;max-width:250px;}
    .contact-row{font-size:.35rem;color:#131313;line-height:1.15;font-weight:400;}
    .back-content{position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:.35rem;padding:0 2rem 1rem;}
    .logo-area{width:62px;height:62px;display:flex;align-items:center;justify-content:center;}
    .back-company{font-size:.86rem;color:#113D6E;font-weight:800;letter-spacing:-.02em;text-align:center;text-transform:uppercase;}
    .back-tagline{font-size:.3rem;color:#113D6E;opacity:.75;text-align:center;font-weight:500;}
  </style>
</head>
<body>
  <h1>${data.designName}</h1>

  <div>
    <div class="card">
      <div class="card-bg">
        <img src="${frontBgSrc}" alt="" />
      </div>
      <div class="front-content">
        <div class="front-header">
          <p class="card-name"><strong>${data.firstName}</strong> ${data.lastName}</p>
          <p class="card-title">${data.title}</p>
        </div>
        <div class="contact">
          <div class="contact-row">${data.email}</div>
          <div class="contact-row">${data.phone}</div>
          <div class="contact-row">${data.website}</div>
          <div class="contact-row">${data.address}</div>
        </div>
      </div>
    </div>
    <div class="card-label">Front Side</div>
  </div>

  <div>
    <div class="card">
      <div class="card-bg">
        <img src="${backBgSrc}" alt="" />
      </div>
      <div class="back-content">
        <div class="logo-area">${logoHTML}</div>
        <p class="back-company">${data.company}</p>
        <p class="back-tagline">${data.tagline}</p>
      </div>
    </div>
    <div class="card-label">Back Side</div>
  </div>

</body>
</html>`;
}

/* Preview in Tab */
btnPreview.addEventListener('click', () => {
  const data = getCardData();
  const html = buildPreviewHTML(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
});

/* Download PDF */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

btnDownload.addEventListener('click', async () => {
  btnDownload.textContent = 'Generating...';
  btnDownload.disabled = true;

  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'in', format: [3.5, 2] });

    const prevTransform = cardWrapper.style.transform;
    cardWrapper.style.transform = 'scale(1)';

    const frontCanvas = await html2canvas(cardFront, {
      scale: 3,
      backgroundColor: null,
      useCORS: true,
      logging: false,
    });
    pdf.addImage(frontCanvas.toDataURL('image/png'), 'PNG', 0, 0, 3.5, 2);

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

/* Init default text on cards */
document.querySelectorAll('[data-preview]').forEach(input => {
  const targetId = input.dataset.preview;
  const target = document.getElementById(targetId);
  if (target && !target.textContent.trim()) {
    target.textContent = input.placeholder || '';
  }
});
