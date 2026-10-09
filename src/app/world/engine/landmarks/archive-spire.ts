import * as THREE from 'three';
import { Certification, Education } from '../../../data/portfolio.data';
import { createGlowTexture } from '../bake';
import { DestinationId } from '../destinations';
import { Interactable } from '../interaction';
import { damp } from '../tween';
import { emissive, glass, metal, Palette } from '../world-object';
import { Landmark, LandmarkEvents, SubLabel } from './landmark';

interface Disc {
  group: THREE.Group;
  material: THREE.MeshStandardMaterial;
  baseY: number;
  speed: number;
  index: number;
  scale: number;
}

/**
 * Archive Spire Lyra — the Education location. A crystalline knowledge spire
 * whose rotating archive discs each hold a qualification. Index 0 is the degree,
 * the rest are certifications.
 */
export class ArchiveSpire extends Landmark {
  readonly destinationId: DestinationId = 'education';

  private discs: Disc[] = [];
  private shards: THREE.InstancedMesh;
  private shardData: Array<{ angle: number; radius: number; y: number; speed: number; spin: number }> = [];
  private dummy = new THREE.Object3D();
  private activeIndex = 0;
  private hoveredIndex = -1;
  private isAtDestination = () => false;
  private beam: THREE.Mesh;
  private glowTexture: THREE.Texture;
  readonly entries: Array<{ title: string; subtitle: string }>;

  constructor(education: Education[], certifications: Certification[], private readonly events: LandmarkEvents) {
    super();
    this.labelOffset.set(0, 12.5, 0);
    this.entries = [
      ...education.map((e) => ({ title: e.degree, subtitle: e.institution })),
      ...certifications.map((c) => ({ title: c.title, subtitle: c.issuer })),
    ];

    const hull = metal(Palette.hullLight, 0.38, 0.8);
    const hullDark = metal(Palette.hullDark, 0.55, 0.65);
    const violet = this.trackGlow(emissive(Palette.accentViolet, 1.3, 0x120a2a));

    // Base platform
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.2, 0.6, 6), hullDark);
    platform.position.y = -5.4;
    this.add(platform);
    const platformTrim = new THREE.Mesh(new THREE.TorusGeometry(3.7, 0.06, 6, 6), violet);
    platformTrim.rotation.x = Math.PI / 2;
    platformTrim.position.y = -5.05;
    this.add(platformTrim);

    // Central hexagonal spire
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.8, 11, 6), hull);
    this.add(spire);
    const spireCore = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 11.2, 6), violet);
    this.add(spireCore);
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.1, 0), glass(0xc9b8ff, 0.55));
    crystal.position.y = 6.4;
    this.add(crystal);
    const crystalLight = new THREE.PointLight(0xa78bfa, 18, 26, 2);
    crystalLight.position.y = 6.4;
    this.add(crystalLight);

    // Archive discs — one per qualification
    const count = this.entries.length;
    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();
      const baseY = -3.6 + (i / Math.max(1, count - 1)) * 8.2;
      group.position.y = baseY;
      const radius = i === 0 ? 2.6 : 1.9 + (i % 3) * 0.3;
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.12, 48, 1, true), hullDark);
      group.add(disc);
      const plate = new THREE.Mesh(new THREE.RingGeometry(radius * 0.55, radius, 48), hull);
      plate.rotation.x = -Math.PI / 2;
      plate.position.y = 0.06;
      group.add(plate);
      const plateUnder = plate.clone();
      plateUnder.rotation.x = Math.PI / 2;
      plateUnder.position.y = -0.06;
      group.add(plateUnder);
      const material = emissive(i === 0 ? Palette.accentCyan : Palette.accentViolet, 0.8, 0x0a0a1a);
      const glowRing = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.04, 6, 64), material);
      glowRing.rotation.x = Math.PI / 2;
      group.add(glowRing);
      // Data notches around the rim
      for (let n = 0; n < 12; n++) {
        const angle = (n / 12) * Math.PI * 2;
        const notch = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.5), material);
        notch.position.set(Math.cos(angle) * (radius - 0.3), 0, Math.sin(angle) * (radius - 0.3));
        notch.rotation.y = -angle;
        group.add(notch);
      }
      this.add(group);
      this.discs.push({ group, material, baseY, speed: (0.15 + i * 0.04) * (i % 2 ? -1 : 1), index: i, scale: 1 });
    }

    // Floating data shards
    const shardCount = 40;
    this.shards = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.16, 0), emissive(0xb9a6ff, 1.2, 0x1a1030), shardCount);
    for (let i = 0; i < shardCount; i++) {
      this.shardData.push({
        angle: Math.random() * Math.PI * 2,
        radius: 4 + Math.random() * 3.5,
        y: (Math.random() - 0.5) * 11,
        speed: 0.1 + Math.random() * 0.15,
        spin: Math.random() * Math.PI,
      });
    }
    this.add(this.shards);

    // Upward beam from the crystal
    this.beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.6, 14, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x9d86ff, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    );
    this.beam.position.y = 13.5;
    this.add(this.beam);

    this.glowTexture = createGlowTexture(128, [170, 140, 255]);
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glowTexture, transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    glow.position.y = 6.4;
    glow.scale.setScalar(9);
    this.add(glow);
  }

  setDestinationCheck(check: () => boolean): void {
    this.isAtDestination = check;
  }

  setActiveIndex(index: number): void {
    this.activeIndex = index;
  }

  override getInteractables(): Interactable[] {
    return this.discs.map((disc, i) => ({
      id: `archive:${i}`,
      object: disc.group,
      isActive: () => this.isAtDestination(),
      onHover: (hovered) => (this.hoveredIndex = hovered ? i : this.hoveredIndex === i ? -1 : this.hoveredIndex),
      onClick: () => {
        this.setActiveIndex(i);
        this.events.onSubSelect?.('archive', i);
      },
    }));
  }

  override getSubLabels(): SubLabel[] {
    return this.discs.map((disc, i) => ({
      id: `archive:${i}`,
      text: this.entries[i].subtitle,
      anchor: disc.group,
      offset: new THREE.Vector3(i === 0 ? 3.2 : 2.6, 0.2, 0),
    }));
  }

  update(dt: number, elapsed: number): void {
    this.updateHighlight(dt);
    this.discs.forEach((disc, i) => {
      disc.group.rotation.y += dt * disc.speed;
      disc.group.position.y = disc.baseY + Math.sin(elapsed * 0.9 + i * 0.8) * 0.12;
      const isActive = i === this.activeIndex;
      const isHovered = i === this.hoveredIndex;
      disc.scale = damp(disc.scale, isActive ? 1.12 : isHovered ? 1.06 : 1, 6, dt);
      disc.group.scale.setScalar(disc.scale);
      disc.material.emissiveIntensity = damp(disc.material.emissiveIntensity, isActive ? 2.6 : isHovered ? 1.8 : 0.7, 6, dt);
    });

    this.shardData.forEach((s, i) => {
      s.angle += dt * s.speed;
      this.dummy.position.set(Math.cos(s.angle) * s.radius, s.y + Math.sin(elapsed * 0.5 + i) * 0.4, Math.sin(s.angle) * s.radius);
      this.dummy.rotation.set(s.spin + elapsed * 0.6, s.angle, 0);
      this.dummy.updateMatrix();
      this.shards.setMatrixAt(i, this.dummy.matrix);
    });
    this.shards.instanceMatrix.needsUpdate = true;

    (this.beam.material as THREE.MeshBasicMaterial).opacity = 0.06 + Math.sin(elapsed * 1.7) * 0.02 + this.highlight * 0.05;
  }

  override dispose(): void {
    super.dispose();
    this.glowTexture.dispose();
  }
}
