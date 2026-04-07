import { drawFocusedCover } from '../../vision/lib/faceFocus';

const STYLE_RENDER_PROFILES = {
  fade: {
    accent: '#67e8f9',
    secondary: '#0ea5e9',
    hueRotate: -10,
    saturation: 0.95,
    contrast: 1.08,
    brightness: 0.92,
  },
  perm: {
    accent: '#f9a8d4',
    secondary: '#fb7185',
    hueRotate: 8,
    saturation: 1.08,
    contrast: 1.02,
    brightness: 0.96,
  },
  middle: {
    accent: '#fcd34d',
    secondary: '#f59e0b',
    hueRotate: 2,
    saturation: 1.02,
    contrast: 1.06,
    brightness: 0.95,
  },
  mullet: {
    accent: '#f97316',
    secondary: '#fbbf24',
    hueRotate: 12,
    saturation: 1.1,
    contrast: 1.04,
    brightness: 0.9,
  },
  buzz: {
    accent: '#22d3ee',
    secondary: '#a5f3fc',
    hueRotate: -18,
    saturation: 0.88,
    contrast: 1.14,
    brightness: 0.88,
  },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    if (!source.startsWith('data:')) {
      image.crossOrigin = 'anonymous';
    }

    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The portrait could not be rendered into a local simulation.'));
    image.src = source;
  });
}

function drawHairShape(context, styleId, centerX, hairlineY, headWidth, hairHeight) {
  const left = centerX - headWidth / 2;
  const right = centerX + headWidth / 2;
  const crownY = hairlineY - hairHeight;

  context.beginPath();

  if (styleId === 'fade') {
    context.moveTo(left + headWidth * 0.12, hairlineY + hairHeight * 0.2);
    context.quadraticCurveTo(left - headWidth * 0.06, hairlineY, left + headWidth * 0.18, crownY + hairHeight * 0.36);
    context.quadraticCurveTo(centerX, crownY - hairHeight * 0.12, right - headWidth * 0.18, crownY + hairHeight * 0.34);
    context.quadraticCurveTo(right + headWidth * 0.04, hairlineY, right - headWidth * 0.12, hairlineY + hairHeight * 0.22);
  } else if (styleId === 'perm') {
    context.moveTo(left + headWidth * 0.08, hairlineY + hairHeight * 0.26);
    context.bezierCurveTo(left - headWidth * 0.02, crownY + hairHeight * 0.62, left + headWidth * 0.08, crownY + hairHeight * 0.08, centerX - headWidth * 0.12, crownY + hairHeight * 0.14);
    context.bezierCurveTo(centerX - headWidth * 0.02, crownY - hairHeight * 0.1, centerX + headWidth * 0.04, crownY + hairHeight * 0.08, centerX + headWidth * 0.14, crownY + hairHeight * 0.04);
    context.bezierCurveTo(right - headWidth * 0.02, crownY + hairHeight * 0.18, right + headWidth * 0.02, crownY + hairHeight * 0.66, right - headWidth * 0.08, hairlineY + hairHeight * 0.28);
  } else if (styleId === 'middle') {
    context.moveTo(left + headWidth * 0.1, hairlineY + hairHeight * 0.3);
    context.quadraticCurveTo(left + headWidth * 0.02, crownY + hairHeight * 0.58, centerX - headWidth * 0.08, crownY + hairHeight * 0.14);
    context.lineTo(centerX, crownY + hairHeight * 0.22);
    context.lineTo(centerX + headWidth * 0.08, crownY + hairHeight * 0.14);
    context.quadraticCurveTo(right - headWidth * 0.02, crownY + hairHeight * 0.58, right - headWidth * 0.1, hairlineY + hairHeight * 0.3);
  } else if (styleId === 'mullet') {
    context.moveTo(left + headWidth * 0.08, hairlineY + hairHeight * 0.24);
    context.quadraticCurveTo(left - headWidth * 0.04, crownY + hairHeight * 0.44, left + headWidth * 0.16, crownY + hairHeight * 0.14);
    context.quadraticCurveTo(centerX, crownY - hairHeight * 0.08, right - headWidth * 0.16, crownY + hairHeight * 0.14);
    context.quadraticCurveTo(right + headWidth * 0.06, crownY + hairHeight * 0.46, right - headWidth * 0.02, hairlineY + hairHeight * 0.2);
    context.lineTo(right - headWidth * 0.02, hairlineY + hairHeight * 0.62);
    context.quadraticCurveTo(centerX + headWidth * 0.12, hairlineY + hairHeight * 0.96, centerX + headWidth * 0.04, hairlineY + hairHeight * 1.22);
    context.quadraticCurveTo(centerX - headWidth * 0.08, hairlineY + hairHeight * 0.98, left + headWidth * 0.12, hairlineY + hairHeight * 0.62);
  } else {
    context.moveTo(left + headWidth * 0.12, hairlineY + hairHeight * 0.2);
    context.quadraticCurveTo(left + headWidth * 0.18, crownY + hairHeight * 0.16, centerX, crownY + hairHeight * 0.04);
    context.quadraticCurveTo(right - headWidth * 0.18, crownY + hairHeight * 0.16, right - headWidth * 0.12, hairlineY + hairHeight * 0.2);
  }

  context.lineTo(right - headWidth * 0.18, hairlineY + hairHeight * 0.38);
  context.quadraticCurveTo(centerX, hairlineY + hairHeight * 0.24, left + headWidth * 0.18, hairlineY + hairHeight * 0.38);
  context.closePath();
}

function drawTexture(context, styleId, centerX, hairlineY, headWidth, hairHeight, accent) {
  context.save();
  context.strokeStyle = accent;
  context.lineWidth = Math.max(5, headWidth * 0.02);
  context.lineCap = 'round';
  context.globalAlpha = 0.75;

  if (styleId === 'perm') {
    for (let index = 0; index < 5; index += 1) {
      const x = centerX - headWidth * 0.22 + index * headWidth * 0.11;
      context.beginPath();
      context.bezierCurveTo(
        x,
        hairlineY - hairHeight * 0.46,
        x - headWidth * 0.06,
        hairlineY - hairHeight * 0.2,
        x + headWidth * 0.05,
        hairlineY - hairHeight * 0.02,
      );
      context.stroke();
    }
  } else if (styleId === 'middle') {
    context.beginPath();
    context.moveTo(centerX, hairlineY - hairHeight * 0.48);
    context.lineTo(centerX, hairlineY - hairHeight * 0.02);
    context.stroke();
  } else if (styleId === 'fade') {
    for (let index = 0; index < 4; index += 1) {
      const leftX = centerX - headWidth * 0.34 + index * headWidth * 0.06;
      const rightX = centerX + headWidth * 0.34 - index * headWidth * 0.06;

      context.beginPath();
      context.moveTo(leftX, hairlineY + hairHeight * 0.18);
      context.lineTo(leftX, hairlineY - hairHeight * 0.1 + index * 8);
      context.stroke();

      context.beginPath();
      context.moveTo(rightX, hairlineY + hairHeight * 0.18);
      context.lineTo(rightX, hairlineY - hairHeight * 0.1 + index * 8);
      context.stroke();
    }
  } else if (styleId === 'mullet') {
    context.beginPath();
    context.moveTo(centerX + headWidth * 0.16, hairlineY + hairHeight * 0.28);
    context.quadraticCurveTo(centerX + headWidth * 0.3, hairlineY + hairHeight * 0.62, centerX + headWidth * 0.1, hairlineY + hairHeight * 1.02);
    context.stroke();
    context.beginPath();
    context.moveTo(centerX - headWidth * 0.1, hairlineY + hairHeight * 0.24);
    context.quadraticCurveTo(centerX - headWidth * 0.26, hairlineY + hairHeight * 0.58, centerX - headWidth * 0.05, hairlineY + hairHeight * 0.96);
    context.stroke();
  } else {
    context.beginPath();
    context.moveTo(centerX - headWidth * 0.16, hairlineY - hairHeight * 0.18);
    context.quadraticCurveTo(centerX, hairlineY - hairHeight * 0.28, centerX + headWidth * 0.16, hairlineY - hairHeight * 0.18);
    context.stroke();
  }

  context.restore();
}

function drawHonestyChip(context, style, plan, profile, canvasWidth) {
  const chipWidth = 328;
  const chipHeight = 78;
  const chipX = canvasWidth - chipWidth - 54;
  const chipY = 52;

  context.save();
  context.fillStyle = 'rgba(2, 6, 23, 0.66)';
  context.strokeStyle = 'rgba(255,255,255,0.14)';
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(chipX, chipY, chipWidth, chipHeight, 24);
  context.fill();
  context.stroke();
  context.fillStyle = profile.accent;
  context.font = '700 22px Outfit';
  context.fillText('AI Simulation', chipX + 24, chipY + 30);
  context.fillStyle = 'rgba(248,250,252,0.8)';
  context.font = '400 18px Outfit';
  context.fillText(`${style.name} | ${plan.source === 'local-llm' ? 'Local LLM guided' : 'Heuristic guided'}`, chipX + 24, chipY + 57);
  context.restore();
}

export async function generateStudioSimulation({
  sourceImage,
  style,
  visionSnapshot,
  analysisPlan,
}) {
  const image = await loadImage(sourceImage);
  const profile = STYLE_RENDER_PROFILES[style.id] ?? STYLE_RENDER_PROFILES.fade;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas rendering is unavailable in this browser.');
  }

  canvas.width = 864;
  canvas.height = 1152;

  const background = context.createLinearGradient(0, 0, 0, canvas.height);
  background.addColorStop(0, '#020617');
  background.addColorStop(0.45, '#111827');
  background.addColorStop(1, '#020617');
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.save();
  context.filter = `saturate(${profile.saturation}) contrast(${profile.contrast}) brightness(${profile.brightness}) hue-rotate(${profile.hueRotate}deg)`;
  drawFocusedCover(
    context,
    image,
    { x: 0, y: 0, width: canvas.width, height: canvas.height },
    visionSnapshot?.focusBox ?? null,
  );
  context.restore();

  const vignette = context.createRadialGradient(
    canvas.width / 2,
    canvas.height * 0.35,
    canvas.width * 0.12,
    canvas.width / 2,
    canvas.height * 0.5,
    canvas.width * 0.72,
  );
  vignette.addColorStop(0, 'rgba(15, 23, 42, 0)');
  vignette.addColorStop(1, 'rgba(2, 6, 23, 0.42)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const focusBox = visionSnapshot?.focusBox;
  const centerX = (focusBox?.centerX ?? 0.5) * canvas.width;
  const hairlineY = clamp((focusBox?.top ?? 0.2) * canvas.height - 24, 180, 620);
  const headWidth = clamp((focusBox?.width ?? 0.28) * canvas.width * 1.3, 360, 560);
  const hairHeight = clamp((focusBox?.height ?? 0.42) * canvas.height * 0.22, 150, 290);

  context.save();
  context.globalAlpha = 0.88;
  const hairGradient = context.createLinearGradient(0, hairlineY - hairHeight, 0, hairlineY + hairHeight);
  hairGradient.addColorStop(0, 'rgba(2, 6, 23, 0.92)');
  hairGradient.addColorStop(0.55, `${profile.secondary}cc`);
  hairGradient.addColorStop(1, 'rgba(15, 23, 42, 0.68)');
  context.fillStyle = hairGradient;
  drawHairShape(context, style.id, centerX, hairlineY, headWidth, hairHeight);
  context.fill();
  context.restore();

  context.save();
  context.shadowColor = `${profile.accent}88`;
  context.shadowBlur = 32;
  drawTexture(context, style.id, centerX, hairlineY, headWidth, hairHeight, profile.accent);
  context.restore();

  context.fillStyle = 'rgba(2, 6, 23, 0.2)';
  context.fillRect(0, canvas.height - 280, canvas.width, 280);

  const footerGlow = context.createLinearGradient(0, canvas.height - 300, 0, canvas.height);
  footerGlow.addColorStop(0, 'rgba(2, 6, 23, 0)');
  footerGlow.addColorStop(1, `${profile.secondary}30`);
  context.fillStyle = footerGlow;
  context.fillRect(0, canvas.height - 320, canvas.width, 320);

  context.fillStyle = '#f8fafc';
  context.font = '700 58px Outfit';
  context.fillText(style.name, 64, canvas.height - 150);
  context.font = '400 28px Outfit';
  context.fillStyle = 'rgba(248,250,252,0.8)';
  context.fillText(
    analysisPlan.barberBrief.slice(0, 76),
    64,
    canvas.height - 102,
  );
  context.fillStyle = profile.accent;
  context.font = '600 24px Outfit';
  context.fillText(
    `${analysisPlan.faceShape} face | ${analysisPlan.compatibility} compatibility | On-device render`,
    64,
    canvas.height - 58,
  );

  drawHonestyChip(context, style, analysisPlan, profile, canvas.width);

  return canvas.toDataURL('image/jpeg', 0.86);
}