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
// ---------------- Skins (disfraces alternativos a la camiseta) ----------------
function paintOnesieBody(ctx, p, hcx, torsoTop, torsoW, torsoH) {
  const grad = ctx.createLinearGradient(hcx, torsoTop, hcx, torsoTop + torsoH);
  grad.addColorStop(0, shade(p.color, 0.12));
  grad.addColorStop(1, shade(p.color, -0.12));
  roundedRectPath(ctx, hcx - torsoW / 2, torsoTop, torsoW, torsoH, torsoW * 0.22);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  if (p.spots) {
    ctx.fillStyle = 'rgba(40,30,20,0.55)';
    [[-0.2, 0.32, 10], [0.16, 0.55, 8], [-0.28, 0.72, 7]].forEach(([ox, oy, r]) => {
      ctx.beginPath();
      ctx.ellipse(hcx + ox * torsoW, torsoTop + oy * torsoH, r, r * 0.7, 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  if (p.stripes) {
    ctx.save();
    roundedRectPath(ctx, hcx - torsoW / 2, torsoTop, torsoW, torsoH, torsoW * 0.22);
    ctx.clip();
    ctx.strokeStyle = 'rgba(20,10,5,0.6)';
    ctx.lineWidth = 5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(hcx - torsoW / 2 + i * torsoW * 0.28, torsoTop - 4);
      ctx.lineTo(hcx - torsoW / 2 + i * torsoW * 0.28 - 10, torsoTop + torsoH + 4);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (p.pandaPatch) {
    ctx.fillStyle = 'rgba(20,20,20,0.85)';
    roundedRectPath(ctx, hcx - torsoW * 0.42, torsoTop + torsoH * 0.15, torsoW * 0.3, torsoH * 0.55, 10);
    ctx.fill();
    roundedRectPath(ctx, hcx + torsoW * 0.12, torsoTop + torsoH * 0.15, torsoW * 0.3, torsoH * 0.55, 10);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(hcx, torsoTop + 4);
  ctx.lineTo(hcx, torsoTop + torsoH - 6);
  ctx.stroke();
}

function paintOnesieHead(ctx, p, hcx, hcy, headR) {
  if (p.earStyle === 'round') {
    ctx.fillStyle = p.earColor;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.arc(hcx + side * headR * 0.62, hcy - headR * 0.85, headR * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  } else if (p.earStyle === 'pointy') {
    ctx.fillStyle = p.earColor;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(hcx + side * headR * 0.4, hcy - headR * 0.7);
      ctx.lineTo(hcx + side * headR * 0.75, hcy - headR * 1.5);
      ctx.lineTo(hcx + side * headR * 0.9, hcy - headR * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  } else if (p.earStyle === 'long') {
    ctx.fillStyle = p.earColor;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.ellipse(hcx + side * headR * 0.45, hcy - headR * 1.5, headR * 0.22, headR * 0.75, side * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  } else if (p.earStyle === 'floppy') {
    ctx.fillStyle = p.earColor;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.ellipse(hcx + side * headR * 0.95, hcy - headR * 0.2, headR * 0.24, headR * 0.55, side * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  if (p.horns) {
    ctx.fillStyle = '#e8d9b0';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.5;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(hcx + side * headR * 0.35, hcy - headR * 0.9);
      ctx.lineTo(hcx + side * headR * 0.5, hcy - headR * 1.25);
      ctx.lineTo(hcx + side * headR * 0.6, hcy - headR * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }
  if (p.horn) {
    const grad = ctx.createLinearGradient(hcx, hcy - headR * 1.7, hcx, hcy - headR * 0.8);
    grad.addColorStop(0, '#fff6c9');
    grad.addColorStop(1, '#e8c94a');
    ctx.fillStyle = grad;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hcx - 6, hcy - headR * 0.85);
    ctx.lineTo(hcx, hcy - headR * 1.7);
    ctx.lineTo(hcx + 6, hcy - headR * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  if (p.mane) {
    ['#ff7ab6', '#7ac9ff', '#b6ff7a', '#ffe27a'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.ellipse(hcx - headR * 0.9, hcy - headR * 0.3 + i * 8, 8, 5, 0.3, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  if (p.spikes) {
    ctx.fillStyle = shade(p.color, -0.15);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(hcx - 8 + i * 8, hcy - headR * 0.95);
      ctx.lineTo(hcx - 4 + i * 8, hcy - headR * 1.3);
      ctx.lineTo(hcx + i * 8, hcy - headR * 0.95);
      ctx.closePath();
      ctx.fill();
    }
  }
  if (p.beak) {
    ctx.fillStyle = '#f5a623';
    ctx.beginPath();
    ctx.moveTo(hcx - 6, hcy + headR * 0.15);
    ctx.lineTo(hcx + 6, hcy + headR * 0.15);
    ctx.lineTo(hcx, hcy + headR * 0.35);
    ctx.closePath();
    ctx.fill();
  }
  if (p.whiskers) {
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.2;
    [-1, 1].forEach((side) => {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(hcx + side * headR * 0.5, hcy + headR * 0.25 + i * 4);
        ctx.lineTo(hcx + side * headR * 0.95, hcy + headR * 0.15 + i * 5);
        ctx.stroke();
      }
    });
  }
  if (p.snout) {
    ctx.fillStyle = shade(p.color, -0.1);
    ctx.beginPath();
    ctx.ellipse(hcx, hcy + headR * 0.32, headR * 0.28, headR * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintHeroBody(ctx, p, hcx, torsoTop, torsoW, torsoH) {
  ctx.fillStyle = shade(p.cape, -0.05);
  ctx.beginPath();
  ctx.moveTo(hcx - torsoW * 0.35, torsoTop - 4);
  ctx.lineTo(hcx + torsoW * 0.35, torsoTop - 4);
  ctx.lineTo(hcx + torsoW * 0.55, torsoTop + torsoH * 1.3);
  ctx.lineTo(hcx - torsoW * 0.55, torsoTop + torsoH * 1.3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const grad = ctx.createLinearGradient(hcx, torsoTop, hcx, torsoTop + torsoH);
  grad.addColorStop(0, shade(p.suit, 0.15));
  grad.addColorStop(1, shade(p.suit, -0.1));
  roundedRectPath(ctx, hcx - torsoW / 2, torsoTop, torsoW, torsoH, torsoW * 0.22);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = p.emblem;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  const cx = hcx, cy = torsoTop + torsoH * 0.42, r = torsoW * 0.14;
  for (let i = 0; i < 5; i++) {
    const ang = -Math.PI / 2 + i * (Math.PI * 2 / 5);
    const ang2 = ang + Math.PI / 5;
    if (i === 0) ctx.moveTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    else ctx.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r);
    ctx.lineTo(cx + Math.cos(ang2) * r * 0.45, cy + Math.sin(ang2) * r * 0.45);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function paintHeroMask(ctx, p, hcx, hcy, headR) {
  ctx.fillStyle = p.suit;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(hcx, hcy + headR * 0.02, headR * 0.95, headR * 0.28, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function paintAstroBody(ctx, hcx, torsoTop, torsoW, torsoH) {
  const grad = ctx.createLinearGradient(hcx, torsoTop, hcx, torsoTop + torsoH);
  grad.addColorStop(0, '#f5f5f5');
  grad.addColorStop(1, '#c9ccd1');
  roundedRectPath(ctx, hcx - torsoW / 2, torsoTop, torsoW, torsoH, torsoW * 0.22);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#3a4a5a';
  roundedRectPath(ctx, hcx - torsoW * 0.22, torsoTop + torsoH * 0.35, torsoW * 0.44, torsoH * 0.28, 5);
  ctx.fill();
  ['#e04444', '#44c9e0', '#e0d044'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(hcx - torsoW * 0.14 + i * torsoW * 0.14, torsoTop + torsoH * 0.49, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#9aa0a8';
  roundedRectPath(ctx, hcx - torsoW * 0.3, torsoTop - 6, torsoW * 0.6, 10, 5);
  ctx.fill();
}

function paintAstroHelmet(ctx, hcx, hcy, headR) {
  ctx.fillStyle = 'rgba(150,200,230,0.35)';
  ctx.strokeStyle = '#e8e8e8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(hcx, hcy, headR * 1.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(hcx - headR * 0.4, hcy - headR * 0.5, headR * 0.3, 0, Math.PI * 1.3);
  ctx.stroke();
}

function paintRobotBody(ctx, hcx, torsoTop, torsoW, torsoH) {
  const grad = ctx.createLinearGradient(hcx, torsoTop, hcx, torsoTop + torsoH);
  grad.addColorStop(0, '#c9ccd1');
  grad.addColorStop(1, '#8a8f96');
  roundedRectPath(ctx, hcx - torsoW / 2, torsoTop, torsoW, torsoH, 8);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(60,60,70,0.5)';
  ctx.lineWidth = 1.5;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(hcx - torsoW / 2, torsoTop + (i * torsoH) / 3);
    ctx.lineTo(hcx + torsoW / 2, torsoTop + (i * torsoH) / 3);
    ctx.stroke();
  }
  ctx.fillStyle = '#4ae0ff';
  ctx.beginPath();
  ctx.arc(hcx, torsoTop + torsoH * 0.4, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function paintRobotHead(ctx, hcx, hcy, headR) {
  ctx.strokeStyle = '#8a8f96';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(hcx, hcy - headR * 0.9);
  ctx.lineTo(hcx, hcy - headR * 1.4);
  ctx.stroke();
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(hcx, hcy - headR * 1.4, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(74,224,255,0.4)';
  ctx.strokeStyle = '#3a4a5a';
  ctx.lineWidth = 2;
  roundedRectPath(ctx, hcx - headR * 0.7, hcy - headR * 0.15, headR * 1.4, headR * 0.4, 6);
  ctx.fill();
  ctx.stroke();
}

function paintRefereeBody(ctx, hcx, torsoTop, torsoW, torsoH) {
  ctx.save();
  roundedRectPath(ctx, hcx - torsoW / 2, torsoTop, torsoW, torsoH, torsoW * 0.22);
  ctx.clip();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(hcx - torsoW / 2, torsoTop, torsoW, torsoH);
  ctx.fillStyle = '#161616';
  const stripeW = torsoW / 7;
  for (let i = 0; i < 7; i += 2) ctx.fillRect(hcx - torsoW / 2 + i * stripeW, torsoTop, stripeW, torsoH);
  ctx.restore();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  roundedRectPath(ctx, hcx - torsoW / 2, torsoTop, torsoW, torsoH, torsoW * 0.22);
  ctx.stroke();

  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(hcx, torsoTop - 4);
  ctx.lineTo(hcx, torsoTop + torsoH * 0.3);
  ctx.stroke();
  ctx.fillStyle = '#e0c04a';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(hcx, torsoTop + torsoH * 0.35, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function paintBoxerBody(ctx, hcx, torsoTop, torsoW, torsoH) {
  const grad = ctx.createLinearGradient(hcx, torsoTop, hcx, torsoTop + torsoH);
  grad.addColorStop(0, shade(SKIN, 0.1));
  grad.addColorStop(1, SKIN_SHADOW);
  roundedRectPath(ctx, hcx - torsoW * 0.4, torsoTop + 4, torsoW * 0.8, torsoH * 0.62, torsoW * 0.18);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#d9302f';
  roundedRectPath(ctx, hcx - torsoW * 0.46, torsoTop + torsoH * 0.62, torsoW * 0.92, torsoH * 0.42, 8);
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  roundedRectPath(ctx, hcx - torsoW * 0.46, torsoTop + torsoH * 0.62, torsoW * 0.92, torsoH * 0.08, 4);
  ctx.fill();
}

function paintKarateBody(ctx, hcx, torsoTop, torsoW, torsoH) {
  roundedRectPath(ctx, hcx - torsoW / 2, torsoTop, torsoW, torsoH, torsoW * 0.22);
  ctx.fillStyle = '#f5f5f0';
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(hcx - torsoW * 0.3, torsoTop + 2);
  ctx.lineTo(hcx + torsoW * 0.15, torsoTop + torsoH * 0.7);
  ctx.stroke();
  ctx.fillStyle = '#1a1a1a';
  roundedRectPath(ctx, hcx - torsoW / 2 - 2, torsoTop + torsoH * 0.55, torsoW + 4, torsoH * 0.16, 3);
  ctx.fill();
}

function paintBananaBody(ctx, hcx, torsoTop, torsoW, torsoH) {
  const grad = ctx.createLinearGradient(hcx, torsoTop, hcx, torsoTop + torsoH);
  grad.addColorStop(0, '#ffe066');
  grad.addColorStop(1, '#e8b923');
  roundedRectPath(ctx, hcx - torsoW * 0.44, torsoTop, torsoW * 0.88, torsoH, torsoW * 0.35);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(150,100,10,0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(hcx, torsoTop + 4);
  ctx.lineTo(hcx, torsoTop + torsoH - 4);
  ctx.stroke();
}

function paintBananaHood(ctx, hcx, hcy, headR) {
  ctx.fillStyle = '#e8b923';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(hcx + side * headR * 0.3, hcy - headR * 0.8);
    ctx.quadraticCurveTo(hcx + side * headR * 1.1, hcy - headR * 0.6, hcx + side * headR * 0.9, hcy + headR * 0.3);
    ctx.quadraticCurveTo(hcx + side * headR * 0.7, hcy - headR * 0.2, hcx + side * headR * 0.5, hcy - headR * 0.75);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
}

const OUTFIT_BODY_PAINTERS = {
  onesie: (ctx, p, hcx, torsoTop, torsoW, torsoH) => paintOnesieBody(ctx, p, hcx, torsoTop, torsoW, torsoH),
  hero: (ctx, p, hcx, torsoTop, torsoW, torsoH) => paintHeroBody(ctx, p, hcx, torsoTop, torsoW, torsoH),
  astro: (ctx, p, hcx, torsoTop, torsoW, torsoH) => paintAstroBody(ctx, hcx, torsoTop, torsoW, torsoH),
  robot: (ctx, p, hcx, torsoTop, torsoW, torsoH) => paintRobotBody(ctx, hcx, torsoTop, torsoW, torsoH),
  referee: (ctx, p, hcx, torsoTop, torsoW, torsoH) => paintRefereeBody(ctx, hcx, torsoTop, torsoW, torsoH),
  boxer: (ctx, p, hcx, torsoTop, torsoW, torsoH) => paintBoxerBody(ctx, hcx, torsoTop, torsoW, torsoH),
  karate: (ctx, p, hcx, torsoTop, torsoW, torsoH) => paintKarateBody(ctx, hcx, torsoTop, torsoW, torsoH),
  banana: (ctx, p, hcx, torsoTop, torsoW, torsoH) => paintBananaBody(ctx, hcx, torsoTop, torsoW, torsoH),
};

const OUTFIT_HEAD_PAINTERS = {
  onesie: (ctx, p, hcx, hcy, headR) => paintOnesieHead(ctx, p, hcx, hcy, headR),
  hero: (ctx, p, hcx, hcy, headR) => paintHeroMask(ctx, p, hcx, hcy, headR),
  astro: (ctx, p, hcx, hcy, headR) => paintAstroHelmet(ctx, hcx, hcy, headR),
  robot: (ctx, p, hcx, hcy, headR) => paintRobotHead(ctx, hcx, hcy, headR),
  banana: (ctx, p, hcx, hcy, headR) => paintBananaHood(ctx, hcx, hcy, headR),
};

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
  const skin = getSkin(player.skin || 'default');

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

  // remera (o el disfraz elegido)
  if (skin.id === 'default' || !OUTFIT_BODY_PAINTERS[skin.body]) {
    drawJersey(ctx, player.club, hcx, torsoTop, torsoW, torsoH, number);
  } else {
    OUTFIT_BODY_PAINTERS[skin.body](ctx, skin.params || {}, hcx, torsoTop, torsoW, torsoH);
  }

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

  // accesorio de cabeza del disfraz (orejas, casco, capucha, etc.)
  if (skin.id !== 'default' && OUTFIT_HEAD_PAINTERS[skin.body]) {
    OUTFIT_HEAD_PAINTERS[skin.body](ctx, skin.params || {}, hcx, hcy, headR);
  }

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
// La clave incluye el skin (si no es el de por defecto) para no mezclar looks distintos
// del mismo personaje en la caché de texturas de Phaser.
function charTextureKey(prefix, player) {
  const skinId = player.skin || 'default';
  return skinId === 'default' ? `${prefix}_${player.id}` : `${prefix}_${player.id}_${skinId}`;
}

// Retrato para pantallas de selección / escalera de rivales
function generatePortrait(scene, player, targetH = 220) {
  const key = charTextureKey('portrait', player);
  const w = Math.round(targetH * (VW / VH));
  return makeCanvasTexture(scene, key, w, targetH, (ctx) => {
    paintCharacter(ctx, player, w, targetH, { number: player.number });
  });
}

// Cuerpo completo (de pie) usado como rig base en la pelea
function generateBody(scene, player, targetH = 380) {
  const key = charTextureKey('body', player);
  const w = Math.round(targetH * (VW / VH));
  return makeCanvasTexture(scene, key, w, targetH, (ctx) => {
    paintCharacter(ctx, player, w, targetH, { number: player.number });
  });
}

// Miniatura chica para la grilla de selección de skins (clave propia para no
// pisar la textura de portrait_ de tamaño completo con una versión borrosa).
function generateSkinPreview(scene, player, targetH = 90) {
  const skinId = player.skin || 'default';
  const key = `skinpreview_${player.id}_${skinId}`;
  const w = Math.round(targetH * (VW / VH));
  return makeCanvasTexture(scene, key, w, targetH, (ctx) => {
    paintCharacter(ctx, player, w, targetH, { number: player.number });
  });
}

// Puño y pie: ahora los golpes se dan con el cuerpo, no con útiles.
// Igual que antes con las armas, el dibujo deja el "mango" (muñeca/tobillo)
// cerca del borde izquierdo, para poder anclar y rotar el sprite desde ahí.
function generateFistTexture(scene) {
  const key = 'fist';
  return makeCanvasTexture(scene, key, 60, 34, (ctx) => {
    ctx.fillStyle = SKIN;
    roundedRectPath(ctx, 0, 11, 20, 12, 4);
    ctx.fill();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const grad = ctx.createRadialGradient(38, 13, 2, 40, 17, 20);
    grad.addColorStop(0, shade(SKIN, 0.18));
    grad.addColorStop(1, SKIN_SHADOW);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(40, 17, 19, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(120,80,50,0.45)';
    ctx.lineWidth = 1.3;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(38 + i * 7, 6);
      ctx.lineTo(38 + i * 7, 14);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(180,120,80,0.5)';
    ctx.beginPath();
    ctx.ellipse(30, 22, 5, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function generateShoeTexture(scene) {
  const key = 'shoe';
  return makeCanvasTexture(scene, key, 66, 30, (ctx) => {
    ctx.fillStyle = SKIN;
    roundedRectPath(ctx, 0, 9, 18, 12, 4);
    ctx.fill();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#2a2a2a';
    roundedRectPath(ctx, 14, 5, 34, 18, 7);
    ctx.fill();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(44, 6);
    ctx.lineTo(65, 15);
    ctx.lineTo(44, 24);
    ctx.closePath();
    ctx.fillStyle = '#2a2a2a';
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#eef0f2';
    roundedRectPath(ctx, 14, 21, 46, 6, 3);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(20, 11); ctx.lineTo(34, 8);
    ctx.moveTo(20, 16); ctx.lineTo(34, 13);
    ctx.stroke();
  });
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
