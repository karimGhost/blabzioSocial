"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import clsx from "clsx";
// process
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
    paypalClientId

}: {
  userId: string;
  isPremium: boolean;
  activePlan?: string;
    paypalClientId: string;

}) {
  const [selectedPlan, setSelectedPlan] = useState("1");
  const [phoneNumber, setPhoneNumber] = useState("");
const {toast} = useToast()
  const current = plans.find((p) => p.value === selectedPlan)!;
  const router = useRouter();


const handleStartMpesaPayment = async () => {
  if (!userId || !phoneNumber) {
     toast({
      title: "Login first",
      description: "message",
      variant: "destructive",
    });
    return;
  }

  try {
    const res = await fetch("/api/subscribe/stk-push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, userId }),
    });

    const data = await res.json();

    if (res.ok && data.checkoutRequestID) {
 toast({
      title: "M-Pesa prompt sent! Complete payment on your phone.",
      description: "message",
      variant: "destructive",
    });
      // Optionally, you can poll your backend or listen for confirmation
      // Or you just wait for the callback to update premium status automatically
    } else {
   
       toast({
      title: `STK Push failed: ${data.error || JSON.stringify(data)}`,
      description: "message",
      variant: "destructive",
    });
    }
  } catch (error) {
 
     toast({
      title: "Network error with M-Pesa payment.",
      description: "message",
      variant: "destructive",
    });
  }
};


  const handleMpesaPayment = async () => {
  const receipt = prompt("Enter your M-Pesa receipt number:");
  if (!receipt) return;

  try {
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
     
         toast({
      title: "✅ You are now a Premium Member!",
      description: "message",
    });
      window.location.reload();
    } else {
      const error = await res.json();

          toast({
      title: `❌ M-Pesa verification failed: ${error.error || "Unknown error"}`,
      description: "message",
      variant: "destructive",
    });
    }
  } catch (err) {
  
        toast({
      title: "❌ Network or server error during verification.",
      description: "message",
      variant: "destructive",
    });
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

            {/* {!showPayPal ? (
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={() => setShowPayPal(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Pay with PayPal
                </Button>
               {/* <input
  type="text"
  placeholder="Enter phone number"
  value={phoneNumber}
  onChange={(e) => setPhoneNumber(e.target.value)}
/>
 
<Button
                  className="bg-green-600 text-white hover:bg-green-700"

onClick={handleStartMpesaPayment}>Pay with M-Pesa</Button>

<Button
                  className="bg-green-600 text-white hover:bg-green-700"

onClick={handleMpesaPayment}>Enter M-Pesa Receipt Manually</Button> </div> */}
             
            

              <div className="pt-4">
                {!paypalClientId ? (
  <p className="text-sm text-red-500">
    PayPal client ID is missing. Check your .env.local file.
  </p>
) : (
                <PayPalScriptProvider
                  options={{
                    clientId: paypalClientId!,
                    currency: "USD",
                  }}
                >
                <PayPalButtons
  style={{ layout: "vertical" }}
  createOrder={async (data, actions) => {
    return actions.order.create({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: Number(current.price).toFixed(2), // Safe formatting
          },
        },
      ],
    });
  }}
  onApprove={async (data, actions) => {
    // 1. Check if actions.order exists before using it
    if (!actions.order) {
      
          toast({
      title: "❌ PayPal initialization failed.",
      description: "message",
      variant: "destructive",
    });
      return;
    }

    try {
      // 2. Capture the funds from the user
      const details = await actions.order.capture();
      
      // 3. Double-check that the capture actually succeeded
      if (details.status !== "COMPLETED") {
     
          toast({
      title: "❌ Payment was not successfully completed.",
      description: "message",
      variant: "destructive",
    });
        return;
      }

      if (!userId) {
  
    toast({
      title: "Please login before paying!!.",
      description: "message",
      variant: "destructive",
    });
  return;
}

console.log("Sending to backend:", {
  paypalPaymentId: details.id,
  userId,
  subscriptionMonths: current.value,
});
      // 4. Send the correct capture ID (details.id) to your backend
      const res = await fetch("/api/verify-paypal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalPaymentId: details.id, // This is the Order/Capture ID
          userId,
          subscriptionMonths: current.value,
        }),
      });

      if (res.ok) {
         toast({
      title: "✅ You are now a Premium Member!.",
      description: "message",
    });

    router.refresh()
        // Optional: Replace reload with router.refresh() if using Next.js App Router
        // window.location.reload(); 
      } else {
      

    toast({
      title: "❌ Backend verification failed. Please contact support.",
      description: "message",
      variant: "destructive",
    });
      }
    } catch (error) {
      console.error("PayPal Capture Error:", error);
      

    toast({
      title: "❌ An error occurred during payment processing.",
      description: "message",
      variant: "destructive",
    });
    }
  }}
/>
                </PayPalScriptProvider>
)}
              </div>
          
          </>
        )}
      </CardContent>
    </Card>
  );
}
