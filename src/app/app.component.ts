import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassicPortfolioComponent } from './classic/classic-portfolio.component';
import { WorldComponent } from './world/world.component';
import { isWebGLAvailable } from './world/engine/quality';
import { WorldStateService } from './world/world-state.service';

type Mode = 'world' | 'classic';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ClassicPortfolioComponent, WorldComponent],
  templateUrl: './app.component.html',
})
export class App {
  readonly webglAvailable = isWebGLAvailable();
  readonly mode = signal<Mode>(this.resolveInitialMode());
  readonly notice = signal<string | null>(null);

  enterWorld(): void {
    if (!this.webglAvailable) return;
    this.notice.set(null);
    WorldStateService.writeMode('world');
    this.mode.set('world');
  }

  enterClassic(): void {
    WorldStateService.writeMode('classic');
    this.mode.set('classic');
  }

  /** The universe could not start (no context, shader failure, context loss). */
  onWorldFallback(reason: string): void {
    this.notice.set(`${reason} Showing the classic version instead.`);
    this.mode.set('classic');
  }

  private resolveInitialMode(): Mode {
    if (!this.webglAvailable) return 'classic';
    const params = new URLSearchParams(window.location.search);
    if (params.has('classic')) return 'classic';
    if (params.has('universe')) return 'world';
    return WorldStateService.readMode() ?? 'world';
  }
}
