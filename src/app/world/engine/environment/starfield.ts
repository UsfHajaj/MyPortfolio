import * as THREE from 'three';
import { createParticleTexture } from '../bake';
import { Disposable, Updatable } from '../world-object';

const VERTEX = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute vec3 aColor;
uniform float uTime;
uniform float uPixelRatio;
varying vec3 vColor;
varying float vTwinkle;
void main() {
  vColor = aColor;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float twinkle = 0.75 + 0.25 * sin(uTime * (0.6 + aPhase * 1.4) + aPhase * 6.2831);
  vTwinkle = twinkle;
  gl_PointSize = aSize * uPixelRatio * twinkle * (420.0 / -mvPosition.z);
  gl_PointSize = clamp(gl_PointSize, 0.6, 7.0 * uPixelRatio);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAGMENT = /* glsl */ `
uniform sampler2D uMap;
varying vec3 vColor;
varying float vTwinkle;
void main() {
  vec4 tex = texture2D(uMap, gl_PointCoord);
  gl_FragColor = vec4(vColor * vTwinkle, tex.a);
}
`;

/**
 * Two-shell starfield: a dense far shell for the sky and a sparse near shell
 * that parallaxes as the camera travels, giving the universe real depth.
 */
export class Starfield extends THREE.Group implements Updatable, Disposable {
  private material: THREE.ShaderMaterial;
  private texture: THREE.Texture;

  constructor(count: number, pixelRatio: number) {
    super();
    this.texture = createParticleTexture(64);
    this.material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: pixelRatio },
        uMap: { value: this.texture },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.add(this.buildShell(Math.floor(count * 0.78), 650, 1100, 1.0, 2.6));
    this.add(this.buildShell(Math.floor(count * 0.22), 160, 420, 0.7, 1.9));
    this.renderOrder = -10;
  }

  private buildShell(count: number, minRadius: number, maxRadius: number, minSize: number, maxSize: number): THREE.Points {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xdfe8ff),
      new THREE.Color(0xc4d4ff),
      new THREE.Color(0xa9c2ff),
      new THREE.Color(0xfff1d6),
      new THREE.Color(0xffd9b3),
    ];

    for (let i = 0; i < count; i++) {
      // Uniform distribution on a sphere, slightly concentrated toward a "galactic band".
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      let phi = Math.acos(2 * v - 1);
      if (Math.random() < 0.35) {
        phi = Math.PI / 2 + (Math.random() - 0.5) * 0.5 + Math.sin(theta * 1.3) * 0.25;
      }
      const r = minRadius + Math.pow(Math.random(), 0.6) * (maxRadius - minRadius);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.9;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const bright = Math.random();
      sizes[i] = minSize + Math.pow(bright, 3) * (maxSize - minSize) * (Math.random() < 0.03 ? 2.2 : 1);
      phases[i] = Math.random();
      const color = palette[Math.floor(Math.pow(Math.random(), 1.6) * palette.length)];
      const intensity = 0.55 + bright * 0.45;
      colors[i * 3] = color.r * intensity;
      colors[i * 3 + 1] = color.g * intensity;
      colors[i * 3 + 2] = color.b * intensity;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

    const points = new THREE.Points(geometry, this.material);
    points.frustumCulled = false;
    return points;
  }

  update(_dt: number, elapsed: number): void {
    this.material.uniforms['uTime'].value = elapsed;
  }

  setPixelRatio(ratio: number): void {
    this.material.uniforms['uPixelRatio'].value = ratio;
  }

  override dispose(): void {
    this.children.forEach((child) => (child as THREE.Points).geometry.dispose());
    this.material.dispose();
    this.texture.dispose();
  }
}
