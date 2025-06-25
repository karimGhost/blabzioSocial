"use client"
// useFCMPush.ts
import { useEffect } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Adjust this import to your firebase config
import { useToast } from "./use-toast";
// Define a type for your user object if you have one
interface User {
  uid: string;
  // ... other user properties
}

export const useFCMPush = (user: User | null | undefined) => {
  const {toast} = useToast()
  useEffect(() => {
    // Only proceed if running in the browser and Notification API is available
    if (typeof window === "undefined" || !("Notification" in window) || !user?.uid) {
      return;
    }

     const setupFCM = async () => {
      try {
        // 1. Register Service Worker
        // Ensure the service worker file is in your public directory
        
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        console.log("🔥 Service Worker registered:", registration);

        const messaging = getMessaging();

        // 2. Request Notification Permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast({
            title: "Notifications Blocked firstttt",
            description: "Please enable notifications in your browser settings.",
          });
          return;
        }

        // 3. Get FCM Token
        const token = await getToken(messaging, {
          vapidKey: "BLPVzR6MHDq1KIwsagDIquiFiQbfHFGDXS2DTKQXXGBX84TeMRwu-UUA0oFHzqukevsYcoqkDl5YNDAgHZEyk6U",
          serviceWorkerRegistration: registration, // Pass the obtained registration
        });

        if (token) {
          // 4. Save Token to Firestore
          await setDoc(doc(db, "users", user.uid), { fcmToken: token }, { merge: true });
          console.log("✅ FCM token saved:", token);
          toast({
            title: "Notifications Enabled",
            description: "You'll now get updates.",
          });
        } else {
          toast({
            title: "No Token",
            description: "Failed to get FCM token. getToken returned null.",
          });
          console.warn("No FCM token available. Request permission to generate one.");
        }

        // 5. Set up Foreground Message Listener (optional, but good for real-time)
        onMessage(messaging, (payload) => {
          console.log("Foreground FCM message received:", payload);
          // You can display a toast or a custom notification here
          toast({
            title: payload.notification?.title || "New Notification",
            description: payload.notification?.body || "You have a new message.",
          });
        });

      } catch (err) {
        console.error("🔥 FCM setup error:", err);
        // More specific error messages for better debugging
        if (err instanceof DOMException && err.name === 'AbortError') {
          toast({
            title: "Notification Setup Failed",
            description: "Push service registration failed. This might be due to an invalid VAPID key or browser issues.",
          });
        } else {
          toast({
            title: "Notification Error",
            description: "Something went wrong while setting up notifications.",
          });
        }
      }
    };

    setupFCM();

    // Cleanup function (optional, but good practice if you were detaching listeners)
    // For FCM token, it's generally persistent until explicitly deleted or revoked.
    return () => {
      // Any cleanup if needed, e.g., if you were to manually unregister SW
    };
  }, [user]); // Re-run effect if user changes
};