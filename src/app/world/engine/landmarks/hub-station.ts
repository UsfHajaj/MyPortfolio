import * as THREE from 'three';
import { createGlowTexture } from '../bake';
import { DestinationId } from '../destinations';
import { emissive, glass, metal, Palette } from '../world-object';
import { Landmark } from './landmark';

/**
 * Halo Station — the orbital hub. A rotating habitat ring with six spokes,
 * a central spindle, docking pylons, solar arrays and hundreds of window lights.
 */
export class HubStation extends Landmark {
  readonly destinationId: DestinationId = 'hub';

  private ring: THREE.Group;
  private spindle: THREE.Group;
  private beacons: THREE.Mesh[] = [];
  private windows: THREE.InstancedMesh;
  private windowPhases: Float32Array;
  private windowColor = new THREE.Color();
  private glowSprite: THREE.Sprite;
  private glowTexture: THREE.Texture;

  constructor() {
    super();
    this.labelOffset.set(0, 10.5, 0);
    this.rotation.set(0.32, 0.4, 0.12);

    const hullLight = metal(Palette.hullLight, 0.42, 0.8);
    const hullMid = metal(Palette.hullMid, 0.5, 0.75);
    const hullDark = metal(Palette.hullDark, 0.6, 0.6);
    const trimGlow = this.trackGlow(emissive(Palette.accentBlue, 1.1, 0x0a1020));
    const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x142449, roughness: 0.3, metalness: 0.7 });

    // Habitat ring
    this.ring = new THREE.Group();
    const torus = new THREE.Mesh(new THREE.TorusGeometry(7, 0.85, 20, 120), hullLight);
    this.ring.add(torus);
    const innerRail = new THREE.Mesh(new THREE.TorusGeometry(7, 0.16, 8, 120), trimGlow);
    innerRail.scale.setScalar(0.88);
    this.ring.add(innerRail);
    const outerRail = new THREE.Mesh(new THREE.TorusGeometry(7, 0.12, 8, 120), trimGlow);
    outerRail.scale.setScalar(1.13);
    this.ring.add(outerRail);

    // Segment plating: boxes around the ring to break the perfect torus silhouette.
    const plateGeometry = new THREE.BoxGeometry(1.6, 0.5, 2.1);
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const plate = new THREE.Mesh(plateGeometry, i % 3 === 0 ? hullMid : hullDark);
      plate.position.set(Math.cos(angle) * 7, Math.sin(angle) * 7, 0);
      plate.rotation.z = angle + Math.PI / 2;
      this.ring.add(plate);
    }

    // Spokes to the spindle
    const spokeGeometry = new THREE.CylinderGeometry(0.16, 0.22, 6.6, 10);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const spoke = new THREE.Mesh(spokeGeometry, hullMid);
      spoke.position.set(Math.cos(angle) * 3.5, Math.sin(angle) * 3.5, 0);
      spoke.rotation.z = angle + Math.PI / 2;
      this.ring.add(spoke);
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.08, 6.4, 0.08), trimGlow);
      strut.position.copy(spoke.position).setZ(0.3);
      strut.rotation.z = angle + Math.PI / 2;
      this.ring.add(strut);
    }

    // Window lights
    const windowCount = 260;
    this.windows = new THREE.InstancedMesh(new THREE.BoxGeometry(0.14, 0.09, 0.06), emissive(0xd6e6ff, 2.2), windowCount);
    this.windowPhases = new Float32Array(windowCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < windowCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const side = Math.random() < 0.5 ? 1 : -1;
      const radius = 7 + (Math.random() - 0.5) * 1.0;
      dummy.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, side * 0.86);
      dummy.rotation.set(0, 0, angle);
      dummy.updateMatrix();
      this.windows.setMatrixAt(i, dummy.matrix);
      this.windowPhases[i] = Math.random();
      this.windows.setColorAt(i, this.windowColor.setHSL(0.6, 0.3, 0.75 + Math.random() * 0.25));
    }
    this.windows.instanceMatrix.needsUpdate = true;
    this.ring.add(this.windows);
    this.add(this.ring);

    // Central spindle (does not rotate with the ring)
    this.spindle = new THREE.Group();
    const core = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 7.5, 24), hullLight);
    core.rotation.x = Math.PI / 2;
    this.spindle.add(core);
    const coreBands = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.22, 0.3, 24), trimGlow);
    coreBands.rotation.x = Math.PI / 2;
    coreBands.position.z = 1.4;
    this.spindle.add(coreBands);
    const coreBands2 = coreBands.clone();
    coreBands2.position.z = -1.4;
    this.spindle.add(coreBands2);
    const frontCap = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 16), hullMid);
    frontCap.position.z = 3.75;
    this.spindle.add(frontCap);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1.45, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2), glass(Palette.glass, 0.35));
    dome.rotation.x = Math.PI / 2;
    dome.position.z = 3.9;
    this.spindle.add(dome);
    const domeLight = new THREE.PointLight(0x8fb8ff, 6, 10, 2);
    domeLight.position.z = 4.3;
    this.spindle.add(domeLight);

    // Docking pylon at the rear with two pads
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 5), hullDark);
    pylon.position.z = -6;
    this.spindle.add(pylon);
    const pad = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, 1.4), hullMid);
    pad.position.z = -8.3;
    this.spindle.add(pad);
    const padLights = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.05, 0.1), trimGlow);
    padLights.position.set(0, 0.18, -8.3);
    this.spindle.add(padLights);

    // Solar arrays
    const panelGeometry = new THREE.BoxGeometry(5.5, 0.08, 1.8);
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.2, 8), hullDark);
      arm.rotation.z = Math.PI / 2;
      arm.position.set(side * 2.6, 0, -3.4);
      this.spindle.add(arm);
      const panel = new THREE.Mesh(panelGeometry, panelMaterial);
      panel.position.set(side * 6.8, 0, -3.4);
      panel.rotation.x = 0.35;
      this.spindle.add(panel);
      const panelGrid = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.02, 0.04), trimGlow);
      panelGrid.position.set(side * 6.8, 0.06, -3.4);
      panelGrid.rotation.x = 0.35;
      this.spindle.add(panelGrid);
    }

    // Antenna mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 4.2, 6), hullLight);
    mast.position.set(0, 2.9, -1.2);
    this.spindle.add(mast);
    const beaconMaterial = emissive(0xffffff, 3);
    for (const pos of [new THREE.Vector3(0, 5.05, -1.2), new THREE.Vector3(0, -1.6, -8.3)]) {
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), beaconMaterial.clone());
      beacon.position.copy(pos);
      this.spindle.add(beacon);
      this.beacons.push(beacon);
    }
    this.add(this.spindle);

    // Soft ambient glow behind the station so it reads against the dark.
    this.glowTexture = createGlowTexture(128, [110, 150, 255]);
    this.glowSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glowTexture, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    this.glowSprite.scale.setScalar(30);
    this.add(this.glowSprite);
  }

  update(dt: number, elapsed: number): void {
    this.ring.rotation.z += dt * 0.06;
    this.spindle.rotation.z -= dt * 0.01;
    this.updateHighlight(dt);

    // Flicker a handful of windows each frame.
    for (let i = 0; i < 6; i++) {
      const index = Math.floor(Math.random() * this.windowPhases.length);
      const flicker = 0.55 + 0.45 * Math.sin(elapsed * 1.5 + this.windowPhases[index] * 12.0);
      this.windows.setColorAt(index, this.windowColor.setHSL(0.6, 0.25, 0.55 + flicker * 0.4));
    }
    if (this.windows.instanceColor) this.windows.instanceColor.needsUpdate = true;

    this.beacons.forEach((beacon, i) => {
      const material = beacon.material as THREE.MeshStandardMaterial;
      const blink = Math.pow(Math.max(0, Math.sin(elapsed * 2.2 + i * 1.7)), 12);
      material.emissiveIntensity = 0.3 + blink * 4;
    });
    this.glowSprite.material.opacity = 0.16 + this.highlight * 0.1;
  }

  override dispose(): void {
    super.dispose();
    this.glowTexture.dispose();
  }
}
