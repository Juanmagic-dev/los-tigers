class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  init(data) {
    this.meData = data.me;
    this.rivalData = data.rival;
  }

  create() {
    const { width, height } = this.scale;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x3a0a0a, 0x3a0a0a, 0x120404, 0x120404, 1);
    bg.fillRect(0, 0, width, height);

    this.add.image(width / 2, height / 2 - 90, `portrait_${this.rivalData.id}`).setScale(1.1);
    this.add.text(width / 2, height / 2 + 20, 'GAME OVER', {
      fontSize: '34px', fontFamily: 'Arial Black', color: '#ff5050', stroke: '#3a0000', strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 56, `${this.rivalData.name} te ganó la pelea`, {
      fontSize: '15px', color: '#ffcccc',
    }).setOrigin(0.5);

    const retryBtn = this.add.text(width / 2 - 90, height / 2 + 110, 'Reintentar', {
      fontSize: '17px', color: '#001a33', backgroundColor: '#ffd200', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    retryBtn.on('pointerdown', () => {
      this.scene.start('Fight', { me: this.meData, rival: this.rivalData });
    });

    const backBtn = this.add.text(width / 2 + 90, height / 2 + 110, 'Elegir de nuevo', {
      fontSize: '17px', color: '#ffffff', backgroundColor: '#333355', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
      this.registry.remove('ladder');
      this.registry.remove('championId');
      this.scene.start('PlayerSelect');
    });
  }
}
