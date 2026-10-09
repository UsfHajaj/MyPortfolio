export type Easing = (t: number) => number;

export const Ease = {
  linear: (t: number) => t,
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutQuint: (t: number) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2),
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  outExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  // Cinematic: slow departure, fast cruise, soft arrival.
  cinematic: (t: number) => {
    const a = t * t * (3 - 2 * t);
    return a * a * (3 - 2 * a);
  },
};

/** Frame-rate independent exponential smoothing. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Shortest angular difference so azimuth tweens never swing the long way round. */
export function shortestAngle(from: number, to: number): number {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export interface TweenHandle {
  readonly done: boolean;
  cancel(): void;
}

interface ActiveTween {
  elapsed: number;
  duration: number;
  easing: Easing;
  onUpdate: (t: number) => void;
  onComplete?: () => void;
  cancelled: boolean;
  finished: boolean;
}

/** Minimal tween scheduler driven by the render loop. */
export class Tweens {
  private active: ActiveTween[] = [];

  add(duration: number, onUpdate: (t: number) => void, options: { easing?: Easing; onComplete?: () => void } = {}): TweenHandle {
    const tween: ActiveTween = {
      elapsed: 0,
      duration: Math.max(0.0001, duration),
      easing: options.easing ?? Ease.inOutCubic,
      onUpdate,
      onComplete: options.onComplete,
      cancelled: false,
      finished: false,
    };
    this.active.push(tween);
    return {
      get done() {
        return tween.finished || tween.cancelled;
      },
      cancel: () => {
        tween.cancelled = true;
      },
    };
  }

  update(dt: number): void {
    if (!this.active.length) return;
    for (const tween of this.active) {
      if (tween.cancelled) continue;
      tween.elapsed += dt;
      const t = Math.min(1, tween.elapsed / tween.duration);
      tween.onUpdate(tween.easing(t));
      if (t >= 1) {
        tween.finished = true;
        tween.onComplete?.();
      }
    }
    this.active = this.active.filter((t) => !t.finished && !t.cancelled);
  }

  clear(): void {
    this.active.length = 0;
  }
}
