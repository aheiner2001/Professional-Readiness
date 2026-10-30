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

// 5 Carousel Cards
assert.ok(html.includes('id="card-generator"'), 'Must have Generator card');
assert.ok(html.includes('id="card-template"'), 'Must have Master Template card');
assert.ok(html.includes('id="card-experiences"'), 'Must have Experience Bank card');
assert.ok(html.includes('id="card-resume"'), 'Must have Resume Studio card');
assert.ok(html.includes('id="card-interview"'), 'Must have Interview Prep card');

// 4 Circular Buttons
assert.ok(html.includes('id="btn-copy"'), 'Must have Copy button');
assert.ok(html.includes('id="btn-split-reader"'), 'Must have Split Reader button');
assert.ok(html.includes('id="btn-export"'), 'Must have Export button');
assert.ok(html.includes('id="btn-reset"'), 'Must have Reset button');

// Modals
assert.ok(html.includes('id="modal-reader"'), 'Must have Split Reader modal');
assert.ok(html.includes('id="modal-experiences"'), 'Must have Experience Bank modal');
assert.ok(html.includes('id="modal-template"'), 'Must have Master Template modal');
assert.ok(html.includes('id="modal-auth"'), 'Must have Auth modal');

// Top row and title banner
assert.ok(html.includes('id="clock"'), 'Must have clock element');
assert.ok(html.includes('id="active-title-banner"'), 'Must have active title banner');
assert.ok(html.includes("Aaron's Studio"), 'Must have profile name');

// Audio elements
assert.ok(html.includes('id="klick"'), 'Must have Klick audio');
assert.ok(html.includes('id="audio"'), 'Must have Popup audio');
assert.ok(html.includes('id="home-sound"'), 'Must have Home audio');
assert.ok(html.includes('id="news"'), 'Must have News audio');
assert.ok(html.includes('id="profileSound"'), 'Must have User audio');

// Assert key styling in style.css
assert.ok(css.includes('@keyframes switchBorderPulse'), 'Must contain cyan glowing pulse animation');
assert.ok(css.includes('.switch-card.is-selected'), 'Must style selected card');
assert.ok(css.includes('.switch-circle-btn'), 'Must style circular buttons');
assert.ok(css.includes('.switch-viewport'), 'Must style switch viewport');
assert.ok(css.includes('.reader-split-modal'), 'Must style split reader modal');

console.log('✓ Task 5 UI DOM tests passed successfully!');
