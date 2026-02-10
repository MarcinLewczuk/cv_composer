# Frontend AI Integration - Code Locations & Execution Flow

## Quick Reference: Where Everything Happens

### 1. User Clicks AI Button (HTML)

**File:** `src/app/pages/builder/cv-editor.component.html` (Line 420-450)

```html
<!-- Review Button -->
<button (click)="reviewCV()" [disabled]="aiLoading">📋 Review CV</button>

<!-- Improve Button -->
<button (click)="improveCV()" [disabled]="aiLoading">✨ Improve Language</button>

<!-- Tailor Button -->
<button (click)="tailorCV()" [disabled]="aiLoading">🎯 Tailor for Job</button>

<!-- Interview Questions Button -->
<button (click)="generateQuestions()" [disabled]="aiLoading">❓ Interview Prep</button>
```

---

### 2. Method Gets Called (TypeScript)

**File:** `src/app/pages/builder/cv-editor.component.ts`

#### Example: reviewCV() Method (Line 270-290)

```typescript
reviewCV() {
  // Step 1: Validate form is filled
  if (!this.cvForm.valid) {
    this.aiError = 'Please fill in all required fields before reviewing';
    return;
  }

  // Step 2: Clear previous messages
  this.clearMessages();

  // Step 3: Set loading state
  this.aiLoading = true;

  // Step 4: Build ParsedCV from form
  const cvData = this.buildParsedCV();

  // Step 5: Call AIService (HTTP request)
  this.aiService.reviewCV(cvData).subscribe({
    next: (response) => {
      this.aiLoading = false;
      if (response.success) {
        // Step 6: Display results
        this.aiMessage = `✅ Review Complete!...`;
      } else {
        this.aiError = response.message;
      }
    },
    error: (error) => {
      this.aiLoading = false;
      this.aiError = error.error?.message || 'Failed to review CV';
    }
  });
}
```

---

### 3. buildParsedCV() Helper (TypeScript)

**File:** `src/app/pages/builder/cv-editor.component.ts` (Line 250-270)

```typescript
private buildParsedCV(): ParsedCV {
  // Converts Angular Form to our API format
  const formValue = this.cvForm.value;

  return {
    personalInfo: {
      name: formValue.fullName,
      email: formValue.email,
      phone: formValue.phone,
      location: formValue.location
    },
    summary: formValue.summary,
    experience: formValue.experiences || [],
    education: formValue.educations || [],
    skills: formValue.skills || [],
    certifications: formValue.certifications
  };
}
```

**Input:** Form Data

```javascript
{
  fullName: "John Doe"
  email: "john@example.com"
  phone: "+1-555-0100"
  location: "New York, NY"
  experiences: [
    { company: "Tech Corp", position: "Senior Dev", ... }
  ]
  educations: [
    { institution: "State U", degree: "B.S.", ... }
  ]
  skills: ["TypeScript", "Angular", "Node.js"]
}
```

**Output:** Mapped ParsedCV

```javascript
{
  personalInfo: { name, email, phone, location }
  summary: "..."
  experience: [...]
  education: [...]
  skills: [...]
  certifications: [...]
}
```

---

### 4. AIService Makes HTTP Request

**File:** `src/app/services/AIService.ts` (Line 120-135)

```typescript
@Injectable({ providedIn: 'root' })
export class AIService {
  private apiUrl = 'http://localhost:3000/api/cv';

  constructor(private http: HttpClient) {}

  reviewCV(cvJson: ParsedCV): Observable<ReviewCVResponse> {
    // HTTP POST request
    return this.http.post<ReviewCVResponse>(
      `${this.apiUrl}/review`, // URL: localhost:3000/api/cv/review
      { cvJson }, // Request body
    );
  }

  improveCV(cvJson: ParsedCV): Observable<ImproveCVResponse> {
    return this.http.post<ImproveCVResponse>(`${this.apiUrl}/improve`, { cvJson });
  }

  tailorCVForJob(cvJson: ParsedCV, jobBrief: string): Observable<TailorCVResponse> {
    return this.http.post<TailorCVResponse>(
      `${this.apiUrl}/tailor`,
      { cvJson, jobBrief }, // Two parameters
    );
  }

  generateInterviewQuestions(
    cvJson: ParsedCV,
    jobBrief: string,
  ): Observable<GenerateQuestionsResponse> {
    return this.http.post<GenerateQuestionsResponse>(
      `${this.apiUrl}/generate-questions`,
      { cvJson, jobBrief }, // Two parameters
    );
  }
}
```

---

### 5. Backend Receives Request

**File:** `backend/src/app.ts` & `backend/src/controllers/cvController.ts`

#### Request arrives at:

- **URL:** `POST http://localhost:3000/api/cv/review`
- **Route Handler:** `reviewCVHandler` from cvController

```typescript
// backend/src/app.ts (Line ~150)
app.post('/api/cv/review', reviewCVHandler);
app.post('/api/cv/improve', improveCVHandler);
app.post('/api/cv/tailor', tailorCVHandler);
app.post('/api/cv/generate-questions', generateQuestionsHandler);
```

#### Controller processes it:

```typescript
// backend/src/controllers/cvController.ts
export const reviewCVHandler = async (req: Request, res: Response) => {
  try {
    const { cvJson } = req.body; // Extract CV data

    // Call Claude service
    const reviewResult = await reviewCV(cvJson);

    // Send response back
    res.json({
      success: true,
      message: 'CV reviewed successfully',
      data: reviewResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to review CV',
      error: error.message,
    });
  }
};
```

---

### 6. Backend Calls Claude API

**File:** `backend/src/services/claudeService.ts`

```typescript
export const reviewCV = async (cvJson: ParsedCVStructure): Promise<ReviewResult> => {
  try {
    // Step 1: Create message for Claude
    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307', // Claude model
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Review this CV against professional standards...`,
        },
      ],
    });

    // Step 2: Parse Claude's response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const parsed = JSON.parse(responseText);

    // Step 3: Return structured result
    return {
      isValid: parsed.isValid,
      structureIssues: parsed.structureIssues,
      styleIssues: parsed.styleIssues,
      recommendations: parsed.recommendations,
    };
  } catch (error) {
    throw new Error(`Claude Review Error: ${error.message}`);
  }
};
```

---

### 7. Response Returns to Frontend

**Backend Response:**

```javascript
{
  "success": true,
  "message": "CV reviewed successfully",
  "data": {
    "isValid": true,
    "structureIssues": [],
    "styleIssues": ["Missing metrics in experience"],
    "recommendations": [
      "Add quantifiable achievements",
      "Use action verbs",
      "Include relevant certifications"
    ]
  }
}
```

---

### 8. Frontend Displays Results

**File:** `src/app/pages/builder/cv-editor.component.ts` (subscribe handler)

```typescript
this.aiService.reviewCV(cvData).subscribe({
  next: (response) => {
    this.aiLoading = false; // Stop showing spinner

    if (response.success) {
      // Format message for display
      this.aiMessage = `✅ Review Complete!
      
Issues Found: ${response.data.structureIssues.length + response.data.styleIssues.length}

Recommendations:
${response.data.recommendations.join('\n')}`;
    } else {
      this.aiError = response.message;
    }
  },
  error: (error) => {
    this.aiLoading = false;
    this.aiError = error.error?.message || 'Failed to review CV';
  },
});
```

**What the user sees in HTML:**

```html
<!-- Display success message -->
<div *ngIf="aiMessage && !aiLoading" class="bg-green-50 p-4 rounded">
  <p class="whitespace-pre-wrap">{{ aiMessage }}</p>
</div>

<!-- Display error message -->
<div *ngIf="aiError" class="bg-red-50 p-4 rounded">
  <p>❌ {{ aiError }}</p>
</div>
```

---

## Request/Response for Each AI Action

### 1. Review CV

```
Button Clicked   → reviewCV()
                 → aiService.reviewCV(cvData)
                 → POST /api/cv/review
                 → Claude reviews
                 ← Returns: issues, recommendations
                 → Display feedback
```

### 2. Improve CV

```
Button Clicked   → improveCV()
                 → aiService.improveCV(cvData)
                 → POST /api/cv/improve
                 → Claude improves language
                 ← Returns: enhanced CV
                 → updateFormWithCV(improvedData)
                 → Form fields auto-update
```

### 3. Tailor for Job

```
Button Clicked   → tailorCV()
                 → Check: form valid ✓ + job desc entered ✓
                 → aiService.tailorCVForJob(cvData, jobBrief)
                 → POST /api/cv/tailor + job description
                 → Claude reorders experience by relevance
                 ← Returns: tailored CV
                 → updateFormWithCV(tailoredData)
                 → Form fields reordered
                 → jobDescriptionInput = '' (cleared)
```

### 4. Generate Interview Questions

```
Button Clicked   → generateQuestions()
                 → Check: form valid ✓ + job desc entered ✓
                 → aiService.generateInterviewQuestions(cvData, jobBrief)
                 → POST /api/cv/generate-questions + job description
                 → Claude generates 5-7 questions
                 ← Returns: string[] of questions
                 → Format and display
                 → User sees numbered list
```

---

## Component State Flow

### Before Action:

```typescript
aiLoading: false
aiMessage: ''
aiError: ''
jobDescriptionInput: '' (user can enter here)
cvForm: { filled with user data }
```

### During Action:

```typescript
aiLoading: true; // ← Shows "⏳ Processing with AI..."
aiMessage: '';
aiError: '';
// User cannot click buttons (disabled: [disabled]="aiLoading")
```

### After Success:

```typescript
aiLoading: false;
aiMessage: 'Results from AI'; // ← User sees green box
aiError: '';
// Form fields may be updated (for Improve/Tailor)
```

### After Error:

```typescript
aiLoading: false;
aiMessage: '';
aiError: 'Error message'; // ← User sees red box
```

---

## Files Involved Summary

| File                         | Purpose                      | Key Methods                                                                     |
| ---------------------------- | ---------------------------- | ------------------------------------------------------------------------------- |
| `cv-editor.component.ts`     | Main component with AI logic | `reviewCV()`, `improveCV()`, `tailorCV()`, `generateQuestions()`                |
| `cv-editor.component.html`   | UI with buttons and messages | Button clicks, loading/error display                                            |
| `AIService.ts`               | HTTP bridge to backend       | `reviewCV()`, `improveCV()`, `tailorCVForJob()`, `generateInterviewQuestions()` |
| `builder.component.ts`       | Page container               | Imports both upload and editor                                                  |
| `cvController.ts` (backend)  | Request handlers             | `reviewCVHandler`, `improveCVHandler`, etc.                                     |
| `claudeService.ts` (backend) | Claude API wrapper           | `reviewCV()`, `improveCV()`, etc.                                               |

---

## Quick Checklist: What Happens When User Clicks Button

- [ ] Button click triggers method (e.g., `reviewCV()`)
- [ ] Form is validated
- [ ] `buildParsedCV()` converts form to API format
- [ ] `aiService.METHOD(cvData)` makes HTTP POST
- [ ] `aiLoading = true` shows spinner
- [ ] Request travels to backend
- [ ] Backend calls Claude API
- [ ] Response comes back
- [ ] `aiLoading = false` hides spinner
- [ ] `aiMessage` or `aiError` set
- [ ] User sees result on screen
- [ ] Form may auto-update (if Improve/Tailor)
