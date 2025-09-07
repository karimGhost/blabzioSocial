"use client"
// hooks/useAuth.ts
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth,rtdb } from "@/lib/firebase";
import { onSnapshot , doc} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getDatabase, ref, onDisconnect, set, serverTimestamp } from "firebase/database";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
    const [loadings, setLoadings] = useState(true);

  const [userData, setUserData] = useState<any>(null);
const [theme, setTheme] = useState<any>(null)



useEffect(() => {
  if (!user) return;

  const docRef = doc(db, "users", user.uid);

  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      setUserData({ uid: user.uid, ...docSnap.data() });
      console.log("User data:", docSnap.data());
    } else {
      
      setUserData(null);
    }

    setLoading(false);
        setLoadings(false);

  });

  return () => unsubscribe();

}, [user]); 

useEffect(() => {
  if (!user?.uid) return;

  const userStatusRef = ref(rtdb, `/onlineStatus/${user.uid}`);

  set(userStatusRef, {
    state: "online",
    last_changed: serverTimestamp(),
  });

  onDisconnect(userStatusRef).set({
    state: "offline",
    last_changed: serverTimestamp(),
  });
}, [user?.uid]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
          setLoadings(false);

    });

    return () => unsubscribe();
  }, []);

  const userD =  userData;
  return { user, loading,loadings, userData ,userD, setUserData};
}
