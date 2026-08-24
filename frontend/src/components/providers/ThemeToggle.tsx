"use client";

import { useTheme, type Theme } from "@/components/providers/ThemeProvider";

const themes: Array<{ value: Theme; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle" role="group" aria-label="Color theme">
      {themes.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          data-theme-option={value}
          className={theme === value ? "theme-toggle-active" : ""}
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
