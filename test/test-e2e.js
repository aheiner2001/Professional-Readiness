import { execSync } from 'node:child_process';
import assert from 'node:assert';

console.log('Running End-to-End Test Suite...');

const commands = [
  'node test/test-scaffold.js',
  'node test/test-prompt-builder.js',
  'node test/test-seed-data.js',
  'node test/test-auth-config.js',
  'node test/test-ui-dom.js',
  'node test/test-app-controller.js'
];

for (const cmd of commands) {
  console.log(`Executing: ${cmd}`);
  const output = execSync(cmd, { encoding: 'utf8' });
  console.log(output.trim());
}

console.log('==================================================');
console.log('✓ ALL PROFESSIONAL READINESS TESTS PASSED SUCCESSFULLY!');
console.log('==================================================');
