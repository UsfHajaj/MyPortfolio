import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Project {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  demoLink: string;
  codeLink: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="projects" class="section">
      <div class="max-w-6xl mx-auto">
        <h2 class="section-title">Projects</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          <div *ngFor="let project of projects" class="project-card overflow-hidden">
            <div class="h-48 overflow-hidden relative">
              <img 
                [src]="project.image" 
                [alt]="project.title" 
                class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent opacity-60"></div>
            </div>
            
            <div class="p-6">
              <h3 class="text-xl font-bold mb-2">{{ project.title }}</h3>
              <p class="text-gray-600 dark:text-gray-300 mb-4">{{ project.description }}</p>
              
              <div class="flex flex-wrap gap-2 mb-6">
                <span 
                  *ngFor="let tech of project.technologies" 
                  class="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100"
                >
                  {{ tech }}
                </span>
              </div>
              
              <div class="flex space-x-4">
                <a 
                  [href]="project.demoLink" 
                  target="_blank" 
                  class="text-primary-500 hover:text-primary-600 transition flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Demo
                </a>
                
                <a 
                  [href]="project.codeLink" 
                  target="_blank" 
                  class="text-primary-500 hover:text-primary-600 transition flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Code
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ProjectsComponent {
  projects: Project[] = [
    {
      title: 'E-Commerce Platform',
      description: 'A full-featured e-commerce platform with product catalog, cart, and checkout functionality.',
      image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      technologies: ['Angular', 'Node.js', 'Express', 'MongoDB'],
      demoLink: 'https://example.com/demo1',
      codeLink: 'https://github.com/username/project1'
    },
    {
      title: 'Task Management App',
      description: 'A Kanban-style task management application with drag-and-drop functionality.',
      image: 'https://images.pexels.com/photos/3243/pen-calendar-to-do-checklist.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      technologies: ['Angular', 'TypeScript', 'Firebase'],
      demoLink: 'https://example.com/demo2',
      codeLink: 'https://github.com/username/project2'
    },
    {
      title: 'Weather Dashboard',
      description: 'A weather forecast application with real-time updates and location-based services.',
      image: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      technologies: ['Angular', 'TypeScript', 'Weather API'],
      demoLink: 'https://example.com/demo3',
      codeLink: 'https://github.com/username/project3'
    },
    {
      title: 'Fitness Tracker',
      description: 'An application to track workouts, set goals, and monitor progress over time.',
      image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      technologies: ['Angular', 'TypeScript', 'Chart.js', 'Firebase'],
      demoLink: 'https://example.com/demo4',
      codeLink: 'https://github.com/username/project4'
    },
    {
      title: 'Recipe Finder',
      description: 'A recipe search engine with filtering options and personalized recommendations.',
      image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      technologies: ['Angular', 'TypeScript', 'Food API'],
      demoLink: 'https://example.com/demo5',
      codeLink: 'https://github.com/username/project5'
    },
    {
      title: 'Budget Tracker',
      description: 'A personal finance application to track income, expenses, and savings goals.',
      image: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      technologies: ['Angular', 'TypeScript', 'Chart.js', 'LocalStorage'],
      demoLink: 'https://example.com/demo6',
      codeLink: 'https://github.com/username/project6'
    }
  ];
}