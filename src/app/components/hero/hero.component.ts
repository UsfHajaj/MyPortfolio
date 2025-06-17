import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ScrollService } from "../../services/scroll.service";

@Component({
  selector: "app-hero",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./hero.component.html",
})
export class HeroComponent implements OnInit {
  constructor(private scrollService: ScrollService) { }
  displayedTitle = '';

  private titleIndex = 0;
  private charIndex = 0;
  private isDeleting = false;

  titles  = [
    'Full Stack Developer',
    '.NET Developer',
    'Software Engineer',
    'AI Engineer',
    'NLP Specialist',
    'Data Scientist',
    'Machine Learning Engineer',
];
  ngOnInit(): void {
    this.startTypingEffect();
  }

  scrollToContact(): void {
    this.scrollService.scrollToSection("contact");
  }

  downloadCV(): void {
    const cvUrl = "assets/cv.pdf"// Update with your CV path
    const link = document.createElement("a");
    link.href = cvUrl;
    link.type = "application/pdf";
    link.download = "cv.pdf"; // Name of the downloaded file
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
      typingSpeed = 2000; // وقت الثبات قبل المسح
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.titleIndex = (this.titleIndex + 1) % this.titles.length;
      typingSpeed = 500;
    }

    setTimeout(() => this.startTypingEffect(), typingSpeed);
  }
}
