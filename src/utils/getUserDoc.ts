"use client";

const userCache = new Map<string, any>();
import { db } from "@/lib/firebase";
import { set } from "firebase/database";
import { doc, getDoc, getDocs } from "firebase/firestore";

export async function getUserDoc(uid: string) {
  // ✅ Check in-memory cache
  if (userCache.has(uid)) {
    return userCache.get(uid);
  }

  // ✅ Check localStorage cache
  const cached = localStorage.getItem(`user-${uid}`);
  if (cached) {
    const parsed = JSON.parse(cached);
    userCache.set(uid, parsed);
    return parsed;
  }

  // ✅ Fetch from Firestore if not cached
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;

  const data = userSnap.data();
  userCache.set(uid, data);
  localStorage.setItem(`user-${uid}`, JSON.stringify(data)); // Save to localStorage

  return data;
}
