/**
 * Single source of truth for all portfolio content.
 * Used by both the 3D universe and the classic (accessible) view.
 */

export interface Profile {
  name: string;
  firstName: string;
  headline: string;
  rotatingTitles: string[];
  intro: string;
  about: string[];
  location: string;
  phone: string;
  email: string;
  photo: string;
  cv: string;
  yearsExperience: string;
  socials: SocialLink[];
}

export interface SocialLink {
  id: 'github' | 'linkedin' | 'facebook' | 'email' | 'phone';
  label: string;
  href: string;
  icon: string; // font-awesome class
  handle: string;
}

export interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
  achievements: string[];
  kind: 'engineering' | 'ai' | 'education';
}

export interface Project {
  title: string;
  description: string;
  image: string;
  images?: string[];
  technologies: string[];
  demoLink: string;
  codeLink: string;
  category: 'fullstack' | 'backend' | 'frontend' | 'ai' | 'data-analysis';
}

export interface Skill {
  name: string;
  icon: string;
  description: string;
}

export interface SkillCategory {
  id: 'backend' | 'frontend' | 'ai' | 'tools';
  name: string;
  summary: string;
  color: string; // hex used by the 3D constellation
  headerClass: string;
  skillClass: string;
  glowClass: string;
  trailClass: string;
  skills: Skill[];
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  details: string[];
}

export interface Certification {
  title: string;
  issuer: string;
  year: string;
}

export const PROFILE: Profile = {
  name: 'Yousif Ibrahim',
  firstName: 'Yousif',
  headline: 'Software Engineer · Full Stack .NET & Angular · AI Engineer',
  rotatingTitles: [
    'Full Stack Developer',
    '.NET Developer',
    'Software Engineer',
    'AI Engineer',
    'NLP Specialist',
    'Data Scientist',
    'Machine Learning Engineer',
  ],
  intro:
    'I build scalable, production-grade web platforms with ASP.NET Core, Angular and SQL Server, and I train machine learning and NLP models that solve real problems.',
  about: [
    "I'm a passionate Full Stack Developer specialized in building scalable and high-performance web applications using ASP.NET Core, C#, Angular, and SQL Server. I combine strong back-end logic with modern front-end frameworks to deliver clean, user-friendly, and maintainable solutions.",
    "Alongside my full stack work, I'm also an AI Engineer with hands-on experience in machine learning, natural language processing (NLP), and building intelligent systems that solve real-world problems.",
    "Driven by continuous learning and improvement, I thrive on turning complex challenges into simple, effective solutions. Whether it's developing robust APIs, designing responsive UIs, or training ML models, I always aim for code quality and business impact.",
  ],
  location: '6th of October, Giza, Egypt',
  phone: '+201127609258',
  email: 'yosefys236@gmail.com',
  photo: 'assets/WhatsApp Image 2025-01-01 at 23.18.24_05ff127b.jpg',
  cv: 'assets/cv.pdf',
  yearsExperience: '3+',
  socials: [
    {
      id: 'github',
      label: 'GitHub',
      href: 'https://github.com/UsfHajaj',
      icon: 'fab fa-github',
      handle: 'github.com/UsfHajaj',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/yousif-ibrahim-8103b91b6/',
      icon: 'fab fa-linkedin',
      handle: 'in/yousif-ibrahim',
    },
    {
      id: 'facebook',
      label: 'Facebook',
      href: 'https://www.facebook.com/yosef.hgag.3',
      icon: 'fab fa-facebook',
      handle: 'yosef.hgag.3',
    },
    {
      id: 'email',
      label: 'Email',
      href: 'mailto:yosefys236@gmail.com',
      icon: 'fas fa-envelope',
      handle: 'yosefys236@gmail.com',
    },
    {
      id: 'phone',
      label: 'Phone',
      href: 'tel:+201127609258',
      icon: 'fas fa-phone',
      handle: '+20 112 760 9258',
    },
  ],
};

export const EXPERIENCES: Experience[] = [
  {
    title: 'Software Engineer',
    company: 'Tameer for Facilities Management',
    period: 'Jan 2026 – Present',
    kind: 'engineering',
    description:
      'Building and operating production systems that digitize resident services, field operations, and internal business processes.',
    achievements: [
      "Developed and launched the company's official website, strengthening its digital presence and generating new inbound leads",
      'Built a complaints management system enabling residents of major compounds (Dar Misr, Sakan Misr, Social Housing) to submit and track complaints, cutting resolution time and improving customer satisfaction',
      'Designed and deployed a biometric fingerprint attendance system to track on-site supervisors across project locations, eliminating manual attendance logs and boosting accountability',
      'Led follow-up on ERP implementation across departments, streamlining core business processes and improving reporting accuracy',
      'Built and maintained server and network infrastructure across company branches, driving digital transformation and reducing system downtime',
    ],
  },
  {
    title: 'Full Stack Developer',
    company: 'EXSUS',
    period: 'Jul 2025 – Jan 2026',
    kind: 'engineering',
    description:
      'Delivered full-stack .NET and Angular features across multiple production systems for client organizations.',
    achievements: [
      'Delivered full-stack .NET and Angular features across a Smart Inspection System, a Smart Office Management platform, and a Talent Management System for the Fujairah Environment Authority',
      'Designed clean, layered system architecture for end-to-end features, cutting development time through reusable components',
      'Deployed and maintained web applications in production with high uptime, serving active users across client organizations',
    ],
  },
  {
    title: 'Part-Time Coordinator',
    company: 'Almentor',
    period: 'Jun 2024 – Jun 2025',
    kind: 'education',
    description:
      'Coordinated live learning sessions for large audiences, ensuring smooth delivery and effective learning outcomes.',
    achievements: [
      'Coordinated live learning sessions for large audiences, ensuring smooth delivery and effective learning outcomes',
      'Managed session logistics for hundreds of attendees, improving on-time session start rates',
      'Provided direct support to students in each cohort, increasing participation and session engagement',
    ],
  },
  {
    title: 'AI Engineer – Irrigation Scheduling Project',
    company: 'Freelance',
    period: 'Apr 2025 – Mar 2025',
    kind: 'ai',
    description:
      'Built a machine learning model that predicted soil water needs and supported data-driven irrigation decisions.',
    achievements: [
      'Built a machine learning model that predicted soil water needs with high accuracy, reducing unnecessary water usage',
      'Produced full technical documentation with 4 UML diagram types (Use Case, Sequence, Class, Component) covering all system modules',
      'Delivered a functional solution adopted to support data-driven agricultural decisions in the field',
    ],
  },
  {
    title: 'NLP Engineer',
    company: 'SMSM AI',
    period: 'Mar 2024 – Jun 2024',
    kind: 'ai',
    description:
      'Led a real-time Egyptian dialect machine translation project from data collection through model delivery.',
    achievements: [
      'Spearheaded a real-time Egyptian dialect machine translation project, achieving strong translation accuracy',
      'Promoted to Team Leader within months, managing a team of engineers',
      'Led data collection efforts, gathering and curating a large volume of samples for model training',
      'Oversaw implementation of machine translation models, improving inference speed and accuracy',
      'Delivered the project on schedule, meeting the defined success metrics',
    ],
  },
  {
    title: 'AI Trainee',
    company: 'Zewail City',
    period: 'Aug 2023 – Jan 2024',
    kind: 'ai',
    description:
      'Completed hands-on training in AI and machine learning, applied to real-world datasets.',
    achievements: [
      'Completed hands-on training in AI and machine learning fundamentals over several months',
      'Built data science and AI projects analyzing real-world datasets, applying core AI principles to practical problems',
      'Gained proficiency in big data analytics and machine learning through applied exercises and case studies',
    ],
  },
];

export const PROJECT_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Full Stack', value: 'fullstack' },
  { label: 'Backend', value: 'backend' },
  { label: 'Frontend', value: 'frontend' },
  { label: 'AI', value: 'ai' },
  { label: 'Data Analysis', value: 'data-analysis' },
];

export const PROJECTS: Project[] = [
  {
    title: 'Store Hub — Multi-Store POS',
    description:
      'A point-of-sale and store management system for running multiple shops from one dashboard. It covers live sales, product catalogs, inventory, discounts, invoices, cashier performance, and role-based access, with charts for revenue and store activity.',
    image: 'assets/projects/POS1.png',
    images: [
      'assets/projects/POS1.png',
      'assets/projects/POS2.png',
      'assets/projects/POS3.png',
      'assets/projects/POS4.png',
      'assets/projects/POS5.png',
      'assets/projects/POS6.png',
    ],
    technologies: ['ASP.NET Core', 'Angular', 'SQL Server', 'Entity Framework Core', 'Role-Based Access'],
    demoLink: 'http://store-hub.runasp.net/',
    codeLink: '',
    category: 'fullstack',
  },
  {
    title: 'Tameer ERP System',
    description:
      'An enterprise platform that brings finance, HR, inventory, purchasing, contracts, legal affairs, operations, archive, and reporting into one workspace. Departments work from shared data, with Arabic and English support and dashboards for day-to-day decisions.',
    image: 'assets/projects/ERP2.png',
    images: ['assets/projects/ERP2.png', 'assets/projects/ERP.png', 'assets/projects/ERP1.png'],
    technologies: ['ASP.NET Core', 'Angular', 'SQL Server', 'Entity Framework Core', 'Arabic / English'],
    demoLink: 'https://tameer-erp-system.runasp.net/',
    codeLink: '',
    category: 'fullstack',
  },
  {
    title: 'Tameer Biometric Attendance',
    description:
      'A fingerprint attendance system for on-site supervisors across project locations. Staff check in from the field, and managers follow live locations, shifts, attendance logs, and user roles, then export records to Excel or PDF.',
    image: 'assets/projects/Attendance1.png',
    images: [
      'assets/projects/Attendance1.png',
      'assets/projects/Attendance2.png',
      'assets/projects/Attendance3.png',
      'assets/projects/Attendance4.png',
      'assets/projects/Attendance5.png',
    ],
    technologies: ['ASP.NET Core', 'Angular', 'SQL Server', 'Biometric Attendance', 'Excel / PDF Export'],
    demoLink: 'https://attendance-withdrawal-tameer.runasp.net/',
    codeLink: '',
    category: 'fullstack',
  },
  {
    title: 'Tameer Complaints Portal',
    description:
      'A complaints system for residents of major compounds, including Dar Misr, Sakan Misr, and Social Housing. Residents register, submit a complaint, and track its status, so follow-up is faster and resolution time goes down.',
    image: 'assets/projects/complaint.png',
    images: [
      'assets/projects/complaint.png',
      'assets/projects/complaint2.png',
      'assets/projects/complaint3.png',
      'assets/projects/complaint4.png',
      'assets/projects/complaint5.png',
      'assets/projects/complaint6.png',
    ],
    technologies: ['ASP.NET Core', 'Angular', 'SQL Server', 'Entity Framework Core', 'Arabic / English'],
    demoLink: 'https://complaintstameer.runasp.net/',
    codeLink: '',
    category: 'fullstack',
  },
  {
    title: 'Full Ecommerce Web Application (.NET & Angular)',
    description:
      'Full-stack e-commerce application built with ASP.NET Core for the backend and Angular for the frontend. It follows Clean Architecture principles, integrates with Stripe for payments, uses Redis for basket caching, and applies Entity Framework Core with Fluent API for database interaction.',
    image: 'assets/projects/ecom.png',
    technologies: ['Angular', 'ASP.NET Core', 'Entity Framework', 'JWT Authentication', 'SQL Server', 'Redis', 'Docker'],
    demoLink: '',
    codeLink: 'https://github.com/UsfHajaj/Full-Ecommerce-.NET-Anguler-',
    category: 'fullstack',
  },
  {
    title: 'CineFlex Movie Booking System (.NET MVC)',
    description:
      'A movie ticket booking system built using ASP.NET Core MVC. It allows users to browse movies, view details, and book tickets. Includes an admin panel for managing movies, cinemas, actors, producers, and orders. Uses Entity Framework Core, layered architecture, and role-based authentication.',
    image: 'assets/projects/mvc.png',
    technologies: ['ASP.NET Core MVC', 'Entity Framework Core', 'SQL Server', 'Bootstrap', 'jQuery', 'C#'],
    demoLink: '',
    codeLink: 'https://github.com/UsfHajaj/CineFlex',
    category: 'fullstack',
  },
  {
    title: 'Medical Center Management System (.NET Web API)',
    description:
      'A powerful backend API for managing users, appointments, reviews, and medical centers. Built using ASP.NET Core 9.0 with a clean architecture. Features include JWT authentication, email confirmation, role-based access (admin, doctor, patient), and Swagger documentation.',
    image: 'assets/projects/ms.png',
    technologies: ['ASP.NET Core 9.0', 'Entity Framework Core', 'SQL Server', 'JWT Authentication', 'Swagger', 'RESTful API'],
    demoLink: '',
    codeLink: 'https://github.com/UsfHajaj/MedicalCenter',
    category: 'backend',
  },
  {
    title: 'Learning Management System (.NET Web API)',
    description:
      'A modular and clean backend API for an LMS platform built with ASP.NET Core 9.0. It handles user authentication, course and lesson management, student enrollment, quizzes, assignments, and discussions, all following RESTful architecture with role-based access control.',
    image: 'assets/projects/lms.png',
    technologies: ['ASP.NET Core 9.0', 'Entity Framework Core', 'SQL Server', 'JWT Authentication', 'AutoMapper', 'RESTful API'],
    demoLink: '',
    codeLink: 'https://github.com/UsfHajaj/LMS',
    category: 'backend',
  },
  {
    title: 'E-Commerce API (.NET Web API)',
    description:
      'A modular and scalable backend API for an E-Commerce platform built with ASP.NET Core 9.0. It supports complete user authentication, product and order management, seller operations, shopping cart, payments, and reviews, all following clean architecture and RESTful principles.',
    image: 'assets/projects/ecomapi.png',
    technologies: ['ASP.NET Core 9.0', 'Entity Framework Core', 'SQL Server', 'JWT Authentication', 'AutoMapper', 'RESTful API'],
    demoLink: '',
    codeLink: 'https://github.com/UsfHajaj/ECommerce',
    category: 'backend',
  },
  {
    title: 'E-Commerce Frontend (Angular)',
    description:
      'A responsive and modular e-commerce frontend built using Angular. It includes user authentication, product listings, category browsing, shopping cart functionality, route protection, interceptors, and clean component-based architecture with separate layouts for authenticated and non-authenticated users.',
    image: 'assets/projects/fre2.png',
    technologies: ['Angular', 'TypeScript', 'RxJS', 'Bootstrap', 'SCSS', 'Angular Router', 'Guards & Interceptors'],
    demoLink: '',
    codeLink: 'https://github.com/UsfHajaj/Ecommerce-Angular/tree/master',
    category: 'frontend',
  },
  {
    title: 'Amazon clone',
    description:
      'A simple and responsive e-commerce website built with HTML, CSS, and JavaScript (Vanilla JS). It features product listing, a shopping cart page, and dynamic navigation using plain JavaScript without any frameworks.',
    image: 'assets/projects/am.png',
    technologies: ['HTML', 'CSS', 'JavaScript', 'DOM Manipulation', 'Responsive Design'],
    demoLink: '',
    codeLink: 'https://github.com/UsfHajaj/Amazon-Clone',
    category: 'frontend',
  },
  {
    title: 'Travel & Booking Website',
    description:
      'A responsive travel booking website built using PHP, HTML, CSS, and JavaScript. Users can browse travel packages, submit booking forms, and view information about destinations. The website includes interactive elements like sliders using Swiper.js for enhanced user experience.',
    image: 'assets/projects/tr.png',
    technologies: ['PHP', 'HTML', 'CSS', 'JavaScript', 'Swiper.js', 'Form Handling', 'Responsive Design'],
    demoLink: '',
    codeLink: 'https://github.com/UsfHajaj/travel_-website/tree/master',
    category: 'fullstack',
  },
  {
    title: 'Social Media Web UI',
    description:
      'A fully responsive front-end interface for a social media platform. Built using HTML, CSS, and JavaScript, the project features a modern feed layout, story section, profile previews, and interactive elements to mimic real social media behavior.',
    image: 'assets/projects/smc.png',
    technologies: ['HTML', 'CSS', 'JavaScript', 'Responsive Design', 'DOM Manipulation'],
    demoLink: '',
    codeLink: 'https://github.com/UsfHajaj/social-media-app/tree/master',
    category: 'frontend',
  },
  {
    title: 'Simple Landing Page Project',
    description:
      'A clean and responsive landing page built with HTML and CSS. The page demonstrates layout structuring, image integration, and style normalization for consistent cross-browser appearance. Ideal for showcasing basic frontend development skills.',
    image: 'assets/projects/ln2.png',
    technologies: ['HTML', 'CSS', 'Responsive Design', 'Normalize.css'],
    demoLink: '',
    codeLink: 'https://github.com/UsfHajaj/Landden-Page/tree/main',
    category: 'frontend',
  },
  {
    title: 'AI Text-to-Image Generator (IMATOR)',
    description:
      'An advanced AI system that generates high-quality images from textual prompts using diffusion-based generative models. The project leverages state-of-the-art diffusion techniques and fine-tunes models to produce visually compelling outputs based on user input. Includes experiments on artistic styles like Ancient Egyptian imagery.',
    image: 'assets/projects/Imator.png',
    technologies: ['Diffusion Models', 'Python', 'PyTorch', 'Hugging Face Transformers', 'Stable Diffusion'],
    demoLink: '',
    codeLink: 'https://github.com/UsfHajaj/IMATOR',
    category: 'ai',
  },
  {
    title: 'Data Analysis Projects',
    description:
      'A collection of real-world data analysis projects designed to extract insights and support business decision-making. These projects demonstrate proficiency in data cleaning, transformation, visualization, and storytelling using Microsoft Excel and Power BI. Key insights were derived from product performance, store operations, and overall business trends.',
    image: 'assets/projects/toy.png',
    technologies: ['Microsoft Excel', 'Power BI', 'Data Cleaning', 'Data Visualization', 'Dashboard Design', 'Git'],
    demoLink: '',
    codeLink: 'https://github.com/UsfHajaj/Data-Analysis-Projects/blob/main/Toy%20Store%20Sales/README.md',
    category: 'data-analysis',
  },
  {
    title: 'Patients Healthcare Dashboard',
    description:
      'An interactive healthcare data analysis project that explores patient demographics, visit patterns, wait times, and feedback. The project identifies key operational insights using Power BI and Excel, aiming to enhance patient services and optimize clinic workflows.',
    image: 'assets/projects/PH.png',
    technologies: ['Microsoft Excel', 'Power BI', 'Data Cleaning', 'Data Visualization', 'Healthcare Analytics', 'Python'],
    demoLink: '',
    codeLink: 'https://github.com/UsfHajaj/Data-Analysis-Projects/blob/main/Patients%20Healthcare/README.md',
    category: 'data-analysis',
  },
  {
    title: 'Netflix Userbase Analysis',
    description:
      "An interactive dashboard analyzing Netflix's userbase to uncover trends in subscription preferences, device usage, demographics, and revenue distribution. Using Excel and Power BI, this project identifies patterns across countries, age groups, and genders to support data-driven business strategies.",
    image: 'assets/projects/n.png',
    technologies: ['Microsoft Excel', 'Data Visualization', 'Demographic Analysis'],
    demoLink: '',
    codeLink: 'https://github.com/UsfHajaj/Data-Analysis-Projects/blob/main/Netflix%20Userbase/README.md',
    category: 'data-analysis',
  },
  {
    title: 'AI-Based Irrigation Scheduling System',
    description:
      'A freelance project delivering a smart irrigation scheduling system powered by machine learning. It provides personalized watering recommendations based on soil, weather, and crop data. Built using Python, the system uses ensemble models to optimize water usage, reduce cost, and improve crop yields.',
    image: 'assets/projects/ir.png',
    technologies: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'XGBoost', 'Streamlit', 'Data Preprocessing', 'Ensemble Learning'],
    demoLink: '',
    codeLink: 'https://github.com/UsfHajaj/irrigation-scheduling',
    category: 'ai',
  },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'backend',
    name: 'Backend',
    summary: 'APIs, data layers and security for production .NET systems.',
    color: '#4f8cff',
    headerClass: 'bg-gradient-to-br from-green-400 to-teal-500 text-white',
    skillClass:
      'bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 border-green-300 dark:border-green-600 text-gray-800 dark:text-white',
    glowClass: 'bg-green-400',
    trailClass: 'bg-gradient-to-b from-green-400 to-transparent',
    skills: [
      { name: 'ASP.NET Core', icon: 'assets/icons/ASP.NET.png', description: 'Web framework' },
      { name: 'C#', icon: 'assets/icons/C.jpg', description: 'Object-oriented' },
      { name: 'Entity Framework', icon: 'assets/icons/ef.png', description: 'ORM framework' },
      { name: 'LINQ', icon: 'assets/icons/LINQ.png', description: 'Query syntax' },
      { name: 'REST API', icon: 'assets/icons/REST API.png', description: 'Web services' },
      { name: 'SQL Server', icon: 'assets/icons/SQL Server.jpg', description: 'Database system' },
      { name: 'JWT Auth', icon: 'assets/icons/JWT Auth.png', description: 'Security system' },
      { name: 'Redis', icon: 'assets/icons/Redis.jpeg', description: 'Caching system' },
    ],
  },
  {
    id: 'frontend',
    name: 'Frontend',
    summary: 'Component-driven, responsive interfaces built with Angular.',
    color: '#9b7bff',
    headerClass: 'bg-gradient-to-br from-blue-400 to-purple-500 text-white',
    skillClass:
      'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-300 dark:border-blue-600 text-gray-800 dark:text-white',
    glowClass: 'bg-blue-400',
    trailClass: 'bg-gradient-to-b from-blue-400 to-transparent',
    skills: [
      { name: 'Angular', icon: 'assets/icons/angular.jpg', description: 'Modern web framework' },
      { name: 'TypeScript', icon: 'assets/icons/ts.png', description: 'Typed JavaScript' },
      { name: 'HTML', icon: 'assets/icons/html.jpg', description: 'Web foundations' },
      { name: 'CSS', icon: 'assets/icons/css.jpg', description: 'Web foundations' },
      { name: 'JavaScript', icon: 'assets/icons/js.png', description: 'Dynamic programming' },
      { name: 'Tailwind', icon: 'assets/icons/tailwind.png', description: 'Utility-first CSS' },
      { name: 'Bootstrap', icon: 'assets/icons/bootstrap.png', description: 'CSS framework' },
      { name: 'Responsive', icon: 'assets/icons/responsive.png', description: 'Mobile-first design' },
      { name: 'UI/UX', icon: 'assets/icons/UI-UX.png', description: 'User experience' },
    ],
  },
  {
    id: 'ai',
    name: 'AI & Data',
    summary: 'Machine learning, NLP and generative models in Python.',
    color: '#38d6e8',
    headerClass: 'bg-gradient-to-br from-orange-400 to-red-500 text-white',
    skillClass:
      'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 border-orange-300 dark:border-orange-600 text-gray-800 dark:text-white',
    glowClass: 'bg-orange-400',
    trailClass: 'bg-gradient-to-b from-orange-400 to-transparent',
    skills: [
      { name: 'Python', icon: 'assets/icons/Python.png', description: 'AI programming' },
      { name: 'ML', icon: 'assets/icons/ML.png', description: 'Machine learning' },
      { name: 'Deep Learning', icon: 'assets/icons/Deep Learning.png', description: 'Neural networks' },
      { name: 'Data Science', icon: 'assets/icons/DataScience.png', description: 'Data analysis' },
      { name: 'NLP', icon: 'assets/icons/NLP.png', description: 'Language processing' },
      { name: 'Transformers', icon: 'assets/icons/Transformers.png', description: 'AI architecture' },
      { name: 'LLM', icon: 'assets/icons/LLM.png', description: 'Language models' },
      { name: 'Gen AI', icon: 'assets/icons/GenAI.png', description: 'Creative AI' },
    ],
  },
  {
    id: 'tools',
    name: 'Tools & Cloud',
    summary: 'Delivery tooling, containers, cloud and quality assurance.',
    color: '#b7c4dc',
    headerClass: 'bg-gradient-to-br from-purple-400 to-pink-500 text-white',
    skillClass:
      'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300 dark:border-purple-600 text-gray-800 dark:text-white',
    glowClass: 'bg-purple-400',
    trailClass: 'bg-gradient-to-b from-purple-400 to-transparent',
    skills: [
      { name: 'Git', icon: 'assets/icons/Git.png', description: 'Version control' },
      { name: 'VS Code', icon: 'assets/icons/VS Code.png', description: 'Code editor' },
      { name: 'Docker', icon: 'assets/icons/Docker.png', description: 'Containerization' },
      { name: 'AWS', icon: 'assets/icons/AWS.png', description: 'Cloud platform' },
      { name: 'Linux', icon: 'assets/icons/Linux.png', description: 'Operating system' },
      { name: 'Postman', icon: 'assets/icons/Postman2.png', description: 'API testing' },
      { name: 'Testing', icon: 'assets/icons/Testing.jpg', description: 'Quality assurance' },
    ],
  },
];

export const EDUCATION: Education[] = [
  {
    degree: 'Bachelor of Computers and Artificial Intelligence',
    institution: 'Banha University',
    period: 'Aug 2020 – Aug 2024',
    details: ['Major: Artificial Intelligence', 'Grade: Very Good'],
  },
];

export const CERTIFICATIONS: Certification[] = [
  { title: 'AWS Academy Data Engineering', issuer: 'AWS Academy', year: '2024' },
  { title: 'SQL Certificate', issuer: 'HackerRank', year: '2024' },
  { title: 'Artificial Intelligence and Applications Training', issuer: 'Zewail City', year: '2024' },
  { title: 'Python for Data Science, AI and Development', issuer: 'IBM', year: '2024' },
  { title: 'Deep Neural Network', issuer: 'deeplearning.AI', year: '2023' },
  { title: 'CCNA — Cisco Networking Academy', issuer: 'Cisco', year: '2022' },
];

export const LANGUAGES = [
  { name: 'Arabic', level: 'Native' },
  { name: 'English', level: 'Professional' },
];
