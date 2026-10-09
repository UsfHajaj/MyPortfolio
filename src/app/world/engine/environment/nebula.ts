import * as THREE from 'three';
import { BILLBOARD_VERTEX, NOISE_GLSL } from '../shaders/noise.glsl';
import { Disposable, Updatable } from '../world-object';

const FRAGMENT = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime;
uniform float uSeed;
uniform float uAlpha;
${NOISE_GLSL}
void main() {
  vec2 p = vUv - 0.5;
  float radial = 1.0 - smoothstep(0.1, 0.5, length(p));
  vec3 q = vec3(p * 3.0, uSeed + uTime * 0.012);
  float n = fbm(q, 4) * 0.5 + 0.5;
  float n2 = fbm(q * 2.3 + 5.0, 3) * 0.5 + 0.5;
  float density = smoothstep(0.35, 0.85, n) * radial;
  vec3 color = mix(uColorA, uColorB, n2);
  // Bright filaments
  color += vec3(0.6, 0.7, 1.0) * pow(n2, 6.0) * 0.5;
  gl_FragColor = vec4(color * density, density * uAlpha);
}
`;

interface NebulaDef {
  position: [number, number, number];
  size: number;
  colorA: number;
  colorB: number;
  alpha: number;
}

const NEBULAE: NebulaDef[] = [
  { position: [-380, 90, -620], size: 620, colorA: 0x1a1550, colorB: 0x5b3fb0, alpha: 0.55 },
  { position: [420, -60, -540], size: 520, colorA: 0x0b1f4a, colorB: 0x2f6fd6, alpha: 0.45 },
  { position: [120, 240, 560], size: 480, colorA: 0x16103a, colorB: 0x7a4fd8, alpha: 0.35 },
  { position: [-520, -200, 260], size: 460, colorA: 0x061a30, colorB: 0x1d8fa8, alpha: 0.3 },
];

/** Large additive billboards with animated fBm give the sky soft volumetric colour. */
export class Nebula extends THREE.Group implements Updatable, Disposable {
  private materials: THREE.ShaderMaterial[] = [];
  private geometry = new THREE.PlaneGeometry(1, 1);

  constructor() {
    super();
    for (const def of NEBULAE) {
      const material = new THREE.ShaderMaterial({
        vertexShader: BILLBOARD_VERTEX,
        fragmentShader: FRAGMENT,
        uniforms: {
          uColorA: { value: new THREE.Color(def.colorA) },
          uColorB: { value: new THREE.Color(def.colorB) },
          uTime: { value: 0 },
          uSeed: { value: Math.random() * 100 },
          uAlpha: { value: def.alpha },
          uScale: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(this.geometry, material);
      mesh.position.set(...def.position);
      mesh.scale.setScalar(def.size);
      mesh.frustumCulled = false;
      mesh.renderOrder = -9;
      this.add(mesh);
      this.materials.push(material);
    }
  }

  update(_dt: number, elapsed: number): void {
    for (const material of this.materials) material.uniforms['uTime'].value = elapsed;
  }

  override dispose(): void {
    this.geometry.dispose();
    this.materials.forEach((m) => m.dispose());
  }
}
