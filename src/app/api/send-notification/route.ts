import { messaging } from "@/lib/firebase-adminsdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token, title, body, clickAction } = await req.json();

    if (!token || !title || !body) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const message = {
      token,
      notification: {
        title,
        body,
      },
      webpush: {
        notification: {
          icon: "/icons/android-chrome-192x192.png",
          click_action: clickAction || "https://blabzio-social.vercel.app",
        },
      },
    };


    

    await messaging.send(message);

    console.log("✅ Sent message:", message);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 FCM API error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
