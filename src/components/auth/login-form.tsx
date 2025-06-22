"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlabzioLogo } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
const {user} = useAuth()
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
   setError("");
    
    setLoading(true);
 
    try {
      await signInWithEmailAndPassword(auth, email, password);
    setLoading(true);

   if( user?.uid ){

          router.push("/feed");

   }else{
    return BlabzioLoader()
   }

    } catch (err: any) {
      setError(err.message);
          setLoading(false);

    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
        setLoading(true);

    try {
      await signInWithPopup(auth, provider);
          setLoading(true);

      router.push("/feed");

    } catch (err: any) {
          setLoading(false);

      setError(err.message);
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
