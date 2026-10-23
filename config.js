// NAVE · sitio de la película · configuración
// Aquí se cambia todo lo que no es código: audios, botón CTA y redes.

window.NAVE_CONFIG = {
  titulo: 'NAVE · Tech Company & Venture Builder',

  // Video sin audio. Se elige 720p en pantallas chicas o conexiones lentas.
  video: {
    alta: 'media/nave-1080.mp4',
    baja: 'media/nave-720.mp4',
    poster: 'media/poster.jpg',
  },

  // Un audio por idioma. Si el archivo no existe, el botón de ese idioma queda desactivado.
  // `desfase` (segundos) mueve el audio respecto al video si hiciera falta afinar la sincronía.
  idiomas: [
    { id: 'es', etiqueta: 'ES', nombre: 'Español', audio: 'audio/es.m4a', desfase: 0 },
    { id: 'en', etiqueta: 'EN', nombre: 'English', audio: 'audio/en.m4a', desfase: 0 },
  ],
  idiomaInicial: 'es',

  // Botón de llamada a la acción. Deja `url` vacío para ocultarlo.
  // TODO: reemplazar por el enlace real (agenda, formulario, correo…).
  cta: {
    es: { texto: 'Hablemos', url: 'https://example.com/hablemos' },
    en: { texto: "Let's talk", url: 'https://example.com/talk' },
  },

  // Redes. Las que tengan `url` vacío no se muestran.
  // Íconos disponibles: web, linkedin, instagram, youtube, x, tiktok, facebook, mail.
  // TODO: reemplazar por las cuentas reales.
  redes: [
    { icono: 'web', nombre: 'Sitio web', url: 'https://example.com' },
    { icono: 'linkedin', nombre: 'LinkedIn', url: 'https://example.com/linkedin' },
    { icono: 'instagram', nombre: 'Instagram', url: 'https://example.com/instagram' },
    { icono: 'youtube', nombre: 'YouTube', url: 'https://example.com/youtube' },
  ],
};
