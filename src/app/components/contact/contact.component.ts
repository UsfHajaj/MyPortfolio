import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactFormComponent } from '../../shared/contact-form/contact-form.component';
import { PROFILE } from '../../data/portfolio.data';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ContactFormComponent],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  profile = PROFILE;
  socials = PROFILE.socials.filter((s) => s.id === 'github' || s.id === 'linkedin' || s.id === 'facebook');
}
