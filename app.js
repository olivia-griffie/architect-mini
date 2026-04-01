/**
 * architect-mini - app.js
 * Handles startup/login, saved designs, preview, and PDF download.
 */

const STORAGE_KEY = 'architect-mini-users';
const STARTUP_WORDMARK = 'architect mini';
const EMPTY_SAVED_OPTION = '<option value="">Choose a saved design</option>';
const BACK_LOGO_PLACEHOLDER = `
  <svg class="am-logo-placeholder am-logo-placeholder--back" viewBox="0 0 60 60" fill="none">
    <path d="M30 5 L55 30 L30 55 L5 30 Z" stroke="#00C8C8" stroke-width="2.5" fill="none"></path>
    <path d="M20 30 L30 15 L40 30 L30 45 Z" stroke="#00C8C8" stroke-width="2" fill="none"></path>
  </svg>
`;

const state = {
  currentUser: null,
  hasUnsavedChanges: false,
};

const startupScreen = document.getElementById('startupScreen');
const startupTypedText = document.getElementById('startupTypedText');
const loginForm = document.getElementById('loginForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginStatus = document.getElementById('loginStatus');

const cardWrapper = document.getElementById('cardWrapper');
const zoomSlider = document.getElementById('zoomSlider');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const closePanel = document.getElementById('closePanel');
const saveDesignButton = document.getElementById('saveDesignButton');
const fieldLogo = document.getElementById('fieldLogo');
const uploadName = document.getElementById('uploadFilename');
const btnDownload = document.getElementById('btnDownloadPDF');
const btnPreview = document.getElementById('btnPreviewTab');
const pageButtons = document.querySelectorAll('.am-page-btn');
const cardFront = document.getElementById('cardFront');
const cardBack = document.getElementById('cardBack');
const designName = document.getElementById('designName');
const designNameBar = document.getElementById('designNameBar');
const designNamePrompt = document.getElementById('designNamePrompt');
const templateSelect = document.getElementById('templateSelect');
const savedDesigns = document.getElementById('savedDesigns');
const previewLogoBack = document.getElementById('previewLogoBack');

const formFields = {
  firstName: document.getElementById('fieldFirstName'),
  lastName: document.getElementById('fieldLastName'),
  title: document.getElementById('fieldTitle'),
  phone: document.getElementById('fieldPhone'),
  email: document.getElementById('fieldEmail'),
  address: document.getElementById('fieldAddress'),
  company: document.getElementById('fieldCompany'),
  tagline: document.getElementById('fieldTagline'),
  website: document.getElementById('fieldWebsite'),
};

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveStoredUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getCurrentUserRecord() {
  if (!state.currentUser) return null;
  const users = getStoredUsers();
  return users[state.currentUser] || null;
}

function typeStartupWordmark() {
  startupTypedText.textContent = '';
  let index = 0;
  const tick = () => {
    startupTypedText.textContent = STARTUP_WORDMARK.slice(0, index);
    index += 1;
    if (index <= STARTUP_WORDMARK.length) {
      window.setTimeout(tick, 75);
    }
  };
  window.setTimeout(tick, 250);
}

function setLoginStatus(message, isError = false) {
  loginStatus.textContent = message;
  loginStatus.style.color = isError ? '#b14c4c' : '';
}

function getLogoSrc() {
  return previewLogoBack.querySelector('img')?.src || '';
}

function setLogoSrc(src = '') {
  if (src) {
    previewLogoBack.innerHTML = `<img src="${src}" alt="Logo" />`;
    uploadName.textContent = 'Logo loaded';
  } else {
    previewLogoBack.innerHTML = BACK_LOGO_PLACEHOLDER;
    uploadName.textContent = '';
  }
}

function applyZoom(val) {
  const scale = val / 100;
  cardWrapper.style.transform = `scale(${scale})`;
  zoomSlider.style.background =
    `linear-gradient(to right, var(--accent) ${val}%, var(--border) ${val}%)`;
}

function setActivePage(page) {
  pageButtons.forEach(btn => {
    btn.classList.toggle('am-page-btn--active', btn.dataset.page === page);
  });

  const cardLabels = document.querySelectorAll('.am-card-label');
  const showFront = page === '1';
  cardFront.style.display = showFront ? '' : 'none';
  cardBack.style.display = showFront ? 'none' : '';
  cardLabels[0].style.display = showFront ? '' : 'none';
  cardLabels[1].style.display = showFront ? 'none' : '';
}

function validateDesignName() {
  const valid = Boolean(designName.value.trim());
  designNameBar.classList.toggle('am-design-name-bar--invalid', !valid);
  designNamePrompt.classList.toggle('am-template-label--invalid', !valid);
  btnPreview.disabled = !valid;
  btnDownload.disabled = !valid;
  saveDesignButton.disabled = !valid || !state.currentUser;
  return valid;
}

function setUnsavedChanges(flag) {
  state.hasUnsavedChanges = flag;
}

function getCardData() {
  return {
    designName: designName.value.trim(),
    firstName: formFields.firstName.value || 'First Name',
    lastName: formFields.lastName.value || 'Last Name',
    title: formFields.title.value || 'Title',
    phone: formFields.phone.value || '(888)-888-8888',
    email: formFields.email.value || 'email@example.com',
    address: formFields.address.value || '123 Anywhere St., Any City, 12345',
    company: formFields.company.value || 'CREATIVE DEVELOPERS',
    tagline: formFields.tagline.value || 'Ideas Developed By Creative Experts!',
    website: formFields.website.value || 'www.creativedevelopers.com',
  };
}

function collectDesignState() {
  return {
    template: templateSelect.value,
    fields: {
      designName: designName.value.trim(),
      firstName: formFields.firstName.value,
      lastName: formFields.lastName.value,
      title: formFields.title.value,
      phone: formFields.phone.value,
      email: formFields.email.value,
      address: formFields.address.value,
      company: formFields.company.value,
      tagline: formFields.tagline.value,
      website: formFields.website.value,
    },
    logoSrc: getLogoSrc(),
  };
}

function updatePreviewField(id, value, fallback) {
  const node = document.getElementById(id);
  if (!node) return;
  node.textContent = value || fallback;
}

function refreshPreviewFromFields() {
  updatePreviewField('previewFirstName', formFields.firstName.value.trim(), 'KIM');
  const lastNameValue = formFields.lastName.value.trim();
  updatePreviewField('previewLastName', lastNameValue ? ` ${lastNameValue}` : ' LOU WAN');
  updatePreviewField('previewTitle', formFields.title.value.trim(), 'Managing Director');
  updatePreviewField('previewPhone', formFields.phone.value.trim(), '(987)-4575-9567');
  updatePreviewField('previewEmail', formFields.email.value.trim(), 'info@creativedevelopers.com');
  updatePreviewField('previewAddress', formFields.address.value.trim(), '132 9th Street, Lakeview Lane NY 87903');
  updatePreviewField('previewWebsiteFront', formFields.website.value.trim(), 'www.creativedevelopers.com');
  updatePreviewField('previewBackCompany', formFields.company.value.trim(), 'CREATIVE DEVELOPERS');
  updatePreviewField('previewBackTagline', formFields.tagline.value.trim(), 'Ideas Developed By Creative Experts!');
}

function applyDesignState(design) {
  templateSelect.value = design.template || 'business-card';
  designName.value = design.fields?.designName || '';
  formFields.firstName.value = design.fields?.firstName || '';
  formFields.lastName.value = design.fields?.lastName || '';
  formFields.title.value = design.fields?.title || '';
  formFields.phone.value = design.fields?.phone || '';
  formFields.email.value = design.fields?.email || '';
  formFields.address.value = design.fields?.address || '';
  formFields.company.value = design.fields?.company || '';
  formFields.tagline.value = design.fields?.tagline || '';
  formFields.website.value = design.fields?.website || '';
  setLogoSrc(design.logoSrc || '');
  refreshPreviewFromFields();
  validateDesignName();
  setUnsavedChanges(false);
}

function renderSavedDesignOptions() {
  const record = getCurrentUserRecord();
  const designs = record?.designs || {};
  const names = Object.keys(designs).sort((a, b) => a.localeCompare(b));
  savedDesigns.innerHTML = EMPTY_SAVED_OPTION + names
    .map(name => `<option value="${name}">${name}</option>`)
    .join('');
}

function saveCurrentDesign() {
  if (!validateDesignName()) {
    designName.focus();
    return false;
  }

  const users = getStoredUsers();
  const user = users[state.currentUser];
  if (!user) return false;

  const design = collectDesignState();
  user.designs = user.designs || {};
  user.designs[design.fields.designName] = design;
  saveStoredUsers(users);
  renderSavedDesignOptions();
  savedDesigns.value = design.fields.designName;
  setUnsavedChanges(false);
  designNamePrompt.textContent = `Saved for ${state.currentUser}.`;
  designNamePrompt.classList.remove('am-template-label--invalid');
  return true;
}

function loadSavedDesign(name) {
  const record = getCurrentUserRecord();
  const design = record?.designs?.[name];
  if (!design) return;
  applyDesignState(design);
}

function ensureNamedDesign() {
  if (validateDesignName()) return true;
  designName.focus();
  designNamePrompt.textContent = 'Please name your design before continuing.';
  return false;
}

function buildPreviewHTML(data) {
  const logoSrc = getLogoSrc();
  const frontBgSrc = document.querySelector('#cardFront .am-card-bg-image')?.src || '';
  const backBgSrc = document.querySelector('#cardBack .am-card-bg-image')?.src || '';
  const logoHTML = logoSrc
    ? `<img src="${logoSrc}" style="width:100%;height:100%;object-fit:contain;" alt="Logo" />`
    : BACK_LOGO_PLACEHOLDER;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${data.designName} - Preview</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700;800&display=swap" rel="stylesheet"/>
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
      <div class="card-bg"><img src="${frontBgSrc}" alt="" /></div>
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
      <div class="card-bg"><img src="${backBgSrc}" alt="" /></div>
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

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (!words.length) return;
  let line = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const testLine = `${line} ${words[i]}`;
    if (ctx.measureText(testLine).width <= maxWidth) {
      line = testLine;
    } else {
      ctx.fillText(line, x, y);
      y += lineHeight;
      line = words[i];
    }
  }
  ctx.fillText(line, x, y);
}

async function renderCardCanvases(data) {
  await document.fonts.ready;
  const width = 1140;
  const height = 636;
  const scale = width / 380;

  const [frontBg, backBg, logoImg] = await Promise.all([
    loadImage(document.querySelector('#cardFront .am-card-bg-image')?.src || ''),
    loadImage(document.querySelector('#cardBack .am-card-bg-image')?.src || ''),
    getLogoSrc() ? loadImage(getLogoSrc()) : Promise.resolve(null),
  ]);

  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = width;
  frontCanvas.height = height;
  const frontCtx = frontCanvas.getContext('2d');
  frontCtx.drawImage(frontBg, 0, 0, width, height);
  frontCtx.textBaseline = 'top';
  frontCtx.fillStyle = '#113D6E';
  frontCtx.font = `${Math.round(16 * scale)}px "DM Sans", sans-serif`;
  const firstName = (data.firstName || 'First Name').toUpperCase();
  const lastName = (data.lastName || 'Last Name').toUpperCase();
  frontCtx.fillText(firstName, 31 * scale, 31 * scale);
  const firstNameWidth = frontCtx.measureText(firstName).width;
  frontCtx.fillText(` ${lastName}`, 31 * scale + firstNameWidth, 31 * scale);

  frontCtx.fillStyle = '#131313';
  frontCtx.font = `${Math.round(7 * scale)}px "DM Sans", sans-serif`;
  frontCtx.fillText(data.title || 'Title', 31 * scale, 50 * scale);

  frontCtx.font = `${Math.round(5.7 * scale)}px "DM Sans", sans-serif`;
  const contactX = 135 * scale;
  let contactY = 103 * scale;
  const lineHeight = 8 * scale;
  const rowGap = 14 * scale;
  [
    data.email,
    data.phone,
    data.website,
    data.address,
  ].forEach(value => {
    wrapCanvasText(frontCtx, value, contactX, contactY, 250 * scale, lineHeight);
    contactY += rowGap + lineHeight;
  });

  const backCanvas = document.createElement('canvas');
  backCanvas.width = width;
  backCanvas.height = height;
  const backCtx = backCanvas.getContext('2d');
  backCtx.drawImage(backBg, 0, 0, width, height);
  backCtx.textBaseline = 'top';

  if (logoImg) {
    const box = 62 * scale;
    const ratio = Math.min(box / logoImg.width, box / logoImg.height);
    const drawWidth = logoImg.width * ratio;
    const drawHeight = logoImg.height * ratio;
    backCtx.drawImage(logoImg, (width - drawWidth) / 2, 63 * scale, drawWidth, drawHeight);
  }

  backCtx.fillStyle = '#113D6E';
  backCtx.font = `${Math.round(13.6 * scale)}px "DM Sans", sans-serif`;
  const company = (data.company || 'CREATIVE DEVELOPERS').toUpperCase();
  const companyWidth = backCtx.measureText(company).width;
  backCtx.fillText(company, (width - companyWidth) / 2, 139 * scale);

  backCtx.font = `${Math.round(4.8 * scale)}px "DM Sans", sans-serif`;
  const tagline = data.tagline || 'Ideas Developed By Creative Experts!';
  const taglineWidth = backCtx.measureText(tagline).width;
  backCtx.fillText(tagline, (width - taglineWidth) / 2, 182 * scale);

  return { frontCanvas, backCanvas };
}

function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function buildPdfFromImages(images) {
  const encoder = new TextEncoder();
  const parts = [];
  const offsets = [0];
  let offset = 0;

  const pushBytes = bytes => {
    parts.push(bytes);
    offset += bytes.length;
  };
  const pushText = text => pushBytes(encoder.encode(text));

  const pageWidth = 252;
  const pageHeight = 144;
  const objectCount = 2 + images.length * 3;
  pushBytes(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x33, 0x0a, 0x25, 0xff, 0xff, 0xff, 0xff, 0x0a]));
  offsets[1] = offset;
  pushText('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  const pageRefs = images.map((_, index) => `${3 + index * 3} 0 R`).join(' ');
  offsets[2] = offset;
  pushText(`2 0 obj\n<< /Type /Pages /Count ${images.length} /Kids [${pageRefs}] >>\nendobj\n`);

  images.forEach((image, index) => {
    const pageObj = 3 + index * 3;
    const imageObj = pageObj + 1;
    const contentObj = pageObj + 2;
    const contentStream = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im${index + 1} Do\nQ\n`;

    offsets[pageObj] = offset;
    pushText(`${pageObj} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im${index + 1} ${imageObj} 0 R >> >> /Contents ${contentObj} 0 R >>\nendobj\n`);

    offsets[imageObj] = offset;
    pushText(`${imageObj} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`);
    pushBytes(image.bytes);
    pushText('\nendstream\nendobj\n');

    offsets[contentObj] = offset;
    pushText(`${contentObj} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`);
  });

  const xrefOffset = offset;
  pushText(`xref\n0 ${objectCount + 1}\n`);
  pushText('0000000000 65535 f \n');
  for (let i = 1; i <= objectCount; i += 1) {
    pushText(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  pushText(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new Blob(parts, { type: 'application/pdf' });
}

function handleFieldMutation() {
  refreshPreviewFromFields();
  validateDesignName();
  setUnsavedChanges(true);
}

loginForm.addEventListener('submit', event => {
  event.preventDefault();
  const username = loginUsername.value.trim();
  const password = loginPassword.value;

  if (!username || !password) {
    setLoginStatus('Enter both username and password to continue.', true);
    return;
  }

  const users = getStoredUsers();
  const existing = users[username];
  if (existing && existing.password !== password) {
    setLoginStatus('That password does not match this username.', true);
    return;
  }

  if (!existing) {
    users[username] = { password, designs: {} };
    saveStoredUsers(users);
    setLoginStatus('Account created. Loading your workspace...');
  } else {
    setLoginStatus('Login successful. Loading your workspace...');
  }

  state.currentUser = username;
  renderSavedDesignOptions();
  startupScreen.classList.add('am-startup--hidden');
  document.body.classList.remove('am-startup-active');
  validateDesignName();
  designName.focus();
});

designName.addEventListener('input', () => {
  validateDesignName();
  setUnsavedChanges(true);
});

Object.values(formFields).forEach(field => {
  const eventName = field.tagName === 'SELECT' ? 'change' : 'input';
  field.addEventListener(eventName, handleFieldMutation);
});

templateSelect.addEventListener('change', () => {
  setUnsavedChanges(true);
});

savedDesigns.addEventListener('change', () => {
  if (!savedDesigns.value) return;
  loadSavedDesign(savedDesigns.value);
});

saveDesignButton.addEventListener('click', () => {
  if (saveCurrentDesign()) {
    designNamePrompt.textContent = `Saved as "${designName.value.trim()}".`;
  }
});

pageButtons.forEach(btn => {
  btn.addEventListener('click', () => setActivePage(btn.dataset.page));
});

zoomSlider.addEventListener('input', () => applyZoom(zoomSlider.value));
zoomInBtn.addEventListener('click', () => {
  zoomSlider.value = Math.min(150, Number(zoomSlider.value) + 10);
  applyZoom(zoomSlider.value);
});
zoomOutBtn.addEventListener('click', () => {
  zoomSlider.value = Math.max(50, Number(zoomSlider.value) - 10);
  applyZoom(zoomSlider.value);
});

fieldLogo.addEventListener('change', () => {
  const file = fieldLogo.files[0];
  if (!file) return;
  const reader = new FileReader();
  uploadName.textContent = file.name;
  reader.onload = e => {
    setLogoSrc(e.target.result);
    setUnsavedChanges(true);
  };
  reader.readAsDataURL(file);
});

btnPreview.addEventListener('click', () => {
  if (!ensureNamedDesign()) return;
  const html = buildPreviewHTML(getCardData());
  const previewWindow = window.open('', '_blank');
  if (!previewWindow) {
    alert('Preview was blocked. Please allow popups and try again.');
    return;
  }
  previewWindow.document.open();
  previewWindow.document.write(html);
  previewWindow.document.close();
});

btnDownload.addEventListener('click', async () => {
  if (!ensureNamedDesign()) return;
  btnDownload.textContent = 'Generating...';
  btnDownload.disabled = true;
  try {
    const { frontCanvas, backCanvas } = await renderCardCanvases(getCardData());
    const pdfBlob = buildPdfFromImages([
      {
        width: frontCanvas.width,
        height: frontCanvas.height,
        bytes: dataUrlToBytes(frontCanvas.toDataURL('image/jpeg', 0.92)),
      },
      {
        width: backCanvas.width,
        height: backCanvas.height,
        bytes: dataUrlToBytes(backCanvas.toDataURL('image/jpeg', 0.92)),
      },
    ]);
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${designName.value.trim().replace(/\s+/g, '-').toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
  } catch (err) {
    console.error('PDF generation failed:', err);
    alert('PDF generation failed. Please try again.');
  } finally {
    btnDownload.textContent = 'Download PDF';
    validateDesignName();
  }
});

closePanel.addEventListener('click', () => {
  const message = state.hasUnsavedChanges
    ? 'You have unsaved changes. Please save your design before quitting Architect Mini. Close anyway?'
    : 'Are you sure you want to close Architect Mini? Your progress will not be saved.';
  if (window.confirm(message)) {
    window.close();
    window.open('', '_self');
    window.close();
  }
});

document.querySelectorAll('[data-preview]').forEach(input => {
  const target = document.getElementById(input.dataset.preview);
  if (target && !target.textContent.trim()) {
    target.textContent = input.placeholder || '';
  }
});

document.body.classList.add('am-startup-active');
zoomSlider.value = 150;
applyZoom(150);
setActivePage('1');
setLogoSrc('');
refreshPreviewFromFields();
renderSavedDesignOptions();
validateDesignName();
typeStartupWordmark();
