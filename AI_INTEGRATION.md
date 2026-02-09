# AI Integration Setup - Complete Guide

## Overview

Your CV Composer project now has AI-powered features using Claude 3.5 Sonnet. The integration includes:

1. **CV Generation** - Create professional CVs from user input
2. **CV Review** - Get detailed feedback and improvement suggestions
3. **CV Tailoring** - Customize CVs for specific job descriptions
4. **Interview Questions** - Generate practice interview questions

---

## Backend Setup ✅

### API Key Configuration

The API key has been added to `backend/private/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Dependencies Installed

```bash
@anthropic-ai/sdk - Claude API client
```

### Backend Files Created/Modified

#### 1. [backend/src/services/aiService.ts](backend/src/services/aiService.ts)

Core AI functions for Claude API interactions:

- `generateCV(userInput)` - Creates a professional CV
- `reviewCV(cvContent)` - Reviews and provides feedback
- `tailorCVForJob(cvContent, jobDescription)` - Tailors CV for specific jobs
- `generateInterviewQuestions(cvContent, jobDescription?)` - Generates interview questions

#### 2. [backend/src/app.ts](backend/src/app.ts) - Modified

New API endpoints added:

| Endpoint                            | Method | Purpose                       |
| ----------------------------------- | ------ | ----------------------------- |
| `/api/cv/generate`                  | POST   | Generate CV from user input   |
| `/api/cv/review`                    | POST   | Review CV and get feedback    |
| `/api/cv/tailor`                    | POST   | Tailor CV for job description |
| `/api/interview/generate-questions` | POST   | Generate interview questions  |

---

## Frontend Setup ✅

### Frontend Service Created

#### [src/app/services/AIService.ts](src/app/services/AIService.ts)

Angular service with methods matching backend endpoints:

- `generateCV(userInput)` - Call backend CV generation
- `reviewCV(cvContent)` - Call backend CV review
- `tailorCVForJob(cvContent, jobDescription)` - Call backend CV tailoring
- `generateInterviewQuestions(cvContent, jobDescription?)` - Call backend question generation

All methods return RxJS Observables for easy integration with Angular.

---

## Usage Examples

### In Your Angular Components

#### 1. Generate a CV

```typescript
import { AIService } from './services/AIService';

constructor(private aiService: AIService) {}

generateCV() {
  const userInput = `
    Full Name: John Doe
    Email: john@example.com

    Experience:
    - Senior Developer at Tech Corp (2020-2024)
      * Led team of 5 developers
      * Increased performance by 40%

    Education:
    - B.S. Computer Science, State University (2020)

    Skills: TypeScript, Angular, Node.js, MySQL
  `;

  this.aiService.generateCV(userInput).subscribe({
    next: (response) => {
      console.log('Generated CV:', response.cv);
      // Save to database or display to user
    },
    error: (error) => {
      console.error('Generation failed:', error);
    }
  });
}
```

#### 2. Review a CV

```typescript
reviewCV() {
  const cvContent = `# John Doe's CV

## Experience
- Senior Developer at Tech Corp...`;

  this.aiService.reviewCV(cvContent).subscribe({
    next: (response) => {
      console.log('CV Review:', response.review);
      // Display feedback to user
    },
    error: (error) => {
      console.error('Review failed:', error);
    }
  });
}
```

#### 3. Tailor CV for Job

```typescript
tailorCV() {
  const cvContent = `# John Doe's CV...`;
  const jobDescription = `
    We're looking for a Senior Developer with:
    - 5+ years experience
    - Strong TypeScript/React skills
    - Leadership experience
  `;

  this.aiService.tailorCVForJob(cvContent, jobDescription).subscribe({
    next: (response) => {
      console.log('Tailored CV:', response.tailoredCV);
    },
    error: (error) => {
      console.error('Tailoring failed:', error);
    }
  });
}
```

#### 4. Generate Interview Questions

```typescript
generateQuestions() {
  const cvContent = `# John Doe's CV...`;
  const jobDescription = `Senior Developer position...`; // Optional

  this.aiService.generateInterviewQuestions(cvContent, jobDescription).subscribe({
    next: (response) => {
      console.log('Interview Questions:', response.questions);
      // response.questions is an array of strings
      response.questions.forEach((q, i) => {
        console.log(`${i + 1}. ${q}`);
      });
    },
    error: (error) => {
      console.error('Question generation failed:', error);
    }
  });
}
```

---

## Testing the Integration

### Step 1: Start the Backend

```bash
npm run dev:backend
```

You should see:

```
Connected to database.
Server is running on port 3000
```

### Step 2: Test API Endpoints with curl

#### Generate CV

```bash
curl -X POST http://localhost:3000/api/cv/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userInput": "Full Name: John Doe, Experience: Senior Developer at Tech Corp, Education: BS Computer Science"
  }'
```

#### Review CV

```bash
curl -X POST http://localhost:3000/api/cv/review \
  -H "Content-Type: application/json" \
  -d '{
    "cvContent": "# John Doe\n## Experience\nSenior Developer at Tech Corp"
  }'
```

### Step 3: Start Frontend

```bash
npm run dev:frontend
```

Then integrate the AIService into your components as shown in the examples above.

---

## Next Steps

### 1. Integrate into Builder Component

Update [src/app/pages/builder/builder.component.ts](src/app/pages/builder/builder.component.ts) to:

- Accept user input through a form
- Call `aiService.generateCV()` when user clicks "Generate with AI"
- Display the generated CV

### 2. Create Review Component

Add a review feature that:

- Takes the user's CV content
- Calls `aiService.reviewCV()`
- Shows feedback in a formatted panel

### 3. Update Interview Component

Enhance [src/app/pages/interview/interview.component.ts](src/app/pages/interview/interview.component.ts) to:

- Generate questions from user's CV
- Practice interview with AI-generated questions

### 4. Store AI Results

Modify [db/schema.sql](db/schema.sql) to add tables for:

- `ai_generated_cvs` - Store CV generations
- `cv_reviews` - Store review feedback
- Store generation history and timestamps

---

## Important Security Notes

⚠️ **DO NOT** commit your API key to version control!

1. The `.env` file in `backend/private/` is typically in `.gitignore`
2. Before pushing to GitHub, **revoke** the current API key
3. Generate a new API key for production use
4. Add `.env` to `.gitignore` if not already there

Your current key should be changed immediately if this repo is shared.

---

## Troubleshooting

### CORS Errors

If you see CORS errors in browser console:

- Make sure backend is running on port 3000
- CORS is enabled in [backend/src/app.ts](backend/src/app.ts)

### API Not Responding

- Check backend is running: `npm run dev:backend`
- Verify API key is set in `.env`
- Check network tab in browser DevTools

### Claude API Rate Limits

- Anthropic has rate limits; implement exponential backoff for retries
- Consider caching results to avoid redundant API calls

---

## Architecture Summary

```
Frontend (Angular)
  ↓ HTTP Request
  AIService.ts (client-side)
  ↓ HTTP Call to localhost:3000
Backend (Express)
  ↓
  app.ts (API endpoints)
  ↓
  aiService.ts (Claude API calls)
  ↓
  @anthropic-ai/sdk
  ↓
Claude AI Server
  ↓ Response
Backend → Frontend → Display to User
```

---

## Model Information

**Model Used**: `claude-3-5-sonnet-20241022`

- Fast and powerful
- Good for text generation and analysis
- Handles CV content well
- Cost-effective for production use

---

Ready to integrate! Start with the builder component and add AI features incrementally. 🚀
