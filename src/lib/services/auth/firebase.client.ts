import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
});

class FirebaseService {
  private static instance: FirebaseService;
  private app: ReturnType<typeof initializeApp>;
  private initialized = false;

  private constructor() {
    const env = this.validateEnv();
    const firebaseConfig = {
      apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    // Initialize Firebase
    this.app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  }

  private validateEnv() {
    try {
      return envSchema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Missing environment variables: ${error.issues.map(i => i.path.join('.')).join(', ')}`);
      }
      throw error;
    }
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  public async initialize() {
    if (this.initialized) return;

    try {
      const auth = getAuth(this.app);
      const db = getFirestore(this.app);

      // Set persistence to LOCAL for better offline support
      await setPersistence(auth, browserLocalPersistence);

      // Connect to emulators in development
      if (process.env.NODE_ENV === 'development') {
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(db, 'localhost', 8080);
      }

      this.initialized = true;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw new Error('Failed to initialize Firebase');
    }
  }

  public getAuth() {
    return getAuth(this.app);
  }

  public getFirestore() {
    return getFirestore(this.app);
  }
}

// Initialize service
const firebaseService = FirebaseService.getInstance();
await firebaseService.initialize();

// Export initialized services
export const auth = firebaseService.getAuth();
export const db = firebaseService.getFirestore();

// Configure Google Sign-In
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: 'email'
});

// Add scopes for additional Google APIs if needed
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Error types
export class FirebaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'FirebaseError';
  }
}

// Helper function to handle Firebase errors
export function handleFirebaseError(error: any): FirebaseError {
  const errorCode = error.code || 'unknown';
  const errorMessage = error.message || 'An unknown error occurred';

  switch (errorCode) {
    case 'auth/invalid-email':
      return new FirebaseError('Invalid email address', errorCode, error);
    case 'auth/user-disabled':
      return new FirebaseError('This account has been disabled', errorCode, error);
    case 'auth/user-not-found':
      return new FirebaseError('No account found with this email', errorCode, error);
    case 'auth/wrong-password':
      return new FirebaseError('Incorrect password', errorCode, error);
    case 'auth/too-many-requests':
      return new FirebaseError('Too many unsuccessful login attempts. Please try again later.', errorCode, error);
    case 'auth/network-request-failed':
      return new FirebaseError('Network error. Please check your connection.', errorCode, error);
    default:
      return new FirebaseError(errorMessage, errorCode, error);
  }
}

