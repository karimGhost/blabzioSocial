// lib/firebase-admin-second.ts
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.SECOND_FIREBASE_PROJECT_ID,
  clientEmail: process.env.SECOND_FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.SECOND_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initial logging (can be removed once confirmed working)
console.log('Firebase Admin Service Account Config:');
console.log('Project ID:', serviceAccount.projectId ? 'Set' : 'NOT SET');
console.log('Client Email:', serviceAccount.clientEmail ? 'Set' : 'NOT SET');
console.log('Private Key Length:', serviceAccount.privateKey ? serviceAccount.privateKey.length : 'NOT SET');
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
export function getSecondAdminDb(): Firestore {
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

  // Debugging logs for verification (can be removed once confirmed working)
  console.log('\n--- getSecondAdminDb() Verification (inside getter) ---');
  console.log('Type of _secondAdminDb:', typeof _secondAdminDb);
  console.log('Is _secondAdminDb an object and not null:', typeof _secondAdminDb === 'object' && _secondAdminDb !== null);
  console.log('Does _secondAdminDb have .collection method:', typeof (_secondAdminDb as any).collection === 'function');
  console.log('--- End Verification ---');

  return _secondAdminDb;
}
