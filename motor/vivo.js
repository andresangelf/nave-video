// NAVE · película en vivo · motor de capas
// Misma película y mismo guion que motor.js, pero en tres capas que se reacomodan a cualquier pantalla:
//   fondo   (canvas)  estrellas, retícula de puntos, símbolo, planeta y lanzamiento. Cubre toda la pantalla.
//   escenas (HTML)    titulares, tableros y listas como elementos reales; el CSS los distribuye en
//                     horizontal (escenario 16:9) o en vertical (todo apilado).
//   barrido (canvas)  la trama que lleva de una lámina a la siguiente, por encima de las escenas.
//   HUD     (HTML)    cruces de registro, bitácora del tramo y altímetro.
// Todo es función del tiempo: render(T) deja siempre el mismo cuadro.

import { SIMBOLO, LETRAS, PUNTOS } from './activos.js';
import { CONTENIDO as K, ESCENAS, PALETA as C } from './motor.js';
import { BPM, DURACION, INICIOS } from './pelicula.js';

/* ───────── utilidades ───────── */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (x, a, d) => clamp((x - a) / d);
const mix = (a, b, t) => a + (b - a) * t;
const eo = (x) => 1 - Math.pow(1 - x, 3);
const eoX = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eoBack = (x) => { const c = 1.7, c3 = c + 1; return 1 + c3 * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgba = (h, a = 1) => { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; };
const mixc = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return '#' + A.map((v, i) => Math.round(mix(v, B[i], t)).toString(16).padStart(2, '0')).join(''); };
const OSCURO = { espacio: 1, noche: 1, tueste: 1 };
const FLECHA = 'M71.3 24C74.23 26.93 74.23 31.68 71.3 34.61L47.3 58.61 36.7 48 47.89 36.8H0V21.8H47.89L36.7 10.61 47.3 0 71.3 24Z';
const GLIFOS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/* ───────── guion en beats (el mismo de pelicula.js) ───────── */
const spb = 60 / BPM;
let acc = 0;
const lista = ESCENAS.map((e, i) => {
  const beats = ((INICIOS[i + 1] ?? DURACION) - INICIOS[i]) / spb;
  const s = { ...e, beats, inicio: acc, fin: acc + beats }; acc += beats; return s;
});
const totalB = acc, duracion = totalB * spb, ultima = lista[lista.length - 1];
const capitulos = lista.filter((e, i) => e.cap && lista.findIndex((x) => x.cap === e.cap) === i);
const L0 = 7.5, bDespegue = lista[0].inicio + L0;

/* ───────── DOM ───────── */
function el(tag, cls, parent, html) {
  const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e;
}
const svgNS = 'http://www.w3.org/2000/svg';
function flechaSvg(parent, cls) {
  const s = document.createElementNS(svgNS, 'svg'); s.setAttribute('viewBox', '-2 -2 78.5 62.6'); if (cls) s.setAttribute('class', cls);
  const p = document.createElementNS(svgNS, 'path'); p.setAttribute('d', FLECHA); s.appendChild(p); parent.appendChild(s); return s;
}
function vis(e, a) { if (a <= 0.003) { e.style.visibility = 'hidden'; e.style.opacity = '0'; } else { e.style.visibility = ''; e.style.opacity = a >= 0.999 ? '' : String(a); } }

/* ───────── motor ───────── */
export function crearVivo(raiz, { reducido = () => false } = {}) {
  let red = false;
  raiz.classList.add('pel');
  const cvF = el('canvas', '', raiz); cvF.id = 'fondo';
  const stE = el('div', 'st capa-esc', raiz);
  const cvB = el('canvas', '', raiz); cvB.id = 'barrido';
  const stH = el('div', 'st capa-hud', raiz);
  const ctxF = cvF.getContext('2d'), ctxB = cvB.getContext('2d');

  /* ── layout ── */
  const Lay = { v: false, d: 1, Wu: 2560, Hu: 1440, vw: 0, vh: 0, sx: 0, sy: 0, VX0: 0, VY0: 0, VW: 2560, VH: 1440, dpr: 1, kp: 1, G: {} };

  /* ── geometría (se recalcula al medir) ── */
  let estrellas = [], trama = [], tramaB = [], pluma = [], planeta = [], src = null, elegido = null;
  const N = PUNTOS.length / 3, sx = [], sy = [], ss = [];
  for (let i = 0; i < N; i++) { sx.push(PUNTOS[3 * i]); sy.push(PUNTOS[3 * i + 1]); ss.push(PUNTOS[3 * i + 2]); }
  const symPath = new Path2D(SIMBOLO[0]);

  function hexGrid(S, pad = 1) {
    const RH = (S * Math.sqrt(3)) / 2, out = [];
    for (let j = -pad; Lay.VY0 + j * RH < Lay.VY0 + Lay.VH + pad * RH; j++) for (let i = -pad; i * S < Lay.VW + pad * S; i++) out.push([Lay.VX0 + i * S + (j % 2 ? S / 2 : 0), Lay.VY0 + j * RH]);
    return out;
  }

  function geometria() {
    const { Wu, Hu, v } = Lay, G = {};
    if (!v) {
      G.A = [1840, 600]; G.marc = [[1520, 400], [2120, 360], [2200, 820]];
      G.CS = [Wu / 2, 700]; G.alto0 = 680; G.lanz = [1060, 640]; G.orb = [900, 640];
      G.mod = { x1: 760, x2: 1800, y0: 570, cx: 1280, cy: 700 };
      G.hor = 1150; G.planetaCx = Wu / 2;
    } else {
      G.A = [660, Hu * 0.26]; G.marc = [[G.A[0] - 300, G.A[1] - 190], [G.A[0] + 280, G.A[1] - 130], [G.A[0] + 290, G.A[1] + 200]];
      G.CS = [Wu / 2, Hu * 0.4]; G.alto0 = Wu * 0.62; G.lanz = [Hu * 0.74, Hu * 0.5]; G.orb = [Hu * 0.62, Hu * 0.4];
      G.mod = { x1: 300, x2: 900, y0: 560, cx: 600, cy: 720 };
      G.hor = Hu * 0.86; G.planetaCx = Wu / 2;
    }
    G.partners = (n) => {
      if (!Lay.v) return { xs: Array.from({ length: n }, (_, k) => (n === 4 ? 430 + k * 580 : 640 + k * 640)), ys: Array.from({ length: n }, (_, k) => (k % 2 ? 800 : 600)) };
      const y0 = 640, fin = Math.max(y0 + 200 * (n - 1), Hu - 360), st = (fin - y0) / (n - 1);
      return { xs: Array.from({ length: n }, (_, k) => (k % 2 ? 860 : 340)), ys: Array.from({ length: n }, (_, k) => y0 + k * st) };
    };
    Lay.G = G;

    // estrellas en tres profundidades
    const r0 = rng(7); estrellas = [];
    for (let i = 0; i < 560; i++) { const z = [0.35, 0.65, 1][i % 3]; estrellas.push({ x: r0() * (Lay.VW + 400) - 200, y: r0() * (Lay.VH + 400) - 200, z, r: 1.1 + z * 2.1, a: 0.18 + 0.5 * z * r0() }); }
    // retícula base (36) y de barrido (40)
    trama = hexGrid(36).map(([x, y]) => ({ x, y, d: Math.hypot(x - G.A[0], y - G.A[1]) }));
    tramaB = hexGrid(40, 2);
    const r1 = rng(11), cx = Wu / 2;
    pluma = hexGrid(22).filter(([x, y]) => y > Hu * 0.39 && Math.abs(x - cx) < 900).map(([x, y]) => ({ x, y, j: r1() }));
    const R = 2700, ccy = G.hor + R;
    planeta = hexGrid(24).filter(([x, y]) => y > G.hor - 70).map(([x, y]) => { const d = Math.hypot(x - G.planetaCx, y - ccy); return d < R ? { x, y, borde: (R - d) / 260 } : null; }).filter(Boolean);
    // símbolo de 1 018 puntos: cada uno sale de su punto de la retícula
    const KS = G.alto0 / 200; src = new Int32Array(N); elegido = new Uint8Array(trama.length);
    [...Array(N).keys()].sort((a, b) => ss[a] - ss[b]).forEach((i) => {
      const ex = G.CS[0] + (sx[i] - 100) * KS * 1.7, ey = G.CS[1] + (sy[i] - 100) * KS * 1.7;
      let best = -1, bd = Infinity;
      for (let k = 0; k < trama.length; k++) { if (elegido[k]) continue; const dd = (trama[k].x - ex) ** 2 + (trama[k].y - ey) ** 2; if (dd < bd) { bd = dd; best = k; } }
      src[i] = best; elegido[best] = 1;
    });
  }

  /* ── primitivas de canvas (en unidades de diseño, origen en el escenario) ── */
  let ctx = ctxF, T = 0;
  const base = (c) => { c.setTransform(Lay.dpr * Lay.d, 0, 0, Lay.dpr * Lay.d, Lay.dpr * Lay.sx, Lay.dpr * Lay.sy); };
  function punto(x, y, r, color, a = 1) { if (r <= 0 || a <= 0) return; ctx.fillStyle = rgba(color, a); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
  function puntos(lst, color) {
    const g = new Map();
    for (const [x, y, r, a] of lst) { if (r <= 0.05 || a <= 0.01) continue; const k = Math.round(a * 20); let p = g.get(k); if (!p) g.set(k, (p = new Path2D())); p.moveTo(x + r, y); p.arc(x, y, r, 0, 7); }
    for (const [k, p] of g) { ctx.fillStyle = rgba(color, k / 20); ctx.fill(p); }
  }
  function lineaPunteada(x1, y1, x2, y2, p, color, a = 1, paso = 20, r = 3, curva = 0) {
    if (p <= 0) return;
    const Lg = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.floor(Lg / paso)), lst = [];
    for (let i = 0; i <= n * clamp(p); i++) { const u = i / n; lst.push([mix(x1, x2, u), mix(y1, y2, u) - curva * Math.sin(Math.PI * u), r * Lay.kp, a]); }
    puntos(lst, color);
  }
  function simbolo(cx, cy, k, color, a = 1) { if (a <= 0) return; ctx.save(); ctx.translate(cx - 100 * k, cy - 100 * k); ctx.scale(k, k); ctx.fillStyle = rgba(color, a); ctx.fill(symPath, 'evenodd'); ctx.restore(); }
  function estrellasDibujar(a, dx = 0, dy = 0, fuerza = 0, atr) {
    const lst = [], WW = Lay.VW + 400, HH = Lay.VH + 400;
    for (const s of estrellas) {
      let x = s.x + dx * s.z, y = s.y + dy * s.z;
      x = ((x % WW) + WW) % WW - 200 + Lay.VX0; y = ((y % HH) + HH) % HH - 200 + Lay.VY0;
      if (fuerza && atr) { const d = Math.hypot(x - atr[0], y - atr[1]), w = Math.exp(-(d * d) / (2 * 640 * 640)) * fuerza; x = mix(x, atr[0], w); y = mix(y, atr[1], w); }
      lst.push([x, y, s.r * Lay.kp, s.a * a]);
    }
    puntos(lst, C.crema);
  }
  function barrido(p, color, origen) {
    if (p <= 0) return;
    if (p >= 1) { ctx.fillStyle = C[color]; ctx.fillRect(Lay.VX0 - 10, Lay.VY0 - 10, Lay.VW + 20, Lay.VH + 20); return; }
    if (red) { ctx.fillStyle = rgba(C[color], p); ctx.fillRect(Lay.VX0, Lay.VY0, Lay.VW, Lay.VH); return; }
    const lst = [], S = 40, Dm = Math.hypot(Lay.VW, Lay.VH);
    for (const [x, y] of tramaB) {
      const d = origen === 'abajo' ? (Lay.VY0 + Lay.VH - y) / Lay.VH : Math.hypot(x - origen[0], y - origen[1]) / Dm;
      const q = clamp((p * 1.55 - d * 0.55 / (origen === 'abajo' ? 0.55 : 0.75)) * 1.25);
      lst.push([x, y, S * 0.62 * eio(q), 1]);
    }
    puntos(lst, C[color]);
  }

  /* ── texto en DOM ── */
  const tecleo = (s, p) => s.slice(0, Math.floor(s.length * clamp(red ? (p > 0 ? 1 : 0) : p)));
  function flap(s, p, sem = 1) {
    if (red) return p > 0 ? s : '';
    let o = ''; const paso = Math.floor(T * 30);
    for (let i = 0; i < s.length; i++) {
      const q = (p - (i / Math.max(1, s.length)) * 0.55) / 0.45;
      if (q >= 1 || s[i] === ' ') o += q > 0 || s[i] === ' ' ? s[i] : ' ';
      else if (q <= 0) o += ' ';
      else o += GLIFOS[(i * 7 + sem * 13 + paso * 5) % GLIFOS.length];
    }
    return o.replace(/\s+$/, '');
  }
  // texto que reserva su ancho final: lo ya escrito + lo que falta, invisible
  function Txt(parent, cls, full, extra = '') {
    const e = el('div', 'txt ' + cls + ' ' + extra, parent); const v = el('span', 'v', e), g = el('span', 'g', e, full); let last = null;
    return { e, set(shown) { if (shown === last) return; last = shown; v.textContent = shown; g.textContent = full.slice(shown.length); }, op(a) { vis(e, a); } };
  }
  function Bloque(parent, spans, cls) {
    const e = el('div', 'bq ' + cls, parent), words = [];
    spans.forEach(([s, col]) => s.split(/(\s+)/).forEach((w) => {
      if (!w) return;
      if (/^\s+$/.test(w)) e.appendChild(document.createTextNode(' '));
      else { const o = el('span', 'w', e), i = el('span', 'wi col-' + col, o, w.replace(/&/g, '&amp;')); words.push({ o, i, l: 0, last: '' }); }
    }));
    return {
      e, words,
      medir() { const tops = [...new Set(words.map((w) => Math.round(w.o.offsetTop / 4)))].sort((a, b) => a - b); words.forEach((w) => { w.l = tops.indexOf(Math.round(w.o.offsetTop / 4)); }); },
      act(entra, sale = () => 0, alfa = 1) {
        for (const w of words) {
          const p = clamp(entra(w.l)), q = clamp(sale(w.l));
          let k;
          if (p <= 0 || q >= 1) k = 'x';
          else if (red) k = `r${(p * (1 - q) * alfa).toFixed(2)}`;
          else k = `${((1 - eoX(p)) * 1.1 - eio(q) * 1.1).toFixed(3)}|${alfa}`;
          if (k === w.last) continue; w.last = k;
          if (k === 'x') { w.o.style.visibility = 'hidden'; continue; }
          w.o.style.visibility = '';
          if (red) { w.i.style.transform = ''; w.i.style.opacity = String(p * (1 - q) * alfa); }
          else { w.i.style.transform = `translateY(${(1 - eoX(p)) * 1.1 * 100 - eio(q) * 1.1 * 100}%)`; w.i.style.opacity = alfa < 1 ? String(alfa) : ''; }
        }
      },
    };
  }
  const tecAlfa = (t, s, p, a = 1) => { t.set(tecleo(s, p)); t.op(a * (p > 0 ? 1 : 0)); };
  const lab = (parent, cls, s) => Txt(parent, 'lab ' + cls, s);
  const flapAlfa = (t, s, p, sem, a) => { t.set(flap(s, p, sem)); t.op(p > 0 ? a : 0); };

  /* ───────── escenas ───────── */
  const escenas = [];   // una por entrada de `lista`
  const anclas = [];    // callbacks que cachean rectángulos tras medir

  const relRect = (e) => {
    const r = e.getBoundingClientRect(), o = stE.getBoundingClientRect();
    return { x: (r.left - o.left) / Lay.d, y: (r.top - o.top) / Lay.d, w: r.width / Lay.d, h: r.height / Lay.d };
  };
  const centro = (e) => { const r = relRect(e); return [r.x + r.w / 2, r.y + r.h / 2]; };

  function lockup(parent, clsLk, clsBaj) {
    const lk = el('div', 'lk ' + clsLk, parent), s = el('div', 'lk__s', lk);
    const svg = document.createElementNS(svgNS, 'svg'); svg.setAttribute('viewBox', '0 58.9 467 116'); lk.appendChild(svg);
    const ps = LETRAS.map((d) => { const p = document.createElementNS(svgNS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', C.crema); svg.appendChild(p); return p; });
    const baj = Txt(parent, 'baj ' + clsBaj, K.bajada);
    return {
      lk, s, baj,
      letras(q4) { ps.forEach((p, i) => { const q = clamp(q4[i]); if (q <= 0) { p.style.opacity = '0'; return; } p.style.opacity = red ? String(q) : ''; p.style.transform = red ? '' : `translateY(${(1 - eoX(q)) * 122}px)`; }); },
      meta() { const r = relRect(s); return { x: r.x + r.w / 2, y: r.y + r.h / 2, k: r.w / 200 }; },
    };
  }

  /* 1 · lanzamiento */
  function sLanz(e) {
    const r = {}; const s = el('section', 'esc', stE);
    r.tit = Bloque(s, K.despegue, 'c l-tit'); r.cta = el('div', 'cuenta', s);
    r.s = s; let ult = '';
    r.dom = (b) => {
      r.tit.act(() => seg(b, 0.6, 1), () => seg(b, L0 + 0.2, 0.6));
      let act = null;
      for (let k = 3; k >= 0; k--) {
        const at = L0 - k * 1.5, p = seg(b, at, 0.4), q = k ? seg(b, at + 1.2, 0.3) : seg(b, L0 + 0.6, 0.4);
        if (p > 0 && q < 1) act = { k, p, q };
      }
      if (!act) { vis(r.cta, 0); return; }
      const t = `T–0${act.k}`; if (t !== ult) { r.cta.textContent = t; ult = t; }
      r.cta.style.color = act.k ? C.ambar : C.ign;
      r.cta.style.transform = red ? '' : `translateY(${(1 - eoX(act.p)) * 40 * Lay.d}px)`;
      vis(r.cta, (red ? 1 : clamp(act.p * 2)) * (1 - act.q));
    };
    r.fondo = (b) => {
      const G = Lay.G, cx = Lay.Wu / 2, Hu = Lay.Hu;
      const vuelo = red ? (b > L0 ? 1 : 0) : eio(seg(b, L0 + 0.4, 6));
      estrellasDibujar(0.6 * eo(seg(b, 0.2, 3)), -T * 8, -T * 3 + 1.28 * Lay.VH * vuelo);
      const sube = red ? (b > L0 ? 1 : 0) : eo(seg(b, L0 + 0.1, 1.6)), baja = red ? 0 : 0.76 * Hu * eio(seg(b, L0 + 1.4, 3.4)), apaga = 1 - eio(seg(b, L0 + 2.6, 2.4));
      if (sube > 0 && apaga > 0) puntos(pluma.map((q) => {
        const v = (Hu - q.y) / (Hu - Hu * 0.39), sig = mix(620, 70, Math.pow(v, 0.7));
        const f = Math.exp(-((q.x - cx) ** 2) / (2 * sig * sig)) * clamp((sube * 1.25 - v) * 3);
        return [q.x, q.y + baja, 8.4 * f * (0.75 + 0.25 * q.j) * Lay.kp, apaga];
      }), C.ambar);
      const lanz = red ? (b > L0 ? 1 : 0) : eio(seg(b, L0 + 0.3, 3)), llega = red ? (b > 13 ? 1 : 0) : eio(seg(b, 13, 2.6));
      const x = mix(cx, G.A[0], llega), y = mix(mix(G.lanz[0], G.lanz[1], lanz), G.A[1], llega), R = 12 * Lay.kp;
      if (!red && lanz > 0 && lanz < 1) for (let j = 12; j >= 1; j--) punto(cx, y + j * 26 * (1 - lanz), R * (1 - j / 14), C.ign, 0.7 * (1 - j / 13));
      punto(x, y, R * (red ? 1 : eoBack(seg(b, 0.3, 0.6))), C.ign);
    };
    return r;
  }

  /* 2 · manifiesto */
  function sManif(e) {
    const r = {}; const s = el('section', 'esc', stE); r.s = s;
    r.lab = lab(s, 'm-lab', 'MANIFIESTO');
    const fr = el('div', 'm-fr', s);
    r.fr = K.manifiesto.map((sp) => Bloque(fr, sp, ''));
    r.mk = K.marcadores.map((m) => el('div', 'marc col-crema', s)); r.mkT = K.marcadores.map((m, i) => { const t = Txt(r.mk[i], '', m); return t; });
    r.posMk = () => { Lay.G.marc.forEach(([x, y], i) => { r.mk[i].style.left = `${(x + 30) * Lay.d}px`; r.mk[i].style.top = `${(y - 18) * Lay.d}px`; }); };
    r.dom = (b) => {
      tecAlfa(r.lab, 'MANIFIESTO', seg(b, 0.3, 0.8), 1 - seg(b, 14.6, 0.5));
      const f = [[0.4, 5.1], [5.7, 10.3], [10.9, 14.8]];
      r.fr.forEach((bq, k) => bq.act((i) => seg(b, f[k][0] + i * 0.4, 1), () => seg(b, f[k][1], 0.7)));
      r.mkT.forEach((t, i) => { const p = seg(b, 6.7 + i * 0.55, 0.6), q = seg(b, 10.2, 0.6); flapAlfa(t, K.marcadores[i], p, i, 0.85 * (1 - q)); });
    };
    r.fondo = (b) => {
      const G = Lay.G, A = G.A;
      const fuerza = 0.38 * eio(seg(b, 1, 4)) * (1 - 0.6 * eio(seg(b, 5.4, 2))), fuera = seg(b, 11, 2.2);
      estrellasDibujar(0.6 * (1 - fuera), -T * 8, -T * 3, red ? 0 : fuerza, A);
      if (b > 10.6) puntos(trama.map((p) => { const q = eo(seg(b, 10.8 + p.d / 1500 * 2.2, 0.8)); return [p.x, p.y, 2.6 * q * Lay.kp, 0.34 * q]; }), C.crema);
      punto(A[0], A[1], (12 + (red ? 0 : 1.5 * Math.sin(T * 3.4))) * Lay.kp, C.ign);
      G.marc.forEach(([x, y], i) => {
        const p = seg(b, 6.4 + i * 0.55, 0.7), q = seg(b, 10.2, 0.6);
        if (p <= 0 || q >= 1) return;
        lineaPunteada(A[0], A[1], x, y, eo(p), C.crema, 0.5 * (1 - q), 16, 2.2);
        punto(x, y, 7 * Lay.kp * (red ? 1 : eoBack(p)), C.ambar, 1 - q);
      });
    };
    return r;
  }

  /* 3 · NAVE: la retícula entrega sus puntos al símbolo */
  function sNave(e) {
    const r = {}; const s = el('section', 'esc', stE); r.s = s;
    r.lk = lockup(s, 'nv-lk', 'nv-baj');
    anclas.push(() => { r.tgt = r.lk.meta(); });
    r.dom = (b) => { r.lk.letras([0, 1, 2, 3].map((i) => seg(b, 5.5 + i * 0.22, 0.9))); tecAlfa(r.lk.baj, K.bajada, seg(b, 6.6, 1.3)); };
    r.fondo = (b) => {
      const G = Lay.G, A = G.A, tg = r.tgt || { x: Lay.Wu / 2, y: Lay.Hu / 2, k: 1.2 }, KS = G.alto0 / 200;
      const fuera = (k) => { const q = 1 - trama[k].d / 2600; return seg(b, 0.3 + q * 1.2, 0.8); };
      const fondo = [];
      trama.forEach((p, k) => { if (!elegido[k]) { const f = fuera(k); fondo.push([p.x, p.y, 2.6 * (1 - 0.5 * f) * Lay.kp, 0.34 * (1 - f)]); } });
      puntos(fondo, C.crema);
      const fusion = eio(seg(b, 3.6, 0.6)), sol = eo(seg(b, 3.9, 0.5));
      const mov = red ? (b > 4.6 ? 1 : 0) : eio(seg(b, 4.6, 1.6));
      const k = mix(KS, tg.k, mov), cx = mix(G.CS[0], tg.x, mov), cy = mix(G.CS[1], tg.y, mov);
      if (sol < 1) {
        const lst = [];
        for (let i = 0; i < N; i++) {
          const g = trama[src[i]], d0 = 0.4 + ss[i] * 1.8, u = red ? (b > 2.5 ? 1 : 0) : eio(seg(b, d0, 1.1));
          const tx = cx + (sx[i] - 100) * k, ty = cy + (sy[i] - 100) * k;
          const vx = tx - g.x, vy = ty - g.y, curva = Math.sin(Math.PI * u) * 0.16;
          lst.push([g.x + vx * u - vy * curva, g.y + vy * u + vx * curva, mix(2.6 * Lay.kp, 1.456 * k, u) * (1 + 0.55 * fusion), mix(0.34, 1, u) * (1 - sol)]);
        }
        puntos(lst, C.crema);
      }
      const ip = red ? 1 : eio(seg(b, 2.4, 1.1)), ax = cx, ay = cy + (63 - 100) * k;
      if (b < 3.6) punto(mix(A[0], ax, ip), mix(A[1], ay, ip) - Math.sin(Math.PI * ip) * 160, 12 * Lay.kp, C.ign);
      const fl = seg(b, 3.5, 0.9);
      if (fl > 0 && fl < 1 && !red) {
        const g = ctx.createRadialGradient(ax, ay, 0, ax, ay, 900);
        g.addColorStop(0, rgba(C.ambar, 0.32 * (1 - fl))); g.addColorStop(1, rgba(C.ambar, 0));
        ctx.fillStyle = g; ctx.fillRect(Lay.VX0, Lay.VY0, Lay.VW, Lay.VH);
      }
      simbolo(cx, cy, k, C.crema, sol);
    };
    return r;
  }

  /* 4 · ¿Qué es NAVE? */
  function sQueEs(e) {
    const r = {}; const s = el('section', 'esc t-espacio', stE); r.s = s;
    // a · la experiencia
    const g1 = el('div', 'q-grupo', s); r.g1 = g1;
    r.l1 = lab(g1, 'q-lab', '¿QUÉ ES NAVE?');
    const cb = el('div', 'cnt-box', g1), cnt = el('div', 'cnt', cb); let nUlt = -1;
    r.exp = Bloque(g1, K.experiencia, 'q-exp'); r.baj1 = Txt(g1, 'q-baj', K.bajada);
    // b · fusionamos
    const g2 = el('div', 'q-grupo', s); r.g2 = g2;
    r.l2 = lab(g2, 'q-lab', '¿QUÉ ES NAVE?');
    r.fusT = Bloque(g2, K.fusionTitulo, 'q-fus-t');
    r.fus = K.fusion.map(([izq, der], i) => {
      const f = el('div', 'fus', g2), a = el('div', 'izq', f), pt = el('div', 'pt' + (i === 2 ? ' ign' : ''), f), c = el('div', 'der', f);
      const ai = el('span', i === 2 ? '' : '', a, izq), ci = el('span', i === 2 ? 'col-ign' : '', c, der);
      f.dataset.i = i; return { f, a: ai, pt, c: ci };
    });
    // c · socio de ejecución
    const g3 = el('div', 'q-grupo', s); r.g3 = g3;
    r.l3 = lab(g3, 'q-lab', 'SOCIO DE EJECUCIÓN');
    r.soc = Bloque(g3, K.socio, 'q-soc-t');
    const vb = el('div', 'verbos', g3);
    r.verbos = K.verbos.map((v, i) => { const o = el('div', 'verbo', vb), bg = el('i', '', o), t = Txt(o, '', v); flechaSvg(o); return { o, bg, t }; });
    r.tec = Txt(g3, 'q-tec', K.socioTec); r.fin = Bloque(g3, K.socioFin, 'q-fin');
    r.posFus = () => { r.fus.forEach(({ f }, i) => { f.style.top = `${(Lay.v ? 560 + i * 330 : 700 + i * 170 - 62) * Lay.d}px`; }); };
    r.dom = (b) => {
      const bb = b;
      g1.classList.toggle('on', bb < 8.2); g2.classList.toggle('on', bb > 7.8 && bb < 16.2); g3.classList.toggle('on', bb > 15.8);
      if (bb < 8.2) {
        const salA = seg(bb, 7, 0.8);
        tecAlfa(r.l1, '¿QUÉ ES NAVE?', seg(bb, 0.2, 0.8), 1 - seg(bb, 7.4, 0.4));
        const n = Math.round(25 * (red ? 1 : eo(seg(bb, 0.6, 2.4)))), p = seg(bb, 0.3, 1.1);
        if (n !== nUlt) { cnt.innerHTML = `${String(n).padStart(2, '0')}<b>+</b>`; nUlt = n; }
        cnt.style.transform = red ? '' : `translateY(${((1 - eoX(p)) * 600 + eio(salA) * 600) * Lay.d}px)`;
        cnt.style.opacity = red ? String(p * (1 - salA)) : '';
        r.exp.act((i) => seg(bb, 1.8 + i * 0.3, 1), () => salA);
        tecAlfa(r.baj1, K.bajada, seg(bb, 3.4, 1), 1 - salA);
      }
      if (bb > 7.8 && bb < 16.2) {
        const sal = seg(bb, 15, 0.8);
        tecAlfa(r.l2, '¿QUÉ ES NAVE?', seg(bb, 8, 0.6), 1 - sal);
        r.fusT.act(() => seg(bb, 8.2, 1), () => sal);
        r.fus.forEach(({ f, a, pt, c }, i) => {
          const ini = 9 + i * 1.5, u = (p, q) => (red ? '' : `translateY(${((1 - eoX(p)) * 1.1 - eio(q) * 1.1) * 100}%)`);
          const p1 = seg(bb, ini, 0.9), p2 = seg(bb, ini + 1, 0.9);
          a.style.transform = u(p1, sal); a.style.visibility = p1 > 0 && sal < 1 ? '' : 'hidden';
          c.style.transform = u(p2, sal); c.style.visibility = p2 > 0 && sal < 1 ? '' : 'hidden';
          const lp = eo(seg(bb, ini + 0.4, 1)) * (1 - sal);
          pt.style.transform = `scaleX(${lp})`; pt.style.visibility = lp > 0 ? '' : 'hidden';
        });
      }
      if (bb > 15.8) {
        tecAlfa(r.l3, 'SOCIO DE EJECUCIÓN', seg(bb, 16, 0.6));
        r.soc.act((i) => seg(bb, 16.3 + i * 0.4, 1));
        r.verbos.forEach(({ bg, t, o }, i) => {
          const p = red ? (bb > 18 ? 1 : 0) : eoX(seg(bb, 18 + i * 0.5, 0.8));
          bg.style.transform = `scaleX(${p})`; bg.style.visibility = p > 0 ? '' : 'hidden';
          flapAlfa(t, K.verbos[i], seg(bb, 18.3 + i * 0.5, 0.8), i, 1);
          o.querySelector('svg').style.opacity = String(seg(bb, 18.6 + i * 0.5, 0.4));
        });
        tecAlfa(r.tec, K.socioTec, seg(bb, 20.2, 1.2));
        r.fin.act(() => seg(bb, 21, 0.9));
      }
    };
    return r;
  }

  /* 5 · clientes */
  function sClientes(e) {
    const j = e.parte || 0, c = K.clientes[j], r = {}; const s = el('section', 'esc t-crema', stE); r.s = s;
    r.lab = lab(s, 'c-lab', `NUESTROS CLIENTES · RUTA 0${j + 1} / 02`);
    r.cod = Txt(s, 'c-cod', c.codigo);
    const fl = flechaSvg(s, 'c-fl'); fl.style.transform = `rotate(${c.flecha}deg)`; r.fl = fl;
    r.nom = Bloque(s, [[c.nombre, 'crema']], 'c-nom');
    const fs = el('div', 'c-filas', s); fs.style.setProperty('--b', j ? C.ign : C.crema);
    r.filas = c.filas.map((f) => { const o = el('div', 'fila', fs); const t = Txt(o, '', f); return { o, t }; });
    r.dom = (b) => {
      const sal = seg(b, e.beats - 1.1, 0.9), a = 1 - sal, ini = 0.6;
      tecAlfa(r.lab, `NUESTROS CLIENTES · RUTA 0${j + 1} / 02`, seg(b, 0.2, 0.8), a);
      flapAlfa(r.cod, c.codigo, seg(b, ini, 0.8), j + 3, a);
      vis(r.fl, (red ? seg(b, ini + 0.6, 0.5) : eo(seg(b, ini + 0.6, 0.6))) * a);
      r.nom.act(() => seg(b, ini + 0.5, 0.9), () => sal);
      r.filas.forEach(({ o, t }, i) => { const p = seg(b, ini + 1.8 + i, 1); flapAlfa(t, c.filas[i], p, i + j * 5, 0.92 * a); o.style.setProperty('--bo', p > 0 ? a : 0); });
    };
    return r;
  }

  /* 6 · qué ofrece */
  function sOferta(e) {
    const parte = e.parte || 0, filas = K.servicios.filter((x) => x[3] === (parte ? 'VENTURE' : 'TECH')), iHl = parte ? filas.length - 1 : -1;
    const r = {}; const s = el('section', 'esc t-crema', stE); r.s = s;
    r.lab = lab(s, 'o-lab', `¿QUÉ OFRECE? · ${parte ? 'VENTURE BUILDER' : 'TECH COMPANY'}`);
    r.tit = Bloque(s, [['¿Qué ofrece?', 'crema']], 'o-tit');
    const num = el('div', 'o-num', s); r.n = Txt(num, 'n', String(filas.length).padStart(2, '0')); r.cap = Txt(num, 'c', parte ? 'SERVICIOS VENTURE' : 'SERVICIOS TECH');
    r.reg = el('div', 'o-reg', s);
    const tab = el('div', 'o-tab', s);
    r.filas = filas.map(([cod, nom, alc], i) => {
      const o = el('div', 'o-fila' + (parte ? ' p1' : ''), tab), hl = el('i', 'hl', o);
      const cd = Txt(o, 'cod', cod), tx = el('div', '', o); const n = el('div', 'nom', tx, nom), a = el('div', 'alc', tx, alc);
      return { o, hl, cd, n, a };
    });
    r.rowRect = null;
    anclas.push(() => { if (iHl >= 0) { const o = r.filas[iHl].o; const rr = relRect(o); r.rowRect = rr; } });
    r.dom = (b) => {
      const hl = red ? (b > e.beats - 4.2 ? 1 : 0) : eo(seg(b, e.beats - 4.2, 0.9));
      const sal = parte ? 0 : seg(b, e.beats - 1.1, 0.9), a = 1 - sal;
      tecAlfa(r.lab, r.lab.e.textContent.replace(/\s+$/, ''), seg(b, 0.2, 0.8), a);
      r.tit.act(() => (parte ? 1 : seg(b, 0.4, 1)));
      flapAlfa(r.n, String(filas.length).padStart(2, '0'), seg(b, 0.6, 0.8), parte, a);
      r.cap.set(r.cap.e.textContent); r.cap.op(0.75 * seg(b, 0.9, 0.5) * a);
      r.reg.style.transform = `scaleX(${eio(seg(b, 0.4, 1.2))})`; r.reg.style.opacity = String(a);
      r.filas.forEach((f, i) => {
        const p = seg(b, 1.2 + i * 1.6, 0.9);
        vis(f.o, p > 0 ? a : 0);
        flapAlfa(f.cd, filas[i][0], p, i + parte * 5, 1);
        f.n.style.opacity = String(eo(seg(b, 1.4 + i * 1.6, 0.6))); f.a.style.opacity = String(0.8 * eo(seg(b, 1.7 + i * 1.6, 0.6)));
        const en = i === iHl; f.hl.style.transform = `scaleX(${en ? hl : 0})`; f.o.classList.toggle('oscura', en && hl > 0.5);
      });
    };
    r.expansion = (b) => (parte ? (red ? (b > e.beats - 1.4 ? 1 : 0) : eio(seg(b, e.beats - 1.6, 1.6))) : 0);
    return r;
  }

  /* 7 · modelo operativo */
  function sModelo(e) {
    const r = {}; const s = el('section', 'esc t-tueste', stE); r.s = s;
    r.lab = lab(s, 'md-lab', 'MODELO OPERATIVO');
    r.cols = ['Tech Company', 'Venture Builder'].map((nm, i) => {
      const col = el('div', 'md-col', s), bq = Bloque(col, [[nm, 'tueste']], 'c'); const fl = flechaSvg(s, 'md-fl'); fl.style.transform = 'rotate(90deg)';
      return { col, bq, fl };
    });
    r.pos = () => { const m = Lay.G.mod; [m.x1, m.x2].forEach((x, i) => { r.cols[i].col.style.left = `${x * Lay.d}px`; r.cols[i].fl.style.left = `${x * Lay.d}px`; }); };
    r.tec = Txt(s, 'md-tec', 'AMBOS MODELOS OPERAN BAJO');
    r.filas = K.bases.map((t, i) => { const f = el('div', 'md-fila', s); el('i', 'ln', f); const n = Txt(f, 'n', `0${i + 1}`); const bq = Bloque(f, [[t, 'tueste']], ''); return { f, n, bq }; });
    r.posF = () => { r.filas.forEach(({ f }, i) => { f.style.top = `${(Lay.v ? 900 + i * 200 : 850 + i * 118) * Lay.d}px`; }); };
    const mq = el('div', 'md-marq', s), mqs = el('span', '', mq, K.marcos); r.mq = mq; r.mqs = mqs; let wmq = 0;
    anclas.push(() => { wmq = mqs.scrollWidth; });
    r.dom = (b) => {
      const bb = b;
      tecAlfa(r.lab, 'MODELO OPERATIVO', seg(bb, 0.2, 0.8));
      [[0.5], [0.8]].forEach(([at], i) => {
        const c = r.cols[i]; c.bq.act(() => seg(bb, at, 0.9));
        const p = seg(bb, at + 0.7, 0.7);
        c.fl.style.transform = `rotate(90deg) translateX(${red ? 0 : (-(1 - eoBack(p)) * 50 * -1) * Lay.d}px)`; vis(c.fl, red ? p : clamp(p * 3));
      });
      tecAlfa(r.tec, 'AMBOS MODELOS OPERAN BAJO', seg(bb, 3.5, 0.9));
      r.filas.forEach(({ f, n, bq }, i) => {
        const at = 4.3 + i * 1.1, ln = f.firstChild;
        ln.style.transform = `scaleX(${eio(seg(bb, at - 0.2, 0.9))})`;
        flapAlfa(n, `0${i + 1}`, seg(bb, at, 0.6), i, 1); bq.act(() => seg(bb, at + 0.15, 0.9));
      });
      const pt = seg(bb, 7, 0.8); vis(r.mq, pt);
      if (pt > 0 && wmq) { const off = red ? 0 : ((T - (e.inicio + 7 * e.beats / e.base) * spb) * 120 * Lay.d) % wmq; r.mqs.style.transform = `translateX(${-off}px)`; r.mqs.style.opacity = String(0.85); }
    };
    r.fondo = (b) => {
      const bb = b, m0 = Lay.G.mod, vy = r.vy || 0, m = { x1: m0.x1, x2: m0.x2, cx: m0.cx, y0: m0.y0 + vy, cy: m0.cy + vy };
      lineaPunteada(m.x1, m.y0, m.cx, m.cy, eio(seg(bb, 2, 1.2)), C.tueste, 0.75, 18, 3, -40);
      lineaPunteada(m.x2, m.y0, m.cx, m.cy, eio(seg(bb, 2.1, 1.2)), C.tueste, 0.75, 18, 3, -40);
      punto(m.cx, m.cy, 11 * (red ? 1 : eoBack(seg(bb, 3.2, 0.5))), C.ign);
    };
    return r;
  }

  /* 8 · partners */
  function sPartners(e) {
    const parte = e.parte || 0, idx = parte ? [4, 5, 6] : [0, 1, 2, 3], n = idx.length;
    const r = {}; const s = el('section', 'esc t-crema', stE); r.s = s;
    r.lab = lab(s, 'p-lab', 'NUESTROS PARTNERS TECH'); r.tit = Bloque(s, K.partnersTitulo, 'p-tit');
    r.nodos = idx.map((pi) => {
      const o = el('div', 'p-nodo', s), nm = Bloque(o, [[K.partners[pi][0], 'crema']], 'c nm'), cp = el('div', 'cp', o);
      const ls = K.partners[pi][1].split(' · ').map((l) => Txt(el('div', '', cp), '', l));
      return { o, nm, ls };
    });
    r.pos = () => { const { xs, ys } = Lay.G.partners(n); r.nodos.forEach((nd, k) => { nd.o.style.left = `${xs[k] * Lay.d}px`; nd.o.style.top = `${ys[k] * Lay.d}px`; }); };
    r.dom = (b) => {
      const sal = parte ? 0 : seg(b, e.beats - 1.1, 0.9), a = 1 - sal;
      tecAlfa(r.lab, 'NUESTROS PARTNERS TECH', parte ? 1 : seg(b, 0.2, 0.8));
      r.tit.act((i) => (parte ? 1 : seg(b, 0.5 + i * 0.3, 1)));
      r.nodos.forEach((nd, k) => {
        const at = 1.6 + k * 2;
        nd.nm.act(() => seg(b, at + 0.15, 0.8), () => sal);
        nd.ls.forEach((t, li) => flapAlfa(t, K.partners[idx[k]][1].split(' · ')[li], seg(b, at + 0.5 + li * 0.3, 0.9), idx[k] + li, 1));
        nd.o.style.opacity = String(seg(b, at, 0.3) * a);
      });
    };
    r.fondo = (b) => {
      const sube = red || parte ? 0 : (1 - eio(seg(b, 0, 5))) * 260, sal = parte ? 0 : seg(b, e.beats - 1.1, 0.9), a = 1 - sal;
      estrellasDibujar(0.55 * (parte ? 1 : eo(seg(b, 0, 2))), -T * 8, T * 9);
      puntos(planeta.map((p) => [p.x, p.y + sube, 3.4 * clamp(0.25 + p.borde * 0.75) * clamp(1.4 - (p.y - Lay.G.hor) / 400) * Lay.kp, 0.55 * clamp(1.3 - p.borde * 0.35)]), C.crema);
      const { xs, ys } = Lay.G.partners(n);
      idx.forEach((pi, k) => {
        const x = xs[k], y = ys[k], at = 1.6 + k * 2, p = seg(b, at, 0.7);
        if (k) lineaPunteada(xs[k - 1], ys[k - 1], x, y, eio(seg(b, at - 0.6, 0.7)), C.crema, 0.35 * a, 18, 2.4);
        if (p <= 0) return;
        if (!red) { const q = seg(b, at, 1.2); ctx.strokeStyle = rgba(C.ambar, 0.6 * (1 - q) * a); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 11 + 70 * eo(q), 0, 7); ctx.stroke(); }
        punto(x, y, 11 * Lay.kp * (red ? 1 : eoBack(p)), pi === K.partners.length - 1 ? C.ign : C.ambar, a);
      });
    };
    return r;
  }

  /* 9 · valores */
  function sValores(e) {
    const parte = e.parte || 0, idx = parte ? [4, 5, 6] : [0, 1, 2, 3], at = (k) => 2.4 + k * 2.6;
    const r = {}; const s = el('section', 'esc t-espacio', stE); r.s = s;
    r.lab = lab(s, 'v-lab', 'CHECKLIST DE PRE-VUELO'); r.tit = Bloque(s, [['¿Qué nos rige?', 'espacio']], 'v-tit');
    const cnt = el('div', 'v-cnt', s), ca = el('span', 'a', cnt), cb = el('span', 'b', cnt, '/07'); r.ca = ca; r.cnt = cnt; let hUlt = '';
    const lst = el('div', 'v-lista', s);
    r.filas = idx.map((vi) => {
      const f = el('div', 'v-fila', lst), ck = el('div', 'ck', f), dot = el('i', '', ck), no = el('div', 'no', f, `0${vi + 1}`), tx = el('div', 'tx', f, K.valores[vi]), pt = el('div', 'pt', f), ok = Txt(f, 'ok', 'OK');
      return { f, dot, no, tx, pt, ok, vi };
    });
    r.dom = (b) => {
      const hechos = (parte ? 4 : 0) + idx.filter((_, k) => b >= at(k)).length, sal = parte ? 0 : seg(b, e.beats - 1.1, 0.9), a = 1 - sal;
      tecAlfa(r.lab, 'CHECKLIST DE PRE-VUELO', parte ? 1 : seg(b, 0.2, 0.8));
      r.tit.act(() => (parte ? 1 : seg(b, 0.4, 1)));
      const h = String(hechos).padStart(2, '0'); if (h !== hUlt) { r.ca.textContent = h; hUlt = h; }
      vis(r.cnt, (parte ? 1 : seg(b, 1, 0.8)) * 1);
      r.filas.forEach((f, k) => {
        const ap = parte ? seg(b, 0.3 + k * 0.25, 0.8) : seg(b, 0.8 + k * 0.25, 0.8), ck = red ? (b >= at(k) ? 1 : 0) : seg(b, at(k), 0.6);
        vis(f.f, ap * a);
        f.dot.style.transform = `scale(${red ? ck : Math.max(0, eoBack(ck))})`;
        f.tx.style.opacity = String(mix(0.32, 1, eo(ck)));
        const lp = eo(seg(b, at(k) + 0.15, 0.7)); f.pt.style.transform = `scaleX(${lp})`;
        flapAlfa(f.ok, 'OK', seg(b, at(k) + 0.5, 0.4), f.vi, 1);
      });
    };
    return r;
  }

  /* 10 · órbita */
  function sOrbita(e) {
    const r = {}; const s = el('section', 'esc t-crema', stE); r.s = s;
    r.q = Bloque(s, [[K.pregunta, 'crema']], 'c or-q');
    r.lk = lockup(s, 'or-lk', 'or-baj');
    anclas.push(() => { r.tgt = r.lk.meta(); });
    r.dom = (b) => {
      r.q.act(() => seg(b, 0.6, 1.1), () => seg(b, 5.2, 0.8));
      r.lk.letras([0, 1, 2, 3].map((i) => seg(b, 6.3 + i * 0.2, 0.9)));
      tecAlfa(r.lk.baj, K.bajada, seg(b, 7.2, 1.2));
    };
    r.fondo = (b) => {
      const G = Lay.G, cx = Lay.Wu / 2, tg = r.tgt || { x: cx, y: Lay.Hu / 2, k: 1 };
      estrellasDibujar(0.55, -T * 8, -T * 3);
      punto(cx, mix(G.orb[0], G.orb[1], eio(seg(b, 0, 2))), 12 * Lay.kp * (1 - seg(b, 5.4, 0.6)), C.ign);
      const lk = seg(b, 6, 1.4); if (lk > 0) { const sc = red ? 1 : eo(lk); simbolo(tg.x, tg.y + (1 - sc) * 40, tg.k, C.crema, sc); }
    };
    return r;
  }

  const FABRICAS = { lanzamiento: sLanz, manifiesto: sManif, nave: sNave, queEs: sQueEs, clientes: sClientes, oferta: sOferta, modelo: sModelo, partners: sPartners, valores: sValores, orbita: sOrbita };
  const CENTRADAS = new Set(['queEs', 'clientes', 'oferta', 'valores', 'modelo']);
  lista.forEach((e) => { const sc = FABRICAS[e.id](e); sc.e = e; sc.centrar = CENTRADAS.has(e.id); sc.vy = 0; escenas.push(sc); });

  /* ───────── HUD ───────── */
  const hud = el('div', 'hud', stH);
  [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([i, j]) => { const c = el('i', 'cr', hud); c.style.left = (i ? `calc(100% - var(--d) * 96)` : `calc(var(--d) * 96)`); c.style.top = (j ? `calc(100% - var(--d) * 96)` : `calc(var(--d) * 96)`); });
  const bit = el('div', 'bit', hud), ps = el('div', 'ps', bit), bitTx = el('div', 'tx', bit);
  const dotsCap = capitulos.map(() => el('i', '', ps));
  const alt = el('div', 'alt', hud), altD = Array.from({ length: 25 }, (_, i) => { const d = el('i', '', alt); d.style.bottom = `calc(var(--d) * ${i * 30})`; return d; });
  let iCapUlt = -2, nivelUlt = -9;
  function hudUpdate(B, tinta, a) {
    hud.style.setProperty('--tinta', tinta); hud.style.opacity = String(a);
    const actual = lista.find((e) => B >= e.inicio && B < e.fin) || ultima, iCap = capitulos.findIndex((e) => e.cap === actual.cap);
    if (iCap !== iCapUlt) { iCapUlt = iCap; dotsCap.forEach((d, i) => d.classList.toggle('on', i === iCap)); bitTx.textContent = iCap >= 0 ? `TRAMO ${String(iCap + 1).padStart(2, '0')} / ${String(capitulos.length).padStart(2, '0')} · ${capitulos[iCap].cap}` : ''; }
    const nivel = B < bDespegue ? -1 : Math.round(24 * mix(0.06, 1, eio(clamp((B - bDespegue) / (ultima.inicio + 4 - bDespegue)))) * 100) / 100;
    const nv = Math.floor(nivel); if (nv !== nivelUlt) { nivelUlt = nv; altD.forEach((d, i) => d.classList.toggle('on', i <= nivel)); }
  }

  let actual = -1;

  /* ───────── medir ───────── */
  function medir() {
    const r = raiz.getBoundingClientRect(); const vw = Math.max(2, r.width), vh = Math.max(2, r.height);
    const v = vw / vh < 1.15; Lay.v = v; raiz.classList.toggle('v', v); raiz.classList.toggle('h', !v);
    Lay.dpr = Math.min(window.devicePixelRatio || 1, 2); Lay.vw = vw; Lay.vh = vh;
    if (!v) { Lay.d = Math.min(vw / 2560, vh / 1440); Lay.Wu = 2560; Lay.Hu = 1440; }
    else { Lay.d = Math.min(vw / 1200, vh / 1750); Lay.Wu = 1200; Lay.Hu = vh / Lay.d; }
    Lay.sx = (vw - Lay.Wu * Lay.d) / 2; Lay.sy = (vh - Lay.Hu * Lay.d) / 2; 
    Lay.VX0 = -Lay.sx / Lay.d; Lay.VY0 = -Lay.sy / Lay.d; Lay.VW = vw / Lay.d; Lay.VH = vh / Lay.d;
    Lay.kp = Math.max(1, 1.1 / (2.6 * Lay.d));
    raiz.style.setProperty('--d', `${Lay.d}px`);
    for (const st of [stE, stH]) { st.style.left = `${Lay.sx}px`; st.style.top = `${Lay.sy}px`; st.style.width = `${Lay.Wu * Lay.d}px`; st.style.height = `${Lay.Hu * Lay.d}px`; }
    for (const c of [cvF, cvB]) { c.width = Math.round(vw * Lay.dpr); c.height = Math.round(vh * Lay.dpr); }
    geometria();
    escenas.forEach((sc) => { sc.pos && sc.pos(); sc.posMk && sc.posMk(); sc.posFus && sc.posFus(); sc.posF && sc.posF(); });
    // en pantallas altas el contenido se centra entre la cabecera y el HUD
    escenas.forEach((sc) => {
      if (!sc.centrar) return;
      sc.s.style.transform = ''; sc.vy = 0;
      if (Lay.v) {
        const o = stE.getBoundingClientRect(); let m = 0;
        sc.s.querySelectorAll('*').forEach((q) => { if (q.closest('svg') && q.tagName !== 'svg') return; if (q.closest('.md-marq')) return; const r = q.getBoundingClientRect(); if (r.width > 0 && r.height > 0) m = Math.max(m, (r.bottom - o.top) / Lay.d); });
        sc.vy = Math.max(0, (Lay.Hu - 200 - m) * 0.45);
        sc.s.style.transform = `translateY(${sc.vy * Lay.d}px)`;
      }
      if (sc.mq) sc.mq.style.bottom = Lay.v ? `${(150 - sc.vy) * Lay.d}px` : '';
    });
    anclas.forEach((f) => f());
    escenas.forEach((sc) => { for (const k of Object.keys(sc)) { const o = sc[k]; if (o && o.medir) o.medir(); if (Array.isArray(o)) o.forEach((q) => { if (q && q.medir) q.medir(); if (q && q.bq && q.bq.medir) q.bq.medir(); if (q && q.nm && q.nm.medir) q.nm.medir(); }); } });
    // las escenas se miden con todas visibles para tener su layout
    cuadroUlt = -1;
  }
  let cuadroUlt = -1;

  function medirCompleto() {
    // visibilidad temporal para que offsetTop de las palabras exista (visibility no quita layout, pero sí display de grupos)
    escenas.forEach((sc) => sc.s.classList.add('on')); [...stE.querySelectorAll('.q-grupo')].forEach((g) => g.classList.add('on'));
    medir();
    escenas.forEach((sc) => sc.s.classList.remove('on')); [...stE.querySelectorAll('.q-grupo')].forEach((g) => g.classList.remove('on'));
    actual = -1;
  }

  /* ───────── un cuadro ───────── */
  function render(t) {
    red = reducido(); T = clamp(t, 0, duracion - 1e-6);
    const B = T / spb;
    const i = Math.max(0, lista.findIndex((e) => B >= e.inicio && B < e.fin)), e = lista[i], b = B - e.inicio, sc = escenas[i];
    if (actual !== i) { if (actual >= 0) escenas[actual].s.classList.remove('on'); sc.s.classList.add('on'); actual = i; }
    // fondo
    ctx = ctxF; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C[e.fondo]; ctx.fillRect(0, 0, cvF.width, cvF.height);
    base(ctx);
    const bs = e.base ? b * e.base / e.beats : b;     // las tomas con `base` se escribieron en menos beats y se estiran
    sc.fondo && sc.fondo(bs, e);
    if (OSCURO[e.fondo]) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const W = cvF.width, H = cvF.height, g = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, Math.max(W, H) * 0.8);
      g.addColorStop(0, 'rgba(0,19,29,0)'); g.addColorStop(1, 'rgba(0,19,29,0.45)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // escena (DOM)
    sc.dom && sc.dom(bs, e);
    // barrido y recubrimientos
    ctx = ctxB; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cvB.width, cvB.height); base(ctx);
    let tinta = OSCURO[e.fondo] ? C.crema : e.fondo === 'ambar' ? C.tueste : C.espacio;
    if (e.salida) {
      const p = seg(b, e.beats - e.salida.beats, e.salida.beats), o = e.salida.origen;
      const org = o === 'abajo' ? 'abajo' : [(o[0] / 2560) * Lay.Wu, (o[1] / 1440) * Lay.Hu];
      barrido(p, e.salida.color, org);
      const destino = OSCURO[e.salida.color] ? C.crema : e.salida.color === 'ambar' ? C.tueste : C.espacio;
      tinta = mixc(tinta, destino, eio(p));
    }
    if (e.finFondo) tinta = mixc(tinta, C.tueste, eio(seg(b, e.beats - 1.6, 1.6)));
    if (sc.expansion) {
      const ex = sc.expansion(b);
      if (ex > 0 && sc.rowRect) { const q = sc.rowRect; ctx.fillStyle = C.ambar; ctx.fillRect(mix(q.x - 24, Lay.VX0 - 300, ex), mix(q.y + 4, Lay.VY0 - 300, ex), mix(q.w + 48, Lay.VW + 600, ex), mix(q.h - 10, Lay.VH + 600, ex)); }
    }
    const f = eio(seg(B, totalB - 1.4, 1.4)); if (f > 0) { ctx.fillStyle = rgba(C.espacio, f); ctx.fillRect(Lay.VX0, Lay.VY0, Lay.VW, Lay.VH); }
    hudUpdate(B, tinta, eo(seg(B, 2.4, 2)));
  }

  return { render, medir: medirCompleto, duracion, totalB };
}
