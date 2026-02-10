# Frontend AI Integration Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CV BUILDER PAGE (Web)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  BuilderComponent (Container)                            │   │
│  │  - Combines upload and editor components                 │   │
│  │  - Routes: /builder                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│         ┌────────────────┴────────────────────┐                  │
│         ▼                                      ▼                  │
│  ┌──────────────────┐              ┌──────────────────┐          │
│  │  CVUploadComp    │              │ CVEditorComponent │          │
│  │  (File Upload)   │              │   (CV Editing)    │          │
│  └──────────────────┘              └──────────────────┘          │
│         │                                      │                  │
│         │                                      │ AI Actions       │
│         │                                      │ (4 methods)      │
│         │                    ┌─────────────────┴─────────────┐   │
│         │                    │                               │   │
│         │                    ▼                               ▼   │
│         │             ┌──────────────────┐        Form Data      │
│         │             │ CVEditorComponent│        Collection    │
│         │             │  AI Methods:     │                      │
│         │             │  1. reviewCV()   │────┐                 │
│         │             │  2. improveCV()  │    │                 │
│         │             │  3. tailorCV()   │    │                 │
│         │             │  4. generateQ()  │    │                 │
│         │             └──────────────────┘    │                 │
│         │                                      │                 │
│         └──────────────────────────────────────┴───────┐         │
│                                                         │         │
└─────────────────────────────────────────────────────────┼─────────┘
                                                          │
                                            ┌─────────────▼──────────┐
                                            │   AIService            │
                                            │  (HTTP Client)         │
                                            │                        │
                                            │ Methods:               │
                                            │ - parseCV()            │
                                            │ - reviewCV()           │
                                            │ - improveCV()          │
                                            │ - tailorCVForJob()     │
                                            │ - generateinterviewQ() │
                                            └─────────────┬──────────┘
                                                          │
                                                          │
                                    ┌─────────────────────▼──────────────┐
                                    │  Backend Express API               │
                                    │  (localhost:3000)                  │
                                    │                                    │
                                    │ Endpoints:                         │
                                    │ POST /api/cv/parse                 │
                                    │ POST /api/cv/review                │
                                    │ POST /api/cv/improve               │
                                    │ POST /api/cv/tailor                │
                                    │ POST /api/cv/generate-questions    │
                                    └─────────────────────┬──────────────┘
                                                          │
                                            ┌─────────────▼──────────┐
                                            │  Claude API            │
                                            │  (Anthropic)           │
                                            │                        │
                                            │ Model: claude-3-haiku  │
                                            └────────────────────────┘
```

---

## Component Breakdown

### 1. **BuilderComponent** (Container)

**File:** `src/app/pages/builder/builder.component.ts`

**Role:** Entry point for the CV Builder feature

- Combines the upload and editor components
- Handles the overall page layout
- Route: `/builder`

**Key Imports:**

```typescript
imports: [CommonModule, CVUploadComponent, CVEditorComponent];
```

---

### 2. **CVUploadComponent** (File Upload)

**File:** `src/app/pages/builder/cv-upload.component.ts`

**Role:** Handles file uploads and parsing

- Allows users to upload PDF, DOCX, DOC, or TXT files
- Converts files to text and sends to backend `/api/cv/parse`
- Displays uploaded files
- Uses `FileUploadService` for the upload logic

**Key Features:**

```typescript
- onFileSelected()        // File input handler
- handleFileUpload()      // Upload and parse logic
- FileRecord interface    // Tracks uploaded files
```

**Flow:**

```
User selects file
  → Validates file type
  → Upload to backend
  → Backend converts to text
  → Backend calls Claude API
  → Returns parsed CV structure
  → Display in editor
```

---

### 3. **CVEditorComponent** (Main AI Integration)

**File:** `src/app/pages/builder/cv-editor.component.ts`

**Role:** Core component with all AI features

- Displays edit form with CV sections
- Contains 4 AI action buttons
- Handles form updates from AI improvements

**AI Features & Methods:**

#### **a) reviewCV()** 📋

```typescript
reviewCV() {
  // 1. Validates form
  // 2. Builds ParsedCV from form
  // 3. Calls: this.aiService.reviewCV(cvData)
  // 4. Shows feedback: issues & recommendations
  // 5. Updates aiMessage with results
}
```

**Endpoint Called:** `POST /api/cv/review`
**Input:** Parsed CV JSON
**Output:** Review feedback with issues and recommendations

---

#### **b) improveCV()** ✨

```typescript
improveCV() {
  // 1. Validates form
  // 2. Builds ParsedCV from form
  // 3. Calls: this.aiService.improveCV(cvData)
  // 4. Automatically updates form with improved text
  // 5. Uses: this.updateFormWithCV(response.data)
}
```

**Endpoint Called:** `POST /api/cv/improve`
**Input:** Parsed CV JSON
**Output:** Enhanced CV with better language/formatting
**Action:** Auto-updates form fields

---

#### **c) tailorCV()** 🎯

```typescript
tailorCV() {
  // 1. Validates form
  // 2. Requires job description input
  // 3. Builds ParsedCV from form
  // 4. Calls: this.aiService.tailorCVForJob(cvData, jobBrief)
  // 5. Reorders experience by job relevance
  // 6. Auto-updates form with tailored version
}
```

**Endpoint Called:** `POST /api/cv/tailor`
**Input:**

- Parsed CV JSON
- Job description text
  **Output:** Reordered/emphasized CV matching job
  **Action:** Auto-updates form fields

---

#### **d) generateQuestions()** ❓

```typescript
generateQuestions() {
  // 1. Validates form
  // 2. Requires job description input
  // 3. Builds ParsedCV from form
  // 4. Calls: this.aiService.generateInterviewQuestions(cvData, jobBrief)
  // 5. Returns array of interview questions
  // 6. Displays in modal/message box
}
```

**Endpoint Called:** `POST /api/cv/generate-questions`
**Input:**

- Parsed CV JSON
- Job description text
  **Output:** Array of 5-7 practice interview questions
  **Action:** Displays for user review

---

## Data Flow Diagram

### Flow for "Improve CV" Action:

```
1. User clicks "Improve Language" button
   └─> improveCV() method triggered

2. buildParsedCV() converts form to API format
   Form Data:
   {
     fullName: "John Doe",
     email: "john@example.com",
     experiences: [{...}],
     educations: [{...}],
     skills: [...]
   }

   └─> ParsedCV:
   {
     personalInfo: { name, email, phone, location },
     summary: string,
     experience: [...],
     education: [...],
     skills: [...]
   }

3. AIService.improveCV(cvData)
   └─> HTTP POST /api/cv/improve
       Request Body: { cvJson: ParsedCV }

4. Backend receives request
   └─> Claude API processes
       └─> Enhanced CV returned

5. Subscribe to response
   next: (response) {
     if (response.success) {
       updateFormWithCV(response.data)
       └─> Update all form fields with improved text
     }
   }

6. User sees updated CV in form
   └─> All fields refreshed with AI improvements
```

---

## Component Communication

### Where AI is Called - The Call Stack:

```
HTML Template
└─> (click)="improveCV()"
    └─> CVEditorComponent.improveCV()
        ├─> buildParsedCV()  // Convert form to API format
        ├─> aiService.improveCV(cvData)  // HTTP POST
        │   └─> AIService (injectable service)
        │       └─> this.http.post(URL, body)
        │           └─> HTTP Request to Backend
        │               └─> Express Server Port 3000
        │                   └─> Claude API
        │
        └─> subscribe(response)
            └─> Handle response
            └─> updateFormWithCV()  // Update UI
```

---

## Component Dependency Injection

```typescript
// CVEditorComponent constructor
constructor(
  private fb: FormBuilder,              // Angular forms
  private cvParseService: CVParseService,  // Local parsing
  private aiService: AIService          // ← AI API calls
) {}
```

**AIService** is responsible for all HTTP communication with backend:

```typescript
// AIService (src/app/services/AIService.ts)
@Injectable({ providedIn: 'root' })
export class AIService {
  private apiUrl = 'http://localhost:3000/api/cv';

  constructor(private http: HttpClient) {}

  reviewCV(cvJson: ParsedCV): Observable<ReviewCVResponse> {
    return this.http.post(`${this.apiUrl}/review`, { cvJson });
  }

  improveCV(cvJson: ParsedCV): Observable<ImproveCVResponse> {
    return this.http.post(`${this.apiUrl}/improve`, { cvJson });
  }

  tailorCVForJob(cvJson: ParsedCV, jobBrief: string): Observable<TailorCVResponse> {
    return this.http.post(`${this.apiUrl}/tailor`, { cvJson, jobBrief });
  }

  generateInterviewQuestions(
    cvJson: ParsedCV,
    jobBrief: string,
  ): Observable<GenerateQuestionsResponse> {
    return this.http.post(`${this.apiUrl}/generate-questions`, { cvJson, jobBrief });
  }
}
```

---

## UI State Management

### CV Editor Component State:

```typescript
// Loading state
aiLoading: boolean = false; // Shows "Processing with AI..."

// Message states
aiMessage: string = ''; // Success messages
aiError: string = ''; // Error messages

// User input
jobDescriptionInput: string = ''; // Job description textarea
```

### Message Display Flow:

```
1. User clicks action button
   └─> Clear messages: aiMessage = '', aiError = ''
   └─> Set loading: aiLoading = true

2. HTTP Request in progress
   └─> Show: "⏳ Processing with AI..."

3. Response received
   └─> Set loading: aiLoading = false

   If success:
   └─> Set aiMessage with results
   └─> Update form if needed

   If error:
   └─> Set aiError with error message
```

---

## HTML Template Structure (cv-editor.component.html)

```html
<!-- Main form -->
<form [formGroup]="cvForm" (ngSubmit)="onSubmit()">
  <!-- Form sections (Personal, Experience, Education, etc.) -->
  <div class="form-sections">
    <!-- Collapsible sections for each CV part -->
  </div>

  <!-- AI Section Starts Here -->
  <div class="ai-section">
    <!-- Job Description Input -->
    <div class="job-description">
      <textarea [(ngModel)]="jobDescriptionInput" placeholder="Paste job description..."></textarea>
    </div>

    <!-- Loading State -->
    <div *ngIf="aiLoading">⏳ Processing with AI...</div>

    <!-- Success Messages -->
    <div *ngIf="aiMessage && !aiLoading">{{ aiMessage }}</div>

    <!-- Error Messages -->
    <div *ngIf="aiError">❌ {{ aiError }}</div>

    <!-- AI Action Buttons Grid -->
    <div class="button-grid">
      <button (click)="reviewCV()" [disabled]="aiLoading">📋 Review CV</button>
      <button (click)="improveCV()" [disabled]="aiLoading">✨ Improve Language</button>
      <button (click)="tailorCV()" [disabled]="aiLoading">🎯 Tailor for Job</button>
      <button (click)="generateQuestions()" [disabled]="aiLoading">❓ Interview Prep</button>
    </div>
  </div>

  <!-- Submit Button -->
  <button type="submit">Save CV</button>
</form>
```

---

## Request/Response Examples

### Example 1: Review CV

```javascript
// REQUEST
POST /api/cv/review
{
  "cvJson": {
    "personalInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0100",
      "location": "New York"
    },
    "experience": [{...}],
    "education": [{...}],
    "skills": ["TypeScript", "Angular", "Node.js"]
  }
}

// RESPONSE
{
  "success": true,
  "message": "CV reviewed successfully",
  "data": {
    "isValid": true,
    "structureIssues": [],
    "styleIssues": ["Consider using action verbs"],
    "recommendations": [
      "Add metrics to experience section",
      "Format dates consistently"
    ]
  }
}
```

### Example 2: Tailor for Job

```javascript
// REQUEST
POST /api/cv/tailor
{
  "cvJson": {...},
  "jobBrief": "Senior Full Stack Developer. Requirements: 5+ years TypeScript, Node.js, React, AWS"
}

// RESPONSE
{
  "success": true,
  "message": "CV tailored successfully",
  "data": {
    // Same ParsedCV structure but reordered by relevance
    "experience": [
      // Most relevant job first
      {...relevant_experience},
      {...less_relevant_experience}
    ]
  }
}
```

---

## Summary Table

| Component             | Purpose        | AI Methods   | Calls Endpoint            |
| --------------------- | -------------- | ------------ | ------------------------- |
| **BuilderComponent**  | Page container | None         | -                         |
| **CVUploadComponent** | File upload    | None         | `/api/cv/parse` (backend) |
| **CVEditorComponent** | CV editing     | 4 AI methods | Yes, via AIService        |
| **AIService**         | HTTP bridge    | 5 methods    | All `/api/cv/*` endpoints |

---

## Key Takeaways

1. **AIService** is the bridge between frontend and backend
2. **CVEditorComponent** contains all AI action methods
3. Each method calls `AIService` which makes HTTP request
4. Backend at `localhost:3000` processes with Claude API
5. Responses update the form in real-time
6. Job description input enables "Tailor" and "Interview Prep" features
7. All AI calls show loading state, success, or error messages
