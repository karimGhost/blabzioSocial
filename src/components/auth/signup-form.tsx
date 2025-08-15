"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, deleteUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlabzioLogo } from "@/components/icons";
import { db } from "@/lib/firebase"; // Ensure db is exported from lib/firebase
import { useToast } from "@/hooks/use-toast";
import { Terms } from "../Terms/page";
export function SignupForm() {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [UserName, setUserName] = useState("")
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [repeatPassword, setRepeatPassword] = useState("");
const [agreedToTerms, setAgreedToTerms] = useState(false);
const [terms,setTerms] = useState(false);

      const {toast} = useToast();
const getFriendlyError = (code: string) => {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please log in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password is too weak. It must be at least 6 characters.";
    case "auth/operation-not-allowed":
      return "This type of signup is currently disabled.";
    default:
      return "Something went wrong. Please try again.";
  }
};






















const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setError("");

    if (!agreedToTerms) {
    setError("You must agree to the Terms and Conditions.");
    return;
  }

  if (password !== repeatPassword) {
    return setError("Passwords do not match.");
  }


  
  try {

 const usersRef = collection(db, "users");
const qp = query(usersRef, where("username", "==", UserName));
const querySnapshot = await getDocs(qp);

if (!querySnapshot.empty) {
  toast({
    title: "Username taken",
    description: "Please choose a different username.",
    variant: "destructive",
  });
  return;
}

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: fullname,
    });

    const keywords = fullname.toLowerCase().split(" ")
    // Firestore user creation
    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        keywords:keywords,
        fullName: fullname,
        username: UserName,
        email: email,
        createdAt: Date.now(),
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        avatarUrl: "",
        theme:"",
        bio:"",
        DOB:"",
        fcmToken:"",
        terminated: false,
terminationReason: "",
terminatedAt: "",
     deactivated:false,
    isPremium: false,
  premiumSince: "",
  paymentMethod: "",
  paymentId: "",
  premiumBadge: "",
  premiumExpires:"",
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
        toast({
          title: "Account Created ",
          description: "Welcome to Blabzio.",
         variant: "success",
        });
           //  session cookie logic:
    const idToken = await user.getIdToken();
    await fetch("/api/session", {
      method: "POST",
      body: JSON.stringify({ idToken }),
      headers: { "Content-Type": "application/json" },
    });
      router.push("/");

    } catch (firestoreError) {
      await deleteUser(user); // Roll back auth if Firestore fails

      toast({
        title: "Account creation failed",
        description: "Could not save your data. Please try again.",
        variant: "destructive",
      });


    }

  } catch (err: any) {
      const errorCode = err.code || "";

    const friendlyMessage = getFriendlyError(errorCode);

  toast({
    title: "Signup Error",
    description: friendlyMessage,
    variant: "destructive",
  });
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
  
const handleGoogleSignup = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // ✅ Check if user already exists AND is terminated
    if (userSnap.exists()) {
      const existingData = userSnap.data();
      if (existingData.terminated) {
          handleLogout();
        toast({
          title: "Account Blocked",
          description: "Your account has been terminated and cannot be used.",
          variant: "destructive",
        });
        return;
      }

      // If user exists but not terminated, do nothing (or optionally auto-login)
      router.push("/"); // or router.push("/feed") if you want auto login
      return;
    }

    // ✅ User doesn't exist — create new user
    try {
      const keywords = user?.displayName?.toLowerCase().split(" ") || [];
      let useis = user.email?.split("@")[0] || "";

      const usersRef = collection(db, "users");
      const qp = query(usersRef, where("username", "==", useis));
      const querySnapshot = await getDocs(qp);

      if (!querySnapshot.empty) {
        useis = useis + Date.now().toString().slice(-4);
      }

      await setDoc(userRef, {
        uid: user.uid,
        fullName: user.displayName || "",
        email: user.email || "",
        username: useis,
        keywords: keywords,
        createdAt: Date.now(),
        postsCount: 0,
        DOB: "",
        followersCount: 0,
        followingCount: 0,
        avatarUrl: user.photoURL || "",
        theme: "",
        deactivated: false,
        premiumExpires: "",
        terminated: false,
        terminationReason: "",
        terminatedAt: "",
        isPremium: false,
        premiumSince: "",
        paymentMethod: "",
        paymentId: "",
        premiumBadge: "",
        subscriptionMonths: "",
        expiresAt: "",
        bio: "",
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

      // ✅ Set session cookie
      const idToken = await user.getIdToken();
      await fetch("/api/session", {
        method: "POST",
        body: JSON.stringify({ idToken }),
        headers: { "Content-Type": "application/json" },
      });

      toast({
        title: "Account Created",
        description: "Welcome to Blabzio!",
      });

      router.push("/");

    } catch (firestoreError) {
      toast({
        title: "Firestore Error",
        description: "Google account linked, but failed to save your data.",
        variant: "destructive",
      });
      return;
    }
  } catch (err: any) {
    toast({
      title: "Google Signup Failed",
      description: err.message,
      variant: "destructive",
    });
  }
};


if(terms){
  return <Terms setTerms={setTerms} />
}
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <BlabzioLogo className="h-16 w-16" />
          </div>
          <CardTitle className="text-3xl font-headline">Create an Account</CardTitle>
  <CardDescription className="text-base">
  Join{" "}
  <span className="relative text-3xl font-dragon text-orange-400 right-[-2px] top-[2px]">
    B
  </span>
  <span className="ml-0.5 font-semibold">labzio today!</span>
</CardDescription>
  <i className="text-sm text-orange-400">   share thoughts ,create, Chat & connect, with people around the globe </i>

        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullname">Full Name</Label>

              <Input
                id="fullname"
                type="text"
                placeholder="YourName"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
            </div>

     <div className="space-y-2">
              <Label htmlFor="fullname">UserName</Label>

              <Input
                id="UserName"
                type="text"
                placeholder="UserName"
                value={UserName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

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

  <div className="space-y-2">
    <Label htmlFor="repeat_password">Repeat Password</Label>
    <Input
      id="repeat_password"
      type={showPassword ? "text" : "password"}
      value={repeatPassword}
      onChange={(e) => setRepeatPassword(e.target.value)}
    />
  </div>


<div className="flex items-center space-x-2">
<input
  id="terms"
  type="checkbox"
  checked={agreedToTerms}
  onChange={(e) => setAgreedToTerms(e.target.checked)}
  className="w-4 h-4 accent-orange-300"
  required
/>

  <label htmlFor="terms" className="text-sm text-gray-700 flex">
    I agree to the <p onClick={()=> setTerms(pre => !pre)} 
        className="text-primary hover:underline ml-1"
>
  Terms&Conditions

</p>
  </label>
</div>
         
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <Button variant="outline" className="w-full" onClick={handleGoogleSignup}>
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
  </svg> Sign up with Google
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
