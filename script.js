/**
 * Eye -> Space | High-Performance ASCII Universe Engine
 * Replicating the mesmerizing procedural ASCII animation from the video.
 */

// ==========================================
// 1. THEMES DEFINITION (from video code)
// ==========================================
const THEMES = [
  {
    name: "Aurora",
    subtitle: "cold aurora: cyan iris, violet heart nebula, ice stars",
    space: [1, 2, 4],
    cloud_a: [13, 46, 115],
    cloud_b: [77, 26, 153],
    iris_a: [26, 184, 225],
    iris_b: [18, 33, 115],
    iris_glow: [0, 66, 87],
    sclera: [199, 214, 235],
    skin: [128, 92, 92],
    heart_deep: [107, 36, 235],
    heart_light: [235, 140, 255],
    star_a: [166, 224, 255],
    star_b: [217, 179, 255]
  },
  {
    name: "Emerald & Gold",
    subtitle: "emerald eye, molten-gold heart nebula, jade dust",
    space: [1, 2, 3],
    cloud_a: [8, 77, 56],
    cloud_b: [115, 64, 15],
    iris_a: [38, 199, 97],
    iris_b: [8, 56, 26],
    iris_glow: [26, 71, 10],
    sclera: [219, 219, 204],
    skin: [153, 107, 77],
    heart_deep: [242, 107, 13],
    heart_light: [255, 230, 100],
    star_a: [160, 255, 190],
    star_b: [255, 220, 120]
  },
  {
    name: "Dusk",
    subtitle: "rose-coral heart nebula, dusk purple iris, twilight aura",
    space: [4, 1, 3],
    cloud_a: [75, 15, 50],
    cloud_b: [35, 10, 65],
    iris_a: [244, 63, 94],
    iris_b: [136, 19, 55],
    iris_glow: [90, 15, 40],
    sclera: [225, 205, 215],
    skin: [140, 85, 95],
    heart_deep: [225, 29, 72],
    heart_light: [254, 205, 211],
    star_a: [255, 180, 200],
    star_b: [220, 180, 255]
  },
  {
    name: "Classic Matrix",
    subtitle: "phosphor green terminal, binary void, cyber matrix eye",
    space: [1, 3, 1],
    cloud_a: [10, 60, 20],
    cloud_b: [5, 40, 15],
    iris_a: [34, 197, 94],
    iris_b: [15, 95, 40],
    iris_glow: [10, 80, 25],
    sclera: [160, 230, 180],
    skin: [40, 80, 50],
    heart_deep: [34, 197, 94],
    heart_light: [187, 247, 208],
    star_a: [134, 239, 172],
    star_b: [74, 222, 128]
  },
  {
    name: "Solar Flare",
    subtitle: "stellar corona, fiery obsidian pupil, incandescent heart",
    space: [4, 1, 1],
    cloud_a: [120, 40, 10],
    cloud_b: [80, 15, 5],
    iris_a: [249, 115, 22],
    iris_b: [154, 52, 18],
    iris_glow: [90, 30, 5],
    sclera: [240, 220, 200],
    skin: [150, 80, 60],
    heart_deep: [239, 68, 68],
    heart_light: [254, 240, 138],
    star_a: [253, 186, 116],
    star_b: [254, 202, 202]
  },
  {
    name: "Cyber Amethyst",
    subtitle: "electric violet eye, ultraviolet singularity, stardust veil",
    space: [3, 1, 5],
    cloud_a: [70, 20, 110],
    cloud_b: [20, 50, 100],
    iris_a: [168, 85, 247],
    iris_b: [88, 28, 135],
    iris_glow: [60, 20, 90],
    sclera: [210, 200, 235],
    skin: [110, 80, 120],
    heart_deep: [147, 51, 234],
    heart_light: [232, 121, 249],
    star_a: [216, 180, 254],
    star_b: [147, 197, 253]
  }
];

// ==========================================
// 2. ASCII GLYPH RAMPS (as seen in video)
// ==========================================
// The characters visible in the original video code & render:
const RAMP_CHARS = " .':-+*#%@$";
const GLYPH_EDGE_HORIZ = ["-", "=", "~", "—"];
const GLYPH_EDGE_VERT = ["|", "!", "l", "1"];
const GLYPH_EDGE_SLASH = ["/", "r", "t", "f", "j"];
const GLYPH_EDGE_BACKSLASH = ["\\", "x", "v", "z"];
const GLYPH_DENSE = ["@", "%", "#", "&", "8", "B", "W", "M", "Q", "0"];
const GLYPH_MID = ["o", "a", "h", "k", "b", "d", "p", "q", "Z", "X", "C", "J", "U", "Y"];
const GLYPH_LIGHT = ["*", "+", "=", "-", "~", ":", "^", "'", "`", "."];
const CODE_SYMBOLS = ["{", "}", "[", "]", "(", ")", "<", ">", "/", "\\", "|", "_", "~", "$", "#", "@"];

// ==========================================
// 3. ENGINE STATE & CONFIG
// ==========================================
const state = {
  themeIdx: 0,
  mode: "auto", // 'auto', 'gaze', 'space'
  paused: false,
  zoom: 1.0,
  targetZoom: 1.0,
  speed: 1.0,
  charSize: 13, // pixels per char
  bloom: 12,
  autoBlink: true,
  audioEnabled: false,

  // Eye physical metrics
  eye: {
    gazeX: 0,
    gazeY: 0,
    targetGazeX: 0,
    targetGazeY: 0,
    blink: 0, // 0 = fully open, 1 = closed
    blinkSpeed: 0,
    pupilDilation: 1.0
  },

  // Mouse & Screen
  mouse: {
    x: 0,
    y: 0,
    down: false,
    lastX: 0,
    lastY: 0,
    isHovering: false
  },

  // Performance
  fps: 60,
  lastFrameTime: performance.now(),
  time: 0
};

// ==========================================
// 4. CANVAS & GRID SETUP
// ==========================================
const canvas = document.getElementById("asciiCanvas");
const ctx = canvas.getContext("2d", { alpha: false });

let cols = 120;
let rows = 60;
let charWidth = 9;
let charHeight = 15;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";

  ctx.scale(dpr, dpr);
  ctx.font = `${state.charSize}px "Fira Code", monospace`;
  ctx.textBaseline = "top";

  const metrics = ctx.measureText("M");
  charWidth = metrics.width || 8;
  charHeight = state.charSize * 1.25;

  cols = Math.ceil(w / charWidth) + 1;
  rows = Math.ceil(h / charHeight) + 1;
}

window.addEventListener("resize", resizeCanvas);

// ==========================================
// 5. PROCEDURAL NOISE (FBM & SIMPLEX)
// ==========================================
// Fast deterministic pseudo-random permutation table
const P = new Uint8Array(512);
(function initNoise() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let seed = 42;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    const tmp = p[i];
    p[i] = p[j];
    p[j] = tmp;
  }
  for (let i = 0; i < 512; i++) {
    P[i] = p[i & 255];
  }
})();

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a, b, t) { return a + t * (b - a); }
function grad(hash, x, y) {
  const h = hash & 7;
  const u = h < 4 ? x : y;
  const v = h < 4 ? y : x;
  return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
}

function noise2D(x, y) {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);

  const aa = P[P[X] + Y];
  const ab = P[P[X] + Y + 1];
  const ba = P[P[X + 1] + Y];
  const bb = P[P[X + 1] + Y + 1];

  const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
  const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
  return lerp(x1, x2, v);
}

function fbm(x, y, octaves = 3) {
  let v = 0;
  let a = 0.5;
  let f = 1.0;
  for (let i = 0; i < octaves; i++) {
    v += a * noise2D(x * f, y * f);
    f *= 2.0;
    a *= 0.5;
  }
  return v;
}

// ==========================================
// 6. EYE & COSMOS MATHEMATICAL MODEL
// ==========================================
/**
 * Evaluates the scene at normalized screen coordinates (-aspect..aspect, -1..1)
 * Returns { char, r, g, b, alpha }
 */
function sampleScene(nx, ny, t, theme, zoom, gazeX, gazeY, blink) {
  // Apply zoom transformation
  const z = zoom;
  const zx = nx / z;
  const zy = ny / z;

  // Distances
  const screenDist = Math.hypot(nx, ny);

  // Eyelid curves (Parametric almond eye shape)
  // Eye width & height
  const eyeW = 0.85;
  const eyeH = 0.42 * (1.0 - blink * 0.96); // Blink compresses height

  const inEyeH = Math.abs(zx) < eyeW;
  let eyelidDist = 1.0;
  if (inEyeH) {
    const q = zx / eyeW;
    const arch = (1.0 - q * q);
    const topLid = -eyeH * Math.sqrt(Math.max(0, arch));
    const botLid = +eyeH * Math.sqrt(Math.max(0, arch)) * 0.85;
    if (zy >= topLid && zy <= botLid) {
      eyelidDist = Math.min((zy - topLid), (botLid - zy)) / (eyeH + 0.001);
    } else {
      eyelidDist = -1.0; // Outside eye opening
    }
  } else {
    eyelidDist = -1.0;
  }

  // Eye Gaze Offset
  const gazeShiftX = gazeX * 0.22;
  const gazeShiftY = gazeY * 0.12;

  // Eye center relative coordinates
  const ex = zx - gazeShiftX;
  const ey = zy - gazeShiftY;
  const eyeDist = Math.hypot(ex, ey);
  const angle = Math.atan2(ey, ex);

  // Radii
  const rIris = 0.32;
  const rPupil = 0.12 * state.eye.pupilDilation;

  // ----------------------------------------
  // COSMOS / NEBULA CORE (Inside Pupil or when Zoomed)
  // ----------------------------------------
  // Space coordinates scale up smoothly
  const spaceScale = 1.8 + (z - 1.0) * 0.8;
  const sx = nx * spaceScale;
  const sy = ny * spaceScale;
  const sDist = Math.hypot(sx, sy);
  const sAngle = Math.atan2(sy, sx);

  // Swirling vortex noise
  const swirl = sAngle + 1.2 / (sDist + 0.2) + t * 0.15;
  const cloudNoise1 = fbm(Math.cos(swirl) * sDist * 1.5 + t * 0.05, Math.sin(swirl) * sDist * 1.5, 3);
  const cloudNoise2 = fbm(sx * 2.0 - t * 0.08, sy * 2.0 + t * 0.05, 3);
  const cloudVal = Math.max(0, (cloudNoise1 * 0.6 + cloudNoise2 * 0.4 + 0.4));

  // Cosmic Singularity Heart (Molten/Violet Heart)
  const heartCore = Math.exp(-sDist * 4.0);
  const heartGlow = Math.exp(-sDist * 1.8);

  // Stars: procedural pseudo-random lattice
  let isStar = false;
  let starBrightness = 0;
  const starGridX = Math.floor(nx * 35.0 + 100);
  const starGridY = Math.floor(ny * 25.0 + 100);
  const starHash = (Math.sin(starGridX * 12.9898 + starGridY * 78.233) * 43758.5453) % 1;
  if (starHash > 0.94) {
    const twinkle = Math.sin(t * 3.0 + starHash * 100.0) * 0.5 + 0.5;
    starBrightness = twinkle * starHash;
    isStar = true;
  }

  // ----------------------------------------
  // DECIDE PIXEL REGION (Skin / Sclera / Iris / Pupil / Space)
  // ----------------------------------------
  let r = 0, g = 0, b = 0;
  let char = " ";
  let luminance = 0;

  // Space dominance factor: as zoom increases, space takes over
  const spaceBlend = Math.min(1.0, Math.max(0, (z - 1.2) / 2.2));

  if (eyelidDist < 0 && spaceBlend < 0.95) {
    // ======================================
    // 1. SKIN / EYELIDS / OUTER SHADOW
    // ======================================
    const skinTone = theme.skin;
    const skinNoise = fbm(zx * 10.0, zy * 10.0, 2) * 0.15;
    const shadow = Math.max(0, 1.0 - Math.hypot(zx, zy * 1.4) * 0.6);

    luminance = Math.max(0.04, shadow * 0.22 + skinNoise);
    r = Math.floor(skinTone[0] * luminance);
    g = Math.floor(skinTone[1] * luminance);
    b = Math.floor(skinTone[2] * luminance);

    // Eyelid border characters
    if (Math.abs(eyelidDist) < 0.08) {
      char = Math.abs(zx) > 0.4 ? (zx * zy > 0 ? "/" : "\\") : "-";
      luminance += 0.2;
    } else {
      char = RAMP_CHARS[Math.min(RAMP_CHARS.length - 1, Math.floor(luminance * RAMP_CHARS.length))];
    }
  } else if (eyeDist > rIris && spaceBlend < 0.95) {
    // ======================================
    // 2. SCLERA (Whites of the eye)
    // ======================================
    const scleraTone = theme.sclera;
    // 3D eyeball shading (spherical normal)
    const sphereZ = Math.sqrt(Math.max(0, 1.0 - (ex * ex * 1.5 + ey * ey * 2.0)));
    const shading = 0.35 + 0.65 * sphereZ;
    // Subtle red capillary veins noise
    const vein = Math.max(0, noise2D(ex * 25.0, ey * 25.0) - 0.4) * 0.5;

    luminance = shading * (0.5 + eyelidDist * 0.4);
    r = Math.floor((scleraTone[0] * (1.0 - vein) + 180 * vein) * luminance);
    g = Math.floor((scleraTone[1] * (1.0 - vein) + 50 * vein) * luminance);
    b = Math.floor((scleraTone[2] * (1.0 - vein) + 60 * vein) * luminance);

    const rampIdx = Math.floor(luminance * (GLYPH_MID.length - 1));
    char = GLYPH_MID[rampIdx] || "·";
  } else if (eyeDist <= rIris && eyeDist > rPupil && spaceBlend < 0.95) {
    // ======================================
    // 3. IRIS (Radiating fibers, patterns)
    // ======================================
    const irisNorm = (eyeDist - rPupil) / (rIris - rPupil); // 0 at pupil, 1 at edge

    // Fiber patterns: radial waves with high frequency
    const fiberFreq = 28.0;
    const radialFibers = Math.sin(angle * fiberFreq + noise2D(ex * 12.0, ey * 12.0) * 4.0);
    const concentricRings = Math.sin(irisNorm * Math.PI * 6.0 + t * 0.8);
    const pattern = (radialFibers * 0.6 + concentricRings * 0.4) * 0.5 + 0.5;

    // Color gradient from iris_a to iris_b
    const cA = theme.iris_a;
    const cB = theme.iris_b;
    const glow = theme.iris_glow;

    // Dark limbal ring at outer edge
    const limbalRing = Math.sin(irisNorm * Math.PI);

    luminance = 0.3 + 0.7 * pattern * limbalRing;

    // Specular light reflection on the eye (catchlight)
    const highlightDist = Math.hypot(ex - 0.08, ey + 0.08);
    const catchlight = Math.exp(-highlightDist * 35.0);

    r = Math.floor(lerp(cB[0], cA[0], irisNorm) * luminance + catchlight * 255);
    g = Math.floor(lerp(cB[1], cA[1], irisNorm) * luminance + catchlight * 255);
    b = Math.floor(lerp(cB[2], cA[2], irisNorm) * luminance + catchlight * 255);

    if (catchlight > 0.4) {
      char = "*";
      r = 255; g = 255; b = 255;
    } else {
      const idx = Math.floor(luminance * (GLYPH_DENSE.length - 1));
      char = GLYPH_DENSE[idx] || "#";
    }
  } else {
    // ======================================
    // 4. PUPIL & DEEP SPACE / NEBULA VOID
    // ======================================
    // When looking into the pupil, you gaze directly into the COSMOS!
    const cDeep = theme.heart_deep;
    const cLight = theme.heart_light;
    const cCloudA = theme.cloud_a;
    const cCloudB = theme.cloud_b;
    const cSpace = theme.space;

    // Nebular color blending
    const nebR = lerp(cCloudA[0], cCloudB[0], cloudVal) * (cloudVal * 0.8);
    const nebG = lerp(cCloudA[1], cCloudB[1], cloudVal) * (cloudVal * 0.8);
    const nebB = lerp(cCloudA[2], cCloudB[2], cloudVal) * (cloudVal * 0.8);

    // Heart Singularity
    const heartR = lerp(cDeep[0], cLight[0], heartCore) * (heartCore * 1.5 + heartGlow * 0.8);
    const heartG = lerp(cDeep[1], cLight[1], heartCore) * (heartCore * 1.5 + heartGlow * 0.8);
    const heartB = lerp(cDeep[2], cLight[2], heartCore) * (heartCore * 1.5 + heartGlow * 0.8);

    r = Math.min(255, Math.floor(cSpace[0] + nebR + heartR));
    g = Math.min(255, Math.floor(cSpace[1] + nebG + heartG));
    b = Math.min(255, Math.floor(cSpace[2] + nebB + heartB));

    luminance = Math.min(1.0, (r * 0.299 + g * 0.587 + b * 0.114) / 255.0);

    if (isStar && luminance < 0.6) {
      const starColor = starHash > 0.97 ? theme.star_a : theme.star_b;
      r = Math.min(255, r + Math.floor(starColor[0] * starBrightness));
      g = Math.min(255, g + Math.floor(starColor[1] * starBrightness));
      b = Math.min(255, b + Math.floor(starColor[2] * starBrightness));
      char = starBrightness > 0.7 ? "+" : (starBrightness > 0.4 ? "*" : "·");
    } else if (heartCore > 0.3) {
      const idx = Math.floor(heartCore * (GLYPH_DENSE.length - 1));
      char = GLYPH_DENSE[idx] || "@";
    } else if (cloudVal > 0.4) {
      const idx = Math.floor(luminance * (CODE_SYMBOLS.length - 1));
      char = CODE_SYMBOLS[idx] || "~";
    } else {
      const rampIdx = Math.floor(luminance * (RAMP_CHARS.length - 1));
      char = RAMP_CHARS[rampIdx] || " ";
    }
  }

  // Final space blend if zooming into space
  if (spaceBlend > 0 && eyelidDist >= 0 && eyeDist > rPupil) {
    const spaceNebR = lerp(theme.cloud_a[0], theme.heart_deep[0], heartGlow);
    const spaceNebG = lerp(theme.cloud_a[1], theme.heart_deep[1], heartGlow);
    const spaceNebB = lerp(theme.cloud_a[2], theme.heart_deep[2], heartGlow);

    r = Math.floor(lerp(r, spaceNebR, spaceBlend));
    g = Math.floor(lerp(g, spaceNebG, spaceBlend));
    b = Math.floor(lerp(b, spaceNebB, spaceBlend));
  }

  return { char, r, g, b };
}

// ==========================================
// 7. MAIN RENDER LOOP
// ==========================================
function render(currentTime) {
  requestAnimationFrame(render);

  if (state.paused) {
    state.lastFrameTime = currentTime;
    return;
  }

  const dt = Math.min(0.1, (currentTime - state.lastFrameTime) / 1000);
  state.lastFrameTime = currentTime;
  state.fps = Math.round(1 / Math.max(0.001, dt));

  state.time += dt * state.speed;
  const t = state.time;

  // Smooth Zoom Interpolation
  state.zoom += (state.targetZoom - state.zoom) * (dt * 4.0);

  // Auto Zoom Loop mode
  if (state.mode === "auto") {
    // Oscillates between eye view (1.0x) and cosmic zoom (3.2x)
    const cycle = (Math.sin(t * 0.4) * 0.5 + 0.5);
    state.targetZoom = 0.95 + Math.pow(cycle, 1.8) * 2.8;

    // Organic wandering gaze
    state.eye.targetGazeX = Math.sin(t * 0.7) * 0.6 + Math.cos(t * 0.3) * 0.3;
    state.eye.targetGazeY = Math.cos(t * 0.5) * 0.4;
  } else if (state.mode === "gaze") {
    // Gaze follows mouse strictly
    if (!state.mouse.isHovering) {
      state.eye.targetGazeX = 0;
      state.eye.targetGazeY = 0;
    }
  } else if (state.mode === "space") {
    state.targetZoom = 3.6;
  }

  // Smooth Eye Gaze Physics (Spring interpolation)
  state.eye.gazeX += (state.eye.targetGazeX - state.eye.gazeX) * (dt * 6.0);
  state.eye.gazeY += (state.eye.targetGazeY - state.eye.gazeY) * (dt * 6.0);

  // Periodic Natural Blinking
  if (state.autoBlink) {
    if (Math.random() < 0.006 && state.eye.blinkSpeed === 0) {
      state.eye.blinkSpeed = 14.0; // Start blink cycle
    }
  }

  if (state.eye.blinkSpeed > 0) {
    state.eye.blink += state.eye.blinkSpeed * dt;
    if (state.eye.blink >= 1.0) {
      state.eye.blink = 1.0;
      state.eye.blinkSpeed = -16.0; // Open eye quickly
    }
  } else if (state.eye.blinkSpeed < 0) {
    state.eye.blink += state.eye.blinkSpeed * dt;
    if (state.eye.blink <= 0) {
      state.eye.blink = 0;
      state.eye.blinkSpeed = 0;
    }
  }

  // Clear Canvas
  const currentTheme = THEMES[state.themeIdx];
  const bg = currentTheme.space;
  ctx.fillStyle = `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  // Text font setup
  ctx.font = `${state.charSize}px "Fira Code", monospace`;

  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / h;

  // Grid step rendering
  const totalCols = cols;
  const totalRows = rows;

  for (let row = 0; row < totalRows; row++) {
    const yPos = row * charHeight;
    const ny = (row / totalRows) * 2.0 - 1.0;

    for (let col = 0; col < totalCols; col++) {
      const xPos = col * charWidth;
      const nx = ((col / totalCols) * 2.0 - 1.0) * aspect;

      const sample = sampleScene(
        nx,
        ny,
        t,
        currentTheme,
        state.zoom,
        state.eye.gazeX,
        state.eye.gazeY,
        state.eye.blink
      );

      if (sample.char === " " && sample.r < 10 && sample.g < 10 && sample.b < 10) {
        continue;
      }

      ctx.fillStyle = `rgb(${sample.r}, ${sample.g}, ${sample.b})`;
      ctx.fillText(sample.char, xPos, yPos);
    }
  }

  // Update Footer UI HUD
  document.getElementById("fpsCounter").textContent = `FPS: ${state.fps}`;
  document.getElementById("zoomStatus").textContent = `Zoom: ${state.zoom.toFixed(2)}x`;

  // Update Audio Synthesizer if active
  if (state.audioEnabled && audioSynth) {
    audioSynth.update(state.zoom, state.eye.gazeX, state.eye.gazeY);
  }
}

// ==========================================
// 8. INTERACTIVE AUDIO SYNTHESIZER (Web Audio API)
// ==========================================
let audioSynth = null;

class CosmicSynth {
  constructor() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Lowpass filter (opens as zoom goes deep into space)
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(4.0, this.ctx.currentTime);
    this.filter.connect(this.masterGain);

    // Deep drone oscillators (Cosmic root notes)
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = "sawtooth";
    this.osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = "sine";
    this.osc2.frequency.setValueAtTime(110, this.ctx.currentTime); // A2 note

    this.osc3 = this.ctx.createOscillator();
    this.osc3.type = "triangle";
    this.osc3.frequency.setValueAtTime(165, this.ctx.currentTime); // E3 fifth

    this.osc1.connect(this.filter);
    this.osc2.connect(this.filter);
    this.osc3.connect(this.filter);

    this.osc1.start();
    this.osc2.start();
    this.osc3.start();
  }

  update(zoom, gazeX, gazeY) {
    if (!this.ctx || this.ctx.state !== "running") return;
    const now = this.ctx.currentTime;
    // Frequency shifts as we dive into nebula
    const cutoff = 300 + Math.min(2400, (zoom - 0.5) * 600);
    this.filter.frequency.setTargetAtTime(cutoff, now, 0.1);

    // Slight pitch bend with gaze
    const detune = gazeX * 30 + gazeY * 15;
    this.osc1.detune.setTargetAtTime(detune, now, 0.1);
  }

  setMuted(muted) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (muted) {
      this.masterGain.gain.setTargetAtTime(0.0001, now, 0.1);
    } else {
      if (this.ctx.state === "suspended") this.ctx.resume();
      this.masterGain.gain.setTargetAtTime(0.12, now, 0.1);
    }
  }
}

// ==========================================
// 9. EVENT LISTENERS & USER CONTROLS
// ==========================================

// Mouse movement for Eye Gaze
window.addEventListener("mousemove", (e) => {
  state.mouse.isHovering = true;
  const w = window.innerWidth;
  const h = window.innerHeight;

  // Normalized mouse coords (-1 to 1)
  const mx = (e.clientX / w) * 2 - 1;
  const my = (e.clientY / h) * 2 - 1;

  if (state.mode === "gaze") {
    state.eye.targetGazeX = mx * 1.2;
    state.eye.targetGazeY = my * 1.2;
  }

  // Pupil dilation reacts to brightness or cursor speed
  const dx = e.clientX - state.mouse.lastX;
  const dy = e.clientY - state.mouse.lastY;
  const speed = Math.hypot(dx, dy);
  state.eye.pupilDilation = Math.min(1.5, Math.max(0.75, 1.0 + speed * 0.003));

  state.mouse.lastX = e.clientX;
  state.mouse.lastY = e.clientY;
});

// Mouse wheel for Zoom into Space
window.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = e.deltaY * -0.002;
  state.targetZoom = Math.min(5.0, Math.max(0.3, state.targetZoom + delta));
  document.getElementById("zoomSlider").value = state.targetZoom;

  // If user scrolls manually, switch to interactive mode
  if (state.mode === "auto") {
    setMode("gaze");
  }
}, { passive: false });

// Theme switching
function setTheme(idx) {
  state.themeIdx = (idx + THEMES.length) % THEMES.length;
  const cur = THEMES[state.themeIdx];

  document.getElementById("windowTitle").textContent = `Eye -> Space [${cur.name}]`;
  document.getElementById("themeSubtitle").textContent = cur.subtitle;

  // Update theme deck buttons
  document.querySelectorAll(".theme-btn").forEach((btn, i) => {
    btn.classList.toggle("active", i === state.themeIdx);
  });
}

function nextTheme() {
  setTheme(state.themeIdx + 1);
}

// Force a blink
function triggerBlink() {
  state.eye.blinkSpeed = 16.0;
}

// Set mode
function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".pill-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  const modeLabels = {
    auto: "Auto Orbit",
    gaze: "Interactive Gaze",
    space: "Cosmos Focus"
  };
  document.getElementById("modeStatus").textContent = `Mode: ${modeLabels[mode] || mode}`;
}

// Keyboard shortcuts (matching original python script from video)
window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (key === "c" || key === "t") {
    nextTheme();
  } else if (key === " " || e.code === "Space") {
    e.preventDefault();
    state.paused = !state.paused;
  } else if (key === "r") {
    // Restart / Reset
    state.zoom = 1.0;
    state.targetZoom = 1.0;
    state.eye.gazeX = 0;
    state.eye.gazeY = 0;
    setMode("auto");
  } else if (key === "b") {
    triggerBlink();
  } else if (key === "f") {
    toggleFullscreen();
  } else if (key === "m") {
    toggleAudio();
  } else if (key === "escape") {
    const deck = document.getElementById("controlDeck");
    deck.classList.add("collapsed");
  }
});

// UI Buttons & Controls
document.getElementById("themeToggleBtn").addEventListener("click", nextTheme);

document.getElementById("guiToggleBtn").addEventListener("click", () => {
  const deck = document.getElementById("controlDeck");
  deck.classList.toggle("collapsed");
});

document.getElementById("closeDeckBtn").addEventListener("click", () => {
  document.getElementById("controlDeck").classList.add("collapsed");
});

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}
document.getElementById("fullscreenBtn").addEventListener("click", toggleFullscreen);

// Audio toggle
function toggleAudio() {
  state.audioEnabled = !state.audioEnabled;
  const btn = document.getElementById("audioToggleBtn");
  if (state.audioEnabled) {
    if (!audioSynth) audioSynth = new CosmicSynth();
    audioSynth.setMuted(false);
    btn.textContent = "🔊 الصوت: تشغيل";
    btn.style.borderColor = "var(--accent-cyan)";
  } else {
    if (audioSynth) audioSynth.setMuted(true);
    btn.textContent = "🔇 الصوت: مكتوم";
    btn.style.borderColor = "";
  }
}
document.getElementById("audioToggleBtn").addEventListener("click", toggleAudio);

// Sliders
document.getElementById("zoomSlider").addEventListener("input", (e) => {
  state.targetZoom = parseFloat(e.target.value);
  if (state.mode === "auto") setMode("gaze");
});

document.getElementById("speedSlider").addEventListener("input", (e) => {
  state.speed = parseFloat(e.target.value);
});

document.getElementById("densitySlider").addEventListener("input", (e) => {
  state.charSize = parseInt(e.target.value, 10);
  resizeCanvas();
});

document.getElementById("bloomSlider").addEventListener("input", (e) => {
  state.bloom = parseInt(e.target.value, 10);
  canvas.style.filter = `drop-shadow(0 0 ${state.bloom}px rgba(0, 240, 255, 0.45))`;
});

// Toggles
document.getElementById("scanlinesToggle").addEventListener("change", (e) => {
  document.body.classList.toggle("crt-enabled", e.target.checked);
});

document.getElementById("autoBlinkToggle").addEventListener("change", (e) => {
  state.autoBlink = e.target.checked;
});

// Mode Pill Buttons
document.querySelectorAll(".pill-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    setMode(btn.dataset.mode);
  });
});

// Theme Grid Buttons
document.querySelectorAll(".theme-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    setTheme(parseInt(btn.dataset.theme, 10));
  });
});

// Canvas click triggers blink & gentle gaze jump
canvas.addEventListener("click", (e) => {
  triggerBlink();
});

// Fade out quick help pill after 8 seconds
setTimeout(() => {
  const help = document.getElementById("quickHelp");
  if (help) help.style.opacity = "0";
}, 8000);

// ==========================================
// 10. INITIALIZATION
// ==========================================
resizeCanvas();
setTheme(4);
setMode("auto");

// Initial glow
canvas.style.filter = `drop-shadow(0 0 ${state.bloom}px rgba(0, 240, 255, 0.45))`;

// Start render loop
requestAnimationFrame(render);
