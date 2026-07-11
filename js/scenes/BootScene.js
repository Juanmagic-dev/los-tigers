class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    PLAYERS.forEach((p) => {
      generatePortrait(this, p, 220);
      generateBody(this, p, 380);
      generateWeaponTexture(this, p.weapon);
    });
    generateFireballTexture(this);
    this.scene.start('PlayerSelect');
  }
}
