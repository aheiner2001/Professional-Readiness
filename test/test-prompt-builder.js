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

// Test 4: Defensive defaults verification
const defaultPrompt = buildTailoredAIPrompt();
assert.ok(defaultPrompt.includes("# Master Cover Letter Generator Prompt"));
assert.ok(defaultPrompt.includes("December 2026"), "Default prompt should include default graduation date");
assert.ok(defaultPrompt.includes("bachelor's degree in Computer Science"), "Default prompt should include default degree");

// Test 5: Dynamic degree and graduation date interpolation
const customPrompt = buildTailoredAIPrompt({
  masterTemplate: {
    ...mockTemplate,
    graduationDate: "April 2027",
    degree: "master's degree in Artificial Intelligence"
  }
});
assert.ok(customPrompt.includes("April 2027"), "Custom prompt should include customized graduation date");
assert.ok(customPrompt.includes("master's degree in Artificial Intelligence"), "Custom prompt should include customized degree");

const defaultLetter = buildWordForWordLetter();
assert.ok(defaultLetter.includes("Sincerely,\nAaron Heiner"));

const matchesWithNulls = matchKeywords("python", [
  { id: "partial", title: null, category: null, relevantFor: ["Python"], bulletPoints: null }
]);
assert.deepStrictEqual(matchesWithNulls, ["partial"]);

console.log('✓ Task 2 prompt builder tests passed successfully!');
