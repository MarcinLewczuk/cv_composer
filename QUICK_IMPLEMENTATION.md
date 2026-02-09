# Quick Implementation Guide - AI CV Builder

This guide shows exactly how to add AI CV generation to your Builder component in 5 minutes.

## Step 1: Update Builder Component TypeScript

Replace the content of [src/app/pages/builder/builder.component.ts](src/app/pages/builder/builder.component.ts) with:

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AIService } from '../../services/AIService';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.css'],
})
export class BuilderComponent {
  // Form data
  fullName: string = '';
  email: string = '';
  phone: string = '';

  experiences: Array<{ company: string; position: string; duration: string; description: string }> =
    [];
  educations: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationYear: string;
  }> = [];
  skills: string[] = [];
  summary: string = '';

  // UI flags
  isGenerating: boolean = false;
  generatedCV: string = '';
  showGenerated: boolean = false;

  constructor(private aiService: AIService) {}

  /**
   * Collect all form data and send to AI for CV generation
   */
  generateWithAI(): void {
    // Validate required fields
    if (!this.fullName || !this.email) {
      alert('Please fill in at least your name and email');
      return;
    }

    // Format data as readable input for AI
    const userInput = this.formatUserInput();

    this.isGenerating = true;

    this.aiService.generateCV(userInput).subscribe({
      next: (response) => {
        this.generatedCV = response.cv;
        this.showGenerated = true;
        this.isGenerating = false;
      },
      error: (error) => {
        console.error('CV generation failed:', error);
        alert('Failed to generate CV. Please try again.');
        this.isGenerating = false;
      },
    });
  }

  /**
   * Format form data into readable text for AI
   */
  private formatUserInput(): string {
    let input = `Full Name: ${this.fullName}\n`;
    input += `Email: ${this.email}\n`;
    if (this.phone) input += `Phone: ${this.phone}\n`;
    if (this.summary) input += `Professional Summary: ${this.summary}\n`;

    if (this.experiences.length > 0) {
      input += '\nWork Experience:\n';
      this.experiences.forEach((exp) => {
        input += `- ${exp.position} at ${exp.company} (${exp.duration})\n`;
        input += `  ${exp.description}\n`;
      });
    }

    if (this.educations.length > 0) {
      input += '\nEducation:\n';
      this.educations.forEach((edu) => {
        input += `- ${edu.degree} in ${edu.field} from ${edu.institution}`;
        if (edu.graduationYear) input += ` (${edu.graduationYear})`;
        input += '\n';
      });
    }

    if (this.skills.length > 0) {
      input += `\nSkills: ${this.skills.join(', ')}\n`;
    }

    return input;
  }

  /**
   * Add a new experience entry
   */
  addExperience(): void {
    this.experiences.push({
      company: '',
      position: '',
      duration: '',
      description: '',
    });
  }

  /**
   * Remove an experience entry
   */
  removeExperience(index: number): void {
    this.experiences.splice(index, 1);
  }

  /**
   * Add a new education entry
   */
  addEducation(): void {
    this.educations.push({
      institution: '',
      degree: '',
      field: '',
      graduationYear: '',
    });
  }

  /**
   * Remove an education entry
   */
  removeEducation(index: number): void {
    this.educations.splice(index, 1);
  }

  /**
   * Add a skill
   */
  addSkill(): void {
    this.skills.push('');
  }

  /**
   * Remove a skill
   */
  removeSkill(index: number): void {
    this.skills.splice(index, 1);
  }

  /**
   * Copy generated CV to clipboard
   */
  copyToClipboard(): void {
    navigator.clipboard.writeText(this.generatedCV);
    alert('CV copied to clipboard!');
  }

  /**
   * Download generated CV as text file
   */
  downloadCV(): void {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(this.generatedCV),
    );
    element.setAttribute('download', `${this.fullName.replace(/\s+/g, '_')}_CV.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}
```

## Step 2: Update Builder Component HTML

Replace [src/app/pages/builder/builder.component.html](src/app/pages/builder/builder.component.html) with:

```html
<div class="container mx-auto p-6 max-w-4xl">
  <h1 class="text-4xl font-bold mb-8">AI CV Builder</h1>

  <!-- Main Form Section -->
  <div class="bg-white rounded-lg shadow-md p-6 mb-6" *ngIf="!showGenerated">
    <!-- Personal Information -->
    <div class="mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-blue-600">Personal Information</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2">Full Name *</label>
          <input
            type="text"
            [(ngModel)]="fullName"
            placeholder="John Doe"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Email *</label>
          <input
            type="email"
            [(ngModel)]="email"
            placeholder="john@example.com"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium mb-2">Phone</label>
          <input
            type="tel"
            [(ngModel)]="phone"
            placeholder="+1 (555) 123-4567"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Professional Summary</label>
        <textarea
          [(ngModel)]="summary"
          placeholder="Describe your professional background and key achievements..."
          rows="4"
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>
    </div>

    <!-- Work Experience -->
    <div class="mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-blue-600">Work Experience</h2>

      <div
        *ngFor="let exp of experiences; let i = index"
        class="mb-6 p-4 border-l-4 border-blue-500 bg-gray-50"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-2">Company</label>
            <input
              type="text"
              [(ngModel)]="exp.company"
              placeholder="Tech Corp"
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Position</label>
            <input
              type="text"
              [(ngModel)]="exp.position"
              placeholder="Senior Developer"
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-2">Duration</label>
            <input
              type="text"
              [(ngModel)]="exp.duration"
              placeholder="2020-2024"
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Description</label>
          <textarea
            [(ngModel)]="exp.description"
            placeholder="Key accomplishments and responsibilities..."
            rows="3"
            class="w-full px-4 py-2 border rounded-lg"
          ></textarea>
        </div>

        <button (click)="removeExperience(i)" class="text-red-600 hover:text-red-800 font-medium">
          Remove
        </button>
      </div>

      <button
        (click)="addExperience()"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
      >
        + Add Experience
      </button>
    </div>

    <!-- Education -->
    <div class="mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-blue-600">Education</h2>

      <div
        *ngFor="let edu of educations; let i = index"
        class="mb-6 p-4 border-l-4 border-green-500 bg-gray-50"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-2">Institution</label>
            <input
              type="text"
              [(ngModel)]="edu.institution"
              placeholder="University Name"
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Degree</label>
            <input
              type="text"
              [(ngModel)]="edu.degree"
              placeholder="B.S."
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-2">Field of Study</label>
            <input
              type="text"
              [(ngModel)]="edu.field"
              placeholder="Computer Science"
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Graduation Year</label>
            <input
              type="text"
              [(ngModel)]="edu.graduationYear"
              placeholder="2020"
              class="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <button (click)="removeEducation(i)" class="text-red-600 hover:text-red-800 font-medium">
          Remove
        </button>
      </div>

      <button
        (click)="addEducation()"
        class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
      >
        + Add Education
      </button>
    </div>

    <!-- Skills -->
    <div class="mb-8">
      <h2 class="text-2xl font-semibold mb-4 text-blue-600">Skills</h2>

      <div class="flex flex-wrap gap-3 mb-4">
        <div *ngFor="let skill of skills; let i = index" class="flex items-center gap-2">
          <input
            type="text"
            [(ngModel)]="skill"
            placeholder="e.g., TypeScript"
            class="px-4 py-2 border rounded-lg w-48"
          />
          <button (click)="removeSkill(i)" class="text-red-600 hover:text-red-800 font-medium">
            ✕
          </button>
        </div>
      </div>

      <button
        (click)="addSkill()"
        class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium"
      >
        + Add Skill
      </button>
    </div>

    <!-- Generate Button -->
    <div class="flex gap-4">
      <button
        (click)="generateWithAI()"
        [disabled]="isGenerating"
        class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-bold text-lg disabled:opacity-50"
      >
        <span *ngIf="!isGenerating">✨ Generate CV with AI</span>
        <span *ngIf="isGenerating">Generating...</span>
      </button>
    </div>
  </div>

  <!-- Generated CV Display -->
  <div *ngIf="showGenerated" class="bg-white rounded-lg shadow-md p-6">
    <div class="flex gap-4 mb-6">
      <button
        (click)="showGenerated = false"
        class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 font-medium"
      >
        ← Back to Edit
      </button>
      <button
        (click)="copyToClipboard()"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
      >
        📋 Copy
      </button>
      <button
        (click)="downloadCV()"
        class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
      >
        ⬇️ Download
      </button>
    </div>

    <div
      class="bg-gray-100 p-6 rounded-lg whitespace-pre-wrap font-mono text-sm border-2 border-gray-300"
      [innerHTML]="generatedCV"
    ></div>
  </div>

  <!-- Loading Spinner -->
  <div *ngIf="isGenerating" class="flex justify-center items-center min-h-96">
    <div class="text-center">
      <mat-spinner diameter="50"></mat-spinner>
      <p class="mt-4 text-gray-600 font-medium">Generating your CV with AI...</p>
    </div>
  </div>
</div>
```

## Step 3: Update Styles

Add to [src/app/pages/builder/builder.component.css](src/app/pages/builder/builder.component.css):

```css
:host {
  display: block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 2rem 0;
}

.container {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

input:focus,
textarea:focus {
  background-color: #f0f9ff;
}

button:disabled {
  cursor: not-allowed;
}
```

## Step 4: Verify It Works

1. **Start the backend:**

   ```bash
   npm run dev:backend
   ```

2. **Start the frontend:**

   ```bash
   npm run dev:frontend
   ```

3. **Navigate to:** `http://localhost:4200/builder`

4. **Test it:**
   - Fill in your information
   - Click "Generate CV with AI"
   - Wait for Claude to generate your CV
   - Copy or download the result

---

## What Happens Internally

```
User fills form → Click "Generate CV with AI"
         ↓
Component collects data → formatUserInput()
         ↓
AIService.generateCV(userInput)
         ↓
HTTP POST to http://localhost:3000/api/cv/generate
         ↓
Backend aiService.ts calls Claude API
         ↓
Claude generates professional CV
         ↓
Response sent back to Frontend
         ↓
Generated CV displayed in component
         ↓
User can copy or download
```

---

## Next Enhancements

After this basic setup works, you can add:

1. **CV Review Feature:**

   ```typescript
   reviewCV() {
     this.aiService.reviewCV(this.generatedCV).subscribe(response => {
       this.review = response.review;
     });
   }
   ```

2. **Job Tailoring:**
   - Add input field for job description
   - Call `aiService.tailorCVForJob()`

3. **Save to Database:**
   - Create new backends endpoints to save CVs
   - Store generated CVs in `cvs` table
   - Allow users to view history

---

Done! 🎉 Your AI CV Builder is ready to use!
