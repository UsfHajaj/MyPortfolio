import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-contact",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section id="contact" class="section">
      <div class="max-w-4xl mx-auto">
        <h2 class="section-title">Contact Me</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
          <div>
            <p class="text-lg mb-6">
              I'm always open to discussing new projects, opportunities, or
              partnerships. Feel free to reach out!
            </p>

            <div class="space-y-4">
              <div class="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-primary-500 mr-3 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <h3 class="font-bold">Email</h3>
                  <a
                    href="mailto:yosefys236&#64;gmail.com"
                    class="text-primary-500 hover:text-primary-600 transition"
                    >yosefys236&#64;gmail.com</a
                  >
                </div>
              </div>

              <div class="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-primary-500 mr-3 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div>
                  <h3 class="font-bold">Phone</h3>
                  <a
                    href="tel:+201127609258"
                    class="text-primary-500 hover:text-primary-600 transition"
                    >+201127609258</a
                  >
                </div>
              </div>

              <div class="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-primary-500 mr-3 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <h3 class="font-bold">Location</h3>
                  <p>6th of October,Giza</p>
                </div>
              </div>
            </div>

            <div class="mt-8">
              <h3 class="font-bold mb-4">Connect with me</h3>
              <div class="flex space-x-4">
                <a
                  href="https://github.com/UsfHajaj"
                  target="_blank"
                  class="text-dark-800 dark:text-white hover:text-primary-500 dark:hover:text-primary-500 transition text-2xl"
                >
                  <i class="fab fa-github"></i>
                </a>
                <a
                  href="https://www.linkedin.com/in/yousif-ibrahim-8103b91b6/"
                  target="_blank"
                  class="text-dark-800 dark:text-white hover:text-primary-500 dark:hover:text-primary-500 transition text-2xl"
                >
                  <i class="fab fa-linkedin"></i>
                </a>
                <a
                  href="https://www.facebook.com/yosef.hgag.3"
                  target="_blank"
                  class="text-dark-800 dark:text-white hover:text-primary-500 dark:hover:text-primary-500 transition text-2xl"
                >
                  <i class="fab fa-facebook"></i>
                </a>
              </div>
            </div>
          </div>

          <div>
            <form
              [formGroup]="contactForm"
              (ngSubmit)="onSubmit()"
              class="space-y-4"
            >
              <div>
                <label for="name" class="block text-sm font-medium mb-1"
                  >Name</label
                >
                <input
                  type="text"
                  id="name"
                  formControlName="name"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white dark:bg-dark-700 border-gray-300 dark:border-dark-600"
                  [class.border-red-500]="
                    name.invalid && (name.dirty || name.touched)
                  "
                />
                <div
                  *ngIf="name.invalid && (name.dirty || name.touched)"
                  class="mt-1 text-red-500 text-sm"
                >
                  <div *ngIf="name.errors?.['required']">Name is required</div>
                </div>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium mb-1"
                  >Email</label
                >
                <input
                  type="email"
                  id="email"
                  formControlName="email"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white dark:bg-dark-700 border-gray-300 dark:border-dark-600"
                  [class.border-red-500]="
                    email.invalid && (email.dirty || email.touched)
                  "
                />
                <div
                  *ngIf="email.invalid && (email.dirty || email.touched)"
                  class="mt-1 text-red-500 text-sm"
                >
                  <div *ngIf="email.errors?.['required']">
                    Email is required
                  </div>
                  <div *ngIf="email.errors?.['email']">
                    Please enter a valid email
                  </div>
                </div>
              </div>

              <div>
                <label for="subject" class="block text-sm font-medium mb-1"
                  >Subject</label
                >
                <input
                  type="text"
                  id="subject"
                  formControlName="subject"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white dark:bg-dark-700 border-gray-300 dark:border-dark-600"
                />
              </div>

              <div>
                <label for="message" class="block text-sm font-medium mb-1"
                  >Message</label
                >
                <textarea
                  id="message"
                  formControlName="message"
                  rows="5"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-white dark:bg-dark-700 border-gray-300 dark:border-dark-600"
                  [class.border-red-500]="
                    message.invalid && (message.dirty || message.touched)
                  "
                ></textarea>
                <div
                  *ngIf="message.invalid && (message.dirty || message.touched)"
                  class="mt-1 text-red-500 text-sm"
                >
                  <div *ngIf="message.errors?.['required']">
                    Message is required
                  </div>
                </div>
              </div>

              <button
                type="submit"
                class="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-300 w-full"
                [disabled]="contactForm.invalid || isSubmitting"
              >
                <span *ngIf="!isSubmitting">Send Message</span>
                <span *ngIf="isSubmitting">Sending...</span>
              </button>

              <div
                *ngIf="submitSuccess"
                class="mt-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-lg"
              >
                Your message has been sent successfully. I'll get back to you
                soon!
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent {
  isSubmitting = false;
  submitSuccess = false;

  contactForm = new FormGroup({
    name: new FormControl("", [Validators.required]),
    email: new FormControl("", [Validators.required, Validators.email]),
    subject: new FormControl(""),
    message: new FormControl("", [Validators.required]),
  });

  get name() {
    return this.contactForm.get("name")!;
  }
  get email() {
    return this.contactForm.get("email")!;
  }
  get subject() {
    return this.contactForm.get("subject")!;
  }
  get message() {
    return this.contactForm.get("message")!;
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.contactForm.reset();

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    }, 1500);
  }
}
