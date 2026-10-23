// NAVE · película de marca · motor de render
// Dibuja un cuadro en un lienzo 2560 × 1440 (16:9, 2K) a partir de un tiempo t en segundos.
// No guarda estado entre cuadros: el mismo t siempre produce la misma imagen, así la vista
// previa en vivo y la exportación a 120 fps salen idénticas.
//
// Capas, de atrás hacia adelante, como en la presentación «Bitácora de despegue»:
//   soporte (lámina Crema / Espacio / Ámbar) → trama de puntos → cuerpo (símbolo, tableros)
//   → tipografía → orientación (bitácora, cruces de registro, altímetro).

import { SIMBOLO, LETRAS, PUNTOS } from './activos.js';

export const W = 2560, H = 1440, X0 = 144;

export const PALETA = {
  crema: '#FFF5EE', niebla: '#D7E1E2', espacio: '#012436', noche: '#00131D', tueste: '#210A05',
  ign: '#E55C41', ambar: '#EFA441', acero: '#798E91', petroleo: '#005A88',
};

export const FUENTES = {
  sans: '"Standerd","Inter Tight","Helvetica Neue",Arial,sans-serif',
  mono: '"Lenia Mono","JetBrains Mono",ui-monospace,Menlo,monospace',
};

/* ───────── contenido: deck NAVE · Tech Company & Venture Builder ───────── */

export const CONTENIDO = {
  firma: 'NAVE · TECH COMPANY & VENTURE BUILDER',
  bajada: 'TECH COMPANY & VENTURE BUILDER',
  manifiesto: [
    [['Nos obsesionamos por cambiar la realidad', 'crema']],
    [['de una ', 'crema'], ['empresa', 'ambar'], [', ', 'crema'], ['idea', 'ambar'], [' o ', 'crema'], ['persona', 'ambar'], [',', 'crema']],
    [['para hacerla ', 'crema'], ['mejor.', 'ign']],
  ],
  marcadores: ['EMPRESA', 'IDEA', 'PERSONA'],
  experiencia: [['Más de 25 años de experiencia acumulada en la ', 'espacio'], ['industria tecnológica.', 'ign']],
  fusionTitulo: [['Fusionamos', 'espacio']],
  fusion: [
    ['la rigurosidad', 'y la agilidad.'],
    ['la seguridad', 'y el enfoque en activos digitales.'],
    ['la escala corporativa', 'y una Startup, PyME o fundador.'],
  ],
  socio: [['Somos el ', 'espacio'], ['socio de ejecución.', 'ign']],
  verbos: ['DISEÑA', 'AUTOMATIZA', 'OPERA'],
  socioTec: 'SISTEMAS CON IA · BLOCKCHAIN · TECH EQUITY',
  socioFin: [['para transformar la ', 'espacio'], ['realidad.', 'ign']],
  clientes: [
    { codigo: 'TC', nombre: 'Tech Company', flecha: 180, filas: ['CUENTAS CORPORATIVAS Y GOBIERNOS', 'TRANSFORMACIÓN DIGITAL · MODERNIZACIÓN', 'EJECUCIÓN ÁGIL, ESCALABLE Y SEGURA', 'CALIDAD EN TIEMPO RÉCORD'] },
    { codigo: 'VB', nombre: 'Venture Builder', flecha: 0, filas: ['EMPRENDEDORES · STARTUPS · FUNDADORES', 'EMPRESAS QUE QUIEREN ESCALAR', 'INNOVACIÓN Y ACTIVOS DIGITALES', 'TECNOLOGÍA EN EL CORE DEL NEGOCIO'] },
  ],
  servicios: [
    ['TC-01', 'Tech Consultant', 'Modernización, ruta digital, datos y FinOps de IT.', 'TECH'],
    ['TC-02', 'Next-Gen Software Factory', 'Software a la medida, inteligente, escalable y con ISOs.', 'TECH'],
    ['TC-03', 'Digital Assets portfolio', 'Activos digitales, apps y software propio y de partners.', 'TECH'],
    ['TC-04', 'Talent Integration', 'Talento con metodologías, governance y garantía.', 'TECH'],
    ['TC-05', 'Managed Cloud & Continuity', 'Soporte 24/7, DevSecOps y observabilidad avanzada.', 'TECH'],
    ['VB-01', 'Tech Foundry', 'Concepto escalable, strategy, business plan y case.', 'VENTURE'],
    ['VB-02', 'Venture Studio', 'IA y blockchain del MVP a producción y continuidad.', 'VENTURE'],
    ['VB-03', 'Tech Equity Business model', 'Invertimos tecnología: NAVE se vuelve accionista.', 'VENTURE'],
  ],
  bases: ['Fábrica de Software automatizada con IA y Blockchain.', 'Estándares ISO y marcos de referencia.', 'Rapidez y calidad garantizada.'],
  marcos: 'GOBIERNO & GESTIÓN   ISO 21500 · IEEE 1058 · PMBOK · ÁGIL/SCRUM      ●      SEGURIDAD & RIESGO   ISO 27001 · NIST CSF 2.0 · OWASP TOP 10 · MAGERIT V3 · ISO 31000      ●      ARQUITECTURA & REQUISITOS   ISO/IEC/IEEE 42010 · ISO 12207 · SWEBOK · IEEE 1233 · ISO 830      ●      CALIDAD & TESTING   ISO 29119 · IEEE 829 · ISTQB      ●      ',
  partnersTitulo: [['Un ecosistema de alianzas estratégicas con los ', 'crema'], ['líderes mundiales', 'ambar'], [' de la tecnología.', 'crema']],
  partners: [
    ['Oracle', 'BASES DE DATOS · CLOUD EN BLOCKCHAIN'],
    ['NVIDIA', 'GPUs · CÓMPUTO ACELERADO · PHYSICAL AI'],
    ['AWS', 'INFRAESTRUCTURA ESCALABLE · IA/ML'],
    ['Google', 'GOOGLE CLOUD · IA GENERATIVA'],
    ['Supabase', 'POSTGRES · AUTENTICACIÓN · BACKEND'],
    ['Ripple', 'PAGOS GLOBALES · TOKENIZACIÓN'],
    ['Anthropic', 'CLAUDE · AGENTES IA SEGUROS'],
  ],
  valores: [
    'Atención radical al detalle.',
    'Inquebrantabilidad: nos negamos a rendirnos.',
    'Compromiso con el impacto positivo.',
    'Atracción de clientes y talento élite.',
    'Propósito de transformar realidades.',
    'Intensidad por ganar, mejorar y crecer.',
    'Queremos promover nuevos estándares.',
  ],
  pregunta: '¿Preguntas?',
  despegue: [['Listos para el despegue', 'crema'], ['.', 'ign']],
};

/* ───────── guion: una sola línea de tiempo, en beats ─────────
   anticipación → introducción → desarrollo → pico → resolución.
   `salida` describe el barrido de trama que lleva a la lámina siguiente.
   `parte` reparte un punto en varias pantallas; `base` estira una toma escrita para menos beats. */

export const ESCENAS = [
  { id: 'lanzamiento', beats: 16, fondo: 'espacio', cap: 'LANZAMIENTO' },
  { id: 'manifiesto', beats: 20, base: 16, fondo: 'espacio', cap: 'MANIFIESTO' },
  { id: 'nave',       beats: 12, base: 10, fondo: 'espacio', cap: 'NAVE', salida: { color: 'crema', beats: 1.6, origen: [1280, 700] } },
  { id: 'queEs',      beats: 34, base: 24, fondo: 'crema',   cap: '¿QUÉ ES NAVE?', salida: { color: 'espacio', beats: 1.6, origen: 'abajo' } },
  { id: 'clientes',   beats: 14, parte: 0, fondo: 'espacio', cap: 'CLIENTES' },
  { id: 'clientes',   beats: 14, parte: 1, fondo: 'espacio', cap: 'CLIENTES', salida: { color: 'noche', beats: 1.4, origen: [1280, 860] } },
  { id: 'oferta',     beats: 16, parte: 0, fondo: 'noche',   cap: '¿QUÉ OFRECE?' },
  { id: 'oferta',     beats: 16, parte: 1, fondo: 'noche',   cap: '¿QUÉ OFRECE?', finFondo: 'ambar' },
  { id: 'modelo',     beats: 22, base: 16, fondo: 'ambar',   cap: 'MODELO OPERATIVO', salida: { color: 'espacio', beats: 1.6, origen: 'abajo' } },
  { id: 'partners',   beats: 14, parte: 0, fondo: 'espacio', cap: 'PARTNERS' },
  { id: 'partners',   beats: 13, parte: 1, fondo: 'espacio', cap: 'PARTNERS', salida: { color: 'crema', beats: 1.6, origen: [1960, 600] } },
  { id: 'valores',    beats: 14, parte: 0, fondo: 'crema',   cap: '¿QUÉ NOS RIGE?' },
  { id: 'valores',    beats: 13, parte: 1, fondo: 'crema',   cap: '¿QUÉ NOS RIGE?', salida: { color: 'espacio', beats: 1.6, origen: [1280, 1100] } },
  { id: 'orbita',     beats: 14, fondo: 'espacio', cap: 'ÓRBITA' },
];

/* ───────── utilidades ───────── */

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (x, a, d) => clamp((x - a) / d);
const mix = (a, b, t) => a + (b - a) * t;
const eo = (x) => 1 - Math.pow(1 - x, 3);
const eoX = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const ei = (x) => x * x * x;
const eoBack = (x) => { const c = 1.7, c3 = c + 1; return 1 + c3 * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgba = (h, a = 1) => { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; };
const mixc = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return '#' + A.map((v, i) => Math.round(mix(v, B[i], t)).toString(16).padStart(2, '0')).join(''); };
const OSCURO = { espacio: 1, noche: 1, tueste: 1 };

/* ───────── geometría precalculada ───────── */

function hexGrid(S, pad = 1) {
  const RH = (S * Math.sqrt(3)) / 2, out = [];
  for (let j = -pad; j * RH < H + pad * RH; j++) for (let i = -pad; i * S < W + pad * S; i++) out.push([i * S + (j % 2 ? S / 2 : 0), j * RH]);
  return out;
}

export function crearMotor({ bpm = 104, escenas = ESCENAS, contenido = CONTENIDO, colores = {}, fuentes = {} } = {}) {
  const C = { ...PALETA, ...colores };
  const F = { ...FUENTES, ...fuentes };
  const K = contenido;
  const spb = 60 / bpm;
  let acc = 0;
  const lista = escenas.map((e) => { const s = { ...e, inicio: acc, fin: acc + e.beats }; acc += e.beats; return s; });
  const totalB = acc, duracion = totalB * spb;
  const ultima = lista[lista.length - 1];
  const L0 = 7.5;                                 // T–00 en el beat 7,5 de la primera toma: el viaje empieza despegando
  const bDespegue = lista[0].inicio + L0;
  const capitulos = lista.filter((e, i) => e.cap && lista.findIndex((x) => x.cap === e.cap) === i);

  // estrellas en tres profundidades (la distancia del manifiesto)
  const r0 = rng(7), estrellas = [];
  for (let i = 0; i < 560; i++) { const z = [0.35, 0.65, 1][i % 3]; estrellas.push({ x: r0() * (W + 400) - 200, y: r0() * (H + 400) - 200, z, r: 1.1 + z * 2.1, a: 0.18 + 0.5 * z * r0() }); }

  // trama base (retícula hexagonal de 36 px) y trama del barrido (40 px)
  const A = [1840, 600];                          // punto de presión del manifiesto
  const trama = hexGrid(36).map(([x, y]) => ({ x, y, d: Math.hypot(x - A[0], y - A[1]) }));
  const tramaB = hexGrid(40, 2);

  // símbolo de 1 018 puntos y su punto de origen en la trama
  const N = PUNTOS.length / 3, sx = [], sy = [], ss = [];
  for (let i = 0; i < N; i++) { sx.push(PUNTOS[3 * i]); sy.push(PUNTOS[3 * i + 1]); ss.push(PUNTOS[3 * i + 2]); }
  const CS = [1280, 700], KS = 3.4;
  const src = new Int32Array(N), elegido = new Uint8Array(trama.length);
  [...Array(N).keys()].sort((a, b) => ss[a] - ss[b]).forEach((i) => {
    const ex = CS[0] + (sx[i] - 100) * KS * 1.7, ey = CS[1] + (sy[i] - 100) * KS * 1.7;
    let best = -1, bd = Infinity;
    for (let k = 0; k < trama.length; k++) { if (elegido[k]) continue; const d = (trama[k].x - ex) ** 2 + (trama[k].y - ey) ** 2; if (d < bd) { bd = d; best = k; } }
    src[i] = best; elegido[best] = 1;
  });

  // horizonte del planeta (partners)
  const planeta = hexGrid(24).filter(([x, y]) => y > 1080).map(([x, y]) => {
    const R = 2700, cy = 1150 + R, d = Math.hypot(x - 1280, y - cy);
    return d < R ? { x, y, borde: (R - d) / 260 } : null;
  }).filter(Boolean);

  // columna de empuje T–00
  const r1 = rng(11), pluma = hexGrid(22).filter(([x, y]) => y > 560 && Math.abs(x - 1280) < 900).map(([x, y]) => ({ x, y, j: r1() }));

  const symPath = new Path2D(SIMBOLO[0]);
  const letras = LETRAS.map((d) => new Path2D(d));
  const flechaP = new Path2D('M71.3 24C74.23 26.93 74.23 31.68 71.3 34.61L47.3 58.61 36.7 48 47.89 36.8H0V21.8H47.89L36.7 10.61 47.3 0 71.3 24Z');

  /* ───── estado por cuadro ───── */
  let ctx, red = false, T = 0;

  const fuente = (peso, size, fam = 'sans') => `${peso} ${size}px ${F[fam]}`;
  const tracking = (px) => { if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`; };
  const ancho = (s) => ctx.measureText(s).width;

  function texto(s, x, y, { peso = 400, size = 24, fam = 'sans', color = C.crema, a = 1, align = 'left', ls = 0 } = {}) {
    if (a <= 0.003 || !s) return 0;
    ctx.font = fuente(peso, size, fam); tracking(ls); ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = rgba(color, a); ctx.fillText(s, x, y);
    const w = ancho(s); tracking(0); return w;
  }
  const tecleo = (s, p) => s.slice(0, Math.floor(s.length * clamp(red ? (p > 0 ? 1 : 0) : p)));
  // indicador de aeropuerto: cada carácter gira antes de asentarse
  const GLIFOS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function flap(s, p, sem = 1) {
    if (red) return p > 0 ? s : '';
    let o = '';
    const paso = Math.floor(T * 30);
    for (let i = 0; i < s.length; i++) {
      const q = (p - (i / Math.max(1, s.length)) * 0.55) / 0.45;
      if (q >= 1 || s[i] === ' ') o += q > 0 || s[i] === ' ' ? s[i] : ' ';
      else if (q <= 0) o += ' ';
      else o += GLIFOS[(i * 7 + sem * 13 + paso * 5) % GLIFOS.length];
    }
    return o.replace(/\s+$/, '');
  }

  // bloque tipográfico con palabras en color, partido en líneas; cada línea entra con máscara
  function bloque(spans, x, y, { size = 96, peso = 700, lh = 1.04, maxW = 1600, ls = -0.012, align = 'left', entra = () => 1, sale = () => 0, alfa = 1 } = {}) {
    ctx.font = fuente(peso, size); tracking(size * ls); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const toks = [];
    spans.forEach(([s, col]) => s.split(/(\s+)/).forEach((w) => w && toks.push([w, col])));
    const lineas = [[]]; let wl = 0;
    toks.forEach(([w, col]) => {
      const ww = ancho(w);
      if (/^\s+$/.test(w)) { if (lineas[lineas.length - 1].length) { lineas[lineas.length - 1].push([w, col, ww]); wl += ww; } return; }
      if (wl + ww > maxW && lineas[lineas.length - 1].length) { const l = lineas[lineas.length - 1]; while (l.length && /^\s+$/.test(l[l.length - 1][0])) l.pop(); lineas.push([]); wl = 0; }
      lineas[lineas.length - 1].push([w, col, ww]); wl += ww;
    });
    lineas.forEach((l, i) => {
      const p = clamp(entra(i)), q = clamp(sale(i));
      if (p <= 0 || q >= 1) return;
      const lw = l.reduce((s, t) => s + t[2], 0);
      let cx = align === 'center' ? x - lw / 2 : align === 'right' ? x - lw : x;
      const top = y + i * size * lh, base = top + size * 0.8;
      ctx.save();
      if (!red) { ctx.beginPath(); ctx.rect(cx - 20, top - size * 0.2, lw + 40, size * 1.22); ctx.clip(); }
      const dy = red ? 0 : (1 - eoX(p)) * size * 1.1 - eio(q) * size * 1.1;
      const a = alfa * (red ? p * (1 - q) : 1);
      l.forEach(([w, col, ww]) => { ctx.fillStyle = rgba(C[col] || col, a); ctx.fillText(w, cx, base + dy); cx += ww; });
      ctx.restore();
    });
    tracking(0);
    return lineas.length * size * lh;
  }

  function etiqueta(s, x, y, color, p, align = 'left') {
    const t = tecleo(s, p); texto(t, x, y, { fam: 'mono', peso: 500, size: 40, color, ls: 5, align });
  }
  function punto(x, y, r, color, a = 1) { if (r <= 0 || a <= 0) return; ctx.fillStyle = rgba(color, a); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
  function puntos(lista, color) { // lista de [x, y, r, a]: agrupados por opacidad para pintar en pocas pasadas
    const g = new Map();
    for (const [x, y, r, a] of lista) { if (r <= 0.05 || a <= 0.01) continue; const k = Math.round(a * 20); let p = g.get(k); if (!p) g.set(k, (p = new Path2D())); p.moveTo(x + r, y); p.arc(x, y, r, 0, 7); }
    for (const [k, p] of g) { ctx.fillStyle = rgba(color, k / 20); ctx.fill(p); }
  }
  function lineaPunteada(x1, y1, x2, y2, p, color, a = 1, paso = 20, r = 3, curva = 0) {
    if (p <= 0) return;
    const L = Math.hypot(x2 - x1, y2 - y1), n = Math.floor(L / paso), lst = [];
    for (let i = 0; i <= n * clamp(p); i++) { const u = i / n; lst.push([mix(x1, x2, u), mix(y1, y2, u) - curva * Math.sin(Math.PI * u), r, a]); }
    puntos(lst, color);
  }
  function flecha(x, y, size, ang, color, a = 1) {
    if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate((ang * Math.PI) / 180); ctx.scale(size / 96, size / 96); ctx.translate(-48 + 14, -48 + 18.7);
    ctx.fillStyle = rgba(color, a); ctx.fill(flechaP); ctx.restore();
  }
  function simbolo(cx, cy, k, color, a = 1) {
    if (a <= 0) return;
    ctx.save(); ctx.translate(cx - 100 * k, cy - 100 * k); ctx.scale(k, k); ctx.fillStyle = rgba(color, a); ctx.fill(symPath, 'evenodd'); ctx.restore();
  }
  function logotipo(x, y, alto, color, revela = [1, 1, 1, 1]) { // NAVE, sin «Café»; alto = alto de letra
    const k = alto / 116;
    letras.forEach((p, i) => {
      const q = clamp(revela[i]); if (q <= 0) return;
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(0, -58.9);
      if (!red) { ctx.beginPath(); ctx.rect(-10, 58.9 - 6, 490, 128); ctx.clip(); ctx.translate(0, (1 - eoX(q)) * 122); }
      ctx.fillStyle = rgba(color, red ? q : 1); ctx.fill(p); ctx.restore();
    });
  }
  function estrellasDibujar(a, dx = 0, dy = 0, fuerza = 0, atractor = A) {
    const lst = [];
    for (const s of estrellas) {
      let x = s.x + dx * s.z, y = s.y + dy * s.z;
      x = ((x % (W + 400)) + W + 400) % (W + 400) - 200; y = ((y % (H + 400)) + H + 400) % (H + 400) - 200;
      if (fuerza) { const d = Math.hypot(x - atractor[0], y - atractor[1]), w = Math.exp(-(d * d) / (2 * 640 * 640)) * fuerza; x = mix(x, atractor[0], w); y = mix(y, atractor[1], w); }
      lst.push([x, y, s.r, s.a * a]);
    }
    puntos(lst, C.crema);
  }
  function camara(s, cx, cy, fn) { ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); fn(); ctx.restore(); }

  // barrido de trama: los puntos del color siguiente crecen desde un origen hasta cubrir la lámina
  function barrido(p, color, origen) {
    if (p <= 0) return;
    if (p >= 1) { ctx.fillStyle = C[color]; ctx.fillRect(0, 0, W, H); return; }
    if (red) { ctx.fillStyle = rgba(C[color], p); ctx.fillRect(0, 0, W, H); return; }
    const lst = [], S = 40, Dm = Math.hypot(W, H);
    for (const [x, y] of tramaB) {
      const d = origen === 'abajo' ? (H - y) / H : Math.hypot(x - origen[0], y - origen[1]) / Dm;
      const q = clamp((p * 1.55 - d * 0.55 / (origen === 'abajo' ? 0.55 : 0.75)) * 1.25);
      lst.push([x, y, S * 0.62 * eio(q), 1]);
    }
    puntos(lst, C[color]);
  }

  /* ───── bitácora: orientación permanente ───── */
  function bitacora(B, tinta, a) {
    if (a <= 0) return;
    const t = B * spb;
    // cruces de registro
    ctx.strokeStyle = rgba(tinta, 0.5 * a); ctx.lineWidth = 2;
    [[96, 96], [W - 96, 96], [96, H - 96], [W - 96, H - 96]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x + 14, y); ctx.moveTo(x, y - 14); ctx.lineTo(x, y + 14); ctx.stroke(); });
    // capítulo: puntos para orientar
    const actual = lista.find((e) => B >= e.inicio && B < e.fin) || ultima, iCap = capitulos.findIndex((e) => e.cap === actual.cap);
    capitulos.forEach((e, i) => punto(X0 + 6 + i * 26, H - 98, i === iCap ? 7 : 4.2, i === iCap ? C.ign : tinta, (i === iCap ? 1 : 0.35) * a));
    if (iCap >= 0) texto(`TRAMO ${String(iCap + 1).padStart(2, '0')} / ${String(capitulos.length).padStart(2, '0')} · ${capitulos[iCap].cap}`, X0 + capitulos.length * 26 + 30, H - 84, { fam: 'mono', peso: 500, size: 40, ls: 4, color: tinta, a: 0.6 * a });
    // altímetro de 25 puntos
    const nivel = B < bDespegue ? -1 : 24 * mix(0.06, 1, eio(clamp((B - bDespegue) / (ultima.inicio + 4 - bDespegue))));
    for (let i = 0; i < 25; i++) { const on = i <= nivel; punto(W - 96, H - 196 - i * 30, on ? 4.6 : 3, on ? C.ign : tinta, (on ? 1 : 0.28) * a); }
  }

  /* ───── tomas ───── */
  const T_ = {
    lanzamiento(b) {
      const L = L0;
      // ascenso: las estrellas corren hacia abajo una vuelta completa del campo (1 840 px) y quedan donde empieza el manifiesto
      const vuelo = red ? (b > L ? 1 : 0) : eio(seg(b, L + 0.4, 6));
      estrellasDibujar(0.6 * eo(seg(b, 0.2, 3)), -T * 8, -T * 3 + 1840 * vuelo);
      // columna de empuje: sube desde el suelo en T–00 y se queda atrás cuando el punto asciende
      const sube = red ? (b > L ? 1 : 0) : eo(seg(b, L + 0.1, 1.6)), baja = red ? 0 : 1100 * eio(seg(b, L + 1.4, 3.4)), apaga = 1 - eio(seg(b, L + 2.6, 2.4));
      if (sube > 0 && apaga > 0) puntos(pluma.map((q) => {
        const v = (H - q.y) / (H - 560), sig = mix(620, 70, Math.pow(v, 0.7));
        const f = Math.exp(-((q.x - 1280) ** 2) / (2 * sig * sig)) * clamp((sube * 1.25 - v) * 3);
        return [q.x, q.y + baja, 8.4 * f * (0.75 + 0.25 * q.j), apaga];
      }), C.ambar);
      // el punto: aparece en tierra, despega con estela y se desplaza al punto de presión del manifiesto
      const lanz = red ? (b > L ? 1 : 0) : eio(seg(b, L + 0.3, 3)), llega = red ? (b > 13 ? 1 : 0) : eio(seg(b, 13, 2.6));
      const x = mix(1280, A[0], llega), y = mix(mix(1060, 640, lanz), A[1], llega);
      if (!red && lanz > 0 && lanz < 1) for (let j = 12; j >= 1; j--) punto(1280, y + j * 26 * (1 - lanz), 12 * (1 - j / 14), C.ign, 0.7 * (1 - j / 13));
      punto(x, y, 12 * (red ? 1 : eoBack(seg(b, 0.3, 0.6))), C.ign);
      bloque(K.despegue, 1280, 380, { size: 124, align: 'center', maxW: 2200, entra: () => seg(b, 0.6, 1), sale: () => seg(b, L + 0.2, 0.6) });
      // cuenta regresiva: T–03, T–02, T–01, T–00
      for (let k = 3; k >= 0; k--) {
        const at = L - k * 1.5, p = seg(b, at, 0.4), q = k ? seg(b, at + 1.2, 0.3) : seg(b, L + 0.6, 0.4);
        if (p <= 0 || q >= 1) continue;
        texto(`T–0${k}`, 1280, 800 + (red ? 0 : (1 - eoX(p)) * 40), { fam: 'mono', peso: 700, size: 150, ls: 4, color: k ? C.ambar : C.ign, align: 'center', a: (red ? 1 : clamp(p * 2)) * (1 - q) });
      }
    },

    manifiesto(b) {
      // presión: el campo se tensa hacia el punto mientras se dice «cambiar la realidad»
      const fuerza = 0.38 * eio(seg(b, 1, 4)) * (1 - 0.6 * eio(seg(b, 5.4, 2))), fuera = seg(b, 11, 2.2);
      estrellasDibujar(0.6 * (1 - fuera), -T * 8, -T * 3, red ? 0 : fuerza);
      // orden: la retícula nace en anillos desde el punto, «para hacerla mejor»
      if (b > 10.6) puntos(trama.map((p) => { const q = eo(seg(b, 10.8 + p.d / 1500 * 2.2, 0.8)); return [p.x, p.y, 2.6 * q, 0.34 * q]; }), C.crema);
      punto(A[0], A[1], 12 + (red ? 0 : 1.5 * Math.sin(T * 3.4)), C.ign);
      // tres marcadores: empresa, idea, persona
      const marc = [[1520, 400], [2120, 360], [2200, 820]];
      marc.forEach(([x, y], i) => {
        const p = seg(b, 6.4 + i * 0.55, 0.7), q = seg(b, 10.2, 0.6);
        if (p <= 0 || q >= 1) return;
        lineaPunteada(A[0], A[1], x, y, eo(p), C.crema, 0.5 * (1 - q), 16, 2.2);
        punto(x, y, 7 * (red ? 1 : eoBack(p)), C.ambar, 1 - q);
        texto(flap(K.marcadores[i], seg(b, 6.7 + i * 0.55, 0.6), i), x + 30, y + 14, { fam: 'mono', peso: 500, size: 40, ls: 5, color: C.crema, a: 0.85 * (1 - q) });
      });
      etiqueta('MANIFIESTO', X0, 770, C.ign, seg(b, 0.3, 0.8) * (1 - seg(b, 14.6, 0.5)));
      const frase = (spans, ini, fin) => bloque(spans, X0, 820, { size: 132, maxW: 1700, entra: (i) => seg(b, ini + i * 0.4, 1), sale: () => seg(b, fin, 0.7) });
      frase(K.manifiesto[0], 0.4, 5.1);
      frase(K.manifiesto[1], 5.7, 10.3);
      frase(K.manifiesto[2], 10.9, 14.8);
    },

    nave(b) {
      // la retícula entrega 1 018 puntos al símbolo, en el orden de la trayectoria
      const fuera = (k) => { const q = 1 - trama[k].d / 2600; return seg(b, 0.3 + q * 1.2, 0.8); };
      const fondo = [];
      trama.forEach((p, k) => { if (!elegido[k]) { const f = fuera(k); fondo.push([p.x, p.y, 2.6 * (1 - 0.5 * f), 0.34 * (1 - f)]); } });
      puntos(fondo, C.crema);
      const fusion = eio(seg(b, 3.6, 0.6)), sol = eo(seg(b, 3.9, 0.5));
      const mov = red ? (b > 4.6 ? 1 : 0) : eio(seg(b, 4.6, 1.6));
      const alto = mix(KS * 200, 240, mov), k = alto / 200;
      const wLk = 240 * (617 / 116), x0 = 1280 - wLk / 2;
      const cx = mix(CS[0], x0 + 120, mov), cy = CS[1];
      if (sol < 1) {
        const lst = [];
        for (let i = 0; i < N; i++) {
          const g = trama[src[i]], d0 = 0.4 + ss[i] * 1.8, u = red ? (b > 2.5 ? 1 : 0) : eio(seg(b, d0, 1.1));
          const tx = cx + (sx[i] - 100) * k, ty = cy + (sy[i] - 100) * k;
          const vx = tx - g.x, vy = ty - g.y, curva = Math.sin(Math.PI * u) * 0.16;
          lst.push([g.x + vx * u - vy * curva, g.y + vy * u + vx * curva, mix(2.6, 1.456 * k, u) * (1 + 0.55 * fusion), mix(0.34, 1, u) * (1 - sol)]);
        }
        puntos(lst, C.crema);
      }
      // el punto Ignición entra al vértice y enciende el símbolo
      const ip = red ? 1 : eio(seg(b, 2.4, 1.1));
      const ax = cx, ay = cy + (63 - 100) * k;
      if (b < 3.6) punto(mix(A[0], ax, ip), mix(A[1], ay, ip) - Math.sin(Math.PI * ip) * 160, 12, C.ign);
      const fl = seg(b, 3.5, 0.9);
      if (fl > 0 && fl < 1 && !red) {
        const g = ctx.createRadialGradient(ax, ay, 0, ax, ay, 900);
        g.addColorStop(0, rgba(C.ambar, 0.32 * (1 - fl))); g.addColorStop(1, rgba(C.ambar, 0));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      simbolo(cx, cy, k, C.crema, sol);
      logotipo(x0 + 240 * (150 / 116), cy - 120, 240, C.crema, [0, 1, 2, 3].map((i) => seg(b, 5.5 + i * 0.22, 0.9)));
      texto(tecleo(K.bajada, seg(b, 6.6, 1.3)), 1280, cy + 120 + 120, { fam: 'mono', peso: 500, size: 46, ls: 7, color: C.ambar, align: 'center' });
    },

    queEs(b) {
      const tinta = C.espacio;
      // 1 · la experiencia
      const salA = seg(b, 7, 0.8);
      etiqueta('¿QUÉ ES NAVE?', X0, 330, C.ign, seg(b, 0.2, 0.8) * (1 - seg(b, 7.4, 0.4)));
      if (b < 8.2) {
        const n = Math.round(25 * (red ? 1 : eo(seg(b, 0.6, 2.4))));
        const p = seg(b, 0.3, 1.1);
        ctx.save();
        if (!red) { ctx.beginPath(); ctx.rect(X0 - 40, 470, 1200, 620); ctx.clip(); }
        const dy = red ? 0 : (1 - eoX(p)) * 600 + eio(salA) * 600;
        const w = texto(String(n).padStart(2, '0'), X0 - 24, 1040 + dy, { fam: 'mono', peso: 700, size: 560, color: tinta, ls: -24, a: red ? p * (1 - salA) : 1 });
        texto('+', X0 - 24 + w, 1040 + dy, { fam: 'mono', peso: 700, size: 560, color: C.ign, a: red ? p * (1 - salA) : 1 });
        ctx.restore();
        const h = bloque(K.experiencia, 1380, 560, { size: 76, maxW: 1000, entra: (i) => seg(b, 1.8 + i * 0.3, 1), sale: () => salA });
        texto(tecleo(K.bajada, seg(b, 3.4, 1)), 1380, 560 + h + 70, { fam: 'mono', peso: 500, size: 40, ls: 5, color: C.acero, a: 1 - salA });
      }
      // 2 · fusionamos una cosa y la otra
      if (b > 7.8 && b < 16.2) {
        const sal = seg(b, 15, 0.8);
        etiqueta('¿QUÉ ES NAVE?', X0, 330, C.ign, seg(b, 8, 0.6) * (1 - sal));
        bloque(K.fusionTitulo, X0, 380, { size: 120, entra: () => seg(b, 8.2, 1), sale: () => sal });
        K.fusion.forEach(([izq, der], i) => {
          const ini = 9 + i * 1.5, y = 700 + i * 170, ultima = i === K.fusion.length - 1;
          bloque([[izq, 'espacio']], X0, y - 54, { size: 68, peso: 600, maxW: 2400, entra: () => seg(b, ini, 0.9), sale: () => sal });
          ctx.font = fuente(600, 68); tracking(-0.82);
          const wi = ancho(izq), wd = ancho(der); tracking(0);
          lineaPunteada(X0 + wi + 36, y, W - X0 - wd - 36, y, eo(seg(b, ini + 0.4, 1)) * (1 - sal), ultima ? C.ign : tinta, ultima ? 0.9 : 0.45, 22, 3.6, ultima ? 40 : 0);
          bloque([[der, ultima ? 'ign' : 'espacio']], W - X0, y - 54, { size: 68, peso: 600, maxW: 2400, align: 'right', entra: () => seg(b, ini + 1, 0.9), sale: () => sal });
        });
      }
      // 3 · el socio de ejecución
      if (b > 15.8) {
        etiqueta('SOCIO DE EJECUCIÓN', X0, 330, C.ign, seg(b, 16, 0.6));
        bloque(K.socio, X0, 420, { size: 150, maxW: 2300, entra: (i) => seg(b, 16.3 + i * 0.4, 1) });
        K.verbos.forEach((v, i) => {
          const p = red ? (b > 18 ? 1 : 0) : eoX(seg(b, 18 + i * 0.5, 0.8)), x = X0 + i * 772, y = 760, w = 740;
          if (p <= 0) return;
          ctx.fillStyle = tinta; ctx.fillRect(x, y, w * p, 124);
          texto(flap(v, seg(b, 18.3 + i * 0.5, 0.8), i), x + 40, y + 82, { fam: 'mono', peso: 700, size: 52, ls: 4, color: C.crema });
          flecha(x + w - 70, y + 62, 64, 0, i === 2 ? C.ign : C.crema, seg(b, 18.6 + i * 0.5, 0.4));
        });
        texto(tecleo(K.socioTec, seg(b, 20.2, 1.2)), X0, 1010, { fam: 'mono', peso: 500, size: 46, ls: 5, color: tinta });
        bloque(K.socioFin, X0, 1060, { size: 60, peso: 600, maxW: 2000, entra: () => seg(b, 21, 0.9) });
      }
    },

    clientes(b, e) {
      const j = e.parte || 0, c = K.clientes[j], sal = seg(b, e.beats - 1.1, 0.9), a = 1 - sal, ini = 0.6;
      etiqueta(`NUESTROS CLIENTES · RUTA 0${j + 1} / 02`, X0, 300, C.ign, seg(b, 0.2, 0.8) * a);
      texto(flap(c.codigo, seg(b, ini, 0.8), j + 3), X0 - 14, 830, { fam: 'mono', peso: 700, size: 420, color: C.ambar, ls: -10, a });
      flecha(X0 + 740, 700, 170, c.flecha, C.ambar, (red ? seg(b, ini + 0.6, 0.5) : eo(seg(b, ini + 0.6, 0.6))) * a);
      bloque([[c.nombre, 'crema']], 1080, 400, { size: 132, maxW: 1400, entra: () => seg(b, ini + 0.5, 0.9), sale: () => sal });
      c.filas.forEach((f, i) => {
        const p = seg(b, ini + 1.8 + i * 1, 1), y = 720 + i * 120;
        punto(1092, y - 15, 9, j ? C.ign : C.crema, (p > 0 ? 1 : 0) * a);
        texto(flap(f, p, i + j * 5), 1130, y, { fam: 'mono', peso: 500, size: 46, ls: 2, color: C.crema, a: 0.92 * a });
      });
    },

    oferta(b, e) {
      const parte = e.parte || 0, filas = K.servicios.filter((s) => s[3] === (parte ? 'VENTURE' : 'TECH'));
      const y0 = 520, rh = parte ? 210 : 152, iHl = parte ? filas.length - 1 : -1;
      const hl = red ? (b > e.beats - 4.2 ? 1 : 0) : eo(seg(b, e.beats - 4.2, 0.9));
      const exp = parte ? (red ? (b > e.beats - 1.4 ? 1 : 0) : eio(seg(b, e.beats - 1.6, 1.6))) : 0;
      const sal = parte ? 0 : seg(b, e.beats - 1.1, 0.9), a = 1 - sal;
      etiqueta(`¿QUÉ OFRECE? · ${parte ? 'VENTURE BUILDER' : 'TECH COMPANY'}`, X0, 300, C.ign, seg(b, 0.2, 0.8) * a);
      bloque([['¿Qué ofrece?', 'crema']], X0, 330, { size: 110, entra: () => (parte ? 1 : seg(b, 0.4, 1)) });
      texto(flap(String(filas.length).padStart(2, '0'), seg(b, 0.6, 0.8), parte), W - X0, 440, { fam: 'mono', peso: 700, size: 120, color: C.ambar, align: 'right', a });
      texto(parte ? 'SERVICIOS VENTURE' : 'SERVICIOS TECH', W - X0 - 190, 428, { fam: 'mono', peso: 500, size: 36, ls: 4, color: C.crema, a: 0.75 * seg(b, 0.9, 0.5) * a, align: 'right' });
      ctx.fillStyle = rgba(C.crema, 0.3 * a); ctx.fillRect(X0, y0 - 40, (W - 2 * X0) * eio(seg(b, 0.4, 1.2)), 2);
      filas.forEach(([cod, nom, alc], i) => {
        const y = y0 + i * rh, p = seg(b, 1.2 + i * 1.6, 0.9);
        if (p <= 0) return;
        const enHl = i === iHl, oscuro = enHl && hl > 0.5, tinta = oscuro ? C.tueste : C.crema;
        if (enHl && hl > 0) { ctx.fillStyle = C.ambar; ctx.fillRect(X0 - 24, y + 4, (W - 2 * X0 + 48) * hl, rh - 10); }
        ctx.fillStyle = rgba(C.crema, 0.14 * a); ctx.fillRect(X0, y + rh - 2, W - 2 * X0, 1);
        texto(flap(cod, p, i + parte * 5), X0, y + 76, { fam: 'mono', peso: 700, size: 44, ls: 2, color: oscuro ? C.tueste : C.ambar, a });
        texto(nom, 520, y + 78, { peso: 650, size: 64, color: tinta, a: a * eo(seg(b, 1.4 + i * 1.6, 0.6)) });
        texto(alc, 520, y + 132, { peso: 450, size: 44, color: tinta, a: 0.8 * a * eo(seg(b, 1.7 + i * 1.6, 0.6)) });
      });
      // la fila de Tech Equity se abre hasta cubrir la lámina: pasamos al Ámbar del modelo operativo
      if (exp > 0) {
        const y = y0 + iHl * rh + 4;
        ctx.fillStyle = C.ambar;
        ctx.fillRect(mix(X0 - 24, -300, exp), mix(y, -300, exp), mix(W - 2 * X0 + 48, W + 600, exp), mix(rh - 10, H + 600, exp));
      }
    },

    modelo(b) {
      const tinta = C.tueste;
      etiqueta('MODELO OPERATIVO', X0, 300, tinta, seg(b, 0.2, 0.8));
      [[760, 'Tech Company', 0.5], [1800, 'Venture Builder', 0.8]].forEach(([x, s, at]) => {
        bloque([[s, 'tueste']], x, 360, { size: 54, align: 'center', maxW: 900, entra: () => seg(b, at, 0.9) });
        const p = seg(b, at + 0.7, 0.7);
        flecha(x, 500 - (red ? 0 : (1 - eoBack(p)) * 50), 84, 90, tinta, red ? p : clamp(p * 3));
      });
      lineaPunteada(760, 570, 1280, 690, eio(seg(b, 2, 1.2)), tinta, 0.75, 18, 3, -40);
      lineaPunteada(1800, 570, 1280, 690, eio(seg(b, 2.1, 1.2)), tinta, 0.75, 18, 3, -40);
      punto(1280, 700, 11 * (red ? 1 : eoBack(seg(b, 3.2, 0.5))), C.ign);
      texto(tecleo('AMBOS MODELOS OPERAN BAJO', seg(b, 3.5, 0.9)), 1280, 790, { fam: 'mono', peso: 500, size: 42, ls: 6, color: tinta, align: 'center' });
      K.bases.forEach((s, i) => {
        const y = 850 + i * 118, at = 4.3 + i * 1.1;
        ctx.fillStyle = rgba(tinta, 0.25); ctx.fillRect(420, y, (W - 840) * eio(seg(b, at - 0.2, 0.9)), 2);
        texto(flap(`0${i + 1}`, seg(b, at, 0.6), i), 420, y + 82, { fam: 'mono', peso: 700, size: 56, color: tinta });
        bloque([[s, 'tueste']], 560, y + 22, { size: 58, maxW: 1600, entra: () => seg(b, at + 0.15, 0.9) });
      });
      // marcos de referencia: corren despacio por la base, como un tablero de salidas
      const pt = seg(b, 7, 0.8);
      if (pt > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(X0, 1186, W - 2 * X0, 76); ctx.clip();
        ctx.font = fuente(500, 40, 'mono'); tracking(4);
        const wt = ancho(K.marcos), off = red ? 0 : ((T - (lista.find((e) => e.id === 'modelo').inicio + 7) * spb) * 120) % wt;
        ctx.fillStyle = rgba(tinta, 0.85 * pt);
        for (let x = X0 - off; x < W; x += wt) ctx.fillText(K.marcos, x, 1240);
        tracking(0); ctx.restore();
        [[X0, 1], [W - X0 - 160, -1]].forEach(([x, s]) => { const g = ctx.createLinearGradient(x + (s > 0 ? 0 : 160), 0, x + (s > 0 ? 160 : 0), 0); g.addColorStop(0, rgba(C.ambar, 1)); g.addColorStop(1, rgba(C.ambar, 0)); ctx.fillStyle = g; ctx.fillRect(x, 1195, 160, 70); });
      }
    },

    partners(b, e) {
      const parte = e.parte || 0, idx = parte ? [4, 5, 6] : [0, 1, 2, 3], n = idx.length;
      const sube = red || parte ? 0 : (1 - eio(seg(b, 0, 5))) * 260, sal = parte ? 0 : seg(b, e.beats - 1.1, 0.9), a = 1 - sal;
      estrellasDibujar(0.55 * (parte ? 1 : eo(seg(b, 0, 2))), -T * 8, T * 9);
      puntos(planeta.map((p) => [p.x, p.y + sube, 3.4 * clamp(0.25 + p.borde * 0.75) * clamp(1.4 - (p.y - 1150) / 400), 0.55 * clamp(1.3 - p.borde * 0.35)]), C.crema);
      etiqueta('NUESTROS PARTNERS TECH', X0, 300, C.ign, parte ? 1 : seg(b, 0.2, 0.8));
      bloque(K.partnersTitulo, X0, 330, { size: 84, maxW: 1900, entra: (i) => (parte ? 1 : seg(b, 0.5 + i * 0.3, 1)) });
      const xs = idx.map((_, k) => (n === 4 ? 430 + k * 580 : 640 + k * 640)), ys = idx.map((_, k) => (k % 2 ? 800 : 600));
      idx.forEach((pi, k) => {
        const x = xs[k], y = ys[k], at = 1.6 + k * 2, p = seg(b, at, 0.7);
        if (k) lineaPunteada(xs[k - 1], ys[k - 1], x, y, eio(seg(b, at - 0.6, 0.7)), C.crema, 0.35 * a, 18, 2.4);
        if (p <= 0) return;
        if (!red) { const q = seg(b, at, 1.2); ctx.strokeStyle = rgba(C.ambar, 0.6 * (1 - q) * a); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 11 + 70 * eo(q), 0, 7); ctx.stroke(); }
        punto(x, y, 11 * (red ? 1 : eoBack(p)), pi === K.partners.length - 1 ? C.ign : C.ambar, a);
        bloque([[K.partners[pi][0], 'crema']], x, y + 40, { size: 68, align: 'center', maxW: 700, entra: () => seg(b, at + 0.15, 0.8), sale: () => sal });
        K.partners[pi][1].split(' · ').forEach((l, li) => texto(flap(l, seg(b, at + 0.5 + li * 0.3, 0.9), pi + li), x, y + 170 + li * 48, { fam: 'mono', peso: 500, size: 38, ls: 1.5, color: C.crema, a: 0.8 * a, align: 'center' }));
      });
    },

    valores(b, e) {
      const parte = e.parte || 0, tinta = C.espacio, v = K.valores, idx = parte ? [4, 5, 6] : [0, 1, 2, 3], at = (k) => 2.4 + k * 2.6;
      const hechos = (parte ? 4 : 0) + idx.filter((_, k) => b >= at(k)).length;
      const sal = parte ? 0 : seg(b, e.beats - 1.1, 0.9), a = 1 - sal;
      etiqueta('CHECKLIST DE PRE-VUELO', X0, 300, C.ign, parte ? 1 : seg(b, 0.2, 0.8));
      bloque([['¿Qué nos rige?', 'espacio']], X0, 330, { size: 120, maxW: 1600, entra: () => (parte ? 1 : seg(b, 0.4, 1)) });
      const aN = parte ? 1 : seg(b, 1, 0.8);
      const w7 = texto('/07', W - X0, 470, { fam: 'mono', peso: 700, size: 180, color: C.acero, a: 0.5 * aN, align: 'right' });
      texto(String(hechos).padStart(2, '0'), W - X0 - w7, 470, { fam: 'mono', peso: 700, size: 180, color: C.ign, a: aN, align: 'right' });
      idx.forEach((vi, k) => {
        const y = 650 + k * 165, ap = parte ? seg(b, 0.3 + k * 0.25, 0.8) : seg(b, 0.8 + k * 0.25, 0.8), ck = red ? (b >= at(k) ? 1 : 0) : seg(b, at(k), 0.6);
        if (ap <= 0) return;
        const al = mix(0.32, 1, eo(ck)) * ap * a;
        ctx.strokeStyle = rgba(tinta, 0.8 * ap * a); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X0 + 26, y - 20, 26, 0, 7); ctx.stroke();
        punto(X0 + 26, y - 20, 26 * (red ? ck : eoBack(ck)), C.ign, a);
        texto(`0${vi + 1}`, X0 + 84, y - 4, { fam: 'mono', peso: 500, size: 40, ls: 2, color: C.acero, a: ap * a });
        const w = texto(v[vi], X0 + 200, y, { peso: 600, size: 66, color: tinta, a: al });
        const x1 = X0 + 200 + w + 36, x2 = W - X0 - 110;
        if (x2 > x1 + 30) lineaPunteada(x1, y - 16, x2, y - 16, eo(seg(b, at(k) + 0.15, 0.7)), tinta, 0.4 * a, 20, 2.8);
        texto(flap('OK', seg(b, at(k) + 0.5, 0.4), vi), W - X0, y - 2, { fam: 'mono', peso: 700, size: 44, ls: 2, color: C.ign, align: 'right', a });
      });
    },

    orbita(b) {
      estrellasDibujar(0.55, -T * 8, -T * 3);
      punto(1280, 900 - 260 * eio(seg(b, 0, 2)), 12 * (1 - seg(b, 5.4, 0.6)), C.ign);
      bloque([[K.pregunta, 'crema']], 1280, 380, { size: 220, align: 'center', maxW: 2200, entra: () => seg(b, 0.6, 1.1), sale: () => seg(b, 5.2, 0.8) });
      const lk = seg(b, 6, 1.4);
      if (lk > 0) {
        const alto = 210, w = alto * (617 / 116), x0 = 1280 - w / 2, cy = 640;
        const s = red ? 1 : eo(lk);
        simbolo(x0 + alto / 2, cy + (1 - s) * 40, alto / 200, C.crema, s);
        logotipo(x0 + alto * (150 / 116), cy - alto / 2, alto, C.crema, [0, 1, 2, 3].map((i) => seg(b, 6.3 + i * 0.2, 0.9)));
        texto(tecleo(K.bajada, seg(b, 7.2, 1.2)), 1280, cy + alto / 2 + 110, { fam: 'mono', peso: 500, size: 46, ls: 7, color: C.ambar, align: 'center' });
      }
    },
  };

  /* ───── un cuadro ───── */
  function render(context, t, { reducido = false, bucle = false } = {}) {
    ctx = context; red = reducido; T = clamp(t, 0, duracion - 1e-6);
    const B = T / spb;
    const i = Math.max(0, lista.findIndex((e) => B >= e.inicio && B < e.fin));
    const e = lista[i], b = B - e.inicio;
    ctx.fillStyle = C[e.fondo]; ctx.fillRect(0, 0, W, H);
    // viñeta leve solo en láminas oscuras
    if (e.base) T_[e.id](b * e.base / e.beats, { ...e, beats: e.base }); else T_[e.id](b, e);
    let tinta = OSCURO[e.fondo] ? C.crema : e.fondo === 'ambar' ? C.tueste : C.espacio;
    if (e.salida) {
      const p = seg(b, e.beats - e.salida.beats, e.salida.beats);
      barrido(p, e.salida.color, e.salida.origen);
      const destino = OSCURO[e.salida.color] ? C.crema : e.salida.color === 'ambar' ? C.tueste : C.espacio;
      tinta = mixc(tinta, destino, eio(p));
    }
    if (e.finFondo) tinta = mixc(tinta, C.tueste, eio(seg(b, e.beats - 1.6, 1.6)));
    if (OSCURO[e.fondo] && !(e.salida && seg(b, e.beats - e.salida.beats, e.salida.beats) >= 1)) {
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.1);
      g.addColorStop(0, 'rgba(0,19,29,0)'); g.addColorStop(1, 'rgba(0,19,29,0.45)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    const hudA = eo(seg(B, 2.4, 2));
    bitacora(B, tinta, hudA);
    if (bucle) { const f = eio(seg(B, totalB - 1.4, 1.4)); if (f > 0) { ctx.fillStyle = rgba(C.espacio, f); ctx.fillRect(0, 0, W, H); } }
  }

  return { render, duracion, spb, escenas: lista, totalBeats: totalB, W, H };
}
