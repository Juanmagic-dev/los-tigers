// Controles táctiles para iPad/celular: joystick para moverse y saltar,
// más tres botones (patada, golpe, bola de fuego). Solo se muestran en
// pantallas táctiles (ver media query en style.css); en teclado no estorban.
// Expone un objeto global TOUCH que FightScene consulta junto al teclado.

const TOUCH = (() => {
  const state = {
    moveDir: 0,
    _jump: false,
    _punch: false,
    _kick: false,
    _fireball: false,
  };

  function consumeJump() { const v = state._jump; state._jump = false; return v; }
  function consumePunch() { const v = state._punch; state._punch = false; return v; }
  function consumeKick() { const v = state._kick; state._kick = false; return v; }
  function consumeFireball() { const v = state._fireball; state._fireball = false; return v; }

  function setupJoystick() {
    const base = document.getElementById('joystickBase');
    const nub = document.getElementById('joystickNub');
    if (!base || !nub) return;

    const maxR = 38;
    let dragging = false;
    let jumpArmed = true;

    function handleMove(clientX, clientY) {
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }
      nub.style.transform = `translate(${dx}px, ${dy}px)`;

      const deadzone = 12;
      state.moveDir = dx > deadzone ? 1 : dx < -deadzone ? -1 : 0;

      if (dy < -maxR * 0.6) {
        if (jumpArmed) {
          state._jump = true;
          jumpArmed = false;
        }
      } else if (dy > -maxR * 0.3) {
        jumpArmed = true;
      }
    }

    function resetNub() {
      dragging = false;
      state.moveDir = 0;
      jumpArmed = true;
      nub.style.transform = 'translate(0px, 0px)';
    }

    base.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      dragging = true;
      base.setPointerCapture(e.pointerId);
      handleMove(e.clientX, e.clientY);
    });
    base.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    });
    base.addEventListener('pointerup', (e) => { e.preventDefault(); resetNub(); });
    base.addEventListener('pointercancel', (e) => { e.preventDefault(); resetNub(); });
  }

  function setupButton(id, onPress) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      onPress();
    });
  }

  function init() {
    setupJoystick();
    setupButton('btnPunch', () => { state._punch = true; });
    setupButton('btnKick', () => { state._kick = true; });
    setupButton('btnFireball', () => { state._fireball = true; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    get moveDir() { return state.moveDir; },
    consumeJump,
    consumePunch,
    consumeKick,
    consumeFireball,
  };
})();
