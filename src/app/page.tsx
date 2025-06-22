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

  if (loading) return BlabzioLoader(); // Don't show anything while loading

  if (user) return null; // Still avoid flashing form after loading

  return <LoginForm />;
}


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