// lib/firebase-admin-second.ts
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.SECOND_FIREBASE_PROJECT_ID2,
  clientEmail: process.env.SECOND_FIREBASE_CLIENT_EMAIL2,
  privateKey: process.env.SECOND_FIREBASE_PRIVATE_KEY2?.replace(/\\n/g, '\n'),
};

if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.error('CRITICAL: One or more Firebase Admin environment variables are missing!');
}

// Use a global variable to store the initialized Firestore instance
// This helps ensure it's only initialized once per serverless function instance (cold start)
let _secondAdminDb: Firestore | null = null;

/**
 * Returns the initialized Firebase Admin Firestore instance.
 * Initializes it if it hasn't been initialized yet.
 * @returns {Firestore} The Firestore instance.
 */
export function getSecondAdminDb2(): Firestore {
  // If the instance already exists, return it immediately
  if (_secondAdminDb) {
    return _secondAdminDb;
  }

  // Find an existing Firebase app with the specific name, or initialize a new one
  const app =
    getApps().find((a) => a.name === 'SECOND_FIREBASE_APP') ||
    initializeApp(
      {
        credential: cert(serviceAccount),
      },
      'SECOND_FIREBASE_APP'
    );

  // Get the Firestore instance from the app
  _secondAdminDb = getFirestore(app);

  return _secondAdminDb;
}
