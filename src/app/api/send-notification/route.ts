// pages/api/send-notification.ts

import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import serviceAccount from "@/config/firebase-adminsdk.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const message = {
      token,
      notification: {
        title,
        body,
      },
      webpush: {
        notification: {
          icon: "/icon-192x192.png", // Your PWA icon
          click_action: "https://your-site.com/messages", // Optional
        },
      },
    };

    await admin.messaging().send(message);

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("FCM Error:", err);
    res.status(500).json({ error: "Failed to send notification" });
  }
}
