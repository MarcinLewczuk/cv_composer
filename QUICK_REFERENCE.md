# AI Integration - Quick Reference Card

## 🚀 What's Been Set Up

| Component            | Status       | Location                            |
| -------------------- | ------------ | ----------------------------------- |
| API Key              | ✅ Added     | `backend/private/.env`              |
| Claude SDK           | ✅ Installed | `node_modules/@anthropic-ai/sdk`    |
| Backend Service      | ✅ Created   | `backend/src/services/aiService.ts` |
| Backend Endpoints    | ✅ Added     | `backend/src/app.ts`                |
| Frontend Service     | ✅ Created   | `src/app/services/AIService.ts`     |
| Documentation        | ✅ Ready     | `AI_INTEGRATION.md`                 |
| Implementation Guide | ✅ Ready     | `QUICK_IMPLEMENTATION.md`           |

---

## 🔌 4 AI Endpoints Ready to Use

### 1. Generate CV

```
POST http://localhost:3000/api/cv/generate
Body: { "userInput": "user's raw information" }
Returns: { "cv": "professional CV markdown" }
```

### 2. Review CV

```
POST http://localhost:3000/api/cv/review
Body: { "cvContent": "CV text to review" }
Returns: { "review": "detailed feedback" }
```

### 3. Tailor CV for Job

```
POST http://localhost:3000/api/cv/tailor
Body: { "cvContent": "CV", "jobDescription": "job posting" }
Returns: { "tailoredCV": "customized CV" }
```

### 4. Generate Interview Questions

```
POST http://localhost:3000/api/interview/generate-questions
Body: { "cvContent": "CV", "jobDescription": "optional job posting" }
Returns: { "questions": ["Q1?", "Q2?", ...] }
```

---

## 💻 Frontend Service Methods

Import in your component:

```typescript
import { AIService } from '../../services/AIService';

constructor(private aiService: AIService) {}
```

### Available Methods:

```typescript
// Generate CV from user input
aiService.generateCV(userInput: string): Observable<{ cv: string }>

// Review a CV
aiService.reviewCV(cvContent: string): Observable<{ review: string }>

// Tailor CV for specific job
aiService.tailorCVForJob(cvContent: string, jobDescription: string): Observable<{ tailoredCV: string }>

// Generate interview practice questions
aiService.generateInterviewQuestions(cvContent: string, jobDescription?: string): Observable<{ questions: string[] }>
```

---

## 🎯 Implementation Pattern (Copy & Paste Ready)

### Step 1: Inject Service

```typescript
constructor(private aiService: AIService, private snackbar: SnackbarService) {}
```

### Step 2: Create Method

```typescript
generateCV() {
  const userInput = `Name: John\nEmail: john@example.com\nSkills: TypeScript, Angular`;

  this.aiService.generateCV(userInput).subscribe({
    next: (response) => {
      this.generatedCV = response.cv;
      this.snackbar.success('CV generated successfully!');
    },
    error: (error) => {
      this.snackbar.error('Failed to generate CV');
    }
  });
}
```

### Step 3: Add Button in Template

```html
<button (click)="generateCV()">✨ Generate with AI</button>
<div *ngIf="generatedCV">{{ generatedCV }}</div>
```

---

## 🧪 Quick Test Commands

### Test Generate Endpoint

```bash
curl -X POST http://localhost:3000/api/cv/generate \
  -H "Content-Type: application/json" \
  -d '{"userInput": "Full Name: John Doe, Email: john@example.com, Skills: TypeScript, Angular"}'
```

### Test Review Endpoint

```bash
curl -X POST http://localhost:3000/api/cv/review \
  -H "Content-Type: application/json" \
  -d '{"cvContent": "# John Doe CV\n## Skills\nTypeScript, Angular"}'
```

---

## 📁 File Quick Ref

### Backend

| File                                | What It Does                             |
| ----------------------------------- | ---------------------------------------- |
| `backend/private/.env`              | API key stored here                      |
| `backend/src/app.ts`                | 4 new POST endpoints defined             |
| `backend/src/services/aiService.ts` | Claude API integration, 4 main functions |

### Frontend

| File                            | What It Does                        |
| ------------------------------- | ----------------------------------- |
| `src/app/services/AIService.ts` | Angular HTTP service, calls backend |

### Documentation

| File                      | What It Contains                    |
| ------------------------- | ----------------------------------- |
| `AI_INTEGRATION.md`       | Complete reference guide            |
| `QUICK_IMPLEMENTATION.md` | Step-by-step Builder implementation |
| `QUICK_REFERENCE.md`      | This file!                          |

---

## ⚡ Fastest Way to Add AI Feature (5 minutes)

1. **Import AIService** in your component

   ```typescript
   import { AIService } from '../../services/AIService';
   constructor(private ai: AIService) {}
   ```

2. **Add a method**

   ```typescript
   onGenerateClick() {
     this.ai.generateCV(this.userInfo).subscribe(res => {
       this.cv = res.cv;
     });
   }
   ```

3. **Call it from template**

   ```html
   <button (click)="onGenerateClick()">Generate CV</button>
   <pre>{{ cv }}</pre>
   ```

4. **Done!** 🎉

---

## 🔐 Security Checklist

- [ ] API key added to `.env` ✅
- [ ] `.env` is in `.gitignore` (check!)
- [ ] NEVER commit `.env` to GitHub
- [ ] Before sharing: Revoke this API key, generate new one

---

## 📊 Model Details

**Model:** `claude-3-5-sonnet-20241022`

- Context window: 200K tokens
- Input cost: $3/1M tokens
- Output cost: $15/1M tokens
- Use for: General CV work, fast responses

---

## 🚨 Common Issues & Fixes

### Issue: CORS Error

**Solution:** Make sure backend is running on port 3000

```bash
npm run dev:backend
```

### Issue: "API key not found"

**Solution:** Verify `.env` has `ANTHROPIC_API_KEY=sk-ant-...`

### Issue: Response times slow

**Solution:** Normal for first request. Subsequent calls are faster due to caching.

### Issue: Getting rate limited

**Solution:** Add delay between requests, implement exponential backoff

---

## 📖 Full Documentation

For detailed explanations, examples, and architecture diagrams, see:

- **[AI_INTEGRATION.md](AI_INTEGRATION.md)** - Complete reference
- **[QUICK_IMPLEMENTATION.md](QUICK_IMPLEMENTATION.md)** - Builder component example

---

## 🎓 Next Steps

1. ✅ Backend set up (DONE)
2. ✅ Frontend service set up (DONE)
3. ⬜ Implement in Builder component (Follow QUICK_IMPLEMENTATION.md)
4. ⬜ Add Review feature
5. ⬜ Add Job tailor feature
6. ⬜ Add interview practice
7. ⬜ Save CVs to database

---

## 🆘 Need Help?

1. Check backend is running: `npm run dev:backend`
2. Check API key in `.env`
3. Test endpoint with curl command above
4. Check browser console for errors
5. Check backend terminal for logs

---

**Ready to build amazing CVs with AI!** 🚀
