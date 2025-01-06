// src/lib/firebase/admin.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Validate environment variables
function validateEnvVariables() {
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

// Initialize Firebase Admin
function initializeFirebaseAdmin() {
  validateEnvVariables();

  const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n');
  const projectId = process.env.FIREBASE_PROJECT_ID!;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;

  const apps = getApps();

  if (apps.length === 0) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId, // Add this explicitly
    });
  }

  return apps[0];
}

// Initialize with error handling
let firebaseAdmin;
try {
  firebaseAdmin = initializeFirebaseAdmin();
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  throw error;
}

export const adminAuth = getAuth(firebaseAdmin);
export const adminDb = getFirestore(firebaseAdmin);

// Helper function to verify session cookie
export async function verifySessionCookie(session: string) {
  if (!session) {
    return { valid: false, uid: null };
  }

  try {
    const decodedClaim = await adminAuth.verifySessionCookie(session, true);
    return { valid: true, uid: decodedClaim.uid };
  } catch (error) {
    console.error('Error verifying session cookie:', error);
    return { valid: false, uid: null };
  }
}
