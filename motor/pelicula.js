// NAVE · película en vivo
// Mismo motor de la película de marca; las escenas se ajustaron a la duración de cada tramo
// de la locución (124,6 s). INICIOS = segundo en que empieza cada entrada de ESCENAS.

import { crearMotor, ESCENAS, W, H } from './motor.js';

export { W, H };
export const BPM = 100;
export const DURACION = 124.6;
export const INICIOS = [0, 9.35, 16.6, 24, 44.45, 52.4, 60.6, 69.7, 79.05, 91.75, 96.3, 101.2, 108.9, 116.45];

export function crearPelicula() {
  const spb = 60 / BPM;
  const escenas = ESCENAS.map((e, i) => ({ ...e, beats: ((INICIOS[i + 1] ?? DURACION) - INICIOS[i]) / spb }));
  return crearMotor({ bpm: BPM, escenas });
}
