import React, { useMemo, useRef, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Download, FileCode2, Image as ImageIcon, RotateCcw, Upload, Smartphone, Monitor } from 'lucide-react';
import './styles.css';

const BASE_WIDTH = 1536;
const BASE_HEIGHT = 858;
const EXPORT_SCALE = 2;
const DEFAULT_BG = '/modelo.jpg';

const initialData = {
  name: '',
  role: '',
  email: '',
  site: 'www.vibrasolucoes.com.br',
  phone: '0800 000 9911 | (31) 99930-2811',
  address1: 'Rua Niterói, 142 A, Canaã',
  address2: 'CEP 35.700-190 | Sete Lagoas | Minas Gerais',
  cnpjLabel: 'Matriz:',
  cnpjNumber: '22.657.915/0001-07',
  tagline: 'CONEXÕES QUE GERAM CONFIANÇA',
  nameLink: 'https://www.vibrasolucoes.com.br',
  roleLink: 'https://www.vibrasolucoes.com.br',
  emailLink: '',
  siteLink: 'https://www.vibrasolucoes.com.br',
  phoneLink: '',
  addressLink: 'https://www.google.com/maps/search/Rua+Niterói,+142+A,+Canaã,+Sete+Lagoas',
  brandLink: 'https://www.vibrasolucoes.com.br',
  mainColor: '#061b42',
  accentColor: '#00d5f4',
  nameSize: 66,
  roleSize: 31,
  textSize: 22,
  opacityPanel: 1,
  exportScale: 2,
};

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function normalizeUrl(url) {
  const v = String(url || '').trim();
  if (!v) return '#';
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
  return `https://${v}`;
}

function slug(value = 'assinatura-vibra') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'assinatura-vibra';
}

function fitFont(text, base, maxChars, min) {
  const len = String(text || '').length;
  if (len <= maxChars) return base;
  return Math.max(min, base - (len - maxChars) * 1.15);
}

async function urlToDataUrl(url) {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  const response = await fetch(url, { cache: 'no-store' });
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function iconSvg(type, x, y, color) {
  const ring = `
    <circle cx="${x}" cy="${y}" r="25" fill="none" stroke="${color}" stroke-width="2.35" opacity=".95"/>
    <circle cx="${x}" cy="${y}" r="20.5" fill="${color}" opacity=".08"/>
  `;

  const openGroup = `<g transform="translate(${x}, ${y})" fill="none" stroke="#f5ffff" stroke-linecap="round" stroke-linejoin="round">`;
  const closeGroup = `</g>`;

  if (type === 'mail') {
    return `${ring}${openGroup}<rect x="-10" y="-7" width="20" height="14" rx="2" stroke-width="2"/><path d="M-10 -7 L0 1 L10 -7" stroke-width="2"/>${closeGroup}`;
  }

  if (type === 'web') {
    return `${ring}${openGroup}<circle cx="0" cy="0" r="10" stroke-width="2"/><path d="M-10 0 H10" stroke-width="1.9"/><path d="M0 -10 C6 -4 6 4 0 10" stroke-width="1.55"/><path d="M0 -10 C-6 -4 -6 4 0 10" stroke-width="1.55"/>${closeGroup}`;
  }

  if (type === 'phone') {
    return `${ring}${openGroup}<path d="M-6.5 -10.5c-1.7 0-3 1.3-3 3 0 9.4 7.6 17 17 17 1.7 0 3-1.3 3-3V3.5l-5.4-2.1-2.8 2.8c-3.3-1.7-5.9-4.3-7.6-7.6l2.8-2.8-2.1-5.4z" stroke-width="2.05"/>${closeGroup}`;
  }

  if (type === 'pin') {
    return `${ring}${openGroup}<path d="M0 12 C-8 4 -10 -1 -10 -6.5 a10 10 0 1 1 20 0 C10 -1 8 4 0 12Z" stroke-width="2"/><circle cx="0" cy="-6.5" r="3.2" fill="#f5ffff" stroke="none"/>${closeGroup}`;
  }

  return `${ring}${openGroup}<rect x="-8" y="-11" width="16" height="22" stroke-width="2"/><path d="M-4 -5h2M2 -5h2M-4 0h2M2 0h2M-4 5h2M2 5h2M-12 11h24" stroke-width="2"/>${closeGroup}`;
}

function buildSignatureSvg(data, bgHref, includeLinks = true) {
  const d = { ...data };
  const nameSize = fitFont(d.name, Number(d.nameSize), 19, 42);
  const emailSize = fitFont(d.email, Number(d.textSize), 34, 15);
  const siteSize = fitFont(d.site, Number(d.textSize), 33, 15);
  const phoneSize = fitFont(d.phone, Number(d.textSize), 31, 15);
  const address1Size = fitFont(d.address1, Number(d.textSize), 33, 15);
  const address2Size = fitFont(d.address2, Number(d.textSize), 37, 15);
  const cnpjSize = fitFont(`${d.cnpjLabel} ${d.cnpjNumber}`, Number(d.textSize), 31, 15);
  const panel = d.mainColor;
  const accent = d.accentColor;
  const text = '#ffffff';
  const faded = '#dbf9ff';
  const linkOpen = (url) => includeLinks ? `<a href="${esc(normalizeUrl(url))}" target="_blank">` : '';
  const linkClose = includeLinks ? '</a>' : '';
  const logoLinkOpen = linkOpen(d.brandLink);

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BASE_WIDTH} ${BASE_HEIGHT}" width="${BASE_WIDTH}" height="${BASE_HEIGHT}">
  <defs>
    <filter id="vibraTextShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
    <filter id="vibraGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="${accent}" flood-opacity="0.95"/>
    </filter>
    <linearGradient id="leftPanel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${panel}" stop-opacity="1"/>
      <stop offset=".52" stop-color="#020b23" stop-opacity="1"/>
      <stop offset="1" stop-color="${panel}" stop-opacity="1"/>
    </linearGradient>
  </defs>

  <image href="${bgHref}" x="0" y="0" width="${BASE_WIDTH}" height="${BASE_HEIGHT}" preserveAspectRatio="none"/>

  <rect x="48" y="48" width="740" height="640" rx="14" fill="url(#leftPanel)" opacity="1"/>
  <path d="M48 88 Q48 48 88 48 H788" fill="none" stroke="${accent}" stroke-width="1.15" opacity=".28"/>
  <path d="M52 688 H788" fill="none" stroke="${accent}" stroke-width="1.15" opacity=".26"/>
  <line x1="102" y1="214" x2="553" y2="214" stroke="${accent}" stroke-width="4" opacity=".92"/>
  <circle cx="553" cy="214" r="4.2" fill="#ffffff" filter="url(#vibraGlow)"/>

  ${linkOpen(d.nameLink)}
    <text x="84" y="135" fill="${text}" font-size="${nameSize}" font-family="Arial, Helvetica, sans-serif" font-weight="800" letter-spacing="-.8" filter="url(#vibraTextShadow)">${esc(d.name)}</text>
  ${linkClose}

  ${linkOpen(d.roleLink)}
    <text x="84" y="184" fill="${accent}" font-size="${Number(d.roleSize)}" font-family="Arial, Helvetica, sans-serif" font-weight="800" filter="url(#vibraTextShadow)">${esc(d.role)}</text>
  ${linkClose}

  ${[
    ['mail', 271],
    ['web', 337],
    ['phone', 438],
    ['pin', 528],
    ['building', 624],
  ].map(([type, centerY]) => `${iconSvg(type, 134, centerY, accent)}<line x1="193" y1="${centerY - 27}" x2="193" y2="${centerY + 27}" stroke="${accent}" stroke-width="1.4" opacity=".72"/>`).join('')}

  ${linkOpen(d.emailLink || (d.email ? `mailto:${d.email}` : '#'))}
    <text x="218" y="281" fill="${faded}" font-size="${emailSize}" font-family="Arial, Helvetica, sans-serif" font-weight="400">${esc(d.email)}</text>
  ${linkClose}

  ${linkOpen(d.siteLink)}
    <text x="218" y="347" fill="${faded}" font-size="${siteSize}" font-family="Arial, Helvetica, sans-serif" font-weight="400">${esc(d.site)}</text>
  ${linkClose}

  ${linkOpen(d.phoneLink)}
    <text x="218" y="446" fill="${faded}" font-size="${phoneSize}" font-family="Arial, Helvetica, sans-serif">
      <tspan fill="${accent}" font-weight="800">Atendimento:</tspan><tspan> ${esc(d.phone)}</tspan>
    </text>
  ${linkClose}

  ${linkOpen(d.addressLink)}
    <text x="218" y="539" fill="${faded}" font-size="${address1Size}" font-family="Arial, Helvetica, sans-serif">${esc(d.address1)}</text>
    <text x="218" y="585" fill="${faded}" font-size="${address2Size}" font-family="Arial, Helvetica, sans-serif">${esc(d.address2)}</text>
  ${linkClose}

  <text x="218" y="632" fill="${faded}" font-size="${cnpjSize}" font-family="Arial, Helvetica, sans-serif">
    <tspan fill="${accent}" font-weight="800">${esc(d.cnpjLabel)}</tspan><tspan> ${esc(d.cnpjNumber)}</tspan>
  </text>

  <rect x="910" y="470" width="520" height="110" rx="12" fill="#020b23" opacity=".94"/>
  <line x1="1002" y1="520" x2="1336" y2="520" stroke="${accent}" stroke-width="1.6" opacity=".82"/>
  <circle cx="1169" cy="520" r="3.4" fill="#ffffff" filter="url(#vibraGlow)"/>
  ${logoLinkOpen}
    <text x="1169" y="546" text-anchor="middle" fill="${accent}" font-size="16" font-family="Arial, Helvetica, sans-serif" font-weight="800" letter-spacing="5.4">${esc(d.tagline)}</text>
  ${linkClose}
</svg>`.trim();
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 300);
}

function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('vibra-pro-state');
      return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
    } catch {
      return initialData;
    }
  });
  const [bg, setBg] = useState(DEFAULT_BG);
  const [status, setStatus] = useState('Pronto para editar e exportar.');
  const svgWrapRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('vibra-pro-state', JSON.stringify(data));
  }, [data]);

  const svgMarkup = useMemo(() => buildSignatureSvg(data, bg, true), [data, bg]);

  const update = (key, value) => setData((old) => ({ ...old, [key]: value }));

  async function prepareSvgForExport(includeLinks = false) {
    setStatus('Preparando arquivo em alta nitidez...');
    const bgData = await urlToDataUrl(bg);
    return buildSignatureSvg(data, bgData, includeLinks);
  }

  async function exportImage(format) {
    try {
      const svg = await prepareSvgForExport(false);
      const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      const img = new Image();
      const scale = Number(data.exportScale || EXPORT_SCALE);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = BASE_WIDTH * scale;
        canvas.height = BASE_HEIGHT * scale;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        if (format === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const ext = format === 'jpeg' ? 'jpg' : 'png';
        const file = `assinatura-vibra-${slug(data.name)}-${scale}x.${ext}`;
        canvas.toBlob((blob) => {
          if (!blob) {
            setStatus('Erro ao gerar imagem. Tente novamente.');
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 400);
          setStatus(`Imagem ${ext.toUpperCase()} exportada em ${canvas.width} × ${canvas.height}px.`);
        }, mime, 0.96);
      };
      img.onerror = () => setStatus('Erro ao carregar SVG para exportação.');
      img.src = svgUrl;
    } catch (error) {
      console.error(error);
      setStatus('Erro na exportação. Verifique se a imagem base está carregando.');
    }
  }

  async function exportHtml() {
    try {
      const svg = await prepareSvgForExport(true);
      const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Assinatura ${esc(data.name)}</title>
<style>
  body { margin:0; padding:24px; background:#f4f7fb; font-family:Arial,Helvetica,sans-serif; }
  .signature { width:100%; max-width:920px; }
  svg { width:100%; height:auto; display:block; }
  a { cursor:pointer; }
</style>
</head>
<body>
  <div class="signature">
${svg}
  </div>
</body>
</html>`;
      downloadBlob(html, `assinatura-vibra-${slug(data.name)}.html`, 'text/html;charset=utf-8');
      setStatus('HTML clicável exportado com sucesso.');
    } catch (error) {
      console.error(error);
      setStatus('Erro ao exportar HTML.');
    }
  }

  function exportSvg() {
    prepareSvgForExport(true).then((svg) => {
      downloadBlob(svg, `assinatura-vibra-${slug(data.name)}.svg`, 'image/svg+xml;charset=utf-8');
      setStatus('SVG clicável exportado com sucesso.');
    });
  }

  function reset() {
    setData(initialData);
    setBg(DEFAULT_BG);
    setStatus('Dados restaurados.');
  }

  function handleBgUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBg(reader.result);
      setStatus('Imagem base atualizada.');
    };
    reader.readAsDataURL(file);
  }

  const outputSize = `${BASE_WIDTH * Number(data.exportScale || EXPORT_SCALE)} × ${BASE_HEIGHT * Number(data.exportScale || EXPORT_SCALE)} px`;

  return (
    <div className="app-shell">
      <aside className="editor-panel">
        <div className="brand-mini">
          <div className="logo-dot" />
          <div>
            <h1>Editor Vibra Pro</h1>
          </div>
        </div>

        <section className="group">
          <div className="group-title">Dados principais</div>
          <Field label="Nome" value={data.name} placeholder="Ex: Victor Pinheiro" onChange={(v) => update('name', v)} />
          <Field label="Cargo" value={data.role} placeholder="Ex: Diretor" onChange={(v) => update('role', v)} />
          <Field label="E-mail" value={data.email} placeholder="Ex: nome@vibrasolucoes.com.br" onChange={(v) => { update('email', v); update('emailLink', v ? `mailto:${v}` : ''); }} />
          <Field label="Site" value={data.site} onChange={(v) => update('site', v)} />
          <Field label="Telefone" value={data.phone} onChange={(v) => update('phone', v)} />
          <Field label="Endereço" value={data.address1} onChange={(v) => update('address1', v)} />
          <Field label="CEP / Cidade / Estado" value={data.address2} onChange={(v) => update('address2', v)} />
          <div className="two-cols">
            <Field label="Unidade" value={data.cnpjLabel} onChange={(v) => update('cnpjLabel', v)} />
            <Field label="CNPJ" value={data.cnpjNumber} onChange={(v) => update('cnpjNumber', v)} />
          </div>
          <Field label="Slogan" value={data.tagline} onChange={(v) => update('tagline', v)} />
        </section>

        <section className="group">
          <div className="group-title">Links clicáveis</div>
          <Field label="Link do nome" value={data.nameLink} onChange={(v) => update('nameLink', v)} />
          <Field label="Link do cargo" value={data.roleLink} onChange={(v) => update('roleLink', v)} />
          <Field label="Link do site" value={data.siteLink} onChange={(v) => update('siteLink', v)} />
          <Field label="Link do telefone" value={data.phoneLink} placeholder="Opcional. Ex: tel:+5531999302811" onChange={(v) => update('phoneLink', v)} />
          <Field label="Link do endereço" value={data.addressLink} onChange={(v) => update('addressLink', v)} />
          <Field label="Link da marca" value={data.brandLink} onChange={(v) => update('brandLink', v)} />
        </section>

        <section className="group">
          <div className="group-title">Ajustes visuais</div>
          <div className="two-cols">
            <ColorField label="Azul principal" value={data.mainColor} onChange={(v) => update('mainColor', v)} />
            <ColorField label="Ciano destaque" value={data.accentColor} onChange={(v) => update('accentColor', v)} />
          </div>
          <div className="two-cols">
            <Field label="Nome px" type="number" value={data.nameSize} onChange={(v) => update('nameSize', Number(v))} />
            <Field label="Texto px" type="number" value={data.textSize} onChange={(v) => update('textSize', Number(v))} />
          </div>
          <div className="two-cols">
            <Field label="Cargo px" type="number" value={data.roleSize} onChange={(v) => update('roleSize', Number(v))} />
            <Field label="Escala export." type="number" value={data.exportScale} onChange={(v) => update('exportScale', Math.max(1, Number(v) || 2))} />
          </div>
          <label className="field-label">Painel fixo sem marca d'água</label>
          <input className="range" type="range" min="1" max="1" step="0.01" value="1" readOnly />
          <label className="upload-box">
            <Upload size={18} />
            Trocar imagem base
            <input type="file" accept="image/*" onChange={handleBgUpload} />
          </label>
        </section>

        <section className="export-grid">
          <button className="btn primary" onClick={() => exportImage('png')}><ImageIcon size={18} /> PNG alta nitidez</button>
          <button className="btn secondary" onClick={() => exportImage('jpeg')}><Download size={18} /> JPG alta nitidez</button>
          <button className="btn secondary" onClick={exportHtml}><FileCode2 size={18} /> HTML clicável</button>
          <button className="btn ghost" onClick={exportSvg}><FileCode2 size={18} /> SVG clicável</button>
          <button className="btn danger" onClick={reset}><RotateCcw size={18} /> Restaurar</button>
        </section>

        <div className="status-box">{status}</div>
      </aside>

      <main className="preview-area">
        <header className="preview-header">
          <div>
            <h2>Assinatura executiva</h2>
            <p>Base fiel à imagem aprovada, sem marcas d'água. Exportação atual: {outputSize}.</p>
          </div>
          <div className="device-tags">
            <span><Monitor size={16} /> Desktop</span>
            <span><Smartphone size={16} /> Mobile</span>
          </div>
        </header>

        <div className="preview-card" ref={svgWrapRef}>
          <div className="signature-scale" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <label className="field color-field">
      <span>{label}</span>
      <div className="color-row">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </label>
  );
}

createRoot(document.getElementById('root')).render(<App />);
