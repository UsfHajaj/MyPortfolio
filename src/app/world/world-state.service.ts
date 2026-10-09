import { computed, Injectable, signal } from '@angular/core';
import { DESTINATIONS, DestinationDef, DestinationId, ViewId } from './engine/destinations';
import { QualityTier } from './engine/quality';

export type QualityPreference = 'auto' | QualityTier;

const STORAGE_KEYS = {
  sound: 'portfolio.sound',
  quality: 'portfolio.quality',
  mode: 'portfolio.mode',
  visited: 'portfolio.visited',
};

/**
 * Reactive UI state for the universe. The engine pushes into these signals and
 * the HUD components read from them; nothing here touches Three.js directly.
 */
@Injectable({ providedIn: 'root' })
export class WorldStateService {
  readonly destinations: DestinationDef[] = DESTINATIONS;

  // Loading
  readonly loadProgress = signal(0);
  readonly loadStatus = signal('Initialising');
  readonly ready = signal(false);
  readonly entered = signal(false);
  readonly failed = signal(false);

  // Navigation
  readonly currentView = signal<ViewId>('hub');
  readonly targetView = signal<ViewId>('hub');
  readonly travelling = signal(false);
  readonly travelDuration = signal(0);
  readonly hoveredId = signal<string | null>(null);
  readonly panelOpen = signal(false);
  readonly helpOpen = signal(false);
  readonly tourActive = signal(false);
  readonly introPlaying = signal(false);

  // Selections inside locations
  readonly projectIndex = signal(0);
  readonly experienceIndex = signal(0);
  readonly skillCategoryIndex = signal(0);
  readonly archiveIndex = signal(0);

  // Preferences
  readonly soundEnabled = signal(readBoolean(STORAGE_KEYS.sound, false));
  readonly qualityPreference = signal<QualityPreference>((localStorage.getItem(STORAGE_KEYS.quality) as QualityPreference) || 'auto');
  readonly activeTier = signal<QualityTier>('high');
  readonly reducedMotion = signal(false);
  readonly isTouch = signal(false);

  readonly currentDestination = computed<DestinationDef | null>(() => {
    const view = this.currentView();
    return view === 'overview' ? null : (this.destinations.find((d) => d.id === view) ?? null);
  });

  readonly targetDestination = computed<DestinationDef | null>(() => {
    const view = this.targetView();
    return view === 'overview' ? null : (this.destinations.find((d) => d.id === view) ?? null);
  });

  readonly hoveredDestination = computed<DestinationDef | null>(() => {
    const id = this.hoveredId();
    if (!id?.startsWith('destination:')) return null;
    const destinationId = id.slice('destination:'.length) as DestinationId;
    return this.destinations.find((d) => d.id === destinationId) ?? null;
  });

  readonly atHub = computed(() => this.currentView() === 'hub' && !this.travelling());

  setSound(enabled: boolean): void {
    this.soundEnabled.set(enabled);
    localStorage.setItem(STORAGE_KEYS.sound, String(enabled));
  }

  setQualityPreference(preference: QualityPreference): void {
    this.qualityPreference.set(preference);
    localStorage.setItem(STORAGE_KEYS.quality, preference);
  }

  static readMode(): 'world' | 'classic' | null {
    const value = localStorage.getItem(STORAGE_KEYS.mode);
    return value === 'world' || value === 'classic' ? value : null;
  }

  static writeMode(mode: 'world' | 'classic'): void {
    localStorage.setItem(STORAGE_KEYS.mode, mode);
  }
}

function readBoolean(key: string, fallback: boolean): boolean {
  const value = localStorage.getItem(key);
  if (value === null) return fallback;
  return value === 'true';
}
