// Dibuja personajes "chibi" (cabeza grande, cuerpo chico) de forma procedural con Canvas 2D
// (gradientes, sombras, contornos) y los registra como texturas de Phaser.
// Todo el dibujo ocurre en un sistema de coordenadas virtual fijo (VW x VH) que después
// se escala al tamaño de canvas real pedido, así una sola función sirve para retratos
// chicos y para los cuerpos grandes de la cancha.

const SKIN = '#f1c27d';
const SKIN_SHADOW = '#d99a5b';
const OUTLINE = 'rgba(35, 25, 20, 0.55)';
const VW = 200;
const VH = 260;

function hexNum(h) {
  return `#${h.toString(16).padStart(6, '0')}`;
}

function shade(hexColor, amt) {
  // hexColor: "#rrggbb", amt: -1..1 (negativo oscurece, positivo aclara)
  const c = hexColor.replace('#', '');
  let r = parseInt(c.substring(0, 2), 16);
  let g = parseInt(c.substring(2, 4), 16);
  let b = parseInt(c.substring(4, 6), 16);
  const f = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  r = Math.round((f - r) * p + r);
  g = Math.round((f - g) * p + g);
  b = Math.round((f - b) * p + b);
  return `rgb(${r},${g},${b})`;
}

function buildScale(build) {
  if (build === 'grande') return { head: 1.1, body: 1.15 };
  if (build === 'bajito') return { head: 0.94, body: 0.85 };
  return { head: 1, body: 1 };
}

function roundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------------- Pelo ----------------
// Cada función recibe (ctx, hcx, hcy, r, color) y dibuja en coordenadas virtuales.
// 'back' se dibuja antes de la cabeza (mechones detrás), 'front' después (flequillo).

const HAIR_DRAWERS = {
  corto: {
    back(ctx, hcx, hcy, r, color) {
      ctx.fillStyle = shade(color, -0.15);
      ctx.beginPath();
      ctx.arc(hcx, hcy, r + 3, Math.PI, Math.PI * 2);
      ctx.fill();
    },
    front(ctx, hcx, hcy, r, color) {
      ctx.fillStyle = color;
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(hcx, hcy, r + 3, Math.PI * 1.05, Math.PI * 1.95);
      ctx.quadraticCurveTo(hcx, hcy - r * 0.55, hcx - r * 0.9, hcy - r * 0.25);
      ctx.fill();
      ctx.stroke();
      // mechoncitos del flequillo
      for (let i = -1; i <= 1; i++) {
        const px = hcx + i * r * 0.35;
        ctx.beginPath();
        ctx.moveTo(px - 6, hcy - r * 0.75);
        ctx.quadraticCurveTo(px, hcy - r * 0.55, px + 6, hcy - r * 0.75);
        ctx.quadraticCurveTo(px, hcy - r * 0.9, px - 6, hcy - r * 0.75);
        ctx.fill();
      }
    },
  },
  lacio: {
    back(ctx, hcx, hcy, r, color) {
      ctx.fillStyle = shade(color, -0.15);
      ctx.beginPath();
      ctx.arc(hcx, hcy, r + 3, Math.PI, Math.PI * 2);
      ctx.fill();
      // paneles laterales lacios
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.moveTo(hcx + side * (r - 2), hcy - 4);
        ctx.quadraticCurveTo(hcx + side * (r + 8), hcy + r * 0.6, hcx + side * (r - 4), hcy + r * 1.05);
        ctx.quadraticCurveTo(hcx + side * (r - 12), hcy + r * 0.6, hcx + side * (r - 6), hcy - 6);
        ctx.fill();
      });
    },
    front(ctx, hcx, hcy, r, color) {
      ctx.fillStyle = color;
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(hcx, hcy, r + 2, Math.PI * 1.05, Math.PI * 1.95);
      ctx.quadraticCurveTo(hcx, hcy - r * 0.5, hcx - r * 0.85, hcy - r * 0.15);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hcx - r * 0.7, hcy - r * 0.15);
      ctx.quadraticCurveTo(hcx, hcy - r * 0.02, hcx + r * 0.7, hcy - r * 0.15);
      ctx.quadraticCurveTo(hcx, hcy + r * 0.18, hcx - r * 0.7, hcy - r * 0.15);
      ctx.fill();
      ctx.stroke();
    },
  },
  despeinado: {
    back(ctx, hcx, hcy, r, color) {
      ctx.fillStyle = shade(color, -0.18);
      ctx.beginPath();
      ctx.arc(hcx, hcy, r + 3, Math.PI, Math.PI * 2);
      ctx.fill();
    },
    front(ctx, hcx, hcy, r, color) {
      ctx.fillStyle = color;
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(hcx, hcy, r + 1, Math.PI * 1.05, Math.PI * 1.95);
      ctx.fill();
      ctx.stroke();
      const spikes = [-0.75, -0.4, 0, 0.4, 0.75];
      spikes.forEach((t, i) => {
        const ang = Math.PI * 1.5 + t * 1.15;
        const bx = hcx + Math.cos(ang) * r * 0.95;
        const by = hcy + Math.sin(ang) * r * 0.95;
        const tipAng = ang + (i % 2 === 0 ? -0.35 : 0.35);
        const tx = hcx + Math.cos(tipAng) * r * 1.55;
        const ty = hcy + Math.sin(tipAng) * r * 1.15 - 6;
        ctx.beginPath();
        ctx.moveTo(bx - 7, by);
        ctx.quadraticCurveTo(hcx + Math.cos(ang) * r * 1.2, hcy + Math.sin(ang) * r * 1.2, tx, ty);
        ctx.quadraticCurveTo(hcx + Math.cos(ang) * r * 1.15 + 6, hcy + Math.sin(ang) * r * 1.15, bx + 7, by);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    },
  },
  rulos: {
    back(ctx, hcx, hcy, r, color) {
      ctx.fillStyle = shade(color, -0.2);
      ctx.beginPath();
      ctx.arc(hcx, hcy, r + 4, Math.PI, Math.PI * 2);
      ctx.fill();
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.arc(hcx + side * (r - 2), hcy + r * 0.35, 9, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    front(ctx, hcx, hcy, r, color) {
      const curls = [
        [-0.85, -0.55], [-0.5, -0.85], [-0.15, -0.95], [0.15, -0.95], [0.5, -0.85], [0.85, -0.55],
      ];
      curls.forEach(([ox, oy]) => {
        const cx2 = hcx + ox * r;
        const cy2 = hcy + oy * r;
        const rad = r * 0.34;
        const grad = ctx.createRadialGradient(cx2 - rad * 0.3, cy2 - rad * 0.3, 1, cx2, cy2, rad);
        grad.addColorStop(0, shade(color, 0.25));
        grad.addColorStop(1, color);
        ctx.fillStyle = grad;
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx2, cy2, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    },
  },
  elvis: {
    back(ctx, hcx, hcy, r, color) {
      ctx.fillStyle = shade(color, -0.15);
      ctx.beginPath();
      ctx.arc(hcx, hcy, r + 3, Math.PI * 0.15, Math.PI * 0.85);
      ctx.fill();
    },
    front(ctx, hcx, hcy, r, color) {
      ctx.fillStyle = color;
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(hcx, hcy, r + 1, Math.PI * 1.05, Math.PI * 1.95);
      ctx.fill();
      ctx.stroke();
      const grad = ctx.createLinearGradient(hcx, hcy - r * 1.9, hcx, hcy - r * 0.3);
      grad.addColorStop(0, shade(color, 0.2));
      grad.addColorStop(1, color);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(hcx - r * 0.55, hcy - r * 0.35);
      ctx.bezierCurveTo(hcx - r * 0.7, hcy - r * 1.3, hcx - r * 0.25, hcy - r * 1.95, hcx, hcy - r * 1.85);
      ctx.bezierCurveTo(hcx + r * 0.3, hcy - r * 1.95, hcx + r * 0.65, hcy - r * 1.1, hcx + r * 0.5, hcy - r * 0.3);
      ctx.bezierCurveTo(hcx + r * 0.25, hcy - r * 0.65, hcx - r * 0.25, hcy - r * 0.65, hcx - r * 0.55, hcy - r * 0.35);
      ctx.fill();
      ctx.stroke();
    },
  },
  largo: {
    back(ctx, hcx, hcy, r, color) {
      const grad = ctx.createLinearGradient(hcx, hcy, hcx, hcy + r * 2.1);
      grad.addColorStop(0, color);
      grad.addColorStop(1, shade(color, -0.25));
      ctx.fillStyle = grad;
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(hcx, hcy, r + 3, Math.PI, Math.PI * 2);
      ctx.fill();
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.moveTo(hcx + side * (r - 6), hcy - r * 0.2);
        ctx.quadraticCurveTo(hcx + side * (r + 14), hcy + r * 0.9, hcx + side * (r - 2), hcy + r * 2.05);
        ctx.quadraticCurveTo(hcx + side * (r - 18), hcy + r * 1.0, hcx + side * (r - 14), hcy - r * 0.25);
        ctx.fill();
        ctx.stroke();
      });
    },
    front(ctx, hcx, hcy, r, color) {
      ctx.fillStyle = color;
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(hcx, hcy, r + 2, Math.PI * 1.05, Math.PI * 1.95);
      ctx.quadraticCurveTo(hcx, hcy - r * 0.5, hcx - r * 0.85, hcy - r * 0.15);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hcx - r * 0.15, hcy - r * 0.85);
      ctx.quadraticCurveTo(hcx - r * 0.05, hcy - r * 0.3, hcx - r * 0.5, hcy - r * 0.05);
      ctx.quadraticCurveTo(hcx - r * 0.15, hcy - r * 0.55, hcx - r * 0.15, hcy - r * 0.85);
      ctx.fill();
    },
  },
};
HAIR_DRAWERS.oscuroLargo = HAIR_DRAWERS.largo;
HAIR_DRAWERS.rubioLargo = HAIR_DRAWERS.largo;
HAIR_DRAWERS.rubioLacio = HAIR_DRAWERS.lacio;
HAIR_DRAWERS.oscuroLacio = HAIR_DRAWERS.lacio;
HAIR_DRAWERS.oscuroCorto = HAIR_DRAWERS.corto;
HAIR_DRAWERS.oscuroDespeinado = HAIR_DRAWERS.despeinado;

function getHairDrawer(hair) {
  return HAIR_DRAWERS[hair.style] || HAIR_DRAWERS.corto;
}

// ---------------- Jersey ----------------
function drawJersey(ctx, club, cx, top, width, height, number) {
  const info = CLUBS[club];
  const primaryHex = hexNum(info.primary);
  const secondaryHex = hexNum(info.secondary);

  const grad = ctx.createLinearGradient(cx, top, cx, top + height);
  grad.addColorStop(0, shade(primaryHex, 0.18));
  grad.addColorStop(1, shade(primaryHex, -0.12));

  roundedRectPath(ctx, cx - width / 2, top, width, height, width * 0.22);
  ctx.fillStyle = grad;
  ctx.fill();

  if (info.stripes) {
    ctx.save();
    roundedRectPath(ctx, cx - width / 2, top, width, height, width * 0.22);
    ctx.clip();
    ctx.fillStyle = shade(secondaryHex, -0.05);
    const stripeW = width / 5;
    for (let i = 0; i < 5; i += 2) {
      ctx.fillRect(cx - width / 2 + i * stripeW, top, stripeW, height);
    }
    ctx.restore();
  } else if (info.hband) {
    ctx.save();
    roundedRectPath(ctx, cx - width / 2, top, width, height, width * 0.22);
    ctx.clip();
    ctx.fillStyle = secondaryHex;
    ctx.fillRect(cx - width / 2, top + height * 0.36, width, height * 0.3);
    ctx.restore();
  } else if (info.diagonal) {
    ctx.save();
    roundedRectPath(ctx, cx - width / 2, top, width, height, width * 0.22);
    ctx.clip();
    ctx.translate(cx, top + height / 2);
    ctx.rotate(Math.atan2(height, width));
    ctx.fillStyle = secondaryHex;
    const diag = Math.sqrt(width * width + height * height) * 1.3;
    ctx.fillRect(-diag / 2, -height * 0.15, diag, height * 0.3);
    ctx.restore();
  }

  // brillo superior (efecto tela)
  ctx.save();
  roundedRectPath(ctx, cx - width / 2, top, width, height, width * 0.22);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.ellipse(cx - width * 0.2, top + height * 0.15, width * 0.35, height * 0.2, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // cuello
  ctx.fillStyle = secondaryHex;
  roundedRectPath(ctx, cx - width * 0.14, top - 3, width * 0.28, 8, 4);
  ctx.fill();

  // mangas
  ctx.fillStyle = secondaryHex;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.arc(cx + side * width * 0.52, top + height * 0.12, width * 0.13, 0, Math.PI * 2);
    ctx.fill();
  });

  // número
  if (number) {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    ctx.font = `bold ${Math.round(height * 0.42)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(String(number), cx, top + height * 0.58);
    ctx.fillText(String(number), cx, top + height * 0.58);
  }

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = OUTLINE;
  roundedRectPath(ctx, cx - width / 2, top, width, height, width * 0.22);
  ctx.stroke();
}

// ---------------- Cara ----------------
function drawFace(ctx, hcx, hcy, r, eyesColor) {
  const eyeOffsetX = r * 0.38;
  const eyeY = hcy + r * 0.08;

  // cejas
  ctx.strokeStyle = 'rgba(60,40,25,0.6)';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(hcx + side * (eyeOffsetX - 7), eyeY - r * 0.32);
    ctx.quadraticCurveTo(hcx + side * eyeOffsetX, eyeY - r * 0.4, hcx + side * (eyeOffsetX + 7), eyeY - r * 0.28);
    ctx.stroke();
  });

  // mejillas
  ctx.fillStyle = 'rgba(255,140,140,0.35)';
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.ellipse(hcx + side * r * 0.62, hcy + r * 0.35, r * 0.16, r * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // ojos
  [-1, 1].forEach((side) => {
    const ex = hcx + side * eyeOffsetX;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, r * 0.155, r * 0.185, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,25,15,0.5)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = eyesColor;
    ctx.beginPath();
    ctx.arc(ex, eyeY + r * 0.02, r * 0.095, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(ex, eyeY + r * 0.02, r * 0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(ex - r * 0.04, eyeY - r * 0.06, r * 0.03, 0, Math.PI * 2);
    ctx.fill();
  });

  // sonrisa
  ctx.strokeStyle = '#8a4a2b';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(hcx, hcy + r * 0.32, r * 0.32, Math.PI * 0.12, Math.PI * 0.88);
  ctx.stroke();
}

// ---------------- Personaje completo ----------------
function paintCharacter(ctx, player, W, H, opts = {}) {
  const scale = buildScale(player.build);
  const number = opts.number;
  ctx.save();
  ctx.scale(W / VW, H / VH);

  const hcx = VW / 2;
  const headR = 50 * scale.head;
  const hcy = 66 + (52 - headR);
  const torsoTop = hcy + headR * 0.72;
  const torsoW = 84 * scale.body;
  const torsoH = 78;
  const shortsTop = torsoTop + torsoH - 8;
  const legTop = shortsTop + 16;
  const legH = 46;
  const hair = getHairDrawer(player.hair);
  const hairColor = hexNum(player.hair.color);
  const eyesColor = hexNum(player.eyes);

  // sombra en el piso
  ctx.fillStyle = 'rgba(10,20,10,0.28)';
  ctx.beginPath();
  ctx.ellipse(hcx, legTop + legH + 4, torsoW * 0.42, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // piernas
  const legXOff = torsoW * 0.22;
  [-1, 1].forEach((side) => {
    const lx = hcx + side * legXOff;
    ctx.fillStyle = SKIN;
    roundedRectPath(ctx, lx - 11, legTop, 22, legH, 8);
    ctx.fill();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.stroke();
    // media
    ctx.fillStyle = hexNum(CLUBS[player.club].secondary);
    roundedRectPath(ctx, lx - 11, legTop + legH - 16, 22, 16, 6);
    ctx.fill();
    // botín
    ctx.fillStyle = '#2a2a2a';
    roundedRectPath(ctx, lx - 13, legTop + legH - 6, 26, 12, 5);
    ctx.fill();
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
  });

  // brazos
  [-1, 1].forEach((side) => {
    ctx.fillStyle = SKIN;
    roundedRectPath(ctx, hcx + side * (torsoW / 2 + 2), torsoTop + 10, 18, 46, 9);
    ctx.fill();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // short
  ctx.fillStyle = '#ffffff';
  roundedRectPath(ctx, hcx - torsoW * 0.46, shortsTop, torsoW * 0.92, 24, 8);
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = hexNum(CLUBS[player.club].secondary);
  roundedRectPath(ctx, hcx - torsoW * 0.46, shortsTop + 16, torsoW * 0.92, 6, 3);
  ctx.fill();

  // mochila (asoma detrás de los hombros, antes de la remera para quedar "atrás")
  const packColor = '#d2721f';
  const packW = torsoW * 1.18;
  const packH = torsoH * 0.86;
  const packTop = torsoTop - 10;
  const packGrad = ctx.createLinearGradient(hcx, packTop, hcx, packTop + packH);
  packGrad.addColorStop(0, shade(packColor, 0.1));
  packGrad.addColorStop(1, shade(packColor, -0.2));
  ctx.fillStyle = packGrad;
  roundedRectPath(ctx, hcx - packW / 2, packTop, packW, packH, 14);
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = shade(packColor, -0.1);
  roundedRectPath(ctx, hcx - packW * 0.22, packTop + packH * 0.32, packW * 0.44, packH * 0.4, 6);
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // remera
  drawJersey(ctx, player.club, hcx, torsoTop, torsoW, torsoH, number);

  // pelo detrás
  hair.back(ctx, hcx, hcy, headR, hairColor);

  // orejas
  ctx.fillStyle = SKIN;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.arc(hcx + side * (headR - 2), hcy + headR * 0.1, headR * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // cabeza con gradiente
  const skinGrad = ctx.createRadialGradient(
    hcx - headR * 0.35, hcy - headR * 0.4, headR * 0.1,
    hcx, hcy, headR * 1.1
  );
  skinGrad.addColorStop(0, shade(SKIN, 0.12));
  skinGrad.addColorStop(0.7, SKIN);
  skinGrad.addColorStop(1, SKIN_SHADOW);
  ctx.fillStyle = skinGrad;
  ctx.beginPath();
  ctx.arc(hcx, hcy, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  drawFace(ctx, hcx, hcy, headR, eyesColor);

  // pelo frente
  hair.front(ctx, hcx, hcy, headR, hairColor);
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;

  ctx.restore();
}

function makeCanvasTexture(scene, key, w, h, painter) {
  if (scene.textures.exists(key)) return key;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  painter(ctx);
  scene.textures.addCanvas(key, canvas);
  return key;
}

// Ambas texturas usan la misma proporción virtual (VW:VH) para no distorsionar el dibujo;
// targetH es la altura física del canvas generado (más alto = más nítido al escalar en juego).

// Retrato para pantallas de selección / escalera de rivales
function generatePortrait(scene, player, targetH = 220) {
  const key = `portrait_${player.id}`;
  const w = Math.round(targetH * (VW / VH));
  return makeCanvasTexture(scene, key, w, targetH, (ctx) => {
    paintCharacter(ctx, player, w, targetH, { number: player.number });
  });
}

// Cuerpo completo (de pie) usado como rig base en la pelea
function generateBody(scene, player, targetH = 380) {
  const key = `body_${player.id}`;
  const w = Math.round(targetH * (VW / VH));
  return makeCanvasTexture(scene, key, w, targetH, (ctx) => {
    paintCharacter(ctx, player, w, targetH, { number: player.number });
  });
}

// Útiles escolares que cada personaje lleva en la mochila y usa como arma.
// Cada dibujo se hace con el "mango" cerca del borde izquierdo del canvas (x chico),
// así el sprite se puede rotar/anclar desde ahí para que parezca que sale de la mano.
const WEAPON_SIZE = { w: 72, h: 34 };

const WEAPON_DRAWERS = {
  regla(ctx) {
    ctx.fillStyle = '#f2c14e';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    roundedRectPath(ctx, 10, 12, 58, 12, 3);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(60,40,10,0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
      const x = 16 + i * 6;
      ctx.beginPath();
      ctx.moveTo(x, 12);
      ctx.lineTo(x, i % 3 === 0 ? 19 : 16);
      ctx.stroke();
    }
  },
  tijeras(ctx) {
    ctx.strokeStyle = '#c9ccd1';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(14, 17); ctx.lineTo(62, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, 17); ctx.lineTo(62, 27); ctx.stroke();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(14, 17); ctx.lineTo(62, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, 17); ctx.lineTo(62, 27); ctx.stroke();
    ['#e2434f', '#3d8ee0'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(11, i === 0 ? 11 : 23, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5; ctx.stroke();
    });
  },
  compas(ctx) {
    ctx.strokeStyle = '#b0b6bf';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(14, 17); ctx.lineTo(64, 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, 17); ctx.lineTo(64, 29); ctx.stroke();
    ctx.fillStyle = '#e0c04a';
    ctx.beginPath(); ctx.arc(14, 17, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(64, 5, 2.5, 0, Math.PI * 2); ctx.fill();
  },
  lapiz(ctx) {
    ctx.fillStyle = '#e8833a';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    roundedRectPath(ctx, 16, 12, 42, 12, 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f1c27d';
    ctx.beginPath(); ctx.moveTo(58, 12); ctx.lineTo(70, 18); ctx.lineTo(58, 24); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath(); ctx.moveTo(67, 15.5); ctx.lineTo(70, 18); ctx.lineTo(67, 20.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff8fa8';
    roundedRectPath(ctx, 10, 12, 8, 12, 2);
    ctx.fill(); ctx.stroke();
  },
  escuadra(ctx) {
    ctx.fillStyle = 'rgba(90,180,220,0.75)';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, 30);
    ctx.lineTo(12, 6);
    ctx.lineTo(60, 30);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(12, 30 - i * 5);
      ctx.lineTo(12 + i * 3, 30 - i * 5);
      ctx.stroke();
    }
  },
  sacapuntas(ctx) {
    ctx.fillStyle = '#4fb0e0';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    roundedRectPath(ctx, 14, 6, 30, 24, 6);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath(); ctx.arc(29, 18, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath(); ctx.arc(29, 18, 3, 0, Math.PI * 2); ctx.fill();
  },
  birome(ctx) {
    ctx.fillStyle = '#3d6fe0';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    roundedRectPath(ctx, 14, 13, 46, 10, 3);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c9ccd1';
    ctx.beginPath(); ctx.moveTo(60, 13); ctx.lineTo(70, 18); ctx.lineTo(60, 23); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e0c04a';
    roundedRectPath(ctx, 10, 14, 8, 8, 2);
    ctx.fill(); ctx.stroke();
  },
  marcador(ctx) {
    ctx.fillStyle = '#33a05a';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    roundedRectPath(ctx, 12, 10, 44, 16, 5);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.moveTo(56, 10); ctx.lineTo(68, 18); ctx.lineTo(56, 26); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = shade('#33a05a', -0.3);
    roundedRectPath(ctx, 10, 10, 6, 16, 3);
    ctx.fill();
  },
  goma(ctx) {
    ctx.fillStyle = '#e86fa0';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    roundedRectPath(ctx, 16, 8, 36, 20, 5);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = shade('#e86fa0', -0.2);
    roundedRectPath(ctx, 16, 20, 36, 8, 5);
    ctx.fill();
  },
  cartuchera(ctx) {
    ctx.fillStyle = '#4a7ac9';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    roundedRectPath(ctx, 10, 6, 54, 24, 11);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(14, 18); ctx.lineTo(60, 18); ctx.stroke();
    ctx.fillStyle = '#e0c04a';
    ctx.beginPath(); ctx.arc(58, 18, 3, 0, Math.PI * 2); ctx.fill();
  },
  corrector(ctx) {
    ctx.fillStyle = '#eef0f2';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    roundedRectPath(ctx, 18, 9, 34, 18, 5);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e0454f';
    roundedRectPath(ctx, 18, 9, 34, 6, 3);
    ctx.fill();
    ctx.fillStyle = '#b0b6bf';
    roundedRectPath(ctx, 48, 12, 10, 12, 3);
    ctx.fill(); ctx.stroke();
  },
  transportador(ctx) {
    ctx.fillStyle = 'rgba(240,200,90,0.8)';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(20, 24, 22, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(80,60,10,0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      const ang = Math.PI + (i / 6) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(20 + Math.cos(ang) * 22, 24 + Math.sin(ang) * 22);
      ctx.lineTo(20 + Math.cos(ang) * 17, 24 + Math.sin(ang) * 17);
      ctx.stroke();
    }
  },
};

function generateWeaponTexture(scene, weaponId) {
  const key = `weapon_${weaponId}`;
  const drawer = WEAPON_DRAWERS[weaponId];
  return makeCanvasTexture(scene, key, WEAPON_SIZE.w, WEAPON_SIZE.h, drawer);
}

// Bola de fuego del movimiento especial (abajo, adelante, golpe)
function generateFireballTexture(scene) {
  const key = 'fireball';
  const size = 48;
  return makeCanvasTexture(scene, key, size, size, (ctx) => {
    const cx = size / 2, cy = size / 2;
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, size / 2);
    grad.addColorStop(0, '#fff6c9');
    grad.addColorStop(0.4, '#ffb020');
    grad.addColorStop(0.75, '#ff5f2a');
    grad.addColorStop(1, 'rgba(255,60,20,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const r = size * 0.15 + i * size * 0.08;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0.4 + i, 2.2 + i);
      ctx.stroke();
    }
  });
}
