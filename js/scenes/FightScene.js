const GROUND_Y = 400;
const STAGE_LEFT = 90;
const STAGE_RIGHT = 630;
const MIN_SEPARATION = 58;
const MOVE_SPEED = 180;
const GRAVITY = 1500;
const JUMP_VEL = 480;

const PUNCH_RANGE = 100;
const PUNCH_ACTIVE = [90, 170];
const PUNCH_TOTAL = 300;
const PUNCH_DAMAGE = 8;

const KICK_RANGE = 122;
const KICK_ACTIVE = [150, 230];
const KICK_TOTAL = 420;
const KICK_DAMAGE = 13;

// Especial: abajo + adelante + golpe = bola de fuego
const FIREBALL_INPUT_WINDOW = 450;
const FIREBALL_STARTUP = 150;
const FIREBALL_TOTAL = 550;
const FIREBALL_SPEED = 320;
const FIREBALL_DAMAGE = 14;
const FIREBALL_MAX = 3;

const LOCKED_STATES = ['punch', 'kick', 'fireball', 'hurt', 'blockstun', 'ko'];

class Fighter {
  constructor(scene, player, x, facing) {
    this.scene = scene;
    this.player = player;
    this.facing = facing;
    this.x = x;
    this.jumpY = 0;
    this.jumpVel = 0;
    this.grounded = true;
    this.health = 100;
    this.wins = 0;
    this.state = 'idle';
    this.stateT = 0;
    this.hasHit = false;
    this.aiCooldown = 0;
    this.walkDir = 0;
    this.lastDownTime = -9999;
    this.fireballsLeft = FIREBALL_MAX;
    this.sprite = scene.add.image(x, GROUND_Y, `body_${player.id}`).setScale(0.42).setOrigin(0.5, 1);
    this.sprite.setFlipX(facing < 0);
  }

  setState(state) {
    if (this.state === state) return;
    this.state = state;
    this.stateT = 0;
    this.hasHit = false;
  }

  reset(x, facing) {
    this.x = x;
    this.facing = facing;
    this.jumpY = 0;
    this.jumpVel = 0;
    this.grounded = true;
    this.health = 100;
    this.lastDownTime = -9999;
    this.fireballsLeft = FIREBALL_MAX;
    this.sprite.clearTint();
    this.sprite.setAngle(0);
    this.sprite.setAlpha(1);
    this.setState('idle');
  }
}

class FightScene extends Phaser.Scene {
  constructor() {
    super('Fight');
  }

  init(data) {
    this.meData = data.me;
    this.rivalData = data.rival;
    const ladder = this.registry.get('ladder');
    this.difficulty = Math.min(0.85, 0.42 + (ladder ? ladder.index : 0) * 0.05);
    this.roundNum = 1;
    this.playerWins = 0;
    this.cpuWins = 0;
    this.frozen = true;
    this.matchOver = false;
    this.timeLeft = 60;
    this.roundEndTimer = null;
    this.matchEndTimer = null;
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({ punch: 'A', kick: 'S', block: 'D', jump: 'W' });

    this.drawStage();
    this.player = new Fighter(this, this.meData, 190, 1);
    this.cpu = new Fighter(this, this.rivalData, 530, -1);
    this.fireballs = [];

    this.buildHud();
    this.startRoundIntro();

    AUDIO.startMusic();
    this.events.once('shutdown', () => AUDIO.stopMusic());
  }

  drawStage() {
    const { width, height } = this.scale;
    const g = this.add.graphics();

    // cielo
    g.fillGradientStyle(0x8fcbe8, 0x8fcbe8, 0xd4ecf5, 0xd4ecf5, 1);
    g.fillRect(0, 0, width, GROUND_Y);

    // pared de ladrillo del edificio de la escuela
    g.fillGradientStyle(0xb85c3a, 0xb85c3a, 0x8a4028, 0x8a4028, 1);
    g.fillRect(0, 36, width, GROUND_Y - 36);
    g.lineStyle(1, 0x5a2818, 0.3);
    for (let row = 0; row < 9; row++) {
      const y = 36 + row * 26;
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(width, y);
      g.strokePath();
    }

    // ventanas iluminadas
    for (let i = 0; i < 6; i++) {
      const x = 44 + i * 128;
      g.fillStyle(0xfff3b0, 0.88);
      g.fillRoundedRect(x, 56, 66, 86, 4);
      g.lineStyle(4, 0x5a2818, 0.7);
      g.strokeRoundedRect(x, 56, 66, 86, 4);
      g.beginPath();
      g.moveTo(x + 33, 56);
      g.lineTo(x + 33, 142);
      g.strokePath();
      g.beginPath();
      g.moveTo(x, 99);
      g.lineTo(x + 66, 99);
      g.strokePath();
    }

    // piso de baldosas del patio
    const tile = 46;
    const cols = Math.ceil(width / tile);
    const rows = Math.ceil((height - GROUND_Y) / tile);
    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        const isLight = (tx + ty) % 2 === 0;
        g.fillStyle(isLight ? 0xd9d0bd : 0xb7ac91, 1);
        g.fillRect(tx * tile, GROUND_Y + ty * tile, tile, tile);
      }
    }
    g.fillStyle(0x000000, 0.32);
    g.fillRect(0, GROUND_Y, width, 5);

    // viñeta inferior
    g.fillStyle(0x000000, 0.16);
    g.fillRect(0, height - 60, width, 60);
  }

  buildHud() {
    const { width } = this.scale;

    this.hpFrameP = this.add.graphics();
    this.hpFrameC = this.add.graphics();
    this.hpBarP = this.add.graphics();
    this.hpBarC = this.add.graphics();

    this.add.text(24, 14, this.meData.name, { fontSize: '14px', fontFamily: 'Arial Black', color: '#ffffff' });
    this.rivalNameText = this.add.text(width - 24, 14, this.rivalData.name, { fontSize: '14px', fontFamily: 'Arial Black', color: '#ffffff' }).setOrigin(1, 0);

    this.pipsP = [this.add.circle(24, 50, 5, 0x333333), this.add.circle(38, 50, 5, 0x333333)];
    this.pipsC = [this.add.circle(width - 24, 50, 5, 0x333333), this.add.circle(width - 38, 50, 5, 0x333333)];

    this.firePipsP = [0, 1, 2].map((i) => this.add.circle(60 + i * 14, 50, 5, 0xff7a1a));
    this.firePipsC = [0, 1, 2].map((i) => this.add.circle(width - 60 - i * 14, 50, 5, 0xff7a1a));

    this.timerText = this.add.text(width / 2, 20, '60', {
      fontSize: '26px', fontFamily: 'Arial Black', color: '#ffffff', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.resultText = this.add.text(width / 2, 190, '', {
      fontSize: '40px', fontFamily: 'Arial Black', color: '#ffd200', stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(20);

    this.buildRestartButton(width);

    this.add.text(width / 2, this.scale.height - 28, '← → moverte   W saltar   A golpe   S patada   D bloquear', {
      fontSize: '12px', color: 'rgba(255,255,255,0.8)',
    }).setOrigin(0.5);
    this.add.text(width / 2, this.scale.height - 12, '↓ + → (o ←) + A = bola de fuego', {
      fontSize: '12px', color: 'rgba(255,180,80,0.95)',
    }).setOrigin(0.5);

    this.drawHealthBars();
    this.updateFirePips();
  }

  buildRestartButton(width) {
    const w = 108, h = 24, x = width / 2 - w / 2, y = 58;
    const bg = this.add.graphics().setDepth(19);
    bg.fillStyle(0x1c2a5e, 0.9);
    bg.fillRoundedRect(x, y, w, h, 8);
    bg.lineStyle(2, 0x5a6ac0, 1);
    bg.strokeRoundedRect(x, y, w, h, 8);

    this.add.text(width / 2, y + h / 2, '🔄 Reiniciar', {
      fontSize: '13px', fontFamily: 'Arial Black', color: '#ffffff',
    }).setOrigin(0.5).setDepth(20);

    const zone = this.add.zone(width / 2, y + h / 2, w, h).setInteractive({ useHandCursor: true }).setDepth(20);
    zone.on('pointerdown', () => {
      AUDIO.ensureCtx();
      this.restartMatch();
    });
    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x2a3a7e, 0.95);
      bg.fillRoundedRect(x, y, w, h, 8);
      bg.lineStyle(2, 0xffd200, 1);
      bg.strokeRoundedRect(x, y, w, h, 8);
    });
    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x1c2a5e, 0.9);
      bg.fillRoundedRect(x, y, w, h, 8);
      bg.lineStyle(2, 0x5a6ac0, 1);
      bg.strokeRoundedRect(x, y, w, h, 8);
    });
  }

  // Reinicia la pelea actual (mismo rival) desde el round 1, cancelando
  // cualquier transición de fin de round/partida que pudiera estar pendiente.
  restartMatch() {
    if (this.roundEndTimer) { this.roundEndTimer.remove(); this.roundEndTimer = null; }
    if (this.matchEndTimer) { this.matchEndTimer.remove(); this.matchEndTimer = null; }
    this.tweens.killTweensOf(this.resultText);
    this.resultText.setText('').setAlpha(1).setScale(1);
    this.roundNum = 1;
    this.playerWins = 0;
    this.cpuWins = 0;
    this.matchOver = false;
    this.updatePips();
    this.resetFighters();
    this.startRoundIntro();
  }

  drawHealthBars() {
    const w = 260, h = 18;
    this.hpFrameP.clear();
    this.hpFrameP.lineStyle(3, 0xffffff, 1);
    this.hpFrameP.strokeRect(20, 26, w, h);
    this.hpFrameC.clear();
    this.hpFrameC.lineStyle(3, 0xffffff, 1);
    this.hpFrameC.strokeRect(this.scale.width - 20 - w, 26, w, h);

    const pRatio = Phaser.Math.Clamp(this.player.health / 100, 0, 1);
    const cRatio = Phaser.Math.Clamp(this.cpu.health / 100, 0, 1);
    this.hpBarP.clear();
    this.hpBarP.fillStyle(pRatio > 0.35 ? 0x3ddc5a : 0xff4444, 1);
    this.hpBarP.fillRect(20, 26, w * pRatio, h);
    this.hpBarC.clear();
    this.hpBarC.fillStyle(cRatio > 0.35 ? 0x3ddc5a : 0xff4444, 1);
    this.hpBarC.fillRect(this.scale.width - 20 - w * cRatio, 26, w * cRatio, h);
  }

  updatePips() {
    this.pipsP.forEach((p, i) => p.setFillStyle(i < this.playerWins ? 0xffd200 : 0x333333));
    this.pipsC.forEach((p, i) => p.setFillStyle(i < this.cpuWins ? 0xffd200 : 0x333333));
  }

  updateFirePips() {
    this.firePipsP.forEach((p, i) => p.setFillStyle(i < this.player.fireballsLeft ? 0xff7a1a : 0x333333));
    this.firePipsC.forEach((p, i) => p.setFillStyle(i < this.cpu.fireballsLeft ? 0xff7a1a : 0x333333));
  }

  startRoundIntro() {
    this.frozen = true;
    this.timeLeft = 60;
    this.resultText.setText(`ROUND ${this.roundNum}`).setScale(0.6).setAlpha(1);
    this.tweens.add({ targets: this.resultText, scale: 1, duration: 300, ease: 'Back.easeOut' });
    this.time.delayedCall(900, () => {
      this.resultText.setText('¡FIGHT!');
      AUDIO.roundStart();
      this.time.delayedCall(500, () => {
        this.resultText.setText('');
        this.frozen = false;
      });
    });
  }

  resetFighters() {
    this.fireballs.forEach((fb) => fb.img.destroy());
    this.fireballs = [];
    this.player.reset(190, 1);
    this.cpu.reset(530, -1);
    this.drawHealthBars();
    this.updateFirePips();
  }

  // El arma queda anclada cerca de la mano y se mueve poco: un empujón corto (golpe)
  // o un hachazo en arco (patada), en vez de salir disparada hacia el rival.
  spawnStrikeFx(f, moveType) {
    const key = `weapon_${f.player.weapon}`;
    const pivotX = f.x + f.facing * 20;
    const pivotY = f.sprite.y - 78;
    const baseAngle = f.facing > 0 ? 0 : Math.PI;
    const img = this.add.image(pivotX, pivotY, key).setOrigin(0.15, 0.5).setScale(0.85).setDepth(6);

    if (moveType === 'punch') {
      img.setRotation(baseAngle);
      const dx = f.facing * 24;
      this.tweens.add({
        targets: img,
        x: pivotX + dx,
        duration: 110,
        yoyo: true,
        hold: 20,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.tweens.add({ targets: img, alpha: 0, duration: 90, onComplete: () => img.destroy() });
        },
      });
    } else {
      img.setRotation(baseAngle - f.facing * 0.9);
      this.tweens.add({
        targets: img,
        rotation: baseAngle + f.facing * 0.7,
        duration: 220,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.tweens.add({ targets: img, alpha: 0, duration: 120, onComplete: () => img.destroy() });
        },
      });
    }
  }

  // Especial: abajo + adelante + golpe (o el botón dedicado táctil). Cada
  // luchador tiene 3 por round. Entra en un estado bloqueado breve (carga)
  // y recién ahí lanza el proyectil, que viaja solo y pega si conecta.
  startFireball(f) {
    if (f.fireballsLeft <= 0) return;
    f.fireballsLeft -= 1;
    this.updateFirePips();
    f.setState('fireball');
    AUDIO.fireball();
    this.time.delayedCall(FIREBALL_STARTUP, () => {
      if (f.state === 'fireball') this.launchFireball(f);
    });
  }

  launchFireball(f) {
    const startX = f.x + f.facing * 26;
    const startY = f.sprite.y - 72;
    const img = this.add.image(startX, startY, 'fireball').setDepth(6).setScale(0.3);
    this.tweens.add({ targets: img, scale: 0.7, duration: 100, ease: 'Back.easeOut' });
    this.fireballs.push({ img, x: startX, dir: f.facing, owner: f, hit: false });
  }

  updateFireballs(dt) {
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const fb = this.fireballs[i];
      fb.x += fb.dir * FIREBALL_SPEED * dt;
      fb.img.x = fb.x;
      fb.img.rotation += dt * 12;

      if (fb.x < STAGE_LEFT - 40 || fb.x > STAGE_RIGHT + 40) {
        fb.img.destroy();
        this.fireballs.splice(i, 1);
        continue;
      }

      const target = fb.owner === this.player ? this.cpu : this.player;
      if (!fb.hit && target.state !== 'ko' && target.grounded && Math.abs(fb.x - target.x) < 30) {
        fb.hit = true;
        this.applyHit(fb.owner, target, FIREBALL_DAMAGE);
        fb.img.destroy();
        this.fireballs.splice(i, 1);
      }
    }
  }

  updateFighterInput(f, dt) {
    if (LOCKED_STATES.includes(f.state)) return;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      f.lastDownTime = this.time.now;
    }

    // Se leen todas las banderas táctiles una sola vez (evita que el
    // cortocircuito de "||" deje alguna sin consumir en este cuadro).
    const touchFireball = TOUCH.consumeFireball();
    const touchPunch = TOUCH.consumePunch();
    const touchKick = TOUCH.consumeKick();
    const touchJump = TOUCH.consumeJump();
    const touchDir = TOUCH.moveDir;

    // El movimiento se aplica primero y funciona también en el aire, para
    // poder saltar en diagonal (mover + saltar a la vez, no uno y después
    // el otro). No cambia el estado si está en el aire: eso rompería la
    // física del salto, que depende de que el estado siga siendo 'jump'.
    if (this.cursors.left.isDown || this.cursors.right.isDown || touchDir !== 0) {
      const dir = touchDir !== 0 ? touchDir : (this.cursors.left.isDown ? -1 : 1);
      f.x = Phaser.Math.Clamp(f.x + dir * MOVE_SPEED * dt, STAGE_LEFT, STAGE_RIGHT);
      if (f.grounded) f.setState('walk');
    } else if (f.grounded) {
      f.setState('idle');
    }

    if (!f.grounded) return; // ataques, salto y bloqueo solo se inician parado

    // El botón táctil de fuego es directo (sin necesidad de la combinación de teclado)
    if (touchFireball) {
      this.startFireball(f);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.punch) || touchPunch) {
      const forwardHeld = f.facing > 0 ? this.cursors.right.isDown : this.cursors.left.isDown;
      const comboReady = forwardHeld && this.time.now - f.lastDownTime < FIREBALL_INPUT_WINDOW && f.fireballsLeft > 0;
      if (!touchPunch && comboReady) {
        this.startFireball(f);
        return;
      }
      f.setState('punch');
      AUDIO.punch();
      this.spawnStrikeFx(f, 'punch');
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.kick) || touchKick) {
      f.setState('kick');
      AUDIO.kick();
      this.spawnStrikeFx(f, 'kick');
      return;
    }
    if (this.keys.block.isDown) {
      f.setState('block');
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.jump) || touchJump) {
      f.jumpVel = JUMP_VEL;
      f.grounded = false;
      f.setState('jump');
      AUDIO.jump();
    }
  }

  updateAI(f, dt) {
    if (LOCKED_STATES.includes(f.state) || f.state === 'jump') return;
    f.aiCooldown -= dt * 1000;

    if (f.aiCooldown > 0) {
      if (f.state === 'walk') {
        f.x = Phaser.Math.Clamp(f.x + f.walkDir * MOVE_SPEED * 0.95 * dt, STAGE_LEFT, STAGE_RIGHT);
      }
      return;
    }
    f.aiCooldown = Phaser.Math.Between(120, 280);

    const dist = Math.abs(this.player.x - f.x);
    const towardPlayer = this.player.x < f.x ? -1 : 1;

    if (dist > KICK_RANGE + 15) {
      if (f.fireballsLeft > 0 && Math.random() < this.difficulty * 0.25) {
        this.startFireball(f);
        return;
      }
      f.walkDir = towardPlayer;
      f.setState('walk');
      return;
    }

    const atkChance = 0.3 + this.difficulty * 0.5;
    const roll = Math.random();
    if (roll < atkChance) {
      const moveRoll = Math.random();
      if (moveRoll < 0.2 && f.fireballsLeft > 0) {
        this.startFireball(f);
      } else if (moveRoll < 0.58) {
        f.setState('punch');
        AUDIO.punch();
        this.spawnStrikeFx(f, 'punch');
      } else {
        f.setState('kick');
        AUDIO.kick();
        this.spawnStrikeFx(f, 'kick');
      }
    } else if (roll < atkChance + 0.15) {
      f.setState('block');
    } else if (roll < atkChance + 0.25) {
      f.walkDir = -towardPlayer;
      f.setState('walk');
    } else {
      f.setState('idle');
    }
  }

  enforceSeparation() {
    const gap = this.cpu.x - this.player.x;
    if (Math.abs(gap) < MIN_SEPARATION) {
      const overlap = MIN_SEPARATION - Math.abs(gap);
      const sign = gap >= 0 ? 1 : -1;
      this.player.x = Phaser.Math.Clamp(this.player.x - (sign * overlap) / 2, STAGE_LEFT, STAGE_RIGHT);
      this.cpu.x = Phaser.Math.Clamp(this.cpu.x + (sign * overlap) / 2, STAGE_LEFT, STAGE_RIGHT);
    }
  }

  updateFacing() {
    [this.player, this.cpu].forEach((f) => {
      if (f.state === 'ko') return;
      const other = f === this.player ? this.cpu : this.player;
      f.facing = other.x >= f.x ? 1 : -1;
      f.sprite.setFlipX(f.facing < 0);
    });
  }

  updatePhysics(f, dt) {
    f.stateT += dt * 1000;
    if (f.state === 'jump') {
      f.jumpVel -= GRAVITY * dt;
      f.jumpY += f.jumpVel * dt;
      if (f.jumpY <= 0) {
        f.jumpY = 0;
        f.jumpVel = 0;
        f.grounded = true;
        f.setState('idle');
      }
    }
    f.sprite.x = f.x;
    f.sprite.y = GROUND_Y - f.jumpY;

    if (f.state === 'block') f.sprite.setScale(0.42, 0.37);
    else if (f.state !== 'ko') f.sprite.setScale(0.42, 0.42);

    if (LOCKED_STATES.includes(f.state) && f.state !== 'ko' && f.stateT >= this.stateDuration(f.state)) {
      f.setState('idle');
    }
  }

  stateDuration(state) {
    if (state === 'punch') return PUNCH_TOTAL;
    if (state === 'kick') return KICK_TOTAL;
    if (state === 'fireball') return FIREBALL_TOTAL;
    if (state === 'hurt') return 350;
    if (state === 'blockstun') return 200;
    return 0;
  }

  resolveAttacks() {
    [{ a: this.player, d: this.cpu }, { a: this.cpu, d: this.player }].forEach(({ a, d }) => {
      if (a.hasHit) return;
      const active = a.state === 'punch' ? PUNCH_ACTIVE : a.state === 'kick' ? KICK_ACTIVE : null;
      if (!active) return;
      if (a.stateT < active[0] || a.stateT > active[1]) return;
      a.hasHit = true;

      if (!d.grounded) return; // saltando esquiva ataques

      const dist = Math.abs(a.x - d.x);
      const range = a.state === 'punch' ? PUNCH_RANGE : KICK_RANGE;
      const facingCorrectly = (a.facing > 0 && d.x >= a.x) || (a.facing < 0 && d.x <= a.x);
      if (dist > range || !facingCorrectly) return;

      const dmg = a.state === 'punch' ? PUNCH_DAMAGE : KICK_DAMAGE;
      this.applyHit(a, d, dmg);
    });
  }

  applyHit(attacker, defender, dmg) {
    const blocked = defender.state === 'block';
    if (blocked) {
      defender.health = Math.max(0, defender.health - Math.ceil(dmg * 0.15));
      AUDIO.block();
      this.cameras.main.shake(80, 0.002);
      defender.setState('blockstun');
    } else {
      defender.health = Math.max(0, defender.health - dmg);
      AUDIO.hit();
      this.cameras.main.shake(130, 0.006);
      defender.setState('hurt');
      const pushDir = defender.x >= attacker.x ? 1 : -1;
      defender.x = Phaser.Math.Clamp(defender.x + pushDir * 20, STAGE_LEFT, STAGE_RIGHT);
      defender.sprite.setTintFill(0xffffff);
      this.time.delayedCall(80, () => { if (defender.state !== 'ko') defender.sprite.clearTint(); });
    }
    this.drawHealthBars();

    if (defender.health <= 0 && defender.state !== 'ko') {
      defender.setState('ko');
      defender.sprite.setTintFill(0xffffff);
      this.time.delayedCall(90, () => defender.sprite.clearTint());
      this.tweens.add({
        targets: defender.sprite,
        angle: defender.facing > 0 ? 75 : -75,
        alpha: 0.7,
        duration: 500,
        ease: 'Quad.easeIn',
      });
      this.time.delayedCall(200, () => this.onRoundEnd(attacker === this.player ? 'player' : 'cpu'));
    }
  }

  onRoundEnd(winner) {
    if (this.frozen) return;
    this.frozen = true;
    AUDIO.ko();
    this.resultText.setText('¡K.O.!').setScale(0.6).setAlpha(1);
    this.tweens.add({ targets: this.resultText, scale: 1, duration: 300, ease: 'Back.easeOut' });
    this.finishRound(winner);
  }

  timeUp() {
    if (this.frozen) return;
    this.frozen = true;
    const winner = this.player.health >= this.cpu.health ? 'player' : 'cpu';
    this.resultText.setText('¡TIEMPO!');
    this.finishRound(winner);
  }

  finishRound(winner) {
    if (winner === 'player') this.playerWins++; else this.cpuWins++;
    this.updatePips();

    this.roundEndTimer = this.time.delayedCall(1600, () => {
      this.roundEndTimer = null;
      this.resultText.setText('');
      if (this.playerWins >= 2 || this.cpuWins >= 2) {
        this.endMatch(this.playerWins > this.cpuWins ? 'player' : 'cpu');
      } else {
        this.roundNum++;
        this.resetFighters();
        this.startRoundIntro();
      }
    });
  }

  endMatch(winner) {
    this.matchOver = true;
    AUDIO.stopMusic();
    if (winner === 'player') {
      AUDIO.win();
      this.resultText.setText('¡GANASTE LA PELEA!').setScale(0.6).setAlpha(1);
      this.tweens.add({ targets: this.resultText, scale: 0.75, duration: 300, ease: 'Back.easeOut' });
      this.matchEndTimer = this.time.delayedCall(1800, () => {
        this.matchEndTimer = null;
        const ladder = this.registry.get('ladder');
        advanceLadder(ladder);
        this.scene.start('Ladder', {});
      });
    } else {
      AUDIO.lose();
      this.resultText.setText('PERDISTE...').setScale(0.6).setAlpha(1);
      this.tweens.add({ targets: this.resultText, scale: 0.75, duration: 300, ease: 'Back.easeOut' });
      this.matchEndTimer = this.time.delayedCall(1800, () => {
        this.matchEndTimer = null;
        this.scene.start('GameOver', { me: this.meData, rival: this.rivalData });
      });
    }
  }

  update(time, delta) {
    if (this.matchOver) return;
    const dt = delta / 1000;

    if (!this.frozen) {
      this.updateFighterInput(this.player, dt);
      this.updateAI(this.cpu, dt);
      this.enforceSeparation();
    }

    this.updatePhysics(this.player, dt);
    this.updatePhysics(this.cpu, dt);
    this.updateFacing();
    this.resolveAttacks();
    this.updateFireballs(dt);

    if (!this.frozen) {
      this.timeLeft -= dt;
      this.timerText.setText(String(Math.max(0, Math.ceil(this.timeLeft))));
      if (this.timeLeft <= 0) this.timeUp();
    }
  }
}
