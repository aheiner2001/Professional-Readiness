/**
 * Nintendo Switch Studio - Professional Readiness Controller
 * Orchestrates Switch navigation, audio feedback, Split Reader workspace,
 * Experience Bank CRUD, Master Template customization, and Firebase Auth / Firestore sync.
 */

import { firebaseConfig } from './js/firebase-config.js';
import { setupAuth } from './js/auth-manager.js';
import { createFirestoreService, createMockDbService } from './js/db-service.js';
import {
  buildTailoredAIPrompt,
  buildWordForWordLetter,
  matchKeywords
} from './js/prompt-builder.js';
import { getAaronStarterData } from './js/seed-data.js';

// Global application state
const starterData = getAaronStarterData();

let state = {
  currentUser: null,
  activeCardIndex: 0,
  mode: 'ai-prompt', // 'ai-prompt' | 'word-for-word'
  companyName: 'RevBlack',
  role: 'AI Solutions Engineer',
  jobDescription: '',
  selectedExperienceIds: ['sunny-detailing', 'databases-cloud', 'downwinders-migration'],
  masterTemplate: { ...starterData.masterTemplate },
  experiences: starterData.experiences ? [...starterData.experiences] : [],
  activeStoryId: null,
  dbService: null,
  authManager: null,
  isOffline: false
};

export function getAppState() {
  return state;
}

export function resetAppState() {
  const fresh = getAaronStarterData();
  state = {
    currentUser: null,
    activeCardIndex: 0,
    mode: 'ai-prompt',
    companyName: 'RevBlack',
    role: 'AI Solutions Engineer',
    jobDescription: '',
    selectedExperienceIds: ['sunny-detailing', 'databases-cloud', 'downwinders-migration'],
    masterTemplate: { ...fresh.masterTemplate },
    experiences: fresh.experiences ? [...fresh.experiences] : [],
    activeStoryId: null,
    dbService: null,
    authManager: null,
    isOffline: false
  };
  return state;
}

/**
 * Audio playback helper with error suppression
 */
export function playSound(audioEl) {
  if (!audioEl) return;
  try {
    audioEl.currentTime = 0;
    const playPromise = audioEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  } catch (_) {
    // Autoplay or missing context error suppressed
  }
}

/**
 * Format date into 12-hour AM/PM format (HH:MM AM/PM)
 */
export function formatTime(date = new Date()) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutesStr = minutes < 10 ? '0' + minutes : String(minutes);
  return `${hours}:${minutesStr} ${ampm}`;
}

/**
 * Update Switch top row clock display
 */
export function updateClock(clockEl, date = new Date()) {
  if (clockEl) {
    clockEl.textContent = formatTime(date);
  }
}

/**
 * Helper to slugify text for filenames
 */
export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'file';
}

/**
 * HTML escaper for safe rendering
 */
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Carousel Card Selection Logic
 */
export function selectCard(targetIndex, cards = [], activeTitleBanner = null, klickSound = null) {
  if (!cards || cards.length === 0) return 0;
  
  // Handle circular wrap-around
  const count = cards.length;
  let normalizedIndex = ((targetIndex % count) + count) % count;

  cards.forEach((card, idx) => {
    if (idx === normalizedIndex) {
      card.classList.add('is-selected');
      if (typeof card.focus === 'function' && typeof document !== 'undefined' && document.activeElement && document.activeElement !== document.body) {
        card.focus();
      }
      if (typeof card.scrollIntoView === 'function') {
        try {
          card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } catch (_) {}
      }
      const title = card.getAttribute('data-title') || '';
      if (activeTitleBanner) {
        activeTitleBanner.textContent = title;
      }
    } else {
      card.classList.remove('is-selected');
    }
  });

  if (klickSound) {
    playSound(klickSound);
  }

  state.activeCardIndex = normalizedIndex;
  return normalizedIndex;
}

/**
 * Render Cover Letter & AI Prompt Preview Outputs
 */
export function renderPreview({
  mode = 'ai-prompt',
  companyName = 'RevBlack',
  role = 'AI Solutions Engineer',
  jobDescription = '',
  masterTemplate = {},
  experiences = [],
  selectedExperienceIds = [],
  elements = {}
} = {}) {
  const { previewTitle, previewGreeting, previewBlocks, bookCenter } = elements;

  if (mode === 'ai-prompt') {
    const promptOutput = buildTailoredAIPrompt({
      companyName,
      role,
      jobDescription,
      masterTemplate,
      experiences,
      selectedExperienceIds
    });

    const titleText = `${companyName} Cover Letter Prompt`;
    const greetingText = `Target Role: ${role} | ${selectedExperienceIds.length} Stories Included`;

    if (previewTitle) previewTitle.textContent = titleText;
    if (previewGreeting) previewGreeting.textContent = greetingText;
    if (bookCenter) bookCenter.classList.add('mode-ai-view');

    if (previewBlocks) {
      previewBlocks.innerHTML = `<pre style="white-space: pre-wrap; word-break: break-word; font-family: inherit; margin: 0; line-height: 1.6;">${escapeHtml(promptOutput)}</pre>`;
    }

    return {
      mode,
      title: titleText,
      greeting: greetingText,
      output: promptOutput,
      paragraphs: [promptOutput]
    };
  } else {
    const defaultGreetingTemplate = masterTemplate.defaultGreeting || 'Dear [Company Name] Hiring Team,';
    const computedGreeting = defaultGreetingTemplate.replace(/\[Company Name\]/g, companyName);

    const letterOutput = buildWordForWordLetter({
      companyName,
      role,
      masterTemplate,
      experiences,
      selectedExperienceIds,
      greeting: computedGreeting
    });

    const titleText = `${companyName} Cover Letter`;
    const greetingText = computedGreeting;

    if (previewTitle) previewTitle.textContent = titleText;
    if (previewGreeting) previewGreeting.textContent = greetingText;
    if (bookCenter) bookCenter.classList.remove('mode-ai-view');

    const paragraphs = letterOutput.split('\n\n').filter(p => p.trim().length > 0);

    if (previewBlocks) {
      previewBlocks.innerHTML = paragraphs
        .map(p => `<p class="book-p">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
        .join('');
    }

    return {
      mode,
      title: titleText,
      greeting: greetingText,
      output: letterOutput,
      paragraphs
    };
  }
}

/**
 * Toast Notification Banner
 */
export function showToast(message, duration = 2200) {
  if (typeof document === 'undefined') return;
  let toast = document.getElementById('switch-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'switch-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '75px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(28, 28, 28, 0.94)';
    toast.style.color = '#ffffff';
    toast.style.padding = '8px 20px';
    toast.style.borderRadius = '24px';
    toast.style.fontSize = '0.86rem';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
    toast.style.zIndex = '9999';
    toast.style.pointerEvents = 'none';
    toast.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '8px';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fas fa-check-circle" style="color: #62EFDF;"></i> <span>${escapeHtml(message)}</span>`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
  }, duration);
}

/**
 * Dynamically import Firebase v10 CDN modules in the browser
 */
async function loadFirebaseModules() {
  if (typeof window === 'undefined') return null;
  try {
    const [appMod, authMod, firestoreMod] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js')
    ]);
    return {
      initializeApp: appMod.initializeApp,
      getAuth: authMod.getAuth,
      GoogleAuthProvider: authMod.GoogleAuthProvider,
      signInWithPopup: authMod.signInWithPopup,
      signInAnonymously: authMod.signInAnonymously,
      signOut: authMod.signOut,
      onAuthStateChanged: authMod.onAuthStateChanged,
      getFirestore: firestoreMod.getFirestore,
      doc: firestoreMod.doc,
      getDoc: firestoreMod.getDoc,
      setDoc: firestoreMod.setDoc,
      collection: firestoreMod.collection,
      getDocs: firestoreMod.getDocs,
      deleteDoc: firestoreMod.deleteDoc
    };
  } catch (err) {
    console.warn('Firebase CDN could not be loaded; falling back to offline mock service:', err);
    return null;
  }
}

/**
 * Main Switch Application Initializer
 */
export async function initApp(options = {}) {
  const doc = options.document || (typeof document !== 'undefined' ? document : null);
  if (!doc) return state;

  // 1. Audio Elements
  const soundPopup = options.soundPopup || doc.getElementById('audio');
  const soundProfile = options.soundProfile || doc.getElementById('profileSound');
  const soundKlick = options.soundKlick || doc.getElementById('klick');
  const soundNews = options.soundNews || doc.getElementById('news');
  const soundHome = options.soundHome || doc.getElementById('home-sound');

  // 2. Header & Clock Elements
  const clockEl = doc.getElementById('clock');
  const profileBtn = doc.getElementById('profile-btn');
  const profileName = doc.getElementById('profile-name');
  const profileBadge = doc.getElementById('profile-badge');
  const avatarImg = doc.getElementById('avatar-img');

  // 3. Carousel Elements
  const activeTitleBanner = doc.getElementById('active-title-banner');
  const cards = [
    doc.getElementById('card-generator'),
    doc.getElementById('card-template'),
    doc.getElementById('card-experiences'),
    doc.getElementById('card-resume'),
    doc.getElementById('card-interview')
  ].filter(Boolean);
  const badgeExpCount = doc.getElementById('badge-exp-count');

  // 4. Circular Action Buttons
  const btnCopy = doc.getElementById('btn-copy');
  const btnSplitReader = doc.getElementById('btn-split-reader');
  const btnExport = doc.getElementById('btn-export');
  const btnReset = doc.getElementById('btn-reset');

  // 5. Modals
  const modalReader = doc.getElementById('modal-reader');
  const modalExperiences = doc.getElementById('modal-experiences');
  const modalTemplate = doc.getElementById('modal-template');
  const modalAuth = doc.getElementById('modal-auth');

  // 6. Split Reader Modal Elements
  const btnCloseReaderX = doc.getElementById('btn-close-reader-x');
  const btnCloseReader = doc.getElementById('btn-close-reader');
  const btnReaderCopy = doc.getElementById('btn-reader-copy');
  const btnReaderExport = doc.getElementById('btn-reader-export');
  const previewTitle = doc.getElementById('preview-title');
  const previewGreeting = doc.getElementById('preview-greeting');
  const previewBlocks = doc.getElementById('preview-blocks');
  const readerBookCenter = doc.getElementById('reader-book-container');
  const modeAiPromptBtn = doc.getElementById('mode-ai-prompt');
  const modeWordForWordBtn = doc.getElementById('mode-word-for-word');
  const inputCompany = doc.getElementById('input-company');
  const selectRole = doc.getElementById('select-role');
  const customRoleWrapper = doc.getElementById('custom-role-wrapper');
  const inputCustomRole = doc.getElementById('input-custom-role');
  const inputJobDescription = doc.getElementById('input-job-description');
  const relevanceSuggestions = doc.getElementById('relevance-suggestions');
  const expCheckboxList = doc.getElementById('experiences-checkbox-list');

  // 7. Experience Bank Modal Elements
  const btnCloseExp = doc.getElementById('btn-close-experiences');
  const btnAddExp = doc.getElementById('btn-add-experience');
  const experiencesListEl = doc.getElementById('experiences-list');
  const formExperience = doc.getElementById('form-experience');
  const expIdInput = doc.getElementById('exp-id');
  const expTitleInput = doc.getElementById('exp-title');
  const expCategorySelect = doc.getElementById('exp-category');
  const expTagsInput = doc.getElementById('exp-tags');
  const expStoryInput = doc.getElementById('exp-story');
  const expBulletsInput = doc.getElementById('exp-bullets');
  const btnDeleteExp = doc.getElementById('btn-delete-experience');
  const btnSaveExp = doc.getElementById('btn-save-experience');

  // 8. Master Template Modal Elements
  const btnCloseTemplate = doc.getElementById('btn-close-template');
  const tplGreeting = doc.getElementById('template-greeting');
  const tplIntro = doc.getElementById('template-intro');
  const tplSeniorProject = doc.getElementById('template-senior-project');
  const tplPhilosophy = doc.getElementById('template-philosophy');
  const tplClosing = doc.getElementById('template-closing');
  const tplUniversity = doc.getElementById('template-university');
  const tplDegree = doc.getElementById('template-degree');
  const tplGraduation = doc.getElementById('template-graduation');
  const btnSaveTemplate = doc.getElementById('btn-save-template');

  // 9. Auth Modal Elements
  const btnCloseAuth = doc.getElementById('btn-close-auth');
  const authUserName = doc.getElementById('auth-user-name');
  const authUserEmail = doc.getElementById('auth-user-email');
  const authAvatarImg = doc.getElementById('auth-avatar-img');
  const btnGoogleLogin = doc.getElementById('btn-google-login');
  const btnGuestLogin = doc.getElementById('btn-guest-login');
  const btnSignOut = doc.getElementById('btn-sign-out');
  const btnSeedData = doc.getElementById('btn-seed-data');
  const seedStatus = doc.getElementById('seed-status');

  // Helper to open/close modals
  function openModal(modalEl, sound = soundPopup) {
    if (!modalEl) return;
    playSound(sound);
    modalEl.classList.add('is-open');
  }

  function closeModal(modalEl, sound = soundKlick) {
    if (!modalEl) return;
    playSound(sound);
    modalEl.classList.remove('is-open');
  }

  function closeAllModals() {
    [modalReader, modalExperiences, modalTemplate, modalAuth].forEach(m => {
      if (m && m.classList.contains('is-open')) {
        m.classList.remove('is-open');
      }
    });
  }

  // 10. Live Clock Update
  updateClock(clockEl);
  const clockInterval = setInterval(() => updateClock(clockEl), 1000);
  if (clockInterval && typeof clockInterval.unref === 'function') {
    clockInterval.unref();
  }

  // 11. Live Preview Rendering Routine
  function refreshLivePreview() {
    return renderPreview({
      mode: state.mode,
      companyName: state.companyName,
      role: state.role,
      jobDescription: state.jobDescription,
      masterTemplate: state.masterTemplate,
      experiences: state.experiences,
      selectedExperienceIds: state.selectedExperienceIds,
      elements: {
        previewTitle,
        previewGreeting,
        previewBlocks,
        bookCenter: readerBookCenter
      }
    });
  }

  // 12. Render Experience Checkboxes in Split Reader
  function renderSplitReaderCheckboxes() {
    if (!expCheckboxList) return;
    expCheckboxList.innerHTML = '';

    const matchedIds = matchKeywords(state.jobDescription, state.experiences);

    state.experiences.forEach(exp => {
      const isChecked = state.selectedExperienceIds.includes(exp.id);
      const isMatch = matchedIds.includes(exp.id);

      const label = doc.createElement('label');
      label.className = 'exp-checkbox-item';

      const checkbox = doc.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = exp.id;
      checkbox.checked = isChecked;

      checkbox.addEventListener('change', () => {
        playSound(soundKlick);
        if (checkbox.checked) {
          if (!state.selectedExperienceIds.includes(exp.id)) {
            state.selectedExperienceIds.push(exp.id);
          }
        } else {
          state.selectedExperienceIds = state.selectedExperienceIds.filter(id => id !== exp.id);
        }
        refreshLivePreview();
      });

      const infoDiv = doc.createElement('div');
      infoDiv.className = 'exp-checkbox-info';

      const titleDiv = doc.createElement('div');
      titleDiv.className = 'exp-checkbox-title';
      titleDiv.textContent = exp.title;
      if (isMatch) {
        const matchTag = doc.createElement('span');
        matchTag.className = 'relevance-tag';
        matchTag.textContent = 'MATCH';
        titleDiv.appendChild(matchTag);
      }

      const tagsDiv = doc.createElement('div');
      tagsDiv.className = 'exp-checkbox-tags';
      tagsDiv.textContent = (exp.relevantFor || []).slice(0, 3).join(', ');

      infoDiv.appendChild(titleDiv);
      infoDiv.appendChild(tagsDiv);

      label.appendChild(checkbox);
      label.appendChild(infoDiv);
      expCheckboxList.appendChild(label);
    });

    if (relevanceSuggestions) {
      if (matchedIds.length > 0) {
        relevanceSuggestions.textContent = `Auto-matched ${matchedIds.length} stor${matchedIds.length === 1 ? 'y' : 'ies'}`;
      } else {
        relevanceSuggestions.textContent = '';
      }
    }
  }

  // 13. Render Experience List in Experience Bank Modal
  function renderExperienceBankList() {
    if (!experiencesListEl) return;
    experiencesListEl.innerHTML = '';

    state.experiences.forEach(exp => {
      const item = doc.createElement('div');
      item.className = 'crud-list-item';
      if (state.activeStoryId === exp.id) {
        item.classList.add('is-active');
      }

      item.innerHTML = `
        <div class="crud-item-title">${escapeHtml(exp.title)}</div>
        <div class="crud-item-meta">${escapeHtml(exp.category || 'General')} &bull; ${(exp.relevantFor || []).length} tags</div>
      `;

      item.addEventListener('click', () => {
        playSound(soundKlick);
        state.activeStoryId = exp.id;
        loadExperienceIntoForm(exp);
        doc.querySelectorAll('.crud-list-item').forEach(el => el.classList.remove('is-active'));
        item.classList.add('is-active');
      });

      experiencesListEl.appendChild(item);
    });

    if (badgeExpCount) {
      badgeExpCount.textContent = `${state.experiences.length} STORIES`;
    }
  }

  function loadExperienceIntoForm(exp) {
    if (!exp) return;
    if (expIdInput) expIdInput.value = exp.id || '';
    if (expTitleInput) expTitleInput.value = exp.title || '';
    if (expCategorySelect) expCategorySelect.value = exp.category || 'Technical';
    if (expTagsInput) expTagsInput.value = (exp.relevantFor || []).join(', ');
    if (expStoryInput) expStoryInput.value = exp.storyText || '';
    if (expBulletsInput) expBulletsInput.value = (exp.bulletPoints || []).join('\n');
  }

  function clearExperienceForm() {
    if (expIdInput) expIdInput.value = '';
    if (expTitleInput) expTitleInput.value = '';
    if (expCategorySelect) expCategorySelect.value = 'Technical';
    if (expTagsInput) expTagsInput.value = '';
    if (expStoryInput) expStoryInput.value = '';
    if (expBulletsInput) expBulletsInput.value = '';
    state.activeStoryId = null;
    doc.querySelectorAll('.crud-list-item').forEach(el => el.classList.remove('is-active'));
    if (expTitleInput) expTitleInput.focus();
  }

  // 14. Populate Master Template Form
  function loadMasterTemplateIntoForm(tpl) {
    if (!tpl) return;
    if (tplGreeting) tplGreeting.value = tpl.defaultGreeting || 'Dear [Company Name] Hiring Team,';
    if (tplIntro) tplIntro.value = tpl.intro || '';
    if (tplSeniorProject) tplSeniorProject.value = tpl.seniorProject || '';
    if (tplPhilosophy) tplPhilosophy.value = tpl.learningPhilosophy || '';
    if (tplClosing) tplClosing.value = tpl.closingGoal || '';
    if (tplUniversity) tplUniversity.value = tpl.university || 'Brigham Young University–Idaho';
    if (tplDegree) tplDegree.value = tpl.degree || "Bachelor's degree in Computer Science";
    if (tplGraduation) tplGraduation.value = tpl.graduationDate || 'December 2026';
  }

  // 15. Setup Carousel Interactivity
  cards.forEach((card, idx) => {
    card.addEventListener('mouseenter', () => {
      if (state.activeCardIndex !== idx) {
        selectCard(idx, cards, activeTitleBanner, soundKlick);
      }
    });

    card.addEventListener('click', () => {
      selectCard(idx, cards, activeTitleBanner, soundKlick);
    });

    card.addEventListener('dblclick', () => {
      triggerCardAction(idx);
    });
  });

  function triggerCardAction(index) {
    if (index === 0) {
      // Application Generator -> Open Split Reader
      openModal(modalReader, soundNews);
    } else if (index === 1) {
      // Core Master Template -> Open Template Modal
      loadMasterTemplateIntoForm(state.masterTemplate);
      openModal(modalTemplate, soundPopup);
    } else if (index === 2) {
      // Experience Bank -> Open Experience Manager
      renderExperienceBankList();
      if (state.experiences.length > 0 && !state.activeStoryId) {
        state.activeStoryId = state.experiences[0].id;
        loadExperienceIntoForm(state.experiences[0]);
      }
      openModal(modalExperiences, soundPopup);
    } else if (index === 3) {
      // Resume Studio -> Open Split Reader tailored for resume
      state.mode = 'ai-prompt';
      if (modeAiPromptBtn) modeAiPromptBtn.click();
      openModal(modalReader, soundNews);
    } else if (index === 4) {
      // Interview Prep -> Open Split Reader
      state.mode = 'ai-prompt';
      if (modeAiPromptBtn) modeAiPromptBtn.click();
      openModal(modalReader, soundNews);
    }
  }

  // 16. Keyboard Navigation Controller
  doc.addEventListener('keydown', (e) => {
    // Avoid hijacking typing inside inputs or textareas
    const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
    const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select';

    // Global Escape / B key: Close open modals
    if (e.key === 'Escape') {
      const anyOpen = [modalReader, modalExperiences, modalTemplate, modalAuth].some(
        m => m && m.classList.contains('is-open')
      );
      if (anyOpen) {
        e.preventDefault();
        closeAllModals();
        playSound(soundHome);
        return;
      }
    }

    if (isTyping) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      selectCard(state.activeCardIndex - 1, cards, activeTitleBanner, soundKlick);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      selectCard(state.activeCardIndex + 1, cards, activeTitleBanner, soundKlick);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      triggerCardAction(state.activeCardIndex);
    } else if (e.key === 'x' || e.key === 'X') {
      e.preventDefault();
      openModal(modalReader, soundNews);
    } else if (e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      btnCopy?.click();
    } else if (e.key === 'b' || e.key === 'B') {
      e.preventDefault();
      const anyOpen = [modalReader, modalExperiences, modalTemplate, modalAuth].some(
        m => m && m.classList.contains('is-open')
      );
      if (anyOpen) {
        closeAllModals();
        playSound(soundHome);
      } else {
        btnReset?.click();
      }
    }
  });

  // 17. Circular Action Buttons Handling
  // btn-copy: Copy active generation to clipboard
  if (btnCopy) {
    btnCopy.addEventListener('click', async () => {
      playSound(soundPopup);
      const res = refreshLivePreview();
      try {
        if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(res.output);
        }
      } catch (_) {}
      showToast('Copied generation to clipboard!');
    });
  }

  // btn-split-reader: Open Split Reader Workspace
  if (btnSplitReader) {
    btnSplitReader.addEventListener('click', () => {
      openModal(modalReader, soundNews);
    });
  }

  // btn-export: Download generation as .txt or .md
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      playSound(soundPopup);
      const res = refreshLivePreview();
      const isAi = state.mode === 'ai-prompt';
      const ext = isAi ? '.md' : '.txt';
      const filename = `${slugify(state.companyName)}-${slugify(state.role)}${isAi ? '-prompt' : '-letter'}${ext}`;

      const blob = new Blob([res.output], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = doc.createElement('a');
      a.href = url;
      a.download = filename;
      doc.body.appendChild(a);
      a.click();
      doc.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${filename}`);
    });
  }

  // btn-reset: Reset inputs & filters to defaults
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      playSound(soundHome);
      state.companyName = 'RevBlack';
      state.role = 'AI Solutions Engineer';
      state.jobDescription = '';
      state.selectedExperienceIds = ['sunny-detailing', 'databases-cloud', 'downwinders-migration'];

      if (inputCompany) inputCompany.value = 'RevBlack';
      if (selectRole) selectRole.value = 'AI Solutions Engineer';
      if (customRoleWrapper) customRoleWrapper.style.display = 'none';
      if (inputCustomRole) inputCustomRole.value = '';
      if (inputJobDescription) inputJobDescription.value = '';

      closeAllModals();
      renderSplitReaderCheckboxes();
      refreshLivePreview();
      showToast('Reset application workspace');
    });
  }

  // 18. Split Reader Modal Wiring
  if (btnCloseReaderX) {
    btnCloseReaderX.addEventListener('click', () => closeModal(modalReader, soundKlick));
  }
  if (btnCloseReader) {
    btnCloseReader.addEventListener('click', () => closeModal(modalReader, soundKlick));
  }

  if (btnReaderCopy) {
    btnReaderCopy.addEventListener('click', async () => {
      playSound(soundPopup);
      const res = refreshLivePreview();
      try {
        if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(res.output);
        }
      } catch (_) {}
      const origText = btnReaderCopy.innerHTML;
      btnReaderCopy.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => { btnReaderCopy.innerHTML = origText; }, 1800);
      showToast('Copied preview text!');
    });
  }

  if (btnReaderExport) {
    btnReaderExport.addEventListener('click', () => btnExport?.click());
  }

  // Mode switcher tabs
  if (modeAiPromptBtn) {
    modeAiPromptBtn.addEventListener('click', () => {
      playSound(soundKlick);
      state.mode = 'ai-prompt';
      modeAiPromptBtn.classList.add('is-active');
      modeAiPromptBtn.setAttribute('aria-selected', 'true');
      if (modeWordForWordBtn) {
        modeWordForWordBtn.classList.remove('is-active');
        modeWordForWordBtn.setAttribute('aria-selected', 'false');
      }
      refreshLivePreview();
    });
  }

  if (modeWordForWordBtn) {
    modeWordForWordBtn.addEventListener('click', () => {
      playSound(soundKlick);
      state.mode = 'word-for-word';
      modeWordForWordBtn.classList.add('is-active');
      modeWordForWordBtn.setAttribute('aria-selected', 'true');
      if (modeAiPromptBtn) {
        modeAiPromptBtn.classList.remove('is-active');
        modeAiPromptBtn.setAttribute('aria-selected', 'false');
      }
      refreshLivePreview();
    });
  }

  // Inputs live reaction
  if (inputCompany) {
    inputCompany.addEventListener('input', () => {
      state.companyName = inputCompany.value.trim() || 'Company';
      refreshLivePreview();
    });
  }

  if (selectRole) {
    selectRole.addEventListener('change', () => {
      playSound(soundKlick);
      if (selectRole.value === 'custom') {
        if (customRoleWrapper) customRoleWrapper.style.display = 'block';
        state.role = inputCustomRole?.value.trim() || 'Custom Role';
      } else {
        if (customRoleWrapper) customRoleWrapper.style.display = 'none';
        state.role = selectRole.value;
      }
      refreshLivePreview();
    });
  }

  if (inputCustomRole) {
    inputCustomRole.addEventListener('input', () => {
      if (selectRole && selectRole.value === 'custom') {
        state.role = inputCustomRole.value.trim() || 'Custom Role';
        refreshLivePreview();
      }
    });
  }

  if (inputJobDescription) {
    inputJobDescription.addEventListener('input', () => {
      state.jobDescription = inputJobDescription.value;
      const matched = matchKeywords(state.jobDescription, state.experiences);
      if (matched.length > 0) {
        // Auto-select top matching experiences if user provided JD
        matched.slice(0, 3).forEach(id => {
          if (!state.selectedExperienceIds.includes(id)) {
            state.selectedExperienceIds.push(id);
          }
        });
      }
      renderSplitReaderCheckboxes();
      refreshLivePreview();
    });
  }

  // 19. Experience Bank Modal Wiring
  if (btnCloseExp) {
    btnCloseExp.addEventListener('click', () => closeModal(modalExperiences, soundKlick));
  }

  if (btnAddExp) {
    btnAddExp.addEventListener('click', () => {
      playSound(soundKlick);
      clearExperienceForm();
    });
  }

  if (btnSaveExp) {
    btnSaveExp.addEventListener('click', async () => {
      const titleVal = expTitleInput?.value.trim();
      const storyVal = expStoryInput?.value.trim();
      if (!titleVal || !storyVal) {
        alert('Please provide a Story Title and Narrative Story Text.');
        return;
      }

      const idVal = expIdInput?.value.trim() || `exp_${Date.now()}`;
      const categoryVal = expCategorySelect?.value || 'Technical';
      const tagsVal = (expTagsInput?.value || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const bulletsVal = (expBulletsInput?.value || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const existingIdx = state.experiences.findIndex(e => e.id === idVal);
      const order = existingIdx >= 0 ? state.experiences[existingIdx].order : state.experiences.length + 1;

      const expRecord = {
        id: idVal,
        title: titleVal,
        category: categoryVal,
        relevantFor: tagsVal,
        storyText: storyVal,
        bulletPoints: bulletsVal,
        order
      };

      // Persist to DB
      if (state.currentUser && state.dbService) {
        await state.dbService.saveExperience(state.currentUser.uid, expRecord);
      }

      if (existingIdx >= 0) {
        state.experiences[existingIdx] = expRecord;
      } else {
        state.experiences.push(expRecord);
        if (!state.selectedExperienceIds.includes(idVal)) {
          state.selectedExperienceIds.push(idVal);
        }
      }

      state.activeStoryId = idVal;
      playSound(soundPopup);
      renderExperienceBankList();
      renderSplitReaderCheckboxes();
      refreshLivePreview();
      showToast(`Saved "${titleVal}"`);
    });
  }

  if (btnDeleteExp) {
    btnDeleteExp.addEventListener('click', async () => {
      const idVal = expIdInput?.value.trim();
      if (!idVal) return;

      if (state.currentUser && state.dbService) {
        await state.dbService.deleteExperience(state.currentUser.uid, idVal);
      }

      state.experiences = state.experiences.filter(e => e.id !== idVal);
      state.selectedExperienceIds = state.selectedExperienceIds.filter(id => id !== idVal);

      clearExperienceForm();
      playSound(soundHome);
      renderExperienceBankList();
      renderSplitReaderCheckboxes();
      refreshLivePreview();
      showToast('Deleted experience story');
    });
  }

  // 20. Master Template Modal Wiring
  if (btnCloseTemplate) {
    btnCloseTemplate.addEventListener('click', () => closeModal(modalTemplate, soundKlick));
  }

  if (btnSaveTemplate) {
    btnSaveTemplate.addEventListener('click', async () => {
      const updatedTemplate = {
        defaultGreeting: tplGreeting?.value.trim() || 'Dear [Company Name] Hiring Team,',
        intro: tplIntro?.value.trim() || '',
        seniorProject: tplSeniorProject?.value.trim() || '',
        learningPhilosophy: tplPhilosophy?.value.trim() || '',
        closingGoal: tplClosing?.value.trim() || '',
        university: tplUniversity?.value.trim() || 'Brigham Young University–Idaho',
        degree: tplDegree?.value.trim() || "Bachelor's degree in Computer Science",
        graduationDate: tplGraduation?.value.trim() || 'December 2026'
      };

      state.masterTemplate = updatedTemplate;

      if (state.currentUser && state.dbService) {
        await state.dbService.saveMasterTemplate(state.currentUser.uid, updatedTemplate);
      }

      playSound(soundPopup);
      refreshLivePreview();
      showToast('Master template saved!');
      closeModal(modalTemplate, soundKlick);
    });
  }

  // 21. User Profile & Auth Modal Wiring
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      openModal(modalAuth, soundProfile);
    });
  }

  if (btnCloseAuth) {
    btnCloseAuth.addEventListener('click', () => closeModal(modalAuth, soundKlick));
  }

  // Backdrop modal dismiss
  [modalReader, modalExperiences, modalTemplate, modalAuth].forEach(modalEl => {
    if (modalEl) {
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) {
          closeModal(modalEl, soundKlick);
        }
      });
    }
  });

  // 22. Authentication & Data Sync Routine
  async function handleUserAuthChange(user) {
    state.currentUser = user;

    if (user) {
      const displayName = user.displayName || (user.isAnonymous ? 'Guest User' : "Aaron's Studio");
      const email = user.email || (user.isAnonymous ? 'guest@studio.local' : '');
      const badge = user.isAnonymous ? 'Guest' : 'Online';

      if (profileName) profileName.textContent = displayName;
      if (profileBadge) profileBadge.textContent = badge;
      if (authUserName) authUserName.textContent = displayName;
      if (authUserEmail) authUserEmail.textContent = email;

      if (user.photoURL) {
        if (avatarImg) avatarImg.src = user.photoURL;
        if (authAvatarImg) authAvatarImg.src = user.photoURL;
      }

      if (btnGoogleLogin) btnGoogleLogin.style.display = user.isAnonymous ? 'inline-flex' : 'none';
      if (btnGuestLogin) btnGuestLogin.style.display = 'none';
      if (btnSignOut) btnSignOut.style.display = 'inline-flex';

      // Load user data from Firestore
      try {
        if (state.dbService) {
          const [remoteTpl, remoteExps] = await Promise.all([
            state.dbService.getMasterTemplate(user.uid),
            state.dbService.getExperiences(user.uid)
          ]);

          if (remoteTpl) {
            state.masterTemplate = remoteTpl;
            loadMasterTemplateIntoForm(remoteTpl);
          }
          if (remoteExps && remoteExps.length > 0) {
            state.experiences = remoteExps;
          }
        }
      } catch (err) {
        console.warn('Error loading user Firestore data:', err);
      }
    } else {
      if (profileName) profileName.textContent = "Aaron's Studio";
      if (profileBadge) profileBadge.textContent = "Offline";
      if (authUserName) authUserName.textContent = "Guest User";
      if (authUserEmail) authUserEmail.textContent = "guest@studio.local";
      if (btnGoogleLogin) btnGoogleLogin.style.display = 'inline-flex';
      if (btnGuestLogin) btnGuestLogin.style.display = 'inline-flex';
      if (btnSignOut) btnSignOut.style.display = 'none';
    }

    renderExperienceBankList();
    renderSplitReaderCheckboxes();
    refreshLivePreview();
  }

  // 23. Initialize Firebase & Auth
  const fbModules = await loadFirebaseModules();

  if (fbModules) {
    try {
      const appInstance = fbModules.initializeApp(firebaseConfig);
      const authInstance = fbModules.getAuth(appInstance);
      const firestoreDb = fbModules.getFirestore(appInstance);

      state.dbService = createFirestoreService(firestoreDb, {
        doc: fbModules.doc,
        getDoc: fbModules.getDoc,
        setDoc: fbModules.setDoc,
        collection: fbModules.collection,
        getDocs: fbModules.getDocs,
        deleteDoc: fbModules.deleteDoc
      });

      state.authManager = setupAuth({
        auth: authInstance,
        GoogleAuthProvider: fbModules.GoogleAuthProvider,
        signInWithPopup: fbModules.signInWithPopup,
        signInAnonymously: fbModules.signInAnonymously,
        signOut: fbModules.signOut,
        onAuthStateChanged: fbModules.onAuthStateChanged,
        onUserChange: handleUserAuthChange
      });

      // Auto guest sign-in on first load if not signed in
      if (!authInstance.currentUser) {
        state.authManager.loginAsGuest().catch(() => {});
      }
    } catch (err) {
      console.warn('Firebase initialization error, fallback to mock DB:', err);
      fallbackToMock();
    }
  } else {
    fallbackToMock();
  }

  function fallbackToMock() {
    state.isOffline = true;
    state.dbService = createMockDbService();
    state.authManager = {
      async loginWithGoogle() {
        const mockUser = {
          uid: 'google_user_local',
          displayName: 'Aaron Heiner',
          email: 'aaron@byui.edu',
          isAnonymous: false
        };
        await handleUserAuthChange(mockUser);
        return mockUser;
      },
      async loginAsGuest() {
        const guestUser = {
          uid: 'guest_local',
          displayName: 'Guest User',
          email: 'guest@studio.local',
          isAnonymous: true
        };
        await handleUserAuthChange(guestUser);
        return guestUser;
      },
      async logout() {
        await handleUserAuthChange(null);
      },
      getCurrentUser() {
        return state.currentUser;
      }
    };
    state.authManager.loginAsGuest().catch(() => {});
  }

  // Auth Button Click Handlers
  if (btnGoogleLogin) {
    btnGoogleLogin.addEventListener('click', async () => {
      playSound(soundPopup);
      try {
        await state.authManager?.loginWithGoogle();
        showToast('Signed in with Google!');
      } catch (err) {
        console.error('Google sign-in error:', err);
      }
    });
  }

  if (btnGuestLogin) {
    btnGuestLogin.addEventListener('click', async () => {
      playSound(soundPopup);
      try {
        await state.authManager?.loginAsGuest();
        showToast('Signed in as Guest!');
      } catch (err) {
        console.error('Guest sign-in error:', err);
      }
    });
  }

  if (btnSignOut) {
    btnSignOut.addEventListener('click', async () => {
      playSound(soundHome);
      try {
        await state.authManager?.logout();
        showToast('Signed out');
      } catch (err) {
        console.error('Sign out error:', err);
      }
    });
  }

  // Seed My Master Library button handler
  if (btnSeedData) {
    btnSeedData.addEventListener('click', async () => {
      playSound(soundPopup);
      if (!state.currentUser) {
        alert('Please sign in or continue as Guest to seed your library.');
        return;
      }

      btnSeedData.disabled = true;
      if (seedStatus) {
        seedStatus.style.display = 'block';
        seedStatus.textContent = 'Seeding authentic master data from Aboutme_coverletter...';
      }

      try {
        await state.dbService?.seedUserStarterData(state.currentUser.uid);
        const fresh = getAaronStarterData();
        state.masterTemplate = fresh.masterTemplate;
        state.experiences = fresh.experiences;

        loadMasterTemplateIntoForm(state.masterTemplate);
        renderExperienceBankList();
        renderSplitReaderCheckboxes();
        refreshLivePreview();

        if (seedStatus) {
          seedStatus.style.color = '#3DB4AD';
          seedStatus.textContent = '✓ Successfully populated 8 master experiences and core template!';
        }
        showToast('Master library seeded successfully!');
      } catch (err) {
        console.error('Seeding error:', err);
        if (seedStatus) {
          seedStatus.style.color = '#e60012';
          seedStatus.textContent = `Error seeding data: ${err.message}`;
        }
      } finally {
        btnSeedData.disabled = false;
      }
    });
  }

  // 24. Initial Data Load & Render
  loadMasterTemplateIntoForm(state.masterTemplate);
  renderExperienceBankList();
  renderSplitReaderCheckboxes();
  refreshLivePreview();
  selectCard(0, cards, activeTitleBanner);

  return state;
}

// Auto-boot on browser DOMContentLoaded
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initApp());
  } else {
    initApp();
  }
}
