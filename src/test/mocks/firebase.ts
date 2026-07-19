/**
 * @file firebase.ts
 * @description Reusable Firebase mocks for Vitest.
 *
 * @features
 * - `mockUser` — fake authenticated user
 * - `mockAuth` — auth API mocks
 * - `mockQuerySnapshot` — builds a fake QuerySnapshot
 * - `mockDoc`, `mockCollection`, `mockGetDocs`, `mockAddDoc`, `mockDocRef`
 */
import { vi } from 'vitest';

// Mock Firebase Auth
export const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
};

export const mockAuth = {
  currentUser: mockUser,
  signInAnonymously: vi.fn(() => Promise.resolve({ user: mockUser })),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn((callback: (user: typeof mockUser | null) => void) => {
    callback(mockUser);
    return vi.fn(); // unsubscribe function
  }),
};

// Mock Firestore
export const mockDoc = (id: string, data: unknown) => ({
  id,
  data: () => data,
  exists: true,
});

export const mockQuerySnapshot = (docs: Array<{ id: string; data: unknown }>) => ({
  docs: docs.map((doc) => mockDoc(doc.id, doc.data)),
  empty: docs.length === 0,
  size: docs.length,
  forEach: vi.fn((callback: (doc: ReturnType<typeof mockDoc>) => void) => {
    docs.forEach((doc) => callback(mockDoc(doc.id, doc.data)));
  }),
});

export const mockCollection = vi.fn();
export const mockGetDocs = vi.fn();
export const mockAddDoc = vi.fn();
export const mockDocRef = vi.fn();
