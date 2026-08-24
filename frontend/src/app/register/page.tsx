import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Create your account",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <AuthProvider>
      <AuthForm mode="register" />
    </AuthProvider>
  );
}
