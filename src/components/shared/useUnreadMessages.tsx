"use client";

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { dbc } from "@/lib/firebase"; // Your Firestore instance
import { useAuth } from "@/hooks/useAuth";

export function useUnreadMessages(userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);
const {user} = useAuth()
 useEffect(() => {
    if (!userId) return;

    const convQuery = query(
      collection(dbc, "conversations"),
      where("participants", "array-contains", userId)
    );

    let unsubList: (() => void)[] = [];

    const fetchUnreadCounts = async () => {
      const convSnapshot = await getDocs(convQuery);

      // Clean up old listeners
      unsubList.forEach((unsub) => unsub());
      unsubList = [];

      const countsMap: Record<string, number> = {};

      convSnapshot.docs.forEach((convDoc) => {
        const convId = convDoc.id;

        const msgsQuery = query(
          collection(dbc, "conversations", convId, "messages"),
          where("isRead", "==", false),
          where("receiverId", "==", userId)
        );

        const unsub = onSnapshot(msgsQuery, (msgSnap) => {
          countsMap[convId] = msgSnap.size;

          // Recalculate total unread messages
          const total = Object.values(countsMap).reduce((a, b) => a + b, 0);
          setUnreadCount(total);
        });

        unsubList.push(unsub);
      });
    };

    fetchUnreadCounts();

    return () => {
      unsubList.forEach((unsub) => unsub());
    };
  }, [userId]);

  return unreadCount;
}