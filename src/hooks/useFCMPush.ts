"use client";

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "@/lib/firebase"; // adjust your path
import { useToast } from "./use-toast";

export const useFCMPush = (user: any) => {
    const {toast} = useToast();

  useEffect(() => {
    if (!user?.uid) return;

    const requestFCMPermission = async () => {
      try {
        const messaging = getMessaging();
        const token = await getToken(messaging, {
          vapidKey: "BKDgkeS515Cq4qIYTqSr7IR9j1WW1_cTRyWCsleZBUYsufXReyldz0zbpsxkuz5DQ6XMfbCkxtsZFAbyDj8MdVU",
        });

        if (token) {
          const userRef = doc(db, "users", user.uid);
          await setDoc(userRef, { fcmToken: token }, { merge: true });
          console.log("FCM token saved");
        }
      } catch (err) {
        console.error("FCM permission error", err);
        toast({
          title: "Notifications blocked",
          description: "Enable notifications in browser settings.",
      });
      }
    };

    requestFCMPermission();
  }, [user]);
};