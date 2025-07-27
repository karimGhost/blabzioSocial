// context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import OccupationPopup from "@/components/OccupationPopup";
type AuthContextType = {
  user: User | null;
  userData: any; // Firestore user data
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
});

 
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

 

 
 type ThemeMode = "light" | "dark";
    

useEffect(() => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const storedTheme = localStorage.getItem("darkMode");

  // If no stored theme, match system preference
  const initialTheme = storedTheme || (prefersDark ? "dark" : "light");

  document.documentElement.classList.toggle("dark", initialTheme === "dark" );
  localStorage.setItem("darkMode", initialTheme);
}, []);


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        const unsubUserDoc = onSnapshot(doc(db, "users", firebaseUser.uid), (docSnap) => {
          setUserData(docSnap.data());
        });

     
        return () => unsubUserDoc();
      } else {
        setUserData(null);


      }
    });

    return () => unsubscribeAuth();
  }, []);




  useEffect(() => {
    if (!loading && !user) {
      router.push("/"); // Redirect to login
    }
  }, [user, loading, router]);



  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
