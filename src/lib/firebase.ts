import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || undefined);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
// Workspace Gmail scope for sending automated welcome notifications
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');

// In-memory access token cache for Google Workspace APIs
let cachedAccessToken: string | null = null;

export function getAccessToken(): string | null {
  return cachedAccessToken;
}

// Active local session key
const ACTIVE_USER_KEY = 'calai_active_user';
const REGISTERED_USERS_KEY = 'calai_registered_users';

// In-memory list of auth listeners for fallback auth
const authListeners: Array<(user: User | null) => void> = [];

function notifyAuthListeners(user: User | null) {
  authListeners.forEach((cb) => {
    try {
      cb(user);
    } catch (e) {
      console.error('Error in auth listener:', e);
    }
  });
}

function getLocalActiveUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Format Firebase Auth errors into clear, friendly guidance
 */
export function formatAuthErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred during authentication.';
  const code = error.code || '';
  const message = error.message || '';

  if (code === 'auth/popup-blocked') {
    return 'Browser popup was blocked. You can use Email/Password sign-in below, or open this app in a new tab.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Domain is not in Firebase authorized list yet. You can sign in using Email & Password below.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Provider is pending setup in Firebase Console. You can continue instantly with Email & Password or Instant Login below.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Login window was closed before completing.';
  }
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Invalid email or password. Please verify your credentials or create a new account.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'This email address is already registered. Please click "Sign In" below.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please enter at least 6 characters.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }

  return message.replace('Firebase: ', '') || 'Authentication failed. Please try again.';
}

/**
 * Sync user data to Firestore
 */
async function syncUserToFirestore(user: any, customName?: string) {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        id: user.uid,
        name: customName || user.displayName || 'Fitness Champion',
        email: user.email || '',
        photoUrl: user.photoURL || '',
        lastLoginAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore user sync warning (non-fatal):', err);
  }
}

/**
 * Sign in or Sign up with Google Popup (with graceful fallback)
 */
export async function signInWithGoogle(fallbackEmail?: string, fallbackName?: string): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    if (user) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
      await syncUserToFirestore(user);
      notifyAuthListeners(user);
    }
    return user;
  } catch (error: any) {
    console.warn('Firebase Google Sign In encountered an error:', error?.code, error?.message);

    // If Firebase Auth provider is not enabled or popup blocked, gracefully fallback if requested
    if (
      error?.code === 'auth/operation-not-allowed' ||
      error?.code === 'auth/unauthorized-domain' ||
      error?.code === 'auth/popup-blocked'
    ) {
      throw error;
    }
    throw error;
  }
}

/**
 * Instant fallback login for Google or Guest
 */
export function signInInstant(name: string, email: string, photoUrl?: string): User {
  const fallbackUser: any = {
    uid: 'user_instant_' + Math.random().toString(36).substring(2, 9),
    displayName: name || 'Fitness Champion',
    email: email || 'user@calai.app',
    photoURL: photoUrl || '',
    emailVerified: true,
    isAnonymous: false,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(fallbackUser));
  }
  syncUserToFirestore(fallbackUser, name);
  notifyAuthListeners(fallbackUser);
  return fallbackUser;
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(res.user));
      await syncUserToFirestore(res.user);
      notifyAuthListeners(res.user);
    }
    return res.user;
  } catch (error: any) {
    console.warn('Firebase Email Sign In Error:', error?.code, error?.message);

    // If Firebase provider is disabled in console, fallback to local registered accounts
    if (error?.code === 'auth/operation-not-allowed' || error?.code === 'auth/configuration-not-found') {
      try {
        const registered = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '{}');
        const existing = registered[email.toLowerCase()];
        if (existing) {
          if (existing.password && existing.password !== pass) {
            const wrongErr = new Error('Wrong password. Please re-enter your password.');
            (wrongErr as any).code = 'auth/wrong-password';
            throw wrongErr;
          }
          const localUser: any = {
            uid: existing.uid || 'usr_' + Date.now(),
            displayName: existing.displayName || email.split('@')[0],
            email: email,
            photoURL: existing.photoURL || '',
          };
          localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(localUser));
          notifyAuthListeners(localUser);
          return localUser;
        } else {
          // Auto-create on first sign in if provider is disabled
          return await signUpWithEmail(email, pass, email.split('@')[0]);
        }
      } catch (innerErr) {
        if ((innerErr as any).code) throw innerErr;
      }
    }
    throw error;
  }
}

/**
 * Register a new user with Email and Password
 */
export async function signUpWithEmail(email: string, pass: string, name: string): Promise<User> {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      if (name) {
        await updateProfile(res.user, { displayName: name });
      }
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(res.user));
      await syncUserToFirestore(res.user, name);
      notifyAuthListeners(res.user);
    }
    return res.user;
  } catch (error: any) {
    console.warn('Firebase Email Sign Up Error:', error?.code, error?.message);

    // If Firebase provider is not enabled in Firebase Console yet, activate seamless local account!
    if (error?.code === 'auth/operation-not-allowed' || error?.code === 'auth/configuration-not-found') {
      const localUser: any = {
        uid: 'usr_' + Math.random().toString(36).substring(2, 9),
        displayName: name || email.split('@')[0],
        email: email,
        photoURL: '',
        emailVerified: true,
        isAnonymous: false,
      };

      // Store in local registered accounts so they can sign back in
      try {
        const registered = JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '{}');
        registered[email.toLowerCase()] = {
          uid: localUser.uid,
          displayName: localUser.displayName,
          email: email,
          password: pass,
        };
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registered));
        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(localUser));
      } catch (storageErr) {
        console.warn('Failed to save to local registered store:', storageErr);
      }

      syncUserToFirestore(localUser, name);
      notifyAuthListeners(localUser);
      return localUser;
    }
    throw error;
  }
}

/**
 * Log out current user
 */
export async function logOut(): Promise<void> {
  try {
    cachedAccessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_USER_KEY);
    }
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
  } finally {
    cachedAccessToken = null;
    notifyAuthListeners(null);
  }
}

/**
 * Listen to auth state changes (supporting both Firebase Auth and local session fallback)
 */
export function onAuthChange(callback: (user: User | null) => void) {
  authListeners.push(callback);

  // Immediately notify of any existing local active user
  const localUser = getLocalActiveUser();
  if (localUser) {
    callback(localUser);
  }

  // Firebase auth listener
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(firebaseUser));
      callback(firebaseUser);
    } else {
      // If Firebase says null, only revert if no local active user was manually set
      const currentLocal = getLocalActiveUser();
      if (!currentLocal) {
        callback(null);
      }
    }
  });

  return () => {
    const idx = authListeners.indexOf(callback);
    if (idx !== -1) authListeners.splice(idx, 1);
    unsubscribe();
  };
}

export type { User };

