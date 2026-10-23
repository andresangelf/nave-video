# NAVE · sitio de la película

Sitio estático (sin build) que reproduce la película de marca en sincronía con la locución.

- Video y audio van por separado: el **audio manda** y el video se corrige solo si se desfasa (más de 0,03 s lo ajusta suavemente; más de 0,15 s salta).
- Idioma ES/EN: se cambia en cualquier momento sin perder la posición.
- Al terminar vuelve a empezar solo.
- Pausa, línea de tiempo, silencio, pantalla completa. Teclado: `Espacio` pausa, `←`/`→` ±5 s, `M` silencio, `F` pantalla completa.
- Responsive: celular vertical (video arriba y controles debajo), celular horizontal, tableta y escritorio. En pantallas chicas o con ahorro de datos usa el video de 720p.
- Se arranca con un toque porque los navegadores no permiten audio automático.

## Qué editar

Todo está en `config.js`: audios, texto y enlace del botón CTA (por idioma) y redes sociales. Los enlaces que trae son de relleno (`example.com`); cámbialos antes de publicar.

## Archivos

| Ruta | Contenido |
|---|---|
| `media/nave-1080.mp4` | 1920×1080, 25 fps, 9 MB |
| `media/nave-720.mp4` | 1280×720, 25 fps, 5 MB |
| `media/poster.jpg` | Imagen de portada y vista previa al compartir |
| `audio/es.m4a`, `audio/en.m4a` | Locuciones (ver `audio/LEEME.md`) |

El video sale de `SYSTEM_COMPP.mp4` (1080p, 25 fps, 124,6 s) y el audio del WAV de narración y música. El video del sitio va sin sonido; el audio va aparte para poder cambiar de idioma:

```bash
ffmpeg -i narracion.wav -c:a aac -b:a 160k -movflags +faststart audio/es.m4a
ffmpeg -i SYSTEM_COMPP.mp4 -an -c:v libx264 -crf 24 -pix_fmt yuv420p -movflags +faststart -g 50 media/nave-1080.mp4
ffmpeg -i SYSTEM_COMPP.mp4 -an -vf scale=1280:720:flags=lanczos -c:v libx264 -crf 25 -pix_fmt yuv420p -movflags +faststart -g 50 media/nave-720.mp4
```

El audio en inglés debe durar lo mismo y alinearse igual (`audio/en.m4a`).

## Probar en local

```bash
cd sitio && npx http-server -p 8080     # necesita un servidor con soporte de Range
```

(`python3 -m http.server` no sirve para probar el audio: no soporta Range y el navegador no puede saltar en el audio.)

## Vercel

Sin comando de build. En `nave-video` el sitio vive en la raíz del repo.
