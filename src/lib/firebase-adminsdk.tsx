// src/lib/firebase-admin.ts
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

const base64 = process.env.FIREBASE_ADMIN_SDK_BASE64!;
const decoded = Buffer.from(base64, "base64").toString("utf-8");
const serviceAccount = JSON.parse(decoded);

const app = getApps().length === 0
  ? initializeApp({ credential: cert(serviceAccount) })
  : getApp();

export const adminAuth = getAuth(app);
export const adminDB = getFirestore(app);
export const messaging = getMessaging(app);
