// ✅ File: /app/api/subscribe/stk-push/route.ts
export const runtime = "nodejs";

import { adminDB } from "@/lib/firebase-adminsdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phoneNumber, userId } = await req.json();

    if (!phoneNumber || !userId) {
      return NextResponse.json({ error: "Missing phoneNumber or userId" }, { status: 400 });
    }

        
    const formattedPhone = phoneNumber.startsWith("0")
  ? "254" + phoneNumber.slice(1)
  : phoneNumber;
    const consumerKey = process.env.DARAJA_CONSUMER_KEY!;
    const consumerSecret = process.env.DARAJA_CONSUMER_SECRET!;
    const shortcode = process.env.DARAJA_SHORTCODE!; // e.g. "174379"
    const passkey = process.env.DARAJA_PASSKEY!;

    // 1. Get access token
    const base64Credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenRes = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${base64Credentials}` },
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Prepare STK Push data
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);
    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    // 3. Send STK Push
    const res = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: 100, // 🔁 Change this to your actual amount
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: "https://your-app.com/api/subscribe/callback", // 🔁 change this to your deployed API
        AccountReference: userId,
        TransactionDesc: "Premium subscription",
      }),
    });

    const stkResponse = await res.json();

    if (stkResponse.ResponseCode !== "0") {
      console.error("STK Push Failed:", stkResponse);
      return NextResponse.json({ error: "STK Push failed", details: stkResponse }, { status: 500 });
    }

  await adminDB.collection("stk_requests").doc(stkResponse.CheckoutRequestID).set({
      userId,
      phoneNumber,
      createdAt: new Date(),
    });


    return NextResponse.json({ status: "pending", checkoutRequestID: stkResponse.CheckoutRequestID });
  } catch (err) {
    console.error("STK Push error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
