import * as THREE from 'three';
import { createGlowTexture } from '../bake';
import { DestinationId } from '../destinations';
import { emissive, glass, metal, Palette } from '../world-object';
import { Landmark } from './landmark';

/**
 * Command Vessel Meridian — the "About" location. A sleek personal craft with
 * swept wings, a glass bridge and twin ion drives idling in formation.
 */
export class CommandVessel extends Landmark {
  readonly destinationId: DestinationId = 'about';

  private ship: THREE.Group;
  private engineGlows: THREE.Sprite[] = [];
  private engineCores: THREE.MeshStandardMaterial;
  private glowTexture: THREE.Texture;
  private navLights: THREE.Mesh[] = [];
  private escort: THREE.Group;

  constructor() {
    super();
    this.labelOffset.set(0, 5.5, 0);

    const hull = metal(Palette.hullLight, 0.36, 0.82);
    const hullDark = metal(Palette.hullDark, 0.5, 0.7);
    const trim = this.trackGlow(emissive(Palette.accentCyan, 1.0, 0x0a1a24));
    this.engineCores = this.trackGlow(emissive(0x7fb3ff, 3.2, 0x0a1430));

    this.ship = new THREE.Group();

    // Main hull: capsule along Z
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.95, 5.2, 10, 28), hull);
    body.rotation.x = Math.PI / 2;
    this.ship.add(body);

    // Dorsal spine and ventral keel
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 5.6), hullDark);
    spine.position.y = 0.85;
    this.ship.add(spine);
    const keel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 4.2), hullDark);
    keel.position.y = -0.9;
    this.ship.add(keel);
    const spineLight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 5.2), trim);
    spineLight.position.y = 1.05;
    this.ship.add(spineLight);

    // Bridge canopy
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.75, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2), glass(Palette.glass, 0.5));
    canopy.scale.set(1, 0.7, 1.5);
    canopy.position.set(0, 0.55, 2.0);
    this.ship.add(canopy);
    const bridgeLight = new THREE.PointLight(0x9fd0ff, 3, 6, 2);
    bridgeLight.position.set(0, 0.9, 2.0);
    this.ship.add(bridgeLight);

    // Swept wings from an extruded trapezoid
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, -1.4);
    wingShape.lineTo(4.4, -2.6);
    wingShape.lineTo(4.6, -2.0);
    wingShape.lineTo(0.6, 1.2);
    wingShape.lineTo(0, 1.2);
    wingShape.closePath();
    const wingGeometry = new THREE.ExtrudeGeometry(wingShape, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
    wingGeometry.rotateX(Math.PI / 2);
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(wingGeometry, hull);
      wing.scale.x = side;
      wing.position.set(side * 0.6, -0.1, -0.6);
      this.ship.add(wing);
      const wingTip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.9), trim);
      wingTip.position.set(side * 5.1, -0.1, -2.9);
      this.ship.add(wingTip);
      const navLight = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), emissive(side < 0 ? 0xff6b6b : 0x6bffb0, 3));
      navLight.position.set(side * 5.2, -0.05, -2.5);
      this.ship.add(navLight);
      this.navLights.push(navLight);
    }

    // Tail fins
    const finGeometry = new THREE.BoxGeometry(0.1, 1.6, 1.4);
    for (const side of [-1, 1]) {
      const fin = new THREE.Mesh(finGeometry, hullDark);
      fin.position.set(side * 0.6, 1.2, -2.6);
      fin.rotation.z = side * -0.35;
      this.ship.add(fin);
    }

    // Twin engines
    this.glowTexture = createGlowTexture(128, [130, 180, 255]);
    for (const side of [-1, 1]) {
      const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 2.4, 20), hullDark);
      nacelle.rotation.x = Math.PI / 2;
      nacelle.position.set(side * 1.25, -0.25, -2.6);
      this.ship.add(nacelle);
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.15, 20), this.engineCores);
      core.rotation.x = Math.PI / 2;
      core.position.set(side * 1.25, -0.25, -3.85);
      this.ship.add(core);
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: this.glowTexture, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })
      );
      glow.position.set(side * 1.25, -0.25, -4.3);
      glow.scale.set(2.4, 2.4, 1);
      this.ship.add(glow);
      this.engineGlows.push(glow);
      // Faint exhaust trail
      const trail = new THREE.Mesh(
        new THREE.ConeGeometry(0.3, 4.5, 14, 1, true),
        new THREE.MeshBasicMaterial({ color: 0x5f9bff, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
      );
      trail.rotation.x = -Math.PI / 2;
      trail.position.set(side * 1.25, -0.25, -6.4);
      this.ship.add(trail);
    }

    this.ship.rotation.y = -0.5;
    this.add(this.ship);

    // Escort drones flying formation
    this.escort = new THREE.Group();
    const droneGeometry = new THREE.OctahedronGeometry(0.35, 0);
    for (let i = 0; i < 3; i++) {
      const drone = new THREE.Mesh(droneGeometry, hull);
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), trim);
      drone.add(light);
      drone.userData['angle'] = (i / 3) * Math.PI * 2;
      this.escort.add(drone);
    }
    this.add(this.escort);
  }

  update(dt: number, elapsed: number): void {
    this.ship.position.y = Math.sin(elapsed * 0.6) * 0.35;
    this.ship.rotation.z = Math.sin(elapsed * 0.4) * 0.05;
    this.ship.rotation.x = Math.sin(elapsed * 0.5 + 1) * 0.03;
    this.updateHighlight(dt);

    const pulse = 0.75 + Math.sin(elapsed * 6) * 0.1 + Math.sin(elapsed * 13.7) * 0.05;
    for (const glow of this.engineGlows) glow.material.opacity = pulse * (0.7 + this.highlight * 0.3);
    this.navLights.forEach((light, i) => {
      const material = light.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + Math.pow(Math.max(0, Math.sin(elapsed * 3 + i * Math.PI)), 10) * 4;
    });

    this.escort.children.forEach((drone, i) => {
      const angle = (drone.userData['angle'] as number) + elapsed * 0.35;
      const radius = 7 + i * 0.8;
      drone.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.7) * 1.6, Math.sin(angle) * radius);
      drone.rotation.y = angle;
      drone.rotation.x = elapsed * 0.8;
    });
  }

  override dispose(): void {
    super.dispose();
    this.glowTexture.dispose();
  }
}
