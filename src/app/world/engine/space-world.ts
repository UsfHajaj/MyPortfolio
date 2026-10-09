import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import { CERTIFICATIONS, EDUCATION, EXPERIENCES, PROJECTS, SKILL_CATEGORIES } from '../../data/portfolio.data';
import { CameraRig } from './camera-rig';
import { CameraPose, DESTINATIONS, DestinationDef, DestinationId, getDestination, OVERVIEW_POSE, ViewId } from './destinations';
import { Dust } from './environment/dust';
import { Galaxy } from './environment/galaxy';
import { Nebula } from './environment/nebula';
import { Planet } from './environment/planet';
import { Starfield } from './environment/starfield';
import { Sun } from './environment/sun';
import { InteractionSystem } from './interaction';
import { ArchiveSpire } from './landmarks/archive-spire';
import { CommandVessel } from './landmarks/command-vessel';
import { HoloShipyard } from './landmarks/holo-shipyard';
import { HubStation } from './landmarks/hub-station';
import { Landmark, SubLabel } from './landmarks/landmark';
import { RelayChain } from './landmarks/relay-chain';
import { TechnologyCore } from './landmarks/technology-core';
import { TransmissionArray } from './landmarks/transmission-array';
import { QualitySettings } from './quality';
import { GAS_GIANT_FRAGMENT, ICE_PLANET_FRAGMENT } from './shaders/planet.glsl';
import { clamp, damp } from './tween';

export interface LabelState {
  id: string;
  kind: 'destination' | 'sub';
  destination: DestinationId;
  text: string;
  x: number;
  y: number;
  visible: boolean;
  scale: number;
  hovered: boolean;
}

export interface MinimapState {
  cameraX: number;
  cameraZ: number;
  forwardX: number;
  forwardZ: number;
  focusX: number;
  focusZ: number;
}

export interface WorldCallbacks {
  onProgress: (progress: number, status: string) => void;
  onHover: (id: string | null) => void;
  onTravelStart: (view: ViewId, duration: number) => void;
  onArrive: (view: ViewId) => void;
  onSubSelect: (kind: string, index: number) => void;
  onLabels: (labels: LabelState[]) => void;
  onUserInteraction: () => void;
  onContextLost: () => void;
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * The universe. Owns the renderer, scene graph, camera rig, interaction system
 * and all landmarks; exposes a small imperative API for the Angular HUD.
 */
export class SpaceWorld {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly rig: CameraRig;

  private composer: EffectComposer | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private interaction: InteractionSystem;
  private clock = new THREE.Clock();
  private frameId = 0;
  private running = false;
  private disposed = false;

  private updatables: Array<{ update(dt: number, elapsed: number): void }> = [];
  private disposables: Array<{ dispose(): void }> = [];
  private landmarks = new Map<DestinationId, Landmark>();
  private labels: LabelState[] = [];
  private labelAnchors: Array<{ state: LabelState; object: THREE.Object3D; offset: THREE.Vector3; parent: Landmark }> = [];

  private currentView: ViewId = 'hub';
  private targetView: ViewId = 'hub';
  private panelOpen = false;
  private hoveredId: string | null = null;
  private starfield!: Starfield;
  private nebula: Nebula | null = null;
  private pmrem: THREE.PMREMGenerator | null = null;
  private envTexture: THREE.Texture | null = null;
  private exposureTarget = 1;

  private readonly tmp = new THREE.Vector3();
  private readonly tmpForward = new THREE.Vector3();
  private readonly onContextLostBound = (event: Event) => {
    event.preventDefault();
    this.callbacks.onContextLost();
  };

  constructor(private readonly canvas: HTMLCanvasElement, private quality: QualitySettings, private readonly callbacks: WorldCallbacks) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: quality.antialias,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
    });
    this.renderer.setPixelRatio(quality.pixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene.background = new THREE.Color(0x02030a);
    canvas.addEventListener('webglcontextlost', this.onContextLostBound);

    this.rig = new CameraRig(
      canvas,
      { reducedMotion: quality.reducedMotion, isTouch: quality.isTouch },
      {
        onClick: (ndc) => this.handleClick(ndc),
        onPointerMove: (ndc) => this.interaction.handlePointerMove(ndc),
        onUserInteraction: () => this.callbacks.onUserInteraction(),
      }
    );
    this.interaction = new InteractionSystem(this.rig.camera, canvas);
  }

  /** Static label definitions (positions are updated every frame via onLabels). */
  get labelStates(): readonly LabelState[] {
    return this.labels;
  }

  /** The view the camera has arrived at. */
  get view(): ViewId {
    return this.currentView;
  }

  /** The view the camera is at or flying toward. */
  get target(): ViewId {
    return this.targetView;
  }

  get travelling(): boolean {
    return this.rig.isTravelling;
  }

  /** Builds the universe in stages so the loading screen can report progress. */
  async build(): Promise<void> {
    const report = async (progress: number, status: string) => {
      this.callbacks.onProgress(progress, status);
      await nextFrame();
    };

    await report(0.05, 'Charting the starfield');
    this.buildSky();

    await report(0.22, 'Igniting the sun');
    this.buildLighting();

    await report(0.35, 'Forming planets');
    this.buildPlanets();

    await report(0.55, 'Assembling Halo Station');
    this.addLandmark(new HubStation());
    this.addLandmark(new CommandVessel());

    await report(0.68, 'Linking the relay chain');
    const relay = new RelayChain(getDestination('experience'), EXPERIENCES, { onSubSelect: (k, i) => this.callbacks.onSubSelect(k, i) });
    relay.setDestinationCheck(() => this.currentView === 'experience' && !this.travelling);
    this.addLandmark(relay);

    await report(0.78, 'Powering the technology core');
    const core = new TechnologyCore(SKILL_CATEGORIES, { onSubSelect: (k, i) => this.callbacks.onSubSelect(k, i) });
    core.setDestinationCheck(() => this.currentView === 'skills' && !this.travelling);
    this.addLandmark(core);

    await report(0.86, 'Projecting the holographic shipyard');
    const shipyard = new HoloShipyard(this.renderer, getDestination('projects'), PROJECTS, { onSubSelect: (k, i) => this.callbacks.onSubSelect(k, i) }, this.quality.planetTextureSize);
    shipyard.setDestinationCheck(() => this.currentView === 'projects' && !this.travelling);
    this.addLandmark(shipyard);

    await report(0.93, 'Indexing the archive spire');
    const archive = new ArchiveSpire(EDUCATION, CERTIFICATIONS, { onSubSelect: (k, i) => this.callbacks.onSubSelect(k, i) });
    archive.setDestinationCheck(() => this.currentView === 'education' && !this.travelling);
    this.addLandmark(archive);
    this.addLandmark(new TransmissionArray());

    await report(0.97, 'Calibrating optics');
    this.buildPostProcessing();
    this.resize();

    // Warm up shaders with one off-screen render so the first frame is smooth.
    this.rig.setPose(getDestination('hub'), { distance: 150, polar: 0.9, azimuth: getDestination('hub').azimuth - 1.2 });
    this.renderFrame();
    await report(1, 'Ready');
  }

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.clock.start();
    const loop = () => {
      if (!this.running) return;
      this.frameId = requestAnimationFrame(loop);
      this.tick();
    };
    this.frameId = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frameId);
  }

  /** Sweeping arrival shot into the hub. Resolves when the camera settles. */
  playIntro(): Promise<void> {
    return new Promise((resolve) => {
      const hub = getDestination('hub');
      this.currentView = this.targetView = 'hub';
      this.rig.setPose(hub, { distance: 150, polar: 0.9, azimuth: hub.azimuth - 1.2 });
      const duration = this.quality.reducedMotion ? 1.2 : 5.2;
      this.callbacks.onTravelStart('hub', duration);
      this.rig.flyTo(
        hub,
        () => {
          this.callbacks.onArrive('hub');
          resolve();
        },
        duration
      );
    });
  }

  travelTo(view: ViewId): void {
    if (this.disposed) return;
    if (view === this.targetView && !this.travelling) return;
    this.targetView = view;
    const pose: CameraPose = view === 'overview' ? OVERVIEW_POSE : getDestination(view);
    this.interaction.clearHover();
    this.setHovered(null);
    if (view !== 'overview') this.landmarks.get(view)?.preload();
    this.landmarks.forEach((landmark, id) => landmark.setActive(id === view));

    const duration = this.rig.flyTo(pose, () => {
      this.currentView = view;
      this.callbacks.onArrive(view);
    });
    this.callbacks.onTravelStart(view, duration);
  }

  /** Nudges the orbit (keyboard / tour). */
  orbit(azimuth: number, polar: number): void {
    this.rig.nudge(azimuth, polar);
  }

  zoom(factor: number): void {
    this.rig.zoomBy(factor);
  }

  setPanelOpen(open: boolean): void {
    this.panelOpen = open;
  }

  setSelection(kind: 'project' | 'experience' | 'skill' | 'archive', index: number): void {
    switch (kind) {
      case 'project':
        (this.landmarks.get('projects') as HoloShipyard | undefined)?.setActiveIndex(index);
        break;
      case 'experience':
        (this.landmarks.get('experience') as RelayChain | undefined)?.setActiveIndex(index);
        break;
      case 'skill':
        (this.landmarks.get('skills') as TechnologyCore | undefined)?.setActiveCategory(index);
        break;
      case 'archive':
        (this.landmarks.get('education') as ArchiveSpire | undefined)?.setActiveIndex(index);
        break;
    }
  }

  preloadAll(): void {
    this.landmarks.forEach((l) => l.preload());
  }

  getMinimapState(): MinimapState {
    const camera = this.rig.camera;
    camera.getWorldDirection(this.tmpForward);
    return {
      cameraX: camera.position.x,
      cameraZ: camera.position.z,
      forwardX: this.tmpForward.x,
      forwardZ: this.tmpForward.z,
      focusX: this.rig.focus.x,
      focusZ: this.rig.focus.z,
    };
  }

  setQuality(quality: QualitySettings): void {
    this.quality = quality;
    this.renderer.setPixelRatio(quality.pixelRatio);
    this.starfield.setPixelRatio(quality.pixelRatio);
    if (this.nebula) this.nebula.visible = quality.nebula;
    if (quality.bloom && !this.composer) this.buildPostProcessing();
    if (!quality.bloom && this.composer) {
      this.composer.dispose();
      this.composer = null;
      this.bloomPass = null;
    }
    this.resize();
  }

  resize(): void {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.rig.resize(width, height);
    this.composer?.setSize(width, height);
    this.bloomPass?.setSize(width, height);
  }

  dispose(): void {
    this.disposed = true;
    this.stop();
    this.canvas.removeEventListener('webglcontextlost', this.onContextLostBound);
    this.rig.dispose();
    this.interaction.dispose();
    this.landmarks.forEach((l) => l.dispose());
    this.disposables.forEach((d) => d.dispose());
    this.envTexture?.dispose();
    this.pmrem?.dispose();
    this.composer?.dispose();
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }

  // ---------------------------------------------------------------------------

  private buildSky(): void {
    this.starfield = new Starfield(this.quality.starCount, this.quality.pixelRatio);
    this.scene.add(this.starfield);
    this.updatables.push(this.starfield);
    this.disposables.push(this.starfield);

    if (this.quality.nebula) {
      this.nebula = new Nebula();
      this.scene.add(this.nebula);
      this.updatables.push(this.nebula);
      this.disposables.push(this.nebula);
    }

    const galaxy = new Galaxy(this.quality.tier === 'low' ? 1500 : 3200);
    this.scene.add(galaxy);
    this.updatables.push(galaxy);
    this.disposables.push(galaxy);

    const dust = new Dust(this.quality.dustCount);
    this.scene.add(dust);
    this.updatables.push(dust);
    this.disposables.push(dust);
  }

  private buildLighting(): void {
    const sun = new Sun();
    this.scene.add(sun, sun.light, sun.light.target);
    this.updatables.push(sun);
    this.disposables.push(sun);

    const hemisphere = new THREE.HemisphereLight(0x3b4f8a, 0x05060f, 0.55);
    this.scene.add(hemisphere);

    // Image-based lighting so metals pick up believable reflections.
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envTexture = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.envTexture;
    this.scene.environmentIntensity = 0.32;
  }

  private buildPlanets(): void {
    const size = this.quality.planetTextureSize;

    const giant = new Planet(this.renderer, {
      radius: 30,
      textureSize: size,
      surfaceShader: GAS_GIANT_FRAGMENT,
      surfaceUniforms: {
        uColorA: { value: new THREE.Color(0x0d1b45) },
        uColorB: { value: new THREE.Color(0x3b3f8f) },
        uColorC: { value: new THREE.Color(0x8aa0d8) },
        uColorD: { value: new THREE.Color(0xc9d4f5) },
        uSeed: { value: 1.7 },
      },
      atmosphere: { color: 0x5b7dff, power: 3.4, intensity: 1.5, scale: 1.03 },
      rings: { inner: 38, outer: 64, colorA: 0x6c7390, colorB: 0xb8c3e0, tilt: 0.1 },
      rotationSpeed: 0.012,
      axialTilt: 0.28,
      roughness: 0.95,
    });
    giant.position.set(-72, -14, -112);
    this.scene.add(giant);
    this.updatables.push(giant);
    this.disposables.push(giant);

    const ice = new Planet(this.renderer, {
      radius: 7,
      textureSize: size / 2,
      surfaceShader: ICE_PLANET_FRAGMENT,
      surfaceUniforms: {
        uColorA: { value: new THREE.Color(0x6f8fb8) },
        uColorB: { value: new THREE.Color(0xc8dcf0) },
        uColorC: { value: new THREE.Color(0x2f4f80) },
        uSeed: { value: 4.2 },
      },
      atmosphere: { color: 0x9fd4ff, power: 3.0, intensity: 1.2, scale: 1.05 },
      rotationSpeed: 0.03,
      axialTilt: 0.4,
      roughness: 0.6,
    });
    ice.position.set(-68, -9, -54);
    this.scene.add(ice);
    this.updatables.push(ice);
    this.disposables.push(ice);

    const ember = new Planet(this.renderer, {
      radius: 15,
      textureSize: size / 2,
      surfaceShader: GAS_GIANT_FRAGMENT,
      surfaceUniforms: {
        uColorA: { value: new THREE.Color(0x1a0f33) },
        uColorB: { value: new THREE.Color(0x4a2a7a) },
        uColorC: { value: new THREE.Color(0x8a5cc0) },
        uColorD: { value: new THREE.Color(0xd9b8ff) },
        uSeed: { value: 9.1 },
      },
      atmosphere: { color: 0x9b6cff, power: 3.2, intensity: 1.3, scale: 1.035 },
      rings: { inner: 19, outer: 29, colorA: 0x4b4470, colorB: 0x9d8fd0, tilt: 0.45 },
      rotationSpeed: 0.02,
      axialTilt: -0.35,
    });
    ember.position.set(48, 26, 196);
    this.scene.add(ember);
    this.updatables.push(ember);
    this.disposables.push(ember);
  }

  private buildPostProcessing(): void {
    if (!this.quality.bloom) return;
    const size = new THREE.Vector2();
    this.renderer.getSize(size);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.rig.camera));
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.42, 0.65, 0.82);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());
  }

  private addLandmark(landmark: Landmark): void {
    const def = getDestination(landmark.destinationId);
    landmark.position.set(...def.focus);
    landmark.attachCamera(this.rig.camera);
    this.scene.add(landmark);
    this.landmarks.set(landmark.destinationId, landmark);
    this.updatables.push(landmark);

    this.interaction.register({
      id: `destination:${landmark.destinationId}`,
      object: landmark,
      onHover: (hovered) => {
        landmark.setHovered(hovered);
        this.setHovered(hovered ? `destination:${landmark.destinationId}` : null);
      },
      onClick: () => {
        if (this.currentView !== landmark.destinationId || this.travelling) this.travelTo(landmark.destinationId);
      },
    });

    const destinationLabel: LabelState = {
      id: `destination:${landmark.destinationId}`,
      kind: 'destination',
      destination: landmark.destinationId,
      text: def.label,
      x: 0,
      y: 0,
      visible: false,
      scale: 1,
      hovered: false,
    };
    this.labels.push(destinationLabel);
    this.labelAnchors.push({ state: destinationLabel, object: landmark, offset: landmark.labelOffset, parent: landmark });

    for (const item of landmark.getInteractables()) {
      const originalHover = item.onHover;
      this.interaction.register({
        ...item,
        onHover: (hovered) => {
          originalHover?.(hovered);
          this.setHovered(hovered ? item.id : null);
        },
      });
    }
    for (const sub of landmark.getSubLabels()) this.addSubLabel(landmark, def, sub);
  }

  private addSubLabel(landmark: Landmark, def: DestinationDef, sub: SubLabel): void {
    const state: LabelState = {
      id: sub.id,
      kind: 'sub',
      destination: def.id,
      text: sub.text,
      x: 0,
      y: 0,
      visible: false,
      scale: 1,
      hovered: false,
    };
    this.labels.push(state);
    this.labelAnchors.push({ state, object: sub.anchor, offset: sub.offset ?? new THREE.Vector3(), parent: landmark });
  }

  private setHovered(id: string | null): void {
    if (this.hoveredId === id) return;
    this.hoveredId = id;
    this.callbacks.onHover(id);
  }

  private handleClick(ndc: THREE.Vector2): void {
    this.interaction.handleClick(ndc);
  }

  private tick(): void {
    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.05);
    const elapsed = this.clock.elapsedTime;

    this.rig.update(dt, elapsed, Math.min(rawDt, 0.5));
    for (const updatable of this.updatables) updatable.update(dt, elapsed);

    // Slight exposure dip while travelling adds to the sense of speed.
    this.exposureTarget = this.travelling ? 0.9 : 1.0;
    this.renderer.toneMappingExposure = damp(this.renderer.toneMappingExposure, this.exposureTarget, 3, dt);

    this.updateLabels();
    this.renderFrame();
  }

  private renderFrame(): void {
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.rig.camera);
  }

  private updateLabels(): void {
    const camera = this.rig.camera;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const travelling = this.travelling;
    const skills = this.landmarks.get('skills') as TechnologyCore | undefined;

    for (const anchor of this.labelAnchors) {
      const state = anchor.state;
      let visible: boolean;
      if (state.kind === 'destination') {
        const isCurrent = state.destination === this.currentView && !travelling;
        visible = !(isCurrent && this.panelOpen);
      } else {
        visible = !travelling && this.currentView === state.destination;
        if (visible && state.destination === 'skills' && skills) visible = skills.isSubLabelVisible(state.id);
      }

      if (!visible) {
        state.visible = false;
        continue;
      }

      anchor.object.getWorldPosition(this.tmp).add(anchor.offset);
      const distance = this.tmp.distanceTo(camera.position);
      this.tmp.project(camera);
      if (this.tmp.z > 1 || this.tmp.x < -1.15 || this.tmp.x > 1.15 || this.tmp.y < -1.15 || this.tmp.y > 1.15) {
        state.visible = false;
        continue;
      }
      state.visible = true;
      state.x = (this.tmp.x * 0.5 + 0.5) * width;
      state.y = (-this.tmp.y * 0.5 + 0.5) * height;
      state.scale = state.kind === 'destination' ? clamp(1.15 - distance / 420, 0.7, 1.1) : clamp(1.1 - distance / 90, 0.7, 1);
      state.hovered = this.hoveredId === state.id || (state.kind === 'destination' && this.hoveredId === `destination:${state.destination}`);
    }
    this.callbacks.onLabels(this.labels);
  }

  /** Destinations as displayed on the minimap (static). */
  static get destinations(): DestinationDef[] {
    return DESTINATIONS;
  }
}
