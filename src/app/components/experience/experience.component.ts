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
  templateUrl: "./experience.component.html",
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