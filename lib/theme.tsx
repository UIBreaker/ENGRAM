"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  isDark: boolean;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
  isDark: false,
  mounted: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from the data-theme attribute already set by inline script
    const current = document.documentElement.getAttribute("data-theme") as Theme;
    if (current === "dark" || current === "light") {
      setTheme(current);
    }
    setMounted(true);
  }, []);

  function toggle() {
    setTheme(prev => {
      const next: Theme = prev === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("engram_theme", next); } catch {}
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === "dark", mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
