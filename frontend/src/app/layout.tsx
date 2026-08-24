import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clearlist | Make room for what matters",
  description: "A calmer, clearer way to organize your day and get things done.",
  icons: {
    icon: "/clearlist-logo.svg",
    shortcut: "/clearlist-logo.svg",
    apple: "/clearlist-logo.svg",
  },
};

const themeInitScript = `
  (() => {
    try {
      const saved = localStorage.getItem("clearlist-theme");
      const theme = saved === "dark" || saved === "light" || saved === "system" ? saved : "system";
      const resolved = theme === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : theme;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.style.colorScheme = resolved;
    } catch {}
  })();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
