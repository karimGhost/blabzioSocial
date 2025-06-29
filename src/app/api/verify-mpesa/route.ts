// ✅ File: /app/api/verify-mpesa/route.ts
export const runtime = "nodejs"; // ⬅️ This line is a MUST

import { updatePremiumStatus } from "@/lib/update-premium";
import { adminAuth, adminDB } from "@/lib/firebase-adminsdk";
import { NextResponse } from "next/server";

// ✅ Real Safaricom Daraja verification setup
async function verifyWithDaraja(receipt: string): Promise<boolean> {
  try {
    const consumerKey = process.env.DARAJA_CONSUMER_KEY!;
    const consumerSecret = process.env.DARAJA_CONSUMER_SECRET!;
    const base64Credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    // Step 1: Get access token
    const tokenRes = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: {
        Authorization: `Basic ${base64Credentials}`,
      },
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("Failed to get access token");

    const accessToken = tokenData.access_token;

    // Step 2: Query transaction status
    const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Initiator: "testapi",
        SecurityCredential: process.env.DARAJA_SECURITY_CREDENTIAL!,
        CommandID: "TransactionStatusQuery",
        TransactionID: receipt,
        PartyA: "600000", // Shortcode
        IdentifierType: "1", // MSISDN = 1, Till = 2, Shortcode = 4
        ResultURL: "https://your-app.com/api/mpesa-result",
        QueueTimeOutURL: "https://your-app.com/api/mpesa-timeout",
        Remarks: "Verifying transaction",
        Occasion: "Premium subscription",
      }),
    });

    const result = await response.json();
    console.log("Daraja Verification Result:", result);

    // You need to inspect `result` to determine success
    return result.ResponseCode === "0"; // Success
  } catch (err) {
    console.error("Daraja verification failed:", err);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const { mpesaReceipt, userId, subscriptionMonths } = await req.json();

    if (!mpesaReceipt || !userId || !subscriptionMonths) {
      return NextResponse.json({ error: "Missing or invalid data" }, { status: 400 });
    }

    const duplicateQuery = await adminDB
      .collection("users")
      .where("paymentId", "==", mpesaReceipt)
      .limit(1)
      .get();

    if (!duplicateQuery.empty) {
      return NextResponse.json({ error: "This M-Pesa receipt is already used." }, { status: 409 });
    }

    const paymentVerified = await verifyWithDaraja(mpesaReceipt);
    if (!paymentVerified) {
      return NextResponse.json({ error: "M-Pesa verification failed." }, { status: 400 });
    }

    const now = new Date();
    const months = parseInt(subscriptionMonths);
    const expiresAt = new Date();
    expiresAt.setMonth(now.getMonth() + months);

    await updatePremiumStatus({
      userId,
      paymentId: mpesaReceipt,
      paymentMethod: "mpesa",
      subscriptionMonths: months,
      expiresAt,
    });

    await adminDB.collection("mpesa_receipts").add({
      userId,
      mpesaReceipt,
      createdAt: new Date(),
      subscriptionMonths: months,
    });

    return NextResponse.json({ status: "success", subscriptionMonths: months });
  } catch (err) {
    console.error("M-Pesa Verification Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
