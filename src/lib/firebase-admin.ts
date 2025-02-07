import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { DecodedIdToken } from 'firebase-admin/auth';

// Initialize Firebase Admin
const apps = getApps();
const app = !apps.length
  ? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  : apps[0];

export const adminAuth = getAuth(app);

// Helper function to verify session cookie
export async function verifySessionCookie(
  session: string,
  checkRevoked = true
): Promise<DecodedIdToken | null> {
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(
      session,
      checkRevoked
    );
    return decodedClaims;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

// Helper function to revoke user sessions
export async function revokeUserSessions(uid: string): Promise<void> {
  try {
    await adminAuth.revokeRefreshTokens(uid);
  } catch (error) {
    console.error('Failed to revoke user sessions:', error);
    throw error;
  }
}
