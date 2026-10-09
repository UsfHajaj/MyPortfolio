import * as THREE from 'three';
import { createGlowTexture } from '../bake';
import { DestinationId } from '../destinations';
import { emissive, metal, Palette } from '../world-object';
import { Landmark } from './landmark';

/**
 * Transmission Array Echo — the Contact location. A deep-space dish on a
 * gantry, broadcasting expanding signal rings toward the stars.
 */
export class TransmissionArray extends Landmark {
  readonly destinationId: DestinationId = 'contact';

  private dishAssembly: THREE.Group;
  private signalRings: THREE.Mesh[] = [];
  private feedLight: THREE.MeshStandardMaterial;
  private glowTexture: THREE.Texture;
  private beacons: THREE.Mesh[] = [];

  constructor() {
    super();
    this.labelOffset.set(0, 12, 0);

    const hull = metal(Palette.hullLight, 0.4, 0.8);
    const hullDark = metal(Palette.hullDark, 0.55, 0.65);
    const trim = this.trackGlow(emissive(Palette.accentCyan, 1.1, 0x0a1a24));
    this.feedLight = this.trackGlow(emissive(0x9df2ff, 3, 0x0a1a24));

    // Gantry base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.0, 0.8, 8), hullDark);
    base.position.y = -6;
    this.add(base);
    const baseTrim = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.06, 6, 8), trim);
    baseTrim.rotation.x = Math.PI / 2;
    baseTrim.position.y = -5.55;
    this.add(baseTrim);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 6.5, 8), hull);
      leg.position.set(Math.cos(angle) * 1.4, -2.6, Math.sin(angle) * 1.4);
      leg.rotation.z = Math.cos(angle) * 0.22;
      leg.rotation.x = -Math.sin(angle) * 0.22;
      this.add(leg);
    }
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 4, 10), hull);
    mast.position.y = -3.5;
    this.add(mast);
    const yoke = new THREE.Mesh(new THREE.SphereGeometry(0.9, 20, 14), hullDark);
    yoke.position.y = 0.3;
    this.add(yoke);

    // Dish assembly tilted toward the stars
    this.dishAssembly = new THREE.Group();
    this.dishAssembly.position.y = 0.3;
    this.dishAssembly.rotation.set(-0.75, 0.5, 0);
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(5.2, 48, 24, 0, Math.PI * 2, 0, 0.62),
      new THREE.MeshStandardMaterial({ color: Palette.hullLight, roughness: 0.35, metalness: 0.85, side: THREE.DoubleSide })
    );
    dish.rotation.x = Math.PI;
    dish.position.y = 5.2;
    this.dishAssembly.add(dish);
    // Dish ribs
    for (let i = 0; i < 12; i++) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 3.1), hullDark);
      const angle = (i / 12) * Math.PI * 2;
      rib.position.set(Math.cos(angle) * 1.6, 0.4, Math.sin(angle) * 1.6);
      rib.rotation.y = -angle + Math.PI / 2;
      rib.rotation.x = -0.32;
      this.dishAssembly.add(rib);
    }
    const dishRim = new THREE.Mesh(new THREE.TorusGeometry(3.02, 0.08, 8, 72), trim);
    dishRim.rotation.x = Math.PI / 2;
    dishRim.position.y = 0.95;
    this.dishAssembly.add(dishRim);

    // Feed horn on three struts
    const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 0.9, 10), hullDark);
    horn.position.y = 3.4;
    this.dishAssembly.add(horn);
    const feed = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), this.feedLight);
    feed.position.y = 2.9;
    this.dishAssembly.add(feed);
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.9, 6), hull);
      strut.position.set(Math.cos(angle) * 1.3, 2.1, Math.sin(angle) * 1.3);
      strut.lookAt(new THREE.Vector3(0, 3.4, 0));
      strut.rotateX(Math.PI / 2);
      this.dishAssembly.add(strut);
    }

    // Expanding signal rings along the dish axis
    const ringMaterialBase = new THREE.MeshBasicMaterial({
      color: 0x7fe8ff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    for (let i = 0; i < 6; i++) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 64), ringMaterialBase.clone());
      ring.rotation.x = -Math.PI / 2;
      ring.userData['phase'] = i / 6;
      this.dishAssembly.add(ring);
      this.signalRings.push(ring);
    }
    this.add(this.dishAssembly);

    // Secondary small dishes and beacons around the base
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + 0.4;
      const smallDish = new THREE.Mesh(new THREE.SphereGeometry(1.0, 20, 10, 0, Math.PI * 2, 0, 0.7), hull);
      smallDish.position.set(Math.cos(angle) * 4.2, -5.0, Math.sin(angle) * 4.2);
      smallDish.rotation.set(Math.PI + 0.5, angle, 0);
      this.add(smallDish);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.4, 6), hullDark);
      post.position.set(Math.cos(angle) * 4.2, -5.6, Math.sin(angle) * 4.2);
      this.add(post);
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), emissive(0xffffff, 2));
      beacon.position.set(Math.cos(angle) * 4.2, -4.3, Math.sin(angle) * 4.2);
      this.add(beacon);
      this.beacons.push(beacon);
    }

    this.glowTexture = createGlowTexture(128, [120, 220, 255]);
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glowTexture, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    glow.position.set(0, 3.5, 0);
    glow.scale.setScalar(8);
    this.dishAssembly.add(glow);
  }

  update(dt: number, elapsed: number): void {
    this.updateHighlight(dt);
    this.dishAssembly.rotation.y = 0.5 + Math.sin(elapsed * 0.12) * 0.25;
    this.dishAssembly.rotation.x = -0.75 + Math.sin(elapsed * 0.09 + 1) * 0.08;

    const period = 3.2;
    for (const ring of this.signalRings) {
      const t = ((elapsed / period) + (ring.userData['phase'] as number)) % 1;
      const scale = 1 + t * 9;
      ring.scale.setScalar(scale);
      ring.position.y = 3.4 + t * 16;
      (ring.material as THREE.MeshBasicMaterial).opacity = (1 - t) * (1 - t) * 0.5 * (1 + this.highlight * 0.6);
    }
    this.feedLight.emissiveIntensity = 2 + Math.pow(Math.max(0, Math.sin((elapsed / period) * Math.PI * 2)), 4) * 4;

    this.beacons.forEach((beacon, i) => {
      (beacon.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4 + Math.pow(Math.max(0, Math.sin(elapsed * 1.8 + i * 2.1)), 14) * 4;
    });
  }

  override dispose(): void {
    super.dispose();
    this.glowTexture.dispose();
  }
}
