class SkinSelectScene extends Phaser.Scene {
  constructor() {
    super('SkinSelect');
  }

  init(data) {
    this.championId = data.championId;
    this.champion = PLAYERS.find((p) => p.id === this.championId);
  }

  create() {
    resizeToViewport(this);
    const { width, height } = this.scale;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1030, 0x0a1030, 0x162a5c, 0x1a1040, 1);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, 22, `ELEGÍ EL SKIN DE ${this.champion.name.toUpperCase()}`, {
      fontSize: '20px', fontFamily: 'Arial Black', color: '#ffd200', stroke: '#7a3b00', strokeThickness: 4,
    }).setOrigin(0.5);

    buildBackButton(this, () => this.scene.start('PlayerSelect'));

    const { cols, cellW, cellH, startX, startY } = computeResponsiveGrid(width, height, SKINS.length, { topY: 90 });
    const cardW = cellW * 0.9;
    const cardH = cellH * 0.9;
    const previewTargetH = 200;

    SKINS.forEach((skin, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;
      const playerWithSkin = { ...this.champion, skin: skin.id };
      const key = generateSkinPreview(this, playerWithSkin, previewTargetH);
      const previewScale = (cardH * 0.74) / previewTargetH;

      const card = this.add.graphics();
      const paint = (fillColor, fillA, strokeColor) => {
        card.clear();
        card.fillStyle(fillColor, fillA);
        card.fillRoundedRect(x - cardW / 2, y - cardH / 2, cardW, cardH, 14);
        card.lineStyle(3, strokeColor, 1);
        card.strokeRoundedRect(x - cardW / 2, y - cardH / 2, cardW, cardH, 14);
      };
      paint(0x1c2a5e, 0.85, 0x33427a);

      this.add.image(x, y - cardH * 0.13, key).setScale(previewScale);
      this.add.text(x, y + cardH / 2 - 16, skin.name, {
        fontSize: '13px', fontFamily: 'Arial Black', color: '#ffffff', align: 'center', wordWrap: { width: cardW - 10 },
      }).setOrigin(0.5);
      this.add.text(x + cardW / 2 - 16, y - cardH / 2 + 16, skin.emoji, { fontSize: '18px' }).setOrigin(0.5);

      const zone = this.add.zone(x, y, cardW, cardH).setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => paint(0x2a3a7e, 0.95, 0xffd200));
      zone.on('pointerout', () => paint(0x1c2a5e, 0.85, 0x33427a));
      zone.on('pointerdown', () => {
        AUDIO.ensureCtx();
        this.scene.start('Ladder', { championId: this.championId, skinId: skin.id });
      });
    });

    this.add.text(width / 2, height - 12, 'Tocá un skin para continuar', {
      fontSize: '12px', color: 'rgba(255,255,255,0.7)',
    }).setOrigin(0.5);
  }
}
