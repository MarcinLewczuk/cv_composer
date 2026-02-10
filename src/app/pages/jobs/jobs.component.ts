import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Job {
  id: number;
  title: string;
  company: string;
  type: 'Full-Time' | 'Part-Time' | 'Contract' | 'Freelance';
  location: string;
  salary: string;
  experience: string;
  languages: string[];
  description: string;
  requirements: string[];
  posted: string;
}

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css']
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];

  searchQuery: string = '';
  selectedType: string = '';
  selectedLocation: string = '';
  selectedSalary: string = '';
  selectedExperience: string = '';
  selectedLanguage: string = '';

  jobTypes = ['Full-Time', 'Part-Time', 'Contract', 'Freelance'];
  locations = ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Boston', 'Seattle', 'Austin', 'Remote'];
  salaryRanges = ['0-50K', '50K-100K', '100K-150K', '150K-200K', '200K+'];
  experienceLevels = ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead'];
  programmingLanguages = ['JavaScript', 'Python', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'React', 'Angular', 'Vue'];

  ngOnInit() {
    this.loadJobs();
    this.applyFilters();
  }

  loadJobs() {
    this.jobs = [
      {
        id: 1,
        title: 'Senior Full Stack Developer',
        company: 'Tech Innovations Inc',
        type: 'Full-Time',
        location: 'San Francisco',
        salary: '150K-200K',
        experience: 'Senior',
        languages: ['TypeScript', 'React', 'Node.js', 'Python'],
        description: 'We are looking for a Senior Full Stack Developer to lead our engineering team.',
        requirements: ['10+ years experience', 'Strong React/Node.js skills', 'Team leadership experience'],
        posted: '2 days ago'
      },
      {
        id: 2,
        title: 'Frontend Developer',
        company: 'Creative Digital Agency',
        type: 'Full-Time',
        location: 'New York',
        salary: '100K-150K',
        experience: 'Mid-Level',
        languages: ['JavaScript', 'React', 'Vue', 'TypeScript'],
        description: 'Join our creative team to build stunning web applications.',
        requirements: ['5+ years experience', 'Proficiency in React or Vue', 'UI/UX understanding'],
        posted: '1 day ago'
      },
      {
        id: 3,
        title: 'Python Backend Engineer',
        company: 'DataFlow Systems',
        type: 'Full-Time',
        location: 'Remote',
        salary: '120K-180K',
        experience: 'Mid-Level',
        languages: ['Python', 'Django', 'PostgreSQL', 'AWS'],
        description: 'Build scalable backend services for our data platform.',
        requirements: ['4+ years Python experience', 'Backend architecture knowledge', 'Database design skills'],
        posted: '3 days ago'
      },
      {
        id: 4,
        title: 'Junior Web Developer',
        company: 'StartupHub',
        type: 'Full-Time',
        location: 'Austin',
        salary: '60K-90K',
        experience: 'Entry Level',
        languages: ['JavaScript', 'HTML', 'CSS', 'React'],
        description: 'Start your career with us in a supportive environment.',
        requirements: ['Computer Science degree or bootcamp', 'Basic JavaScript knowledge', 'Willingness to learn'],
        posted: '5 days ago'
      },
      {
        id: 5,
        title: 'DevOps Engineer',
        company: 'CloudScale Inc',
        type: 'Full-Time',
        location: 'Seattle',
        salary: '130K-190K',
        experience: 'Senior',
        languages: ['Go', 'Docker', 'Kubernetes', 'Python'],
        description: 'Manage and optimize our cloud infrastructure.',
        requirements: ['7+ years DevOps experience', 'Kubernetes expertise', 'CI/CD pipeline experience'],
        posted: '4 days ago'
      },
      {
        id: 6,
        title: 'Mobile App Developer',
        company: 'AppWorks Studio',
        type: 'Full-Time',
        location: 'Los Angeles',
        salary: '100K-150K',
        experience: 'Mid-Level',
        languages: ['JavaScript', 'React Native', 'TypeScript', 'Java'],
        description: 'Develop cross-platform mobile applications.',
        requirements: ['4+ years mobile development', 'React Native experience', 'iOS/Android knowledge'],
        posted: '1 week ago'
      },
      {
        id: 7,
        title: 'Contract Frontend Developer',
        company: 'Digital Designs Co',
        type: 'Contract',
        location: 'New York',
        salary: '80K-120K',
        experience: 'Mid-Level',
        languages: ['React', 'TypeScript', 'Tailwind CSS', 'JavaScript'],
        description: '6-month contract for frontend development on multiple projects.',
        requirements: ['3+ years experience', 'Portfolio required', 'Immediate availability'],
        posted: '2 days ago'
      },
      {
        id: 8,
        title: 'Data Scientist',
        company: 'Analytics Pro',
        type: 'Full-Time',
        location: 'Boston',
        salary: '130K-180K',
        experience: 'Mid-Level',
        languages: ['Python', 'R', 'SQL', 'TensorFlow'],
        description: 'Develop machine learning models and data analytics solutions.',
        requirements: ['5+ years data science experience', 'Machine learning expertise', 'SQL proficiency'],
        posted: '3 days ago'
      },
      {
        id: 9,
        title: 'Part-Time UI/UX Designer',
        company: 'Design Studio Pro',
        type: 'Part-Time',
        location: 'Remote',
        salary: '40K-60K',
        experience: 'Junior',
        languages: ['Figma', 'Adobe XD', 'JavaScript'],
        description: '20 hours per week working on UI/UX design projects.',
        requirements: ['2+ years experience', 'Figma/Adobe XD skills', 'Portfolio required'],
        posted: '6 days ago'
      },
      {
        id: 10,
        title: 'JavaScript Freelancer',
        company: 'Project Based',
        type: 'Freelance',
        location: 'Remote',
        salary: '50K-100K',
        experience: 'Mid-Level',
        languages: ['JavaScript', 'Node.js', 'React'],
        description: 'Freelance JavaScript development for various client projects.',
        requirements: ['3+ years experience', 'Strong JavaScript skills', 'Portfolio with projects'],
        posted: '4 days ago'
      },
      {
        id: 11,
        title: 'C# .NET Developer',
        company: 'Enterprise Solutions Ltd',
        type: 'Full-Time',
        location: 'Chicago',
        salary: '110K-160K',
        experience: 'Mid-Level',
        languages: ['C#', '.NET', 'SQL Server', 'Azure'],
        description: 'Build enterprise applications using C# and .NET framework.',
        requirements: ['5+ years .NET experience', 'SQL Server knowledge', 'Azure experience'],
        posted: '5 days ago'
      },
      {
        id: 12,
        title: 'Java Backend Developer',
        company: 'FinTech Innovations',
        type: 'Full-Time',
        location: 'San Francisco',
        salary: '140K-200K',
        experience: 'Senior',
        languages: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL'],
        description: 'Develop microservices for our fintech platform.',
        requirements: ['8+ years Java experience', 'Microservices architecture', 'Spring Boot expertise'],
        posted: '1 week ago'
      },
      {
        id: 13,
        title: 'Rust Systems Programmer',
        company: 'Systems Corp',
        type: 'Full-Time',
        location: 'Remote',
        salary: '160K-220K',
        experience: 'Senior',
        languages: ['Rust', 'C++', 'Linux', 'Assembly'],
        description: 'Develop high-performance systems using Rust.',
        requirements: ['6+ years systems programming', 'Rust expertise', 'Low-level programming knowledge'],
        posted: '3 days ago'
      },
      {
        id: 14,
        title: 'Vue.js Developer',
        company: 'Web Innovations',
        type: 'Full-Time',
        location: 'Boston',
        salary: '95K-140K',
        experience: 'Mid-Level',
        languages: ['Vue', 'JavaScript', 'TypeScript', 'Node.js'],
        description: 'Build responsive web applications using Vue.js.',
        requirements: ['4+ years web development', 'Vue.js expertise', 'CSS/HTML skills'],
        posted: '2 days ago'
      },
      {
        id: 15,
        title: 'QA Automation Engineer',
        company: 'Quality Assurance Pro',
        type: 'Full-Time',
        location: 'Austin',
        salary: '80K-120K',
        experience: 'Mid-Level',
        languages: ['JavaScript', 'Python', 'Selenium', 'Jest'],
        description: 'Create and maintain automated testing frameworks.',
        requirements: ['3+ years QA automation', 'Programming language knowledge', 'Testing framework experience'],
        posted: '4 days ago'
      },
      {
        id: 16,
        title: 'Database Administrator',
        company: 'Data Systems Inc',
        type: 'Full-Time',
        location: 'Chicago',
        salary: '100K-150K',
        experience: 'Mid-Level',
        languages: ['SQL', 'PostgreSQL', 'MongoDB', 'Backup Systems'],
        description: 'Manage and optimize database systems.',
        requirements: ['5+ years DBA experience', 'SQL expertise', 'Performance tuning skills'],
        posted: '5 days ago'
      },
      {
        id: 17,
        title: 'Angular Developer',
        company: 'Frontend Masters',
        type: 'Full-Time',
        location: 'New York',
        salary: '110K-160K',
        experience: 'Mid-Level',
        languages: ['Angular', 'TypeScript', 'RxJS', 'HTML/CSS'],
        description: 'Develop enterprise Angular applications.',
        requirements: ['5+ years Angular experience', 'TypeScript proficiency', 'RxJS knowledge'],
        posted: '1 week ago'
      },
      {
        id: 18,
        title: 'Freelance Web Designer',
        company: 'Project Based',
        type: 'Freelance',
        location: 'Remote',
        salary: '40K-80K',
        experience: 'Junior',
        languages: ['JavaScript', 'HTML', 'CSS', 'Figma'],
        description: 'Freelance web design and development projects.',
        requirements: ['2+ years experience', 'Portfolio required', 'Design skills'],
        posted: '6 days ago'
      },
      {
        id: 19,
        title: 'Go Systems Engineer',
        company: 'Cloud Native Co',
        type: 'Full-Time',
        location: 'Seattle',
        salary: '140K-190K',
        experience: 'Senior',
        languages: ['Go', 'Kubernetes', 'Docker', 'gRPC'],
        description: 'Build cloud-native systems using Go.',
        requirements: ['6+ years Go experience', 'Kubernetes expertise', 'Microservices knowledge'],
        posted: '2 days ago'
      },
      {
        id: 20,
        title: 'WordPress Developer',
        company: 'Web Agency Pro',
        type: 'Part-Time',
        location: 'Los Angeles',
        salary: '50K-80K',
        experience: 'Entry Level',
        languages: ['PHP', 'JavaScript', 'MySQL', 'WordPress'],
        description: 'Part-time WordPress development and maintenance.',
        requirements: ['2+ years WordPress experience', 'PHP knowledge', 'HTML/CSS skills'],
        posted: '3 days ago'
      }
    ];
  }

  applyFilters() {
    this.filteredJobs = this.jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           job.company.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                           job.description.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesType = !this.selectedType || job.type === this.selectedType;
      const matchesLocation = !this.selectedLocation || job.location === this.selectedLocation;
      const matchesSalary = !this.selectedSalary || job.salary === this.selectedSalary;
      const matchesExperience = !this.selectedExperience || job.experience === this.selectedExperience;
      const matchesLanguage = !this.selectedLanguage || job.languages.includes(this.selectedLanguage);

      return matchesSearch && matchesType && matchesLocation && matchesSalary && matchesExperience && matchesLanguage;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedType = '';
    this.selectedLocation = '';
    this.selectedSalary = '';
    this.selectedExperience = '';
    this.selectedLanguage = '';
    this.applyFilters();
  }

  applyForJob(job: Job) {
    alert(`Thank you for your interest in ${job.title} at ${job.company}. Your application has been submitted!`);
  }

  getUniqueSalaryRanges(): string[] {
    return [...new Set(this.jobs.map(job => job.salary))].sort();
  }
}
