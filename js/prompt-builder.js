/**
 * Professional Readiness - Prompt & Cover Letter Generator Engine
 */

export function buildTailoredAIPrompt({
  companyName = "the target company",
  role = "the position",
  jobDescription = "",
  masterTemplate = {},
  experiences = [],
  selectedExperienceIds = []
} = {}) {
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
Never invent projects, certifications, responsibilities, technologies, or accomplishments. Do not imply I have already graduated before ${masterTemplate.graduationDate || 'December 2026'}.
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
1. **Who I am:** A student finishing my ${masterTemplate.degree || "bachelor's degree in Computer Science"} at BYU–Idaho in ${masterTemplate.graduationDate || 'December 2026'} who enjoys building tools and solving problems.
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
  masterTemplate = {},
  experiences = [],
  selectedExperienceIds = [],
  greeting = `Dear ${companyName} Hiring Team,`
} = {}) {
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
    ].filter(Boolean).map(k => k.toLowerCase());

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
