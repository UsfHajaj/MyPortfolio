import * as THREE from 'three';
import { bakeTexture, BakedTexture } from '../bake';
import { ATMOSPHERE_FRAGMENT, ATMOSPHERE_VERTEX, RING_FRAGMENT, RING_VERTEX } from '../shaders/planet.glsl';
import { Disposable, Updatable } from '../world-object';
import { SUN_DIRECTION } from './sun';

export interface PlanetOptions {
  radius: number;
  surfaceShader: string;
  surfaceUniforms: Record<string, THREE.IUniform>;
  textureSize: number;
  atmosphere?: { color: number; power?: number; intensity?: number; scale?: number };
  rings?: { inner: number; outer: number; colorA: number; colorB: number; tilt?: number };
  rotationSpeed?: number;
  axialTilt?: number;
  roughness?: number;
}

/**
 * Procedural planet: the surface is baked once into an equirectangular texture,
 * wrapped on a sphere with physically based shading, then dressed with a
 * fresnel atmosphere and optionally shadowed rings.
 */
export class Planet extends THREE.Group implements Updatable, Disposable {
  readonly body: THREE.Mesh;
  private baked: BakedTexture;
  private atmosphere?: THREE.Mesh;
  private rings?: THREE.Mesh;
  private rotationSpeed: number;

  constructor(renderer: THREE.WebGLRenderer, options: PlanetOptions) {
    super();
    this.rotationSpeed = options.rotationSpeed ?? 0.02;

    this.baked = bakeTexture(renderer, options.surfaceShader, options.surfaceUniforms, options.textureSize, options.textureSize / 2);

    const geometry = new THREE.SphereGeometry(options.radius, 96, 64);
    const material = new THREE.MeshStandardMaterial({
      map: this.baked.texture,
      roughness: options.roughness ?? 0.92,
      metalness: 0.0,
    });
    this.body = new THREE.Mesh(geometry, material);
    this.body.rotation.z = options.axialTilt ?? 0.2;
    this.add(this.body);

    if (options.atmosphere) {
      const scale = options.atmosphere.scale ?? 1.035;
      const atmosphereGeometry = new THREE.SphereGeometry(options.radius * scale, 64, 48);
      const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: ATMOSPHERE_VERTEX,
        fragmentShader: ATMOSPHERE_FRAGMENT,
        uniforms: {
          uColor: { value: new THREE.Color(options.atmosphere.color) },
          uSunDir: { value: SUN_DIRECTION.clone() },
          uPower: { value: options.atmosphere.power ?? 3.2 },
          uIntensity: { value: options.atmosphere.intensity ?? 1.4 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
      });
      this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      this.add(this.atmosphere);
    }

    if (options.rings) {
      const ringGeometry = new THREE.RingGeometry(options.rings.inner, options.rings.outer, 180, 1);
      const ringMaterial = new THREE.ShaderMaterial({
        vertexShader: RING_VERTEX,
        fragmentShader: RING_FRAGMENT,
        uniforms: {
          uInner: { value: options.rings.inner },
          uOuter: { value: options.rings.outer },
          uColorA: { value: new THREE.Color(options.rings.colorA) },
          uColorB: { value: new THREE.Color(options.rings.colorB) },
          uSunDir: { value: SUN_DIRECTION.clone() },
          uPlanetPos: { value: new THREE.Vector3() },
          uPlanetRadius: { value: options.radius },
          uSeed: { value: Math.random() * 10 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      this.rings = new THREE.Mesh(ringGeometry, ringMaterial);
      this.rings.rotation.x = Math.PI / 2 + (options.rings.tilt ?? 0.12);
      this.rings.rotation.y = 0.15;
      this.add(this.rings);
    }
  }

  update(dt: number): void {
    this.body.rotation.y += dt * this.rotationSpeed;
    if (this.rings) {
      const material = this.rings.material as THREE.ShaderMaterial;
      this.getWorldPosition(material.uniforms['uPlanetPos'].value as THREE.Vector3);
    }
  }

  override dispose(): void {
    this.body.geometry.dispose();
    (this.body.material as THREE.Material).dispose();
    this.baked.dispose();
    if (this.atmosphere) {
      this.atmosphere.geometry.dispose();
      (this.atmosphere.material as THREE.Material).dispose();
    }
    if (this.rings) {
      this.rings.geometry.dispose();
      (this.rings.material as THREE.Material).dispose();
    }
  }
}
