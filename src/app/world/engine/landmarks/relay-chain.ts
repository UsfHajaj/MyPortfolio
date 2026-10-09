import * as THREE from 'three';
import { Experience } from '../../../data/portfolio.data';
import { DestinationDef, DestinationId } from '../destinations';
import { Interactable } from '../interaction';
import { damp } from '../tween';
import { emissive, metal, Palette } from '../world-object';
import { Landmark, LandmarkEvents, SubLabel } from './landmark';

const KIND_COLORS: Record<Experience['kind'], number> = {
  engineering: Palette.accentBlue,
  ai: Palette.accentCyan,
  education: Palette.accentViolet,
};

interface Module {
  group: THREE.Group;
  statusMaterial: THREE.MeshStandardMaterial;
  windowMaterial: THREE.MeshStandardMaterial;
  scale: number;
  index: number;
}

/**
 * Relay Chain Kepler — the Experience location. Six relay installations linked
 * by trusses form an arc around the visitor; each one is a chapter of the career.
 * Data pulses travel along the trusses from the oldest post to the newest.
 */
export class RelayChain extends Landmark {
  readonly destinationId: DestinationId = 'experience';

  private modules: Module[] = [];
  private pulses: Array<{ mesh: THREE.Mesh; from: THREE.Vector3; to: THREE.Vector3; t: number; speed: number }> = [];
  private activeIndex = 0;
  private hoveredIndex = -1;
  private isAtDestination = () => false;

  constructor(private readonly def: DestinationDef, private readonly experiences: Experience[], private readonly events: LandmarkEvents) {
    super();
    this.labelOffset.set(0, 12, 0);

    const hull = metal(Palette.hullLight, 0.4, 0.8);
    const hullDark = metal(Palette.hullDark, 0.55, 0.65);
    const trim = this.trackGlow(emissive(Palette.accentBlue, 0.8, 0x0a1020));
    const panel = new THREE.MeshStandardMaterial({ color: 0x142449, roughness: 0.3, metalness: 0.7 });

    const count = experiences.length;
    const radius = 13;
    const spread = Math.PI * 0.86;
    // Arc on the far side of the focus so the chain wraps around the camera.
    const centerAngle = def.azimuth + Math.PI;
    const positions: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      // Oldest on the left, newest on the right (data is newest-first).
      const order = count - 1 - i;
      const t = count === 1 ? 0.5 : order / (count - 1);
      const angle = centerAngle + (t - 0.5) * spread;
      const y = Math.sin(t * Math.PI * 2) * 1.6;
      const position = new THREE.Vector3(Math.sin(angle) * radius, y, Math.cos(angle) * radius);
      positions[i] = position;

      const module = new THREE.Group();
      module.position.copy(position);
      module.userData['baseY'] = y;
      module.lookAt(new THREE.Vector3(0, y, 0));

      const body = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.6, 18), hull);
      body.rotation.z = Math.PI / 2;
      module.add(body);
      for (const side of [-1, 1]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.12, 8, 28), hullDark);
        ring.rotation.y = Math.PI / 2;
        ring.position.x = side * 1.1;
        module.add(ring);
      }
      const windowMaterial = this.trackGlow(emissive(0xcfe0ff, 1.4, 0x0a1020));
      const windows = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 0.05), windowMaterial);
      windows.position.set(0, 0.35, 1.0);
      module.add(windows);

      const statusMaterial = emissive(KIND_COLORS[experiences[i].kind], 1.2, 0x0a1020);
      const status = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 8, 32), statusMaterial);
      status.position.set(0, 0, 1.02);
      module.add(status);

      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.2, 6), hull);
      mast.position.set(0, 1.9, 0);
      module.add(mast);
      const dish = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), hullDark);
      dish.position.set(0, 3.0, 0);
      dish.rotation.x = -Math.PI / 2 + 0.6;
      dish.scale.set(1, 0.5, 1);
      module.add(dish);

      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.6, 2.2), panel);
      fin.position.set(0, -1.9, 0);
      module.add(fin);
      const finGrid = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.5, 0.05), trim);
      finGrid.position.set(0.04, -1.9, 0);
      module.add(finGrid);

      this.add(module);
      this.modules.push({ group: module, statusMaterial, windowMaterial, scale: 1, index: i });
    }

    // Trusses + pulses between chronological neighbours.
    const trussMaterial = metal(Palette.hullMid, 0.5, 0.7);
    const pulseGeometry = new THREE.SphereGeometry(0.12, 8, 6);
    for (let order = 0; order < count - 1; order++) {
      const a = positions[count - 1 - order];
      const b = positions[count - 2 - order];
      const length = a.distanceTo(b);
      const truss = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, length - 2.4, 6), trussMaterial);
      truss.position.lerpVectors(a, b, 0.5);
      truss.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      this.add(truss);
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, length - 2.4, 4), trim);
      rail.position.copy(truss.position).add(new THREE.Vector3(0, 0.14, 0));
      rail.quaternion.copy(truss.quaternion);
      this.add(rail);

      for (let p = 0; p < 2; p++) {
        const pulse = new THREE.Mesh(pulseGeometry, emissive(Palette.accentCyan, 3));
        this.add(pulse);
        this.pulses.push({ mesh: pulse, from: a, to: b, t: Math.random(), speed: 0.12 + Math.random() * 0.08 });
      }
    }

    this.setActiveIndex(0);
  }

  setDestinationCheck(check: () => boolean): void {
    this.isAtDestination = check;
  }

  setActiveIndex(index: number): void {
    this.activeIndex = index;
  }

  override getInteractables(): Interactable[] {
    return this.modules.map((module, i) => ({
      id: `experience:${i}`,
      object: module.group,
      isActive: () => this.isAtDestination(),
      onHover: (hovered) => (this.hoveredIndex = hovered ? i : this.hoveredIndex === i ? -1 : this.hoveredIndex),
      onClick: () => {
        this.setActiveIndex(i);
        this.events.onSubSelect?.('experience', i);
      },
    }));
  }

  override getSubLabels(): SubLabel[] {
    return this.modules.map((module, i) => ({
      id: `experience:${i}`,
      text: this.experiences[i].company,
      anchor: module.group,
      offset: new THREE.Vector3(0, 3.9, 0),
    }));
  }

  update(dt: number, elapsed: number): void {
    this.updateHighlight(dt);
    this.modules.forEach((module, i) => {
      const isActive = i === this.activeIndex;
      const isHovered = i === this.hoveredIndex;
      module.scale = damp(module.scale, isActive ? 1.18 : isHovered ? 1.08 : 1, 6, dt);
      module.group.scale.setScalar(module.scale);
      module.group.position.y = (module.group.userData['baseY'] as number) + Math.sin(elapsed * 0.7 + i) * 0.18;
      const pulse = 0.8 + Math.sin(elapsed * 2 + i) * 0.2;
      module.statusMaterial.emissiveIntensity = (isActive ? 3.2 : isHovered ? 2.2 : 1.1) * pulse;
      module.windowMaterial.emissiveIntensity = isActive ? 2.4 : 1.4;
    });
    for (const pulse of this.pulses) {
      pulse.t += dt * pulse.speed;
      if (pulse.t > 1) pulse.t -= 1;
      pulse.mesh.position.lerpVectors(pulse.from, pulse.to, pulse.t).y += 0.14;
      const fade = Math.sin(pulse.t * Math.PI);
      (pulse.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1 + fade * 3;
    }
  }
}
