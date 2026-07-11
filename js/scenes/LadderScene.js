class LadderScene extends Phaser.Scene {
  constructor() {
    super('Ladder');
  }

  init(data) {
    if (data && data.championId) {
      this.ladder = buildLadder(PLAYERS, data.championId);
      this.registry.set('ladder', this.ladder);
      this.registry.set('championId', data.championId);
      this.registry.set('skinId', data.skinId || 'default');
    } else {
      this.ladder = this.registry.get('ladder');
    }
    const base = PLAYERS.find((p) => p.id === this.registry.get('championId'));
    this.champion = { ...base, skin: this.registry.get('skinId') || 'default' };
  }

  create() {
    const { width, height } = this.scale;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1030, 0x0a1030, 0x162a5c, 0x1a1040, 1);
    bg.fillRect(0, 0, width, height);

    generatePortrait(this, this.champion, 220);
    generateBody(this, this.champion, 380);

    if (isLadderComplete(this.ladder)) {
      this.showChampion();
      return;
    }

    const opponent = currentOpponent(this.ladder);
    const fightNum = this.ladder.index + 1;
    const total = this.ladder.opponents.length;

    this.add.text(width / 2, 36, `PELEA ${fightNum} DE ${total}`, {
      fontSize: '24px', fontFamily: 'Arial Black', color: '#ffd200', stroke: '#7a3b00', strokeThickness: 5,
    }).setOrigin(0.5);

    const midY = height / 2 - 20;
    this.add.image(width * 0.28, midY, charTextureKey('portrait', this.champion)).setScale(0.75);
    this.add.text(width * 0.28, midY + 130, this.champion.name, { fontSize: '20px', fontFamily: 'Arial Black', color: '#ffffff' }).setOrigin(0.5);

    this.add.text(width / 2, midY + 20, 'VS', { fontSize: '36px', fontFamily: 'Arial Black', color: '#ff5050' }).setOrigin(0.5);

    this.add.image(width * 0.72, midY, charTextureKey('portrait', opponent)).setScale(0.75);
    this.add.text(width * 0.72, midY + 130, opponent.name, { fontSize: '20px', fontFamily: 'Arial Black', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(width * 0.72, midY + 150, CLUBS[opponent.club].name, { fontSize: '12px', color: '#9fb0d8' }).setOrigin(0.5);

    const btn = this.add.text(width / 2, height - 46, '¡PELEAR!', {
      fontSize: '24px', fontFamily: 'Arial Black', color: '#1a0a00', backgroundColor: '#ffd200', padding: { x: 22, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      AUDIO.ensureCtx();
      this.scene.start('Fight', { me: this.champion, rival: opponent });
    });
  }

  showChampion() {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2 - 70, charTextureKey('portrait', this.champion)).setScale(1.5);
    this.add.text(width / 2, height / 2 + 70, `¡${this.champion.name.toUpperCase()} ES EL CAMPEÓN!`, {
      fontSize: '24px', fontFamily: 'Arial Black', color: '#ffd200', stroke: '#7a3b00', strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 100, 'Venció a los 11 rivales', { fontSize: '14px', color: '#c7d2f0' }).setOrigin(0.5);

    const btn = this.add.text(width / 2, height / 2 + 150, 'Jugar de nuevo', {
      fontSize: '18px', color: '#001a33', backgroundColor: '#ffffff', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      this.registry.remove('ladder');
      this.registry.remove('championId');
      this.registry.remove('skinId');
      this.scene.start('PlayerSelect');
    });
  }
}
