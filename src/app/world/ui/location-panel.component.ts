import { Component, computed, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CERTIFICATIONS,
  EDUCATION,
  EXPERIENCES,
  LANGUAGES,
  PROFILE,
  PROJECT_FILTERS,
  PROJECTS,
  SKILL_CATEGORIES,
} from '../../data/portfolio.data';
import { ViewId } from '../engine/destinations';
import { ContactFormComponent } from '../../shared/contact-form/contact-form.component';
import { WorldStateService } from '../world-state.service';

export type SelectionKind = 'project' | 'experience' | 'skill' | 'archive';

@Component({
  selector: 'app-location-panel',
  standalone: true,
  imports: [CommonModule, ContactFormComponent],
  templateUrl: './location-panel.component.html',
  styleUrl: './location-panel.component.css',
})
export class LocationPanelComponent implements OnInit, OnDestroy {
  readonly state = inject(WorldStateService);
  @Input() view: ViewId = 'hub';
  @Output() travel = new EventEmitter<ViewId>();
  @Output() select = new EventEmitter<{ kind: SelectionKind; index: number }>();
  @Output() tour = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() classic = new EventEmitter<void>();

  readonly profile = PROFILE;
  readonly experiences = EXPERIENCES;
  readonly projects = PROJECTS;
  readonly filters = PROJECT_FILTERS;
  readonly skillCategories = SKILL_CATEGORIES;
  readonly education = EDUCATION;
  readonly certifications = CERTIFICATIONS;
  readonly languages = LANGUAGES;
  readonly socials = PROFILE.socials.filter((s) => s.id === 'github' || s.id === 'linkedin' || s.id === 'facebook');

  readonly projectFilter = signal('all');
  readonly projectImageIndex = signal(0);
  readonly typedTitle = signal('');

  readonly filteredProjects = computed(() => {
    const filter = this.projectFilter();
    return this.projects.map((p, index) => ({ project: p, index })).filter((e) => filter === 'all' || e.project.category === filter);
  });

  readonly activeProject = computed(() => this.projects[this.state.projectIndex()]);
  readonly activeExperience = computed(() => this.experiences[this.state.experienceIndex()]);
  readonly activeCategory = computed(() => this.skillCategories[this.state.skillCategoryIndex()]);
  readonly destination = computed(() => this.state.destinations.find((d) => d.id === this.view) ?? null);

  readonly archiveEntries = [
    ...this.education.map((e) => ({ kind: 'degree' as const, title: e.degree, subtitle: e.institution, period: e.period, details: e.details })),
    ...this.certifications.map((c) => ({ kind: 'cert' as const, title: c.title, subtitle: c.issuer, period: c.year, details: [] as string[] })),
  ];

  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  private titleIndex = 0;
  private charIndex = 0;
  private deleting = false;

  ngOnInit(): void {
    this.typeStep();
  }

  ngOnDestroy(): void {
    if (this.typingTimer) clearTimeout(this.typingTimer);
  }

  categoryLabel(category: string): string {
    return this.filters.find((f) => f.value === category)?.label ?? category;
  }

  projectImages(index: number): string[] {
    const project = this.projects[index];
    return project.images?.length ? project.images : [project.image];
  }

  currentProjectImage(): string {
    const images = this.projectImages(this.state.projectIndex());
    return images[this.projectImageIndex() % images.length] ?? images[0];
  }

  stepProjectImage(delta: number): void {
    const images = this.projectImages(this.state.projectIndex());
    this.projectImageIndex.set((this.projectImageIndex() + delta + images.length) % images.length);
  }

  selectProject(index: number): void {
    this.projectImageIndex.set(0);
    this.select.emit({ kind: 'project', index });
  }

  stepProject(delta: number): void {
    const list = this.filteredProjects();
    const currentPos = list.findIndex((e) => e.index === this.state.projectIndex());
    const nextPos = (currentPos + delta + list.length) % list.length;
    this.selectProject(list[nextPos].index);
  }

  setFilter(value: string): void {
    this.projectFilter.set(value);
    const list = this.filteredProjects();
    if (list.length && !list.some((e) => e.index === this.state.projectIndex())) {
      this.selectProject(list[0].index);
    }
  }

  downloadCv(): void {
    const link = document.createElement('a');
    link.href = PROFILE.cv;
    link.download = 'Yousif-Ibrahim-CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private typeStep(): void {
    const titles = PROFILE.rotatingTitles;
    const current = titles[this.titleIndex];
    this.charIndex += this.deleting ? -1 : 1;
    this.typedTitle.set(current.substring(0, this.charIndex));
    let delay = this.deleting ? 45 : 90;
    if (!this.deleting && this.charIndex === current.length) {
      delay = 2200;
      this.deleting = true;
    } else if (this.deleting && this.charIndex === 0) {
      this.deleting = false;
      this.titleIndex = (this.titleIndex + 1) % titles.length;
      delay = 400;
    }
    this.typingTimer = setTimeout(() => this.typeStep(), delay);
  }
}
