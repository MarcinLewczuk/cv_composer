# CV AI Integration - Testing Guide

## Testing with cURL or Postman

### 1. Parse CV (Text to JSON)

```bash
curl -X POST http://localhost:3000/api/cv/parse \
  -H "Content-Type: application/json" \
  -d '{
    "cvText": "John Doe\njohn@example.com\n+1-555-0100\nNew York, NY\n\nProfessional Summary:\nExperienced software engineer with 5+ years of fullstack development.\n\nWork Experience:\nSenior Developer at Tech Corp (2020-2024)\n- Led a team of 5 developers\n- Increased application performance by 40%\n- Delivered 15+ projects on time\n\nEducation:\nB.S. Computer Science\nState University\n2020\n\nSkills:\nTypeScript, Angular, Node.js, MySQL, MongoDB, React, Docker\n\nCertifications:\nCertified Kubernetes Administrator\nLinux Foundation\n2022"
  }'
```

**Response:** Returns parsed CV with `cacheKey` for next steps

```json
{
  "success": true,
  "message": "CV parsed successfully",
  "data": {
    "parsedCV": {
      "personalInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        ...
      },
      "experience": [...],
      "education": [...],
      "skills": [...]
    },
    "cacheKey": "cv_1707432000000_abc123"
  }
}
```

---

### 2. Review CV

Use either the parsed CV directly or the cacheKey:

**Option A: Using cacheKey (right after parse)**

```bash
curl -X POST http://localhost:3000/api/cv/review \
  -H "Content-Type: application/json" \
  -d '{
    "cacheKey": "cv_1707432000000_abc123"
  }'
```

**Option B: Using cvJson directly**

```bash
curl -X POST http://localhost:3000/api/cv/review \
  -H "Content-Type: application/json" \
  -d '{
    "cvJson": {
      "personalInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1-555-0100",
        "location": "New York, NY"
      },
      "summary": "Experienced software engineer...",
      "experience": [...],
      "education": [...],
      "skills": [...]
    }
  }'
```

**Response:** Review results with structure and style issues

```json
{
  "success": true,
  "message": "CV review completed",
  "data": {
    "isValid": true,
    "structureIssues": [],
    "styleIssues": [],
    "recommendations": ["Consider adding more metrics", "..."],
    "summary": "CV is well-structured..."
  }
}
```

---

### 3. Improve CV

```bash
curl -X POST http://localhost:3000/api/cv/improve \
  -H "Content-Type: application/json" \
  -d '{
    "cvJson": {
      "personalInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1-555-0100",
        "location": "New York, NY"
      },
      "experience": [
        {
          "company": "Tech Corp",
          "position": "Senior Developer",
          "duration": "2020-2024",
          "description": "Led a team of 5 developers. Increased application performance by 40%."
        }
      ],
      "education": [
        {
          "institution": "State University",
          "degree": "B.S.",
          "field": "Computer Science",
          "graduationYear": "2020"
        }
      ],
      "skills": ["TypeScript", "Angular", "Node.js"]
    }
  }'
```

**Response:** Improved CV with better language and structure

```json
{
  "success": true,
  "message": "CV improved successfully",
  "data": {
    "personalInfo": {...},
    "experience": [
      {
        "company": "Tech Corp",
        "position": "Senior Developer",
        "duration": "2020-2024",
        "description": "Directed a high-performing engineering team of 5 developers, driving technical excellence..."
      }
    ]
  }
}
```

---

### 4. Tailor CV for Job

```bash
curl -X POST http://localhost:3000/api/cv/tailor \
  -H "Content-Type: application/json" \
  -d '{
    "cvJson": {
      "personalInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1-555-0100"
      },
      "experience": [...],
      "education": [...],
      "skills": ["TypeScript", "Angular", "Node.js", "Python", "AWS"]
    },
    "jobBrief": "We are seeking a Senior Full Stack Developer with:\n- 5+ years of experience\n- Strong TypeScript/Node.js skills\n- Angular or React experience\n- AWS cloud expertise\n- Team leadership experience\n\nResponsibilities:\n- Design and implement scalable backend systems\n- Build responsive frontend interfaces\n- Mentor junior developers\n- Participate in architecture decisions"
  }'
```

**Response:** Tailored CV emphasizing matching skills

```json
{
  "success": true,
  "message": "CV tailored for job successfully",
  "data": {
    "personalInfo": {...},
    "experience": [
      {
        "company": "Tech Corp",
        "position": "Senior Developer",
        "duration": "2020-2024",
        "description": "Architected and implemented scalable backend systems on AWS... Mentored a team of 5 junior developers..."
      }
    ],
    "skills": ["TypeScript", "Node.js", "Angular", "AWS", "Python"]
  }
}
```

---

### 5. Generate Interview Questions

```bash
curl -X POST http://localhost:3000/api/cv/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "cvJson": {
      "personalInfo": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "experience": [{...}],
      "education": [{...}],
      "skills": ["TypeScript", "Angular", "Node.js"]
    },
    "jobBrief": "Senior Full Stack Developer position..."
  }'
```

**Response:** Array of tailored interview questions

```json
{
  "success": true,
  "message": "Interview questions generated successfully",
  "data": {
    "questions": [
      "Tell me about your experience leading the team of 5 developers at Tech Corp.",
      "How did you achieve the 40% performance improvement mentioned in your CV?",
      "Describe your approach to mentoring junior developers.",
      "How have you used AWS in your previous projects?",
      "Walk us through a complex architectural decision you made."
    ],
    "count": 5
  }
}
```

---

### 6. Save CV (Requires Authentication)

```bash
curl -X POST http://localhost:3000/api/cv/save \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_AUTH_TOKEN" \
  -d '{
    "originalContent": "John Doe\njohn@example.com\n...",
    "cvJson": {
      "personalInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1-555-0100",
        "location": "New York, NY"
      },
      "experience": [{...}],
      "education": [{...}],
      "skills": ["TypeScript", "Angular", "Node.js"]
    }
  }'
```

---

### 7. Get User CVs

```bash
curl -X GET http://localhost:3000/api/cv \
  -H "Cookie: auth_token=YOUR_AUTH_TOKEN"
```

---

### 8. Get Specific CV

```bash
curl -X GET http://localhost:3000/api/cv/1 \
  -H "Cookie: auth_token=YOUR_AUTH_TOKEN"
```

---

### 9. Delete CV

```bash
curl -X DELETE http://localhost:3000/api/cv/1 \
  -H "Cookie: auth_token=YOUR_AUTH_TOKEN"
```

---

## Postman Collection

Import this as a Postman collection for easier testing:

```json
{
  "info": {
    "name": "CV AI Integration",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Parse CV",
      "request": {
        "method": "POST",
        "header": ["Content-Type: application/json"],
        "url": "http://localhost:3000/api/cv/parse",
        "body": {
          "raw": "json"
        }
      }
    },
    {
      "name": "Review CV",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/cv/review"
      }
    },
    {
      "name": "Improve CV",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/cv/improve"
      }
    }
  ]
}
```

---

## Quick Test Workflow

1. **Parse** → Get cacheKey
2. **Review** → Use cacheKey, see if CV is valid
3. **Improve** → Use cacheKey, get improved version
4. **Tailor** → Add job description, get tailored CV
5. **Questions** → Generate interview prep questions
6. **Save** → Save final CV to database (requires auth)

---

## Expected Response Format

All endpoints return:

```json
{
  "success": true|false,
  "message": "Descriptive message",
  "data": "...",
  "error": "Error code if success is false"
}
```

---

## Troubleshooting

- **401 Unauthorized**: No auth token provided (for save/get CVs endpoints)
- **400 Bad Request**: Missing required fields
- **500 Server Error**: Check backend logs, likely Claude API issue
- **INVALID_INPUT**: Malformed request body

Check backend console for detailed error logs!
