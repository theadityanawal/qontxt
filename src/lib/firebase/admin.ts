// src/lib/firebase/admin.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Ensure we only initialize once
const apps = getApps();
const firebaseAdmin = apps.length === 0
  ? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle newlines in private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  : apps[0];

export const adminAuth = getAuth(firebaseAdmin);
export const adminDb = getFirestore(firebaseAdmin);

// Helper function to verify session cookie
export async function verifySessionCookie(session: string) {
  try {
    const decodedClaim = await adminAuth.verifySessionCookie(session, true);
    return {
      valid: true,
      uid: decodedClaim.uid
    };
  } catch (error) {
    return {
      valid: false,
      uid: null
    };
  }
}
