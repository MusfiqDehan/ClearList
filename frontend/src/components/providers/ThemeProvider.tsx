"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const storageKey = "clearlist-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey);
    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
      void Promise.resolve().then(() => setTheme(storedTheme));
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const resolved = theme === "system" ? (mediaQuery.matches ? "dark" : "light") : theme;

    window.localStorage.setItem(storageKey, theme);
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;

    const handleSystemThemeChange = () => {
      if (theme === "system") {
        const nextResolved = mediaQuery.matches ? "dark" : "light";
        root.dataset.theme = nextResolved;
        root.style.colorScheme = nextResolved;
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
