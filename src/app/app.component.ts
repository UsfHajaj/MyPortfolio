import { Component, OnInit, signal } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';
import { CanvasBackgroundComponent } from './components/canvas-background/canvas-background.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeroComponent } from './components/hero/hero.component';
import { AboutComponent } from './components/about/about.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ContactComponent } from './components/contact/contact.component';
import { LoadingSpinnerComponent } from "./shared/loading-spinner/loading-spinner.component";
import { LoadingService } from './shared/loading.service';

@Component({
  selector: 'app-root',
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
    ContactComponent,
    LoadingSpinnerComponent
],
  templateUrl: "./app.component.html",
})
export class App implements OnInit {
  sidebarExpanded = false;
  isDarkTheme = signal(true);
  currentYear = new Date().getFullYear();
  isLoading = this.loadingService.loading$;
  constructor(private themeService: ThemeService,private loadingService: LoadingService) {}

  ngOnInit(): void {

    this.isDarkTheme.set(true);
    this.isLoading = this.loadingService.loading$;
    this.loadingService.show();
    setTimeout(() => {
      this.loadingService.hide();
    }, 1000); // 4 ثواني مثلًا


    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme.set(isDark);
    });
  }
}