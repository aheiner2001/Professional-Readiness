# Nintendo Switch Studio Cover Letter Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-build, client-side Nintendo Switch OS-styled web application in `Professional-Readiness` with Firebase Auth and Firestore for tailoring cover letters and AI prompts.

**Architecture:** Vanilla HTML5/CSS3/ES6 single page application mirroring the visual, audio, and modal interactions of `Books--Apple-export-to-structured-output`. Interacts directly with Cloud Firestore and Firebase Auth using ES module CDN imports. Contains dedicated `firestore.rules` and dual generation engines (Tailored AI Prompt and Word-for-Word assembler).

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+ Modules), Firebase SDK v10 (CDN), FontAwesome 6, Nintendo Switch audio assets (.wav), Node.js for automated unit testing.

## Global Constraints

- **Zero-Build Requirement**: Pure HTML5, CSS3, and ES6 modules; runs immediately in any browser or static server without Webpack, Vite, or npm build steps.
- **Visual Design Parity**: Exact visual parity with `Books--Apple-export-to-structured-output`: cyan glowing pulse borders (`#62EFDF` to `#1b98c6`), 27vh carousel cards, 62px circular tactile buttons, authentic Switch sounds.
- **Audio Feedback**: Support `Popup.wav`, `User.wav`, `Klick.wav`, `News.wav`, and `Home.wav` with error-suppressed audio playback.
- **Firebase Project ID**: `sandbox-ed1e2` with Web App ID `1:741844679458:web:a1f509886fd61398ac837b`.
- **User Privacy & Security**: No global seeding; all Firestore documents strictly scoped under `/users/{userId}/...`; rules documented in `firestore.rules`.
- **Voice Preservation**: Generation engine preserves BYU–Idaho graduation (Dec 2026), computer science student identity, and forbids hallucinated credentials.

---

### Task 1: Environment Scaffolding, Audio Assets & Firebase Security Rules

**Files:**
- Create: `/Users/aaronheiner/Professional-Readiness/firebase.json`
- Create: `/Users/aaronheiner/Professional-Readiness/firestore.rules`
- Create: `/Users/aaronheiner/Professional-Readiness/package.json`
- Copy: `/Users/aaronheiner/Professional-Readiness/sounds/*` from `/Users/aaronheiner/Books--Apple-export-to-structured-output/sounds/`
- Test: `/Users/aaronheiner/Professional-Readiness/test/test-scaffold.js`

**Interfaces:**
- Produces: `firestore.rules` for Cloud Firestore rule deployment.
- Produces: `sounds/` directory with playable `.wav` files.
- Produces: `package.json` with `"type": "module"` and test scripts.

- [ ] **Step 1: Write the failing scaffold test**

Create `test/test-scaffold.js`:
```javascript
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('Running Task 1 Scaffold & Rules Tests...');

// 1. Verify firestore.rules exists and contains strict user isolation
const rulesPath = path.join(rootDir, 'firestore.rules');
assert.ok(fs.existsSync(rulesPath), 'firestore.rules must exist');
const rulesContent = fs.readFileSync(rulesPath, 'utf8');
assert.ok(rulesContent.includes("rules_version = '2'"), 'Rules must use version 2');
assert.ok(rulesContent.includes("allow read, write: if request.auth != null && request.auth.uid == userId"), 'Rules must require matching uid');

// 2. Verify sound files exist and are non-empty
const soundFiles = ['Popup.wav', 'User.wav', 'Klick.wav', 'News.wav', 'Home.wav'];
soundFiles.forEach(sound => {
  const soundPath = path.join(rootDir, 'sounds', sound);
  assert.ok(fs.existsSync(soundPath), `Sound file ${sound} must exist`);
  const stats = fs.statSync(soundPath);
  assert.ok(stats.size > 1000, `Sound file ${sound} must have valid content (>1000 bytes)`);
});

// 3. Verify firebase.json exists and references firestore.rules
const fbConfigPath = path.join(rootDir, 'firebase.json');
assert.ok(fs.existsSync(fbConfigPath), 'firebase.json must exist');
const fbConfig = JSON.parse(fs.readFileSync(fbConfigPath, 'utf8'));
assert.strictEqual(fbConfig.firestore.rules, 'firestore.rules');

console.log('✓ Task 1 tests passed successfully!');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node /Users/aaronheiner/Professional-Readiness/test/test-scaffold.js`  
Expected: FAIL (files missing).

- [ ] **Step 3: Implement scaffold files, rules, and copy sound assets**

1. Create `package.json`:
```json
{
  "name": "professional-readiness-studio",
  "version": "1.0.0",
  "type": "module",
  "description": "Nintendo Switch Style Professional Readiness Studio with Firebase",
  "scripts": {
    "test": "node test/test-scaffold.js && node test/test-prompt-builder.js && node test/test-seed-data.js"
  }
}
```

2. Create `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Deny access by default
    match /{document=**} {
      allow read, write: if false;
    }

    // Allow authenticated users to only read and write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{subcollection=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3. Create `firebase.json`:
```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "firestore.rules",
      "**/.*",
      "test/**",
      "docs/**"
    ]
  }
}
```

4. Copy audio files from `/Users/aaronheiner/Books--Apple-export-to-structured-output/sounds/` to `/Users/aaronheiner/Professional-Readiness/sounds/`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node /Users/aaronheiner/Professional-Readiness/test/test-scaffold.js`  
Expected: PASS.

- [ ] **Step 5: Commit changes**

```bash
cd /Users/aaronheiner/Professional-Readiness
git add package.json firestore.rules firebase.json sounds/ test/test-scaffold.js
git commit -m "feat: scaffold firebase rules, configuration, and sound assets"
```

---

### Task 2: Dual Generation Engine & Keyword Scorer

**Files:**
- Create: `/Users/aaronheiner/Professional-Readiness/js/prompt-builder.js`
- Create: `/Users/aaronheiner/Professional-Readiness/test/test-prompt-builder.js`

**Interfaces:**
- Produces:
  - `buildTailoredAIPrompt({ companyName, role, jobDescription, masterTemplate, experiences, selectedExperienceIds })`: returns string
  - `buildWordForWordLetter({ companyName, role, masterTemplate, experiences, selectedExperienceIds, greeting })`: returns string
  - `matchKeywords(jobDescription, experiences)`: returns array of matching experience IDs sorted by relevance score

- [ ] **Step 1: Write the failing prompt builder tests**

Create `test/test-prompt-builder.js`:
```javascript
import assert from 'node:assert';
import {
  buildTailoredAIPrompt,
  buildWordForWordLetter,
  matchKeywords
} from '../js/prompt-builder.js';

console.log('Running Task 2 Prompt Builder & Generation Engine Tests...');

const mockTemplate = {
  intro: "I am currently a student at Brigham Young University–Idaho, projected to graduate in December 2026 with a bachelor's degree in Computer Science.",
  seniorProject: "During my senior year, I built and deployed a software tool for Sunny Car Detailing.",
  learningPhilosophy: "I am a quick learner who thrives on the job.",
  closingGoal: "I am looking for an opportunity where I can grow, which is why [Insert Company Name] would be a great fit."
};

const mockExperiences = [
  {
    id: "sunny",
    title: "Software Development — Sunny Car Detailing",
    category: "Technical",
    storyText: "Built fleet management tool using TypeScript, Firebase, and Vercel.",
    relevantFor: ["TypeScript", "Firebase", "Frontend", "Full-stack"],
    bulletPoints: ["Automated deployment", "Vercel pipelines"]
  },
  {
    id: "downwinders",
    title: "Data Migration — Downwinders Advocates",
    category: "Data",
    storyText: "Transitioned records between software platforms using Python scripts.",
    relevantFor: ["Python", "Pandas", "SQL", "Data Migration"],
    bulletPoints: ["CSV & JSON processing", "Error troubleshooting"]
  },
  {
    id: "chile",
    title: "Spanish Fluency — Chile Experience",
    category: "Bilingual",
    storyText: "Lived in Chile for two years and became fluent in conversational Spanish.",
    relevantFor: ["Spanish", "Bilingual", "Communication"],
    bulletPoints: ["Cross-cultural adaptability"]
  }
];

// Test 1: buildTailoredAIPrompt
const promptOutput = buildTailoredAIPrompt({
  companyName: "Google",
  role: "Software Engineer",
  jobDescription: "Looking for an engineer with TypeScript and Firebase experience.",
  masterTemplate: mockTemplate,
  experiences: mockExperiences,
  selectedExperienceIds: ["sunny"]
});

assert.ok(promptOutput.includes("# Master Cover Letter Generator Prompt"), "Should contain master prompt header");
assert.ok(promptOutput.includes("Google"), "Should contain target company name");
assert.ok(promptOutput.includes("Software Engineer"), "Should contain target role");
assert.ok(promptOutput.includes("Brigham Young University–Idaho"), "Should include core narrative");
assert.ok(promptOutput.includes("Sunny Car Detailing"), "Should include selected experience");
assert.ok(promptOutput.includes("Looking for an engineer with TypeScript and Firebase"), "Should include job description");

// Test 2: buildWordForWordLetter
const letterOutput = buildWordForWordLetter({
  companyName: "Acme Corp",
  role: "Software Engineer",
  masterTemplate: mockTemplate,
  experiences: mockExperiences,
  selectedExperienceIds: ["sunny"],
  greeting: "Dear Acme Corp Hiring Team,"
});

assert.ok(letterOutput.startsWith("Dear Acme Corp Hiring Team,"), "Should begin with greeting");
assert.ok(letterOutput.includes("Acme Corp would be a great fit"), "Should replace [Insert Company Name]");
assert.ok(!letterOutput.includes("[Insert Company Name]"), "Should have zero unfilled company placeholders");
assert.ok(letterOutput.includes("Sunny Car Detailing"), "Should include selected experience story");

// Test 3: matchKeywords
const matchedIds = matchKeywords("We need an engineer experienced with Python, SQL, and data migration", mockExperiences);
assert.strictEqual(matchedIds[0], "downwinders", "Downwinders should be top match for Python/SQL job description");

console.log('✓ Task 2 prompt builder tests passed successfully!');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node /Users/aaronheiner/Professional-Readiness/test/test-prompt-builder.js`  
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `js/prompt-builder.js`**

Create `js/prompt-builder.js`:
```javascript
/**
 * Professional Readiness - Prompt & Cover Letter Generator Engine
 */

export function buildTailoredAIPrompt({
  companyName = "the target company",
  role = "the position",
  jobDescription = "",
  masterTemplate,
  experiences = [],
  selectedExperienceIds = []
}) {
  const chosenExperiences = selectedExperienceIds.length > 0
    ? experiences.filter(exp => selectedExperienceIds.includes(exp.id))
    : experiences;

  const experienceBankFormatted = chosenExperiences.map((exp, idx) => {
    const letterCode = String.fromCharCode(65 + idx);
    const tags = (exp.relevantFor || []).join(", ");
    const bullets = (exp.bulletPoints || []).map(b => `- ${b}`).join("\n");
    return `## ${letterCode}. ${exp.title}
**Relevant for:** ${tags}

"${exp.storyText}"

Key takeaways:
${bullets}
`;
  }).join("\n---\n\n");

  const coreTemplateText = `"${masterTemplate.intro || ''}\n\n${masterTemplate.seniorProject || ''}\n\n${masterTemplate.learningPhilosophy || ''}\n\n${(masterTemplate.closingGoal || '').replace(/\[Insert Company Name\]/g, companyName)}"`;

  return `# Master Cover Letter Generator Prompt

You are an expert technical resume and cover letter writer. I want you to use my master cover letter template and experience bank below to tailor a cover letter for each job application.

## INSTRUCTIONS

**1. CUSTOMIZE FOR THE TARGET COMPANY**
Read the job description carefully. Identify the most important skills, qualifications, responsibilities, and company values.
Use these details to customize my cover letter for ${companyName} (${role}) without changing my core narrative or making the letter sound like it was copied from the job description.

**2. PRESERVE MY VOICE**
This is extremely important. Keep my personal voice, sentence structure, and tone largely intact.
I want to sound like a motivated college student who has practical experience and enjoys learning, not someone using overly polished corporate language.
- Avoid buzzwords and generic AI-generated phrases.
- Do not exaggerate my experience or qualifications.
- Use natural, conversational transitions.
- Make small grammatical improvements where necessary.
- Keep my original wording whenever it works.
- Avoid unnecessary filler and overly complicated sentences.

**3. DISTINGUISH BETWEEN CORE CONTENT AND OPTIONAL EXPERIENCES**
My master template contains the core story I want to communicate in every application.
My experience bank contains additional accomplishments, skills, and personal experiences that may or may not be appropriate for a particular position.
When generating a letter:
- Always preserve the primary message from my core template.
- Review every experience in my experience bank.
- Select approximately 1–3 of the most relevant optional experiences for the job.
- Prioritize experiences that directly demonstrate qualifications mentioned in the job description.
- Integrate the selected experiences naturally into the existing paragraphs.
- You may replace a less relevant example from the master template with a stronger example from the experience bank.
- Do not force every experience into the letter.
- Do not simply list qualifications. Explain their relevance through my actual experience.

**4. DYNAMIC GREETING**
Adapt the greeting to the company and application (e.g., "Dear ${companyName} Hiring Team,").

**5. REPLACE PLACEHOLDERS**
Replace "[Insert Company Name]" throughout the letter with "${companyName}".

**6. MAINTAIN AN APPROPRIATE LENGTH**
Aim for approximately 200–300 words, or slightly longer if necessary. Keep it concise, direct, and meaningful.

**7. PRIORITIZE ACCURACY**
Never invent projects, certifications, responsibilities, technologies, or accomplishments. Do not imply I have already graduated before December 2026.
If I have limited experience with a particular technology, emphasize my related experience and willingness to learn rather than pretending I am an expert.

**8. FINAL OUTPUT**
Return a complete, ready-to-submit cover letter.
Do not include explanations of what you changed unless specifically requested.

---

# PART 1: MY CORE MASTER TEMPLATE
${coreTemplateText}

---

# PART 2: OPTIONAL EXPERIENCE BANK
${experienceBankFormatted || "No additional experiences selected."}

---

# PART 3: EXPERIENCE SELECTION RULES
| Job Type | Experiences to Prioritize |
|---|---|
| Software Engineer | Sunny Car Detailing, software development, databases, quick learning |
| Data Analyst | Python, Pandas, SQL, data migration, relational databases |
| Data Engineer | Databases, cloud services, data pipelines, migration |
| Operations Engineer | Troubleshooting, data validation, SQL, dependability |
| QA / Testing | Sunny Car Detailing, testing, debugging, quality assurance |
| DevOps / Cloud | AWS, Firebase, deployment pipelines, GitHub Actions |
| Customer Success | Business ownership, customer communication, Spanish fluency |
| Remote Position | Online coursework, time management, independent work |

---

# PART 4: FINAL WRITING GUIDELINES
Every letter should communicate four things:
1. **Who I am:** A Computer Science student finishing my degree at BYU–Idaho in December 2026 who enjoys building tools and solving problems.
2. **What I've done:** Relevant software, technical, business, or personal experiences that demonstrate my qualifications.
3. **How I work:** Dependable, self-motivated, quick to learn, and willing to take responsibility for my work.
4. **Why I'm applying:** I want to contribute meaningful work, continue learning, and grow alongside experienced professionals at ${companyName}.

---

# PART 5: TARGET JOB DETAILS / COMPANY SPECIFICATIONS
**Target Company:** ${companyName}
**Target Role:** ${role}

**Job Description:**
${jobDescription || "[No job description provided]"}

---

**FINAL TASK:**
Using the job description above, generate the strongest possible cover letter for ${companyName} while preserving my personal writing style, retaining my core story, and selectively integrating the most relevant examples from my experience bank.`;
}

export function buildWordForWordLetter({
  companyName = "Company",
  role = "Applicant",
  masterTemplate,
  experiences = [],
  selectedExperienceIds = [],
  greeting = `Dear ${companyName} Hiring Team,`
}) {
  const chosenExperiences = experiences.filter(exp => selectedExperienceIds.includes(exp.id));

  const intro = masterTemplate.intro || "";
  const seniorProject = masterTemplate.seniorProject || "";
  const learning = masterTemplate.learningPhilosophy || "";
  const closing = (masterTemplate.closingGoal || "").replace(/\[Insert Company Name\]/g, companyName);

  const experienceParagraphs = chosenExperiences.map(exp => exp.storyText).join("\n\n");

  const letterSections = [
    greeting,
    intro,
    seniorProject,
    experienceParagraphs,
    learning,
    closing,
    "Sincerely,\nAaron Heiner"
  ].filter(section => section && section.trim().length > 0);

  return letterSections.join("\n\n");
}

export function matchKeywords(jobDescription = "", experiences = []) {
  if (!jobDescription || experiences.length === 0) return [];
  const lowerJob = jobDescription.toLowerCase();

  const scored = experiences.map(exp => {
    let score = 0;
    const keywords = [
      ...(exp.relevantFor || []),
      ...(exp.bulletPoints || []),
      exp.title,
      exp.category
    ].map(k => k.toLowerCase());

    keywords.forEach(kw => {
      if (kw && lowerJob.includes(kw)) {
        score += 2;
      }
    });

    return { id: exp.id, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.id);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node /Users/aaronheiner/Professional-Readiness/test/test-prompt-builder.js`  
Expected: PASS.

- [ ] **Step 5: Commit changes**

```bash
cd /Users/aaronheiner/Professional-Readiness
git add js/prompt-builder.js test/test-prompt-builder.js
git commit -m "feat: implement dual generation engine and keyword scorer"
```

---

### Task 3: Starter Seed Data & Firestore Database Service

**Files:**
- Create: `/Users/aaronheiner/Professional-Readiness/js/seed-data.js`
- Create: `/Users/aaronheiner/Professional-Readiness/js/db-service.js`
- Create: `/Users/aaronheiner/Professional-Readiness/test/test-seed-data.js`

**Interfaces:**
- Produces: `getAaronStarterData()` returning default master template and 8 experience items parsed from `Aboutme_coverletter`.
- Produces: `createDbService(firestore)` with methods:
  - `getMasterTemplate(userId)`
  - `saveMasterTemplate(userId, templateData)`
  - `getExperiences(userId)`
  - `saveExperience(userId, experienceData)`
  - `deleteExperience(userId, expId)`
  - `seedUserStarterData(userId)`

- [ ] **Step 1: Write the failing seed data and db service tests**

Create `test/test-seed-data.js`:
```javascript
import assert from 'node:assert';
import { getAaronStarterData } from '../js/seed-data.js';
import { createMockDbService } from '../js/db-service.js';

console.log('Running Task 3 Seed Data & Database Service Tests...');

// 1. Verify starter data contains all 8 experiences and master template
const starterData = getAaronStarterData();
assert.ok(starterData.masterTemplate, 'Starter data must contain masterTemplate');
assert.ok(starterData.masterTemplate.intro.includes('Brigham Young University–Idaho'));
assert.strictEqual(starterData.experiences.length, 8, 'Must contain all 8 experiences from Aboutme_coverletter');

const expTitles = starterData.experiences.map(e => e.title);
assert.ok(expTitles.some(t => t.includes('Fresh Paint Solutions')), 'Must have Fresh Paint');
assert.ok(expTitles.some(t => t.includes('Sunny Car Detailing')), 'Must have Sunny Detailing');
assert.ok(expTitles.some(t => t.includes('Downwinders Advocates')), 'Must have Downwinders');
assert.ok(expTitles.some(t => t.includes('Chile')), 'Must have Chile experience');

// 2. Verify mock db service CRUD logic
const mockDb = createMockDbService();
const uid = "user_test_123";

// Initial state is empty for new user
const initialTemplate = await mockDb.getMasterTemplate(uid);
assert.strictEqual(initialTemplate, null, 'New user should start empty');

// Seed starter data on demand
await mockDb.seedUserStarterData(uid);
const seededTemplate = await mockDb.getMasterTemplate(uid);
assert.ok(seededTemplate && seededTemplate.intro.length > 0, 'Seeded template should exist');

const experiences = await mockDb.getExperiences(uid);
assert.strictEqual(experiences.length, 8, 'Seeded experiences should be 8 items');

console.log('✓ Task 3 seed data tests passed successfully!');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node /Users/aaronheiner/Professional-Readiness/test/test-seed-data.js`  
Expected: FAIL.

- [ ] **Step 3: Implement `js/seed-data.js` and `js/db-service.js`**

1. Create `js/seed-data.js`:
```javascript
/**
 * Aaron's Authentic Master Template & Experience Bank Data
 * Extracted directly from Aboutme_coverletter
 */

export function getAaronStarterData() {
  return {
    masterTemplate: {
      intro: "I am currently a student at Brigham Young University–Idaho, projected to graduate in December 2026 with a bachelor's degree in Computer Science. Throughout my life, I've enjoyed creating, designing, and implementing new tools to help solve problems that I encounter.",
      seniorProject: "During my senior year at the university, I have been able to build and deploy software for local businesses, including a project for Sunny Car Detailing where I migrated records for hundreds of users and set up an automated deployment pipeline using GitHub Actions and Vercel. I constantly work with data, managing production and deployment pipelines while taking precautions to protect company data. Through my internships, including my time with Downwinders Advocates, I have handled data transitions between software systems, exported complex data, and troubleshot pipeline errors.",
      learningPhilosophy: "I am a quick learner who thrives on the job. Whatever I am doing professionally, I take pride in finding resources that help me rise to a higher level every day. Once I start a project, I stay fully engaged; even after the initial work is done, I keep thinking in the back of my mind about how to improve it.",
      closingGoal: "I am looking for an opportunity where I can grow, which is why I feel like [Insert Company Name] would be a great fit. Here, I would be able to build real tools under professional guidance and work alongside experienced engineers who can help me grow in a professional way.",
      graduationDate: "December 2026",
      university: "Brigham Young University–Idaho",
      defaultGreeting: "Dear [Company Name] Hiring Team,"
    },
    experiences: [
      {
        id: "fresh-paint",
        title: "Leadership, Business Ownership, and Customer Relations — Fresh Paint Solutions",
        category: "Leadership",
        storyText: "I spent three years working as a crew leader and managing my own business, Fresh Paint Solutions. Through this experience, I worked directly with customers and learned the importance of communication, setting clear expectations, and making sure the job was completed correctly. I learned how important it is to be dependable and take responsibility for the work I do.",
        relevantFor: ["Leadership", "Operations", "Customer Success", "Consulting", "Project Management"],
        bulletPoints: [
          "Leadership and accountability",
          "Customer relationships and communication",
          "Quality assurance and meeting expectations",
          "Problem-solving in real-world situations"
        ],
        order: 1
      },
      {
        id: "remote-coursework",
        title: "Self-Motivation, Remote Work, and Time Management — BYU-Idaho",
        category: "Work Ethic",
        storyText: "Throughout my time at BYU–Idaho, I have completed multiple semesters of coursework online, which has helped me become very comfortable working independently and managing my time. I've learned how to stay motivated, organize my responsibilities, and balance multiple projects while continuing to learn new skills.",
        relevantFor: ["Remote Work", "Hybrid", "Time Management", "Self-Motivation"],
        bulletPoints: [
          "Remote work readiness",
          "Time management & independent learning",
          "Balancing competing priorities"
        ],
        order: 2
      },
      {
        id: "chile-bilingual",
        title: "Spanish Fluency and International Experience — Chile",
        category: "Bilingual",
        storyText: "I lived in Chile for two years, where I became fluent in conversational Spanish. That experience taught me how to communicate with people from different backgrounds and adapt to new environments. I'm comfortable communicating in Spanish and learning job-specific terminology when needed.",
        relevantFor: ["Spanish", "Bilingual", "Customer Support", "Cross-cultural Communication"],
        bulletPoints: [
          "Conversational Spanish fluency",
          "Cross-cultural adaptability",
          "Interpersonal communication"
        ],
        order: 3
      },
      {
        id: "databases-cloud",
        title: "Databases and Cloud Platforms — AWS, Firebase, MySQL",
        category: "Technical",
        storyText: "Through my coursework and software projects, I've gained experience working with different types of databases and cloud services, including AWS, Firebase, and relational databases such as MySQL. I've enjoyed learning the differences between these systems, understanding their strengths, and finding which approach works best for a particular project.",
        relevantFor: ["AWS", "Firebase", "Firestore", "SQL", "MySQL", "Cloud Infrastructure"],
        bulletPoints: [
          "AWS (DynamoDB, Lambda)",
          "Firebase & Firestore",
          "Relational databases and SQL design"
        ],
        order: 4
      },
      {
        id: "sunny-detailing",
        title: "Software Development and Deployment — Sunny Car Detailing",
        category: "Technical",
        storyText: "During my senior year, I worked on building and deploying a fleet management application for Sunny Car Detailing. This included working with TypeScript, Firebase, GitHub Actions, and Vercel to develop features, manage data, and maintain the application. I've enjoyed seeing how different technologies come together to create a tool that people can actually use.",
        relevantFor: ["TypeScript", "Next.js", "Firebase", "GitHub Actions", "Vercel", "Full-stack"],
        bulletPoints: [
          "Fleet management web application",
          "Automated deployment workflows",
          "Data management and integrations"
        ],
        order: 5
      },
      {
        id: "downwinders-migration",
        title: "Data Migration and Troubleshooting — Downwinders Advocates",
        category: "Data",
        storyText: "During my internship with Downwinders Advocates, I worked on transitioning information between different software platforms. This involved organizing data, exporting and formatting records, working through integration issues, and troubleshooting errors to ensure the data was transferred correctly.",
        relevantFor: ["Data Migration", "Data Cleaning", "Python Scripts", "Troubleshooting", "Integrations"],
        bulletPoints: [
          "Data cleaning and transformation",
          "Python scripts for CSV/JSON processing",
          "Troubleshooting pipeline errors"
        ],
        order: 6
      },
      {
        id: "python-sql-analytics",
        title: "Python, SQL, and Data Analysis",
        category: "Data",
        storyText: "I've worked with Python, Pandas, and SQL through my coursework and personal projects, where I've learned how to organize, transform, and work with different types of data. I enjoy finding ways to make repetitive processes more efficient and using data to better understand and solve problems.",
        relevantFor: ["Python", "Pandas", "SQL", "Data Analysis", "Automation"],
        bulletPoints: [
          "Python data pipelines & automation",
          "Pandas & BigQuery",
          "CSV/JSON processing and reports"
        ],
        order: 7
      },
      {
        id: "adapting-quickly",
        title: "Learning New Technologies and Adapting Quickly",
        category: "Growth",
        storyText: "One of the strengths I bring to a team is that I am dependable and quick to learn. I know that I am still early in my career, but I've found that when I am given a new challenge, I can research what I need, learn the tools, and work toward a solution. I enjoy the process of figuring things out and becoming better at what I do.",
        relevantFor: ["Entry-Level", "Startups", "Adaptability", "Fast Learner"],
        bulletPoints: [
          "Independent technical research",
          "Rapid adoption of new libraries and frameworks",
          "Strong accountability"
        ],
        order: 8
      }
    ]
  };
}
```

2. Create `js/db-service.js`:
```javascript
/**
 * Cloud Firestore Database Service
 * Handles CRUD operations scoped strictly by userId
 */

import { getAaronStarterData } from './seed-data.js';

// In-memory mock service for Node unit testing
export function createMockDbService() {
  const store = new Map();

  return {
    async getMasterTemplate(userId) {
      return store.get(`users/${userId}/masterTemplate/default`) || null;
    },
    async saveMasterTemplate(userId, templateData) {
      store.set(`users/${userId}/masterTemplate/default`, { ...templateData, updatedAt: Date.now() });
      return true;
    },
    async getExperiences(userId) {
      const exps = [];
      const prefix = `users/${userId}/experiences/`;
      for (const [key, val] of store.entries()) {
        if (key.startsWith(prefix)) {
          exps.push(val);
        }
      }
      return exps.sort((a, b) => (a.order || 0) - (b.order || 0));
    },
    async saveExperience(userId, experienceData) {
      const id = experienceData.id || `exp_${Date.now()}`;
      const record = { ...experienceData, id, updatedAt: Date.now() };
      store.set(`users/${userId}/experiences/${id}`, record);
      return record;
    },
    async deleteExperience(userId, expId) {
      store.delete(`users/${userId}/experiences/${expId}`);
      return true;
    },
    async seedUserStarterData(userId) {
      const starter = getAaronStarterData();
      await this.saveMasterTemplate(userId, starter.masterTemplate);
      for (const exp of starter.experiences) {
        await this.saveExperience(userId, exp);
      }
      return true;
    }
  };
}

// Live Firestore client service for browser execution
export function createFirestoreService(db, firestoreFns) {
  const { doc, getDoc, setDoc, collection, getDocs, deleteDoc } = firestoreFns;

  return {
    async getMasterTemplate(userId) {
      if (!userId) return null;
      try {
        const ref = doc(db, 'users', userId, 'masterTemplate', 'default');
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data() : null;
      } catch (err) {
        console.error("Error fetching master template:", err);
        return null;
      }
    },

    async saveMasterTemplate(userId, templateData) {
      if (!userId) return false;
      const ref = doc(db, 'users', userId, 'masterTemplate', 'default');
      await setDoc(ref, { ...templateData, updatedAt: Date.now() }, { merge: true });
      return true;
    },

    async getExperiences(userId) {
      if (!userId) return [];
      try {
        const colRef = collection(db, 'users', userId, 'experiences');
        const snap = await getDocs(colRef);
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        return list.sort((a, b) => (a.order || 0) - (b.order || 0));
      } catch (err) {
        console.error("Error fetching experiences:", err);
        return [];
      }
    },

    async saveExperience(userId, experienceData) {
      if (!userId) return null;
      const expId = experienceData.id || `exp_${Date.now()}`;
      const ref = doc(db, 'users', userId, 'experiences', expId);
      const record = { ...experienceData, id: expId, updatedAt: Date.now() };
      await setDoc(ref, record, { merge: true });
      return record;
    },

    async deleteExperience(userId, expId) {
      if (!userId || !expId) return false;
      const ref = doc(db, 'users', userId, 'experiences', expId);
      await deleteDoc(ref);
      return true;
    },

    async seedUserStarterData(userId) {
      if (!userId) return false;
      const starter = getAaronStarterData();
      await this.saveMasterTemplate(userId, starter.masterTemplate);
      for (const exp of starter.experiences) {
        await this.saveExperience(userId, exp);
      }
      return true;
    }
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node /Users/aaronheiner/Professional-Readiness/test/test-seed-data.js`  
Expected: PASS.

- [ ] **Step 5: Commit changes**

```bash
cd /Users/aaronheiner/Professional-Readiness
git add js/seed-data.js js/db-service.js test/test-seed-data.js
git commit -m "feat: implement starter seed data and firestore service"
```

---

### Task 4: Firebase Configuration & Authentication Manager

**Files:**
- Create: `/Users/aaronheiner/Professional-Readiness/js/firebase-config.js`
- Create: `/Users/aaronheiner/Professional-Readiness/js/auth-manager.js`
- Create: `/Users/aaronheiner/Professional-Readiness/test/test-auth-config.js`

**Interfaces:**
- Produces: `firebaseConfig` object matching user credentials.
- Produces: `initAuth({ auth, GoogleAuthProvider, signInWithPopup, signInAnonymously, signOut, onAuthStateChanged, onUserChange })`

- [ ] **Step 1: Write the failing auth config test**

Create `test/test-auth-config.js`:
```javascript
import assert from 'node:assert';
import { firebaseConfig } from '../js/firebase-config.js';

console.log('Running Task 4 Firebase Config & Auth Tests...');

assert.strictEqual(firebaseConfig.projectId, 'sandbox-ed1e2');
assert.strictEqual(firebaseConfig.authDomain, 'sandbox-ed1e2.firebaseapp.com');
assert.strictEqual(firebaseConfig.appId, '1:741844679458:web:a1f509886fd61398ac837b');
assert.ok(firebaseConfig.apiKey.startsWith('AIzaSy'), 'Valid API key structure');

console.log('✓ Task 4 firebase config tests passed successfully!');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node /Users/aaronheiner/Professional-Readiness/test/test-auth-config.js`  
Expected: FAIL.

- [ ] **Step 3: Implement `js/firebase-config.js` and `js/auth-manager.js`**

1. Create `js/firebase-config.js`:
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

2. Create `js/auth-manager.js`:
```javascript
/**
 * Firebase Authentication Manager
 * Handles Google OAuth, Anonymous auth, and real-time state listeners
 */

export function setupAuth({
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  onUserChange
}) {
  const provider = new GoogleAuthProvider();

  // Listen to active user changes
  onAuthStateChanged(auth, (user) => {
    if (onUserChange) {
      onUserChange(user);
    }
  });

  return {
    async loginWithGoogle() {
      try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
      } catch (err) {
        console.error("Google sign-in error:", err);
        throw err;
      }
    },

    async loginAsGuest() {
      try {
        const result = await signInAnonymously(auth);
        return result.user;
      } catch (err) {
        console.error("Anonymous sign-in error:", err);
        throw err;
      }
    },

    async logout() {
      await signOut(auth);
    },

    getCurrentUser() {
      return auth.currentUser;
    }
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node /Users/aaronheiner/Professional-Readiness/test/test-auth-config.js`  
Expected: PASS.

- [ ] **Step 5: Commit changes**

```bash
cd /Users/aaronheiner/Professional-Readiness
git add js/firebase-config.js js/auth-manager.js test/test-auth-config.js
git commit -m "feat: implement firebase config and auth manager"
```

---

### Task 5: Nintendo Switch Console UI Layout & Styles

**Files:**
- Create: `/Users/aaronheiner/Professional-Readiness/index.html`
- Create: `/Users/aaronheiner/Professional-Readiness/style.css`
- Test: `/Users/aaronheiner/Professional-Readiness/test/test-ui-dom.js`

**Interfaces:**
- Produces: Complete Switch console frame with top row, active title banner, 5-card carousel, circular action buttons row, footer status bar, and modal overlays.
- Produces: CSS replicating exact visual styling and pulsing cyan borders from `Books--Apple-export-to-structured-output`.

- [ ] **Step 1: Write the failing DOM validation test**

Create `test/test-ui-dom.js`:
```javascript
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, '../index.html');
const cssPath = path.resolve(__dirname, '../style.css');

console.log('Running Task 5 HTML & CSS Integrity Tests...');

assert.ok(fs.existsSync(htmlPath), 'index.html must exist');
assert.ok(fs.existsSync(cssPath), 'style.css must exist');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

// Assert key elements in index.html
assert.ok(html.includes('class="switch-viewport"'), 'Must have switch viewport');
assert.ok(html.includes('id="carousel-container"'), 'Must have carousel container');
assert.ok(html.includes('id="card-generator"'), 'Must have Generator card');
assert.ok(html.includes('id="card-template"'), 'Must have Master Template card');
assert.ok(html.includes('id="card-experiences"'), 'Must have Experience Bank card');
assert.ok(html.includes('id="btn-copy"'), 'Must have Copy button');
assert.ok(html.includes('id="btn-split-reader"'), 'Must have Split Reader button');
assert.ok(html.includes('id="modal-reader"'), 'Must have Split Reader modal');
assert.ok(html.includes('id="modal-auth"'), 'Must have Auth modal');

// Assert key styling in style.css
assert.ok(css.includes('@keyframes switchBorderPulse'), 'Must contain cyan glowing pulse animation');
assert.ok(css.includes('.switch-card.is-selected'), 'Must style selected card');
assert.ok(css.includes('.switch-circle-btn'), 'Must style circular buttons');

console.log('✓ Task 5 UI DOM tests passed successfully!');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node /Users/aaronheiner/Professional-Readiness/test/test-ui-dom.js`  
Expected: FAIL.

- [ ] **Step 3: Implement `style.css` and `index.html`**

1. Create `style.css` adopting the clean pure white console styles, glowing cyan pulse animation, and split reader layout from `Books--Apple-export-to-structured-output/style.css` and `index.html`.
2. Create `index.html` containing:
   - Top status row (profile avatar, active name, clock, status icons).
   - Dynamic title banner.
   - 5 Carousel cards (`card-generator`, `card-template`, `card-experiences`, `card-resume`, `card-interview`).
   - 4 Circular tactile action buttons (`btn-copy`, `btn-split-reader`, `btn-export`, `btn-reset`).
   - Footer stats row.
   - Split Reader Modal (left: live paper preview; right: job inputs, generator toggle, and experience checkboxes).
   - Experience Bank Manager Modal.
   - Master Template Editor Modal.
   - Profile & Auth Modal (Google login, Guest login, and private "Seed My Master Library" button).
   - Switch audio elements referencing `sounds/*.wav`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node /Users/aaronheiner/Professional-Readiness/test/test-ui-dom.js`  
Expected: PASS.

- [ ] **Step 5: Commit changes**

```bash
cd /Users/aaronheiner/Professional-Readiness
git add index.html style.css test/test-ui-dom.js
git commit -m "feat: implement Nintendo Switch OS console markup and styling"
```

---

### Task 6: Switch Controller, Audio Effects & Modal Integrations

**Files:**
- Create: `/Users/aaronheiner/Professional-Readiness/app.js`

**Interfaces:**
- Consumes: `firebase-config.js`, `auth-manager.js`, `db-service.js`, `prompt-builder.js`, `seed-data.js`.
- Produces: Live application logic, keyboard navigation, audio triggers, card clicks, real-time generation, and clipboard handling.

- [ ] **Step 1: Implement `app.js`**

Implement complete client controller with:
1. Live clock update every 1000ms (`HH:MM AM/PM`).
2. Audio playback helper (`playSound(sound)`) with error suppression.
3. Card carousel selection logic:
   - Click or Left/Right arrow keys navigate between the 5 cards.
   - Plays `klick.wav` on card focus.
   - Updates the active title banner.
   - Enter key or double-click opens the respective modal or triggers the generator.
4. Circular button actions:
   - `btn-copy`: Copies current prompt or letter to clipboard; plays `Popup.wav`.
   - `btn-split-reader`: Opens Split Reader modal; plays `News.wav`.
   - `btn-export`: Downloads active generation as a `.txt` or `.md` file.
   - `btn-reset`: Resets active form fields; plays `Home.wav`.
5. Split Reader interaction:
   - Instant re-generation on input changes (Company Name, Role, Job Description).
   - Mode switcher (AI Prompt vs. Word-for-Word).
   - Dynamic experience checkbox list loaded from user's Firestore bank.
   - Keyword relevance indicator automatically checking top matching experiences.
6. Experience Bank Modal:
   - Create, edit, and delete experience stories with real-time Firestore sync.
7. Master Template Modal:
   - Live editing of BYU–Idaho narrative, graduation year, and core stories.
8. Authentication Integration:
   - Automatic guest sign-in on first load if unauthenticated.
   - Google sign-in popup on avatar click.
   - "Seed My Master Library" button restricted to Aaron's account for one-click initial population of `Aboutme_coverletter` data.

- [ ] **Step 2: Commit changes**

```bash
cd /Users/aaronheiner/Professional-Readiness
git add app.js
git commit -m "feat: implement main Switch controller, audio feedback, and modal logic"
```

---

### Task 7: End-to-End Verification & Browser Testing

**Files:**
- Create: `/Users/aaronheiner/Professional-Readiness/test/test-e2e.js`

**Interfaces:**
- Executes complete automated test suite covering rules, generators, seed data, and DOM integrity.

- [ ] **Step 1: Create `test/test-e2e.js`**

```javascript
import { execSync } from 'node:child_process';
import assert from 'node:assert';

console.log('Running End-to-End Test Suite...');

const commands = [
  'node test/test-scaffold.js',
  'node test/test-prompt-builder.js',
  'node test/test-seed-data.js',
  'node test/test-auth-config.js',
  'node test/test-ui-dom.js'
];

for (const cmd of commands) {
  console.log(`Executing: ${cmd}`);
  const output = execSync(cmd, { encoding: 'utf8' });
  console.log(output.trim());
}

console.log('==================================================');
console.log('✓ ALL PROFESSIONAL READINESS TESTS PASSED SUCCESSFULLY!');
console.log('==================================================');
```

- [ ] **Step 2: Run End-to-End test suite**

Run: `node /Users/aaronheiner/Professional-Readiness/test/test-e2e.js`  
Expected: PASS.

- [ ] **Step 3: Commit and verify git status**

```bash
cd /Users/aaronheiner/Professional-Readiness
git add test/test-e2e.js
git commit -m "test: add end-to-end test runner"
```
