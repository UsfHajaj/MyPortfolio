export type QualityTier = 'high' | 'medium' | 'low';

export interface QualitySettings {
  tier: QualityTier;
  pixelRatio: number;
  bloom: boolean;
  nebula: boolean;
  starCount: number;
  dustCount: number;
  antialias: boolean;
  planetTextureSize: number;
  reducedMotion: boolean;
  isTouch: boolean;
}

export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    return !!gl;
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window);
}

function probeGpuTier(): QualityTier {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return 'low';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)).toLowerCase() : '';
    // Software renderers and very weak integrated parts get the low tier.
    if (/swiftshader|llvmpipe|software|mesa offscreen/.test(renderer)) return 'low';
    if (/mali-4|mali-t6|mali-t7|adreno 3|adreno 4|powervr sgx|intel.*hd graphics (3|4)0/.test(renderer)) return 'low';
    if (/intel|adreno 5|mali-g5|mali-t8|apple a(9|10|11)/.test(renderer)) return 'medium';
    return 'high';
  } catch {
    return 'medium';
  }
}

export function detectQuality(forceTier?: QualityTier): QualitySettings {
  const touch = isTouchDevice();
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 700;

  let tier: QualityTier = forceTier ?? probeGpuTier();
  if (!forceTier) {
    if (touch && smallScreen && tier === 'high') tier = 'medium';
    if (cores <= 2 || memory <= 2) tier = 'low';
  }

  const base: Record<QualityTier, Omit<QualitySettings, 'reducedMotion' | 'isTouch' | 'tier'>> = {
    high: {
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      bloom: true,
      nebula: true,
      starCount: 9000,
      dustCount: 900,
      antialias: true,
      planetTextureSize: 1024,
    },
    medium: {
      pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
      bloom: true,
      nebula: true,
      starCount: 5500,
      dustCount: 500,
      antialias: true,
      planetTextureSize: 768,
    },
    low: {
      pixelRatio: 1,
      bloom: false,
      nebula: false,
      starCount: 2500,
      dustCount: 200,
      antialias: false,
      planetTextureSize: 512,
    },
  };

  return { tier, ...base[tier], reducedMotion: prefersReducedMotion(), isTouch: touch };
}
