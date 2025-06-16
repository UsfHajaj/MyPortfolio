import { Component } from "@angular/core";

@Component({
  selector: "app-about",
  standalone: true,
  template: `
    <section id="about" class="section">
      <div class="max-w-4xl mx-auto">
        <h2 class="section-title">About Me</h2>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-8 mt-12">
          <div class="md:col-span-3">
            <p class="text-lg mb-4">
              I'm a passionate Full Stack Developer specialized in building
              scalable and high-performance web applications using ASP.NET Core,
              C#, Angular, and SQL Server. I combine strong back-end logic with
              modern front-end frameworks to deliver clean, user-friendly, and
              maintainable solutions.
            </p>

            <p class="text-lg mb-4">
              Alongside my full stack work, I’m also an AI Engineer with
              hands-on experience in machine learning, natural language
              processing (NLP), and building intelligent systems that solve
              real-world problems.
            </p>

            <p class="text-lg mb-8">
              Driven by continuous learning and improvement, I thrive on turning
              complex challenges into simple, effective solutions. Whether it’s
              developing robust APIs, designing responsive UIs, or training ML
              models, I always aim for code quality and business impact.
            </p>

            <div class="flex flex-wrap gap-4">
              <div class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-primary-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>1+ Years Experience</span>
              </div>

              <div class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-primary-500 mr-2"
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
                <span>+201127609258</span>
              </div>

              <div class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-primary-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>6th of October</span>
              </div>
            </div>
          </div>

          <div class="md:col-span-2 flex justify-center md:justify-end">
            <div
              class="w-64 h-64 rounded-full overflow-hidden bg-gradient-to-r from-white to-white p-1"
            >
              <div
                class="w-full h-full bg-dark-800 rounded-full flex items-center justify-center text-xl font-bold text-white"
              >
                <img
                  src="assets/WhatsApp Image 2025-01-01 at 23.18.24_05ff127b.jpg"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AboutComponent {}
