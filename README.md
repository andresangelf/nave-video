# NAVE · película en vivo

Sitio estático (sin build). La película **se arma en vivo** en el navegador, no es un video. Son tres capas que se reacomodan a cada pantalla:

- **Fondo (canvas):** estrellas, retícula de puntos, el símbolo hecho de 1 018 puntos, el planeta y el lanzamiento. Cubre toda la pantalla.
- **Escenas (HTML real):** titulares, tableros, listas y marcadores son elementos con CSS (`motor/vivo.css`). En horizontal forman el escenario 16:9 de la película; en vertical (pantalla más alta que ancha) todo se **apila**: el lockup NAVE pasa a símbolo sobre letras, los tableros a una columna, los tres verbos a una pila, etc.
- **Barrido y HUD:** la trama que cambia de lámina, las cruces de registro, la bitácora del tramo y el altímetro.

Todo es función del tiempo del audio: pausar, saltar o cambiar de idioma siempre deja el cuadro exacto. `?t=SEGUNDOS` abre la película detenida en ese instante.

- Idioma ES/EN: se cambia en cualquier momento sin perder la posición.
- Al terminar vuelve a empezar solo.
- Interfaz mínima y flotante sobre la película: píldora de controles abajo (pausa, línea de tiempo, ES/EN, silencio, pantalla completa), y arriba a la derecha el botón de acción y un menú «···» con las redes. Los controles se esconden solos a los 3 s mientras se reproduce; al mover el cursor o tocar vuelven (en celular, el primer toque los muestra y el siguiente pausa). Teclado: `Espacio`, `←`/`→` ±5 s, `M`, `F`, `Esc`.
- Si el audio no carga, la película sigue con su propio reloj. Respeta «reducir movimiento».
- Se arranca con un toque porque los navegadores no permiten audio automático.
- Tipografías: Inter Tight y JetBrains Mono (Google Fonts).

## Qué editar

- `config.js`: audios, texto y enlace del CTA (por idioma) y redes. Los enlaces que trae son de relleno (`example.com`).
- `motor/pelicula.js`: `INICIOS` es el segundo en que empieza cada escena (el guion). Se ajustaron a la locución en español de 124,6 s. Si cambia la locución, mueve esos segundos (y `DURACION`).
- `motor/motor.js`: textos (`CONTENIDO`) y guion base (`ESCENAS`) de la película de marca. `motor/vivo.js` y `motor/vivo.css`: el motor por capas y el diseño responsive.

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
