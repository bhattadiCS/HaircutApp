function toDataUrl(svgMarkup) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarkup)}`;
}

function createStyleSvg({
  title,
  subtitle,
  palette,
  accent,
  silhouettePath,
  detailPath,
}) {
  return toDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" role="img" aria-label="${title} preview art">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="100%" stop-color="${palette[1]}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="18%" r="72%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.58" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="420" rx="42" fill="url(#bg)" />
      <rect width="300" height="420" rx="42" fill="url(#glow)" />
      <circle cx="230" cy="82" r="64" fill="${accent}" fill-opacity="0.18" />
      <path d="M54 362c28-52 76-86 143-104 30-7 58-10 84-8v94H54Z" fill="rgba(255,255,255,0.07)" />
      <ellipse cx="150" cy="218" rx="76" ry="104" fill="#f8fafc" fill-opacity="0.92" />
      <path d="${silhouettePath}" fill="#08111f" fill-opacity="0.94" />
      <path d="${detailPath}" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.82" />
      <rect x="26" y="26" width="106" height="26" rx="13" fill="rgba(2,6,23,0.45)" stroke="rgba(255,255,255,0.14)" />
      <text x="40" y="43" fill="#f8fafc" font-size="11" font-family="Outfit, Segoe UI, sans-serif" letter-spacing="2">STYLESHIFT</text>
      <text x="30" y="350" fill="#f8fafc" font-size="26" font-weight="700" font-family="Outfit, Segoe UI, sans-serif">${title}</text>
      <text x="30" y="378" fill="rgba(248,250,252,0.74)" font-size="13" font-family="Outfit, Segoe UI, sans-serif">${subtitle}</text>
    </svg>
  `);
}

function createVibeSvg({ label, desc, palette, accent, bandPath }) {
  return toDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 720" role="img" aria-label="${label} vibe illustration">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="100%" stop-color="${palette[1]}" />
        </linearGradient>
        <radialGradient id="wash" cx="78%" cy="16%" r="64%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.54" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="560" height="720" rx="52" fill="url(#bg)" />
      <rect width="560" height="720" rx="52" fill="url(#wash)" />
      <path d="${bandPath}" fill="rgba(255,255,255,0.08)" />
      <circle cx="424" cy="132" r="104" fill="${accent}" fill-opacity="0.18" />
      <circle cx="170" cy="280" r="144" fill="rgba(255,255,255,0.07)" />
      <rect x="44" y="48" width="142" height="34" rx="17" fill="rgba(2,6,23,0.42)" stroke="rgba(255,255,255,0.14)" />
      <text x="60" y="70" fill="#f8fafc" font-size="15" font-family="Outfit, Segoe UI, sans-serif" letter-spacing="3">STYLESHIFT</text>
      <text x="48" y="598" fill="#f8fafc" font-size="64" font-weight="700" font-family="Outfit, Segoe UI, sans-serif">${label}</text>
      <text x="48" y="646" fill="rgba(248,250,252,0.78)" font-size="26" font-family="Outfit, Segoe UI, sans-serif">${desc}</text>
    </svg>
  `);
}

export const STYLE_PREVIEW_ART = {
  fade: createStyleSvg({
    title: 'Skin Fade',
    subtitle: 'Tight taper with crisp contour',
    palette: ['#071a24', '#111827'],
    accent: '#67e8f9',
    silhouettePath:
      'M86 190c6-43 34-82 67-95 44-18 92 3 111 50 8 18 10 38 7 54-12-20-31-35-57-43-17-5-39-8-63-4-18 3-34 9-48 18-10 6-18 13-23 20 0-1 2-11 6-25Z',
    detailPath: 'M98 214c16-24 42-38 76-42M94 246c14-18 31-29 53-34M188 164c19 6 36 18 50 36',
  }),
  perm: createStyleSvg({
    title: 'Modern Perm',
    subtitle: 'Wave-led volume with soft motion',
    palette: ['#1a0b1f', '#172033'],
    accent: '#f9a8d4',
    silhouettePath:
      'M78 206c8-50 43-95 85-103 28-5 53 5 72 27 17 20 29 48 28 79-13-18-28-30-44-38-14-7-31-9-47-8-31 3-61 18-94 43Z',
    detailPath: 'M96 194c18-18 35-30 52-36M148 148c14 4 27 14 38 28M184 154c12 7 23 18 34 33M110 235c18-8 34-13 50-14',
  }),
  middle: createStyleSvg({
    title: 'Middle Part',
    subtitle: 'Balanced curtain with clean symmetry',
    palette: ['#0b1323', '#1f2937'],
    accent: '#fde68a',
    silhouettePath:
      'M84 202c5-47 35-92 76-103 18-5 39-2 59 8 18 10 32 28 39 52-23-20-47-30-71-31-25 0-51 9-78 28-13 9-22 18-25 22Z',
    detailPath: 'M150 128c0 28 2 50 6 66M116 175c14-13 25-22 36-28M184 150c10 7 22 18 36 34',
  }),
  mullet: createStyleSvg({
    title: 'Modern Mullet',
    subtitle: 'Short crown with directional tail',
    palette: ['#1a1208', '#172033'],
    accent: '#fbbf24',
    silhouettePath:
      'M82 195c8-41 35-79 67-91 31-12 70-6 99 19 21 19 36 48 38 80-18-17-39-26-61-28-21-2-44 3-64 15-15 9-29 21-41 34-8 9-14 18-19 28-2-19-1-39 5-57 6 20 18 38 34 53-5-26-4-50 2-72Z',
    detailPath: 'M98 204c15-13 32-23 52-29M178 160c20 8 37 22 50 43M196 246c16 14 31 32 44 54',
  }),
  buzz: createStyleSvg({
    title: 'Buzz Cut',
    subtitle: 'Minimal crop with strong outline',
    palette: ['#0f172a', '#111827'],
    accent: '#a5f3fc',
    silhouettePath:
      'M98 218c4-37 26-69 56-83 31-15 73-12 104 7 23 14 39 38 42 68-25-13-51-20-77-21-36 0-72 11-108 29Z',
    detailPath: 'M110 198c23-9 46-13 69-12M188 186c20 2 39 7 58 16',
  }),
};

export const VIBE_PREVIEW_ART = {
  street: createVibeSvg({
    label: 'Street',
    desc: 'Urban texture and sharp contrast',
    palette: ['#111827', '#050816'],
    accent: '#22d3ee',
    bandPath: 'M0 506c79-74 155-113 230-117 68-4 146 21 234 74 32 19 64 43 96 73v148H0Z',
  }),
  classic: createVibeSvg({
    label: 'Classic',
    desc: 'Tailored polish with quiet structure',
    palette: ['#1f2937', '#0f172a'],
    accent: '#f59e0b',
    bandPath: 'M0 548c87-60 171-89 252-87 67 1 142 24 226 70 30 16 58 35 82 57v132H0Z',
  }),
  flow: createVibeSvg({
    label: 'Flow',
    desc: 'Relaxed movement and softer edges',
    palette: ['#0b1323', '#172554'],
    accent: '#c084fc',
    bandPath: 'M0 470c72 31 141 47 207 49 77 2 167-16 271-54 30-11 58-22 82-35v290H0Z',
  }),
};