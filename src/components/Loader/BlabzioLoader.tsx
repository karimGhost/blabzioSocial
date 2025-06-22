"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/feed");
    }
  }, [user, loading, router]);

  if (loading) return <BlabzioLoader />;

  if (user) return null;

  return <LoginForm />;
}

// Animated Blabzio Loader
function BlabzioLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-orange-100 animate-fade-in">
      <div className="animate-pulse text-5xl font-extrabold text-orange-600 drop-shadow-lg ">
       <b  style={{marginRight:"-7px"}} className="text-4xl font-dragon text-orange-500 mr--4">
  B
</b> <span>labzio</span>
      </div>
      <div className="mt-4 w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
