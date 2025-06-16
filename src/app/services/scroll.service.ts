import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private activeSection = new BehaviorSubject<string>('hero');
  activeSection$ = this.activeSection.asObservable();

  constructor() {
    // Listen for scroll events to update active section
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  onScroll(): void {
    const sections = document.querySelectorAll('.section');
    const scrollPosition = window.scrollY + 100; // Offset for better detection

    sections.forEach((section) => {
      const element = section as HTMLElement;
      const sectionTop = element.offsetTop;
      const sectionHeight = element.offsetHeight;
      const sectionId = element.id;

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        this.activeSection.next(sectionId);
      }
    });
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.activeSection.next(sectionId);
    }
  }
}