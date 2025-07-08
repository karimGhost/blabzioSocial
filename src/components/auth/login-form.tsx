"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, fetchSignInMethodsForEmail } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlabzioLogo } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { decodeAction } from "next/dist/server/app-render/entry-base";
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
const {toast} = useToast()
const {user} = useAuth();

const getFriendlyError = (code: string) => {
 
   switch (code) {
     case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/too-many-requests":
      return "Too many login attempts. Please try again later.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/popup-closed-by-user":
      return "You closed the Google sign-in popup before finishing.";
    case "auth/cancelled-popup-request":
      return "Another sign-in popup is already open.";
    case "auth/popup-blocked":
      return "Popup was blocked by the browser. Please enable popups.";
    case "auth/account-exists-with-different-credential":
      return "This email is already registered with a different method.";
    default:
      return "Something went wrong. Please try again.";
  
  }
};
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setError("");
  setLoading(true);

  try {
    // 1. Sign in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Get Firebase ID token
    const idToken = await user.getIdToken();

    // 3. Set session cookie on backend
    await fetch("/api/session", {
      method: "POST",
      body: JSON.stringify({ idToken }),
      headers: { "Content-Type": "application/json" },
    });

    // 4. Check if user account is deactivated, and activate it
    if (user?.uid) {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.deactivation === true) {
          await updateDoc(userDocRef, { deactivation: false });

          toast({
            title: "Account Activated",
            description: "Welcome back!",
          });
        }
      }

      // 5. Redirect to feed
      router.push("/feed");
    } else {
      setLoading(false);
      BlabzioLoader(); // Only call this if needed – make sure it's a visual component or effect
    }
  } catch (err: any) {
    const errorCode = err.code || "";
    const friendlyMessage = getFriendlyError(errorCode);
    setError(friendlyMessage);
    setLoading(false);
  }
};




const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();
  setLoading(true);

  try {
    // Step 1: Sign in with Google
    const result = await signInWithPopup(auth, provider);
    const user = result.user;


    let useis = user.email?.split("@")[0] || "";
    
    // Check if that username is already taken
    const usersRef = collection(db, "users");
    const qp = query(usersRef, where("username", "==", useis));
    const querySnapshot = await getDocs(qp);
    
    // If taken, append timestamp or random number
    if (!querySnapshot.empty) {
      useis = useis + Date.now().toString().slice(-4); // e.g., "john1234"
    }
    
    // Step 2: Check if user exists in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      
          const keywords = user?.displayName?.toLowerCase().split(" ")

      await setDoc(userDocRef, {
        uid: user.uid,
        fullName: user.displayName || "",
        username: useis,
        email: user.email || "",
        keywords:keywords,
        avatarUrl: user.photoURL || "",
        createdAt: serverTimestamp(),
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
             theme:"",
             deactivated:false,
 premiumExpires:"",
 isPremium: false,
  premiumSince: "",
  paymentMethod: "",
  paymentId: "",
  premiumBadge: "",
 subscriptionMonths: "",
      expiresAt:"",

  

     

  bio:"",
        DOB:"",
        oneTimeNotification: false,
        fcmToken:"",
        notificationSettings:{
        directMessage: true,
        newFollower:true,
        postComment: true,
        replies:true,
        postLike:true,
},

        privacySettings:{
        activityStatus:true,
        privateAccount:false,

}

      });
    }

      //  session cookie logic:
    const idToken = await user.getIdToken();
    await fetch("/api/session", {
      method: "POST",
      body: JSON.stringify({ idToken }),
      headers: { "Content-Type": "application/json" },
    });



     if (user?.uid) {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.deactivation === true) {
          await updateDoc(userDocRef, { deactivation: false });

          toast({
            title: "Account Activated",
            description: "Welcome back!",
          });
        }
      }
    }
    //  Navigate to feed
    router.push("/feed");

  } catch (err: any) {
    const errorCode = err.code || "";
  const friendlyMessage = getFriendlyError(errorCode);
  setError(friendlyMessage);

  } finally {
    setLoading(false);
  }
};






// useEffect(() => {
//     if (!loading && user) {
//       router.push("/feed");
//     }
//   }, [user, loading, router]);

//   if (loading) return BlabzioLoader(); // Don't show anything while loading

//   if (user) return null; // Still avoid flashing form after loading

//   return <LoginForm />;
// }


function BlabzioLoader() {
  return (
   <div className="flex flex-col items-center justify-center min-h-screen bg-orange-100 animate-fade-in">
      <div className="animate-pulse text-5xl font-extrabold text-orange-400 drop-shadow-lg">
        <span className="relative text-6xl font-dragon text-orange-400 right-[-1px] top-[2px]">
    B
  </span>
  <span className="ml-0.5 font-semibold">labzio</span>
      </div>
      <div className="mt-4 w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <BlabzioLogo className="h-16 w-16" />
          </div>
          <CardTitle className="text-3xl font-headline">Welcome to {" "}
  <span className="relative text-4xl font-dragon text-orange-400 right-[-1px] top-[2px]">
    B
  </span>
  <span className="ml-0.5 font-semibold">labzio</span>
</CardTitle>

          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

 <div className="space-y-2">
    <Label htmlFor="password"> Password</Label>
    <div className="relative">
    
      <Input
        id="password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-2 top-2 text-gray-500"
      >
        {showPassword ? "🙈" : "👁️"}
      </button>
    </div>
  </div>


           
            {error && <p className="text-red-500 text-sm">{error}</p>}
          
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin h-4 w-4 text-white" />
            Logging in...
          </span>
        ) : (
          "Login"
        )}
      </Button>
          </form>

        </CardContent>


        <CardFooter className="flex flex-col items-center space-y-2">
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
            Login with Google
          </Button>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>

            <p style={{float:"right" , marginRight:"auto"}} className="text-sm text-muted-foreground float-right">
            <Link href="/PasswordRecovery" className="font-medium text-primary hover:underline">
            forgot  password ?{" "}
            </Link>
          </p>


        </CardFooter>
      </Card>
    </div>
  );
}
