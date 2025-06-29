import { adminDB } from "./firebase-adminsdk";
export async function logPremiumPayment({
  userId,
  paymentId,
  paymentMethod,
  amount,
  subscriptionMonths,
}: {
  userId: string;
  paymentId: string;
  paymentMethod: "paypal" | "mpesa";
  amount: number;
  subscriptionMonths: number;
}) {
  await adminDB.collection("premiumTransactions").add({
    userId,
    paymentId,
    paymentMethod,
    amount,
    subscriptionMonths,
    createdAt: new Date(),
  });
}
