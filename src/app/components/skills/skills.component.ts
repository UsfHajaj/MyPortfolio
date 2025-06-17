// skills.component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

interface Skill {
  name: string;
  icon: string;
  description: string;
}

interface SkillCategory {
  name: string;
  skills: Skill[];
  headerClass: string;
  skillClass: string;
  glowClass: string;
  trailClass: string;
}

@Component({
  selector: "app-skills",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./skills.component.html",
  styleUrl: "./skills.component.css",
})
export class SkillsComponent {
  skillCategories: SkillCategory[] = [
    {
      name: "Backend",

      headerClass: "bg-gradient-to-br from-green-400 to-teal-500 text-white",
      skillClass:
        "bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 border-green-300 dark:border-green-600 text-gray-800 dark:text-white",
      glowClass: "bg-green-400",
      trailClass: "bg-gradient-to-b from-green-400 to-transparent",
      skills: [
        {
          name: "ASP.NET Core",
          icon: "assets/icons/ASP.NET.png",
          description: "Web framework",
        },
        {
          name: "C#",
          icon: "assets/icons/C.jpg",
          description: "Object-oriented",
        },
        {
          name: "Entity Framework",
          icon: "assets/icons/ef.png",
          description: "ORM framework",
        },
        {
          name: "LINQ",
          icon: "assets/icons/LINQ.png",
          description: "Query syntax",
        },
        {
          name: "REST API",
          icon: "assets/icons/REST API.png",
          description: "Web services",
        },
        {
          name: "SQL Server",
          icon: "assets/icons/SQL Server.jpg",
          description: "Database system",
        },
        {
          name: "JWT Auth",
          icon: "assets/icons/JWT Auth.png",
          description: "Security system",
        },
        {
          name: "Redis",
          icon: "assets/icons/Redis.jpeg",
          description: "Caching system",
        },
      ],
    },
    {
      name: "Frontend",

      headerClass: "bg-gradient-to-br from-blue-400 to-purple-500 text-white",
      skillClass:
        "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-300 dark:border-blue-600 text-gray-800 dark:text-white",
      glowClass: "bg-blue-400",
      trailClass: "bg-gradient-to-b from-blue-400 to-transparent",
      skills: [
        {
          name: "Angular",
          icon: "assets/icons/angular.jpg",
          description: "Modern web framework",
        },
        {
          name: "TypeScript",
          icon: "assets/icons/ts.png",
          description: "Typed JavaScript",
        },
        {
          name: "HTML",
          icon: "assets/icons/html.jpg",
          description: "Web foundations",
        },
        {
          name: "CSS",
          icon: "assets/icons/css.jpg",
          description: "Web foundations",
        },
        {
          name: "JavaScript",
          icon: "assets/icons/js.png",
          description: "Dynamic programming",
        },
        {
          name: "Tailwind",
          icon: "assets/icons/tailwind.png",
          description: "Utility-first CSS",
        },
        {
          name: "Bootstrap",
          icon: "assets/icons/bootstrap.png",
          description: "CSS framework",
        },
        {
          name: "Responsive",
          icon: "assets/icons/responsive.png",
          description: "Mobile-first design",
        },
        {
          name: "UI/UX",
          icon: "assets/icons/UI-UX.png",
          description: "User experience",
        },
      ],
    },

    {
      name: "AI",

      headerClass: "bg-gradient-to-br from-orange-400 to-red-500 text-white",
      skillClass:
        "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 border-orange-300 dark:border-orange-600 text-gray-800 dark:text-white",
      glowClass: "bg-orange-400",
      trailClass: "bg-gradient-to-b from-orange-400 to-transparent",
      skills: [
        {
          name: "Python",
          icon: "assets/icons/Python.png",
          description: "AI programming",
        },
        {
          name: "ML",
          icon: "assets/icons/ML.png",
          description: "Machine learning",
        },
        {
          name: "Deep Learning",
          icon: "assets/icons/Deep Learning.png",
          description: "Neural networks",
        },
        {
          name: "Data Science",
          icon: "assets/icons/DataScience.png",
          description: "Data analysis",
        },
        {
          name: "NLP",
          icon: "assets/icons/NLP.png",
          description: "Language processing",
        },
        {
          name: "Transformers",
          icon: "assets/icons/Transformers.png",
          description: "AI architecture",
        },
        {
          name: "LLM",
          icon: "assets/icons/LLM.png",
          description: "Language models",
        },
        {
          name: "Gen AI",
          icon: "assets/icons/GenAI.png",
          description: "Creative AI",
        },
      ],
    },
    {
      name: "Tools",

      headerClass: "bg-gradient-to-br from-purple-400 to-pink-500 text-white",
      skillClass:
        "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300 dark:border-purple-600 text-gray-800 dark:text-white",
      glowClass: "bg-purple-400",
      trailClass: "bg-gradient-to-b from-purple-400 to-transparent",
      skills: [
        {
          name: "Git",
          icon: "assets/icons/Git.png",
          description: "Version control",
        },
        {
          name: "VS Code",
          icon: "assets/icons/VS Code.png",
          description: "Code editor",
        },
        {
          name: "Docker",
          icon: "assets/icons/Docker.png",
          description: "Containerization",
        },
        {
          name: "AWS",
          icon: "assets/icons/AWS.png",
          description: "Cloud platform",
        },
        {
          name: "Linux",
          icon: "assets/icons/Linux.png",
          description: "Operating system",
        },
        {
          name: "Postman",
          icon: "assets/icons/Postman2.png",
          description: "API testing",
        },
        {
          name: "Testing",
          icon: "assets/icons/Testing.jpg",
          description: "Quality assurance",
        },
      ],
    },
  ];
}
