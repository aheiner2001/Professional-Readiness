/**
 * Cloud Firestore Database Service
 * Handles CRUD operations scoped strictly by userId
 */

import { getAaronStarterData } from './seed-data.js';

// In-memory mock service for Node unit testing
export function createMockDbService() {
  const store = new Map();

  return {
    async getMasterTemplate(userId) {
      if (!userId) return null;
      return store.get(`users/${userId}/masterTemplate/default`) || null;
    },
    async saveMasterTemplate(userId, templateData) {
      if (!userId) return false;
      store.set(`users/${userId}/masterTemplate/default`, { ...templateData, updatedAt: Date.now() });
      return true;
    },
    async getExperiences(userId) {
      if (!userId) return [];
      const exps = [];
      const prefix = `users/${userId}/experiences/`;
      for (const [key, val] of store.entries()) {
        if (key.startsWith(prefix)) {
          exps.push(val);
        }
      }
      return exps.sort((a, b) => (a.order || 0) - (b.order || 0));
    },
    async saveExperience(userId, experienceData) {
      if (!userId) return null;
      const id = experienceData.id || `exp_${Date.now()}`;
      const record = { ...experienceData, id, updatedAt: Date.now() };
      store.set(`users/${userId}/experiences/${id}`, record);
      return record;
    },
    async deleteExperience(userId, expId) {
      if (!userId || !expId) return false;
      store.delete(`users/${userId}/experiences/${expId}`);
      return true;
    },
    async seedUserStarterData(userId) {
      if (!userId) return false;
      const starter = getAaronStarterData();
      await this.saveMasterTemplate(userId, starter.masterTemplate);
      for (const exp of starter.experiences) {
        await this.saveExperience(userId, exp);
      }
      return true;
    }
  };
}

// Live Firestore client service for browser execution
export function createFirestoreService(db, firestoreFns) {
  const { doc, getDoc, setDoc, collection, getDocs, deleteDoc } = firestoreFns || {};

  return {
    async getMasterTemplate(userId) {
      if (!userId || !doc || !getDoc) return null;
      try {
        const ref = doc(db, 'users', userId, 'masterTemplate', 'default');
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data() : null;
      } catch (err) {
        console.error("Error fetching master template:", err);
        return null;
      }
    },

    async saveMasterTemplate(userId, templateData) {
      if (!userId || !doc || !setDoc) return false;
      const ref = doc(db, 'users', userId, 'masterTemplate', 'default');
      await setDoc(ref, { ...templateData, updatedAt: Date.now() }, { merge: true });
      return true;
    },

    async getExperiences(userId) {
      if (!userId || !collection || !getDocs) return [];
      try {
        const colRef = collection(db, 'users', userId, 'experiences');
        const snap = await getDocs(colRef);
        const list = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() }));
        return list.sort((a, b) => (a.order || 0) - (b.order || 0));
      } catch (err) {
        console.error("Error fetching experiences:", err);
        return [];
      }
    },

    async saveExperience(userId, experienceData) {
      if (!userId || !doc || !setDoc) return null;
      const expId = experienceData.id || `exp_${Date.now()}`;
      const ref = doc(db, 'users', userId, 'experiences', expId);
      const record = { ...experienceData, id: expId, updatedAt: Date.now() };
      await setDoc(ref, record, { merge: true });
      return record;
    },

    async deleteExperience(userId, expId) {
      if (!userId || !expId || !doc || !deleteDoc) return false;
      const ref = doc(db, 'users', userId, 'experiences', expId);
      await deleteDoc(ref);
      return true;
    },

    async seedUserStarterData(userId) {
      if (!userId) return false;
      const starter = getAaronStarterData();
      await this.saveMasterTemplate(userId, starter.masterTemplate);
      for (const exp of starter.experiences) {
        await this.saveExperience(userId, exp);
      }
      return true;
    }
  };
}

export const createDbService = createFirestoreService;
