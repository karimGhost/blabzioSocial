"use client"
import { useEffect, useState } from "react";

export function useDarkMode() {

    type ThemeMode = "light" | "dark";
    
    
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("darkMode") === "dark" ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    localStorage.setItem("darkMode", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return { theme, setTheme };
}
