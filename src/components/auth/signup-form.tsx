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
export function SignupForm() {
  const router = useRouter();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

      const {toast} = useToast();

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {


  event.preventDefault();
  setError("");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: fullname,
    });

    // Firestore user creation
    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: fullname,
        email: email,
        createdAt: Date.now(),
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        avatarUrl: ""
      });
        toast({
          title: "Account Created ",
          description: "Now Login using your creditials.",
          // variant: "success",
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
    toast({
     
      title: "Signup error",
      description: err.message,
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
      try {
        await setDoc(userRef, {
          uid: user.uid,
          fullName: user.displayName || "",
          email: user.email || "",
          createdAt: Date.now(),
          postsCount: 0,
          followersCount: 0,
          followingCount: 0,
          avatarUrl: user.photoURL || ""
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
                placeholder="John Doe"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
