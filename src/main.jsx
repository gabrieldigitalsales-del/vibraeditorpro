import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { Copy, FileCode2, Image as ImageIcon, List, Monitor, RefreshCcw, Save, Smartphone, Trash2, UploadCloud } from 'lucide-react';
import './styles.css';

const BASE_WIDTH = 1536;
const BASE_HEIGHT = 858;
const EMAIL_WIDTH = 700;
const EMAIL_HEIGHT = 391;
const MAX_JPG_KB = 40;
const DEFAULT_BG = '/modelo.jpg';
const STORAGE_BUCKET = 'vibra-signature-assets';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const initialData = {
  id: null,
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
};

function esc(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function normalizeUrl(url) {
  const v = String(url || '').trim();
  if (!v) return '#';
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
  return `https://${v}`;
}

function slug(value = 'assinatura-vibra') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'assinatura-vibra';
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
  const ring = `<circle cx="${x}" cy="${y}" r="25" fill="none" stroke="${color}" stroke-width="2.35" opacity=".95"/><circle cx="${x}" cy="${y}" r="20.5" fill="${color}" opacity=".08"/>`;
  const openGroup = `<g transform="translate(${x}, ${y})" fill="none" stroke="#f5ffff" stroke-linecap="round" stroke-linejoin="round">`;
  const closeGroup = `</g>`;
  if (type === 'mail') return `${ring}${openGroup}<rect x="-10" y="-7" width="20" height="14" rx="2" stroke-width="2"/><path d="M-10 -7 L0 1 L10 -7" stroke-width="2"/>${closeGroup}`;
  if (type === 'web') return `${ring}${openGroup}<circle cx="0" cy="0" r="10" stroke-width="2"/><path d="M-10 0 H10" stroke-width="1.9"/><path d="M0 -10 C6 -4 6 4 0 10" stroke-width="1.55"/><path d="M0 -10 C-6 -4 -6 4 0 10" stroke-width="1.55"/>${closeGroup}`;
  if (type === 'phone') return `${ring}${openGroup}<path d="M-6.5 -10.5c-1.7 0-3 1.3-3 3 0 9.4 7.6 17 17 17 1.7 0 3-1.3 3-3V3.5l-5.4-2.1-2.8 2.8c-3.3-1.7-5.9-4.3-7.6-7.6l2.8-2.8-2.1-5.4z" stroke-width="2.05"/>${closeGroup}`;
  if (type === 'pin') return `${ring}${openGroup}<path d="M0 12 C-8 4 -10 -1 -10 -6.5 a10 10 0 1 1 20 0 C10 -1 8 4 0 12Z" stroke-width="2"/><circle cx="0" cy="-6.5" r="3.2" fill="#f5ffff" stroke="none"/>${closeGroup}`;
  return `${ring}${openGroup}<rect x="-8" y="-11" width="16" height="22" stroke-width="2"/><path d="M-4 -5h2M2 -5h2M-4 0h2M2 0h2M-4 5h2M2 5h2M-12 11h24" stroke-width="2"/>${closeGroup}`;
}

function buildSignatureSvg(data, bgHref) {
  const nameSize = fitFont(data.name, Number(data.nameSize), 19, 42);
  const emailSize = fitFont(data.email, Number(data.textSize), 34, 15);
  const siteSize = fitFont(data.site, Number(data.textSize), 33, 15);
  const phoneSize = fitFont(data.phone, Number(data.textSize), 31, 15);
  const address1Size = fitFont(data.address1, Number(data.textSize), 33, 15);
  const address2Size = fitFont(data.address2, Number(data.textSize), 37, 15);
  const cnpjSize = fitFont(`${data.cnpjLabel} ${data.cnpjNumber}`, Number(data.textSize), 31, 15);
  const panel = data.mainColor;
  const accent = data.accentColor;
  const text = '#ffffff';
  const faded = '#dbf9ff';
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BASE_WIDTH} ${BASE_HEIGHT}" width="${BASE_WIDTH}" height="${BASE_HEIGHT}">
  <defs>
    <filter id="vibraTextShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.45"/></filter>
    <filter id="vibraGlow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="${accent}" flood-opacity="0.95"/></filter>
    <linearGradient id="leftPanel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${panel}" stop-opacity="1"/><stop offset=".52" stop-color="#020b23" stop-opacity="1"/><stop offset="1" stop-color="${panel}" stop-opacity="1"/></linearGradient>
  </defs>
  <image href="${bgHref}" x="0" y="0" width="${BASE_WIDTH}" height="${BASE_HEIGHT}" preserveAspectRatio="none"/>
  <rect x="48" y="48" width="740" height="640" rx="14" fill="url(#leftPanel)" opacity="1"/>
  <path d="M48 88 Q48 48 88 48 H788" fill="none" stroke="${accent}" stroke-width="1.15" opacity=".28"/>
  <path d="M52 688 H788" fill="none" stroke="${accent}" stroke-width="1.15" opacity=".26"/>
  <line x1="102" y1="214" x2="553" y2="214" stroke="${accent}" stroke-width="4" opacity=".92"/>
  <circle cx="553" cy="214" r="4.2" fill="#ffffff" filter="url(#vibraGlow)"/>
  <text x="84" y="135" fill="${text}" font-size="${nameSize}" font-family="Arial, Helvetica, sans-serif" font-weight="800" letter-spacing="-.8" filter="url(#vibraTextShadow)">${esc(data.name)}</text>
  <text x="84" y="184" fill="${accent}" font-size="${Number(data.roleSize)}" font-family="Arial, Helvetica, sans-serif" font-weight="800" filter="url(#vibraTextShadow)">${esc(data.role)}</text>
  ${[['mail',271],['web',337],['phone',438],['pin',528],['building',624]].map(([type, centerY]) => `${iconSvg(type, 134, centerY, accent)}<line x1="193" y1="${centerY - 27}" x2="193" y2="${centerY + 27}" stroke="${accent}" stroke-width="1.4" opacity=".72"/>`).join('')}
  <text x="218" y="281" fill="${faded}" font-size="${emailSize}" font-family="Arial, Helvetica, sans-serif">${esc(data.email)}</text>
  <text x="218" y="347" fill="${faded}" font-size="${siteSize}" font-family="Arial, Helvetica, sans-serif">${esc(data.site)}</text>
  <text x="218" y="446" fill="${faded}" font-size="${phoneSize}" font-family="Arial, Helvetica, sans-serif"><tspan fill="${accent}" font-weight="800">Atendimento:</tspan><tspan> ${esc(data.phone)}</tspan></text>
  <text x="218" y="539" fill="${faded}" font-size="${address1Size}" font-family="Arial, Helvetica, sans-serif">${esc(data.address1)}</text>
  <text x="218" y="585" fill="${faded}" font-size="${address2Size}" font-family="Arial, Helvetica, sans-serif">${esc(data.address2)}</text>
  <text x="218" y="632" fill="${faded}" font-size="${cnpjSize}" font-family="Arial, Helvetica, sans-serif"><tspan fill="${accent}" font-weight="800">${esc(data.cnpjLabel)}</tspan><tspan> ${esc(data.cnpjNumber)}</tspan></text>
  <rect x="910" y="470" width="520" height="110" rx="12" fill="#020b23" opacity=".94"/>
  <line x1="1002" y1="520" x2="1336" y2="520" stroke="${accent}" stroke-width="1.6" opacity=".82"/>
  <circle cx="1169" cy="520" r="3.4" fill="#ffffff" filter="url(#vibraGlow)"/>
  <text x="1169" y="546" text-anchor="middle" fill="${accent}" font-size="16" font-family="Arial, Helvetica, sans-serif" font-weight="800" letter-spacing="5.4">${esc(data.tagline)}</text>
</svg>`.trim();
}

function mapRect(x1, y1, x2, y2, width, height) {
  const sx = width / BASE_WIDTH;
  const sy = height / BASE_HEIGHT;
  return [x1, y1, x2, y2].map((value, index) => Math.round(value * (index % 2 === 0 ? sx : sy))).join(',');
}

function buildEmailHtml(data, imageUrl, width = EMAIL_WIDTH, height = EMAIL_HEIGHT) {
  const mapName = `vibra-map-${Date.now()}`;
  const brandHref = normalizeUrl(data.brandLink || data.siteLink || 'https://www.vibrasolucoes.com.br');
  const siteHref = normalizeUrl(data.siteLink || data.site || 'https://www.vibrasolucoes.com.br');
  const emailHref = data.emailLink || (data.email ? `mailto:${data.email}` : '');
  const phoneHref = data.phoneLink || (data.phone ? `tel:${String(data.phone).replace(/[^\d+]/g, '')}` : '');
  const addressHref = normalizeUrl(data.addressLink || 'https://www.google.com/maps/search/Rua+Niterói,+142+A,+Canaã,+Sete+Lagoas');
  const nameHref = normalizeUrl(data.nameLink || brandHref);
  const roleHref = normalizeUrl(data.roleLink || brandHref);

  const areas = [
    data.name ? `<area shape="rect" coords="${mapRect(78, 70, 640, 152, width, height)}" href="${esc(nameHref)}" target="_blank" alt="${esc(data.name)}">` : '',
    data.role ? `<area shape="rect" coords="${mapRect(80, 154, 420, 195, width, height)}" href="${esc(roleHref)}" target="_blank" alt="${esc(data.role)}">` : '',
    data.email && emailHref ? `<area shape="rect" coords="${mapRect(210, 252, 740, 292, width, height)}" href="${esc(emailHref)}" alt="${esc(data.email)}">` : '',
    data.site ? `<area shape="rect" coords="${mapRect(210, 318, 680, 360, width, height)}" href="${esc(siteHref)}" target="_blank" alt="${esc(data.site)}">` : '',
    data.phone && phoneHref ? `<area shape="rect" coords="${mapRect(210, 418, 760, 460, width, height)}" href="${esc(phoneHref)}" alt="${esc(data.phone)}">` : '',
    data.address1 ? `<area shape="rect" coords="${mapRect(210, 512, 760, 590, width, height)}" href="${esc(addressHref)}" target="_blank" alt="Endereço">` : '',
    `<area shape="rect" coords="${mapRect(910, 470, 1430, 580, width, height)}" href="${esc(brandHref)}" target="_blank" alt="Vibra Soluções">`,
  ].filter(Boolean).join('\n              ');

  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:${width}px;max-width:${width}px;margin:0;padding:0;">
      <tr>
        <td style="padding:0;margin:0;line-height:0;font-size:0;">
          <img src="${esc(imageUrl)}" alt="Assinatura Vibra Soluções" width="${width}" height="${height}" usemap="#${mapName}" style="display:block;width:${width}px;max-width:${width}px;height:${height}px;border:0;outline:none;text-decoration:none;margin:0;padding:0;" />
          <map name="${mapName}" id="${mapName}">
              ${areas}
          </map>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function svgToJpgBlob(svgMarkup, maxKb = MAX_JPG_KB) {
  const aspect = EMAIL_HEIGHT / EMAIL_WIDTH;
  const widths = [700, 660, 620, 580, 540, 500, 460];
  const qualities = [0.86, 0.8, 0.74, 0.68, 0.62, 0.56, 0.5, 0.44, 0.38];
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
  const img = new Image();
  img.decoding = 'async';
  await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = svgUrl; });
  for (const width of widths) {
    const height = Math.round(width * aspect);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    for (const quality of qualities) {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= maxKb * 1024) return { blob, width, height, quality, sizeKb: blob.size / 1024 };
    }
  }
  const fallbackCanvas = document.createElement('canvas');
  fallbackCanvas.width = 420;
  fallbackCanvas.height = Math.round(420 * aspect);
  const ctx = fallbackCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);
  ctx.drawImage(img, 0, 0, fallbackCanvas.width, fallbackCanvas.height);
  const fallbackBlob = await new Promise((resolve) => fallbackCanvas.toBlob(resolve, 'image/jpeg', 0.34));
  return { blob: fallbackBlob, width: fallbackCanvas.width, height: fallbackCanvas.height, quality: 0.34, sizeKb: fallbackBlob.size / 1024 };
}

async function copyText(text) { await navigator.clipboard.writeText(text); }

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return <label className="field"><span>{label}</span><input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label>;
}

function ColorField({ label, value, onChange }) {
  return <label className="field"><span>{label}</span><div className="color-row"><input type="color" value={value} onChange={(e) => onChange(e.target.value)} /><input type="text" value={value} onChange={(e) => onChange(e.target.value)} /></div></label>;
}

function App() {
  const [data, setData] = useState(() => { try { const saved = localStorage.getItem('vibra-supabase-local-state'); return saved ? { ...initialData, ...JSON.parse(saved) } : initialData; } catch { return initialData; } });
  const [savedItems, setSavedItems] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [status, setStatus] = useState('Pronto para editar, gerar e enviar ao Supabase.');
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [lastMeta, setLastMeta] = useState(null);
  useEffect(() => { localStorage.setItem('vibra-supabase-local-state', JSON.stringify(data)); }, [data]);
  useEffect(() => { loadSaved(); }, []);
  const svgMarkup = useMemo(() => buildSignatureSvg(data, DEFAULT_BG), [data]);
  const update = (key, value) => setData((old) => ({ ...old, [key]: value }));

  async function loadSaved() {
    if (!supabase) return;
    try {
      setLoadingSaved(true);
      const { data: rows, error } = await supabase.from('vibra_email_signatures').select('*').order('updated_at', { ascending: false });
      if (error) throw error;
      setSavedItems(rows || []);
    } catch (error) {
      console.error(error);
      setStatus(`Erro ao carregar assinaturas salvas: ${error.message}`);
    } finally { setLoadingSaved(false); }
  }

  function createSlug() { return slug(data.name || data.email || `assinatura-${Date.now()}`); }

  async function generateAndUpload() {
    if (!supabase) return setStatus('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para usar o Supabase.');
    try {
      setStatus('Preparando assinatura e exportando JPG até 40 KB...');
      const bgData = await urlToDataUrl(DEFAULT_BG);
      const svg = buildSignatureSvg(data, bgData);
      const result = await svgToJpgBlob(svg, MAX_JPG_KB);
      const signatureSlug = createSlug();
      const filePath = `signatures/${signatureSlug}-${Date.now()}.jpg`;
      setStatus('Enviando imagem para o Supabase Storage...');
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, result.blob, { contentType: 'image/jpeg', upsert: true });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
      const imageUrl = publicData.publicUrl;
      const html = buildEmailHtml(data, imageUrl, result.width, result.height);
      setStatus('Salvando dados da assinatura no banco...');
      const payload = { slug: signatureSlug, name: data.name, role: data.role, email: data.email, site: data.site, phone: data.phone, address1: data.address1, address2: data.address2, cnpj_label: data.cnpjLabel, cnpj_number: data.cnpjNumber, tagline: data.tagline, name_link: data.nameLink, role_link: data.roleLink, email_link: data.emailLink || (data.email ? `mailto:${data.email}` : ''), site_link: data.siteLink, phone_link: data.phoneLink, address_link: data.addressLink, brand_link: data.brandLink, image_url: imageUrl, storage_path: filePath, html_snippet: html };
      let saved;
      if (data.id) {
        const { data: row, error } = await supabase.from('vibra_email_signatures').update(payload).eq('id', data.id).select().single();
        if (error) throw error; saved = row;
      } else {
        const { data: row, error } = await supabase.from('vibra_email_signatures').insert(payload).select().single();
        if (error) throw error; saved = row;
      }
      setData((old) => ({ ...old, id: saved.id }));
      setGeneratedUrl(imageUrl);
      setGeneratedHtml(html);
      setLastMeta(result);
      setStatus(`Assinatura gerada, comprimida para ${result.sizeKb.toFixed(1)} KB e salva com sucesso.`);
      await loadSaved();
    } catch (error) {
      console.error(error);
      setStatus(`Erro ao gerar/salvar assinatura: ${error.message}`);
    }
  }

  async function downloadJpg() {
    try {
      setStatus('Gerando JPG local...');
      const bgData = await urlToDataUrl(DEFAULT_BG);
      const svg = buildSignatureSvg(data, bgData);
      const result = await svgToJpgBlob(svg, MAX_JPG_KB);
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a'); a.href = url; a.download = `assinatura-${createSlug()}.jpg`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 500);
      setLastMeta(result);
      setStatus(`JPG baixado: ${result.width} × ${result.height}px | ${result.sizeKb.toFixed(1)} KB.`);
    } catch (error) { console.error(error); setStatus(`Erro ao baixar JPG: ${error.message}`); }
  }

  function downloadHtmlFile() {
    if (!generatedHtml) return setStatus('Primeiro gere e envie a assinatura ao Supabase.');
    downloadBlob(generatedHtml, `assinatura-${createSlug()}.html`, 'text/html;charset=utf-8');
    setStatus('Arquivo HTML baixado com sucesso.');
  }
  async function copyHtml() {
    if (!generatedHtml) return setStatus('Primeiro gere e envie a assinatura ao Supabase.');
    await copyText(generatedHtml);
    setStatus('HTML copiado. Agora você pode colar no Gmail/Outlook.');
  }
  async function copyImageUrl() {
    if (!generatedUrl) return setStatus('Primeiro gere e envie a assinatura ao Supabase.');
    await copyText(generatedUrl);
    setStatus('URL pública da imagem copiada.');
  }
  function loadSignature(item) {
    setData({ id: item.id, name: item.name || '', role: item.role || '', email: item.email || '', site: item.site || '', phone: item.phone || '', address1: item.address1 || '', address2: item.address2 || '', cnpjLabel: item.cnpj_label || 'Matriz:', cnpjNumber: item.cnpj_number || '', tagline: item.tagline || '', nameLink: item.name_link || '', roleLink: item.role_link || '', emailLink: item.email_link || '', siteLink: item.site_link || '', phoneLink: item.phone_link || '', addressLink: item.address_link || '', brandLink: item.brand_link || '', mainColor: data.mainColor, accentColor: data.accentColor, nameSize: data.nameSize, roleSize: data.roleSize, textSize: data.textSize });
    setGeneratedUrl(item.image_url || ''); setGeneratedHtml(item.html_snippet || ''); setStatus(`Assinatura carregada: ${item.name || item.slug}`);
  }
  async function removeSignature(item) {
    if (!supabase) return;
    if (!window.confirm(`Excluir a assinatura de ${item.name || item.slug}?`)) return;
    try {
      setStatus('Excluindo assinatura...');
      if (item.storage_path) await supabase.storage.from(STORAGE_BUCKET).remove([item.storage_path]);
      const { error } = await supabase.from('vibra_email_signatures').delete().eq('id', item.id);
      if (error) throw error;
      if (data.id === item.id) { setData(initialData); setGeneratedHtml(''); setGeneratedUrl(''); }
      await loadSaved();
      setStatus('Assinatura excluída com sucesso.');
    } catch (error) { console.error(error); setStatus(`Erro ao excluir assinatura: ${error.message}`); }
  }
  function newSignature() { setData(initialData); setGeneratedHtml(''); setGeneratedUrl(''); setLastMeta(null); setStatus('Pronto para criar uma nova assinatura.'); }
  const envOk = Boolean(supabase);

  return <div className="app-shell">
    <aside className="editor-panel">
      <div className="brand-mini"><div className="logo-dot" /><div><h1>Vibra Signature Manager</h1></div></div>
      <div className="top-actions"><span className="badge">{envOk ? 'Supabase configurado' : 'Configure o .env para usar o Supabase'}</span><button className="btn outline" onClick={newSignature}><RefreshCcw size={16} /> Nova assinatura</button></div>
      <section className="group"><div className="group-title">Dados principais</div>
        <Field label="Nome" value={data.name} placeholder="Ex: Victor Pinheiro" onChange={(v) => update('name', v)} />
        <Field label="Cargo" value={data.role} placeholder="Ex: Diretor" onChange={(v) => update('role', v)} />
        <Field label="E-mail" value={data.email} placeholder="Ex: nome@vibrasolucoes.com.br" onChange={(v) => { update('email', v); update('emailLink', v ? `mailto:${v}` : ''); }} />
        <Field label="Site" value={data.site} onChange={(v) => update('site', v)} />
        <Field label="Telefone" value={data.phone} onChange={(v) => update('phone', v)} />
        <Field label="Endereço" value={data.address1} onChange={(v) => update('address1', v)} />
        <Field label="CEP / Cidade / Estado" value={data.address2} onChange={(v) => update('address2', v)} />
        <div className="two-cols"><Field label="Unidade" value={data.cnpjLabel} onChange={(v) => update('cnpjLabel', v)} /><Field label="CNPJ" value={data.cnpjNumber} onChange={(v) => update('cnpjNumber', v)} /></div>
        <Field label="Slogan" value={data.tagline} onChange={(v) => update('tagline', v)} />
      </section>
      <section className="group"><div className="group-title">Links clicáveis</div>
        <Field label="Link do nome" value={data.nameLink} onChange={(v) => update('nameLink', v)} />
        <Field label="Link do cargo" value={data.roleLink} onChange={(v) => update('roleLink', v)} />
        <Field label="Link do site" value={data.siteLink} onChange={(v) => update('siteLink', v)} />
        <Field label="Link do telefone" value={data.phoneLink} placeholder="Opcional. Ex: tel:+5531999302811" onChange={(v) => update('phoneLink', v)} />
        <Field label="Link do endereço" value={data.addressLink} onChange={(v) => update('addressLink', v)} />
        <Field label="Link da marca" value={data.brandLink} onChange={(v) => update('brandLink', v)} />
      </section>
      <section className="group"><div className="group-title">Visual</div>
        <div className="two-cols"><ColorField label="Azul principal" value={data.mainColor} onChange={(v) => update('mainColor', v)} /><ColorField label="Ciano destaque" value={data.accentColor} onChange={(v) => update('accentColor', v)} /></div>
        <div className="two-cols"><Field label="Nome px" type="number" value={data.nameSize} onChange={(v) => update('nameSize', Number(v))} /><Field label="Texto px" type="number" value={data.textSize} onChange={(v) => update('textSize', Number(v))} /></div>
        <div className="two-cols"><Field label="Cargo px" type="number" value={data.roleSize} onChange={(v) => update('roleSize', Number(v))} /><Field label="Padrão e-mail" value={`${EMAIL_WIDTH} x ${EMAIL_HEIGHT}px`} onChange={() => {}} /></div>
      </section>
      <section className="export-grid">
        <button className="btn primary" onClick={generateAndUpload}><UploadCloud size={18} /> Gerar + enviar ao Supabase</button>
        <button className="btn secondary" onClick={downloadJpg}><ImageIcon size={18} /> Baixar JPG até 40 KB</button>
        <button className="btn ghost" onClick={copyHtml}><Copy size={18} /> Copiar HTML da assinatura</button>
        <button className="btn ghost" onClick={downloadHtmlFile}><FileCode2 size={18} /> Baixar HTML</button>
        <button className="btn outline" onClick={copyImageUrl}><Copy size={18} /> Copiar URL da imagem</button>
      </section>
      <div className="status-box">{status}</div>
    </aside>
    <main className="preview-area">
      <header className="preview-header"><div><h2>Assinatura executiva</h2></div><div className="device-tags"><span><Monitor size={16} /> Desktop</span><span><Smartphone size={16} /> Mobile</span></div></header>
      <div className="preview-card"><div className="signature-scale" dangerouslySetInnerHTML={{ __html: svgMarkup }} /></div>
      <div className="helper-grid">
        <div className="helper-box"><h3>HTML pronto para assinatura</h3><textarea className="code-area" readOnly value={generatedHtml} placeholder="O HTML aparecerá aqui depois de gerar e enviar a assinatura." /></div>
        <div className="helper-box"><h3>Resultado atual</h3><p>URL pública da imagem e metadados da última exportação.</p><textarea className="result-area" readOnly value={generatedUrl ? `URL pública:\n${generatedUrl}\n\n${lastMeta ? `Dimensões: ${lastMeta.width} x ${lastMeta.height}px\nTamanho: ${lastMeta.sizeKb.toFixed(1)} KB\nQualidade JPEG: ${lastMeta.quality}` : ''}` : 'Nenhuma assinatura enviada ainda.'} /></div>
      </div>
      <section className="group" style={{ marginTop: 16 }}><div className="group-title"><List size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Assinaturas salvas no Supabase</div>
        {loadingSaved ? <div className="status-box">Carregando assinaturas...</div> : savedItems.length === 0 ? <div className="status-box">Nenhuma assinatura salva ainda.</div> : <div className="saved-list">{savedItems.map((item) => <div className="saved-card" key={item.id}><div><strong>{item.name || item.slug}</strong><span>{item.role || 'Sem cargo'} • {item.email || 'Sem e-mail'}</span></div><div className="saved-actions"><button className="btn outline" onClick={() => loadSignature(item)}><Save size={14} /> Carregar</button><button className="btn danger" onClick={() => removeSignature(item)}><Trash2 size={14} /> Excluir</button></div></div>)}</div>}
      </section>
    </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
