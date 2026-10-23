# NAVE · película en vivo

Sitio estático (sin build). La película **se dibuja en vivo** en un canvas con el motor de `motor/` (el mismo de la película de marca) y va en sincronía con la locución. No hay archivo de video.

- El **audio manda**: la imagen se calcula a partir del tiempo del audio, así que pausar, saltar o cambiar de idioma siempre dejan el cuadro exacto.
- Idioma ES/EN: se cambia en cualquier momento sin perder la posición.
- Al terminar vuelve a empezar solo.
- Pausa, línea de tiempo, silencio, pantalla completa. Teclado: `Espacio`, `←`/`→` ±5 s, `M`, `F`.
- Responsive: el lienzo 16:9 se dibuja a la resolución real de cada pantalla (hasta 2560 px, máximo 2× de densidad). Celular vertical, horizontal, tableta y escritorio.
- Respeta «reducir movimiento» del sistema.
- Se arranca con un toque porque los navegadores no permiten audio automático.
- Tipografías: Inter Tight y JetBrains Mono (Google Fonts).

## Qué editar

- `config.js`: audios, texto y enlace del CTA (por idioma) y redes. Los enlaces que trae son de relleno (`example.com`).
- `motor/pelicula.js`: `INICIOS` es el segundo en que empieza cada escena. Se ajustaron a la locución en español de 124,6 s. Si cambia la locución, mueve esos segundos (y `DURACION`).
- `motor/motor.js`: contenido y dibujo de cada escena (copia del motor de la película de marca).

## Audio

`audio/es.m4a` y `audio/en.m4a`, ver `audio/LEEME.md`. Si un idioma no tiene archivo, su botón sale desactivado. El inglés debe dura​r lo mismo que el español para que las escenas caigan igual; si dura distinto, ajusta `INICIOS` o pásame el audio y lo alineo.

```bash
ffmpeg -i narracion.wav -c:a aac -b:a 160k -movflags +faststart audio/es.m4a
```

## Probar en local

```bash
npx http-server -p 8080     # necesita Range; python -m http.server no sirve para el audio
```

## Vercel

Sin comando de build; el sitio vive en la raíz. Cada push a `main` redespliega.
