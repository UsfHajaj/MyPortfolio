import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollService } from '../../services/scroll.service';
import { PROFILE } from '../../data/portfolio.data';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
})
export class HeroComponent implements OnInit, OnDestroy {
  constructor(private scrollService: ScrollService) {}
  displayedTitle = '';
  profile = PROFILE;

  private titleIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private typingTimer: ReturnType<typeof setTimeout> | null = null;

  titles = PROFILE.rotatingTitles;

  ngOnInit(): void {
    this.startTypingEffect();
  }

  ngOnDestroy(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
  }

  scrollToContact(): void {
    this.scrollService.scrollToSection('contact');
  }

  downloadCV(): void {
    const link = document.createElement('a');
    link.href = PROFILE.cv;
    link.type = 'application/pdf';
    link.download = 'cv.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  startTypingEffect() {
    const currentTitle = this.titles[this.titleIndex];

    if (this.isDeleting) {
      this.charIndex--;
      this.displayedTitle = currentTitle.substring(0, this.charIndex);
    } else {
      this.charIndex++;
      this.displayedTitle = currentTitle.substring(0, this.charIndex);
    }

    let typingSpeed = this.isDeleting ? 50 : 100;

    if (!this.isDeleting && this.charIndex === currentTitle.length) {
      typingSpeed = 2000;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.titleIndex = (this.titleIndex + 1) % this.titles.length;
      typingSpeed = 500;
    }

    this.typingTimer = setTimeout(() => this.startTypingEffect(), typingSpeed);
  }
}
