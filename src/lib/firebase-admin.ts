import * as admin from "firebase-admin";

const base64 = process.env.FIREBASE_ADMIN_KEY_BASE64!;
const jsonStr = Buffer.from(base64, "base64").toString("utf8");
const serviceAccount = JSON.parse(jsonStr);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();
