# Design Specification: Professional Readiness — Nintendo Switch Studio & Cover Letter Generator

**Date:** 2026-10-30  
**Project:** Professional-Readiness  
**Design Reference:** [Books--Apple-export-to-structured-output](file:///Users/aaronheiner/Books--Apple-export-to-structured-output)  
**Status:** Approved by User  

---

## 1. Executive Summary & Vision

The **Professional Readiness Nintendo Switch Studio** is a browser-based web application that brings the playful, tactile, and highly responsive user experience of the Nintendo Switch operating system (from `Books--Apple-export-to-structured-output`) to personal career management and job applications.

The application allows the user to maintain their **Core Master Template** (personal narrative, tone, graduation details) and an **Experience Bank** (real-world accomplishments, technical projects, business ventures) in Cloud Firestore. It powers two distinct application-tailoring workflows:
1. **Tailored AI Prompt Mode (Zero API Cost):** Generates a comprehensive, highly structured prompt—modeled after the user's master prompt in `Aboutme_coverletter`—ready to be copied and pasted straight into ChatGPT, Claude, Gemini, or DeepSeek. This keeps the user's authentic voice and avoids AI buzzwords or hallucinated skills without needing paid API keys.
2. **Word-for-Word Assembly Mode (Deterministic Output):** Dynamically replaces company names and greeting placeholders, selects checked experiences from the bank, and immediately generates a ready-to-use cover letter directly within the app.

---

## 2. Architecture & Technology Stack

### 2.1 Architecture Principles
- **Zero-Build Vanilla SPA:** Requires no npm build step, bundler (Webpack/Vite), or backend server. Opens and functions via static file serving (`python3 -m http.server`, VS Code Live Server, or Firebase Hosting).
- **Faithful Switch UI/UX:** Adopts the exact visual aesthetic, glowing cyan border animations (`switchBorderPulse`), responsive dimensions, and authentic Switch sound effects (`Popup.wav`, `User.wav`, `Klick.wav`, `News.wav`, `Home.wav`).
- **Modern Firebase SDK (v10+ via ES Modules CDN):** Loaded in browser modules directly from `https://www.gstatic.com/firebasejs/10.12.0/`.

### 2.2 Directory Layout
```
/Users/aaronheiner/Professional-Readiness/
├── index.html                 # Main Switch console viewport, carousel cards, and modal shells
├── style.css                  # Switch styling (cyan glowing border, carousel, circular buttons, split modal)
├── js/
│   ├── firebase-config.js     # Firebase app initialization with sandbox-ed1e2 configuration
│   ├── auth-manager.js        # Google Popup Sign-in, Anonymous Auth, UI auth badge updates
│   ├── db-service.js          # Firestore CRUD for master template, experiences, and generation history
│   ├── prompt-builder.js      # Word-for-Word assembler & Tailored AI prompt generator
│   └── seed-data.js           # Aaron's default master template & 8 experiences from Aboutme_coverletter
├── app.js                     # Main Switch UI controller (carousel nav, keyboard shortcuts, audio, modals)
├── firestore.rules            # Dedicated Firestore security rules file tracked in Git
├── firebase.json              # Firebase configuration for rules and hosting
├── sounds/                    # Nintendo Switch audio effects (.wav)
├── img/                       # Switch avatars, cartridge graphics, UI icons
└── docs/                      # Project design specs and implementation plans
```

---

## 3. Firebase Authentication & Firestore Configuration

### 3.1 Firebase Project Configuration
```javascript
export const firebaseConfig = {
  apiKey: "AIzaSyCyXhVv05H51JMmtZ3gQ_zSWPQ_3PIHwfk",
  authDomain: "sandbox-ed1e2.firebaseapp.com",
  projectId: "sandbox-ed1e2",
  storageBucket: "sandbox-ed1e2.firebasestorage.app",
  messagingSenderId: "741844679458",
  appId: "1:741844679458:web:a1f509886fd61398ac837b"
};
```

### 3.2 Authentication Providers
- **Google Sign-In (`signInWithPopup`)**: Primary identity method. Synchronizes user profile photo and display name to the top-left Switch avatar tray.
- **Anonymous Sign-In (`signInAnonymously`)**: Enables instant guest mode without requiring OAuth consent.
- **Session Persistence**: Default `browserLocalPersistence` maintains authentication across page refreshes.

### 3.3 Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Default lock: deny all access to unmatched paths
    match /{document=**} {
      allow read, write: if false;
    }

    // Strict user ownership: users can only read and write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{subcollection=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 3.4 Firestore Schema
```
users/{userId}/
  ├── profile (doc)
  │     ├── displayName: string
  │     ├── email: string
  │     ├── photoURL: string
  │     ├── isAnonymous: boolean
  │     └── updatedAt: timestamp
  │
  ├── masterTemplate/default (doc)
  │     ├── intro: string
  │     ├── seniorProject: string
  │     ├── learningPhilosophy: string
  │     ├── closingGoal: string
  │     ├── graduationDate: "December 2026"
  │     ├── university: "Brigham Young University–Idaho"
  │     ├── degree: "Bachelor's degree in Computer Science"
  │     ├── defaultGreeting: "Dear [Company Name] Hiring Team,"
  │     └── updatedAt: timestamp
  │
  ├── experiences/{expId} (collection of docs)
  │     ├── title: string (e.g. "Software Development — Sunny Car Detailing")
  │     ├── storyText: string
  │     ├── category: "Technical" | "Leadership" | "Data" | "Bilingual"
  │     ├── relevantFor: string[]
  │     ├── bulletPoints: string[]
  │     ├── order: number
  │     └── updatedAt: timestamp
  │
  └── savedApplications/{appId} (collection of docs)
        ├── companyName: string
        ├── role: string
        ├── jobDescription: string
        ├── mode: "ai-prompt" | "word-for-word"
        ├── selectedExperiences: string[]
        ├── generatedContent: string
        └── createdAt: timestamp
```

### 3.5 Privacy & Starter Seeding Policy
- **No Global Seeding**: New user sessions start with clean, empty databases to respect multi-tenancy privacy.
- **On-Demand Seeding for Aaron**: Under the Profile / Auth modal, an authenticated user has an "Import Master Bank" button that seeds the 8 curated experiences and master template from `Aboutme_coverletter` into their personal Firestore tree.

---

## 4. UI/UX Specification & Switch Console Layout

### 4.1 Console Frame
- **Top Row (7vh)**:
  - **Avatar & Profile**: Circle badge with hover zoom. Displays user picture or default avatar. Clicking opens the Auth & Account Modal.
  - **Status Tray**: Live system clock formatted as `HH:MM AM/PM`, Wi-Fi icon, battery indicator.
- **Active Selection Title Banner (5.5vh)**:
  - Text updates on cartridge focus with clean animation:
    - *"Application Generator: Build Tailored Prompts & Letters"*
    - *"Core Master Template: Narrative & Voice Guidelines"*
    - *"Experience Bank: Manage Career Stories & Skills"*
    - *"Resume Studio: Bullet Points & Alignment"*
    - *"Interview Prep: STAR Method & Practice Q&A"*

### 4.2 Central Carousel (5 Cartridge Cards)
Cards feature 27vh x 27vh square geometry, rounded corners (8px), subtle drop shadows, and scale on focus (scale: 1.1) with the authentic pulsing cyan border (`animation: switchBorderPulse 1s infinite`).
- **Cartridge 1: Application Generator (Active by default)**: Quick summary of current target company and generator mode.
- **Cartridge 2: Master Template**: Visual preview of core narrative paragraphs and voice parameters.
- **Cartridge 3: Experience Bank**: Count badge showing active experiences; click to open the Experience Manager.
- **Cartridge 4: Resume Studio**: Overview of resume sections and key bullet highlights.
- **Cartridge 5: Interview Prep**: Star model questions and study guide questions.

### 4.3 Circular Action Buttons Row (10vh)
Distinct 62px circular tactile buttons with color-coded icons and hover tooltips:
1. 📋 **Copy Output (Red, Key: A / Enter)**: One-click clipboard copy of the latest generated text.
2. 📖 **Split Reader / Editor (Blue, Key: X)**: Opens the side-by-side workspace modal.
3. 💾 **Download / Export (Yellow, Key: Y)**: Exports the active output as a clean `.txt` or `.md` file.
4. 🔄 **Reset Form (Grey, Key: B / Escape)**: Resets active job fields.

### 4.4 Split Reader / Live Editor Modal
Mirrors the live book reader in `Books--Apple-export-to-structured-output`:
- **Header**: Modal title, mode indicator, and close button (`Done`).
- **Left Column (Live Document Paper)**:
  - Clean Georgia serif typography for reading Word-for-Word cover letters, or monospace/markdown formatting for AI Prompts.
  - One-click copy floating badge.
- **Right Column (Live Controls)**:
  - **Generator Mode Toggle**: Segmented switch between `Tailored AI Prompt` and `Word-for-Word Letter`.
  - **Target Company Input**: Auto-replaces `[Insert Company Name]` across all text.
  - **Role Selector**: Dropdown of common tech roles + custom input field.
  - **Job Description Pasteboard**: Multi-line textarea for pasting target postings.
  - **Relevance Recommender**: Automatic tag highlighter that recommends which experiences to check based on job description keywords.
  - **Experience Inclusion Checkboxes**: Toggles individual stories from the user's Experience Bank.

---

## 5. Dual Generation Engine

### 5.1 Tailored AI Prompt Generator
Generates a structured prompt matching the proven structure of `Aboutme_coverletter`:
```markdown
# Master Cover Letter Generator Prompt

You are an expert technical resume and cover letter writer. I want you to use my master cover letter template and experience bank below to tailor a cover letter for each job application.

## INSTRUCTIONS
1. CUSTOMIZE FOR THE TARGET COMPANY ({companyName})
2. PRESERVE MY VOICE (Motivated student, natural tone, avoid buzzwords, keep original wording)
3. DISTINGUISH BETWEEN CORE CONTENT AND OPTIONAL EXPERIENCES (Select 1-3 best experiences)
4. DYNAMIC GREETING
5. REPLACE PLACEHOLDERS
6. MAINTAIN 200-300 WORDS LENGTH
7. PRIORITIZE ACCURACY (Graduation Dec 2026, no invented skills)
8. FINAL OUTPUT (Return complete ready-to-submit letter)

---

# PART 1: MY CORE MASTER TEMPLATE
{masterTemplateText}

---

# PART 2: OPTIONAL EXPERIENCE BANK
{selectedOrAllExperiencesFormatted}

---

# PART 3: EXPERIENCE SELECTION RULES
{jobTypeRulesTable}

---

# PART 4: FINAL WRITING GUIDELINES
{fourPillarsText}

---

# PART 5: TARGET JOB DETAILS / COMPANY SPECIFICATIONS
Target Company: {companyName}
Target Role: {targetRole}

Job Description:
{jobDescription}

---

**FINAL TASK:**
Using the job description above, generate the strongest possible cover letter while preserving my personal writing style, retaining my core story, and selectively integrating the most relevant examples from my experience bank.
```

### 5.2 Word-for-Word Letter Assembler
1. Injects selected greeting: `"Dear " + companyName + " Hiring Team,"`.
2. Inserts Core Master Template intro and student background.
3. Inserts checked experience paragraphs with smooth paragraph breaks.
4. Inserts Core Master Template closing paragraph with `[Insert Company Name]` replaced with `companyName`.
5. Formats clean signature with user name and contact placeholder.

---

## 6. Error Handling & Edge Cases

| Scenario | Handling Strategy |
|---|---|
| User not signed in | Gracefully fallback to Anonymous auth so all features work immediately; show Guest badge in Switch avatar. |
| Firestore offline / network error | Local caching in `localStorage` ensures drafts and inputs are never lost if connection drops. |
| Blank company name | Fallback to "your team" or prompts user with gentle Switch audio reminder (`Popup.wav`). |
| Empty job description in AI mode | Alert user that adding a job description enables AI role matching and customized experience selection. |
| Audio playback blocked by browser policy | Audio calls wrapped in `.catch(() => {})` so interface operates completely silently without JavaScript errors until user interacts. |

---

## 7. Verification & Testing Plan

1. **Visual Fidelity Verification**: Compare Nintendo Switch console frame, font families, colors, pulsing glow, and card layouts with `Books--Apple-export-to-structured-output`.
2. **Audio Verification**: Test hover sounds, card selection sounds, modal open/close sounds on click and keyboard events.
3. **Authentication Verification**:
   - Test Google Sign-in popup.
   - Test Anonymous authentication fallback.
   - Verify user display name and avatar updates in Switch top bar.
4. **Firestore CRUD & Security Rules Verification**:
   - Verify reading and writing to `users/{userId}/masterTemplate` and `users/{userId}/experiences`.
   - Verify user A cannot read or write user B's documents under `firestore.rules`.
5. **Generation Verification**:
   - Verify **Tailored AI Prompt Mode** produces valid, complete prompt with all 5 parts and pasted job description.
   - Verify **Word-for-Word Mode** replaces placeholders and joins checked experiences correctly.
   - Verify clipboard copy action works and displays visual confirmation.
