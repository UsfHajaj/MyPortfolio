import * as THREE from 'three';
import { CameraPose } from './destinations';
import { clamp, damp, Ease, lerp, shortestAngle, Tweens, TweenHandle } from './tween';

export interface RigOptions {
  reducedMotion: boolean;
  isTouch: boolean;
}

export interface RigCallbacks {
  onClick: (ndc: THREE.Vector2, event: PointerEvent) => void;
  onPointerMove: (ndc: THREE.Vector2 | null) => void;
  onUserInteraction: () => void;
}

interface SphericalPose {
  focus: THREE.Vector3;
  distance: number;
  azimuth: number;
  polar: number;
}

const DRAG_THRESHOLD_PX = 6;
const POLAR_MIN = 0.25;
const POLAR_MAX = Math.PI - 0.35;

/**
 * Guided orbital camera: every destination defines a focus point and an orbit.
 * Visitors can look around (drag), zoom (wheel / pinch) and fly between
 * destinations with cinematic easing. Idle drift and pointer parallax keep the
 * frame alive without stealing control.
 */
export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;

  private base: SphericalPose = { focus: new THREE.Vector3(), distance: 30, azimuth: 0, polar: 1.2 };
  private limits = { min: 10, max: 60 };

  private userAzimuth = 0;
  private userPolar = 0;
  private userZoom = 1;
  private userAzimuthTarget = 0;
  private userPolarTarget = 0;
  private userZoomTarget = 1;

  private parallax = new THREE.Vector2();
  private parallaxTarget = new THREE.Vector2();
  private driftSpeed = 0.035;
  private driftAccumulated = 0;

  private travelTween: TweenHandle | null = null;
  private travelling = false;
  private travelProgress = 0;
  private baseFov = 50;
  private tweens = new Tweens();

  private pointers = new Map<number, { x: number; y: number }>();
  private pressStart: { x: number; y: number } | null = null;
  private dragging = false;
  private lastPinchDistance = 0;
  private lastInteraction = 0;
  private elapsedTime = 0;
  private enabled = true;

  private readonly ndc = new THREE.Vector2();
  private readonly tmpVector = new THREE.Vector3();
  private readonly listeners: Array<[string, EventListener, AddEventListenerOptions?]> = [];

  constructor(private readonly element: HTMLElement, private readonly options: RigOptions, private readonly callbacks: RigCallbacks) {
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2500);
    this.bindEvents();
    this.updateFovForViewport();
  }

  get isTravelling(): boolean {
    return this.travelling;
  }

  get progress(): number {
    return this.travelProgress;
  }

  get focus(): THREE.Vector3 {
    return this.base.focus;
  }

  get currentDistance(): number {
    return this.base.distance * this.userZoom;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.pointers.clear();
      this.pressStart = null;
      this.dragging = false;
    }
  }

  /** Snap directly to a pose (used for the initial far shot before the intro). */
  setPose(pose: CameraPose, overrides: Partial<SphericalPose> = {}): void {
    this.base.focus.set(...pose.focus);
    this.base.distance = overrides.distance ?? pose.distance;
    this.base.azimuth = overrides.azimuth ?? pose.azimuth;
    this.base.polar = overrides.polar ?? pose.polar;
    this.limits = { min: pose.minDistance, max: pose.maxDistance };
    this.resetUserOffsets();
    this.apply();
  }

  /** Cinematic flight to another pose. Returns the flight duration in seconds. */
  flyTo(pose: CameraPose, onArrive?: () => void, durationOverride?: number): number {
    this.travelTween?.cancel();

    // Fold user offsets into the start pose so there is never a visual jump.
    const start: SphericalPose = {
      focus: this.base.focus.clone(),
      distance: this.base.distance * this.userZoom,
      azimuth: this.base.azimuth + this.userAzimuth + this.driftAccumulated + this.parallax.x,
      polar: clamp(this.base.polar + this.userPolar + this.parallax.y, POLAR_MIN, POLAR_MAX),
    };
    const end: SphericalPose = {
      focus: new THREE.Vector3(...pose.focus),
      distance: pose.distance,
      azimuth: pose.azimuth,
      polar: pose.polar,
    };
    this.resetUserOffsets();
    this.limits = { min: pose.minDistance, max: pose.maxDistance };

    const travelDistance = start.focus.distanceTo(end.focus);
    const reduced = this.options.reducedMotion;
    const duration = durationOverride ?? (reduced ? 0.7 : clamp(1.6 + travelDistance * 0.022, 1.8, 4.2));
    const bulge = reduced ? 0 : clamp(travelDistance * 0.3, 0, 36);
    const azimuthDelta = shortestAngle(start.azimuth, end.azimuth);

    this.travelling = true;
    this.travelProgress = 0;
    this.travelTween = this.tweens.add(
      duration,
      (t) => {
        this.travelProgress = t;
        this.base.focus.lerpVectors(start.focus, end.focus, t);
        this.base.distance = lerp(start.distance, end.distance, t) + bulge * Math.sin(Math.PI * t);
        this.base.azimuth = start.azimuth + azimuthDelta * t;
        this.base.polar = lerp(start.polar, end.polar, t);
      },
      {
        easing: reduced ? Ease.inOutSine : Ease.cinematic,
        onComplete: () => {
          this.travelling = false;
          this.travelProgress = 1;
          this.base.azimuth = end.azimuth;
          onArrive?.();
        },
      }
    );
    return duration;
  }

  /** Smoothly nudge the orbit (used by keyboard arrows or guided tours). */
  nudge(azimuth: number, polar: number): void {
    this.userAzimuthTarget += azimuth;
    this.userPolarTarget = clamp(this.userPolarTarget + polar, -0.9, 0.9);
    this.markInteraction();
  }

  zoomBy(factor: number): void {
    this.userZoomTarget = this.clampZoom(this.userZoomTarget * factor);
    this.markInteraction();
  }

  /**
   * @param dt clamped frame delta used for smoothing
   * @param elapsed scene time
   * @param realDt unclamped wall-clock delta so flights keep their real duration at low frame rates
   */
  update(dt: number, elapsed: number, realDt = dt): void {
    this.elapsedTime = elapsed;
    this.tweens.update(realDt);

    const smoothing = this.travelling ? 10 : 6;
    this.userAzimuth = damp(this.userAzimuth, this.userAzimuthTarget, smoothing, dt);
    this.userPolar = damp(this.userPolar, this.userPolarTarget, smoothing, dt);
    this.userZoom = damp(this.userZoom, this.userZoomTarget, 5, dt);

    if (!this.options.reducedMotion) {
      // Idle drift pauses while the visitor interacts, then gently resumes.
      const idleFor = elapsed - this.lastInteraction;
      const driftFactor = this.travelling ? 0 : clamp((idleFor - 2.5) / 3, 0, 1);
      this.driftAccumulated += this.driftSpeed * driftFactor * dt;
      this.parallax.x = damp(this.parallax.x, this.parallaxTarget.x, 2.5, dt);
      this.parallax.y = damp(this.parallax.y, this.parallaxTarget.y, 2.5, dt);
    }

    this.apply();
  }

  private apply(): void {
    const distance = this.travelling ? this.base.distance : this.base.distance * this.userZoom;
    const azimuth = this.base.azimuth + this.userAzimuth + this.driftAccumulated + this.parallax.x;
    const polar = clamp(this.base.polar + this.userPolar + this.parallax.y, POLAR_MIN, POLAR_MAX);

    const sinPolar = Math.sin(polar);
    this.tmpVector.set(distance * sinPolar * Math.sin(azimuth), distance * Math.cos(polar), distance * sinPolar * Math.cos(azimuth));
    this.camera.position.copy(this.base.focus).add(this.tmpVector);
    this.camera.lookAt(this.base.focus);

    const travelFov = this.travelling && !this.options.reducedMotion ? 6 * Math.sin(Math.PI * this.travelProgress) : 0;
    const fov = this.baseFov + travelFov;
    if (Math.abs(this.camera.fov - fov) > 0.01) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.updateFovForViewport();
    this.camera.updateProjectionMatrix();
  }

  private updateFovForViewport(): void {
    const portrait = window.innerHeight > window.innerWidth;
    this.baseFov = portrait ? 66 : 50;
    this.camera.fov = this.baseFov;
  }

  private resetUserOffsets(): void {
    this.userAzimuth = this.userAzimuthTarget = 0;
    this.userPolar = this.userPolarTarget = 0;
    this.userZoom = this.userZoomTarget = 1;
    this.driftAccumulated = 0;
  }

  private clampZoom(zoom: number): number {
    const min = this.limits.min / this.base.distance;
    const max = this.limits.max / this.base.distance;
    return clamp(zoom, min, max);
  }

  private markInteraction(): void {
    this.lastInteraction = this.elapsedTime;
    this.callbacks.onUserInteraction();
  }

  private toNdc(clientX: number, clientY: number): THREE.Vector2 {
    const rect = this.element.getBoundingClientRect();
    this.ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    return this.ndc;
  }

  private bindEvents(): void {
    const on = <K extends keyof HTMLElementEventMap>(type: K, handler: (e: HTMLElementEventMap[K]) => void, opts?: AddEventListenerOptions) => {
      const listener = handler as EventListener;
      this.element.addEventListener(type, listener, opts);
      this.listeners.push([type, listener, opts]);
    };

    on('pointerdown', (e) => {
      if (!this.enabled) return;
      this.element.setPointerCapture?.(e.pointerId);
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.pointers.size === 1) {
        this.pressStart = { x: e.clientX, y: e.clientY };
        this.dragging = false;
      } else if (this.pointers.size === 2) {
        this.lastPinchDistance = this.pinchDistance();
        this.pressStart = null;
      }
      this.markInteraction();
    });

    on('pointermove', (e) => {
      if (!this.enabled) return;
      const previous = this.pointers.get(e.pointerId);
      if (previous) {
        if (this.pointers.size === 2) {
          this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
          const distance = this.pinchDistance();
          if (this.lastPinchDistance > 0) {
            this.userZoomTarget = this.clampZoom(this.userZoomTarget * (this.lastPinchDistance / distance));
          }
          this.lastPinchDistance = distance;
          this.markInteraction();
          return;
        }
        const dx = e.clientX - previous.x;
        const dy = e.clientY - previous.y;
        this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (this.pressStart && !this.dragging) {
          const moved = Math.hypot(e.clientX - this.pressStart.x, e.clientY - this.pressStart.y);
          if (moved > DRAG_THRESHOLD_PX) this.dragging = true;
        }
        if (this.dragging) {
          const speed = this.options.isTouch ? 0.006 : 0.0045;
          this.userAzimuthTarget -= dx * speed;
          this.userPolarTarget = clamp(this.userPolarTarget - dy * speed * 0.8, -0.9, 0.9);
          this.markInteraction();
        }
      } else if (e.pointerType === 'mouse') {
        const ndc = this.toNdc(e.clientX, e.clientY);
        if (!this.options.reducedMotion) {
          this.parallaxTarget.set(ndc.x * 0.05, -ndc.y * 0.03);
        }
        this.callbacks.onPointerMove(ndc);
      }
    });

    const release = (e: PointerEvent) => {
      if (!this.enabled) return;
      const wasPrimary = this.pointers.size === 1 && this.pointers.has(e.pointerId);
      this.pointers.delete(e.pointerId);
      this.element.releasePointerCapture?.(e.pointerId);
      if (wasPrimary && this.pressStart && !this.dragging) {
        this.callbacks.onClick(this.toNdc(e.clientX, e.clientY).clone(), e);
      }
      if (this.pointers.size < 2) this.lastPinchDistance = 0;
      this.pressStart = null;
      this.dragging = false;
    };
    on('pointerup', release);
    on('pointercancel', release);
    on('pointerleave', (e) => {
      if (!this.pointers.has(e.pointerId)) {
        this.parallaxTarget.set(0, 0);
        this.callbacks.onPointerMove(null);
      }
    });

    on(
      'wheel',
      (e) => {
        if (!this.enabled) return;
        e.preventDefault();
        const factor = Math.exp(clamp(e.deltaY, -120, 120) * 0.0012);
        this.userZoomTarget = this.clampZoom(this.userZoomTarget * factor);
        this.markInteraction();
      },
      { passive: false }
    );

    on('contextmenu', (e) => e.preventDefault());
  }

  private pinchDistance(): number {
    const [a, b] = Array.from(this.pointers.values());
    if (!a || !b) return 0;
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  dispose(): void {
    this.travelTween?.cancel();
    this.tweens.clear();
    for (const [type, listener, opts] of this.listeners) {
      this.element.removeEventListener(type, listener, opts);
    }
    this.listeners.length = 0;
  }
}
