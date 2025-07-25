// utils/saveOccupation.ts
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export async function addInterest(userId: string, interest: string) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    interests: arrayUnion(interest.toLowerCase()),
  });
}
