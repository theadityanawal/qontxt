// src/lib/firebase/config-admin.ts
import admin from 'firebase-admin';

// Check if the admin app has already been initialized
const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  : admin.apps[0]!;

export const adminAuth = admin.auth(app);
export const adminDb = admin.firestore(app);
