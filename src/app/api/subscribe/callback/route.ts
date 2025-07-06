// ✅ File: /app/api/subscribe/callback/route.ts
export const runtime = "nodejs";

import { updatePremiumStatus } from "@/lib/update-premium";
import { adminDB } from "@/lib/firebase-adminsdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const callback = body.Body?.stkCallback;
    if (!callback) return NextResponse.json({ message: "No callback found" });

    const resultCode = callback.ResultCode;
    const metadata = callback.CallbackMetadata?.Item || [];

    if (resultCode !== 0) {
      console.warn("Payment failed:", callback.ResultDesc);
      return NextResponse.json({ message: "Payment failed" }, { status: 200 });
    }

    // Extract values
    const receipt = metadata.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value;
    const phone = metadata.find((item: any) => item.Name === "PhoneNumber")?.Value;
    const amount = metadata.find((item: any) => item.Name === "Amount")?.Value;

    // Get CheckoutRequestID to lookup userId in your DB
    const checkoutRequestID = callback.CheckoutRequestID;
const requestRef = adminDB.collection("stk_requests").doc(checkoutRequestID);

    // Lookup userId from your DB mapping (pseudo code)
    const userDoc = await adminDB.collection("stk_requests").doc(checkoutRequestID).get();
    const userId = userDoc.exists ? userDoc.data()?.userId : "unknown";

    if (!userId) {
  console.error("❌ No user found for CheckoutRequestID", checkoutRequestID);
  return NextResponse.json({ error: "User mapping not found" }, { status: 400 });
}
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(now.getMonth() + 1);

    await updatePremiumStatus({
      userId,
      paymentId: receipt,
      paymentMethod: "mpesa",
      subscriptionMonths: 1,
      expiresAt,
    });

    await adminDB.collection("mpesa_receipts").add({
      userId,
      mpesaReceipt: receipt,
      amount,
      phone,
      createdAt: new Date(),
    });

    await requestRef.delete();

    return NextResponse.json({ message: "Payment successful" });
  } catch (err) {
    console.error("Callback error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
