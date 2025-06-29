"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, deleteUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

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


  if (password !== repeatPassword) {
    return setError("Passwords do not match.");
  }
  event.preventDefault();
  setError("");

    if (!agreedToTerms) {
    setError("You must agree to the Terms and Conditions.");
    return;
  }
  try {
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
          description: "Now Login using your creditials.",
          // variant: "success",
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

const handleGoogleSignup = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
          const keywords = user?.displayName?.toLowerCase().split(" ")

      try {
        await setDoc(userRef, {
          uid: user.uid,
          fullName: user.displayName || "",
          email: user.email || "",
          keywords:keywords,
          createdAt: Date.now(),
          postsCount: 0,
          DOB:"",
          followersCount: 0,
          followingCount: 0,
          avatarUrl: user.photoURL || "",
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

   //  session cookie logic:
    const idToken = await user.getIdToken();
    await fetch("/api/session", {
      method: "POST",
      body: JSON.stringify({ idToken }),
      headers: { "Content-Type": "application/json" },
    });
         toast({
          title: "Account Created ",
          description: "Proceed to Login using your creditials.",
          // variant: "success",
        });




        

              router.push("/");

      } catch (firestoreError) {
        toast({
          title: "Error",
          description: "Google account linked, but failed to save your data.",
          // variant: "destructive",
        });
        return;
      }
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
            Sign up with Google
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
