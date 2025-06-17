import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

interface Project {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  demoLink: string;
  codeLink: string;
  category: string; // إضافة فئة للمشروع
}

@Component({
  selector: "app-projects",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./projects.component.html",
})
export class ProjectsComponent {
  currentPage = 1;
  projectsPerPage = 6;
  activeFilter = "all";

  filters = [
    { label: "All", value: "all" },
    { label: "Full Stack", value: "fullstack" },
    { label: "Backend", value: "backend" },
    { label: "Frontend", value: "frontend" },
    { label: "AI", value: "ai" },
    { label: "Data Analysis", value: "data-analysis" },
  ];

  projects: Project[] = [
    {
      title: "Full Ecommerce Web Application (.NET & Angular)",
      description:
        "full-stack e-commerce application built with ASP.NET Core for the backend and Angular for the frontend. It follows Clean Architecture principles, integrates with Stripe for payments, uses Redis for basket caching, and applies Entity Framework Core with Fluent API for database interaction.",
      image:
        "assets/projects/ecom.png",
      technologies: [
        "Angular",
        "ASP.NET Core",
        "Entity Framework",
        "JWT Authentication",
        "SQL Server",
        "Redis",
        "Docker",
      ],
      demoLink: "",
      codeLink: "https://github.com/UsfHajaj/Full-Ecommerce-.NET-Anguler-",
      category: "fullstack",
    },
    {
      title: "CineFlex Movie Booking System (.NET MVC)",
      description:
        "A movie ticket booking system built using ASP.NET Core MVC. It allows users to browse movies, view details, and book tickets. Includes an admin panel for managing movies, cinemas, actors, producers, and orders. Uses Entity Framework Core, layered architecture, and role-based authentication.",
      image: "assets/projects/mvc.png",
      technologies: [
        "ASP.NET Core MVC",
        "Entity Framework Core",
        "SQL Server",
        "Bootstrap",
        "jQuery",
        "C#",
      ],
      demoLink: "",
      codeLink: "https://github.com/UsfHajaj/CineFlex",
      category: "fullstack",
    },
    {
      title: "Medical Center Management System (.NET Web API)",
      description:
        "A powerful backend API for managing users, appointments, reviews, and medical centers. Built using ASP.NET Core 9.0 with a clean architecture. Features include JWT authentication, email confirmation, role-based access (admin, doctor, patient), and Swagger documentation.",
      image:
        "assets/projects/ms.png",
      technologies: [
        "ASP.NET Core 9.0",
        "Entity Framework Core",
        "SQL Server",
        "JWT Authentication",
        "Swagger",
        "RESTful API",
      ],
      demoLink: "",
      codeLink: "https://github.com/UsfHajaj/MedicalCenter",
      category: "backend",
    },
    {
      title: "Learning Management System (.NET Web API)",
      description:
        "A modular and clean backend API for an LMS platform built with ASP.NET Core 9.0. It handles user authentication, course and lesson management, student enrollment, quizzes, assignments, and discussions, all following RESTful architecture with role-based access control.",
      image: "assets/projects/lms.png",
      technologies: [
        "ASP.NET Core 9.0",
        "Entity Framework Core",
        "SQL Server",
        "JWT Authentication",
        "AutoMapper",
        "RESTful API",
      ],
      demoLink: "",
      codeLink: "https://github.com/UsfHajaj/LMS",
      category: "backend",
    },
    {
      title: "E-Commerce API (.NET Web API)",
      description:
        "A modular and scalable backend API for an E-Commerce platform built with ASP.NET Core 9.0. It supports complete user authentication, product and order management, seller operations, shopping cart, payments, and reviews, all following clean architecture and RESTful principles.",
      image:
        "assets/projects/ecomapi.png",
      technologies: [
        "ASP.NET Core 9.0",
        "Entity Framework Core",
        "SQL Server",
        "JWT Authentication",
        "AutoMapper",
        "RESTful API",
      ],
      demoLink: "",
      codeLink: "https://github.com/UsfHajaj/ECommerce",
      category: "backend",
    },
    {
      title: "E-Commerce Frontend (Angular)",
      description:
        "A responsive and modular e-commerce frontend built using Angular. It includes user authentication, product listings, category browsing, shopping cart functionality, route protection, interceptors, and clean component-based architecture with separate layouts for authenticated and non-authenticated users.",
      image:
        "assets/projects/fre2.png",
      technologies: [
        "Angular",
        "TypeScript",
        "RxJS",
        "Bootstrap",
        "SCSS",
        "Angular Router",
        "Guards & Interceptors",
      ],
      demoLink: "",
      codeLink: "https://github.com/UsfHajaj/Ecommerce-Angular/tree/master",
      category: "frontend",
    },
    {
      title: "Amazon clone",
      description:
        "A simple and responsive e-commerce website built with HTML, CSS, and JavaScript (Vanilla JS). It features product listing, a shopping cart page, and dynamic navigation using plain JavaScript without any frameworks.",
      image: "assets/projects/am.png",
      technologies: [
        "HTML",
        "CSS",
        "JavaScript",
        "DOM Manipulation",
        "Responsive Design",
      ],
      demoLink: "",
      codeLink: "https://github.com/UsfHajaj/Amazon-Clone",
      category: "frontend",
    },
    {
      title: "Travel & Booking Website",
      description:
        "A responsive travel booking website built using PHP, HTML, CSS, and JavaScript. Users can browse travel packages, submit booking forms, and view information about destinations. The website includes interactive elements like sliders using Swiper.js for enhanced user experience.",
      image: "assets/projects/tr.png",
      technologies: [
        "PHP",
        "HTML",
        "CSS",
        "JavaScript",
        "Swiper.js",
        "Form Handling",
        "Responsive Design",
      ],
      demoLink: "",
      codeLink: "https://github.com/UsfHajaj/travel_-website/tree/master",
      category: "fullstack",
    },
    {
      title: "Social Media Web UI",
      description:
        "A fully responsive front-end interface for a social media platform. Built using HTML, CSS, and JavaScript, the project features a modern feed layout, story section, profile previews, and interactive elements to mimic real social media behavior.",
      image: "assets/projects/smc.png",
      technologies: [
        "HTML",
        "CSS",
        "JavaScript",
        "Responsive Design",
        "DOM Manipulation",
      ],
      demoLink: "",
      codeLink: "https://github.com/UsfHajaj/social-media-app/tree/master",
      category: "frontend",
    },
    {
      title: "Simple Landing Page Project",
      description:
        "A clean and responsive landing page built with HTML and CSS. The page demonstrates layout structuring, image integration, and style normalization for consistent cross-browser appearance. Ideal for showcasing basic frontend development skills.",
      image: "assets/projects/ln2.png",
      technologies: ["HTML", "CSS", "Responsive Design", "Normalize.css"],
      demoLink: "",
      codeLink: "https://github.com/UsfHajaj/Landden-Page/tree/main",
      category: "frontend",
    },
    {
      title: "AI Text-to-Image Generator (IMATOR)",
      description:
        "An advanced AI system that generates high-quality images from textual prompts using diffusion-based generative models. The project leverages state-of-the-art diffusion techniques and fine-tunes models to produce visually compelling outputs based on user input. Includes experiments on artistic styles like Ancient Egyptian imagery.",
      image: "assets/projects/Imator.png",
      technologies: [
        "Diffusion Models",
        "Python",
        "PyTorch",
        "Hugging Face Transformers",
        "Stable Diffusion",
      ],
      demoLink: "",
      codeLink: "https://github.com/UsfHajaj/IMATOR",
      category: "ai",
    },
    {
      title: "Data Analysis Projects",
      description:
        "A collection of real-world data analysis projects designed to extract insights and support business decision-making. These projects demonstrate proficiency in data cleaning, transformation, visualization, and storytelling using Microsoft Excel and Power BI. Key insights were derived from product performance, store operations, and overall business trends.",
      image: "assets/projects/toy.png",
      technologies: [
        "Microsoft Excel",
        "Power BI",
        "Data Cleaning",
        "Data Visualization",
        "Dashboard Design",
        "Git",
      ],
      demoLink: "",
      codeLink:
        "https://github.com/UsfHajaj/Data-Analysis-Projects/blob/main/Toy%20Store%20Sales/README.md",
      category: "data-analysis",
    },
    {
      title: "Patients Healthcare Dashboard",
      description:
        "An interactive healthcare data analysis project that explores patient demographics, visit patterns, wait times, and feedback. The project identifies key operational insights using Power BI and Excel, aiming to enhance patient services and optimize clinic workflows.",
      image: "assets/projects/PH.png",
      technologies: [
        "Microsoft Excel",
        "Power BI",
        "Data Cleaning",
        "Data Visualization",
        "Healthcare Analytics",
        "Python",
      ],
      demoLink: "",
      codeLink:
        "https://github.com/UsfHajaj/Data-Analysis-Projects/blob/main/Patients%20Healthcare/README.md",
      category: "data-analysis",
    },
    {
      title: "Netflix Userbase Analysis",
      description:
        "An interactive dashboard analyzing Netflix's userbase to uncover trends in subscription preferences, device usage, demographics, and revenue distribution. Using Excel and Power BI, this project identifies patterns across countries, age groups, and genders to support data-driven business strategies.",
      image: "assets/projects/n.png",
      technologies: [
        "Microsoft Excel",
        "Data Visualization",
        "Demographic Analysis",
      ],
      demoLink: "",
      codeLink:
        "https://github.com/UsfHajaj/Data-Analysis-Projects/blob/main/Netflix%20Userbase/README.md",
      category: "data-analysis",
    },
    {
      title: "AI-Based Irrigation Scheduling System",
      description:
        "A freelance project delivering a smart irrigation scheduling system powered by machine learning. It provides personalized watering recommendations based on soil, weather, and crop data. Built using Python, the system uses ensemble models to optimize water usage, reduce cost, and improve crop yields.",
      image: "assets/projects/ir.png",
      technologies: [
        "Python",
        "Pandas",
        "NumPy",
        "Scikit-learn",
        "XGBoost",
        "Streamlit",
        "Data Preprocessing",
        "Ensemble Learning",
      ],
      demoLink: "",
      codeLink: "https://github.com/UsfHajaj/irrigation-scheduling",
      category: "ai",
    },
  ];

  // Get filtered projects based on active filter
  getFilteredProjects(): Project[] {
    if (this.activeFilter === "all") {
      return this.projects;
    }
    return this.projects.filter(
      (project) => project.category === this.activeFilter
    );
  }

  // Get projects for current page
  getCurrentPageProjects(): Project[] {
    const filteredProjects = this.getFilteredProjects();
    const startIndex = (this.currentPage - 1) * this.projectsPerPage;
    const endIndex = startIndex + this.projectsPerPage;
    return filteredProjects.slice(startIndex, endIndex);
  }

  // Get total pages
  getTotalPages(): number {
    return Math.ceil(this.getFilteredProjects().length / this.projectsPerPage);
  }

  // Get page numbers array
  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Set active filter
  setActiveFilter(filter: string): void {
    this.activeFilter = filter;
    this.currentPage = 1; // Reset to first page when filter changes
  }

  // Navigation methods
  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  // CSS class methods
  getFilterButtonClass(filter: string): string {
    return this.activeFilter === filter
      ? "bg-primary-500 text-white shadow-md ring-2 ring-primary-300 dark:ring-primary-600"
      : "bg-white/30 dark:bg-gray-800/30 hover:bg-white/80 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-300  hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-200";
  }

  getPageButtonClass(page: number): string {
    return this.currentPage === page
      ? "bg-primary-500 text-white shadow-md ring-2 ring-primary-300 dark:ring-primary-600"
      : "bg-white/30 dark:bg-gray-800/30 hover:bg-white/80 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-300  hover:text-primary-700 dark:hover:text-primary-300 transition-all duration-200";
  }

  // Add Math to component for template usage
  Math = Math;
}
