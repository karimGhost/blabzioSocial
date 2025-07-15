import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.SECOND_FIREBASE_PROJECT_ID,
  clientEmail: process.env.SECOND_FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.SECOND_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app =
  getApps().find((a) => a.name === 'SECOND_FIREBASE_APP') ||
  initializeApp(
    {
      credential: cert(serviceAccount),
    },
    'SECOND_FIREBASE_APP'
  );

export const secondAdminDb = getFirestore(app);