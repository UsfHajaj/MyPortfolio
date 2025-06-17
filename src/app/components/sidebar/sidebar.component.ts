import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent],
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent implements OnInit {
  expanded: boolean = false;
  activeSection: string = 'hero';
  @Output() sidebarToggled = new EventEmitter<boolean>();

  navItems = [
  {
    id: 'hero',
    label: 'Home',
    icon: `<i class="fas fa-home h-6 w-6"></i>`
  },
  {
    id: 'about',
    label: 'About',
    icon: `<i class="fas fa-user h-6 w-6"></i>`
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: `<i class="fas fa-briefcase h-6 w-6"></i>`
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: `<i class="fas fa-lightbulb h-6 w-6"></i>`
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: `<i class="fas fa-folder-open h-6 w-6"></i>`
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: `<i class="fas fa-envelope h-6 w-6"></i>`
  }
];


  constructor(private scrollService: ScrollService) {}

  ngOnInit(): void {
    this.scrollService.activeSection$.subscribe(section => {
      this.activeSection = section;
    });
  }

  toggleSidebar(): void {
    this.expanded = !this.expanded;
    this.sidebarToggled.emit(this.expanded);
  }

  navigateTo(sectionId: string): void {
    this.scrollService.scrollToSection(sectionId);
  }
}