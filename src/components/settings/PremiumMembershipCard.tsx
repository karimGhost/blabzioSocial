"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Sparkles, CheckCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import clsx from "clsx";

const plans = [
  { label: "1 Month", value: "1", price: "5.00" },
  { label: "3 Months", value: "3", price: "12.00" },
  { label: "6 Months", value: "6", price: "20.00" },
  { label: "12 Months", value: "12", price: "35.00" },
];

export function PremiumMembershipCard({
  userId,
  isPremium,
  activePlan,
}: {
  userId: string;
  isPremium: boolean;
  activePlan?: string;
}) {
  const [selectedPlan, setSelectedPlan] = useState("1");
  const [showPayPal, setShowPayPal] = useState(false);

  const current = plans.find((p) => p.value === selectedPlan)!;

  const handleMpesaPayment = async () => {
    const receipt = prompt("Enter your M-Pesa receipt number:");
    if (!receipt) return;

    const res = await fetch("/api/verify-mpesa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mpesaReceipt: receipt,
        userId,
        subscriptionMonths: selectedPlan,
      }),
    });

    if (res.ok) {
      toast.success("✅ You are now a Premium Member!");
      window.location.reload();
    } else {
      toast.error("❌ M-Pesa verification failed.");
    }
  };

  return (
    <Card className="shadow-lg border border-orange-400 max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-400 text-xl">
          <Sparkles className="h-6 w-6 text-orange-500" />
          Premium Membership
        </CardTitle>
        <CardDescription className="text-sm">
          Get verified with a premium tick and unlock exclusive <i className="text-orange-500 underline cursor-pointer">features </i> . 
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isPremium ? (
          <div className="text-orange-600 font-semibold border border-green-400 px-4 py-2 rounded-md text-sm">
            ✅ You are a Premium Member
            {activePlan ? ` (${activePlan} months)` : ""}
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground font-medium">Choose your plan:</div>

            <div className="grid grid-cols-2 gap-3">
              {plans.map((plan) => (
                <button
                  key={plan.value}
                  onClick={() => setSelectedPlan(plan.value)}
                  className={clsx(
                    "border rounded-md px-3 py-2 text-sm text-center transition",
                    selectedPlan === plan.value
                      ? "bg-orange-100 border-orange-500 text-orange-800 ring-1 ring-orange-400"
                      : "hover:border-orange-300"
                  )}
                >
                  <div className="font-semibold">{plan.label}</div>
                  <div className="text-xs text-gray-600">${plan.price}</div>
                </button>
              ))}
            </div>

            {!showPayPal ? (
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={() => setShowPayPal(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Pay with PayPal
                </Button>
                <Button
                  onClick={handleMpesaPayment}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Pay with M-Pesa
                </Button>
              </div>
            ) : (
              <div className="pt-4">
                <PayPalScriptProvider
                  options={{
                    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                    currency: "USD",
                  }}
                >
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={(data, actions) =>
                      actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              value: current.price,
                            },
                          },
                        ],
                      })
                    }
                    onApprove={async (data, actions) => {
                      const details = await actions.order!.capture();
                      const res = await fetch("/api/verify-paypal", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          paypalPaymentId: details.id,
                          userId,
                          subscriptionMonths: current.value,
                        }),
                      });

                      if (res.ok) {
                        toast.success("✅ You are now a Premium Member!");
                        window.location.reload();
                      } else {
                        toast.error("❌ PayPal verification failed.");
                      }
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
