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
    title: 'Software Engineer',
    company: 'Tameer for Facilities Management',
    period: 'Jan 2026 – Present',
    description: 'Building and operating production systems that digitize resident services, field operations, and internal business processes.',
    achievements: [
      'Developed and launched the company\'s official website, strengthening its digital presence and generating new inbound leads',
      'Built a complaints management system enabling residents of major compounds (Dar Misr, Sakan Misr, Social Housing) to submit and track complaints, cutting resolution time and improving customer satisfaction',
      'Designed and deployed a biometric fingerprint attendance system to track on-site supervisors across project locations, eliminating manual attendance logs and boosting accountability',
      'Led follow-up on ERP implementation across departments, streamlining core business processes and improving reporting accuracy',
      'Built and maintained server and network infrastructure across company branches, driving digital transformation and reducing system downtime'
    ]
  },
  {
    title: 'Full Stack Developer',
    company: 'EXSUS',
    period: 'Jul 2025 – Jan 2026',
    description: 'Delivered full-stack .NET and Angular features across multiple production systems for client organizations.',
    achievements: [
      'Delivered full-stack .NET and Angular features across a Smart Inspection System, a Smart Office Management platform, and a Talent Management System for the Fujairah Environment Authority',
      'Designed clean, layered system architecture for end-to-end features, cutting development time through reusable components',
      'Deployed and maintained web applications in production with high uptime, serving active users across client organizations'
    ]
  },
  {
    title: 'Part-Time Coordinator',
    company: 'Almentor',
    period: 'Jun 2024 – Jun 2025',
    description: 'Coordinated live learning sessions for large audiences, ensuring smooth delivery and effective learning outcomes.',
    achievements: [
      'Coordinated live learning sessions for large audiences, ensuring smooth delivery and effective learning outcomes',
      'Managed session logistics for hundreds of attendees, improving on-time session start rates',
      'Provided direct support to students in each cohort, increasing participation and session engagement'
    ]
  },
  {
    title: 'AI Engineer – Irrigation Scheduling Project',
    company: 'Freelance',
    period: 'Apr 2025 – Mar 2025',
    description: 'Built a machine learning model that predicted soil water needs and supported data-driven irrigation decisions.',
    achievements: [
      'Built a machine learning model that predicted soil water needs with high accuracy, reducing unnecessary water usage',
      'Produced full technical documentation with 4 UML diagram types (Use Case, Sequence, Class, Component) covering all system modules',
      'Delivered a functional solution adopted to support data-driven agricultural decisions in the field'
    ]
  },
  {
    title: 'NLP Engineer',
    company: 'SMSM AI',
    period: 'Mar 2024 – Jun 2024',
    description: 'Led a real-time Egyptian dialect machine translation project from data collection through model delivery.',
    achievements: [
      'Spearheaded a real-time Egyptian dialect machine translation project, achieving strong translation accuracy',
      'Promoted to Team Leader within months, managing a team of engineers',
      'Led data collection efforts, gathering and curating a large volume of samples for model training',
      'Oversaw implementation of machine translation models, improving inference speed and accuracy',
      'Delivered the project on schedule, meeting the defined success metrics'
    ]
  },
  {
    title: 'AI Trainee',
    company: 'Zewail City',
    period: 'Aug 2023 – Jan 2024',
    description: 'Completed hands-on training in AI and machine learning, applied to real-world datasets.',
    achievements: [
      'Completed hands-on training in AI and machine learning fundamentals over several months',
      'Built data science and AI projects analyzing real-world datasets, applying core AI principles to practical problems',
      'Gained proficiency in big data analytics and machine learning through applied exercises and case studies'
    ]
  }
];

}