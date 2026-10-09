import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Project } from '../../../data/portfolio.data';
import { bakeTexture, BakedTexture } from '../bake';
import { DestinationDef, DestinationId } from '../destinations';
import { Interactable } from '../interaction';
import { HOLO_FRAGMENT, HOLO_VERTEX } from '../shaders/holo.glsl';
import { ROCK_FRAGMENT } from '../shaders/planet.glsl';
import { damp, shortestAngle } from '../tween';
import { emissive, metal, Palette } from '../world-object';
import { Landmark, LandmarkEvents, SubLabel } from './landmark';

const PANEL_WIDTH = 3.6;
const PANEL_HEIGHT = PANEL_WIDTH * (9 / 16);
const RING_RADIUS = 11.5;

interface HoloPanel {
  group: THREE.Group;
  screen: THREE.Mesh;
  material: THREE.ShaderMaterial;
  angle: number;
  scale: number;
  loaded: boolean;
  loading: boolean;
}

/**
 * Holographic Shipyard — the Projects location. Screens orbit a mined-out
 * asteroid core; the active project rotates to face the visitor and the real
 * screenshot streams in on demand.
 */
export class HoloShipyard extends Landmark {
  readonly destinationId: DestinationId = 'projects';

  private panels: HoloPanel[] = [];
  private ring = new THREE.Group();
  private ringTargetRotation = 0;
  private core: THREE.Mesh;
  private debris: THREE.InstancedMesh;
  private debrisData: Array<{ angle: number; radius: number; speed: number; y: number; tilt: number }> = [];
  private baked: BakedTexture;
  private activeIndex = 0;
  private hoveredIndex = -1;
  private isAtDestination = () => false;
  private loader = new THREE.TextureLoader();
  private loadQueue: number[] = [];
  private inFlight = 0;
  private preloaded = false;
  private dummy = new THREE.Object3D();

  constructor(
    renderer: THREE.WebGLRenderer,
    private readonly def: DestinationDef,
    private readonly projects: Project[],
    private readonly events: LandmarkEvents,
    textureSize: number
  ) {
    super();
    this.labelOffset.set(0, 9, 0);

    // Asteroid core
    this.baked = bakeTexture(
      renderer,
      ROCK_FRAGMENT,
      { uColorA: { value: new THREE.Color(0x4a5064) }, uColorB: { value: new THREE.Color(0x8d94a8) }, uSeed: { value: 3.7 } },
      textureSize / 2,
      textureSize / 4
    );
    const coreGeometry = mergeVertices(new THREE.IcosahedronGeometry(3.2, 5));
    const pos = coreGeometry.getAttribute('position') as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = Math.sin(v.x * 1.3) * Math.cos(v.y * 1.7) * Math.sin(v.z * 1.1);
      const n2 = Math.sin(v.x * 4.1 + 2.0) * Math.sin(v.y * 3.7) * 0.25;
      v.multiplyScalar(1 + n * 0.14 + n2 * 0.1);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    coreGeometry.computeVertexNormals();
    this.core = new THREE.Mesh(coreGeometry, new THREE.MeshStandardMaterial({ map: this.baked.texture, roughness: 0.95, metalness: 0.05 }));
    this.add(this.core);

    // Mining rig on the asteroid: a ring scaffold and a few emissive drills.
    const scaffold = new THREE.Mesh(new THREE.TorusGeometry(3.9, 0.08, 8, 64), metal(Palette.hullMid, 0.5, 0.7));
    scaffold.rotation.x = Math.PI / 2 + 0.3;
    this.add(scaffold);
    const scaffoldLight = this.trackGlow(emissive(Palette.accentBlue, 1.0, 0x0a1020));
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const drill = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.2, 8), metal(Palette.hullLight, 0.4, 0.8));
      drill.position.set(Math.cos(angle) * 3.9, Math.sin(angle) * 1.1, Math.sin(angle) * 3.9 * Math.cos(0.3));
      drill.lookAt(0, 0, 0);
      drill.rotateX(Math.PI / 2);
      this.add(drill);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), scaffoldLight);
      lamp.position.copy(drill.position).multiplyScalar(1.1);
      this.add(lamp);
    }

    // Debris field
    const debrisCount = 70;
    this.debris = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.22, 0), metal(0x5b6273, 0.9, 0.2), debrisCount);
    for (let i = 0; i < debrisCount; i++) {
      this.debrisData.push({
        angle: Math.random() * Math.PI * 2,
        radius: 5.5 + Math.random() * 3.5,
        speed: 0.05 + Math.random() * 0.08,
        y: (Math.random() - 0.5) * 2.4,
        tilt: Math.random() * Math.PI,
      });
    }
    this.add(this.debris);

    // Holographic screens
    const frameMaterial = metal(Palette.hullDark, 0.5, 0.7);
    const emitterMaterial = this.trackGlow(emissive(Palette.accentBlue, 1.6, 0x0a1020));
    const screenGeometry = new THREE.PlaneGeometry(PANEL_WIDTH, PANEL_HEIGHT);
    const count = projects.length;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const group = new THREE.Group();
      group.position.set(Math.sin(angle) * RING_RADIUS, Math.sin(i * 1.3) * 0.9, Math.cos(angle) * RING_RADIUS);
      group.rotation.y = angle; // face outward

      const material = new THREE.ShaderMaterial({
        vertexShader: HOLO_VERTEX,
        fragmentShader: HOLO_FRAGMENT,
        uniforms: {
          uMap: { value: null },
          uHasMap: { value: 0 },
          uTime: { value: 0 },
          uOpacity: { value: 0.5 },
          uAspect: { value: 16 / 9 },
          uPanelAspect: { value: 16 / 9 },
          uTint: { value: new THREE.Color(0x6ea8ff) },
          uActive: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const screen = new THREE.Mesh(screenGeometry, material);
      group.add(screen);

      // Frame
      const edgeH = new THREE.BoxGeometry(PANEL_WIDTH + 0.16, 0.08, 0.08);
      const edgeV = new THREE.BoxGeometry(0.08, PANEL_HEIGHT + 0.16, 0.08);
      const top = new THREE.Mesh(edgeH, frameMaterial);
      top.position.y = PANEL_HEIGHT / 2 + 0.04;
      const bottom = new THREE.Mesh(edgeH, frameMaterial);
      bottom.position.y = -PANEL_HEIGHT / 2 - 0.04;
      const left = new THREE.Mesh(edgeV, frameMaterial);
      left.position.x = -PANEL_WIDTH / 2 - 0.04;
      const right = new THREE.Mesh(edgeV, frameMaterial);
      right.position.x = PANEL_WIDTH / 2 + 0.04;
      group.add(top, bottom, left, right);

      // Emitter pod beneath the screen
      const emitter = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.5, 10), frameMaterial);
      emitter.position.y = -PANEL_HEIGHT / 2 - 0.6;
      group.add(emitter);
      const emitterLight = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 10), emitterMaterial);
      emitterLight.position.y = -PANEL_HEIGHT / 2 - 0.3;
      group.add(emitterLight);

      this.ring.add(group);
      this.panels.push({ group, screen, material, angle, scale: 1, loaded: false, loading: false });
    }
    this.add(this.ring);
    this.setActiveIndex(0, true);
  }

  setDestinationCheck(check: () => boolean): void {
    this.isAtDestination = check;
  }

  setActiveIndex(index: number, immediate = false): void {
    this.activeIndex = index;
    const panel = this.panels[index];
    this.ringTargetRotation = this.def.azimuth - panel.angle;
    if (immediate) this.ring.rotation.y = this.ringTargetRotation;
    this.prioritizeLoad(index);
  }

  override preload(): void {
    if (this.preloaded) return;
    this.preloaded = true;
    this.loadQueue = this.panels.map((_, i) => i);
    this.prioritizeLoad(this.activeIndex);
  }

  private prioritizeLoad(index: number): void {
    if (!this.preloaded) return;
    const count = this.panels.length;
    const order = [index, (index + 1) % count, (index - 1 + count) % count];
    for (const i of order.reverse()) {
      const existing = this.loadQueue.indexOf(i);
      if (existing >= 0) {
        this.loadQueue.splice(existing, 1);
        this.loadQueue.unshift(i);
      }
    }
    this.pumpQueue();
  }

  private pumpQueue(): void {
    while (this.inFlight < 3 && this.loadQueue.length) {
      const index = this.loadQueue.shift()!;
      const panel = this.panels[index];
      if (panel.loaded || panel.loading) continue;
      panel.loading = true;
      this.inFlight++;
      this.loader.load(
        this.projects[index].image,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = 4;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          panel.material.uniforms['uMap'].value = texture;
          panel.material.uniforms['uAspect'].value = texture.image.width / texture.image.height;
          panel.material.uniforms['uHasMap'].value = 1;
          panel.loaded = true;
          panel.loading = false;
          this.inFlight--;
          this.pumpQueue();
        },
        undefined,
        () => {
          panel.loading = false;
          this.inFlight--;
          this.pumpQueue();
        }
      );
    }
  }

  override getInteractables(): Interactable[] {
    return this.panels.map((panel, i) => ({
      id: `project:${i}`,
      object: panel.group,
      isActive: () => this.isAtDestination(),
      onHover: (hovered) => (this.hoveredIndex = hovered ? i : this.hoveredIndex === i ? -1 : this.hoveredIndex),
      onClick: () => {
        this.setActiveIndex(i);
        this.events.onSubSelect?.('project', i);
      },
    }));
  }

  override getSubLabels(): SubLabel[] {
    return [];
  }

  update(dt: number, elapsed: number): void {
    this.updateHighlight(dt);
    this.core.rotation.y += dt * 0.04;
    this.core.rotation.x += dt * 0.01;

    const delta = shortestAngle(this.ring.rotation.y, this.ringTargetRotation);
    this.ring.rotation.y += delta * (1 - Math.exp(-4 * dt));

    this.panels.forEach((panel, i) => {
      const isActive = i === this.activeIndex;
      const isHovered = i === this.hoveredIndex;
      panel.scale = damp(panel.scale, isActive ? 1.22 : isHovered ? 1.08 : 1, 6, dt);
      panel.group.scale.setScalar(panel.scale);
      panel.group.position.y = Math.sin(i * 1.3) * 0.9 + Math.sin(elapsed * 0.8 + i) * 0.12;
      const opacityTarget = isActive ? 1 : isHovered ? 0.8 : 0.5;
      const uniforms = panel.material.uniforms;
      uniforms['uOpacity'].value = damp(uniforms['uOpacity'].value, opacityTarget, 6, dt);
      uniforms['uActive'].value = damp(uniforms['uActive'].value, isActive ? 1 : 0, 6, dt);
      uniforms['uTime'].value = elapsed + i * 0.7;
    });

    this.debrisData.forEach((d, i) => {
      d.angle += dt * d.speed;
      this.dummy.position.set(Math.cos(d.angle) * d.radius, d.y + Math.sin(d.angle * 2) * 0.3, Math.sin(d.angle) * d.radius);
      this.dummy.rotation.set(d.tilt + elapsed * 0.3, d.angle, 0);
      this.dummy.updateMatrix();
      this.debris.setMatrixAt(i, this.dummy.matrix);
    });
    this.debris.instanceMatrix.needsUpdate = true;
  }

  override dispose(): void {
    super.dispose();
    this.baked.dispose();
  }
}
