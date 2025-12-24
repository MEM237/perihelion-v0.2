// src/api/base44Client.js
// Local stub so the app runs without Base44.
// Persists a fake "user" in localStorage so flags survive refresh.

const STORAGE_KEY = "perihelion.devUser.v1";

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    id: "dev-user",
    email: "dev@local",
    hasSeenWelcome: false,
    hasCompletedOnboarding: false,
  };
}

function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

function updateUser(patch) {
  const next = { ...loadUser(), ...patch };
  return saveUser(next);
}

// Exported client (matches what your pages expect)
export const base44 = {
  auth: {
    async me() {
      return loadUser();
    },
    async signOut() {
      // optional helper
      saveUser({
        id: "dev-user",
        email: "dev@local",
        hasSeenWelcome: false,
        hasCompletedOnboarding: false,
      });
      return true;
    },
  },

  // Minimal shape if any page calls "entities.User.update(...)"
  entities: {
    User: {
      async update(_id, patch) {
        return updateUser(patch);
      },
      async meUpdate(patch) {
        return updateUser(patch);
      },
    },
  },
};
