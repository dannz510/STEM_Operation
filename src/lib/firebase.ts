import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

export const firebaseApp = isFirebaseConfigured
  ? getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  : null;

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const firebaseGoogleProvider = new GoogleAuthProvider();

export const firebaseAuthSyncUrl = (import.meta.env.VITE_AUTH_SYNC_URL as string | undefined)?.trim() || '';

export interface SyncedFirebaseUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'MEMBER';
  rankTier?: string;
}

export async function syncFirebaseIdentity(idToken: string): Promise<SyncedFirebaseUser> {
  if (!firebaseAuthSyncUrl) {
    throw new Error('Firebase Auth đã được cấu hình nhưng VITE_AUTH_SYNC_URL còn thiếu.');
  }

  const response = await fetch(firebaseAuthSyncUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Tài khoản Firebase chưa được ACTIVE hoặc không có quyền truy cập.');
  return body.user as SyncedFirebaseUser;
}
