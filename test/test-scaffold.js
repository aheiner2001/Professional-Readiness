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
