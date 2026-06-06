import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mocks do Firebase SDK
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => {
  const mockUser = {
    uid: 'test-doctor-uid',
    email: 'medico@otto.med.br',
    metadata: {
      creationTime: '2026-06-06T00:00:00Z',
    },
    getIdToken: vi.fn().mockResolvedValue('fake-firebase-token'),
  };

  return {
    getAuth: vi.fn(() => ({
      currentUser: mockUser,
    })),
    signInWithPopup: vi.fn().mockResolvedValue({ user: mockUser }),
    signOut: vi.fn().mockResolvedValue(undefined),
    deleteUser: vi.fn().mockResolvedValue(undefined),
    onAuthStateChanged: vi.fn((_, callback) => {
      callback(mockUser);
      return () => {};
    }),
    onIdTokenChanged: vi.fn((_, callback) => {
      callback(mockUser);
      return () => {};
    }),
  };
});

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  setDoc: vi.fn(() => Promise.resolve()),
  getDoc: vi.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({
      displayName: 'Dr. Dario',
      profile: 'medico',
      premiumActive: true,
      subscriptionPlan: 'premium',
      profileCompleted: true,
      onboardingCompleted: true,
    }),
  })),
  deleteDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  serverTimestamp: vi.fn(() => 'fake-timestamp'),
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(() => ({})),
}));

// Mock do serviceWorker e caches para evitar erros em testes
if (typeof window !== 'undefined') {
  Object.defineProperty(navigator, 'serviceWorker', {
    writable: true,
    value: {
      register: vi.fn().mockResolvedValue({}),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      ready: Promise.resolve({}),
    },
  });

  Object.defineProperty(window, 'caches', {
    writable: true,
    value: {
      keys: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(true),
      open: vi.fn().mockResolvedValue({
        put: vi.fn().mockResolvedValue(undefined),
        match: vi.fn().mockResolvedValue(undefined),
      }),
    },
  });
}
