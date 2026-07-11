class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    PLAYERS.forEach((p) => {
      generatePortrait(this, p, 220);
      generateBody(this, p, 380);
    });
    generateFireballTexture(this);
    generateFistTexture(this);
    generateShoeTexture(this);
    this.scene.start('PlayerSelect');
  }
}
