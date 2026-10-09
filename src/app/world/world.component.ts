import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  NgZone,
  OnDestroy,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CERTIFICATIONS, EDUCATION, EXPERIENCES, PROFILE, PROJECTS, SKILL_CATEGORIES } from '../data/portfolio.data';
import { SpaceAudio } from './engine/audio';
import { DESTINATION_IDS, DestinationId, ViewId } from './engine/destinations';
import { detectQuality, QualitySettings } from './engine/quality';
import { LabelState, SpaceWorld } from './engine/space-world';
import { LoadingScreenComponent } from './ui/loading-screen.component';
import { LocationPanelComponent, SelectionKind } from './ui/location-panel.component';
import { MinimapComponent } from './ui/minimap.component';
import { QualityPreference, WorldStateService } from './world-state.service';

const TOUR_SEQUENCE: ViewId[] = ['about', 'experience', 'skills', 'projects', 'education', 'contact', 'overview', 'hub'];
const TOUR_DWELL_MS = 9000;

/**
 * Hosts the Three.js universe and the HTML HUD around it. All portfolio text
 * stays in real DOM; the 3D scene is the navigation surface.
 */
@Component({
  selector: 'app-world',
  standalone: true,
  imports: [CommonModule, LoadingScreenComponent, LocationPanelComponent, MinimapComponent],
  templateUrl: './world.component.html',
  styleUrl: './world.component.css',
})
export class WorldComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('labelsLayer', { static: true }) labelsLayer!: ElementRef<HTMLDivElement>;
  @ViewChild(MinimapComponent) minimap?: MinimapComponent;
  @Output() classic = new EventEmitter<void>();
  @Output() fallback = new EventEmitter<string>();

  readonly state = inject(WorldStateService);
  private readonly zone = inject(NgZone);
  readonly profile = PROFILE;

  readonly labelDefs = signal<LabelState[]>([]);
  readonly qualityOptions: Array<{ value: QualityPreference; label: string }> = [
    { value: 'auto', label: 'Auto' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];
  readonly showHint = signal(true);
  readonly isNarrow = signal(window.innerWidth < 900);

  private world: SpaceWorld | null = null;
  private audio = new SpaceAudio();
  private quality!: QualitySettings;
  private labelElements = new Map<string, HTMLElement>();
  private tourTimer: ReturnType<typeof setTimeout> | null = null;
  private tourIndex = 0;
  private hintTimer: ReturnType<typeof setTimeout> | null = null;
  private lastMinimapTime = 0;
  private resizeFrame = 0;
  private destroyed = false;

  private readonly onHashChange = () => {
    const view = this.parseHash();
    if (view && view !== this.state.targetView()) this.travelTo(view, 'hash');
  };
  private readonly onVisibility = () => {
    if (!this.world || !this.state.entered()) return;
    if (document.hidden) this.world.stop();
    else this.zone.runOutsideAngular(() => this.world!.start());
  };

  async ngAfterViewInit(): Promise<void> {
    const preference = this.state.qualityPreference();
    this.quality = detectQuality(preference === 'auto' ? undefined : preference);
    this.state.activeTier.set(this.quality.tier);
    this.state.reducedMotion.set(this.quality.reducedMotion);
    this.state.isTouch.set(this.quality.isTouch);

    try {
      this.zone.runOutsideAngular(() => {
        this.world = new SpaceWorld(this.canvasRef.nativeElement, this.quality, {
          onProgress: (progress, status) =>
            this.zone.run(() => {
              this.state.loadProgress.set(progress);
              this.state.loadStatus.set(status);
            }),
          onHover: (id) =>
            this.zone.run(() => {
              const previous = this.state.hoveredId();
              this.state.hoveredId.set(id);
              if (id && id !== previous) this.audio.playHover();
            }),
          onTravelStart: (view, duration) => this.zone.run(() => this.handleTravelStart(view, duration)),
          onArrive: (view) => this.zone.run(() => this.handleArrive(view)),
          onSubSelect: (kind, index) => this.zone.run(() => this.applySelection(kind as SelectionKind, index, false)),
          onLabels: (labels) => this.renderLabels(labels),
          onUserInteraction: () => this.dismissHint(),
          onContextLost: () => this.zone.run(() => this.handleFailure('The graphics context was lost.')),
        });
      });
      await this.world!.build();
    } catch (error) {
      console.error('Failed to build the universe', error);
      this.handleFailure('The 3D universe could not be started on this device.');
      return;
    }
    if (this.destroyed) return;

    this.labelDefs.set([...this.world!.labelStates]);
    this.state.ready.set(true);
    window.addEventListener('hashchange', this.onHashChange);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stopTour();
    if (this.hintTimer) clearTimeout(this.hintTimer);
    cancelAnimationFrame(this.resizeFrame);
    window.removeEventListener('hashchange', this.onHashChange);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.world?.dispose();
    this.world = null;
    this.audio.dispose();
  }

  // ───────────────────────── lifecycle: entering ─────────────────────────

  async enter(withSound: boolean): Promise<void> {
    if (!this.world || this.state.entered()) return;
    this.state.entered.set(true);
    if (withSound) this.state.setSound(true);
    if (this.state.soundEnabled()) this.audio.enable();

    // The render loop runs outside Angular so per-frame work never triggers change detection.
    this.zone.runOutsideAngular(() => this.world!.start());
    this.state.introPlaying.set(true);
    await this.zone.runOutsideAngular(() => this.world!.playIntro());
    if (this.destroyed) return;
    this.zone.run(() => {
      this.state.introPlaying.set(false);

      const deepLink = this.parseHash();
      if (deepLink && deepLink !== 'hub') {
        this.travelTo(deepLink, 'hash');
      } else {
        this.openPanel();
      }

      // Preload heavy textures once the visitor is inside and the intro is done.
      setTimeout(() => this.world?.preloadAll(), 5000);
      this.hintTimer = setTimeout(() => this.showHint.set(false), 14000);
    });
  }

  switchToClassic(): void {
    this.classic.emit();
  }

  // ───────────────────────── navigation ─────────────────────────

  travelTo(view: ViewId, source: 'user' | 'tour' | 'hash' = 'user'): void {
    if (!this.world) return;
    if (source !== 'tour') this.stopTour();
    this.closePanel();
    this.state.helpOpen.set(false);
    this.audio.playClick();
    this.world.travelTo(view);
  }

  goHome(): void {
    this.travelTo('hub');
  }

  stepDestination(delta: number): void {
    const current = this.state.targetView();
    const index = current === 'overview' ? -1 : DESTINATION_IDS.indexOf(current);
    const next = DESTINATION_IDS[(index + delta + DESTINATION_IDS.length) % DESTINATION_IDS.length];
    this.travelTo(next);
  }

  onLabelClick(label: LabelState, event: Event): void {
    event.stopPropagation();
    if (label.kind === 'destination') {
      if (this.state.currentView() === label.destination && !this.state.travelling()) this.openPanel();
      else this.travelTo(label.destination);
      return;
    }
    const [kind, index] = label.id.split(':');
    const map: Record<string, SelectionKind> = { project: 'project', experience: 'experience', skill: 'skill', archive: 'archive' };
    const selection = map[kind];
    if (selection) this.applySelection(selection, Number(index), true);
  }

  openPanel(): void {
    if (this.state.currentView() === 'overview') return;
    this.state.panelOpen.set(true);
    this.world?.setPanelOpen(true);
  }

  closePanel(): void {
    if (!this.state.panelOpen()) return;
    this.state.panelOpen.set(false);
    this.world?.setPanelOpen(false);
  }

  togglePanel(): void {
    if (this.state.panelOpen()) this.closePanel();
    else this.openPanel();
  }

  onPanelSelect(selection: { kind: SelectionKind; index: number }): void {
    this.applySelection(selection.kind, selection.index, true);
  }

  private applySelection(kind: SelectionKind, index: number, fromUi: boolean): void {
    switch (kind) {
      case 'project':
        this.state.projectIndex.set(index);
        break;
      case 'experience':
        this.state.experienceIndex.set(index);
        break;
      case 'skill':
        this.state.skillCategoryIndex.set(index);
        break;
      case 'archive':
        this.state.archiveIndex.set(index);
        break;
    }
    this.world?.setSelection(kind, index);
    this.audio.playClick();
    if (!fromUi) this.openPanel();
  }

  private stepSelection(delta: number): void {
    const view = this.state.currentView();
    const cycle = (kind: SelectionKind, current: number, length: number) => this.applySelection(kind, (current + delta + length) % length, true);
    switch (view) {
      case 'projects':
        cycle('project', this.state.projectIndex(), PROJECTS.length);
        break;
      case 'experience':
        cycle('experience', this.state.experienceIndex(), EXPERIENCES.length);
        break;
      case 'skills':
        cycle('skill', this.state.skillCategoryIndex(), SKILL_CATEGORIES.length);
        break;
      case 'education':
        cycle('archive', this.state.archiveIndex(), EDUCATION.length + CERTIFICATIONS.length);
        break;
    }
  }

  // ───────────────────────── guided tour ─────────────────────────

  toggleTour(): void {
    if (this.state.tourActive()) this.stopTour();
    else this.startTour();
  }

  startTour(): void {
    if (!this.world) return;
    this.state.tourActive.set(true);
    this.state.helpOpen.set(false);
    this.tourIndex = 0;
    this.travelTo(TOUR_SEQUENCE[0], 'tour');
  }

  stopTour(): void {
    if (this.tourTimer) {
      clearTimeout(this.tourTimer);
      this.tourTimer = null;
    }
    if (this.state.tourActive()) this.state.tourActive.set(false);
  }

  private scheduleTourStep(): void {
    if (!this.state.tourActive()) return;
    if (this.tourTimer) clearTimeout(this.tourTimer);
    this.tourTimer = setTimeout(() => {
      this.tourIndex++;
      if (this.tourIndex >= TOUR_SEQUENCE.length) {
        this.stopTour();
        return;
      }
      this.travelTo(TOUR_SEQUENCE[this.tourIndex], 'tour');
    }, TOUR_DWELL_MS);
  }

  // ───────────────────────── sound / quality / help ─────────────────────────

  toggleSound(): void {
    const enabled = this.audio.toggle();
    this.state.setSound(enabled);
    if (enabled) this.audio.playClick();
  }

  toggleHelp(): void {
    this.state.helpOpen.set(!this.state.helpOpen());
  }

  setQuality(preference: QualityPreference): void {
    this.state.setQualityPreference(preference);
    if (!this.world) return;
    this.quality = detectQuality(preference === 'auto' ? undefined : preference);
    this.state.activeTier.set(this.quality.tier);
    this.world.setQuality(this.quality);
  }

  // ───────────────────────── engine callbacks ─────────────────────────

  private handleTravelStart(view: ViewId, duration: number): void {
    this.state.targetView.set(view);
    this.state.travelling.set(true);
    this.state.travelDuration.set(duration);
    this.state.hoveredId.set(null);
    this.closePanel();
    this.audio.playTravel(duration);
  }

  private handleArrive(view: ViewId): void {
    this.state.currentView.set(view);
    this.state.travelling.set(false);
    this.audio.playArrive();
    this.updateHash(view);
    if (view !== 'overview' && !this.state.introPlaying()) this.openPanel();
    if (this.state.tourActive()) this.scheduleTourStep();
  }

  private handleFailure(reason: string): void {
    this.state.failed.set(true);
    this.fallback.emit(reason);
  }

  private renderLabels(labels: LabelState[]): void {
    if (this.labelElements.size !== labels.length) {
      this.labelElements.clear();
      this.labelsLayer.nativeElement.querySelectorAll<HTMLElement>('[data-label-id]').forEach((el) => {
        this.labelElements.set(el.dataset['labelId']!, el);
      });
      if (this.labelElements.size !== labels.length) return;
    }
    for (const label of labels) {
      const el = this.labelElements.get(label.id);
      if (!el) continue;
      if (!label.visible) {
        if (el.style.opacity !== '0') {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        }
        continue;
      }
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
      el.style.transform = `translate3d(${label.x.toFixed(1)}px, ${label.y.toFixed(1)}px, 0) translate(-50%, -100%) scale(${label.scale.toFixed(3)})`;
      el.classList.toggle('hovered', label.hovered);
    }

    // Minimap at ~30fps is plenty.
    const now = performance.now();
    if (this.minimap && this.world && now - this.lastMinimapTime > 33) {
      this.minimap.draw(this.world.getMinimapState(), (now - this.lastMinimapTime) / 1000);
      this.lastMinimapTime = now;
    }
  }

  private dismissHint(): void {
    if (this.showHint()) this.zone.run(() => this.showHint.set(false));
  }

  // ───────────────────────── hash deep links ─────────────────────────

  private parseHash(): ViewId | null {
    const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (!raw) return null;
    if (raw === 'overview') return 'overview';
    return (DESTINATION_IDS as string[]).includes(raw) ? (raw as DestinationId) : null;
  }

  private updateHash(view: ViewId): void {
    const hash = view === 'hub' ? '' : `#${view}`;
    if (window.location.hash !== hash) history.replaceState(null, '', hash || window.location.pathname + window.location.search);
  }

  // ───────────────────────── window events ─────────────────────────

  @HostListener('window:resize')
  onResize(): void {
    cancelAnimationFrame(this.resizeFrame);
    this.resizeFrame = requestAnimationFrame(() => {
      this.world?.resize();
      this.isNarrow.set(window.innerWidth < 900);
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.state.entered() || !this.world) return;
    const target = event.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const key = event.key;
    if (key >= '1' && key <= '7') {
      this.travelTo(DESTINATION_IDS[Number(key) - 1]);
    } else if (key === 'ArrowRight') {
      this.stepDestination(1);
    } else if (key === 'ArrowLeft') {
      this.stepDestination(-1);
    } else if (key === 'ArrowUp') {
      this.stepSelection(-1);
    } else if (key === 'ArrowDown') {
      this.stepSelection(1);
    } else if (key === 'Escape') {
      if (this.state.helpOpen()) this.state.helpOpen.set(false);
      else if (this.state.tourActive()) this.stopTour();
      else if (this.state.panelOpen()) this.closePanel();
      else if (this.state.targetView() !== 'hub') this.goHome();
    } else if (key === 'h' || key === 'H') {
      this.goHome();
    } else if (key === 'm' || key === 'M') {
      this.travelTo('overview');
    } else if (key === 't' || key === 'T') {
      this.toggleTour();
    } else if (key === 's' || key === 'S') {
      this.toggleSound();
    } else if (key === 'Enter') {
      if (!this.state.panelOpen() && !this.state.travelling()) this.openPanel();
    } else if (key === '?') {
      this.toggleHelp();
    } else if (key === 'c' || key === 'C') {
      this.switchToClassic();
    } else if (key === '+' || key === '=') {
      this.world.zoom(0.85);
    } else if (key === '-' || key === '_') {
      this.world.zoom(1.18);
    } else {
      return;
    }
    event.preventDefault();
  }
}
