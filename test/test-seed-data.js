import assert from 'node:assert';
import { getAaronStarterData } from '../js/seed-data.js';
import { createMockDbService, createFirestoreService } from '../js/db-service.js';

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

// Update template
await mockDb.saveMasterTemplate(uid, { ...seededTemplate, intro: 'Updated Intro' });
const updatedTemplate = await mockDb.getMasterTemplate(uid);
assert.strictEqual(updatedTemplate.intro, 'Updated Intro');

// Save / update experience
const savedExp = await mockDb.saveExperience(uid, { id: 'custom-exp', title: 'Custom Project', order: 9 });
assert.strictEqual(savedExp.id, 'custom-exp');
let allExperiences = await mockDb.getExperiences(uid);
assert.strictEqual(allExperiences.length, 9);
assert.strictEqual(allExperiences[8].id, 'custom-exp');

// Delete experience
await mockDb.deleteExperience(uid, 'custom-exp');
allExperiences = await mockDb.getExperiences(uid);
assert.strictEqual(allExperiences.length, 8);
assert.ok(!allExperiences.some(e => e.id === 'custom-exp'));

// 3. Verify createFirestoreService with mock firestore adapters
const mockDbStore = new Map();
const mockFirestore = {};
const mockFirestoreFns = {
  doc: (db, ...pathSegments) => ({ path: pathSegments.join('/') }),
  getDoc: async (docRef) => ({
    exists: () => mockDbStore.has(docRef.path),
    data: () => mockDbStore.get(docRef.path)
  }),
  setDoc: async (docRef, data, options) => {
    const existing = options?.merge ? (mockDbStore.get(docRef.path) || {}) : {};
    mockDbStore.set(docRef.path, { ...existing, ...data });
  },
  collection: (db, ...pathSegments) => ({ path: pathSegments.join('/') }),
  getDocs: async (colRef) => {
    const prefix = colRef.path + '/';
    const docs = [];
    for (const [path, data] of mockDbStore.entries()) {
      if (path.startsWith(prefix) && !path.slice(prefix.length).includes('/')) {
        const id = path.slice(prefix.length);
        docs.push({ id, data: () => data });
      }
    }
    return {
      forEach: (fn) => docs.forEach(fn)
    };
  },
  deleteDoc: async (docRef) => {
    mockDbStore.delete(docRef.path);
  }
};

const firestoreService = createFirestoreService(mockFirestore, mockFirestoreFns);
const fUid = 'firestore_user_456';

// Test empty state
assert.strictEqual(await firestoreService.getMasterTemplate(null), null);
assert.deepStrictEqual(await firestoreService.getExperiences(null), []);
assert.strictEqual(await firestoreService.getMasterTemplate(fUid), null);
assert.deepStrictEqual(await firestoreService.getExperiences(fUid), []);

// Test seeding
await firestoreService.seedUserStarterData(fUid);
const fTemplate = await firestoreService.getMasterTemplate(fUid);
assert.ok(fTemplate && fTemplate.intro.includes('Brigham Young University–Idaho'));

const fExperiences = await firestoreService.getExperiences(fUid);
assert.strictEqual(fExperiences.length, 8);

// Test delete
await firestoreService.deleteExperience(fUid, 'fresh-paint');
const fExpAfterDelete = await firestoreService.getExperiences(fUid);
assert.strictEqual(fExpAfterDelete.length, 7);

console.log('✓ Task 3 seed data tests passed successfully!');
