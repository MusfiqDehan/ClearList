import { AuthForm } from "@/components/auth/AuthForm";
import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RegisterPage() {
  return (
    <AuthProvider>
      <AuthForm mode="register" />
    </AuthProvider>
  );
}
