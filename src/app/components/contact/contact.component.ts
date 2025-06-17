import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { EmailJSResponseStatus } from "emailjs-com";
import emailjs from "emailjs-com";

@Component({
  selector: "app-contact",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./contact.component.html",
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

    emailjs
      .send(
        "service_x4qodky", // من EmailJS dashboard
        "template_vbee7kk", // من EmailJS dashboard
        {
          name: this.name.value,
          email: this.email.value,
          title: this.subject.value,
          message: this.message.value,
          from: this.email.value,
        },
        "lFJCFMiksq1VRa-pR" // public key
      ).then((result: EmailJSResponseStatus) => {
    console.log('SUCCESS!', result.status, result.text);
    this.submitSuccess = true;
      })
    .catch((error: any) => {
    console.error('FAILED...', error);
    alert('Something went wrong!');
  }).finally(() => {
    this.isSubmitting = false;
    this.contactForm.reset();
    setTimeout(() => {
      this.submitSuccess = false;
    }, 5000);
  });
      
  }
}
