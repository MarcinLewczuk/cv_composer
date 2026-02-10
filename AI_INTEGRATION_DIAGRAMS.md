# AI Integration Diagrams

## 1. AI Integration Data Flow - Review CV Action

```mermaid
graph TD
    A["👤 User"] -->|Clicks Review CV Button| B["CVEditorComponent"]
    B -->|reviewCV Method| C["Validates Form"]
    C -->|Form Valid| D["buildParsedCV"]
    D -->|Returns ParsedCV| E["AIService.reviewCV"]
    E -->|HTTP POST| F["Express Backend<br/>localhost:3000/api/cv/review"]
    F -->|Processes Request| G["ClaudeService"]
    G -->|API Call| H["Claude API<br/>claude-3-haiku"]
    H -->|Returns Review| G
    G -->|Response| F
    F -->|JSON Response| E
    E -->|Observable| B
    B -->|Subscribe next| I["Handle Response"]
    I -->|Update UI| J["aiMessage<br/>aiError"]
    J -->|Display| K["User sees Feedback"]

    style A fill:#3b82f6,color:#fff
    style B fill:#8b5cf6,color:#fff
    style E fill:#ec4899,color:#fff
    style F fill:#f59e0b,color:#fff
    style H fill:#ef4444,color:#fff
    style K fill:#10b981,color:#fff
```

---

## 2. Complete System Architecture

```mermaid
graph LR
    subgraph Frontend["Frontend - Angular"]
        direction TB
        BC["BuilderComponent<br/>(Container)"]
        BC -->|imports| CVU["CVUploadComponent<br/>(File Upload)"]
        BC -->|imports| CVE["CVEditorComponent<br/>(CV Editing + AI)"]
        CVE -->|injects| AIS["AIService<br/>(HTTP Client)"]
        CVE -->|injects| CVP["CVParseService<br/>(Local Parsing)"]
    end

    subgraph Backend["Backend - Node.js Express"]
        direction TB
        APP["Express App<br/>Port 3000"]
        APP -->|routes| PAR["Parse Endpoint<br/>POST /api/cv/parse"]
        APP -->|routes| REV["Review Endpoint<br/>POST /api/cv/review"]
        APP -->|routes| IMP["Improve Endpoint<br/>POST /api/cv/improve"]
        APP -->|routes| TAI["Tailor Endpoint<br/>POST /api/cv/tailor"]
        APP -->|routes| GEN["Questions Endpoint<br/>POST /api/cv/generate-questions"]
    end

    subgraph AI_Layer["AI Service - Claude"]
        direction TB
        CS["ClaudeService<br/>(AI Wrapper)"]
    end

    subgraph Database["Database"]
        direction TB
        MySQL["MySQL<br/>CVs Table"]
    end

    AIS -->|HTTP POST| APP
    CVU -->|File Upload| APP
    APP -->|uses| CS
    PAR -->|calls| CS
    REV -->|calls| CS
    IMP -->|calls| CS
    TAI -->|calls| CS
    GEN -->|calls| CS
    CS -->|API Call| AI_Layer
    APP -->|Operations| MySQL

    style BC fill:#8b5cf6,color:#fff
    style CVU fill:#3b82f6,color:#fff
    style CVE fill:#ec4899,color:#fff
    style AIS fill:#f59e0b,color:#000
    style APP fill:#ef4444,color:#fff
    style CS fill:#dc2626,color:#fff
```

---

## 3. All 4 AI Methods and Their Flows

```mermaid
graph TD
    CVE["CVEditorComponent<br/>cv-editor.component.ts"]

    CVE -->|Method 1| REV["reviewCV()"]
    CVE -->|Method 2| IMP["improveCV()"]
    CVE -->|Method 3| TAI["tailorCV()"]
    CVE -->|Method 4| GEN["generateQuestions()"]

    REV -->|1. Validate form| REV1["✓ Form valid"]
    REV1 -->|2. Build CV| REV2["buildParsedCV()"]
    REV2 -->|3. Call service| REV3["aiService.reviewCV"]
    REV3 -->|4. HTTP POST| REV4["/api/cv/review"]
    REV4 -->|5. Get feedback| REV5["Display Issues<br/>& Recommendations"]

    IMP -->|1. Validate form| IMP1["✓ Form valid"]
    IMP1 -->|2. Build CV| IMP2["buildParsedCV()"]
    IMP2 -->|3. Call service| IMP3["aiService.improveCV"]
    IMP3 -->|4. HTTP POST| IMP4["/api/cv/improve"]
    IMP4 -->|5. Auto-update| IMP5["updateFormWithCV()<br/>Form fields updated"]

    TAI -->|1. Validate form| TAI1["✓ Form valid"]
    TAI1 -->|2. Check job desc| TAI2["✓ Job description entered"]
    TAI2 -->|3. Build CV| TAI3["buildParsedCV()"]
    TAI3 -->|4. Call service| TAI4["aiService.tailorCVForJob"]
    TAI4 -->|5. HTTP POST| TAI5["/api/cv/tailor<br/>+ jobBrief"]
    TAI5 -->|6. Auto-update| TAI6["updateFormWithCV()<br/>Form reordered by relevance"]

    GEN -->|1. Validate form| GEN1["✓ Form valid"]
    GEN1 -->|2. Check job desc| GEN2["✓ Job description entered"]
    GEN2 -->|3. Build CV| GEN3["buildParsedCV()"]
    GEN3 -->|4. Call service| GEN4["aiService.generateInterviewQ"]
    GEN4 -->|5. HTTP POST| GEN5["/api/cv/generate-questions<br/>+ jobBrief"]
    GEN5 -->|6. Display| GEN6["Show 5-7 Questions<br/>in aiMessage"]

    style CVE fill:#ec4899,color:#fff
    style REV fill:#3b82f6,color:#fff
    style IMP fill:#3b82f6,color:#fff
    style TAI fill:#3b82f6,color:#fff
    style GEN fill:#3b82f6,color:#fff
    style REV5 fill:#10b981,color:#fff
    style IMP5 fill:#10b981,color:#fff
    style TAI6 fill:#10b981,color:#fff
    style GEN6 fill:#10b981,color:#fff
```

---

## How to View These Diagrams

### Option 1: View in GitHub

If you push this file to GitHub, the mermaid diagrams will render automatically.

### Option 2: View Locally

Use a markdown viewer that supports mermaid (VS Code with mermaid extension, Obsidian, etc.)

### Option 3: Convert to PNG/SVG

Use [Mermaid Live Editor](https://mermaid.live/) to paste these diagrams and export as images.

---

## Diagram Summaries

### Diagram 1: Data Flow

Shows the complete request/response cycle for a single AI action (Review CV)

- User interaction → Component method → Service call → Backend → Claude → Response → Display

### Diagram 2: System Architecture

Shows all 3 layers and how components connect:

- Frontend (Angular components & services)
- Backend (Express routes & Claude service)
- Database (MySQL)

### Diagram 3: All 4 AI Methods

Shows the parallel flows for each of the 4 AI actions:

- Review CV (display feedback)
- Improve CV (auto-update form)
- Tailor CV (auto-update + reorder)
- Interview Questions (display results)
