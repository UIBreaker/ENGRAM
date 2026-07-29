"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // On mount: read saved preference or system preference
  useEffect(() => {
    const saved = localStorage.getItem("engram_theme") as Theme | null;
    if (saved === "dark" || saved === "light") {
      applyTheme(saved);
      setTheme(saved);
    } else {
      // Use system preference as default
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial: Theme = prefersDark ? "dark" : "light";
      applyTheme(initial);
      setTheme(initial);
    }
  }, []);

  function applyTheme(t: Theme) {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("engram_theme", t);
  }

  function toggle() {
    setTheme(prev => {
      const next: Theme = prev === "light" ? "dark" : "light";
      applyTheme(next);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
