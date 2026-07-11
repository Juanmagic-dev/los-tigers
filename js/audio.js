// Audio 100% procedural (sin archivos externos) usando Web Audio API:
// música chiptune en loop + efectos de golpes, bloqueos y fanfarrias.

class AudioManager {
  constructor() {
    this.ctx = null;
    this.musicTimer = null;
    this.enabled = true;
  }

  ensureCtx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  tone(freq, duration, type = 'square', vol = 0.15, delay = 0) {
    if (!this.enabled) return;
    this.ensureCtx();
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.03);
  }

  noiseBurst(duration = 0.12, vol = 0.22, cutoff = 1200) {
    if (!this.enabled) return;
    this.ensureCtx();
    const size = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / size);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start();
  }

  punch() {
    this.noiseBurst(0.07, 0.28, 1400);
    this.tone(190, 0.08, 'square', 0.12);
  }

  kick() {
    this.noiseBurst(0.15, 0.3, 900);
    this.tone(110, 0.14, 'square', 0.14);
  }

  block() {
    this.tone(700, 0.05, 'triangle', 0.16);
    this.tone(350, 0.08, 'triangle', 0.1, 0.02);
  }

  jump() {
    this.tone(300, 0.1, 'square', 0.08);
    this.tone(500, 0.08, 'square', 0.06, 0.06);
  }

  hit() {
    this.noiseBurst(0.1, 0.3, 700);
    this.tone(140, 0.1, 'sawtooth', 0.12);
  }

  fireball() {
    this.tone(220, 0.05, 'sawtooth', 0.1);
    this.tone(300, 0.18, 'sawtooth', 0.14, 0.03);
    this.tone(520, 0.18, 'sine', 0.1, 0.05);
  }

  ko() {
    [440, 349, 294, 220].forEach((f, i) => this.tone(f, 0.35, 'square', 0.18, i * 0.16));
  }

  roundStart() {
    this.tone(523, 0.14, 'square', 0.15);
    this.tone(659, 0.14, 'square', 0.15, 0.14);
    this.tone(784, 0.26, 'square', 0.18, 0.28);
  }

  win() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.3, 'square', 0.16, i * 0.15));
  }

  lose() {
    [392, 349, 294, 220].forEach((f, i) => this.tone(f, 0.4, 'sawtooth', 0.12, i * 0.2));
  }

  startMusic() {
    this.ensureCtx();
    this.stopMusic();
    const bass = [110, 110, 146.83, 110, 130.81, 110, 98, 103.83];
    const lead = [440, 523.25, 587.33, 523.25, 440, 392, 440, 466.16];
    let step = 0;
    const stepDur = 0.26;
    this.musicTimer = setInterval(() => {
      if (!this.enabled) return;
      const i = step % bass.length;
      this.tone(bass[i], stepDur * 0.9, 'triangle', 0.06);
      if (step % 2 === 0) this.tone(lead[i], stepDur * 0.45, 'square', 0.045);
      step++;
    }, stepDur * 1000);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

const AUDIO = new AudioManager();
