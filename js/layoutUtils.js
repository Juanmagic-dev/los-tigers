// Grilla responsiva compartida por PlayerSelectScene y SkinSelectScene:
// calcula columnas/tamaño de celda según el ancho/alto reales de la escena,
// para que se vea bien tanto apaisado como en vertical (celular/iPad).
function computeResponsiveGrid(width, height, itemCount, opts = {}) {
  const marginX = opts.marginX ?? 30;
  const topY = opts.topY ?? 140;
  const bottomY = opts.bottomY ?? 40;
  const minCols = opts.minCols ?? 2;
  const maxCols = opts.maxCols ?? 5;

  const isPortrait = height > width;
  let cols = isPortrait ? 3 : 4;
  cols = Math.max(minCols, Math.min(maxCols, cols, itemCount));
  const rows = Math.ceil(itemCount / cols);

  const availW = width - marginX * 2;
  const availH = Math.max(height - topY - bottomY, 100);
  const cellW = availW / cols;
  const cellH = availH / rows;
  const startX = width / 2 - ((cols - 1) * cellW) / 2;
  const startY = topY + cellH / 2;

  return { cols, rows, cellW, cellH, startX, startY };
}

// Redimensiona el canvas del juego para que ocupe toda la pantalla real
// (en vez de quedar encerrado en el recuadro fijo de 720x480 de la pelea).
// Usamos setGameSize (no resize) porque también actualiza el aspectRatio
// "base" que usa el modo FIT internamente — con resize() a secas, Phaser
// seguía calculando el tamaño de display con el aspecto viejo (720:480) y
// el contenido se veía achicado/apretado en el medio del canvas.
function resizeToViewport(scene) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  scene.scale.setGameSize(w, h);
  const canvas = scene.sys.game.canvas;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.style.margin = '0';
  canvas.style.position = 'static';
  canvas.style.top = '';
  canvas.style.left = '';
}

// Vuelve al tamaño fijo que necesita la pelea (posiciones/física hardcodeadas),
// centrado y con barras si el dispositivo no tiene esa proporción.
function resizeToFightSize(scene) {
  scene.scale.setGameSize(720, 480);
  const canvas = scene.sys.game.canvas;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const factor = Math.min(vw / 720, vh / 480);
  canvas.style.width = Math.round(720 * factor) + 'px';
  canvas.style.height = Math.round(480 * factor) + 'px';
  canvas.style.margin = '0';
  canvas.style.position = 'static';
  canvas.style.top = '';
  canvas.style.left = '';
}

// Botón "← Volver" arriba a la izquierda, igual en todas las pantallas
// de selección para poder retroceder un paso siempre.
function buildBackButton(scene, onClick) {
  const w = 96, h = 36, x = 14, y = 14;
  const bg = scene.add.graphics().setDepth(19);
  const paint = (fill, fillA, stroke) => {
    bg.clear();
    bg.fillStyle(fill, fillA);
    bg.fillRoundedRect(x, y, w, h, 9);
    bg.lineStyle(2, stroke, 1);
    bg.strokeRoundedRect(x, y, w, h, 9);
  };
  paint(0x333355, 0.9, 0x5a6ac0);

  scene.add.text(x + w / 2, y + h / 2, '← Volver', {
    fontSize: '13px', fontFamily: 'Arial Black', color: '#ffffff',
  }).setOrigin(0.5).setDepth(20);

  const zone = scene.add.zone(x + w / 2, y + h / 2, w, h).setInteractive({ useHandCursor: true }).setDepth(20);
  zone.on('pointerover', () => paint(0x4a4a7a, 1, 0xffd200));
  zone.on('pointerout', () => paint(0x333355, 0.9, 0x5a6ac0));
  zone.on('pointerdown', () => {
    if (window.AUDIO) AUDIO.ensureCtx();
    onClick();
  });
}
