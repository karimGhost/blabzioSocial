import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const base64 = process.env.FIREBASE_ADMIN_SDK_BASE64;

  if (!base64) {
    throw new Error("Missing FIREBASE_ADMIN_SDK_BASE64 env");
  }

  const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
  const serviceAccount = JSON.parse(jsonStr);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export { admin };
