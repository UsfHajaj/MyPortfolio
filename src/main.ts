import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { App } from './app/app.component';

bootstrapApplication(App, {
  providers: [
    provideRouter([]),
    importProvidersFrom(ReactiveFormsModule)
  ]
});