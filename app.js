const STORAGE_KEY = 'architect-mini-users';
const STARTUP_WORDMARK = 'architect mini';
const EMPTY_SAVED_OPTION = '<option value="">Choose a saved design</option>';
const TEST_USERS = { admin: 'admin', client: 'client' };
const CARD = { width: 380, height: 212 };
const BACK_LOGO_PLACEHOLDER = `<svg class="am-logo-placeholder am-logo-placeholder--back" viewBox="0 0 60 60" fill="none"><path d="M30 5 L55 30 L30 55 L5 30 Z" stroke="#00C8C8" stroke-width="2.5" fill="none"></path><path d="M20 30 L30 15 L40 30 L30 45 Z" stroke="#00C8C8" stroke-width="2" fill="none"></path></svg>`;
const DEFAULT_LAYOUT = {
  frontName: { label: 'Front Name', type: 'text', x: 31, y: 31, width: 200, fontSize: 12, color: '#113D6E', align: 'left', weight: 500, lineHeight: 1.02, textTransform: 'uppercase' },
  frontTitle: { label: 'Front Title', type: 'text', x: 31, y: 50, width: 180, fontSize: 5.25, color: '#131313', align: 'left', weight: 400, lineHeight: 1.02 },
  frontEmail: { label: 'Front Email', type: 'text', x: 135, y: 103, width: 230, fontSize: 4.25, color: '#131313', align: 'left', weight: 400, lineHeight: 1.15 },
  frontPhone: { label: 'Front Phone', type: 'text', x: 135, y: 125, width: 230, fontSize: 4.25, color: '#131313', align: 'left', weight: 400, lineHeight: 1.15 },
  frontWebsite: { label: 'Front Website', type: 'text', x: 135, y: 147, width: 230, fontSize: 4.25, color: '#131313', align: 'left', weight: 400, lineHeight: 1.15 },
  frontAddress: { label: 'Front Address', type: 'text', x: 135, y: 169, width: 220, fontSize: 4.25, color: '#131313', align: 'left', weight: 400, lineHeight: 1.15 },
  backLogo: { label: 'Back Logo', type: 'logo', x: 159, y: 63, width: 62, height: 62 },
  backCompany: { label: 'Back Company', type: 'text', x: 67, y: 139, width: 246, fontSize: 10.25, color: '#113D6E', align: 'center', weight: 800, lineHeight: 1.02, textTransform: 'uppercase' },
  backTagline: { label: 'Back Tagline', type: 'text', x: 84, y: 182, width: 212, fontSize: 3.6, color: '#113D6E', align: 'center', weight: 500, lineHeight: 1.15 }
};
const state = { currentUser: null, hasUnsavedChanges: false, activeLayerId: 'frontName', layout: structuredClone(DEFAULT_LAYOUT) };

const $ = id => document.getElementById(id);
const els = {
  startupScreen: $('startupScreen'),
  startupTypedText: $('startupTypedText'),
  loginForm: $('loginForm'),
  loginUsername: $('loginUsername'),
  loginPassword: $('loginPassword'),
  loginStatus: $('loginStatus'),
  cardWrapper: $('cardWrapper'),
  zoomSlider: $('zoomSlider'),
  zoomIn: $('zoomIn'),
  zoomOut: $('zoomOut'),
  closePanel: $('closePanel'),
  saveBtn: $('saveDesignButton'),
  fieldLogo: $('fieldLogo'),
  uploadName: $('uploadFilename'),
  btnDownload: $('btnDownloadPDF'),
  btnPreview: $('btnPreviewTab'),
  pageButtons: [...document.querySelectorAll('.am-page-btn')],
  cardFront: $('cardFront'),
  cardBack: $('cardBack'),
  designName: $('designName'),
  designNameBar: $('designNameBar'),
  designNamePrompt: $('designNamePrompt'),
  templateSelect: $('templateSelect'),
  savedDesigns: $('savedDesigns'),
  previewLogoBack: $('previewLogoBack'),
  selectedLayerName: $('selectedLayerName'),
  layerPosX: $('layerPosX'),
  layerPosY: $('layerPosY'),
  layerFontSize: $('layerFontSize'),
  layerColor: $('layerColor'),
  layerEls: [...document.querySelectorAll('.am-card-layer')]
};
const fields = {
  firstName: $('fieldFirstName'),
  lastName: $('fieldLastName'),
  title: $('fieldTitle'),
  phone: $('fieldPhone'),
  email: $('fieldEmail'),
  address: $('fieldAddress'),
  company: $('fieldCompany'),
  tagline: $('fieldTagline'),
  website: $('fieldWebsite')
};

const clone = value => structuredClone(value);
const layerEl = id => document.querySelector(`[data-layer-id="${id}"]`);
const layerCfg = (id = state.activeLayerId) => state.layout[id];
const scaleNow = () => Number(els.zoomSlider.value) / 100;
const ptToPx = (pt, scale) => pt * (96 / 72) * scale;

function storedUsers() {
  let users;
  try { users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { users = {}; }
  Object.entries(TEST_USERS).forEach(([u, p]) => {
    users[u] = users[u] || { password: p, designs: {} };
    users[u].password = p;
    users[u].designs = users[u].designs || {};
  });
  return users;
}
function saveUsers(users) { localStorage.setItem(STORAGE_KEY, JSON.stringify(users)); }
function userRecord() { return state.currentUser ? storedUsers()[state.currentUser] || null : null; }
function setLoginStatus(msg, err = false) { els.loginStatus.textContent = msg; els.loginStatus.style.color = err ? '#b14c4c' : ''; }
function getLogoSrc() { return els.previewLogoBack.querySelector('img')?.src || ''; }
function setLogoSrc(src = '') {
  els.previewLogoBack.innerHTML = src ? `<img src="${src}" alt="Logo" />` : BACK_LOGO_PLACEHOLDER;
  els.uploadName.textContent = src ? 'Logo loaded' : '';
}
function activeData() {
  return {
    designName: els.designName.value.trim(),
    firstName: fields.firstName.value.trim() || 'KIM',
    lastName: fields.lastName.value.trim() || 'LOU WAN',
    title: fields.title.value.trim() || 'Managing Director',
    phone: fields.phone.value.trim() || '(987)-4575-9567',
    email: fields.email.value.trim() || 'info@creativedevelopers.com',
    address: fields.address.value.trim() || '132 9th Street, Lakeview Lane NY 87903',
    company: fields.company.value.trim() || 'CREATIVE DEVELOPERS',
    tagline: fields.tagline.value.trim() || 'Ideas Developed By Creative Experts!',
    website: fields.website.value.trim() || 'www.creativedevelopers.com'
  };
}
function layerText(id, data) {
  const map = {
    frontTitle: data.title, frontEmail: data.email, frontPhone: data.phone, frontWebsite: data.website,
    frontAddress: data.address, backCompany: data.company.toUpperCase(), backTagline: data.tagline
  };
  return id === 'frontName' ? `${data.firstName.toUpperCase()} ${data.lastName.toUpperCase()}` : map[id] || '';
}

function typeStartupWordmark() {
  els.startupTypedText.textContent = '';
  let i = 0;
  const tick = () => {
    els.startupTypedText.textContent = STARTUP_WORDMARK.slice(0, i);
    i += 1;
    if (i <= STARTUP_WORDMARK.length) window.setTimeout(tick, 75);
  };
  window.setTimeout(tick, 250);
}
function applyZoom(value) {
  els.cardWrapper.style.transform = `scale(${value / 100})`;
  els.zoomSlider.style.background = `linear-gradient(to right, var(--accent) ${value}%, var(--border) ${value}%)`;
}
function setActivePage(page) {
  els.pageButtons.forEach(btn => btn.classList.toggle('am-page-btn--active', btn.dataset.page === page));
  const labels = document.querySelectorAll('.am-card-label');
  const front = page === '1';
  els.cardFront.style.display = front ? '' : 'none';
  els.cardBack.style.display = front ? 'none' : '';
  labels[0].style.display = front ? '' : 'none';
  labels[1].style.display = front ? 'none' : '';
}
function validateName() {
  const valid = Boolean(els.designName.value.trim());
  els.designNameBar.classList.toggle('am-design-name-bar--invalid', !valid);
  els.designNamePrompt.classList.toggle('am-template-label--invalid', !valid);
  els.btnPreview.disabled = !valid;
  els.btnDownload.disabled = !valid;
  els.saveBtn.disabled = !valid || !state.currentUser;
  return valid;
}
function markDirty() { state.hasUnsavedChanges = true; validateName(); }
function ensureNamed() {
  if (validateName()) return true;
  els.designNamePrompt.textContent = 'Please name your design before continuing.';
  els.designName.focus();
  return false;
}

function updatePreviewText() {
  const data = activeData();
  $('previewFirstName').textContent = data.firstName.toUpperCase();
  $('previewLastName').textContent = ` ${data.lastName.toUpperCase()}`;
  $('layer-frontTitle').textContent = data.title;
  $('layer-frontEmail').textContent = data.email;
  $('layer-frontPhone').textContent = data.phone;
  $('layer-frontWebsite').textContent = data.website;
  $('layer-frontAddress').textContent = data.address;
  $('layer-backCompany').textContent = data.company.toUpperCase();
  $('layer-backTagline').textContent = data.tagline;
}
function applyLayer(id) {
  const el = layerEl(id), cfg = layerCfg(id);
  if (!el || !cfg) return;
  el.style.left = `${cfg.x}px`;
  el.style.top = `${cfg.y}px`;
  if (cfg.width) el.style.width = `${cfg.width}px`; else el.style.removeProperty('width');
  if (cfg.type === 'logo') {
    el.style.height = `${cfg.height}px`;
    el.style.fontSize = '';
    el.style.color = '';
    return;
  }
  el.style.height = '';
  el.style.fontSize = `${cfg.fontSize}pt`;
  el.style.color = cfg.color;
  el.style.textAlign = cfg.align || 'left';
  el.style.fontWeight = cfg.weight || 400;
  el.style.lineHeight = cfg.lineHeight || 1.15;
  el.style.textTransform = cfg.textTransform || 'none';
}
function selectLayer(id) {
  state.activeLayerId = id;
  els.layerEls.forEach(el => el.classList.toggle('am-card-layer--selected', el.dataset.layerId === id));
  const cfg = layerCfg(id), text = cfg.type === 'text';
  els.selectedLayerName.value = cfg.label;
  els.layerPosX.value = Math.round(cfg.x);
  els.layerPosY.value = Math.round(cfg.y);
  els.layerFontSize.disabled = !text;
  els.layerColor.disabled = !text;
  els.layerFontSize.value = text ? cfg.fontSize : '';
  els.layerColor.value = text ? cfg.color : '#113D6E';
}
function applyAllLayers() { Object.keys(state.layout).forEach(applyLayer); selectLayer(state.activeLayerId); }
function clampLayer(id) {
  const el = layerEl(id), cfg = layerCfg(id);
  cfg.x = Math.max(0, Math.min(cfg.x, Math.max(0, CARD.width - el.offsetWidth)));
  cfg.y = Math.max(0, Math.min(cfg.y, Math.max(0, CARD.height - el.offsetHeight)));
}

function designState() {
  return {
    template: els.templateSelect.value,
    fields: Object.fromEntries(Object.entries(fields).map(([k, el]) => [k, el.value])),
    designName: els.designName.value.trim(),
    layout: clone(state.layout),
    logoSrc: getLogoSrc()
  };
}
function applyDesign(design) {
  els.templateSelect.value = design.template || 'business-card';
  els.designName.value = design.designName || '';
  Object.entries(fields).forEach(([k, el]) => { el.value = design.fields?.[k] || ''; });
  state.layout = clone(DEFAULT_LAYOUT);
  Object.keys(DEFAULT_LAYOUT).forEach(key => { state.layout[key] = { ...DEFAULT_LAYOUT[key], ...(design.layout?.[key] || {}) }; });
  setLogoSrc(design.logoSrc || '');
  updatePreviewText();
  applyAllLayers();
  validateName();
  state.hasUnsavedChanges = false;
}
function renderSavedDesigns() {
  const names = Object.keys(userRecord()?.designs || {}).sort((a, b) => a.localeCompare(b));
  els.savedDesigns.innerHTML = EMPTY_SAVED_OPTION + names.map(name => `<option value="${name}">${name}</option>`).join('');
}
function saveCurrentDesign() {
  if (!validateName()) { els.designName.focus(); return false; }
  const users = storedUsers(), user = users[state.currentUser];
  if (!user) return false;
  const design = designState();
  user.designs[design.designName] = design;
  saveUsers(users);
  renderSavedDesigns();
  els.savedDesigns.value = design.designName;
  els.designNamePrompt.textContent = `Saved as "${design.designName}".`;
  els.designNamePrompt.classList.remove('am-template-label--invalid');
  state.hasUnsavedChanges = false;
  return true;
}

function layerStyle(cfg) {
  const parts = [`left:${cfg.x}px`, `top:${cfg.y}px`];
  if (cfg.width) parts.push(`width:${cfg.width}px`);
  if (cfg.type === 'logo') { parts.push(`height:${cfg.height}px`); return parts.join(';'); }
  parts.push(`font-size:${cfg.fontSize}pt`, `color:${cfg.color}`, `text-align:${cfg.align || 'left'}`, `font-weight:${cfg.weight || 400}`, `line-height:${cfg.lineHeight || 1.15}`, `text-transform:${cfg.textTransform || 'none'}`);
  return parts.join(';');
}
function previewHtml(data) {
  const frontBg = document.querySelector('#cardFront .am-card-bg-image')?.src || '';
  const backBg = document.querySelector('#cardBack .am-card-bg-image')?.src || '';
  const logo = getLogoSrc() ? `<img src="${getLogoSrc()}" alt="Logo" />` : BACK_LOGO_PLACEHOLDER;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${data.designName} - Preview</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/><style>body{font-family:'DM Sans',sans-serif;background:#F4F3F8;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:1.5rem;padding:2rem}.card{width:380px;height:212px;border-radius:8px;overflow:hidden;position:relative;box-shadow:0 6px 24px rgba(27,42,74,.22)}.card-label{font-size:.72rem;color:#7A7A99;text-align:center;margin-top:.4rem}.bg{position:absolute;inset:0}.bg img{width:100%;height:100%;object-fit:cover}.content{position:relative;z-index:10;width:100%;height:100%}.layer{position:absolute;margin:0}.name strong{font-weight:800}.logo,.logo img,.logo svg{width:100%;height:100%;object-fit:contain}</style></head><body><h1>${data.designName}</h1><div><div class="card"><div class="bg"><img src="${frontBg}" alt=""/></div><div class="content"><p class="layer name" style="${layerStyle(state.layout.frontName)}"><strong>${data.firstName.toUpperCase()}</strong> ${data.lastName.toUpperCase()}</p><p class="layer" style="${layerStyle(state.layout.frontTitle)}">${data.title}</p><p class="layer" style="${layerStyle(state.layout.frontEmail)}">${data.email}</p><p class="layer" style="${layerStyle(state.layout.frontPhone)}">${data.phone}</p><p class="layer" style="${layerStyle(state.layout.frontWebsite)}">${data.website}</p><p class="layer" style="${layerStyle(state.layout.frontAddress)}">${data.address}</p></div></div><div class="card-label">Front Side</div></div><div><div class="card"><div class="bg"><img src="${backBg}" alt=""/></div><div class="content"><div class="layer logo" style="${layerStyle(state.layout.backLogo)}">${logo}</div><p class="layer" style="${layerStyle(state.layout.backCompany)}">${data.company.toUpperCase()}</p><p class="layer" style="${layerStyle(state.layout.backTagline)}">${data.tagline}</p></div></div><div class="card-label">Back Side</div></div></body></html>`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
function wrapCanvas(ctx, text, x, y, width, lineHeight, align) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (!words.length) return;
  const lines = [];
  let line = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const trial = `${line} ${words[i]}`;
    if (ctx.measureText(trial).width <= width) line = trial; else { lines.push(line); line = words[i]; }
  }
  lines.push(line);
  lines.forEach((entry, index) => {
    ctx.textAlign = align === 'center' ? 'center' : 'left';
    ctx.fillText(entry, align === 'center' ? x + width / 2 : x, y + index * lineHeight);
  });
}
function drawTextLayer(ctx, id, data, scale) {
  const cfg = state.layout[id], x = cfg.x * scale, y = cfg.y * scale, width = (cfg.width || CARD.width) * scale;
  ctx.fillStyle = cfg.color;
  ctx.textBaseline = 'top';
  if (id === 'frontName') {
    ctx.textAlign = 'left';
    ctx.font = `800 ${ptToPx(cfg.fontSize, scale)}px "DM Sans", sans-serif`;
    const first = data.firstName.toUpperCase();
    ctx.fillText(first, x, y);
    const firstWidth = ctx.measureText(first).width;
    ctx.font = `${cfg.weight || 500} ${ptToPx(cfg.fontSize, scale)}px "DM Sans", sans-serif`;
    ctx.fillText(` ${data.lastName.toUpperCase()}`, x + firstWidth, y);
    return;
  }
  ctx.font = `${cfg.weight || 400} ${ptToPx(cfg.fontSize, scale)}px "DM Sans", sans-serif`;
  wrapCanvas(ctx, layerText(id, data), x, y, width, ptToPx(cfg.fontSize, scale) * (cfg.lineHeight || 1.15), cfg.align || 'left');
}
async function renderCanvases(data) {
  await document.fonts.ready;
  const width = 1140, height = 636, scale = width / CARD.width;
  const [frontBg, backBg, logoImg] = await Promise.all([
    loadImage(document.querySelector('#cardFront .am-card-bg-image')?.src || ''),
    loadImage(document.querySelector('#cardBack .am-card-bg-image')?.src || ''),
    getLogoSrc() ? loadImage(getLogoSrc()) : Promise.resolve(null)
  ]);
  const front = document.createElement('canvas');
  front.width = width; front.height = height;
  const f = front.getContext('2d');
  f.drawImage(frontBg, 0, 0, width, height);
  ['frontName', 'frontTitle', 'frontEmail', 'frontPhone', 'frontWebsite', 'frontAddress'].forEach(id => drawTextLayer(f, id, data, scale));
  const back = document.createElement('canvas');
  back.width = width; back.height = height;
  const b = back.getContext('2d');
  b.drawImage(backBg, 0, 0, width, height);
  const logoCfg = state.layout.backLogo;
  if (logoImg) b.drawImage(logoImg, logoCfg.x * scale, logoCfg.y * scale, logoCfg.width * scale, logoCfg.height * scale);
  drawTextLayer(b, 'backCompany', data, scale);
  drawTextLayer(b, 'backTagline', data, scale);
  return { front, back };
}
function dataUrlBytes(url) {
  const bin = atob(url.split(',')[1]);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}
function buildPdf(images) {
  const encoder = new TextEncoder(), parts = [], offsets = [0];
  let offset = 0;
  const bytes = chunk => { parts.push(chunk); offset += chunk.length; };
  const text = str => bytes(encoder.encode(str));
  const pageW = 252, pageH = 144, count = 2 + images.length * 3;
  bytes(new Uint8Array([0x25,0x50,0x44,0x46,0x2d,0x31,0x2e,0x33,0x0a,0x25,0xff,0xff,0xff,0xff,0x0a]));
  offsets[1] = offset; text('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  const kids = images.map((_, i) => `${3 + i * 3} 0 R`).join(' ');
  offsets[2] = offset; text(`2 0 obj\n<< /Type /Pages /Count ${images.length} /Kids [${kids}] >>\nendobj\n`);
  images.forEach((img, i) => {
    const page = 3 + i * 3, image = page + 1, content = page + 2, stream = `q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im${i + 1} Do\nQ\n`;
    offsets[page] = offset; text(`${page} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im${i + 1} ${image} 0 R >> >> /Contents ${content} 0 R >>\nendobj\n`);
    offsets[image] = offset; text(`${image} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.bytes.length} >>\nstream\n`); bytes(img.bytes); text('\nendstream\nendobj\n');
    offsets[content] = offset; text(`${content} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`);
  });
  const xref = offset; text(`xref\n0 ${count + 1}\n`); text('0000000000 65535 f \n');
  for (let i = 1; i <= count; i += 1) text(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  text(`trailer\n<< /Size ${count + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts, { type: 'application/pdf' });
}

let drag = null;
function beginDrag(event, id) { drag = { id, x: event.clientX, y: event.clientY, ox: layerCfg(id).x, oy: layerCfg(id).y }; selectLayer(id); }
function moveDrag(event) {
  if (!drag) return;
  const cfg = layerCfg(drag.id);
  cfg.x = drag.ox + (event.clientX - drag.x) / scaleNow();
  cfg.y = drag.oy + (event.clientY - drag.y) / scaleNow();
  clampLayer(drag.id);
  applyLayer(drag.id);
  els.layerPosX.value = Math.round(cfg.x);
  els.layerPosY.value = Math.round(cfg.y);
}
function endDrag() { if (!drag) return; drag = null; markDirty(); }
function updateLayerFromControls() {
  const cfg = layerCfg();
  cfg.x = Number(els.layerPosX.value || cfg.x);
  cfg.y = Number(els.layerPosY.value || cfg.y);
  if (cfg.type === 'text') {
    cfg.fontSize = Number(els.layerFontSize.value || cfg.fontSize);
    cfg.color = els.layerColor.value || cfg.color;
  }
  applyLayer(state.activeLayerId);
  clampLayer(state.activeLayerId);
  applyLayer(state.activeLayerId);
  markDirty();
}

els.loginForm.addEventListener('submit', event => {
  event.preventDefault();
  const user = els.loginUsername.value.trim(), pass = els.loginPassword.value;
  if (!user || !pass) return setLoginStatus('Enter both username and password to continue.', true);
  if (!(user in TEST_USERS)) return setLoginStatus('Use one of the demo accounts: admin or client.', true);
  const users = storedUsers();
  if (users[user].password !== pass) return setLoginStatus('That password does not match this username.', true);
  saveUsers(users);
  setLoginStatus('Login successful. Loading your workspace...');
  state.currentUser = user;
  renderSavedDesigns();
  els.startupScreen.classList.add('am-startup--hidden');
  document.body.classList.remove('am-startup-active');
  validateName();
  els.designName.focus();
});
els.designName.addEventListener('input', () => { validateName(); state.hasUnsavedChanges = true; });
Object.values(fields).forEach(field => field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', () => { updatePreviewText(); markDirty(); }));
els.templateSelect.addEventListener('change', markDirty);
els.savedDesigns.addEventListener('change', () => { if (els.savedDesigns.value) applyDesign(userRecord()?.designs?.[els.savedDesigns.value]); });
els.saveBtn.addEventListener('click', saveCurrentDesign);
els.pageButtons.forEach(btn => btn.addEventListener('click', () => setActivePage(btn.dataset.page)));
els.zoomSlider.addEventListener('input', () => applyZoom(els.zoomSlider.value));
els.zoomIn.addEventListener('click', () => { els.zoomSlider.value = Math.min(150, Number(els.zoomSlider.value) + 10); applyZoom(els.zoomSlider.value); });
els.zoomOut.addEventListener('click', () => { els.zoomSlider.value = Math.max(50, Number(els.zoomSlider.value) - 10); applyZoom(els.zoomSlider.value); });
els.fieldLogo.addEventListener('change', () => {
  const file = els.fieldLogo.files[0];
  if (!file) return;
  els.uploadName.textContent = file.name;
  const reader = new FileReader();
  reader.onload = e => { setLogoSrc(e.target.result); markDirty(); };
  reader.readAsDataURL(file);
});
els.layerEls.forEach(el => el.addEventListener('pointerdown', event => beginDrag(event, el.dataset.layerId)));
document.addEventListener('pointermove', moveDrag);
document.addEventListener('pointerup', endDrag);
els.layerPosX.addEventListener('input', updateLayerFromControls);
els.layerPosY.addEventListener('input', updateLayerFromControls);
els.layerFontSize.addEventListener('input', updateLayerFromControls);
els.layerColor.addEventListener('input', updateLayerFromControls);
els.btnPreview.addEventListener('click', () => {
  if (!ensureNamed()) return;
  const win = window.open('', '_blank');
  if (!win) return alert('Preview was blocked. Please allow popups and try again.');
  win.document.open();
  win.document.write(previewHtml(activeData()));
  win.document.close();
});
els.btnDownload.addEventListener('click', async () => {
  if (!ensureNamed()) return;
  els.btnDownload.textContent = 'Generating...';
  els.btnDownload.disabled = true;
  try {
    const { front, back } = await renderCanvases(activeData());
    const pdf = buildPdf([
      { width: front.width, height: front.height, bytes: dataUrlBytes(front.toDataURL('image/jpeg', 0.92)) },
      { width: back.width, height: back.height, bytes: dataUrlBytes(back.toDataURL('image/jpeg', 0.92)) }
    ]);
    const url = URL.createObjectURL(pdf), link = document.createElement('a');
    link.href = url;
    link.download = `${els.designName.value.trim().replace(/\s+/g, '-').toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('PDF generation failed:', err);
    alert('PDF generation failed. Please try again.');
  } finally {
    els.btnDownload.textContent = 'Download PDF';
    validateName();
  }
});
els.closePanel.addEventListener('click', () => {
  const msg = state.hasUnsavedChanges ? 'You have unsaved changes. Please save your design before quitting Architect Mini. Close anyway?' : 'Are you sure you want to close Architect Mini? Your progress will not be saved.';
  if (window.confirm(msg)) { window.close(); window.open('', '_self'); window.close(); }
});

document.body.classList.add('am-startup-active');
els.zoomSlider.value = 150;
applyZoom(150);
setActivePage('1');
setLogoSrc('');
updatePreviewText();
applyAllLayers();
renderSavedDesigns();
validateName();
typeStartupWordmark();
