import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
  achievements: string[];
}

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="experience" class="section">
      <div class="max-w-4xl mx-auto">
        <h2 class="section-title">Experience</h2>
        
        <div class="timeline-container mt-12">
          <div *ngFor="let exp of experiences" class="timeline-item">
            <div class="bg-white dark:bg-dark-700 p-6 rounded-lg shadow-md ml-8">
              <h3 class="text-xl font-bold text-primary-500">{{ exp.title }}</h3>
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-1 mb-4">
                <span class="font-medium">{{ exp.company }}</span>
                <span class="text-sm text-gray-600 dark:text-gray-300">{{ exp.period }}</span>
              </div>
              
              <p class="mb-4">{{ exp.description }}</p>
              
              <ul class="list-disc pl-5 space-y-1">
                <li *ngFor="let achievement of exp.achievements">{{ achievement }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ExperienceComponent {
  experiences: Experience[] = [
  {
    title: 'Part-Time Coordinator',
    company: 'Almentor',
    period: 'Jun 2024 – Present',
    description: 'Coordinating and supporting educational sessions to ensure smooth delivery and learner engagement.',
    achievements: [
      'Assisted in organizing and facilitating live sessions with instructors',
      'Managed attendee logistics to enhance engagement and clarity',
      'Provided real-time support to students, ensuring their needs were met during sessions'
    ]
  },
  {
    title: 'AI Engineer – Irrigation Scheduling Project',
    company: 'Freelance',
    period: 'Apr 2025 – Mar 2025',
    description: 'Developed a smart solution for optimizing irrigation using machine learning.',
    achievements: [
      'Built a predictive model to estimate soil water requirements',
      'Created full technical documentation including UML diagrams (Use Case, Sequence, Class, Component)',
      'Delivered an end-to-end solution supporting data-driven agricultural decisions'
    ]
  },
  {
    title: 'NLP Engineer',
    company: 'SMSM AI',
    period: 'Mar 2024 – Jun 2024',
    description: 'Led an NLP project for real-time translation from Egyptian dialect to English.',
    achievements: [
      'Promoted to Team Leader and led a group of NLP engineers',
      'Collected and curated Egyptian dialect data from podcasts, tweets, and other sources',
      'Managed and implemented machine translation models for dialectal Arabic'
    ]
  },
  {
    title: 'AI Trainee',
    company: 'Zewail City',
    period: 'Aug 2023 – Jan 2024',
    description: 'Hands-on training in AI and machine learning with practical applications.',
    achievements: [
      'Acquired foundational knowledge in data science, AI, and machine learning',
      'Worked on analyzing real-world data to build AI-driven insights',
      'Developed skills in big data analytics, deep learning, and applied ML techniques'
    ]
  }
];

}