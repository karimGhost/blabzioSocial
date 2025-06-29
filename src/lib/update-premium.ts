// File: /lib/update-premium.ts

import { adminDB } from "./firebase-adminsdk";
export async function updatePremiumStatus({
  userId,
  paymentId,
  paymentMethod,
  subscriptionMonths,
  expiresAt,


}: {
  userId: string;
  paymentId: string;
  paymentMethod: "paypal" | "mpesa";
  subscriptionMonths: number;
  expiresAt: Date;

}) {
  return adminDB.collection("users").doc(userId).update({
    isPremium: true,
    premiumSince: new Date(),
    premiumExpiresAt: expiresAt,
    subscriptionMonths,
    paymentId,
    paymentMethod,
    premiumBadge: "tick", // consistent for all plans
  });
}
