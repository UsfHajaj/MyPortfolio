import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';

const EMAILJS_SERVICE = 'service_x4qodky';
const EMAILJS_TEMPLATE = 'template_vbee7kk';
const EMAILJS_PUBLIC_KEY = 'lFJCFMiksq1VRa-pR';

/**
 * Contact form used by both the classic page and the 3D transmission station.
 * `variant="hud"` switches to the dark glass styling of the universe HUD.
 */
@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-4" [class.cf-hud]="variant === 'hud'" novalidate>
      <div>
        <label [for]="id + '-name'" class="cf-label">Name</label>
        <input
          type="text"
          [id]="id + '-name'"
          formControlName="name"
          autocomplete="name"
          class="cf-input"
          [class.cf-invalid]="name.invalid && (name.dirty || name.touched)"
        />
        <div *ngIf="name.invalid && (name.dirty || name.touched)" class="cf-error">
          <div *ngIf="name.errors?.['required']">Name is required</div>
        </div>
      </div>

      <div>
        <label [for]="id + '-email'" class="cf-label">Email</label>
        <input
          type="email"
          [id]="id + '-email'"
          formControlName="email"
          autocomplete="email"
          class="cf-input"
          [class.cf-invalid]="email.invalid && (email.dirty || email.touched)"
        />
        <div *ngIf="email.invalid && (email.dirty || email.touched)" class="cf-error">
          <div *ngIf="email.errors?.['required']">Email is required</div>
          <div *ngIf="email.errors?.['email']">Please enter a valid email</div>
        </div>
      </div>

      <div>
        <label [for]="id + '-subject'" class="cf-label">Subject</label>
        <input type="text" [id]="id + '-subject'" formControlName="subject" class="cf-input" />
      </div>

      <div>
        <label [for]="id + '-message'" class="cf-label">Message</label>
        <textarea
          [id]="id + '-message'"
          formControlName="message"
          rows="5"
          class="cf-input"
          [class.cf-invalid]="message.invalid && (message.dirty || message.touched)"
        ></textarea>
        <div *ngIf="message.invalid && (message.dirty || message.touched)" class="cf-error">
          <div *ngIf="message.errors?.['required']">Message is required</div>
        </div>
      </div>

      <button type="submit" class="cf-submit" [disabled]="contactForm.invalid || isSubmitting">
        <span *ngIf="!isSubmitting">{{ variant === 'hud' ? 'Transmit message' : 'Send Message' }}</span>
        <span *ngIf="isSubmitting">{{ variant === 'hud' ? 'Transmitting…' : 'Sending...' }}</span>
      </button>

      <div *ngIf="submitSuccess" class="cf-success" role="status">
        Your message has been sent successfully. I'll get back to you soon!
      </div>
      <div *ngIf="submitError" class="cf-failure" role="alert">
        Something went wrong while sending. You can email me directly at
        <a href="mailto:yosefys236@gmail.com">yosefys236&#64;gmail.com</a>.
      </div>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .cf-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.25rem;
      }
      .cf-input {
        width: 100%;
        padding: 0.5rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 0.5rem;
        background: #fff;
        color: inherit;
        transition: box-shadow 0.2s, border-color 0.2s;
      }
      :host-context(.dark) .cf-input {
        background: #1a1a1a;
        border-color: #222;
      }
      .cf-input:focus {
        outline: none;
        border-color: #1a82ff;
        box-shadow: 0 0 0 2px rgba(26, 130, 255, 0.4);
      }
      .cf-invalid {
        border-color: #ef4444 !important;
      }
      .cf-error {
        margin-top: 0.25rem;
        color: #f87171;
        font-size: 0.8125rem;
      }
      .cf-submit {
        width: 100%;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        background: #1a82ff;
        color: #fff;
        font-weight: 500;
        transition: background 0.3s;
      }
      .cf-submit:hover:not(:disabled) {
        background: #0066cc;
      }
      .cf-submit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .cf-success {
        margin-top: 1rem;
        padding: 0.75rem;
        border-radius: 0.5rem;
        background: rgba(34, 197, 94, 0.15);
        color: #86efac;
      }
      .cf-failure {
        margin-top: 1rem;
        padding: 0.75rem;
        border-radius: 0.5rem;
        background: rgba(239, 68, 68, 0.15);
        color: #fca5a5;
      }
      .cf-failure a {
        text-decoration: underline;
      }

      /* HUD variant */
      .cf-hud .cf-label {
        font-family: 'Fira Code', monospace;
        font-size: 0.68rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(190, 205, 235, 0.7);
        margin-bottom: 0.4rem;
      }
      .cf-hud .cf-input {
        background: rgba(8, 14, 32, 0.6);
        border: 1px solid rgba(120, 150, 220, 0.22);
        color: #e8eefc;
        border-radius: 0.6rem;
        font-size: 0.92rem;
      }
      .cf-hud .cf-input:focus {
        border-color: rgba(96, 165, 250, 0.9);
        box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.18), 0 0 24px rgba(79, 140, 255, 0.12);
      }
      .cf-hud .cf-submit {
        background: linear-gradient(135deg, #3d7bff, #7a5cff);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-size: 0.78rem;
        font-weight: 600;
        border-radius: 0.6rem;
        box-shadow: 0 10px 30px -10px rgba(79, 140, 255, 0.55);
      }
      .cf-hud .cf-submit:hover:not(:disabled) {
        background: linear-gradient(135deg, #4d88ff, #8a6cff);
      }
    `,
  ],
})
export class ContactFormComponent {
  @Input() variant: 'classic' | 'hud' = 'classic';
  @Input() id = 'contact';

  isSubmitting = false;
  submitSuccess = false;
  submitError = false;

  contactForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    subject: new FormControl(''),
    message: new FormControl('', [Validators.required]),
  });

  get name() {
    return this.contactForm.get('name')!;
  }
  get email() {
    return this.contactForm.get('email')!;
  }
  get subject() {
    return this.contactForm.get('subject')!;
  }
  get message() {
    return this.contactForm.get('message')!;
  }

  onSubmit() {
    if (this.contactForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    emailjs
      .send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        {
          name: this.name.value,
          email: this.email.value,
          title: this.subject.value,
          message: this.message.value,
          from: this.email.value,
        },
        EMAILJS_PUBLIC_KEY
      )
      .then((result: EmailJSResponseStatus) => {
        console.log('SUCCESS!', result.status, result.text);
        this.submitSuccess = true;
        this.contactForm.reset();
        setTimeout(() => (this.submitSuccess = false), 6000);
      })
      .catch((error: unknown) => {
        console.error('FAILED...', error);
        this.submitError = true;
      })
      .finally(() => {
        this.isSubmitting = false;
      });
  }
}
