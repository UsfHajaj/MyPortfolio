import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

interface Skill {
  name: string;
  level: number;
  icon?: string;
}

interface SkillCategory {
  name: string;
  skills: Skill[];
  color: string;
  bgColor: string;
  icon: string;
}

@Component({
  selector: "app-skills",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="skills" class="section py-20">
      <div class="max-w-7xl mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Technical Skills
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A comprehensive overview of my technical expertise across different
            domains
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          <div
            *ngFor="let category of skillCategories"
            class="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02]"
            [class]="category.bgColor"
          >
            <!-- Floating decorative elements -->
            <div class="absolute inset-0 overflow-hidden">
              <div
                class="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-sm"
              ></div>
              <div
                class="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-sm"
              ></div>
              <div
                class="absolute top-1/2 right-0 w-16 h-16 bg-white/5 rounded-full blur-lg"
              ></div>
            </div>

            <!-- Header -->
            <div class="relative p-8 border-b border-white/10">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div
                    class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg backdrop-blur-sm"
                    [class]="'bg-white/20 border border-white/30'"
                  >
                    {{ category.icon }}
                  </div>
                  <div>
                    <h3 class="text-2xl font-bold dark:text-white mb-1">
                      {{ category.name }}
                    </h3>
                    <p class="dark:text-white/70 text-sm font-medium">
                      {{ category.skills.length }} Technologies
                    </p>
                  </div>
                </div>
                <div
                  class="text-white/50 text-3xl transform rotate-12 group-hover:rotate-0 transition-transform duration-300"
                >
                  ✨
                </div>
              </div>
            </div>

            <!-- Skills Grid -->
            <div class="relative p-8">
              <div class="grid grid-cols-1 gap-3">
                <div
                  *ngFor="let skill of category.skills; let i = index"
                  class="flex items-center justify-between dark:bg-white/15 bg-orange-50 backdrop-blur-md rounded-xl p-4 hover:bg-white/25 transition-all duration-300 border border-white/10 hover:border-white/30"
                  [style.animation-delay]="i * 0.1 + 's'"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-2 h-2 rounded-full bg-white/60"></div>
                    <span class="dark:text-white font-semibold text-sm">{{
                      skill.name
                    }}</span>
                  </div>
                  <div class="flex items-center space-x-3">
                    <!-- Star Rating -->
                    <div class="flex space-x-1">
                      <div
                        *ngFor="
                          let star of getStars(skill.level);
                          let j = index
                        "
                        class="w-3 h-3 rounded-full transition-all duration-200"
                        [class]="
                          star ? 'bg-yellow-300 shadow-sm' : 'dark:bg-white/20 bg-slate-300'
                        "
                        [style.animation-delay]="i * 0.1 + j * 0.05 + 's'"
                      ></div>
                    </div>
                    <!-- Percentage Badge -->
                    <div
                      class="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30"
                    >
                      <span class="dark:text-white text-xs font-bold"
                        >{{ skill.level }}%</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bottom Gradient -->
            <div
              class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            ></div>
          </div>
        </div>

        
        </div>
      
    </section>
  `,
  styles: [
    `
      .section {
        min-height: 100vh;
        display: flex;
        align-items: center;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .group:hover .skill-item {
        animation: fadeInUp 0.3s ease-out forwards;
      }
    `,
  ],
})
export class SkillsComponent {
  skillCategories: SkillCategory[] = [
    {
      name: "Frontend Development",
      color: "text-blue-400",
      bgColor: "bg-gradient-to-br  ",
      icon: "🎨",
      skills: [
        { name: "Angular", level: 95 },
        { name: "TypeScript", level: 90 },
        { name: "HTML & CSS", level: 95 },
        { name: "JavaScript", level: 90 },
        { name: "Tailwind CSS", level: 90 },
        { name: "Bootstrap", level: 90 },
        { name: "Responsive Design", level: 90 },
        { name: "UI/UX Design", level: 80 },
      ],
    },
    {
      name: "Backend Development",
      color: "text-green-400",
      bgColor: "bg-gradient-to-br  ",
      icon: "⚙️",
      skills: [
        { name: "ASP.NET Core", level: 90 },
        { name: "C#", level: 95 },
        { name: "Entity Framework", level: 90 },
        { name: "LINQ", level: 95 },
        { name: "RESTful APIs", level: 95 },
        { name: "SQL Server", level: 90 },
        { name: "Authentication", level: 95 },
        { name: "Redis", level: 80 },
      ],
    },
    {
      name: "DevOps & Tools",
      color: "text-purple-400",
      bgColor: "bg-gradient-to-br  ",
      icon: "🛠️",
      skills: [
        { name: "Git & GitHub", level: 90 },
        { name: "VS Code", level: 95 },
        { name: "Docker", level: 85 },
        { name: "AWS", level: 80 },
        { name: "CI/CD", level: 70 },
        { name: "Linux", level: 85 },
        { name: "Postman", level: 90 },
        { name: "Unit Testing", level: 85 },
      ],
    },
    {
      name: "AI & Data Science",
      color: "text-orange-400",
      bgColor: "bg-gradient-to-br  ",
      icon: "🤖",
      skills: [
        { name: "Python", level: 90 },
        { name: "Machine Learning", level: 90 },
        { name: "Deep Learning", level: 85 },
        { name: "Data Science", level: 85 },
        { name: "NLP", level: 90 },
        { name: "Transformers", level: 85 },
        { name: "LLM", level: 80 },
        { name: "Generative AI", level: 75 },
      ],
    },
  ];

 

  getStars(level: number): boolean[] {
    const stars = Math.round(level / 20); // Convert percentage to 5-star rating
    return Array(5)
      .fill(false)
      .map((_, i) => i < stars);
  }
}
