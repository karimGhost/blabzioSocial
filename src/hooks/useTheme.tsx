"use client"
import { useEffect, useState } from "react";

export function useDarkMode() {

    type ThemeMode = "light" | "dark";
    
    
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
    }
    return "light";
  });

  useEffect(() => {
  }, [theme]);

  return { theme, setTheme };
}
