import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CERTIFICATIONS, EDUCATION, LANGUAGES } from '../../data/portfolio.data';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="education" class="section">
      <div class="max-w-4xl mx-auto">
        <h2 class="section-title">Education &amp; Certifications</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div>
            <h3 class="text-xl font-bold mb-4">Education</h3>
            <div
              *ngFor="let edu of education"
              class="bg-white/20 dark:bg-dark-700/20 p-6 rounded-lg shadow-md hover:bg-white/80 dark:hover:bg-dark-700/80 transition-colors duration-300"
            >
              <h4 class="text-lg font-bold text-primary-500">{{ edu.degree }}</h4>
              <div class="flex flex-col sm:flex-row sm:justify-between mt-1 mb-3">
                <span class="font-medium">{{ edu.institution }}</span>
                <span class="text-sm text-gray-600 dark:text-gray-300">{{ edu.period }}</span>
              </div>
              <ul class="list-disc pl-5 space-y-1">
                <li *ngFor="let d of edu.details">{{ d }}</li>
              </ul>
            </div>

            <h3 class="text-xl font-bold mt-8 mb-4">Languages</h3>
            <ul class="space-y-2">
              <li *ngFor="let lang of languages" class="flex justify-between bg-white/20 dark:bg-dark-700/20 px-4 py-2 rounded-lg">
                <span>{{ lang.name }}</span>
                <span class="text-gray-600 dark:text-gray-300">{{ lang.level }}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-bold mb-4">Certifications</h3>
            <ul class="space-y-3">
              <li
                *ngFor="let cert of certifications"
                class="bg-white/20 dark:bg-dark-700/20 p-4 rounded-lg shadow-md hover:bg-white/80 dark:hover:bg-dark-700/80 transition-colors duration-300"
              >
                <div class="font-semibold">{{ cert.title }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-300">{{ cert.issuer }} · {{ cert.year }}</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class EducationComponent {
  education = EDUCATION;
  certifications = CERTIFICATIONS;
  languages = LANGUAGES;
}
