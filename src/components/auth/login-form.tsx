"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, fetchSignInMethodsForEmail, signOut } from "firebase/auth";
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


 const handleLogout = async () => {
    try {
      await signOut(auth);
            localStorage.clear();
      router.push("/"); // or home, wherever you want
    } catch (error) {
      console.error("Logout failed:", error);
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

    // 3. Check if user is terminated BEFORE setting session cookie
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();

      if (userData.terminated) {
          handleLogout();
        throw new Error("Your account has been terminated.");
      }

      if (userData.deactivation === true) {
        await updateDoc(userDocRef, { deactivation: false });

        toast({
          title: "Account Activated",
          description: "Welcome back!",
        });
      }
    }
        router.push("/feed");


    // 4. Set session cookie
    await fetch("/api/session", {
      method: "POST",
      body: JSON.stringify({ idToken }),
      headers: { "Content-Type": "application/json" },
    });

    // 5. Redirect to feed
  } catch (err: any) {
    setLoading(false);
    const message =
      err?.message === "Your account has been terminated."
        ? err.message
        : getFriendlyError(err.code || "");

    setError(message);
    toast({
      title: "Login Failed",
      description: message,
      variant: "destructive",
    });
handleLogout()
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

    // Check if username is taken
    const usersRef = collection(db, "users");
    const qp = query(usersRef, where("username", "==", useis));
    const querySnapshot = await getDocs(qp);

    if (!querySnapshot.empty) {
      useis = useis + Date.now().toString().slice(-4);
    }

    // Step 2: Check if user exists
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      const keywords = user?.displayName?.toLowerCase().split(" ") || [];

      await setDoc(userDocRef, {
        uid: user.uid,
        fullName: user.displayName || "",
        username: useis,
        email: user.email || "",
        keywords: keywords,
        avatarUrl: user.photoURL || "",
        createdAt: serverTimestamp(),
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        theme: "",
        terminated: false,
        terminationReason: "",
        terminatedAt: "",
        deactivated: false,
        premiumExpires: "",
        isPremium: false,
        premiumSince: "",
        paymentMethod: "",
        paymentId: "",
        premiumBadge: "",
        subscriptionMonths: "",
        expiresAt: "",
        bio: "",
        DOB: "",
        oneTimeNotification: false,
        fcmToken: "",
        notificationSettings: {
          directMessage: true,
          newFollower: true,
          postComment: true,
          replies: true,
          postLike: true,
        },
        privacySettings: {
          activityStatus: true,
          privateAccount: false,
        },
      });
    }

    // Check if terminated BEFORE setting session
    const freshSnap = await getDoc(userDocRef);
    const userData = freshSnap.data();

    if (userData?.terminated) {
        handleLogout();
      throw new Error("Your account has been terminated.");
     
    }

    // Session cookie logic
    const idToken = await user.getIdToken();
    await fetch("/api/session", {
      method: "POST",
      body: JSON.stringify({ idToken }),
      headers: { "Content-Type": "application/json" },
    });

    if (userData?.deactivation === true) {
      await updateDoc(userDocRef, { deactivation: false });
      toast({
        title: "Account Activated",
        description: "Welcome back!",
      });
    }

    router.push("/feed");
  } catch (err: any) {
    const errorMessage =
      err?.message === "Your account has been terminated."
        ? err.message
        : getFriendlyError(err.code || "");


    setError(errorMessage);
    toast({
      title: "Login Failed",
      description: errorMessage,
      variant: "destructive",
    });
    handleLogout()
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
  <span className="relative text-4xl font-dragon text-orange-500 right-[-1px] top-[2px]">
    B
  </span>
  <span className="ml-0.5 font-semibold">labzio</span>

</CardTitle>
  <i className="text-sm text-orange-400">  share thoughts , Chat & connect, with people around the globe </i>


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
          {error && (
  <p className="mt-2 text-sm text-red-500">{error}</p>
)}
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
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 533.5 544.3"
    className="w-5 h-5 mr-2"
  >
    <path
      d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.4h146.9c-6.4 34.4-25.1 63.5-53.5 83.1v68.5h86.6c50.7-46.7 81.5-115.6 81.5-196.6z"
      fill="#4285f4"
    />
    <path
      d="M272 544.3c72.6 0 133.5-24 178-65.2l-86.6-68.5c-24 16.1-54.8 25.6-91.4 25.6-70 0-129.3-47.2-150.5-110.5H32.4v69.4C76.9 482.8 168.4 544.3 272 544.3z"
      fill="#34a853"
    />
    <path
      d="M121.5 325.7c-10.4-30.8-10.4-64.1 0-94.9v-69.4H32.4c-36.8 73.6-36.8 160.2 0 233.8l89.1-69.5z"
      fill="#fbbc04"
    />
    <path
      d="M272 107.7c39.4 0 74.9 13.6 102.9 40.5l77.1-77.1C405.4 24.7 344.6 0 272 0 168.4 0 76.9 61.5 32.4 162.3l89.1 69.5C142.7 154.9 202 107.7 272 107.7z"
      fill="#ea4335"
    />
  </svg>
  Continue with Google
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
