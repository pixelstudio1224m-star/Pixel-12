import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocFromServer,
  collection,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with explicit databaseId and forced long polling.
// In iframe sandboxes and proxy environments, WebChannel HTTP/2 streaming buffers,
// causing a 10s timeout warning. experimentalForceLongPolling connects immediately.
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);

// Auth instance
export const auth = getAuth(app);

// Role Definitions for Pixel 12 OS
export type UserRole = 'ADMIN' | 'TEAM' | 'CLIENT';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyId?: string;
  companyName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

// Error handling as required by Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test as required by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firestore] Connected to database successfully');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firestore] The client is offline or network restricted.');
    } else {
      console.log('[Firestore] Connection verified or initialized.');
    }
    return false;
  }
}

// Run test on boot
testConnection().catch(() => {});

// User Profile Firestore Methods
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), {
      ...profile,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// Workspace Firestore persistence
export const DEFAULT_WORKSPACE_ID = 'pixel12_agency_main';

export async function getWorkspaceFromFirestore(workspaceId = DEFAULT_WORKSPACE_ID): Promise<any | null> {
  const path = `workspaces/${workspaceId}`;
  try {
    const snap = await getDoc(doc(db, 'workspaces', workspaceId));
    if (snap.exists()) {
      return snap.data().payload;
    }
    return null;
  } catch (err) {
    console.warn('[Firestore] Failed to read workspace, falling back:', err);
    return null;
  }
}

export async function saveWorkspaceToFirestore(data: any, workspaceId = DEFAULT_WORKSPACE_ID): Promise<boolean> {
  const path = `workspaces/${workspaceId}`;
  try {
    await setDoc(
      doc(db, 'workspaces', workspaceId),
      {
        id: workspaceId,
        payload: data,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || 'system'
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('[Firestore] Warning saving workspace to Firestore:', err);
    return false;
  }
}
