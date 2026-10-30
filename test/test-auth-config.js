import assert from 'node:assert';
import { firebaseConfig } from '../js/firebase-config.js';
import { setupAuth, initAuth } from '../js/auth-manager.js';

console.log('Running Task 4 Firebase Config & Auth Tests...');

// 1. Verify firebaseConfig credentials
assert.strictEqual(firebaseConfig.projectId, 'sandbox-ed1e2');
assert.strictEqual(firebaseConfig.authDomain, 'sandbox-ed1e2.firebaseapp.com');
assert.strictEqual(firebaseConfig.appId, '1:741844679458:web:a1f509886fd61398ac837b');
assert.ok(firebaseConfig.apiKey.startsWith('AIzaSy'), 'Valid API key structure');
assert.strictEqual(firebaseConfig.apiKey, 'AIzaSyCyXhVv05H51JMmtZ3gQ_zSWPQ_3PIHwfk');
assert.strictEqual(firebaseConfig.storageBucket, 'sandbox-ed1e2.firebasestorage.app');
assert.strictEqual(firebaseConfig.messagingSenderId, '741844679458');

// 2. Verify setupAuth & initAuth export presence
assert.strictEqual(typeof setupAuth, 'function', 'setupAuth must be a function');
assert.strictEqual(initAuth, setupAuth, 'initAuth must be an alias to setupAuth');

// 3. Verify setupAuth wiring and methods
let registeredAuthListener = null;
let registeredAuthInstance = null;

const mockAuth = {
  currentUser: { uid: 'user_123', isAnonymous: false, email: 'test@example.com' }
};

class MockGoogleAuthProvider {
  constructor() {
    this.name = 'google.com';
  }
}

let changedUserReceived = null;
const mockOnUserChange = (user) => {
  changedUserReceived = user;
};

let popupCalledWith = null;
const mockSignInWithPopup = async (auth, provider) => {
  popupCalledWith = { auth, provider };
  return {
    user: { uid: 'google_user_456', displayName: 'Google Tester', isAnonymous: false }
  };
};

let anonCalledWith = null;
const mockSignInAnonymously = async (auth) => {
  anonCalledWith = { auth };
  return {
    user: { uid: 'guest_user_789', displayName: 'Guest User', isAnonymous: true }
  };
};

let signOutCalledWith = null;
const mockSignOut = async (auth) => {
  signOutCalledWith = { auth };
};

const mockOnAuthStateChanged = (auth, callback) => {
  registeredAuthInstance = auth;
  registeredAuthListener = callback;
};

// Initialize setupAuth
const authManager = setupAuth({
  auth: mockAuth,
  GoogleAuthProvider: MockGoogleAuthProvider,
  signInWithPopup: mockSignInWithPopup,
  signInAnonymously: mockSignInAnonymously,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
  onUserChange: mockOnUserChange
});

// Verify listener registration
assert.strictEqual(registeredAuthInstance, mockAuth, 'onAuthStateChanged must be registered with auth');
assert.strictEqual(typeof registeredAuthListener, 'function', 'onAuthStateChanged must receive a callback');

// Trigger listener
registeredAuthListener({ uid: 'listener_triggered_user' });
assert.deepStrictEqual(changedUserReceived, { uid: 'listener_triggered_user' });

// Verify getCurrentUser
assert.deepStrictEqual(authManager.getCurrentUser(), mockAuth.currentUser);

// Verify loginWithGoogle
const googleUser = await authManager.loginWithGoogle();
assert.strictEqual(googleUser.uid, 'google_user_456');
assert.strictEqual(popupCalledWith.auth, mockAuth);
assert.ok(popupCalledWith.provider instanceof MockGoogleAuthProvider);

// Verify loginAsGuest
const guestUser = await authManager.loginAsGuest();
assert.strictEqual(guestUser.uid, 'guest_user_789');
assert.strictEqual(anonCalledWith.auth, mockAuth);

// Verify logout
await authManager.logout();
assert.strictEqual(signOutCalledWith.auth, mockAuth);

// 4. Verify error handling
const failingAuth = setupAuth({
  auth: mockAuth,
  GoogleAuthProvider: MockGoogleAuthProvider,
  signInWithPopup: async () => {
    throw new Error('Popup blocked');
  },
  signInAnonymously: async () => {
    throw new Error('Network error');
  },
  signOut: mockSignOut,
  onAuthStateChanged: () => {},
  onUserChange: null
});

await assert.rejects(
  async () => { await failingAuth.loginWithGoogle(); },
  /Popup blocked/,
  'loginWithGoogle should rethrow popup error'
);

await assert.rejects(
  async () => { await failingAuth.loginAsGuest(); },
  /Network error/,
  'loginAsGuest should rethrow anonymous auth error'
);

// Verify auth listener when onUserChange is omitted
let noopListener = null;
setupAuth({
  auth: mockAuth,
  GoogleAuthProvider: MockGoogleAuthProvider,
  signInWithPopup: mockSignInWithPopup,
  signInAnonymously: mockSignInAnonymously,
  signOut: mockSignOut,
  onAuthStateChanged: (auth, cb) => { noopListener = cb; }
});
assert.doesNotThrow(() => {
  noopListener({ uid: 'anon_user' });
}, 'Listener should handle undefined onUserChange gracefully');

console.log('✓ Task 4 firebase config & auth manager tests passed successfully!');
