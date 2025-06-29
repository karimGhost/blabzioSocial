// File: /app/api/verify-paypal/route.ts
export const runtime = "nodejs"; // ⬅️ This line is a MUST

import { adminAuth } from "@/lib/firebase-adminsdk";
import { updatePremiumStatus } from "@/lib/update-premium";
import { NextResponse } from "next/server";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const PAYPAL_API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function verifyPayPalPayment(paypalPaymentId: string): Promise<boolean> {
  try {
    // Step 1: Get access token
    const tokenRes = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Failed to get PayPal token", tokenData);
      return false;
    }

    const accessToken = tokenData.access_token;

    // Step 2: Fetch order info
    const paymentRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${paypalPaymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const paymentDetails = await paymentRes.json();

    return paymentDetails.status === "COMPLETED";
  } catch (err) {
    console.error("PayPal Verification Failed", err);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const { paypalPaymentId, userId, subscriptionType } = await req.json();

    if (!paypalPaymentId || !userId || !subscriptionType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const paymentVerified = await verifyPayPalPayment(paypalPaymentId);
    if (!paymentVerified) {
      return NextResponse.json({ error: "Payment not verified" }, { status: 400 });
    }

    // Calculate duration
    const months = subscriptionType === "yearly" ? 12 : 1;
    const now = new Date();
    const expiresAt = new Date(now.setMonth(now.getMonth() + months));

    // Update user with shared function
    await updatePremiumStatus({
      userId,
      paymentId: paypalPaymentId,
      paymentMethod: "paypal",
      subscriptionMonths: months,
      expiresAt,
     

    });

    return NextResponse.json({ status: "success", subscriptionMonths: months });
  } catch (err) {
    console.error("PayPal Verification Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
