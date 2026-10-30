import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appJsPath = path.resolve(__dirname, '../app.js');

console.log('Running Task 6 Switch Controller & App Tests...');

// 1. Assert app.js file exists
assert.ok(fs.existsSync(appJsPath), 'app.js must exist at root directory');

// 2. Import app.js
const app = await import('../app.js');
assert.ok(app, 'app.js must export a module namespace');

// 3. Verify core function exports
const expectedExports = [
  'playSound',
  'formatTime',
  'updateClock',
  'selectCard',
  'renderPreview',
  'slugify',
  'initApp',
  'getAppState',
  'resetAppState'
];

expectedExports.forEach(fnName => {
  assert.strictEqual(typeof app[fnName], 'function', `app.js must export function ${fnName}`);
});

// 4. Test formatTime and updateClock
const testDatePM = new Date(2026, 9, 30, 14, 5); // 2:05 PM
assert.strictEqual(app.formatTime(testDatePM), '2:05 PM', 'Should format 14:05 as 2:05 PM');

const testDateAM = new Date(2026, 9, 30, 0, 15); // 12:15 AM
assert.strictEqual(app.formatTime(testDateAM), '12:15 AM', 'Should format 00:15 as 12:15 AM');

const testDateNoon = new Date(2026, 9, 30, 12, 0); // 12:00 PM
assert.strictEqual(app.formatTime(testDateNoon), '12:00 PM', 'Should format 12:00 as 12:00 PM');

const mockClockEl = { textContent: '' };
app.updateClock(mockClockEl, testDatePM);
assert.strictEqual(mockClockEl.textContent, '2:05 PM', 'updateClock should set textContent');

// 5. Test playSound error suppression
let played = false;
let currentTimeReset = false;
const mockAudioHealthy = {
  currentTime: 10,
  play: () => {
    played = true;
    return Promise.resolve();
  }
};
Object.defineProperty(mockAudioHealthy, 'currentTime', {
  set(val) { if (val === 0) currentTimeReset = true; },
  get() { return 0; }
});

app.playSound(mockAudioHealthy);
assert.ok(played, 'Healthy audio should call play()');
assert.ok(currentTimeReset, 'Healthy audio should reset currentTime to 0');

// Audio with failing promise must not throw
const mockAudioFailing = {
  currentTime: 5,
  play: () => Promise.reject(new Error('Autoplay blocked'))
};
assert.doesNotThrow(() => {
  app.playSound(mockAudioFailing);
}, 'Failing audio play must not throw');

// Null audio must not throw
assert.doesNotThrow(() => {
  app.playSound(null);
}, 'Null audio must not throw');

// 6. Test selectCard carousel logic
class MockClassList {
  constructor(initial = []) {
    this.classes = new Set(initial);
  }
  add(cls) { this.classes.add(cls); }
  remove(cls) { this.classes.delete(cls); }
  contains(cls) { return this.classes.has(cls); }
}

function createMockCard(index, title) {
  const classList = new MockClassList();
  return {
    getAttribute(attr) {
      if (attr === 'data-index') return String(index);
      if (attr === 'data-title') return title;
      return null;
    },
    classList,
    focusCalled: false,
    focus() { this.focusCalled = true; },
    scrollIntoView() {}
  };
}

const mockCards = [
  createMockCard(0, 'Application Generator'),
  createMockCard(1, 'Master Template'),
  createMockCard(2, 'Experience Bank'),
  createMockCard(3, 'Resume Studio'),
  createMockCard(4, 'Interview Prep')
];
const mockTitleBanner = { textContent: '' };
let klickPlayed = false;
const mockKlick = {
  currentTime: 0,
  play: () => { klickPlayed = true; return Promise.resolve(); }
};

// Select card 2
const newIndex = app.selectCard(2, mockCards, mockTitleBanner, mockKlick);
assert.strictEqual(newIndex, 2);
assert.ok(mockCards[2].classList.contains('is-selected'), 'Card 2 should be selected');
assert.strictEqual(mockTitleBanner.textContent, 'Experience Bank');
assert.ok(klickPlayed, 'Klick sound should play');

// Wrap around navigation: index -1 should wrap to 4
const wrappedLeft = app.selectCard(-1, mockCards, mockTitleBanner, mockKlick);
assert.strictEqual(wrappedLeft, 4, 'Index -1 should wrap to card 4');
assert.ok(mockCards[4].classList.contains('is-selected'), 'Card 4 should be selected');

// Wrap around navigation: index 5 should wrap to 0
const wrappedRight = app.selectCard(5, mockCards, mockTitleBanner, mockKlick);
assert.strictEqual(wrappedRight, 0, 'Index 5 should wrap to card 0');
assert.ok(mockCards[0].classList.contains('is-selected'), 'Card 0 should be selected');

// 7. Test slugify helper
assert.strictEqual(app.slugify('RevBlack AI Solutions Engineer!'), 'revblack-ai-solutions-engineer');
assert.strictEqual(app.slugify('  Google / Cloud & Systems  '), 'google-cloud-systems');

// 8. Test renderPreview logic
const sampleTemplate = {
  intro: "I am a student at Brigham Young University–Idaho.",
  seniorProject: "Built software tools for Sunny Car Detailing.",
  learningPhilosophy: "Quick learner who thrives on challenging problems.",
  closingGoal: "Excited to contribute at [Insert Company Name].",
  defaultGreeting: "Dear [Company Name] Hiring Team,"
};
const sampleExperiences = [
  {
    id: "sunny",
    title: "Software Development — Sunny Car Detailing",
    category: "Technical",
    storyText: "Migrated fleet records and automated CI/CD with GitHub Actions.",
    relevantFor: ["TypeScript", "CI/CD"],
    bulletPoints: ["Fleet management tool"]
  }
];

// Test AI Prompt Preview
const aiResult = app.renderPreview({
  mode: 'ai-prompt',
  companyName: 'RevBlack',
  role: 'AI Solutions Engineer',
  jobDescription: 'Seeking CI/CD and TypeScript developer.',
  masterTemplate: sampleTemplate,
  experiences: sampleExperiences,
  selectedExperienceIds: ['sunny']
});

assert.ok(aiResult.title.includes('RevBlack'), 'Preview title should contain company name');
assert.ok(aiResult.output.includes('# Master Cover Letter Generator Prompt'), 'AI prompt should contain generator header');
assert.ok(aiResult.output.includes('RevBlack'), 'AI prompt should contain company name');
assert.ok(aiResult.output.includes('AI Solutions Engineer'), 'AI prompt should contain role');
assert.ok(aiResult.output.includes('Sunny Car Detailing'), 'AI prompt should include selected experience');

// Test Word-for-Word Preview
const wfwResult = app.renderPreview({
  mode: 'word-for-word',
  companyName: 'RevBlack',
  role: 'AI Solutions Engineer',
  masterTemplate: sampleTemplate,
  experiences: sampleExperiences,
  selectedExperienceIds: ['sunny']
});

assert.ok(wfwResult.greeting.includes('RevBlack'), 'Greeting should adapt to company name');
assert.ok(wfwResult.output.includes('Brigham Young University–Idaho'), 'Word-for-word should contain university intro');
assert.ok(wfwResult.output.includes('Excited to contribute at RevBlack.'), 'Word-for-word should replace company placeholder in closing');
assert.ok(wfwResult.output.includes('Migrated fleet records'), 'Word-for-word should contain selected experience story');
assert.ok(wfwResult.paragraphs.length >= 4, 'Word-for-word should return paragraph list');

// 9. Test App State management & CRUD operations
app.resetAppState();
const state = app.getAppState();
assert.ok(state, 'AppState must be defined');
assert.strictEqual(typeof state.activeCardIndex, 'number');
assert.strictEqual(state.mode, 'ai-prompt');
assert.strictEqual(state.companyName, 'RevBlack');
assert.strictEqual(state.role, 'AI Solutions Engineer');
assert.ok(Array.isArray(state.experiences), 'experiences must be an array');
assert.ok(state.experiences.length > 0, 'starter experiences should be loaded');
assert.ok(state.masterTemplate && state.masterTemplate.intro, 'starter template should be loaded');

// 10. Test initApp & UI DOM Event Simulation
function createMockDomElement(id, tagName = 'div') {
  const listeners = {};
  const classList = new Set();
  const children = [];
  return {
    id,
    tagName: tagName.toUpperCase(),
    value: '',
    textContent: '',
    innerHTML: '',
    checked: false,
    disabled: false,
    style: {},
    classList: {
      add(cls) { classList.add(cls); },
      remove(cls) { classList.delete(cls); },
      contains(cls) { return classList.has(cls); }
    },
    addEventListener(evt, fn) {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(fn);
    },
    async click() {
      for (const fn of (listeners['click'] || [])) {
        await fn({ type: 'click', target: this });
      }
    },
    dblclick() {
      (listeners['dblclick'] || []).forEach(fn => fn({ type: 'dblclick', target: this }));
    },
    trigger(evt, eventObj = {}) {
      (listeners[evt] || []).forEach(fn => fn({ type: evt, target: this, ...eventObj }));
    },
    getAttribute(attr) {
      if (attr === 'data-index') return this.datasetIndex || '0';
      if (attr === 'data-title') return this.datasetTitle || '';
      return this[attr] || null;
    },
    setAttribute(attr, val) {
      this[attr] = val;
    },
    focus() {},
    scrollIntoView() {},
    appendChild(child) { children.push(child); },
    removeChild(child) {
      const idx = children.indexOf(child);
      if (idx >= 0) children.splice(idx, 1);
    },
    get children() { return children; }
  };
}

const elementMap = new Map();
function getOrCreateMock(id, tagName = 'div') {
  if (!elementMap.has(id)) {
    elementMap.set(id, createMockDomElement(id, tagName));
  }
  return elementMap.get(id);
}

// Required elements in index.html
const mockDoc = {
  getElementById(id) {
    return getOrCreateMock(id);
  },
  createElement(tag) {
    return createMockDomElement(`dyn_${Date.now()}_${Math.random()}`, tag);
  },
  querySelectorAll(sel) {
    return [];
  },
  addEventListener(evt, fn) {
    this.listeners = this.listeners || {};
    this.listeners[evt] = this.listeners[evt] || [];
    this.listeners[evt].push(fn);
  },
  triggerDocEvent(evt, eventObj = {}) {
    ((this.listeners && this.listeners[evt]) || []).forEach(fn => fn({ type: evt, ...eventObj }));
  },
  body: createMockDomElement('body')
};

// Set card data attributes
const cardGen = getOrCreateMock('card-generator');
cardGen.datasetIndex = '0';
cardGen.datasetTitle = 'Application Generator: Build Tailored Prompts & Letters';

const cardTpl = getOrCreateMock('card-template');
cardTpl.datasetIndex = '1';
cardTpl.datasetTitle = 'Core Master Template: Narrative & Voice Guidelines';

const cardExp = getOrCreateMock('card-experiences');
cardExp.datasetIndex = '2';
cardExp.datasetTitle = 'Experience Bank: Manage Career Stories & Skills';

const cardRes = getOrCreateMock('card-resume');
cardRes.datasetIndex = '3';
cardRes.datasetTitle = 'Resume Studio: Bullet Points & Alignment';

const cardInt = getOrCreateMock('card-interview');
cardInt.datasetIndex = '4';
cardInt.datasetTitle = 'Interview Prep: STAR Method & Practice Q&A';

// Initialize App with mock document
const initializedState = await app.initApp({ document: mockDoc });
assert.ok(initializedState, 'initApp should return app state');

// Test Card Navigation
assert.strictEqual(initializedState.activeCardIndex, 0, 'Should start at card 0');
mockDoc.triggerDocEvent('keydown', { key: 'ArrowRight', preventDefault() {} });
assert.strictEqual(initializedState.activeCardIndex, 1, 'ArrowRight should move to card 1');
assert.ok(cardTpl.classList.contains('is-selected'), 'Card 1 should be selected');

mockDoc.triggerDocEvent('keydown', { key: 'ArrowLeft', preventDefault() {} });
assert.strictEqual(initializedState.activeCardIndex, 0, 'ArrowLeft should return to card 0');
assert.ok(cardGen.classList.contains('is-selected'), 'Card 0 should be selected');

// Test Mode Switching
const btnModeAi = getOrCreateMock('mode-ai-prompt', 'button');
const btnModeWfw = getOrCreateMock('mode-word-for-word', 'button');

btnModeWfw.click();
assert.strictEqual(initializedState.mode, 'word-for-word', 'Clicking word-for-word button should change mode');
assert.ok(btnModeWfw.classList.contains('is-active'), 'Word-for-word button should have is-active class');

btnModeAi.click();
assert.strictEqual(initializedState.mode, 'ai-prompt', 'Clicking ai-prompt button should change mode back');
assert.ok(btnModeAi.classList.contains('is-active'), 'AI prompt button should have is-active class');

// Test Experience Bank CRUD in Modal
const btnAddExp = getOrCreateMock('btn-add-experience', 'button');
const btnSaveExp = getOrCreateMock('btn-save-experience', 'button');
const btnDeleteExp = getOrCreateMock('btn-delete-experience', 'button');
const inputExpTitle = getOrCreateMock('exp-title', 'input');
const inputExpStory = getOrCreateMock('exp-story', 'textarea');
const inputExpTags = getOrCreateMock('exp-tags', 'input');
const inputExpId = getOrCreateMock('exp-id', 'input');

const initialStoryCount = initializedState.experiences.length;
btnAddExp.click();
inputExpTitle.value = 'Autonomous Agents Architecture';
inputExpStory.value = 'Architected autonomous agent pairing pipelines with deep verification.';
inputExpTags.value = 'Agents, AI, Architecture';
await btnSaveExp.click();

assert.strictEqual(initializedState.experiences.length, initialStoryCount + 1, 'Story count should increase by 1');
const addedStory = initializedState.experiences.find(e => e.title === 'Autonomous Agents Architecture');
assert.ok(addedStory, 'Added story should exist in experiences list');
assert.strictEqual(addedStory.relevantFor.length, 3, 'Tags should be parsed into array');
assert.strictEqual(inputExpId.value, addedStory.id, 'Saving a new experience should sync generated ID back to inputExpId');

// Test immediate subsequent edit on the open form does not create a duplicate
inputExpStory.value = 'Architected autonomous agent pairing pipelines with deep verification and zero duplicate IDs.';
await btnSaveExp.click();
assert.strictEqual(initializedState.experiences.length, initialStoryCount + 1, 'Subsequent edit should update in place without duplicate records');
const updatedStory = initializedState.experiences.find(e => e.id === addedStory.id);
assert.strictEqual(updatedStory.storyText, 'Architected autonomous agent pairing pipelines with deep verification and zero duplicate IDs.', 'Existing story text should be updated in place');

// Test Delete Confirmation
let confirmResponse = false;
globalThis.confirm = (msg) => {
  assert.ok(msg.includes('Are you sure you want to delete this experience story?'), 'Confirm prompt should have correct message');
  return confirmResponse;
};

inputExpId.value = addedStory.id;
await btnDeleteExp.click();
assert.strictEqual(initializedState.experiences.length, initialStoryCount + 1, 'Canceling confirmation should NOT delete experience');

// Confirming deletion
confirmResponse = true;
await btnDeleteExp.click();
assert.strictEqual(initializedState.experiences.length, initialStoryCount, 'Confirming deletion should delete experience');

// Test Master Template Editing
const tplIntroInput = getOrCreateMock('template-intro', 'textarea');
const btnSaveTpl = getOrCreateMock('btn-save-template', 'button');
tplIntroInput.value = 'Updated BYU-Idaho Student Narrative for 2026.';
await btnSaveTpl.click();
assert.strictEqual(initializedState.masterTemplate.intro, 'Updated BYU-Idaho Student Narrative for 2026.');

// Test Reset Button
const btnReset = getOrCreateMock('btn-reset', 'button');
btnReset.click();
assert.strictEqual(initializedState.companyName, 'RevBlack', 'Reset should restore default company name');
assert.strictEqual(initializedState.role, 'AI Solutions Engineer', 'Reset should restore default role');

// 11. Test Modal Keyboard Guard (Arrow keys must not navigate carousel when modal is open)
const modalReader = getOrCreateMock('modal-reader');
modalReader.classList.add('is-open');
const lockedIndex = initializedState.activeCardIndex;
mockDoc.triggerDocEvent('keydown', { key: 'ArrowRight', preventDefault() {} });
assert.strictEqual(initializedState.activeCardIndex, lockedIndex, 'ArrowRight should be ignored when modal-reader is open');
mockDoc.triggerDocEvent('keydown', { key: 'ArrowLeft', preventDefault() {} });
assert.strictEqual(initializedState.activeCardIndex, lockedIndex, 'ArrowLeft should be ignored when modal-reader is open');

// When modal is closed, carousel navigation resumes
modalReader.classList.remove('is-open');
mockDoc.triggerDocEvent('keydown', { key: 'ArrowRight', preventDefault() {} });
assert.notStrictEqual(initializedState.activeCardIndex, lockedIndex, 'ArrowRight should rotate carousel when modals are closed');

// 12. Test Aaron's Account Restriction for Master Seeding
const btnSeedData = getOrCreateMock('btn-seed-data', 'button');
const seedStatus = getOrCreateMock('seed-status', 'p');

// Anonymous Guest user must be blocked with informative notice
initializedState.currentUser = { uid: 'guest_local', isAnonymous: true, email: 'guest@studio.local' };
await btnSeedData.click();
assert.ok(seedStatus.textContent.includes("reserved for Aaron's verified account"), 'Guest user should receive restriction notice');

// Non-Aaron authenticated user must be blocked with informative notice
initializedState.currentUser = { uid: 'other_user', isAnonymous: false, email: 'john.doe@example.com' };
await btnSeedData.click();
assert.ok(seedStatus.textContent.includes("reserved for Aaron's verified account"), 'Non-Aaron user should receive restriction notice');

// Aaron's authenticated account should be permitted to seed
initializedState.currentUser = { uid: 'aaron_verified', isAnonymous: false, email: 'aaron@byui.edu' };
await btnSeedData.click();
assert.ok(seedStatus.textContent.includes('✓ Successfully populated'), 'Aaron verified account should be allowed to seed master library');

// 13. Test Tap / Click to open on already-selected card
initializedState.activeCardIndex = 0;
modalReader.classList.remove('is-open');
await cardGen.click();
assert.ok(modalReader.classList.contains('is-open'), 'Clicking already-selected card should open its action/modal');
modalReader.classList.remove('is-open');

// 14. Test Y / y Export Keyboard Shortcut
let exportClicked = false;
const btnExport = getOrCreateMock('btn-export');
btnExport.addEventListener('click', () => { exportClicked = true; });

mockDoc.triggerDocEvent('keydown', { key: 'y', preventDefault() {} });
await new Promise(r => setTimeout(r, 0));
assert.ok(exportClicked, 'Pressing "y" key should trigger export button click');

exportClicked = false;
mockDoc.triggerDocEvent('keydown', { key: 'Y', preventDefault() {} });
await new Promise(r => setTimeout(r, 0));
assert.ok(exportClicked, 'Pressing "Y" key should trigger export button click');

// 15. Test DB Write Failure Graceful Degradation
initializedState.dbService = {
  saveExperience: async () => { throw new Error('Firestore write quota exceeded'); },
  saveMasterTemplate: async () => { throw new Error('Firestore network error'); },
  deleteExperience: async () => { throw new Error('Firestore permission denied'); }
};

// Even if DB write fails, memory is still updated and does not throw
inputExpTitle.value = 'Offline Story';
inputExpStory.value = 'Offline story content.';
inputExpTags.value = 'Offline';
inputExpId.value = '';
await btnSaveExp.click();
assert.ok(initializedState.experiences.some(e => e.title === 'Offline Story'), 'Memory must be updated even when cloud write fails');

tplIntroInput.value = 'Offline Template Intro';
await btnSaveTpl.click();
assert.strictEqual(initializedState.masterTemplate.intro, 'Offline Template Intro', 'Template memory must be updated even when cloud write fails');

const offlineStory = initializedState.experiences.find(e => e.title === 'Offline Story');
inputExpId.value = offlineStory.id;
await btnDeleteExp.click();
assert.ok(!initializedState.experiences.some(e => e.title === 'Offline Story'), 'Story must be deleted from memory even when cloud delete fails');

console.log('✓ Task 6 Switch Controller & App Tests passed successfully!');
