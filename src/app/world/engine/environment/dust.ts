import * as THREE from 'three';
import { createParticleTexture } from '../bake';
import { Disposable, Updatable } from '../world-object';

/** Fine drifting dust close to the travel lanes — sells scale and motion. */
export class Dust extends THREE.Points implements Updatable, Disposable {
  private texture: THREE.Texture;
  private velocities: Float32Array;
  private readonly bounds = 110;

  constructor(count: number) {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 220;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 220 + 30;
      velocities[i * 3] = (Math.random() - 0.5) * 0.4;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const texture = createParticleTexture(32);
    const material = new THREE.PointsMaterial({
      size: 0.55,
      map: texture,
      color: 0xa9bfff,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    super(geometry, material);
    this.texture = texture;
    this.velocities = velocities;
    this.frustumCulled = false;
  }

  update(dt: number): void {
    const attr = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const b = this.bounds;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] += this.velocities[i] * dt;
      arr[i + 1] += this.velocities[i + 1] * dt;
      arr[i + 2] += this.velocities[i + 2] * dt;
      if (arr[i] > b) arr[i] = -b;
      else if (arr[i] < -b) arr[i] = b;
      if (arr[i + 2] > b + 30) arr[i + 2] = -b + 30;
      else if (arr[i + 2] < -b + 30) arr[i + 2] = b + 30;
    }
    attr.needsUpdate = true;
  }

  override dispose(): void {
    this.geometry.dispose();
    (this.material as THREE.Material).dispose();
    this.texture.dispose();
  }
}
