import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const base64 = process.env.FIREBASE_ADMIN_SDK_BASE64!;
const decoded = Buffer.from(base64, "base64").toString("utf-8");
const serviceAccount = JSON.parse(decoded);

export const admin = getApps().length === 0
  ? initializeApp({
      credential: cert(serviceAccount),
    })
  : getApps()[0];

export const messaging = getMessaging(admin);
