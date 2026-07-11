// Skins (disfraces) que se pueden elegir para el luchador, además de la
// camiseta del club por defecto. "body" indica qué función de dibujo usar
// (ver characters.js) y "params" son los datos que esa función necesita.

const SKINS = [
  { id: 'default', name: 'Camiseta del club', emoji: '⚽' },

  { id: 'oso', name: 'Oso', emoji: '🐻', body: 'onesie', params: { color: '#8a5a3b', earColor: '#6b4226', earStyle: 'round', snout: true } },
  { id: 'conejo', name: 'Conejo', emoji: '🐰', body: 'onesie', params: { color: '#f5f0e6', earColor: '#ffb6c8', earStyle: 'long' } },
  { id: 'gato', name: 'Gato', emoji: '🐱', body: 'onesie', params: { color: '#e8983c', earColor: '#c9752a', earStyle: 'pointy', whiskers: true } },
  { id: 'perro', name: 'Perro', emoji: '🐶', body: 'onesie', params: { color: '#d9b98a', earColor: '#a9825a', earStyle: 'floppy' } },
  { id: 'vaca', name: 'Vaca', emoji: '🐮', body: 'onesie', params: { color: '#f5f0e6', earColor: '#f5f0e6', earStyle: 'round', spots: true, horns: true } },
  { id: 'tigre', name: 'Tigre', emoji: '🐯', body: 'onesie', params: { color: '#e8832c', earColor: '#3a2410', earStyle: 'round', stripes: true } },
  { id: 'panda', name: 'Panda', emoji: '🐼', body: 'onesie', params: { color: '#f5f5f5', earColor: '#222222', earStyle: 'round', pandaPatch: true } },
  { id: 'dino', name: 'Dinosaurio', emoji: '🦖', body: 'onesie', params: { color: '#5cb85c', spikes: true } },
  { id: 'unicornio', name: 'Unicornio', emoji: '🦄', body: 'onesie', params: { color: '#f3e6fb', earColor: '#f3e6fb', earStyle: 'round', horn: true, mane: true } },
  { id: 'pinguino', name: 'Pingüino', emoji: '🐧', body: 'onesie', params: { color: '#1c1c1c', beak: true } },

  { id: 'heroeRojo', name: 'Héroe Rojo', emoji: '🦸', body: 'hero', params: { suit: '#d9302f', emblem: '#ffd200', cape: '#a3221f' } },
  { id: 'heroeAzul', name: 'Héroe Azul', emoji: '🦸‍♂️', body: 'hero', params: { suit: '#2255cc', emblem: '#ffffff', cape: '#173e99' } },
  { id: 'heroeVerde', name: 'Héroe Verde', emoji: '🦹', body: 'hero', params: { suit: '#2e9e4f', emblem: '#ffd200', cape: '#1f7038' } },
  { id: 'heroeDorado', name: 'Héroe Dorado', emoji: '⭐', body: 'hero', params: { suit: '#e8b923', emblem: '#7a3b00', cape: '#a37417' } },

  { id: 'astronauta', name: 'Astronauta', emoji: '🧑‍🚀', body: 'astro' },
  { id: 'robot', name: 'Robot', emoji: '🤖', body: 'robot' },
  { id: 'arbitro', name: 'Árbitro', emoji: '🧑‍⚖️', body: 'referee' },
  { id: 'boxeador', name: 'Boxeador', emoji: '🥊', body: 'boxer' },
  { id: 'karateka', name: 'Karateka', emoji: '🥋', body: 'karate' },
  { id: 'banana', name: 'Banana', emoji: '🍌', body: 'banana' },
];

function getSkin(skinId) {
  return SKINS.find((s) => s.id === skinId) || SKINS[0];
}
