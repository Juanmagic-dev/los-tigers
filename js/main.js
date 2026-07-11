const config = {
  type: Phaser.AUTO,
  width: 720,
  height: 480,
  parent: 'game',
  backgroundColor: '#0a0e27',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.NO_CENTER,
  },
  scene: [BootScene, PlayerSelectScene, SkinSelectScene, LadderScene, FightScene, GameOverScene],
};

window.game = new Phaser.Game(config);
