class PlayerSelectScene extends Phaser.Scene {
  constructor() {
    super('PlayerSelect');
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1030, 0x0a1030, 0x162a5c, 0x1a1040, 1);
    bg.fillRect(0, 0, width, height);
    for (let i = 0; i < 5; i++) {
      bg.fillStyle(0xffffff, 0.02);
      bg.fillCircle(60 + i * 160, 40 + (i % 2) * 380, 90);
    }

    this.add.text(width / 2, 34, 'MOCHILA WARS', {
      fontSize: '32px',
      fontFamily: 'Arial Black',
      color: '#ffd200',
      stroke: '#7a3b00',
      strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(width / 2, 66, 'Elegí tu luchador y defendé tu mochila', {
      fontSize: '15px',
      color: '#c7d2f0',
    }).setOrigin(0.5);

    const cols = 4;
    const cellW = 172;
    const cellH = 132;
    const cardW = 156;
    const cardH = 120;
    const startX = width / 2 - ((cols - 1) * cellW) / 2;
    const startY = 148;

    PLAYERS.forEach((p, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * cellW;
      const y = startY + row * cellH;
      const club = CLUBS[p.club];

      const shadow = this.add.graphics();
      shadow.fillStyle(0x000000, 0.35);
      shadow.fillRoundedRect(x - cardW / 2 + 3, y - cardH / 2 + 5, cardW, cardH, 12);

      const card = this.add.graphics();
      const drawCard = (borderColor, borderWidth) => {
        card.clear();
        card.fillGradientStyle(0x1c2a5e, 0x1c2a5e, 0x111b3f, 0x111b3f, 1);
        card.fillRoundedRect(x - cardW / 2, y - cardH / 2, cardW, cardH, 12);
        card.fillStyle(club.primary, 0.85);
        card.fillRoundedRect(x - cardW / 2, y - cardH / 2, cardW, 8, { tl: 12, tr: 12, bl: 0, br: 0 });
        card.lineStyle(borderWidth, borderColor, 1);
        card.strokeRoundedRect(x - cardW / 2, y - cardH / 2, cardW, cardH, 12);
      };
      drawCard(0x33427a, 2);

      const portraitBaseY = y - 10;
      const portrait = this.add.image(x, portraitBaseY, charTextureKey('portrait', p)).setScale(0.42);
      const label = this.add.text(x, y + cardH / 2 - 22, p.name, {
        fontSize: '16px',
        fontFamily: 'Arial Black',
        color: '#ffffff',
      }).setOrigin(0.5);

      const zone = this.add.zone(x, y, cardW, cardH).setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => {
        drawCard(0xffd200, 3);
        this.tweens.add({ targets: portrait, y: portraitBaseY - 4, duration: 120, ease: 'Quad.easeOut' });
      });
      zone.on('pointerout', () => {
        drawCard(0x33427a, 2);
        this.tweens.add({ targets: portrait, y: portraitBaseY, duration: 120, ease: 'Quad.easeOut' });
      });
      zone.on('pointerdown', () => {
        AUDIO.ensureCtx();
        this.scene.start('SkinSelect', { championId: p.id });
      });
    });
  }
}
