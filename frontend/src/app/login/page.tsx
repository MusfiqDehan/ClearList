import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Log in",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <AuthProvider>
      <AuthForm mode="login" />
    </AuthProvider>
  );
}
