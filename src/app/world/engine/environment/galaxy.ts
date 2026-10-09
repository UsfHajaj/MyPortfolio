import * as THREE from 'three';
import { createParticleTexture } from '../bake';
import { Disposable, Updatable } from '../world-object';

/** A distant spiral galaxy made of a few thousand additive points. */
export class Galaxy extends THREE.Points implements Updatable, Disposable {
  private texture: THREE.Texture;

  constructor(count = 3200) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const inner = new THREE.Color(0xfff0d8);
    const outer = new THREE.Color(0x6f7cff);
    const arms = 3;
    for (let i = 0; i < count; i++) {
      const radius = Math.pow(Math.random(), 0.7) * 120;
      const arm = i % arms;
      const spin = radius * 0.045;
      const angle = (arm / arms) * Math.PI * 2 + spin + (Math.random() - 0.5) * (0.6 + radius * 0.004);
      const spread = (Math.random() - 0.5) * (6 + radius * 0.12);
      positions[i * 3] = Math.cos(angle) * radius + spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * (3 + radius * 0.05);
      positions[i * 3 + 2] = Math.sin(angle) * radius + spread;
      const t = radius / 120;
      const c = inner.clone().lerp(outer, t);
      const brightness = 0.9 - t * 0.5;
      colors[i * 3] = c.r * brightness;
      colors[i * 3 + 1] = c.g * brightness;
      colors[i * 3 + 2] = c.b * brightness;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const texture = createParticleTexture(32);
    const material = new THREE.PointsMaterial({
      size: 2.6,
      map: texture,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.85,
      sizeAttenuation: true,
    });
    super(geometry, material);
    this.texture = texture;
    this.position.set(-420, 150, -700);
    this.rotation.set(1.05, 0.2, 0.45);
    this.frustumCulled = false;
    this.renderOrder = -8;
  }

  update(dt: number): void {
    this.rotation.y += dt * 0.004;
  }

  override dispose(): void {
    this.geometry.dispose();
    (this.material as THREE.Material).dispose();
    this.texture.dispose();
  }
}
