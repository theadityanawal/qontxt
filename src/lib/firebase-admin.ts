import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth, DecodedIdToken, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Error types that would make your exception handling cry tears of joy
type FirebaseErrorCode =
  | 'INITIALIZATION_ERROR'
  | 'AUTH_ERROR'
  | 'SESSION_ERROR'
  | 'RETRY_EXHAUSTED'
  | 'INVALID_CONFIG';

class FirebaseAdminError extends Error {
  constructor(
    public readonly code: FirebaseErrorCode,
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'FirebaseAdminError';
  }
}

// Configuration interfaces tighter than your project deadlines
interface RetryConfig {
  readonly maxAttempts: number;
  readonly initialDelay: number;
  readonly maxDelay: number;
}

interface FirebaseConfig {
  readonly projectId: string;
  readonly clientEmail: string;
  readonly privateKey: string;
}

// Service configuration that's more defensive than your code review comments
interface ServiceConfig {
  readonly retry: RetryConfig;
  readonly environment: 'development' | 'production' | 'test';
}

class FirebaseAdminService {
  private static instance: FirebaseAdminService | null = null;
  private readonly app: App;
  private readonly auth: Auth;
  private readonly firestore: Firestore;

  private readonly config: ServiceConfig = {
    retry: {
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 5000
    },
    environment: (process.env.NODE_ENV as ServiceConfig['environment']) || 'development'
  };

  private constructor() {
    this.validateEnvironment();
    const apps = getApps();
    this.app = apps.length ? apps[0] : this.initializeApp();
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);
  }

  private validateEnvironment(): void {
    const requiredVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY'
    ] as const;

    const missingVars = requiredVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      throw new FirebaseAdminError(
        'INVALID_CONFIG',
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    }
  }

  private getFirebaseConfig(): FirebaseConfig {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n')
    };
  }

  private initializeApp(): App {
    try {
      const config = this.getFirebaseConfig();
      return initializeApp({
        credential: cert(config)
      });
    } catch (error) {
      throw new FirebaseAdminError(
        'INITIALIZATION_ERROR',
        'Failed to initialize Firebase Admin',
        error
      );
    }
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    errorCode: FirebaseErrorCode
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = this.config.retry.initialDelay;

    for (let attempt = 1; attempt <= this.config.retry.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === this.config.retry.maxAttempts) {
          break;
        }

        console.warn(
          `Retry attempt ${attempt} failed for operation:`,
          lastError.message,
          `Next attempt in ${delay}ms`
        );

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, this.config.retry.maxDelay);
      }
    }

    throw new FirebaseAdminError(
      'RETRY_EXHAUSTED',
      `Operation failed after ${this.config.retry.maxAttempts} attempts`,
      lastError
    );
  }

  public static getInstance(): FirebaseAdminService {
    if (!FirebaseAdminService.instance) {
      FirebaseAdminService.instance = new FirebaseAdminService();
    }
    return FirebaseAdminService.instance;
  }

  public async verifySessionCookie(
    session: string,
    checkRevoked = true
  ): Promise<DecodedIdToken> {
    try {
      return await this.withRetry(
        async () => this.auth.verifySessionCookie(session, checkRevoked),
        'SESSION_ERROR'
      );
    } catch (error) {
      if (error instanceof FirebaseAdminError) {
        throw error;
      }
      throw new FirebaseAdminError(
        'AUTH_ERROR',
        'Session verification failed',
        error
      );
    }
  }

  public async revokeUserSessions(uid: string): Promise<void> {
    try {
      await this.withRetry(
        async () => this.auth.revokeRefreshTokens(uid),
        'AUTH_ERROR'
      );
    } catch (error) {
      throw new FirebaseAdminError(
        'AUTH_ERROR',
        `Failed to revoke sessions for user: ${uid}`,
        error
      );
    }
  }

  public async getUserByEmail(email: string) {
    try {
      return await this.withRetry(
        async () => this.auth.getUserByEmail(email),
        'AUTH_ERROR'
      );
    } catch (error) {
      throw new FirebaseAdminError(
        'AUTH_ERROR',
        `Failed to get user by email: ${email}`,
        error
      );
    }
  }

  public async createCustomToken(uid: string): Promise<string> {
    try {
      return await this.withRetry(
        async () => this.auth.createCustomToken(uid),
        'AUTH_ERROR'
      );
    } catch (error) {
      throw new FirebaseAdminError(
        'AUTH_ERROR',
        `Failed to create custom token for user: ${uid}`,
        error
      );
    }
  }

  public getAuth(): Auth {
    return this.auth;
  }

  public getFirestore(): Firestore {
    return this.firestore;
  }
}

// Export singleton instance with more protection than your dating life
const adminService = FirebaseAdminService.getInstance();

// Export type-safe utilities that would make TypeScript proud
export const adminAuth = adminService.getAuth();
export const db = adminService.getFirestore();

export const verifySessionCookie = async (
  session: string,
  checkRevoked = true
): Promise<DecodedIdToken> => {
  return adminService.verifySessionCookie(session, checkRevoked);
};

export const revokeUserSessions = async (uid: string): Promise<void> => {
  return adminService.revokeUserSessions(uid);
};

// Export error types for proper error handling (because try-catch isn't just for Pokemon)
export type { FirebaseErrorCode };
export { FirebaseAdminError };
