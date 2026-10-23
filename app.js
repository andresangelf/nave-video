// NAVE · sitio de la película
// El audio es el reloj maestro; el video (sin sonido) lo sigue y se corrige si se desfasa.
// Si no hay audio para el idioma, el video corre solo.

(() => {
  'use strict';
  const C = window.NAVE_CONFIG;
  const $ = (id) => document.getElementById(id);
  const app = $('app'), video = $('video'), escena = $('escena');
  const rango = $('rango'), avance = $('avance'), tiempo = $('tiempo');

  const TXT = {
    es: { titulo: 'Listos para el despegue.', elige: 'Elige el idioma del audio', ver: 'Ver en', proximo: 'Próximamente',
      play: 'Reproducir', pausa: 'Pausa', linea: 'Línea de tiempo', mudo: 'Silenciar', activar: 'Activar sonido', pantalla: 'Pantalla completa',
      sinAudio: 'El audio de este idioma aún no está disponible. Se reproduce solo el video.' },
    en: { titulo: 'Ready for liftoff.', elige: 'Choose the audio language', ver: 'Watch in', proximo: 'Coming soon',
      play: 'Play', pausa: 'Pause', linea: 'Timeline', mudo: 'Mute', activar: 'Unmute', pantalla: 'Fullscreen',
      sinAudio: 'Audio for this language is not available yet. Playing the video only.' },
  };

  const ICONOS = {
    web: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 9h-3.2a15 15 0 0 0-1.3-6A8 8 0 0 1 18.9 11zM12 4c.9 1.2 1.8 3.2 2 7H10c.2-3.800 1.100-5.800 2-7zM9.600 5A15 15 0 0 0 8.300 11H5.100A8 8 0 0 1 9.600 5zM5.100 13h3.200a15 15 0 0 0 1.300 6A8 8 0 0 1 5.100 13zM12 20c-.9-1.200-1.800-3.200-2-7h4c-.2 3.800-1.100 5.800-2 7zm2.400-1a15 15 0 0 0 1.300-6h3.200a8 8 0 0 1-4.500 6z"/>',
    linkedin: '<path d="M4.500 3A2 2 0 1 0 4.500 7 2 2 0 0 0 4.500 3zM3 9h3v12H3zM9 9h2.900v1.700h.1c.4-.8 1.400-1.900 3.200-1.900 3.400 0 4 2.200 4 5.100V21h-3v-6.200c0-1.500 0-3.300-2-3.300s-2.300 1.600-2.300 3.200V21H9z"/>',
    instagram: '<path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm5 3.500a4.500 4.500 0 1 1 0 9 4.500 4.500 0 0 1 0-9zm0 2a2.500 2.500 0 1 0 0 5 2.500 2.500 0 0 0 0-5zM17.500 5.800a1.100 1.100 0 1 1 0 2.200 1.100 1.100 0 0 1 0-2.200z"/>',
    youtube: '<path d="M21.600 7.200a2.600 2.600 0 0 0-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.4a2.600 2.600 0 0 0-1.800 1.800C2 8.800 2 12 2 12s0 3.200.4 4.800a2.600 2.600 0 0 0 1.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.600 2.600 0 0 0 1.800-1.800c.4-1.600.4-4.800.4-4.800s0-3.200-.4-4.800zM10 15V9l5.200 3z"/>',
    x: '<path d="M17.800 3h3.100l-6.800 7.700L22 21h-6.200l-4.900-6.300L5.300 21H2.200l7.300-8.300L2 3h6.400l4.400 5.800zm-1.100 16.200h1.700L7.400 4.700H5.600z"/>',
    tiktok: '<path d="M16.600 2h-3.200v13.300a2.800 2.800 0 1 1-2.800-2.800c.3 0 .6 0 .8.100V9.300a6 6 0 1 0 5.200 6V8.800a7.500 7.500 0 0 0 4.400 1.400V7a4.400 4.400 0 0 1-4.400-5z"/>',
    facebook: '<path d="M13.500 22v-8.200h2.800l.4-3.300h-3.200V8.400c0-.9.300-1.600 1.600-1.600h1.700V3.900A22 22 0 0 0 14.400 3.800c-2.400 0-4.100 1.500-4.100 4.200v2.500H7.500v3.300h2.800V22z"/>',
    mail: '<path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.500 2L12 12.500 19.500 7zM4 8.800V17h16V8.800l-8 5.800z"/>',
  };
  const svg = (p) => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;

  // ── estado ──
  let lang = null;                       // id del idioma activo
  let audio = null;                      // <audio> del idioma activo (o null)
  const disponible = {};                 // id → true/false (¿existe el archivo?)
  let duracion = 0, jugando = false, iniciado = false, mudo = false, arrastrando = false;
  let ocultoTimer = 0;

  const L = (id) => C.idiomas.find((x) => x.id === id);
  const t = (k) => (TXT[lang || C.idiomaInicial] || TXT.es)[k] || '';
  const fmt = (s) => { s = Math.max(0, s | 0); return `${(s / 60) | 0}:${String(s % 60).padStart(2, '0')}`; };

  // ── video: 720p en pantallas chicas o conexión lenta ──
  function elegirVideo() {
    const net = navigator.connection || {};
    const lenta = net.saveData || /(^|-)2g|3g/.test(net.effectiveType || '');
    const chica = Math.min(screen.width, screen.height) <= 820 && window.devicePixelRatio <= 3;
    return (lenta || chica) ? C.video.baja : C.video.alta;
  }
  video.src = elegirVideo();
  $('poster').src = C.video.poster; video.poster = C.video.poster;
  video.addEventListener('loadedmetadata', () => { duracion = video.duration; pintar(); });

  // ── idiomas ──
  async function existe(url) {
    try {
      const r = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
      const tipo = r.headers.get('content-type') || '';
      return r.ok && !/text\/html/.test(tipo);
    } catch { return false; }
  }

  function textos() {
    document.documentElement.lang = lang || C.idiomaInicial;
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    document.querySelectorAll('[data-t-aria]').forEach((el) => {
      const k = el.dataset.tAria;
      el.setAttribute('aria-label', k === 'play' ? t(jugando ? 'pausa' : 'play') : k === 'mudo' ? t(mudo ? 'activar' : 'mudo') : t(k));
    });
    const cta = C.cta && C.cta[lang || C.idiomaInicial];
    const a = $('cta');
    if (cta && cta.url) { a.href = cta.url; $('ctaTexto').textContent = cta.texto; a.hidden = false; } else a.hidden = true;
  }

  function pintarIdiomas() {
    const barra = $('idiomas'), inicio = $('inicioIdiomas');
    barra.innerHTML = inicio.innerHTML = '';
    for (const l of C.idiomas) {
      const ok = disponible[l.id] !== false;
      const b = document.createElement('button');
      b.textContent = l.etiqueta; b.title = l.nombre; b.disabled = !ok; b.setAttribute('aria-pressed', String(l.id === lang));
      b.addEventListener('click', () => cambiarIdioma(l.id));
      barra.appendChild(b);

      const g = document.createElement('button');
      g.className = 'btn-idioma'; g.disabled = !ok;
      g.innerHTML = ok ? `<svg viewBox="0 0 24 24"><path d="M8 5.500v13l11-6.500z"/></svg><span>${l.nombre}</span>`
                       : `<span>${l.nombre}</span><small>${t('proximo')}</small>`;
      g.addEventListener('click', () => empezar(l.id));
      inicio.appendChild(g);
    }
    // Si no hay audio en ningún idioma, el botón de entrada reproduce el video solo.
    if (!C.idiomas.some((l) => disponible[l.id])) {
      const g = document.createElement('button');
      g.className = 'btn-idioma'; g.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5.500v13l11-6.500z"/></svg><span>${t('play')}</span>`;
      g.addEventListener('click', () => empezar(C.idiomaInicial));
      inicio.innerHTML = ''; inicio.appendChild(g);
    }
  }

  function cargarAudio(id) {
    const l = L(id);
    if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); audio = null; }
    if (!disponible[id]) return;
    audio = new Audio(l.audio);
    audio.preload = 'auto'; audio.muted = mudo;
    audio.addEventListener('ended', reiniciar);
  }

  // posición de la película (segundos) según el reloj maestro
  const pos = () => (audio ? Math.max(0, audio.currentTime - (L(lang).desfase || 0)) : video.currentTime);
  function mover(s) {
    s = Math.min(Math.max(0, s), Math.max(0, duracion - 0.05));
    video.currentTime = s;
    if (audio) audio.currentTime = s + (L(lang).desfase || 0);
  }

  async function reproducir() {
    jugando = true; app.dataset.pausa = '0';
    try {
      const ps = [video.play()];
      if (audio) ps.push(audio.play());
      await Promise.all(ps);
    } catch (e) {
      if (audio && e && e.name === 'NotAllowedError') { audio.muted = true; mudo = true; app.dataset.mudo = '1'; try { await Promise.all([video.play(), audio.play()]); } catch {} }
    }
    textos(); armarOcultar();
  }
  function pausar() { jugando = false; app.dataset.pausa = '1'; video.pause(); if (audio) audio.pause(); textos(); mostrarBarra(); }
  function alternar() { if (!iniciado) return; (jugando ? pausar : reproducir)(); destello(); }
  function reiniciar() { mover(0); if (jugando) reproducir(); }

  async function empezar(id) {
    iniciado = true; app.dataset.estado = 'reproduciendo';
    lang = id; cargarAudio(id); textos(); pintarIdiomas();
    mover(0); await reproducir();
  }

  async function cambiarIdioma(id) {
    if (id === lang) return;
    const s = pos(), estaba = jugando;
    lang = id; cargarAudio(id); textos(); pintarIdiomas();
    if (!iniciado) return;
    if (audio) {
      await new Promise((ok) => { if (audio.readyState >= 1) ok(); else audio.addEventListener('loadedmetadata', ok, { once: true }); setTimeout(ok, 2500); });
    }
    mover(s);
    if (estaba) reproducir();
  }

  // ── sincronía: el video persigue al audio ──
  function sincronizar() {
    if (jugando && audio && !audio.paused && !video.seeking) {
      const d = video.currentTime - pos();
      if (Math.abs(d) > 0.15) { video.currentTime = pos(); video.playbackRate = 1; }
      else if (Math.abs(d) > 0.03) video.playbackRate = d > 0 ? 0.97 : 1.03;
      else video.playbackRate = 1;
    }
    // bucle: al terminar el video (o el audio) vuelve a empezar
    if (jugando && duracion && (video.ended || pos() >= duracion - 0.04)) reiniciar();
  }
  setInterval(sincronizar, 120);
  video.addEventListener('ended', () => { if (jugando && !audio) reiniciar(); });
  // si el video se traba por la red, el audio espera
  video.addEventListener('waiting', () => { if (jugando && audio) audio.pause(); });
  video.addEventListener('playing', () => { if (jugando && audio && audio.paused) audio.play().catch(() => {}); });

  // ── línea de tiempo ──
  function pintar() {
    const p = duracion ? Math.min(1, pos() / duracion) : 0;
    if (!arrastrando) rango.value = Math.round(p * 1000);
    avance.style.width = `${p * 100}%`;
    tiempo.textContent = `${fmt(pos())} / ${fmt(duracion)}`;
    requestAnimationFrame(pintar);
  }
  rango.addEventListener('input', () => { arrastrando = true; if (duracion) { const p = rango.value / 1000; avance.style.width = `${p * 100}%`; mover(p * duracion); } });
  rango.addEventListener('change', () => { arrastrando = false; });
  rango.addEventListener('pointerup', () => { arrastrando = false; });

  // ── controles ──
  $('bPlay').addEventListener('click', alternar);
  $('toque').addEventListener('click', (e) => { alternar(); e.currentTarget.blur(); });
  $('bMudo').addEventListener('click', () => {
    mudo = !mudo; app.dataset.mudo = mudo ? '1' : '0';
    if (audio) audio.muted = mudo;
    textos();
  });

  const pc = app.requestFullscreen ? () => app.requestFullscreen() : app.webkitRequestFullscreen ? () => app.webkitRequestFullscreen() : null;
  const salirPc = () => (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  const enPc = () => document.fullscreenElement || document.webkitFullscreenElement;
  if (!pc) $('bPantalla').hidden = true;
  $('bPantalla').addEventListener('click', () => (enPc() ? salirPc() : pc()));
  ['fullscreenchange', 'webkitfullscreenchange'].forEach((n) => document.addEventListener(n, () => { mostrarBarra(); armarOcultar(); }));

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'BUTTON' && e.code === 'Space') return;
    if (e.target === rango && /Arrow/.test(e.key)) return;
    if (e.code === 'Space' || e.key === 'k') { e.preventDefault(); alternar(); }
    else if (e.key === 'ArrowRight') mover(pos() + 5);
    else if (e.key === 'ArrowLeft') mover(pos() - 5);
    else if (e.key === 'm') $('bMudo').click();
    else if (e.key === 'f' && pc) $('bPantalla').click();
  });

  // barra: se esconde sola solo en pantalla completa mientras se reproduce
  function mostrarBarra() { app.classList.remove('ocultar'); clearTimeout(ocultoTimer); }
  function armarOcultar() { clearTimeout(ocultoTimer); if (enPc() && jugando) ocultoTimer = setTimeout(() => app.classList.add('ocultar'), 3000); }
  ['pointermove', 'pointerdown', 'keydown'].forEach((n) => window.addEventListener(n, () => { mostrarBarra(); armarOcultar(); }, { passive: true }));

  function destello() {
    const d = $('destello'); d.classList.remove('on'); void d.offsetWidth; d.classList.add('on');
  }

  // ── redes ──
  const nav = $('redes');
  for (const r of C.redes || []) {
    if (!r.url) continue;
    const a = document.createElement('a');
    a.href = r.url; a.target = r.url.startsWith('mailto:') ? '_self' : '_blank'; a.rel = 'noopener'; a.title = a.ariaLabel = r.nombre;
    a.innerHTML = svg(ICONOS[r.icono] || ICONOS.web);
    nav.appendChild(a);
  }

  // ── arranque ──
  app.dataset.pausa = '1'; app.dataset.mudo = '0';
  lang = C.idiomaInicial; textos();
  Promise.all(C.idiomas.map(async (l) => { disponible[l.id] = await existe(l.audio); })).then(() => {
    if (!disponible[lang]) lang = (C.idiomas.find((l) => disponible[l.id]) || L(lang)).id;
    textos(); pintarIdiomas();
    const na = $('notaAudio');
    if (!C.idiomas.some((l) => disponible[l.id])) { na.hidden = false; na.textContent = t('sinAudio'); }
  });
  pintar();
})();
