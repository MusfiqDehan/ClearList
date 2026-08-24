import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const socialImage = {
  url: "/clearlist-social-cover.png",
  width: 1200,
  height: 630,
  alt: "Clearlist — Make room for what matters.",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Clearlist | A calmer way to get things done",
    template: "%s | Clearlist",
  },
  description:
    "Capture what matters, focus on the next step, and finish your day with less noise. Clearlist is a simple, private task list that makes getting organized feel effortless.",
  applicationName: "Clearlist",
  authors: [{ name: "Clearlist" }],
  creator: "Clearlist",
  publisher: "Clearlist",
  keywords: ["task manager", "to-do list", "productivity app", "daily planning", "focus"],
  category: "productivity",
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Clearlist | A calmer way to get things done",
    description:
      "A thoughtful place to capture what matters, focus on the next step, and make room for what matters.",
    url: "/",
    siteName: "Clearlist",
    locale: "en_US",
    type: "website",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clearlist | A calmer way to get things done",
    description:
      "A thoughtful place to capture what matters, focus on the next step, and make room for what matters.",
    images: [socialImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/clearlist-logo.svg",
    shortcut: "/clearlist-logo.svg",
    apple: "/clearlist-logo.svg",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
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
