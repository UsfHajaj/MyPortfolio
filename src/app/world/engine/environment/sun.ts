import * as THREE from 'three';
import { createGlowTexture } from '../bake';
import { Disposable, Updatable } from '../world-object';

export const SUN_DIRECTION = new THREE.Vector3(1, 0.38, 0.52).normalize();

/** Distant star: layered sprites for the disc, corona and lens haze plus the key light. */
export class Sun extends THREE.Group implements Updatable, Disposable {
  readonly light: THREE.DirectionalLight;
  private textures: THREE.Texture[] = [];
  private corona: THREE.Sprite;

  constructor() {
    super();
    const distance = 900;
    this.position.copy(SUN_DIRECTION).multiplyScalar(distance);

    const core = createGlowTexture(256, [255, 250, 240]);
    const haze = createGlowTexture(256, [255, 214, 170]);
    const blue = createGlowTexture(256, [160, 190, 255]);
    this.textures.push(core, haze, blue);

    const makeSprite = (texture: THREE.Texture, scale: number, opacity: number) => {
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.setScalar(scale);
      return sprite;
    };

    this.add(makeSprite(core, 70, 1));
    this.corona = makeSprite(haze, 260, 0.55);
    this.add(this.corona);
    this.add(makeSprite(blue, 520, 0.18));
    this.renderOrder = -7;

    this.light = new THREE.DirectionalLight(0xfff1dc, 3.0);
    this.light.position.copy(SUN_DIRECTION).multiplyScalar(200);
    this.light.target.position.set(0, 0, 0);
  }

  update(_dt: number, elapsed: number): void {
    const pulse = 1 + Math.sin(elapsed * 0.5) * 0.03;
    this.corona.scale.setScalar(260 * pulse);
  }

  override dispose(): void {
    this.children.forEach((child) => (child as THREE.Sprite).material.dispose());
    this.textures.forEach((t) => t.dispose());
    this.light.dispose();
  }
}
