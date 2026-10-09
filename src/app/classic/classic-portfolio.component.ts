import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service';
import { LoadingService } from '../shared/loading.service';
import { CanvasBackgroundComponent } from '../components/canvas-background/canvas-background.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { HeroComponent } from '../components/hero/hero.component';
import { AboutComponent } from '../components/about/about.component';
import { ExperienceComponent } from '../components/experience/experience.component';
import { SkillsComponent } from '../components/skills/skills.component';
import { ProjectsComponent } from '../components/projects/projects.component';
import { EducationComponent } from '../components/education/education.component';
import { ContactComponent } from '../components/contact/contact.component';
import { LoadingSpinnerComponent } from '../shared/loading-spinner/loading-spinner.component';

/**
 * The accessible, scroll-based version of the portfolio. Used as the fallback
 * when WebGL is unavailable and as an opt-in for visitors who prefer a page.
 */
@Component({
  selector: 'app-classic-portfolio',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    CanvasBackgroundComponent,
    SidebarComponent,
    HeroComponent,
    AboutComponent,
    ExperienceComponent,
    SkillsComponent,
    ProjectsComponent,
    EducationComponent,
    ContactComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <app-loading-spinner *ngIf="isLoading | async"></app-loading-spinner>
    <app-canvas-background [isDarkTheme]="isDarkTheme()"></app-canvas-background>

    <div class="classic-view relative z-[1] min-h-screen">
      <app-sidebar (sidebarToggled)="sidebarExpanded = $event"></app-sidebar>

      <main class="transition-all duration-300" [class.main-content-expanded]="sidebarExpanded" [class.main-content-collapsed]="!sidebarExpanded">
        <div *ngIf="notice" class="mx-4 mt-4 rounded-lg border border-primary-500/40 bg-primary-500/10 px-4 py-3 text-sm">
          {{ notice }}
        </div>

        <app-hero></app-hero>
        <app-about></app-about>
        <app-experience></app-experience>
        <app-skills></app-skills>
        <app-projects></app-projects>
        <app-education></app-education>
        <app-contact></app-contact>

        <footer class="py-6 px-4 bg-white/30 dark:bg-dark-900/30 dark:text-white text-center">
          <p>&copy; {{ currentYear }} Yousif Ibrahim. All rights reserved.</p>
        </footer>
      </main>

      <button
        *ngIf="universeAvailable"
        type="button"
        (click)="enterUniverse.emit()"
        class="enter-universe fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg"
        aria-label="Enter the interactive 3D universe"
      >
        <i class="fa-solid fa-rocket" aria-hidden="true"></i>
        Enter the 3D universe
      </button>
    </div>
  `,
  styles: [
    `
      .enter-universe {
        background: linear-gradient(135deg, #3d7bff, #7a5cff);
        box-shadow: 0 16px 40px -14px rgba(79, 140, 255, 0.8);
        letter-spacing: 0.04em;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .enter-universe:hover {
        transform: translateY(-2px);
        box-shadow: 0 20px 50px -14px rgba(79, 140, 255, 0.95);
      }
    `,
  ],
})
export class ClassicPortfolioComponent implements OnInit, OnDestroy {
  @Input() universeAvailable = true;
  @Input() notice: string | null = null;
  @Output() enterUniverse = new EventEmitter<void>();

  private readonly themeService = inject(ThemeService);
  private readonly loadingService = inject(LoadingService);

  sidebarExpanded = false;
  isDarkTheme = signal(true);
  currentYear = new Date().getFullYear();
  isLoading = this.loadingService.loading$;
  private loadingTimer: ReturnType<typeof setTimeout> | null = null;
  private themeSubscription = this.themeService.isDarkTheme$.subscribe((isDark) => this.isDarkTheme.set(isDark));

  ngOnInit(): void {
    this.loadingService.show();
    this.loadingTimer = setTimeout(() => this.loadingService.hide(), 800);
  }

  ngOnDestroy(): void {
    if (this.loadingTimer) clearTimeout(this.loadingTimer);
    this.loadingService.hide();
    this.themeSubscription.unsubscribe();
  }
}
