// Skins (disfraces) que se pueden elegir para el luchador, además de la
// camiseta del club por defecto. "body" indica qué función de dibujo usar
// (ver characters.js) y "params" son los datos que esa función necesita.

const SKINS = [
  { id: 'default', name: 'Camiseta del club', emoji: '⚽' },

  { id: 'oso', name: 'Oso', emoji: '🐻', body: 'onesie', params: { color: '#8a5a3b', earColor: '#6b4226', earStyle: 'round', snout: true } },
  { id: 'gato', name: 'Gato', emoji: '🐱', body: 'onesie', params: { color: '#e8983c', earColor: '#c9752a', earStyle: 'pointy', whiskers: true } },
  { id: 'perro', name: 'Perro', emoji: '🐶', body: 'onesie', params: { color: '#d9b98a', earColor: '#a9825a', earStyle: 'floppy' } },
  { id: 'unicornio', name: 'Unicornio', emoji: '🦄', body: 'onesie', params: { color: '#f3e6fb', earColor: '#f3e6fb', earStyle: 'round', horn: true, mane: true } },
  { id: 'dino', name: 'Dinosaurio', emoji: '🦖', body: 'onesie', params: { color: '#5cb85c', spikes: true } },
  { id: 'pinguino', name: 'Pingüino', emoji: '🐧', body: 'onesie', params: { color: '#1c1c1c', beak: true } },

  { id: 'heroeRojo', name: 'Héroe Rojo', emoji: '🦸', body: 'hero', params: { suit: '#d9302f', emblem: '#ffd200', cape: '#a3221f' } },
  { id: 'heroeAzul', name: 'Héroe Azul', emoji: '🦸‍♂️', body: 'hero', params: { suit: '#2255cc', emblem: '#ffffff', cape: '#173e99' } },

  { id: 'astronauta', name: 'Astronauta', emoji: '🧑‍🚀', body: 'astro' },
  { id: 'robot', name: 'Robot', emoji: '🤖', body: 'robot' },
  { id: 'boxeador', name: 'Boxeador', emoji: '🥊', body: 'boxer' },
];

function getSkin(skinId) {
  return SKINS.find((s) => s.id === skinId) || SKINS[0];
}
