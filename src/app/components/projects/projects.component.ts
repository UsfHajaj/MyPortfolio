import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PROJECTS, PROJECT_FILTERS, Project } from '../../data/portfolio.data';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent {
  currentPage = 1;
  projectsPerPage = 6;
  activeFilter = 'all';

  filters = PROJECT_FILTERS;

  imageIndex: Record<string, number> = {};

  projects: Project[] = PROJECTS;

  getImages(project: Project): string[] {
    return project.images?.length ? project.images : [project.image];
  }

  getCurrentImage(project: Project): string {
    const images = this.getImages(project);
    const index = this.imageIndex[project.title] ?? 0;
    return images[index] ?? images[0];
  }

  showPreviousImage(project: Project, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const images = this.getImages(project);
    const current = this.imageIndex[project.title] ?? 0;
    this.imageIndex[project.title] = (current - 1 + images.length) % images.length;
  }

  getDotClass(project: Project, index: number): string {
    return (this.imageIndex[project.title] ?? 0) === index ? 'bg-white' : 'bg-white/40';
  }

  showNextImage(project: Project, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const images = this.getImages(project);
    const current = this.imageIndex[project.title] ?? 0;
    this.imageIndex[project.title] = (current + 1) % images.length;
  }

  // Get filtered projects based on active filter
  getFilteredProjects(): Project[] {
    if (this.activeFilter === 'all') {
      return this.projects;
    }
    return this.projects.filter((project) => project.category === this.activeFilter);
  }

  // Get projects for current page
  getCurrentPageProjects(): Project[] {
    const filteredProjects = this.getFilteredProjects();
    const startIndex = (this.currentPage - 1) * this.projectsPerPage;
    const endIndex = startIndex + this.projectsPerPage;
    return filteredProjects.slice(startIndex, endIndex);
  }

  // Get total pages
  getTotalPages(): number {
    return Math.ceil(this.getFilteredProjects().length / this.projectsPerPage);
  }

  // Get page numbers array
  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Set active filter
  setActiveFilter(filter: string): void {
    this.activeFilter = filter;
    this.currentPage = 1; // Reset to first page when filter changes
  }

  // Navigation methods
  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  // CSS class methods
  getFilterButtonClass(filter: string): string {
    return this.activeFilter === filter
      ? 'bg-primary-500 text-white shadow-md ring-2 ring-primary-300 dark:ring-primary-600'
      : 'bg-white/30 dark:bg-gray-800/30 hover:bg-white/80 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-300  hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-200';
  }

  getPageButtonClass(page: number): string {
    return this.currentPage === page
      ? 'bg-primary-500 text-white shadow-md ring-2 ring-primary-300 dark:ring-primary-600'
      : 'bg-white/30 dark:bg-gray-800/30 hover:bg-white/80 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-300  hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-200';
  }

  // Add Math to component for template usage
  Math = Math;
}
