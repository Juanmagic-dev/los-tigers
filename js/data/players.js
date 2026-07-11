// Paleta de colores por club (sin escudos oficiales, solo colores)
const CLUBS = {
  boca: { name: 'Boca Juniors', primary: 0x0a1a52, secondary: 0xffd200, hband: true },
  sanlorenzo: { name: 'San Lorenzo', primary: 0xc8102e, secondary: 0x00205b, stripes: true },
  river: { name: 'River Plate', primary: 0xffffff, secondary: 0xd0102a, diagonal: true },
  racing: { name: 'Racing Club', primary: 0x87ceeb, secondary: 0xffffff, stripes: true },
  independiente: { name: 'Independiente', primary: 0xc8102e, secondary: 0xffffff, solid: true },
};

const HAIR = {
  rubioLacio: { color: 0xe0a428, style: 'lacio' },
  rubio: { color: 0xe0a428, style: 'corto' },
  oscuroDespeinado: { color: 0x3b2a1a, style: 'despeinado' },
  rulos: { color: 0x2b1c12, style: 'rulos' },
  oscuroLacio: { color: 0x2b1c12, style: 'lacio' },
  oscuroCorto: { color: 0x2b1c12, style: 'corto' },
  elvis: { color: 0x1a1108, style: 'elvis' },
  oscuroLargo: { color: 0x2b1c12, style: 'largo' },
  rubioLargo: { color: 0xe0a428, style: 'largo' },
};

const PLAYERS = [
  { id: 'bauti', name: 'Bauti', club: 'boca', hair: HAIR.rubioLacio, eyes: 0x4a3728, build: 'normal', number: 1, weapon: 'regla' },
  { id: 'fede', name: 'Fede', club: 'sanlorenzo', hair: HAIR.oscuroDespeinado, eyes: 0x3a7bd5, build: 'normal', number: 2, weapon: 'tijeras' },
  { id: 'maxi', name: 'Maxi', club: 'river', hair: HAIR.rulos, eyes: 0x4a3728, build: 'grande', number: 3, weapon: 'compas' },
  { id: 'rami', name: 'Rami', club: 'racing', hair: HAIR.rubioLacio, eyes: 0x4a3728, build: 'normal', number: 4, weapon: 'lapiz' },
  { id: 'balta', name: 'Balta', club: 'river', hair: HAIR.rubioLacio, eyes: 0x4a3728, build: 'normal', number: 5, weapon: 'escuadra' },
  { id: 'manu', name: 'Manu', club: 'boca', hair: HAIR.oscuroLacio, eyes: 0x4a3728, build: 'bajito', number: 6, weapon: 'sacapuntas' },
  { id: 'santi', name: 'Santi', club: 'boca', hair: HAIR.oscuroCorto, eyes: 0x4a3728, build: 'normal', number: 7, weapon: 'birome' },
  { id: 'fran', name: 'Fran', club: 'boca', hair: HAIR.elvis, eyes: 0x4a3728, build: 'normal', number: 8, weapon: 'marcador' },
  { id: 'felix', name: 'Felix', club: 'river', hair: HAIR.oscuroCorto, eyes: 0x4a3728, build: 'bajito', number: 9, weapon: 'goma' },
  { id: 'joaco', name: 'Joaco', club: 'boca', hair: HAIR.rubioLacio, eyes: 0x4a3728, build: 'grande', number: 10, weapon: 'cartuchera' },
  { id: 'pedro', name: 'Pedro', club: 'independiente', hair: HAIR.oscuroCorto, eyes: 0x4a3728, build: 'normal', number: 11, weapon: 'corrector' },
  { id: 'tomy', name: 'Tomy', club: 'river', hair: HAIR.oscuroCorto, eyes: 0x4a3728, build: 'bajito', number: 12, weapon: 'transportador' },
];
