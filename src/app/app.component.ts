import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from './services/theme.service';
import { CanvasBackgroundComponent } from './components/canvas-background/canvas-background.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeroComponent } from './components/hero/hero.component';
import { AboutComponent } from './components/about/about.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ContactComponent } from './components/contact/contact.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CanvasBackgroundComponent,
    SidebarComponent,
    HeroComponent,
    AboutComponent,
    ExperienceComponent,
    SkillsComponent,
    ProjectsComponent,
    ContactComponent
  ],
  template: `
    <app-canvas-background [isDarkTheme]="isDarkTheme()"></app-canvas-background>
    
    <div class="relative min-h-screen">
      <app-sidebar (sidebarToggled)="sidebarExpanded = $event"></app-sidebar>
      
      <main 
        class="transition-all duration-300"
        [class.main-content-expanded]="sidebarExpanded"
        [class.main-content-collapsed]="!sidebarExpanded"
      >
        <app-hero></app-hero>
        <app-about></app-about>
        <app-experience></app-experience>
        <app-skills></app-skills>
        <app-projects></app-projects>
        <app-contact></app-contact>
        
        <footer class="py-6 px-4 bg-white dark:bg-dark-900 dark:text-white text-center">
          <p>&copy; {{ currentYear }} Yousif Ibrahim. All rights reserved.</p>
        </footer>
      </main>
    </div>
  `
})
export class App implements OnInit {
  sidebarExpanded = false;
  isDarkTheme = signal(true);
  currentYear = new Date().getFullYear();

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme.set(isDark);
    });
  }
}