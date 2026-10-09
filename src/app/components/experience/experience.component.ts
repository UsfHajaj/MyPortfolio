import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EXPERIENCES, Experience } from '../../data/portfolio.data';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience.component.html',
})
export class ExperienceComponent {
  experiences: Experience[] = EXPERIENCES;
}
