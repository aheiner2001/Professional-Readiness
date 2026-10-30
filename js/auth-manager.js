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

// Alias for interface specification compatibility
export const initAuth = setupAuth;
