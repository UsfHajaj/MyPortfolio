import * as THREE from 'three';

export interface BakedTexture {
  texture: THREE.Texture;
  dispose(): void;
}

const BAKE_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/**
 * Renders a fragment shader once into an offscreen render target.
 * Used to bake procedural planet surfaces so they cost nothing at runtime.
 */
export function bakeTexture(
  renderer: THREE.WebGLRenderer,
  fragmentShader: string,
  uniforms: Record<string, THREE.IUniform>,
  width: number,
  height: number
): BakedTexture {
  const target = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearMipmapLinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: true,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
  });

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new THREE.ShaderMaterial({
    vertexShader: BAKE_VERTEX,
    fragmentShader,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  const previousTarget = renderer.getRenderTarget();
  const previousAutoClear = renderer.autoClear;
  renderer.autoClear = true;
  renderer.setRenderTarget(target);
  renderer.render(scene, camera);
  renderer.setRenderTarget(previousTarget);
  renderer.autoClear = previousAutoClear;

  quad.geometry.dispose();
  material.dispose();

  const texture = target.texture;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  return {
    texture,
    dispose: () => target.dispose(),
  };
}

/** Soft radial gradient sprite used for glows, suns and thruster light. */
export function createGlowTexture(size = 256, rgb: [number, number, number] = [255, 255, 255]): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const [r, g, b] = rgb;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, `rgba(${r},${g},${b},1)`);
  gradient.addColorStop(0.2, `rgba(${r},${g},${b},0.55)`);
  gradient.addColorStop(0.55, `rgba(${r},${g},${b},0.12)`);
  gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Circular soft particle used by star and dust point clouds. */
export function createParticleTexture(size = 64): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}
