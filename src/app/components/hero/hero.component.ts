import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ScrollService } from "../../services/scroll.service";

@Component({
  selector: "app-hero",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="hero" class="section flex items-center">
      <div class="w-full max-w-4xl mx-auto">
        <div class="code-card">
          <div class="code-card-content">
            <div class="code-line">
              <span class="text-gray-400">// Hello, world!</span>
            </div>
            <div class="code-line mt-4">
              <span class="text-primary-400">const</span>
              <span class="text-white"> developer </span>
              <span class="text-primary-500">=</span>
              <span class="text-white"> {{ "{" }}</span>
            </div>
            <div class="code-line pl-8">
              <span class="text-primary-300">name:</span>
              <span class="text-accent-400"> 'Yousif Ibrahim'</span
              ><span class="text-white">,</span>
            </div>
            <div class="code-line pl-8">
              <span class="text-primary-300">title:</span>
              <span class="text-accent-400">
                'Full Stack Developer | AI Engineer'</span
              ><span class="text-white">,</span>
            </div>
            <div class="code-line pl-8">
              <span class="text-primary-300">skills:</span>
              <span class="text-white"> [</span>
              <span class="text-accent-400">'ASP.NET Core'</span
              ><span class="text-white">,</span>
              <span class="text-accent-400">'C#'</span
              ><span class="text-white">,</span>
              <span class="text-accent-400">'Angular'</span
              ><span class="text-white">,</span>
              <span class="text-accent-400"> 'TypeScript'</span
              ><span class="text-white">,</span>
              <span class="text-accent-400"> 'Python'</span
              ><span class="text-white">,</span>
              <span class="text-accent-400"> 'AI'</span
              ><span class="text-white">,</span>
              <span class="text-accent-400"> 'NLP'</span>
              <span class="text-white">],</span>
            </div>
            <div class="code-line pl-8">
              <span class="text-primary-300">available:</span>
              <span class="text-green-400"> true</span>
            </div>
            <div class="code-line">
              <span class="text-white">{{ "}" }};</span>
            </div>
            <div class="code-line mt-4">
              <span class="text-gray-400">// Let's connect!</span>
            </div>
          </div>
        </div>

        <div class="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            (click)="scrollToContact()"
            class="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            Contact Me
          </button>
          <button (click)="downloadCV()" class="px-6 py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-dark-500 flex items-center justify-center">
            <i class="fas fa-download px-2"></i>
            Download CV
          </button>
        </div>
      </div>
    </section>
    
  `,
})
export class HeroComponent implements OnInit {
  constructor(private scrollService: ScrollService) {}

  ngOnInit(): void {}

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
}
